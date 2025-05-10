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

    const ticket = workTickets[ticketIndex]

    // Create appropriate documents directory based on ticket type
    const baseDocumentsDir = path.join(process.cwd(), 'data', 'documents')
    let documentsDir;

    // All assessment types use their ticketType as the directory name
    documentsDir = path.join(baseDocumentsDir, ticket.ticketType);
    await fs.mkdir(documentsDir, { recursive: true })

    // Generate consistent fileName for all assessment types
    const fileName = `${ticketId}-${file.name}`;

    // Save the file
    const fileBuffer = Buffer.from(await file.arrayBuffer())
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

    // Create job documents directory if it doesn't exist
    const jobDocDir = path.join(process.cwd(), 'data', 'jobs', ticket.jobId, 'documents')
    await fs.mkdir(jobDocDir, { recursive: true })

    // Generate a unique fileName for the document based on ticket type
    const timestamp = Date.now()
    const newFileName = `${ticket.ticketType.replace(/-/g, '_')}_${timestamp}_${ticket.completedDocument.fileName}`
    const jobDocPath = path.join(jobDocDir, newFileName)

    // Copy the document to the job's document store
    try {
      await fs.copyFile(filePath, jobDocPath)
    } catch (error) {
      console.error('Error copying document:', error)
      return NextResponse.json(
        { error: 'Failed to copy document to job store' },
        { status: 500 }
      )
    }

    // Initialize documents object if it doesn't exist
    if (!ticket.job.documents) {
      ticket.job.documents = {}
    }

    // Add the document to the job's documents based on ticket type
    ticket.job.documents[ticket.ticketType] = {
      fileName: newFileName,
      originalName: file.name,
      type: 'application/pdf',
      uploadedAt: new Date().toISOString(),
      size: (await fs.stat(filePath)).size
    }

    // Update the job's assessment status based on ticket type
    if (ticket.ticketType === 'custom-assessment') {
      if (!ticket.job.customAssessment) {
        ticket.job.customAssessment = {}
      }
      ticket.job.customAssessment.status = 'completed'
      ticket.job.customAssessment.returnedAt = new Date().toISOString()
    } else if (ticket.ticketType === 'statement-of-environmental-effects') {
      if (!ticket.job.statementOfEnvironmentalEffects) {
        ticket.job.statementOfEnvironmentalEffects = {}
      }
      ticket.job.statementOfEnvironmentalEffects.status = 'completed'
      ticket.job.statementOfEnvironmentalEffects.returnedAt = new Date().toISOString()
    } else if (ticket.ticketType === 'complying-development-certificate') {
      if (!ticket.job.complyingDevelopmentCertificate) {
        ticket.job.complyingDevelopmentCertificate = {}
      }
      ticket.job.complyingDevelopmentCertificate.status = 'completed'
      ticket.job.complyingDevelopmentCertificate.returnedAt = new Date().toISOString()
    } else {
      throw new Error('Invalid ticket type')
    }

    return NextResponse.json(workTickets[ticketIndex])
  } catch (error) {
    console.error('Error handling file upload:', error)
    return NextResponse.json(
      { error: 'Failed to process file upload' },
      { status: 500 }
    )
  }
}
