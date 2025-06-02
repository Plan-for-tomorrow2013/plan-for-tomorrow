import { NextResponse } from 'next/server'
import { getJob, saveJob } from '@shared/services/jobStorage'

export async function POST(
  request: Request,
  { params }: { params: { jobId: string } }
) {
  try {
    const jobId = params.jobId
    const { assessment } = await request.json()

    // Get the current job data
    const job = getJob(jobId)
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    // Add the purchased assessment to the job
    const purchasedAssessment = {
      id: assessment.id,
      section: assessment.section,
      title: assessment.title,
      content: assessment.content,
      date: assessment.date, // Original assessment date
      author: assessment.author,
      purchaseDate: new Date().toISOString(),
      file: assessment.file,
      status: 'completed' // Mark as completed upon purchase
    }

    // Initialize or update purchasedPrePreparedInitialAssessments and documents in one update
    const updatedJob = {
      ...job,
      purchasedPrePreparedInitialAssessments: {
        ...(job.purchasedPrePreparedInitialAssessments || {}),
        [assessment.id]: purchasedAssessment
      },
      // Add to documents store using file.id as the key
      documents: {
        ...(job.documents || {}),
        [assessment.file.id]: {
          fileName: assessment.file.id,
          originalName: assessment.file.originalName,
          type: assessment.file.type || 'application/pdf',
          uploadedAt: new Date().toISOString(),
          size: assessment.file.size || 0,
          savedPath: `/api/pre-prepared-initial-assessments/${assessment.id}/download`
        }
      }
    }

    // Save the updated job
    // console.log('[API POST purchase] updatedJob before saveJob:', JSON.stringify(updatedJob, null, 2));
    await saveJob(jobId, updatedJob)

    return NextResponse.json({
      success: true,
      purchasedAssessment,
      documents: updatedJob.documents
    })
  } catch (error) {
    console.error('Error purchasing pre-prepared initial assessments:', error)
    return NextResponse.json(
      { error: 'Failed to purchase assessment' },
      { status: 500 }
    )
  }
}
