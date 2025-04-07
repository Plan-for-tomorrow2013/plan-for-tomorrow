import { NextResponse } from 'next/server'
import { getJob, saveJob } from '../../../../../lib/jobStorage'
import { InitialAssessment } from '../../../../types/documents'

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const assessment: InitialAssessment = await request.json()
    const job = await getJob(params.id)

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      )
    }

    // Update the job with initial assessment data
    const updatedJob = {
      ...job,
      initialAssessment: {
        ...assessment,
        updatedAt: new Date().toISOString()
      }
    }

    await saveJob(params.id, updatedJob)

    return NextResponse.json({
      success: true,
      initialAssessment: updatedJob.initialAssessment
    })
  } catch (error) {
    console.error('Error saving initial assessment:', error)
    return NextResponse.json(
      { error: 'Failed to save initial assessment' },
      { status: 500 }
    )
  }
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

    return NextResponse.json({
      success: true,
      initialAssessment: job.initialAssessment || null
    })
  } catch (error) {
    console.error('Error fetching initial assessment:', error)
    return NextResponse.json(
      { error: 'Failed to fetch initial assessment' },
      { status: 500 }
    )
  }
}
