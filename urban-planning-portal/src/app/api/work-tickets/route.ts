import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { WorkTicket } from '@shared/types/workTickets'
import { getWorkTicketsPath, getDocumentsPath, getDocumentPath, getDocumentsMetadataPath } from '@shared/utils/paths'
import { Document, DocumentVersion } from '@shared/types/documents'

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
    filename: path.basename(filePath),
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
    category: 'WORK_TICKET',
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
    const formData = await request.formData()
    const file = formData.get('file') as File
    const metadata = JSON.parse(formData.get('metadata') as string)

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Create new work ticket
    const newTicket: WorkTicket = {
      id: uuidv4(),
      jobId: metadata.jobId,
      jobAddress: metadata.jobAddress,
      ticketType: metadata.ticketType,
      status: 'pending',
      createdAt: new Date().toISOString()
    }

    // Create associated document
    const document = await createDocumentFromWorkTicket(newTicket, file, metadata)

    // Update ticket with document reference
    newTicket.completedDocument = {
      fileName: document.versions[0].filename,
      originalName: document.versions[0].originalName,
      uploadedAt: document.versions[0].uploadedAt
    }

    // Read existing tickets
    const tickets = await readWorkTickets()

    // Add new ticket
    tickets.push(newTicket)

    // Save updated tickets
    await writeWorkTickets(tickets)

    return NextResponse.json(newTicket)
  } catch (error) {
    console.error('Error creating work ticket:', error)
    return NextResponse.json(
      { error: 'Failed to create work ticket' },
      { status: 500 }
    )
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
