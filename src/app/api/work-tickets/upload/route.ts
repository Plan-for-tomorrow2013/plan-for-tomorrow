import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

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
    const workTicketsPath = path.join(process.cwd(), 'data', 'work-tickets.json')
    const workTicketsData = await fs.readFile(workTicketsPath, 'utf-8')
    const workTickets = JSON.parse(workTicketsData)

    // Find the ticket to update
    const ticketIndex = workTickets.findIndex((ticket: any) => ticket.id === ticketId)
    if (ticketIndex === -1) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      )
    }

    // Create documents directory if it doesn't exist
    const documentsDir = path.join(process.cwd(), 'public', 'documents', 'completed-assessments')
    await fs.mkdir(documentsDir, { recursive: true })

    // Save the file
    const fileBuffer = Buffer.from(await file.arrayBuffer())
    const fileName = `${ticketId}-${file.name}`
    const filePath = path.join(documentsDir, fileName)
    await fs.writeFile(filePath, fileBuffer)

    // Update the ticket with the completed document info
    workTickets[ticketIndex] = {
      ...workTickets[ticketIndex],
      status: 'completed',
      completedDocument: {
        fileName: file.name,
        uploadedAt: new Date().toISOString(),
      }
    }

    // Save the updated tickets
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