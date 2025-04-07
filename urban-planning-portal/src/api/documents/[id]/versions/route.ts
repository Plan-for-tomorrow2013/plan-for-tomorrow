import { NextResponse } from 'next/server'
import { readFile, writeFile } from 'fs/promises'
import path from 'path'
import { Document, DocumentVersion } from '../../../../types/documents'

const DOCUMENTS_DIR = path.join(process.cwd(), 'data', 'documents')

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const metadataPath = path.join(DOCUMENTS_DIR, 'metadata.json')
    const documents = JSON.parse(await readFile(metadataPath, 'utf-8'))
    const document = documents.find((doc: Document) => doc.id === params.id)

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    return NextResponse.json(document.versions)
  } catch (error) {
    console.error('Error fetching document versions:', error)
    return NextResponse.json({ error: 'Failed to fetch document versions' }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const metadata = JSON.parse(formData.get('metadata') as string)

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const metadataPath = path.join(DOCUMENTS_DIR, 'metadata.json')
    const documents = JSON.parse(await readFile(metadataPath, 'utf-8'))
    const documentIndex = documents.findIndex((doc: Document) => doc.id === params.id)

    if (documentIndex === -1) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    const document = documents[documentIndex]
    const newVersion = document.currentVersion + 1
    const filename = `${document.id}-v${newVersion}${path.extname(file.name)}`
    const filePath = path.join(DOCUMENTS_DIR, filename)

    // Save the new version
    const buffer = Buffer.from(await file.arrayBuffer())
    await writeFile(filePath, buffer)

    // Create new version
    const documentVersion: DocumentVersion = {
      version: newVersion,
      uploadedAt: new Date().toISOString(),
      filename,
      originalName: file.name,
      size: file.size,
      uploadedBy: metadata.uploadedBy || 'system'
    }

    // Update document metadata
    document.versions.push(documentVersion)
    document.currentVersion = newVersion
    document.updatedAt = new Date().toISOString()

    // Save updated metadata
    await writeFile(metadataPath, JSON.stringify(documents, null, 2))

    return NextResponse.json(documentVersion)
  } catch (error) {
    console.error('Error creating document version:', error)
    return NextResponse.json({ error: 'Failed to create document version' }, { status: 500 })
  }
}
