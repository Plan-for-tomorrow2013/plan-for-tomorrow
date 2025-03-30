import { NextResponse } from 'next/server'
import { writeFile, readFile, mkdir } from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { Document, DocumentVersion } from '@/types/documents'

const DOCUMENTS_DIR = path.join(process.cwd(), 'data', 'documents')

async function ensureDirectoryExists() {
  try {
    await mkdir(DOCUMENTS_DIR, { recursive: true })
  } catch (error) {
    console.error('Error creating directory:', error)
    throw error
  }
}

export async function GET() {
  try {
    await ensureDirectoryExists()
    const metadataPath = path.join(DOCUMENTS_DIR, 'metadata.json')
    
    try {
      const documents = await readFile(metadataPath, 'utf-8')
      return NextResponse.json(JSON.parse(documents))
    } catch (error) {
      // If metadata.json doesn't exist, return empty array
      return NextResponse.json([])
    }
  } catch (error) {
    console.error('Error fetching documents:', error)
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    await ensureDirectoryExists()
    const formData = await request.formData()
    const file = formData.get('file') as File
    const metadata = JSON.parse(formData.get('metadata') as string)

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const documentId = uuidv4()
    const version = 1
    const filename = `${documentId}-v${version}${path.extname(file.name)}`
    const filePath = path.join(DOCUMENTS_DIR, filename)

    // Save the file
    const buffer = Buffer.from(await file.arrayBuffer())
    await writeFile(filePath, buffer)

    // Create document version
    const documentVersion: DocumentVersion = {
      version,
      uploadedAt: new Date().toISOString(),
      filename,
      originalName: file.name,
      size: file.size,
      uploadedBy: metadata.uploadedBy || 'system'
    }

    // Create document metadata
    const document: Document = {
      id: documentId,
      title: metadata.title,
      path: metadata.path,
      type: metadata.type || 'document',
      category: metadata.category || 'general',
      versions: [documentVersion],
      currentVersion: version,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true,
      required: metadata.required,
      adminOnly: metadata.adminOnly
    }

    // Save metadata
    const metadataPath = path.join(DOCUMENTS_DIR, 'metadata.json')
    try {
      const existingMetadata = await readFile(metadataPath, 'utf-8')
      const documents = JSON.parse(existingMetadata)
      documents.push(document)
      await writeFile(metadataPath, JSON.stringify(documents, null, 2))
    } catch (error) {
      // If metadata.json doesn't exist, create it with the first document
      await writeFile(metadataPath, JSON.stringify([document], null, 2))
    }

    return NextResponse.json(document)
  } catch (error) {
    console.error('Error uploading document:', error)
    return NextResponse.json({ error: 'Failed to upload document' }, { status: 500 })
  }
} 