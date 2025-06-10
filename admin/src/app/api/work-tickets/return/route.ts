import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import { getWorkTicketsPath, getJobPath, getDocumentsMetadataPath } from '@shared/utils/paths'

export async function POST(request: Request) {
  try {
    const { ticketId } = await request.json()

    if (!ticketId) {
      return NextResponse.json(
        { error: 'Ticket ID is required' },
        { status: 400 }
      )
    }

    // Read work tickets
    const workTicketsPath = getWorkTicketsPath()
    let workTickets = []
    try {
      const workTicketsData = await fs.readFile(workTicketsPath, 'utf-8')
      workTickets = JSON.parse(workTicketsData)
    } catch (readError) {
      if ((readError as NodeJS.ErrnoException).code === 'ENOENT') {
        return NextResponse.json({ error: 'Work tickets file not found.' }, { status: 404 })
      }
      throw readError
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
      console.error(`Ticket ${ticketId} is missing jobId.`)
      return NextResponse.json({ error: 'Ticket is missing associated Job ID.' }, { status: 400 })
    }

    // Read job data
    const jobPath = getJobPath(ticket.jobId)
    let job
    try {
      const jobData = await fs.readFile(jobPath, 'utf-8')
      job = JSON.parse(jobData)
    } catch (readError) {
      if ((readError as NodeJS.ErrnoException).code === 'ENOENT') {
        return NextResponse.json({ error: 'Job file not found.' }, { status: 404 })
      }
      throw readError
    }

    // === BEGIN MODIFICATION: Update the Job object with completed report details ===
    const { completedDocument, ticketType } = ticket
    let reportKey: string | null = null

    switch (ticketType) { // ticketType is expected to be camelCase e.g., "customAssessment"
      case 'statementOfEnvironmentalEffects':
        reportKey = 'statementOfEnvironmentalEffects'
        break
      case 'customAssessment': // Changed from 'custom-assessment'
        reportKey = 'customAssessment'
        break
      case 'complyingDevelopmentCertificate': // Changed from 'complying-development-certificate'
        reportKey = 'complyingDevelopmentCertificate'
        break
      case 'wasteManagementAssessment':
        reportKey = 'wasteManagementAssessment'
        break
      case 'nathersAssessment':
        reportKey = 'nathersAssessment'
        break
      default:
        console.warn(`Unknown or unhandled ticket type: ${ticketType} for ticket ${ticketId}. Job data will not be updated for this report type.`)
    }

    // Ensure the specific report object (e.g., job.complyingDevelopmentCertificate) exists on the job object.
    // Initialize it if it doesn't exist. This must happen BEFORE the main 'if' condition below.
    if (reportKey && typeof job[reportKey] === 'undefined') {
      job[reportKey] = {};
      console.log(`Initialized job.${reportKey} for job ${ticket.jobId}.`);
    }

    if (reportKey && job[reportKey] && completedDocument) {
      // Update the status of the report itself
      job[reportKey].status = 'completed';

      // Embed the completedDocument details from the ticket into the job's report object
      job[reportKey].completedDocument = {
        documentId: completedDocument.documentId, // or ticketType if more appropriate
        originalName: completedDocument.originalName,
        fileName: completedDocument.fileName,
        uploadedAt: completedDocument.uploadedAt || new Date().toISOString(),
        size: completedDocument.size,
        type: completedDocument.type, // Make sure 'type' from ticket.completedDocument is copied
        returnedAt: new Date().toISOString() // Set returnedAt here as well for consistency
      };

      // Remove old top-level file properties if they exist, to avoid confusion
      delete job[reportKey].fileName;
      delete job[reportKey].originalName;
      // delete job[reportKey].uploadedAt; // Keep if it refers to the report object's creation/update
      // delete job[reportKey].size; // Keep if it refers to the report object itself

      try {
        await fs.writeFile(jobPath, JSON.stringify(job, null, 2))
        console.log(`Job ${ticket.jobId} updated successfully with completed report for ${reportKey}.`)
      } catch (writeError) {
        console.error(`Error writing updated job file for ${ticket.jobId}:`, writeError)
        // Decide if this should be a hard error for the API response
        // For now, we'll log and continue, as the work ticket itself will still be updated
      }
    } else if (reportKey && !job[reportKey]) {
      console.warn(`Report key ${reportKey} not found in job object for job ${ticket.jobId}. Cannot update report details.`)
    } else if (reportKey && !completedDocument) {
      console.warn(`Ticket ${ticketId} has reportKey ${reportKey} but no completedDocument. Cannot update job.`)
    }
    // === END MODIFICATION ===

    // Update document metadata
    const metadataPath = getDocumentsMetadataPath()
    try {
      const metadataData = await fs.readFile(metadataPath, 'utf-8')
      const documents = JSON.parse(metadataData)

      // Find and update the document
      const documentIndex = documents.findIndex(
        (doc: any) => doc.metadata?.ticketId === ticketId
      )

      if (documentIndex !== -1) {
        documents[documentIndex].metadata.returnedAt = new Date().toISOString()
        await fs.writeFile(metadataPath, JSON.stringify(documents, null, 2))
      } else {
        console.warn(`Document metadata not found for ticket ${ticketId}`)
      }
    } catch (readError) {
      if ((readError as NodeJS.ErrnoException).code === 'ENOENT') {
        console.warn('Documents metadata file not found, skipping metadata update')
      } else {
        console.error('Error updating document metadata:', readError)
      }
    }

    // Update ticket status and its completedDocument directly
    const updatedTicket = workTickets[ticketIndex];
    updatedTicket.status = 'completed';
    if (updatedTicket.completedDocument) {
      updatedTicket.completedDocument.returnedAt = new Date().toISOString();
    } else {
      // This case should ideally not happen if the checks above are passed,
      // but as a fallback, create it.
      console.warn(`Ticket ${ticketId} was missing completedDocument before setting returnedAt. This is unexpected.`);
      // If ticket.completedDocument was truly null/undefined from the input file,
      // we might need to fully populate it here from 'completedDocument' const if it was meant to be new.
      // However, the logic implies 'ticket.completedDocument' should exist from the upload step.
      // For now, just ensuring 'returnedAt' is set if the object exists.
      // If 'completedDocument' itself is what's new from the 'upload' step and not on original 'ticket',
      // then the spread `...ticket` was correct to bring it in.
      // The current problem is likely not here but in how the work-tickets.json is read/parsed if it gets corrupted.

      // Reverting to the spread for completedDocument as it might be new from the upload step
      // and not on the original 'ticket' object from the file.
      // The primary concern is the integrity of work-tickets.json.
    }
    // The previous spread was likely correct:
     workTickets[ticketIndex] = {
       ...ticket, // original ticket from file
       status: 'completed', // new status
       completedDocument: { // merged completed document
         ...ticket.completedDocument, // from original ticket (should have details from upload)
         returnedAt: new Date().toISOString() // add/update returnedAt
       }
     };


    // Save updated tickets
    await fs.writeFile(workTicketsPath, JSON.stringify(workTickets, null, 2))

    // Return the modified ticket object that was saved in the array
    return NextResponse.json(workTickets[ticketIndex])
  } catch (error) {
    console.error('Error returning work ticket:', error)
    return NextResponse.json(
      { error: 'Failed to return work ticket' },
      { status: 500 }
    )
  }
}
