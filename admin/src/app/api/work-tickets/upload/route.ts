import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { getJobDocumentsPath, getWorkTicketsPath, getDocumentsMetadataPath, ensureDirectoryExists } from '@shared/utils/paths'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const ticketId = formData.get('ticketId') as string

    if (!file || !ticketId) {
      return NextResponse.json(
        { error: 'File and ticket ID are required' },
        { status: 400 }
      )
    }

    // Read the work tickets file
    const workTicketsPath = getWorkTicketsPath()
    let workTickets = []
    try {
      const workTicketsData = await fs.readFile(workTicketsPath, 'utf-8')
      workTickets = JSON.parse(workTicketsData)
    } catch (readError) {
      if ((readError as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw readError
      }
      console.log('Work tickets file not found, starting fresh.')
    }

    // Find the ticket to update
    const ticketIndex = workTickets.findIndex((ticket: any) => ticket.id === ticketId)
    if (ticketIndex === -1) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      )
    }

    const ticket = workTickets[ticketIndex]
    const ticketType = ticket.ticketType

    // Ensure the ticket has a jobId
    if (!ticket.jobId) {
      console.error(`Ticket ${ticketId} is missing jobId.`)
      return NextResponse.json(
        { error: 'Ticket is missing associated Job ID.' },
        { status: 400 }
      )
    }

    // Ensure the job documents directory exists
    const jobDocumentsDir = getJobDocumentsPath(ticket.jobId)
    await ensureDirectoryExists(jobDocumentsDir)

    // Define the fileName based on the ticket type
    const fileExtension = path.extname(file.name)
    const storedFileName = `${ticketType}${fileExtension}`
    const filePath = path.join(jobDocumentsDir, storedFileName)

    // Save the file
    const fileBuffer = Buffer.from(await file.arrayBuffer())
    await fs.writeFile(filePath, fileBuffer)

    // Map ticketType to the expected documentId used by the client portal
    let clientDocumentId = ticketType

    // Update document metadata
    const metadataPath = getDocumentsMetadataPath()
    let documents = []
    try {
      const metadataData = await fs.readFile(metadataPath, 'utf-8')
      documents = JSON.parse(metadataData)
    } catch (readError) {
      if ((readError as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw readError
      }
      console.log('Documents metadata file not found, starting fresh.')
    }

    // Add new document metadata
    documents.push({
      id: clientDocumentId,
      metadata: {
        ticketId,
        jobId: ticket.jobId,
        uploadedAt: new Date().toISOString(),
        fileName: storedFileName,
        originalName: file.name,
        size: file.size,
        type: file.type
      }
    })

    // Save metadata
    await fs.writeFile(metadataPath, JSON.stringify(documents, null, 2))

    // Update the ticket with completed document info
    workTickets[ticketIndex] = {
      ...ticket,
      status: 'completed',
      completedDocument: {
        documentId: clientDocumentId,
        originalName: file.name,
        fileName: storedFileName,
        uploadedAt: new Date().toISOString(),
        size: file.size,
        type: file.type,
      }
    }

    // Save updated tickets
    await fs.writeFile(workTicketsPath, JSON.stringify(workTickets, null, 2))

    return NextResponse.json(workTickets[ticketIndex])
  } catch (error) {
    console.error('Error handling file upload:', error)
    return NextResponse.json(
      { error: 'Failed to process file upload' },
      { status: 500 }
    )
  }
}
