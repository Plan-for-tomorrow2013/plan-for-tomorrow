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

    // Read the work tickets file from the client portal's data
    const workTicketsPath = path.join(process.cwd(), '..', 'urban-planning-portal', 'data', 'work-tickets.json')
    let workTickets = []
    try {
        const workTicketsData = await fs.readFile(workTicketsPath, 'utf-8')
        workTickets = JSON.parse(workTicketsData)
    } catch (readError) {
        if ((readError as NodeJS.ErrnoException).code === 'ENOENT') {
            return NextResponse.json({ error: 'Work tickets file not found.' }, { status: 404 });
        }
        throw readError;
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

    // Check if the ticket has a completed document
    if (!ticket.completedDocument) {
      return NextResponse.json(
        { error: 'No completed document found for this ticket' },
        { status: 400 }
      )
    }

    // Ensure the ticket has a jobId
    if (!ticket.jobId) {
        console.error(`Ticket ${ticketId} is missing jobId.`);
        return NextResponse.json({ error: 'Ticket is missing associated Job ID.' }, { status: 400 });
    }

    // Construct the path to the client's job data file
    const jobPath = path.join(process.cwd(), '..', 'urban-planning-portal', 'data', 'jobs', `${ticket.jobId}.json`)
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

    // --- File copy logic removed, as the file is already in the correct location ---
    // The 'upload' step now places the file directly in:
    // urban-planning-portal/data/jobs/[jobId]/documents/initial-assessment-report.[ext]

    // Use the details stored in the work ticket's completedDocument field
    const completedDocumentInfo = ticket.completedDocument;

    // Initialize documents object if it doesn't exist
    if (!job.documents) {
      job.documents = {}
    }

    // Add/Update the document reference in the job's documents object
    // Use the documentId stored in the completedDocument info (e.g., 'statement-of-environmental-effects')
    const documentId = completedDocumentInfo.documentId;
    if (!documentId) {
        console.error(`Ticket ${ticketId} completed document is missing documentId.`);
        return NextResponse.json({ error: 'Completed document information is incomplete.' }, { status: 400 });
    }

    job.documents[documentId] = {
      filename: completedDocumentInfo.fileName, // The stored filename (e.g., statement-of-environmental-effects.pdf)
      originalName: completedDocumentInfo.originalName,
      type: completedDocumentInfo.type,
      uploadedAt: completedDocumentInfo.uploadedAt, // Use the upload timestamp from the ticket
      size: completedDocumentInfo.size
    }

    // Update the correct status field in the job based on the ticket type
    const returnTimestamp = new Date().toISOString();
    const ticketType = ticket.ticketType;

    if (ticketType === 'custom-assessment') {
      if (!job.initialAssessment) {
        job.initialAssessment = {};
      }
      job.initialAssessment = {
        ...job.initialAssessment,
        status: 'completed', // Or keep existing status if needed, just add returnedAt? Check requirements.
        returnedAt: returnTimestamp
      };
    } else if (ticketType === 'statement-of-environmental-effects') {
      if (!job.statementOfEnvironmentalEffects) {
        job.statementOfEnvironmentalEffects = {};
      }
      job.statementOfEnvironmentalEffects = {
        ...job.statementOfEnvironmentalEffects,
        status: 'completed', // Assuming we mark as completed upon return
        returnedAt: returnTimestamp
      };
    } else if (ticketType === 'complying-development-certificate') {
      // Note: The documentId for CDC is 'complying-development-certificate'
      // We need a field in the job JSON to store its status, e.g., 'complyingDevelopmentCertificate'
      if (!job.complyingDevelopmentCertificate) {
        job.complyingDevelopmentCertificate = {};
      }
      job.complyingDevelopmentCertificate = {
        ...job.complyingDevelopmentCertificate,
        status: 'completed', // Assuming we mark as completed upon return
        returnedAt: returnTimestamp
      };
    } else {
      // Optional: Handle unknown ticket types or log a warning
      console.warn(`Unhandled ticket type for status update: ${ticketType}`);
    }

    // Save the updated job data back to the client's job file
    try {
      await fs.writeFile(jobPath, JSON.stringify(job, null, 2))
    } catch (error) {
      console.error('Error saving updated client job data:', error)
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

    // Save the updated tickets back to the client's work ticket file
    try {
      await fs.writeFile(workTicketsPath, JSON.stringify(workTickets, null, 2))
    } catch (error) {
      console.error('Error saving updated client work tickets:', error)
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
