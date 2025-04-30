import { NextRequest, NextResponse } from 'next/server'
import { DocumentUpload, DocumentUploadResponse } from '@shared/types/documents'
import { documentService } from '../../../../../../lib/services/documentService'

export async function POST(request: NextRequest): Promise<NextResponse<DocumentUploadResponse>> {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const metadata = JSON.parse(formData.get('metadata') as string)

    if (!file || !metadata) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const upload: DocumentUpload = {
      file,
      type: metadata.type,
      jobId: metadata.jobId,
      metadata: metadata
    }

    const document = await documentService.uploadDocument(upload)
    return NextResponse.json({ success: true, document })
  } catch (error) {
    console.error('Error uploading document:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to upload document' },
      { status: 500 }
    )
  }
}
