import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import {
  getJobDocumentsPath,
  getConsultantWorkOrdersPath,
  getDocumentsMetadataPath,
  ensureDirectoryExists,
  getJobPath,
} from '@shared/utils/paths';
import { ConsultantWorkOrder } from '@shared/types/consultantsWorkOrder';
import { Document } from '@shared/types/documents';
import { Job } from '@shared/types/jobs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const ticketId = formData.get('ticketId') as string;
    const type = formData.get('type') as string; // 'report' or 'invoice'

    if (!file || !ticketId) {
      return NextResponse.json({ error: 'File and ticket ID are required' }, { status: 400 });
    }
    if (!type || (type !== 'report' && type !== 'invoice')) {
      return NextResponse.json({ error: 'Type (report or invoice) is required' }, { status: 400 });
    }

    // Read the consultant tickets file
    const consultantWorkOrdersPath = getConsultantWorkOrdersPath();
    let consultantWorkOrders: ConsultantWorkOrder[] = [];
    try {
      const consultantWorkOrdersData = await fs.readFile(consultantWorkOrdersPath, 'utf-8');
      consultantWorkOrders = JSON.parse(consultantWorkOrdersData);
    } catch (readError) {
      if ((readError as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw readError;
      }
    }

    // Find the ticket to update
    const ticketIndex = consultantWorkOrders.findIndex(ticket => ticket.id === ticketId);
    if (ticketIndex === -1) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    const ticket = consultantWorkOrders[ticketIndex];
    const ticketCategory = ticket.category;

    // Ensure the ticket has a jobId
    if (!ticket.jobId) {
      return NextResponse.json({ error: 'Ticket is missing associated Job ID.' }, { status: 400 });
    }

    // Ensure the job documents directory exists
    const jobDocumentsDir = getJobDocumentsPath(ticket.jobId);
    await ensureDirectoryExists(jobDocumentsDir);

    // Define the fileName based on the ticket category
    const fileExtension = path.extname(file.name);
    const storedFileName = `${ticketCategory}${fileExtension}`;
    const filePath = path.join(jobDocumentsDir, storedFileName);

    // Save the file
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filePath, fileBuffer);

    // Map ticket category to the expected documentId used by the client portal
    const clientDocumentId = ticketCategory;

    // Update document metadata
    const metadataPath = getDocumentsMetadataPath();
    let documents: Document[] = [];
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
      title: ticket.category,
      path: filePath,
      type: file.type,
      category: ticket.category,
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
    } as Document);

    // Save metadata
    await fs.writeFile(metadataPath, JSON.stringify(documents, null, 2));

    // Prepare the document object
    const documentData = {
      documentId: clientDocumentId,
      originalName: file.name,
      fileName: storedFileName,
      uploadedAt: new Date().toISOString(),
      size: file.size,
      type: file.type,
    };

    // Update the correct field based on type
    const newTicketData = {
      ...ticket,
      consultantId: ticket.consultantId,
      consultantName: ticket.consultantName,
      ...(type === 'report' ? { completedDocument: documentData } : {}),
      ...(type === 'invoice' ? { invoice: documentData } : {}),
    };
    consultantWorkOrders[ticketIndex] = newTicketData;

    // === BEGIN MODIFICATION: Update the Job object with completed report details ===
    try {
      const jobPath = getJobPath(ticket.jobId);
      let job: Job | null = null;
      try {
        const jobData = await fs.readFile(jobPath, 'utf-8');
        job = JSON.parse(jobData);
      } catch (readError) {
        job = null;
      }
      if (job && ticketCategory && job.consultants) {
        // Initialize the consultants array for this category if it doesn't exist
        if (!job.consultants[ticketCategory]) {
          job.consultants[ticketCategory] = [];
        }

        // Find the consultant in the array by consultantId
        const consultantIndex = job.consultants[ticketCategory]!.findIndex(
          c => c.consultantId === ticket.consultantId
        );

        const consultantData = {
          name: ticket.consultantName,
          notes: '',
          consultantId: ticket.consultantId,
          assessment: {
            status: 'completed' as const,
            completedDocument: {
              documentId: clientDocumentId,
              originalName: file.name,
              fileName: storedFileName,
              uploadedAt: new Date().toISOString(),
              size: file.size,
              type: file.type,
              returnedAt: new Date().toISOString(),
            },
          },
        };

        if (consultantIndex === -1) {
          // Add new consultant to the array
          job.consultants[ticketCategory]!.push(consultantData as any);
        } else {
          // Update existing consultant
          job.consultants[ticketCategory]![consultantIndex] = {
            ...job.consultants[ticketCategory]![consultantIndex],
            ...(consultantData as any),
          };
        }

        await fs.writeFile(jobPath, JSON.stringify(job, null, 2));
      }
    } catch (err) {
      // console.error('Error updating job consultants assessment field:', err);
    }
    // === END MODIFICATION ===

    // Save updated tickets
    await fs.writeFile(consultantWorkOrdersPath, JSON.stringify(consultantWorkOrders, null, 2));

    return NextResponse.json(consultantWorkOrders[ticketIndex]);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process file upload' }, { status: 500 });
  }
}
