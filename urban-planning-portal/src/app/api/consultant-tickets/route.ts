import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { ConsultantTicket } from '@shared/types/consultantsTickets'
import { getConsultantTicketsPath, getDocumentsPath, getDocumentPath, getDocumentsMetadataPath } from '@shared/utils/paths'
import { Document, DocumentVersion } from '@shared/types/documents'
import { getJob, saveJob } from '@shared/services/jobStorage'
import { Job, Assessment } from '@shared/types/jobs'

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

// Helper function to read consultant tickets
async function readConsultantTickets(): Promise<ConsultantTicket[]> {
  try {
    const filePath = getConsultantTicketsPath()
    const fileExists = await fs.access(filePath).then(() => true).catch(() => false)

    if (!fileExists) {
      await fs.writeFile(filePath, '[]')
      return []
    }

    const data = await fs.readFile(filePath, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error reading consultant tickets:', error)
    return []
  }
}

// Helper function to write consultant tickets
async function writeConsultantTickets(tickets: ConsultantTicket[]) {
  const filePath = getConsultantTicketsPath()
  await fs.writeFile(filePath, JSON.stringify(tickets, null, 2))
}

// Helper function to create document from consultant ticket
async function createDocumentFromConsultantTicket(
  ticket: ConsultantTicket,
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
    title: `${getConsultantCategoryDisplayName(ticket.category)} - ${ticket.jobAddress}`,
    path: `consultant-tickets/${ticket.id}`,
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
      category: ticket.category,
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

    // Create new consultant ticket
    const newTicket: ConsultantTicket = {
      id: uuidv4(),
      jobId: metadata.jobId,
      jobAddress: metadata.jobAddress,
      category: metadata.category,
      consultantId: metadata.consultantId,
      consultantName: metadata.consultantName,
      status: 'pending',
      createdAt: new Date().toISOString(),
      assessment: metadata.assessment,
      completedDocument: undefined
    };

    // Remove reportData and ticketType if present
    if ('reportData' in newTicket) {
      delete (newTicket as any).reportData;
    }
    if ('ticketType' in newTicket) {
      delete (newTicket as any).ticketType;
    }

    // Only create document and add reference if a file was actually uploaded
    let createdDocument = null;
    if (file) {
      try {
        createdDocument = await createDocumentFromConsultantTicket(newTicket, file, metadata);
        // Update ticket with document reference only if document creation succeeded
        newTicket.completedDocument = {
          fileName: createdDocument.versions[0].fileName,
          originalName: createdDocument.versions[0].originalName,
          uploadedAt: createdDocument.versions[0].uploadedAt
        };
      } catch (docError) {
        console.error('Error creating document from consultant ticket file:', docError);
        // Proceed without document, but log the error
      }
    } else {
      // Full mapping for all ConsultantCategory values
      const categoryToDocumentId: Record<string, { id: string, title: string }> = {
        'NatHERS & BASIX': { id: 'nathersBasixAssessment', title: 'NatHERS & BASIX' },
        'Waste Management': { id: 'wasteManagementAssessment', title: 'Waste Management' },
        'Cost Estimate': { id: 'costEstimateAssessment', title: 'Cost Estimate' },
        'Stormwater': { id: 'stormwaterAssessment', title: 'Stormwater' },
        'Traffic': { id: 'trafficAssessment', title: 'Traffic' },
        'Surveyor': { id: 'surveyorAssessment', title: 'Surveyor' },
        'Bushfire': { id: 'bushfireAssessment', title: 'Bushfire' },
        'Flooding': { id: 'floodingAssessment', title: 'Flooding' },
        'Acoustic': { id: 'acousticAssessment', title: 'Acoustic' },
        'Landscaping': { id: 'landscapingAssessment', title: 'Landscaping' },
        'Heritage': { id: 'heritageAssessment', title: 'Heritage' },
        'Biodiversity': { id: 'biodiversityAssessment', title: 'Biodiversity' },
        'Lawyer': { id: 'lawyerAssessment', title: 'Lawyer' },
        'Certifiers': { id: 'certifiersAssessment', title: 'Certifiers' },
        'Arborist': { id: 'arboristAssessment', title: 'Arborist' },
        'Geotechnical': { id: 'geotechnicalAssessment', title: 'Geotechnical' },
      };
      const docInfo = categoryToDocumentId[newTicket.category] || { id: newTicket.category.replace(/\s+/g, '').replace(/&/g, '').replace(/[^a-zA-Z0-9]/g, '') + 'Assessment', title: newTicket.category };
      const documentId = docInfo.id;
      const documentTitle = docInfo.title;
      const now = new Date().toISOString();
      // Reference attached documents by jobId (from assessment.documents if present)
      const attachedDocuments = metadata?.assessment?.documents || {};
      const document = {
        id: documentId,
        title: `${documentTitle} - ${newTicket.jobAddress}`,
        path: `consultant-tickets/${newTicket.id}`,
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
          category: newTicket.category,
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
      // Update the job's consultants field for this category with assessment status 'paid'
      try {
        const job = getJob(newTicket.jobId);
        if (job) {
          job.consultants = job.consultants ?? {};
          job.consultants[newTicket.category] = job.consultants[newTicket.category] ?? { name: '', notes: '' };
          (job.consultants[newTicket.category] as { assessment?: Assessment }).assessment = {
            ...((job.consultants[newTicket.category] as { assessment?: Assessment }).assessment || {}),
            ...newTicket.assessment,
            status: 'paid',
            createdAt: now,
            updatedAt: now,
          };
          await saveJob(newTicket.jobId, job);
        }
      } catch (err) {
        console.error('Error updating job consultants assessment field:', err);
      }
    }

    // Read existing tickets
    const tickets = await readConsultantTickets();

    // Add new ticket
    tickets.push(newTicket);

    // Save updated tickets
    await writeConsultantTickets(tickets);

    return NextResponse.json(newTicket);
  } catch (error) {
    console.error('Error creating consultant ticket:', error);
    return NextResponse.json(
      { error: 'Failed to create consultant ticket' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const tickets = await readConsultantTickets();
    return NextResponse.json(tickets);
  } catch (error) {
    console.error('Error fetching consultant tickets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch consultant tickets' },
      { status: 500 }
    );
  }
}
