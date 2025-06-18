import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import { getConsultantTicketsPath, getJobPath, getDocumentsMetadataPath } from '@shared/utils/paths'

export async function POST(request: Request) {
  try {
    const { ticketId } = await request.json()

    if (!ticketId) {
      return NextResponse.json(
        { error: 'Ticket ID is required' },
        { status: 400 }
      )
    }

    // Read consultant tickets
    const consultantTicketsPath = getConsultantTicketsPath()
    let consultantTickets = []
    try {
      const consultantTicketsData = await fs.readFile(consultantTicketsPath, 'utf-8')
      consultantTickets = JSON.parse(consultantTicketsData)
    } catch (readError) {
      if ((readError as NodeJS.ErrnoException).code === 'ENOENT') {
        return NextResponse.json({ error: 'Consultant tickets file not found.' }, { status: 404 })
      }
      throw readError
    }

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
    const { completedDocument, category } = ticket

    // Update the consultant's assessment in the job object
    if (category && job.consultants && job.consultants[category]) {
      if (!job.consultants[category].assessment) {
        job.consultants[category].assessment = {};
      }
      job.consultants[category].assessment.status = 'completed';
      job.consultants[category].assessment.completedDocument = {
        documentId: completedDocument.documentId,
        originalName: completedDocument.originalName,
        fileName: completedDocument.fileName,
        uploadedAt: completedDocument.uploadedAt || new Date().toISOString(),
        size: completedDocument.size,
        type: completedDocument.type,
        returnedAt: new Date().toISOString()
      };
      // Add consultant information to the assessment
      job.consultants[category].consultantId = ticket.consultantId;
      job.consultants[category].consultantName = ticket.consultantName;
      // Optionally remove old top-level file properties if they exist
      delete job.consultants[category].assessment.fileName;
      delete job.consultants[category].assessment.originalName;
      // Save the updated job
      try {
        await fs.writeFile(jobPath, JSON.stringify(job, null, 2))
        console.log(`Job ${ticket.jobId} updated successfully with completed assessment for consultant category ${category}.`)
      } catch (writeError) {
        console.error(`Error writing updated job file for ${ticket.jobId}:`, writeError)
      }
    } else {
      console.warn(`Consultant category ${category} not found in job object for job ${ticket.jobId}. Cannot update assessment details.`)
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
    consultantTickets[ticketIndex] = {
      ...ticket,
      status: 'completed',
      completedDocument: {
        documentId: ticket.completedDocument.documentId,
        originalName: ticket.completedDocument.originalName,
        fileName: ticket.completedDocument.fileName,
        uploadedAt: ticket.completedDocument.uploadedAt,
        size: ticket.completedDocument.size,
        type: ticket.completedDocument.type,
        returnedAt: new Date().toISOString()
      },
      consultantId: ticket.consultantId,
      consultantName: ticket.consultantName
    };

    // Save updated tickets
    await fs.writeFile(consultantTicketsPath, JSON.stringify(consultantTickets, null, 2))

    // Get the updated ticket
    const updatedTicket = consultantTickets[ticketIndex];

    // Return the modified ticket object that was saved in the array
    const responseTicket = {
      id: updatedTicket.id,
      jobId: updatedTicket.jobId,
      jobAddress: updatedTicket.jobAddress,
      category: updatedTicket.category,
      status: 'completed',
      createdAt: updatedTicket.createdAt,
      consultantId: updatedTicket.consultantId,
      consultantName: updatedTicket.consultantName,
      assessment: updatedTicket.assessment,
      completedDocument: {
        documentId: updatedTicket.completedDocument.documentId,
        originalName: updatedTicket.completedDocument.originalName,
        fileName: updatedTicket.completedDocument.fileName,
        uploadedAt: updatedTicket.completedDocument.uploadedAt,
        size: updatedTicket.completedDocument.size,
        type: updatedTicket.completedDocument.type,
        returnedAt: new Date().toISOString()
      }
    };
    return NextResponse.json(responseTicket)
  } catch (error) {
    console.error('Error returning consultant ticket:', error)
    return NextResponse.json(
      { error: 'Failed to return consultant ticket' },
      { status: 500 }
    )
  }
}
