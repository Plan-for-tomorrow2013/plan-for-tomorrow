import { NextResponse } from 'next/server'
import { getJob } from '@/lib/jobStorage'

interface StoredDocument {
  filename: string
  originalName: string
  type: string
  uploadedAt: string
}

interface DocumentResponse extends StoredDocument {
  id: string
  status: 'uploaded'
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const job = await getJob(params.id)
    
    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      )
    }

    // Convert documents object to array format expected by the frontend
    const documents: DocumentResponse[] = Object.entries(job.documents || {}).map(([id, doc]) => ({
      id,
      status: 'uploaded',
      filename: (doc as StoredDocument).filename,
      originalName: (doc as StoredDocument).originalName,
      type: (doc as StoredDocument).type,
      uploadedAt: (doc as StoredDocument).uploadedAt
    }))

    return NextResponse.json(documents)
  } catch (error) {
    console.error('Error fetching documents:', error)
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    )
  }
} 