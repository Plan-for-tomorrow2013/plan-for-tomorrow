import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

export async function POST(request: Request) {
  try {
    const { ticketId } = await request.json()

    if (!ticketId) {
      return NextResponse.json(
        { error: 'Ticket ID is required' },
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

    // Check if the ticket has a completed document
    if (!ticket.completedDocument) {
      return NextResponse.json(
        { error: 'No completed document found for this ticket' },
        { status: 400 }
      )
    }

    // Define the path to the completed document based on ticket type
    let completedDocPath;
    const baseDocumentsDir = path.join(process.cwd(), 'data', 'documents');

    // All assessment types use their ticketType as the directory name
    completedDocPath = path.join(
      baseDocumentsDir,
      ticket.ticketType,
      `${ticketId}-${ticket.completedDocument.fileName}`
    );

    // Check if the completed document exists
    try {
      await fs.access(completedDocPath)
    } catch (error) {
      console.error('Completed document not found:', error)
      return NextResponse.json(
        { error: 'Completed document file not found' },
        { status: 404 }
      )
    }

    // Read the job file
    const jobPath = path.join(process.cwd(), 'data', 'jobs', `${ticket.jobId}.json`)
    let job
    try {
      const jobData = await fs.readFile(jobPath, 'utf-8')
      job = JSON.parse(jobData)
    } catch (error) {
      console.error('Error reading job file:', error)
      return NextResponse.json(
        { error: 'Associated job not found' },
        { status: 404 }
      )
    }

    // Create job documents directory if it doesn't exist
    const jobDocDir = path.join(process.cwd(), 'data', 'jobs', ticket.jobId, 'documents')
    await fs.mkdir(jobDocDir, { recursive: true })

    // Generate a unique filename for the document
    const timestamp = Date.now()
    const newFileName = `${ticket.ticketType.replace(/-/g, '_')}_${timestamp}_${ticket.completedDocument.fileName}`
    const jobDocPath = path.join(jobDocDir, newFileName)

    // Copy the document to the job's document store
    try {
      await fs.copyFile(completedDocPath, jobDocPath)
    } catch (error) {
      console.error('Error copying document:', error)
      return NextResponse.json(
        { error: 'Failed to copy document to job store' },
        { status: 500 }
      )
    }

    // Initialize documents object if it doesn't exist
    if (!job.documents) {
      job.documents = {}
    }

    // Add the document to the job's documents
    job.documents[ticket.ticketType] = {
      filename: newFileName,
      originalName: ticket.completedDocument.fileName,
      type: 'application/pdf',
      uploadedAt: new Date().toISOString(),
      size: (await fs.stat(completedDocPath)).size
    }

    // Update the job's assessment status based on ticket type
    if (ticket.ticketType === 'custom-assessment') {
      if (!job.customAssessment) {
        job.customAssessment = {};
      }
      job.customAssessment.status = 'completed';
      job.customAssessment.returnedAt = new Date().toISOString();
    } else if (ticket.ticketType === 'statement-of-environmental-effects') {
      if (!job.statementOfEnvironmentalEffects) {
        job.statementOfEnvironmentalEffects = {};
      }
      job.statementOfEnvironmentalEffects.status = 'completed';
      job.statementOfEnvironmentalEffects.returnedAt = new Date().toISOString();
    } else if (ticket.ticketType === 'complying-development-certificate') {
      if (!job.complyingDevelopmentCertificate) {
        job.complyingDevelopmentCertificate = {};
      }
      job.complyingDevelopmentCertificate.status = 'completed';
      job.complyingDevelopmentCertificate.returnedAt = new Date().toISOString();
    } else {
      throw new Error('Invalid ticket type');
    }

    // Save the updated job data
    try {
      await fs.writeFile(jobPath, JSON.stringify(job, null, 2))
    } catch (error) {
      console.error('Error saving job data:', error)
      return NextResponse.json(
        { error: 'Failed to update job data' },
        { status: 500 }
      )
    }

    // Update the ticket with the return timestamp
    workTickets[ticketIndex] = {
      ...ticket,
      status: 'completed',
      completedDocument: {
        ...ticket.completedDocument,
        returnedAt: new Date().toISOString()
      }
    }

    // Save the updated tickets
    try {
      await fs.writeFile(workTicketsPath, JSON.stringify(workTickets, null, 2))
    } catch (error) {
      console.error('Error saving work tickets:', error)
      return NextResponse.json(
        { error: 'Failed to update work ticket' },
        { status: 500 }
      )
    }

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Document returned successfully',
      ticket: workTickets[ticketIndex]
    }, { status: 200 })
  } catch (error) {
    console.error('Error returning document:', error)
    return NextResponse.json(
      { error: 'Failed to process document return' },
      { status: 500 }
    )
  }
}
