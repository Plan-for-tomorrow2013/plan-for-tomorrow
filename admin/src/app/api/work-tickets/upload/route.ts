import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import {
  getJobDocumentsPath,
  getWorkTicketsPath,
  getDocumentsMetadataPath,
  ensureDirectoryExists,
} from '@shared/utils/paths';
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
    uploadedAt?: string;
    fileName?: string;
    originalName?: string;
    size?: number;
    type?: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const ticketId = formData.get('ticketId') as string;

    if (!file || !ticketId) {
      return NextResponse.json({ error: 'File and ticket ID are required' }, { status: 400 });
    }

    // Read the work tickets file
    const workTicketsPath = getWorkTicketsPath();
    let workTickets: WorkTicket[] = [];
    try {
      const workTicketsData = await fs.readFile(workTicketsPath, 'utf-8');
      workTickets = JSON.parse(workTicketsData);
    } catch (readError) {
      if ((readError as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw readError;
      }
    }

    // Find the ticket to update
    const ticketIndex = workTickets.findIndex(ticket => ticket.id === ticketId);
    if (ticketIndex === -1) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    const ticket = workTickets[ticketIndex];
    const ticketType = ticket.ticketType;

    // Ensure the ticket has a jobId
    if (!ticket.jobId) {
      return NextResponse.json({ error: 'Ticket is missing associated Job ID.' }, { status: 400 });
    }

    // Ensure the job documents directory exists
    const jobDocumentsDir = getJobDocumentsPath(ticket.jobId);
    await ensureDirectoryExists(jobDocumentsDir);

    // Define the fileName based on the ticket type
    const fileExtension = path.extname(file.name);
    const storedFileName = `${ticketType}${fileExtension}`;
    const filePath = path.join(jobDocumentsDir, storedFileName);

    // Save the file
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filePath, fileBuffer);

    // Map ticketType to the expected documentId used by the client portal
    const clientDocumentId = ticketType;

    // Update document metadata
    const metadataPath = getDocumentsMetadataPath();
    let documents: DocumentWithTicketMetadata[] = [];
    try {
      const metadataData = await fs.readFile(metadataPath, 'utf-8');
      documents = JSON.parse(metadataData);
    } catch (readError) {
      if ((readError as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw readError;
      }
    }

    // Add new document metadata
    documents.push({
      id: clientDocumentId,
      title: ticketType,
      path: filePath,
      type: file.type,
      category: ticketType,
      versions: [],
      currentVersion: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true,
      metadata: {
        ticketId,
        jobId: ticket.jobId,
        uploadedAt: new Date().toISOString(),
        fileName: storedFileName,
        originalName: file.name,
        size: file.size,
        type: file.type,
      },
    } as DocumentWithTicketMetadata);

    // Save metadata
    await fs.writeFile(metadataPath, JSON.stringify(documents, null, 2));

    const newTicketData = {
      ...ticket,
      // status: 'completed', // Let's manage ticket status more granularly, e.g. 'uploaded' or rely on completedDocument presence
      completedDocument: {
        documentId: clientDocumentId,
        originalName: file.name,
        fileName: storedFileName,
        uploadedAt: new Date().toISOString(),
        size: file.size,
        type: file.type,
      },
    };
    workTickets[ticketIndex] = newTicketData;

    // Save updated tickets
    await fs.writeFile(workTicketsPath, JSON.stringify(workTickets, null, 2));

    return NextResponse.json(workTickets[ticketIndex]);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process file upload' }, { status: 500 });
  }
}
