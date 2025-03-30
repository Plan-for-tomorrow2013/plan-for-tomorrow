import { NextResponse } from 'next/server'
import { getJob, saveJob } from '@/lib/jobStorage'
import fs from 'fs/promises'
import path from 'path'

export async function DELETE(
  request: Request,
  { params }: { params: { id: string; documentId: string } }
) {
  try {
    const job = await getJob(params.id)
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    // Remove document from job's documents
    if (job.documents && job.documents[params.documentId]) {
      const documentPath = path.join(process.cwd(), 'data', 'jobs', params.id, 'documents', job.documents[params.documentId].filename)
      
      try {
        await fs.unlink(documentPath)
      } catch (error) {
        console.error('Error deleting file:', error)
      }

      delete job.documents[params.documentId]

      // Also remove from initial assessment if it exists
      if (job.initialAssessment?.uploadedDocuments?.[params.documentId]) {
        delete job.initialAssessment.uploadedDocuments[params.documentId]
      }

      await saveJob(params.id, job)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting document:', error)
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    )
  }
} 