import { NextResponse } from 'next/server'
import { writeFile, mkdir, readFile, unlink } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { Document, DocumentVersion } from '@shared/types/documents'
import { getDocumentsPath, getDocumentsMetadataPath, getDocumentPath, MAX_FILE_SIZE } from '@shared/utils/paths'

// Ensure documents directory exists
async function ensureDirectoryExists() {
  const documentsDir = getDocumentsPath()
  if (!existsSync(documentsDir)) {
    await mkdir(documentsDir, { recursive: true })
  }
}

export async function GET(request: Request) {
  try {
    await ensureDirectoryExists()
    const metadataPath = getDocumentsMetadataPath()

    try {
      const metadata = await readFile(metadataPath, 'utf-8')
      const documents = JSON.parse(metadata)
      return NextResponse.json(documents)
    } catch (error) {
      return NextResponse.json([])
    }
  } catch (error) {
    console.error('Error getting documents:', error)
    return NextResponse.json({ error: 'Failed to get documents' }, { status: 500 })
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

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File size exceeds 20MB limit' }, { status: 400 })
    }

    const documentId = uuidv4()
    const version = 1
    const extension = path.extname(file.name)
    const filePath = getDocumentPath(documentId, version, extension)

    // Save the file
    const buffer = Buffer.from(await file.arrayBuffer())
    await writeFile(filePath, buffer)

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
      title: metadata.title || file.name,
      path: metadata.path || '',
      type: metadata.type || 'document',
      category: metadata.category || 'general',
      versions: [documentVersion],
      currentVersion: version,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true,
      metadata: {
        jobId: metadata.jobId,
        ...metadata
      }
    }

    // Save metadata
    const metadataPath = getDocumentsMetadataPath()
    try {
      const existingMetadata = await readFile(metadataPath, 'utf-8')
      const documents = JSON.parse(existingMetadata)
      documents.push(document)
      await writeFile(metadataPath, JSON.stringify(documents, null, 2))
    } catch (error) {
      await writeFile(metadataPath, JSON.stringify([document], null, 2))
    }

    return NextResponse.json(document)
  } catch (error) {
    console.error('Error uploading document:', error)
    return NextResponse.json({ error: 'Failed to upload document' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const documentId = searchParams.get('documentId')
    const jobId = searchParams.get('jobId')

    if (!documentId) {
      return NextResponse.json({ error: 'Document ID is required' }, { status: 400 })
    }

    const metadataPath = getDocumentsMetadataPath()
    const metadata = await readFile(metadataPath, 'utf-8')
    const documents = JSON.parse(metadata)

    const document = documents.find((doc: Document) => doc.id === documentId)
    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // Remove file
    const currentVersion = document.versions[document.currentVersion - 1]
    const filePath = getDocumentPath(documentId, currentVersion.version, path.extname(currentVersion.filename))
    await unlink(filePath)

    // Update metadata
    const updatedDocuments = documents.filter((doc: Document) => doc.id !== documentId)
    await writeFile(metadataPath, JSON.stringify(updatedDocuments, null, 2))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting document:', error)
    return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 })
  }
}
