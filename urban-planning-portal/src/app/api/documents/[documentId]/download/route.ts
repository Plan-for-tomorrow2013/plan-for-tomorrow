import { NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import path from 'path'
import { existsSync } from 'fs'
import { getDocumentsMetadataPath, getDocumentPath } from '@shared/utils/paths'

export async function GET(
  request: Request,
  { params }: { params: { documentId: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const jobId = searchParams.get('jobId')

    if (!jobId) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 })
    }

    const metadataPath = getDocumentsMetadataPath()
    if (!existsSync(metadataPath)) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    const metadata = await readFile(metadataPath, 'utf-8')
    const documents = JSON.parse(metadata)
    const document = documents.find((doc: any) => doc.id === params.documentId && doc.metadata?.jobId === jobId)

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    const currentVersion = document.versions[document.currentVersion - 1]
    const filePath = getDocumentPath(params.documentId, currentVersion.version, path.extname(currentVersion.fileName))
    if (!existsSync(filePath)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    const buffer = await readFile(filePath)
    const headers = new Headers()
    headers.set('Content-Type', currentVersion.type)
    headers.set('Content-Disposition', `attachment; fileName="${currentVersion.originalName}"`)

    return new NextResponse(buffer, { headers })
  } catch (error) {
    console.error('Error downloading document:', error)
    return NextResponse.json({ error: 'Failed to download document' }, { status: 500 })
  }
}
