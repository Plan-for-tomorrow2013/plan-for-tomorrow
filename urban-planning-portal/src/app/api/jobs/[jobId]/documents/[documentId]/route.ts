import { NextResponse } from 'next/server'
import { getJob, saveJob } from '@shared/services/jobStorage'
import fs from 'fs/promises'
import path from 'path'
import { PurchasedPrePreparedAssessments } from '@shared/types/jobs'

export async function DELETE(
  request: Request,
  { params }: { params: { jobId: string; documentId: string } }
) {
  try {
    const job = await getJob(params.jobId)
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    // Remove document from job's documents
    if (job.documents && job.documents[params.documentId]) {
      const documentPath = path.join(process.cwd(), 'data', 'jobs', params.jobId, 'documents', job.documents[params.documentId].fileName)

      try {
        await fs.unlink(documentPath)
      } catch (error) {
        console.error('Error deleting file:', error)
      }

      delete job.documents[params.documentId]

      // Clean up document references from all assessment types
      if (job.customAssessment?.uploadedDocuments?.[params.documentId]) {
        delete job.customAssessment.uploadedDocuments[params.documentId]
      }
      if (job.statementOfEnvironmentalEffects?.uploadedDocuments?.[params.documentId]) {
        delete job.statementOfEnvironmentalEffects.uploadedDocuments[params.documentId]
      }
      if (job.complyingDevelopmentCertificate?.uploadedDocuments?.[params.documentId]) {
        delete job.complyingDevelopmentCertificate.uploadedDocuments[params.documentId]
      }
      if (job.purchasedPrePreparedAssessments) {
        const assessments = job.purchasedPrePreparedAssessments
        Object.entries(assessments).forEach(([key, assessment]) => {
          if ((assessment as PurchasedPrePreparedAssessments).file?.id === params.documentId) {
            delete assessments[key].file
          }
        })
      }

      await saveJob(params.jobId, job)
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
