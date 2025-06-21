import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import {
  getConsultantTicketsPath,
  getJobPath,
  getDocumentsMetadataPath,
} from '@shared/utils/paths';
import { ConsultantTicket } from '@shared/types/consultantsTickets';
import { Job, Assessment } from '@shared/types/jobs';
import { Document } from '@shared/types/documents';

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

type ConsultantReference = {
  name: string;
  notes: string;
  consultantId: string;
  assessment?: Assessment;
};

export async function POST(request: NextRequest) {
  try {
    const { ticketId } = await request.json();

    if (!ticketId) {
      return NextResponse.json({ error: 'Ticket ID is required' }, { status: 400 });
    }

    // Read consultant tickets
    const consultantTicketsPath = getConsultantTicketsPath();
    let consultantTickets: ConsultantTicket[] = [];
    try {
      const consultantTicketsData = await fs.readFile(consultantTicketsPath, 'utf-8');
      consultantTickets = JSON.parse(consultantTicketsData);
    } catch (readError) {
      if ((readError as NodeJS.ErrnoException).code === 'ENOENT') {
        return NextResponse.json({ error: 'Consultant tickets file not found.' }, { status: 404 });
      }
      throw readError;
    }

    // Find the ticket to update
    const ticketIndex = consultantTickets.findIndex(ticket => ticket.id === ticketId);
    if (ticketIndex === -1) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    const ticket = consultantTickets[ticketIndex];

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
    const { completedDocument, category } = ticket;

    // Update the consultant's assessment in the job object
    if (category && job.consultants) {
      let consultantsArray = job.consultants[category] as ConsultantReference[] | undefined;
      if (!consultantsArray) {
        consultantsArray = [];
        job.consultants[category] = consultantsArray;
      } else if (!Array.isArray(consultantsArray)) {
        consultantsArray = [consultantsArray as ConsultantReference];
        job.consultants[category] = consultantsArray;
      }
      
      const consultantIndex = consultantsArray.findIndex(
        c => c.consultantId === ticket.consultantId
      );

      const consultantData = {
        name: ticket.consultantName,
        notes: '',
        consultantId: ticket.consultantId,
        assessment: {
          status: 'completed' as const,
          completedDocument: {
            ...ticket.completedDocument!,
            originalName: ticket.completedDocument?.originalName ?? '',
            returnedAt: new Date().toISOString(),
          },
        },
      };

      if (consultantIndex === -1) {
        // Add new consultant to the array
        consultantsArray.push(consultantData as any);
      } else {
        // Update existing consultant
        consultantsArray[consultantIndex] = {
          ...consultantsArray[consultantIndex],
          ...(consultantData as any),
        };
      }

      // Save the updated job
      try {
        await fs.writeFile(jobPath, JSON.stringify(job, null, 2));
      } catch (writeError) {
        // console.error(`Error writing updated job file for ${ticket.jobId}:`, writeError);
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
        console.error('Error updating document metadata:', readError);
      }
    }

    // Update ticket status and its completedDocument directly
    consultantTickets[ticketIndex] = {
      ...ticket,
      status: 'completed',
      completedDocument: {
        ...ticket.completedDocument!,
        returnedAt: new Date().toISOString(),
      },
      consultantId: ticket.consultantId,
      consultantName: ticket.consultantName,
    };

    // Save updated tickets
    await fs.writeFile(consultantTicketsPath, JSON.stringify(consultantTickets, null, 2));

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
        ...updatedTicket.completedDocument!,
        returnedAt: updatedTicket.completedDocument!.returnedAt,
      },
    };
    return NextResponse.json(responseTicket);
  } catch (error) {
    console.error('Error returning consultant ticket:', error);
    return NextResponse.json({ error: 'Failed to return consultant ticket' }, { status: 500 });
  }
}
