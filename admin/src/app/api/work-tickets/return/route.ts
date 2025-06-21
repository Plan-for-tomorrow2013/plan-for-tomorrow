import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import { getWorkTicketsPath, getJobPath, getDocumentsMetadataPath } from '@shared/utils/paths';
import { Job } from '@shared/types/jobs';
import { Document } from '@shared/types/documents';

interface WorkTicket {
  id: string;
  jobId: string;
  ticketType: string;
  status: string;
  completedDocument?: {
    documentId: string;
    originalName: string;
    fileName: string;
    uploadedAt: string;
    size: number;
    type: string;
    returnedAt?: string;
  };
}

interface DocumentWithTicketMetadata extends Document {
  metadata?: {
    jobId?: string;
    uploadedBy?: string;
    title?: string;
    description?: string;
    category?: string;
    path?: string;
    ticketId?: string;
    returnedAt?: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const { ticketId } = await request.json();

    if (!ticketId) {
      return NextResponse.json({ error: 'Ticket ID is required' }, { status: 400 });
    }

    // Read work tickets
    const workTicketsPath = getWorkTicketsPath();
    let workTickets: WorkTicket[] = [];
    try {
      const workTicketsData = await fs.readFile(workTicketsPath, 'utf-8');
      workTickets = JSON.parse(workTicketsData);
    } catch (readError) {
      if ((readError as NodeJS.ErrnoException).code === 'ENOENT') {
        return NextResponse.json({ error: 'Work tickets file not found.' }, { status: 404 });
      }
      throw readError;
    }

    // Find the ticket to update
    const ticketIndex = workTickets.findIndex(ticket => ticket.id === ticketId);
    if (ticketIndex === -1) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    const ticket = workTickets[ticketIndex];

    // Check if the ticket has a completed document
    if (!ticket.completedDocument) {
      return NextResponse.json(
        { error: 'No completed document found for this ticket' },
        { status: 400 }
      );
    }

    // Ensure the ticket has a jobId
    if (!ticket.jobId) {
      return NextResponse.json({ error: 'Ticket is missing associated Job ID.' }, { status: 400 });
    }

    // Read job data
    const jobPath = getJobPath(ticket.jobId);
    let job: Job;
    try {
      const jobData = await fs.readFile(jobPath, 'utf-8');
      job = JSON.parse(jobData);
    } catch (readError) {
      if ((readError as NodeJS.ErrnoException).code === 'ENOENT') {
        return NextResponse.json({ error: 'Job file not found.' }, { status: 404 });
      }
      throw readError;
    }

    // === BEGIN MODIFICATION: Update the Job object with completed report details ===
    const { completedDocument, ticketType } = ticket;
    let reportKey: string | null = null;

    switch (
      ticketType // ticketType is expected to be camelCase e.g., "customAssessment"
    ) {
      case 'statementOfEnvironmentalEffects':
        reportKey = 'statementOfEnvironmentalEffects';
        break;
      case 'customAssessment': // Changed from 'custom-assessment'
        reportKey = 'customAssessment';
        break;
      case 'complyingDevelopmentCertificate': // Changed from 'complying-development-certificate'
        reportKey = 'complyingDevelopmentCertificate';
        break;
      case 'wasteManagementAssessment':
        reportKey = 'wasteManagementAssessment';
        break;
      case 'nathersAssessment':
        reportKey = 'nathersAssessment';
        break;
      default:
        // Unknown ticket type - job data will not be updated
        break;
    }

    // Ensure the specific report object (e.g., job.complyingDevelopmentCertificate) exists on the job object.
    // Initialize it if it doesn't exist. This must happen BEFORE the main 'if' condition below.
    if (reportKey && typeof (job as any)[reportKey] === 'undefined') {
      (job as any)[reportKey] = {};
    }

    if (reportKey && (job as any)[reportKey] && completedDocument) {
      // Update the status of the report itself
      (job as any)[reportKey].status = 'completed';

      // Embed the completedDocument details from the ticket into the job's report object
      (job as any)[reportKey].completedDocument = {
        documentId: completedDocument.documentId, // or ticketType if more appropriate
        originalName: completedDocument.originalName,
        fileName: completedDocument.fileName,
        uploadedAt: completedDocument.uploadedAt || new Date().toISOString(),
        size: completedDocument.size,
        type: completedDocument.type, // Make sure 'type' from ticket.completedDocument is copied
        returnedAt: new Date().toISOString(), // Set returnedAt here as well for consistency
      };

      // Remove old top-level file properties if they exist, to avoid confusion
      delete (job as any)[reportKey].fileName;
      delete (job as any)[reportKey].originalName;
      // delete job[reportKey].uploadedAt; // Keep if it refers to the report object's creation/update
      // delete job[reportKey].size; // Keep if it refers to the report object itself

      try {
        await fs.writeFile(jobPath, JSON.stringify(job, null, 2));
      } catch (writeError) {
        // Error writing job file - continue with ticket update
      }
    }
    // === END MODIFICATION ===

    // Update document metadata
    const metadataPath = getDocumentsMetadataPath();
    try {
      const metadataData = await fs.readFile(metadataPath, 'utf-8');
      const documents: DocumentWithTicketMetadata[] = JSON.parse(metadataData);

      // Find and update the document
      const documentIndex = documents.findIndex(doc => doc.metadata?.ticketId === ticketId);

      if (documentIndex !== -1) {
        if (documents[documentIndex].metadata) {
          documents[documentIndex].metadata!.returnedAt = new Date().toISOString();
        }
        await fs.writeFile(metadataPath, JSON.stringify(documents, null, 2));
      }
    } catch (readError) {
      if ((readError as NodeJS.ErrnoException).code !== 'ENOENT') {
        // console.error('Error updating document metadata:', readError);
      }
    }

    // Update ticket status and its completedDocument directly
    const updatedTicket = workTickets[ticketIndex];
    updatedTicket.status = 'completed';
    if (updatedTicket.completedDocument) {
      updatedTicket.completedDocument.returnedAt = new Date().toISOString();
    }
    // The previous spread was likely correct:
    workTickets[ticketIndex] = {
      ...ticket, // original ticket from file
      status: 'completed', // new status
      completedDocument: {
        // merged completed document
        ...ticket.completedDocument, // from original ticket (should have details from upload)
        returnedAt: new Date().toISOString(), // add/update returnedAt
      },
    };

    // Save updated tickets
    await fs.writeFile(workTicketsPath, JSON.stringify(workTickets, null, 2));

    // Return the modified ticket object that was saved in the array
    return NextResponse.json(workTickets[ticketIndex]);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process ticket return' }, { status: 500 });
  }
}
