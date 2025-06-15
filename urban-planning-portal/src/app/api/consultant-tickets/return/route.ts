import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { getConsultantTicketsPath, getJobPath, getDocumentsPath } from '@shared/utils/paths'

export async function POST(request: Request) {
  try {
    const { ticketId } = await request.json()

    if (!ticketId) {
      return NextResponse.json(
        { error: 'Ticket ID is required' },
        { status: 400 }
      )
    }

    // Read the consultant tickets file
    const consultantTicketsPath = getConsultantTicketsPath()
    const consultantTicketsData = await fs.readFile(consultantTicketsPath, 'utf-8')
    const consultantTickets = JSON.parse(consultantTicketsData)

    // Find the ticket to update
    const ticketIndex = consultantTickets.findIndex((ticket: any) => ticket.id === ticketId)
    if (ticketIndex === -1) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      )
    }

    const ticket = consultantTickets[ticketIndex]

    // Check if the ticket has a completed document
    if (!ticket.completedDocument) {
      return NextResponse.json(
        { error: 'No completed document found for this ticket' },
        { status: 400 }
      )
    }

    // Define the path to the completed document based on category
    let completedDocPath;
    const baseDocumentsDir = getDocumentsPath();
    completedDocPath = path.join(
      baseDocumentsDir,
      ticket.category,
      ticket.completedDocument.fileName
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
    const jobPath = getJobPath(ticket.jobId)
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

    // Generate a unique fileName for the document
    const timestamp = Date.now()
    const newFileName = `${ticket.category.replace(/\s+/g, '_')}_${timestamp}_${ticket.completedDocument.fileName}`
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

    // Add the document to the job's documents using the category as the key
    job.documents[ticket.category] = {
      fileName: newFileName,
      originalName: ticket.completedDocument.fileName,
      type: ticket.completedDocument.type || 'application/pdf',
      uploadedAt: new Date().toISOString(),
      size: (await fs.stat(completedDocPath)).size
    };

    // Prepare file details for assessment
    const fileDetails = {
      fileName: newFileName,
      originalName: ticket.completedDocument.fileName,
      type: 'application/pdf',
      uploadedAt: new Date().toISOString(),
      size: (await fs.stat(completedDocPath)).size
    }

    // Update the consultant's assessment in the job object
    if (ticket.category && job.consultants && job.consultants[ticket.category]) {
      if (!job.consultants[ticket.category].assessment) {
        job.consultants[ticket.category].assessment = {};
      }
      job.consultants[ticket.category].assessment.status = 'completed';
      job.consultants[ticket.category].assessment.returnedAt = new Date().toISOString();
      job.consultants[ticket.category].assessment.completedDocument = fileDetails;
      // Optionally remove old top-level file properties if they exist
      delete job.consultants[ticket.category].assessment.fileName;
      delete job.consultants[ticket.category].assessment.originalName;
    } else {
      console.warn(`Consultant category ${ticket.category} not found in job object for job ${ticket.jobId}. Cannot update assessment details.`)
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
    consultantTickets[ticketIndex] = {
      ...ticket,
      status: 'completed',
      completedDocument: {
        ...ticket.completedDocument,
        returnedAt: new Date().toISOString()
      }
    }

    // Save the updated tickets
    try {
      await fs.writeFile(consultantTicketsPath, JSON.stringify(consultantTickets, null, 2))
    } catch (error) {
      console.error('Error saving consultant tickets:', error)
      return NextResponse.json(
        { error: 'Failed to update consultant ticket' },
        { status: 500 }
      )
    }

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Document returned successfully',
      ticket: consultantTickets[ticketIndex]
    }, { status: 200 })
  } catch (error) {
    console.error('Error returning document:', error)
    return NextResponse.json(
      { error: 'Failed to process document return' },
      { status: 500 }
    )
  }
}
