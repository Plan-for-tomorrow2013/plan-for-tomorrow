import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { WorkTicket } from '@shared/types/workTickets'
import { getWorkTicketsPath, getDocumentsPath, getDocumentPath, getDocumentsMetadataPath } from '@shared/utils/paths'
import { Document, DocumentVersion } from '@shared/types/documents'
import { getJob, saveJob } from '@shared/services/jobStorage'
import { Job } from '@shared/types/jobs'

// Helper function to get display name for ticket type
const getTicketTypeDisplayName = (type: string): string => {
  switch (type) {
    case 'custom-assessment':
      return 'Custom Assessment'
    case 'statement-of-environmental-effects':
      return 'Statement of Environmental Effects'
    case 'complying-development-certificate':
      return 'Complying Development Certificate'
    default:
      return type
  }
}

// Helper function to read work tickets
async function readWorkTickets(): Promise<WorkTicket[]> {
  try {
    const filePath = getWorkTicketsPath()
    const fileExists = await fs.access(filePath).then(() => true).catch(() => false)

    if (!fileExists) {
      await fs.writeFile(filePath, '[]')
      return []
    }

    const data = await fs.readFile(filePath, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error reading work tickets:', error)
    return []
  }
}

// Helper function to write work tickets
async function writeWorkTickets(tickets: WorkTicket[]) {
  const filePath = getWorkTicketsPath()
  await fs.writeFile(filePath, JSON.stringify(tickets, null, 2))
}

// Helper function to create document from work ticket
async function createDocumentFromWorkTicket(
  ticket: WorkTicket,
  file: File,
  metadata: any
): Promise<Document> {
  const documentId = uuidv4()
  const version = 1
  const extension = path.extname(file.name)
  const filePath = getDocumentPath(documentId, version, extension)

  // Save the file
  const buffer = Buffer.from(await file.arrayBuffer())
  await fs.writeFile(filePath, buffer)

  // Create document version
  const documentVersion: DocumentVersion = {
    version,
    uploadedAt: new Date().toISOString(),
    fileName: path.basename(filePath),
    originalName: file.name,
    size: file.size,
    type: file.type,
    uploadedBy: metadata.uploadedBy || 'system'
  }

  // Create document
  const document: Document = {
    id: documentId,
    title: `${getTicketTypeDisplayName(ticket.ticketType)} - ${ticket.jobAddress}`,
    path: `work-tickets/${ticket.id}`,
    type: 'document',
    category: 'REPORTS',
    versions: [documentVersion],
    currentVersion: version,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true,
    metadata: {
      jobId: ticket.jobId,
      ticketId: ticket.id,
      ticketType: ticket.ticketType,
      ...metadata
    }
  }

  // Save metadata
  const metadataPath = getDocumentsMetadataPath()
  try {
    const existingMetadata = await fs.readFile(metadataPath, 'utf-8')
    const documents = JSON.parse(existingMetadata)
    documents.push(document)
    await fs.writeFile(metadataPath, JSON.stringify(documents, null, 2))
  } catch (error) {
    await fs.writeFile(metadataPath, JSON.stringify([document], null, 2))
  }

  return document
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const metadataString = formData.get('metadata') as string | null;

    if (!metadataString) {
      return NextResponse.json({ error: 'No metadata provided' }, { status: 400 });
    }

    const metadata = JSON.parse(metadataString);

    // Create new work ticket
    const newTicket: WorkTicket = {
      id: uuidv4(),
      jobId: metadata.jobId,
      jobAddress: metadata.jobAddress,
      ticketType: metadata.ticketType,
      status: 'pending',
      createdAt: new Date().toISOString(),
      // Initialize with empty completedDocument
      completedDocument: undefined
    };

    // Add report-specific data based on ticket type
    if (metadata.reportData) {
      switch (metadata.ticketType) {
        case 'custom-assessment':
          newTicket.customAssessment = metadata.reportData;
          break;
        case 'statement-of-environmental-effects':
          newTicket.statementOfEnvironmentalEffects = metadata.reportData;
          break;
        case 'complying-development-certificate':
          newTicket.complyingDevelopmentCertificate = metadata.reportData;
          break;
      }
    }

    // Only create document and add reference if a file was actually uploaded
    let createdDocument = null;
    if (file) {
      try {
        createdDocument = await createDocumentFromWorkTicket(newTicket, file, metadata);
        // Update ticket with document reference only if document creation succeeded
        newTicket.completedDocument = {
          fileName: createdDocument.versions[0].fileName,
          originalName: createdDocument.versions[0].originalName,
          uploadedAt: createdDocument.versions[0].uploadedAt
        };
      } catch (docError) {
        console.error('Error creating document from work ticket file:', docError);
        // Proceed without document, but log the error
      }
    } else {
      // Always create a document entry for every work ticket, referencing attached documents by jobId
      const documentId = uuidv4();
      const now = new Date().toISOString();
      // Reference attached documents by jobId (from reportData.documents if present)
      const attachedDocuments = metadata?.reportData?.documents || {};
      const document = {
        id: documentId,
        title: `${getTicketTypeDisplayName(newTicket.ticketType)} - ${newTicket.jobAddress}`,
        path: `work-tickets/${newTicket.id}`,
        type: 'document',
        category: 'REPORTS',
        versions: [],
        currentVersion: 1,
        createdAt: now,
        updatedAt: now,
        isActive: true,
        metadata: {
          jobId: newTicket.jobId,
          ticketId: newTicket.id,
          ticketType: newTicket.ticketType,
          attachedDocuments,
          ...metadata
        },
        displayStatus: 'pending_admin_delivery'
      };
      // Save to metadata.json
      const metadataPath = getDocumentsMetadataPath();
      try {
        const existingMetadata = await fs.readFile(metadataPath, 'utf-8');
        const documents = JSON.parse(existingMetadata);
        documents.push(document);
        await fs.writeFile(metadataPath, JSON.stringify(documents, null, 2));
      } catch (error) {
        await fs.writeFile(metadataPath, JSON.stringify([document], null, 2));
      }
      createdDocument = document;
    }

    // Read existing tickets
    const tickets = await readWorkTickets();

    // Add new ticket
    tickets.push(newTicket);

    // Save updated tickets
    await writeWorkTickets(tickets);

    // --- Update the job's assessment field to reflect the new report ---
    try {
      const job = getJob(newTicket.jobId);
      if (job) {
        // Determine which assessment field to update
        let assessmentKey: keyof Pick<Job, 'customAssessment' | 'statementOfEnvironmentalEffects' | 'complyingDevelopmentCertificate'> | null = null;
        let documentKey: string | null = null;
        let reportTitle: string | null = null;
        switch (newTicket.ticketType) {
          case 'custom-assessment':
            assessmentKey = 'customAssessment';
            documentKey = 'custom-assessment-report';
            reportTitle = 'Custom Assessment Report (Pending)';
            break;
          case 'statement-of-environmental-effects':
            assessmentKey = 'statementOfEnvironmentalEffects';
            documentKey = 'statement-of-environmental-effects-report';
            reportTitle = 'Statement of Environmental Effects (Pending)';
            break;
          case 'complying-development-certificate':
            assessmentKey = 'complyingDevelopmentCertificate';
            documentKey = 'complying-development-certificate-report';
            reportTitle = 'Complying Development Certificate (Pending)';
            break;
        }
        if (assessmentKey && documentKey && reportTitle) {
          // Update the assessment field with status and report data
          job[assessmentKey] = {
            ...(job[assessmentKey] || {}),
            status: 'paid',
            type: newTicket.ticketType,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            ...metadata.reportData,
            documents: metadata?.reportData?.documents || {},
          };
          // Add a placeholder document to the job's documents field
          job.documents = job.documents || {};
          job.documents[documentKey] = {
            fileName: 'pending',
            originalName: reportTitle,
            type: 'report',
            uploadedAt: new Date().toISOString(),
            size: 0
          };
          await saveJob(newTicket.jobId, job);
        }
      }
    } catch (err) {
      console.error('Error updating job assessment field:', err);
    }

    return NextResponse.json(newTicket);
  } catch (error) {
    console.error('Error creating work ticket:', error);
    return NextResponse.json(
      { error: 'Failed to create work ticket' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const tickets = await readWorkTickets()
    return NextResponse.json(tickets)
  } catch (error) {
    console.error('Error fetching work tickets:', error)
    return NextResponse.json(
      { error: 'Failed to fetch work tickets' },
      { status: 500 }
    )
  }
}
