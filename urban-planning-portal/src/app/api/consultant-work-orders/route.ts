import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { ConsultantWorkOrder } from '@shared/types/consultantsWorkOrder';
import {
  getConsultantWorkOrdersPath,
  getDocumentsPath,
  getDocumentPath,
  getDocumentsMetadataPath,
} from '@shared/utils/paths';
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

// Helper function to read consultant tickets
async function readConsultantWorkOrders(): Promise<ConsultantWorkOrder[]> {
  try {
    const filePath = getConsultantWorkOrdersPath();
    const fileExists = await fs
      .access(filePath)
      .then(() => true)
      .catch(() => false);

    if (!fileExists) {
      await fs.writeFile(filePath, '[]');
      return [];
    }

    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading consultant tickets:', error);
    return [];
  }
}

// Helper function to write consultant tickets
async function writeConsultantWorkOrders(tickets: ConsultantWorkOrder[]) {
  const filePath = getConsultantWorkOrdersPath();
  await fs.writeFile(filePath, JSON.stringify(tickets, null, 2));
}

// Helper function to create document from consultant ticket
async function createDocumentFromConsultantTicket(
  ticket: ConsultantWorkOrder,
  file: File,
  metadata: any
): Promise<Document> {
  const documentId = uuidv4();
  const version = 1;
  const extension = path.extname(file.name);
  const filePath = getDocumentPath(documentId, version, extension);

  // Save the file
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(filePath, buffer);

  // Create document version
  const documentVersion: DocumentVersion = {
    version,
    uploadedAt: new Date().toISOString(),
    fileName: path.basename(filePath),
    originalName: file.name,
    size: file.size,
    type: file.type,
    uploadedBy: metadata.uploadedBy || 'system',
  };

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
      ...metadata,
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

export async function POST(request: Request) {
  try {
    console.log('=== CONSULTANT WORK ORDER CREATION START ===');
    
    // Log the raw request
    const requestBody = await request.text();
    console.log('Raw request body:', requestBody);
    
    // Try to parse JSON first
    let quoteTicketId, jobId;
    let metadata: any;
    let file: File | null = null;
    
    try {
      const jsonData = JSON.parse(requestBody);
      quoteTicketId = jsonData.quoteTicketId;
      jobId = jsonData.jobId;
      console.log('Parsed JSON data:', { quoteTicketId, jobId });
      
      // For JSON requests, metadata should be in the JSON body
      metadata = jsonData.metadata || jsonData;
      console.log('Using JSON metadata:', metadata);
      
    } catch (jsonError) {
      console.log('Failed to parse JSON, trying form data approach');
      console.log('JSON parse error:', jsonError);
      
      // Reset request for form data parsing
      const newRequest = new Request(request.url, {
        method: request.method,
        body: requestBody,
        headers: request.headers,
      });
      
      const formData = await newRequest.formData();
      file = formData.get('file') as File | null;
      const metadataString = formData.get('metadata') as string | null;
      
      console.log('Form data parsed:', {
        hasFile: !!file,
        fileSize: file?.size,
        fileName: file?.name,
        hasMetadata: !!metadataString,
        metadataLength: metadataString?.length
      });

      if (!metadataString) {
        console.log('ERROR: No metadata provided in form data');
        return NextResponse.json({ error: 'No metadata provided' }, { status: 400 });
      }

      try {
        metadata = JSON.parse(metadataString);
        console.log('Parsed metadata from form data:', metadata);
      } catch (metadataError) {
        console.log('ERROR: Failed to parse metadata JSON:', metadataError);
        return NextResponse.json({ error: 'Invalid metadata JSON' }, { status: 400 });
      }
    }

    if (!metadata) {
      console.log('ERROR: No metadata available');
      return NextResponse.json({ error: 'No metadata available' }, { status: 400 });
    }

    // Validate required fields
    const requiredFields = ['category', 'consultantId', 'consultantName', 'jobAddress'];
    const missingFields = requiredFields.filter(field => !metadata[field]);
    if (missingFields.length > 0) {
      console.log('Missing required fields:', missingFields, 'in metadata:', metadata);
      return NextResponse.json({ error: `Missing required fields: ${missingFields.join(', ')}` }, { status: 400 });
    }

    console.log('Final metadata being used:', metadata);

    // Create new consultant ticket
    const newTicket: ConsultantWorkOrder = {
      id: uuidv4(),
      jobId: metadata.jobId,
      jobAddress: metadata.jobAddress,
      category: metadata.category,
      consultantId: metadata.consultantId,
      consultantName: metadata.consultantName,
      status: 'pending',
      createdAt: new Date().toISOString(),
      assessment: metadata.assessment,
      completedDocument: undefined,
    };

    console.log('Created new ticket object:', newTicket);

    // Remove reportData and ticketType if present
    if ('reportData' in newTicket) {
      delete (newTicket as any).reportData;
    }
    if ('ticketType' in newTicket) {
      delete (newTicket as any).ticketType;
    }

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
      console.log('Processing file upload for work order');
      try {
        createdDocument = await createDocumentFromConsultantTicket(newTicket, file, metadata);
        // Update ticket with document reference only if document creation succeeded
        newTicket.completedDocument = {
          fileName: createdDocument.versions[0].fileName,
          originalName: createdDocument.versions[0].originalName,
          uploadedAt: createdDocument.versions[0].uploadedAt,
        };
        console.log('Document created successfully:', createdDocument.id);
      } catch (docError) {
        console.error('Error creating document from consultant ticket file:', docError);
        // Proceed without document, but log the error
      }
    } else {
      console.log('No file provided, creating document reference only');
      // Full mapping for all ConsultantCategory values
      const categoryToDocumentId: Record<string, { id: string; title: string }> = {
        'NatHERS & BASIX': { id: 'nathersBasixAssessment', title: 'NatHERS & BASIX' },
        'Waste Management': { id: 'wasteManagementAssessment', title: 'Waste Management' },
        'Cost Estimate': { id: 'costEstimateAssessment', title: 'Cost Estimate' },
        Stormwater: { id: 'stormwaterAssessment', title: 'Stormwater' },
        Traffic: { id: 'trafficAssessment', title: 'Traffic' },
        Surveyor: { id: 'surveyorAssessment', title: 'Surveyor' },
        Bushfire: { id: 'bushfireAssessment', title: 'Bushfire' },
        Flooding: { id: 'floodingAssessment', title: 'Flooding' },
        Acoustic: { id: 'acousticAssessment', title: 'Acoustic' },
        Landscaping: { id: 'landscapingAssessment', title: 'Landscaping' },
        Heritage: { id: 'heritageAssessment', title: 'Heritage' },
        Biodiversity: { id: 'biodiversityAssessment', title: 'Biodiversity' },
        Lawyer: { id: 'lawyerAssessment', title: 'Lawyer' },
        Certifiers: { id: 'certifiersAssessment', title: 'Certifiers' },
        Arborist: { id: 'arboristAssessment', title: 'Arborist' },
        Geotechnical: { id: 'geotechnicalAssessment', title: 'Geotechnical' },
      };
      const docInfo = categoryToDocumentId[newTicket.category] || {
        id:
          newTicket.category
            .replace(/\s+/g, '')
            .replace(/&/g, '')
            .replace(/[^a-zA-Z0-9]/g, '') + 'Assessment',
        title: newTicket.category,
      };
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
          ...metadata,
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
      // Update the job's consultants field for this category with assessment status 'paid'
      console.log('Updating job consultants field for jobId:', newTicket.jobId);
      try {
        const job = getJob(newTicket.jobId);
        console.log('Retrieved job:', job ? 'found' : 'not found');
        if (job) {
          job.consultants = job.consultants ?? {};

          // Initialize the consultants array for this category if it doesn't exist
          if (!job.consultants[newTicket.category]) {
            job.consultants[newTicket.category] = [];
          } else if (!Array.isArray(job.consultants[newTicket.category])) {
            // If it exists but is not an array, convert it to an array
            job.consultants[newTicket.category] = [job.consultants[newTicket.category] as any];
          }

          // Ensure the array exists and find the consultant by consultantId
          const consultantsArray = job.consultants[newTicket.category] as Array<{
            name: string;
            notes: string;
            consultantId: string;
            assessment?: Assessment;
          }>;

          const consultantIndex = consultantsArray.findIndex(
            c => c.consultantId === newTicket.consultantId
          );

          const consultantData = {
            name: newTicket.consultantName,
            notes: '',
            consultantId: newTicket.consultantId,
            assessment: {
              ...newTicket.assessment,
              status: 'paid' as const,
              createdAt: now,
              updatedAt: now,
            },
          };

          if (consultantIndex === -1) {
            // Add new consultant to the array
            consultantsArray.push(consultantData);
            console.log('Added new consultant to job');
          } else {
            // Update existing consultant
            consultantsArray[consultantIndex] = {
              ...consultantsArray[consultantIndex],
              ...consultantData,
            };
            console.log('Updated existing consultant in job');
          }

          await saveJob(newTicket.jobId, job);
          console.log('Job saved successfully');
        }
      } catch (err) {
        console.error('Error updating job consultants assessment field:', err);
      }
    }

    // Read existing tickets
    console.log('Reading existing consultant work orders');
    const tickets = await readConsultantWorkOrders();
    console.log('Found existing tickets:', tickets.length);

    // Add new ticket
    tickets.push(newTicket);
    console.log('Added new ticket to array, total tickets:', tickets.length);

    // Save updated tickets
    console.log('Saving updated tickets to file');
    await writeConsultantWorkOrders(tickets);
    console.log('Tickets saved successfully');

    console.log('=== CONSULTANT WORK ORDER CREATION SUCCESS ===');
    return NextResponse.json(newTicket);
  } catch (error) {
    console.error('=== CONSULTANT WORK ORDER CREATION ERROR ===');
    console.error('Error creating consultant ticket:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ error: 'Failed to create consultant ticket' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const tickets = await readConsultantWorkOrders();
    return NextResponse.json(tickets);
  } catch (error) {
    console.error('Error fetching consultant tickets:', error);
    return NextResponse.json({ error: 'Failed to fetch consultant tickets' }, { status: 500 });
  }
}
