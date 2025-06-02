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

    // Use a document key like 'pre-prepared-initial-${assessment.id}'
    const docKey = `pre-prepared-initial-${assessment.id}`;
    // Use the actual file name for fileName and originalName
    const fileName = assessment.file.fileName || assessment.file.originalName;
    const originalName = assessment.file.originalName;
    const fileType = assessment.file.type || 'application/pdf';
    const fileSize = assessment.file.size || 0;

    // Set savedPath to the API route (for consistency with working logic)
    const savedPath = `/api/pre-prepared-initial-assessments/${assessment.id}/download`;

    // Initialize or update purchasedPrePreparedInitialAssessments and documents in one update
    const updatedJob = {
      ...job,
      purchasedPrePreparedInitialAssessments: {
        ...(job.purchasedPrePreparedInitialAssessments || {}),
        [assessment.id]: purchasedAssessment
      },
      documents: {
        ...(job.documents || {}),
        [docKey]: {
          fileName,
          originalName,
          type: fileType,
          uploadedAt: new Date().toISOString(),
          size: fileSize,
          savedPath
        }
      }
    }

    // Save the updated job
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
