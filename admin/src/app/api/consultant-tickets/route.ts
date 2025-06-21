import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import {
  getConsultantTicketsPath,
  getDocumentsPath,
  getDocumentPath,
  getDocumentsMetadataPath,
} from '@shared/utils/paths';
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs
import path from 'path';
import { ConsultantTicket, ConsultantCategory } from '@shared/types/consultantsTickets';
import { Document, DocumentVersion } from '@shared/types/documents';
import { getJob, saveJob } from '@shared/services/jobStorage';
import { Job, Assessment } from '@shared/types/jobs';

// Helper function to get consultant category display name
const getConsultantCategoryDisplayName = (category: string): string => {
  switch (category) {
    case 'NatHERS & BASIX':
    case 'Waste Management':
    case 'Cost Estimate':
    case 'Stormwater':
    case 'Traffic':
    case 'Surveyor':
    case 'Bushfire':
    case 'Flooding':
    case 'Acoustic':
    case 'Landscaping':
    case 'Heritage':
    case 'Biodiversity':
    case 'Lawyer':
    case 'Certifiers':
    case 'Arborist':
    case 'Geotechnical':
      return category;
    default:
      return category;
  }
};

interface TicketMetadata {
  jobId: string;
  jobAddress?: string;
  category: ConsultantCategory;
  assessment: Assessment;
  documents: Array<{ id: string; name: string }>;
  consultantId: string;
  consultantName: string;
}

export async function GET() {
  try {
    const filePath = getConsultantTicketsPath();
    const data = await fs.readFile(filePath, 'utf8');
    const tickets: ConsultantTicket[] = JSON.parse(data);
    return NextResponse.json(tickets);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return NextResponse.json([]); // Return empty array if file not found
    }
    return NextResponse.json(
      {
        error: 'Failed to fetch consultant tickets',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  let metadataString: string | null = null; // Declare here for wider scope
  try {
    const formData = await request.formData();
    metadataString = formData.get('metadata') as string; // Assign here

    if (!metadataString) {
      return NextResponse.json({ error: 'Metadata is required' }, { status: 400 });
    }

    const metadata: TicketMetadata = JSON.parse(metadataString);
    const { jobId, jobAddress, category, assessment, consultantId, consultantName } = metadata;

    if (!jobId || !category || !assessment || !consultantId || !consultantName) {
      return NextResponse.json(
        { error: 'Missing required fields in metadata' },
        { status: 400 }
      );
    }

    // Optionally, validate category against ConsultantCategory values
    const validCategories: ConsultantCategory[] = [
      'NatHERS & BASIX',
      'Waste Management',
      'Cost Estimate',
      'Stormwater',
      'Traffic',
      'Surveyor',
      'Bushfire',
      'Flooding',
      'Acoustic',
      'Landscaping',
      'Heritage',
      'Biodiversity',
      'Lawyer',
      'Certifiers',
      'Arborist',
      'Geotechnical',
    ];
    if (!validCategories.includes(category)) {
      return NextResponse.json({ error: `Invalid category: ${category}` }, { status: 400 });
    }

    const consultantTicketsPath = getConsultantTicketsPath();
    let consultantTickets: ConsultantTicket[] = [];
    try {
      const consultantTicketsData = await fs.readFile(consultantTicketsPath, 'utf-8');
      consultantTickets = JSON.parse(consultantTicketsData);
    } catch (readError) {
      if ((readError as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw readError;
      }
    }

    const newTicket: ConsultantTicket = {
      id: uuidv4(),
      jobId,
      jobAddress: jobAddress || '',
      category, // ConsultantCategory
      status: 'pending',
      createdAt: new Date().toISOString(),
      assessment, // Store the assessment object directly
      consultantId,
      consultantName,
      documents: metadata.documents || [],
    };

    consultantTickets.push(newTicket);

    try {
      await fs.writeFile(consultantTicketsPath, JSON.stringify(consultantTickets, null, 2));
    } catch (writeError) {
      throw writeError; // Propagate error to the main catch block
    }

    return NextResponse.json(newTicket, { status: 201 });
  } catch (error) {
    if (error instanceof SyntaxError && metadataString) {
      return NextResponse.json(
        { error: 'Invalid JSON format in metadata', details: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      {
        error: 'Failed to create consultant ticket',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

async function createDocumentFromConsultantTicket(
  ticket: ConsultantTicket,
  file: File,
  metadata: TicketMetadata
): Promise<Document> {
  const documentId = uuidv4();
  const version = 1;
  const extension = path.extname(file.name);
  const filePath = getDocumentPath(documentId, version, extension);
  const fileName = path.basename(filePath);

  // Save the file
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(filePath, buffer);

  // Create document version
  const documentVersion: DocumentVersion = {
    version,
    uploadedAt: new Date().toISOString(),
    fileName: fileName,
    originalName: file.name,
    size: file.size,
    type: file.type,
    uploadedBy: metadata.consultantName,
  };

  // Create document
  const document: Document = {
    id: documentId,
    title: metadata.category,
    path: filePath,
    type: file.type,
    category: ticket.category,
    versions: [],
    currentVersion: version,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true,
    metadata: {
      jobId: ticket.jobId,
      uploadedBy: metadata.consultantName,
      title: metadata.category,
      description: `Assessment for ${metadata.category}`,
      category: metadata.category,
      path: filePath,
    },
  };

  // Save metadata
  const metadataPath = getDocumentsMetadataPath();
  try {
    const existingMetadata = await fs.readFile(metadataPath, 'utf-8');
    const documents = JSON.parse(existingMetadata);
    documents.push(document);
    await fs.writeFile(metadataPath, JSON.stringify(documents, null, 2));
  } catch (error) {
    await fs.writeFile(metadataPath, JSON.stringify([document], null, 2));
  }

  return document;
}
