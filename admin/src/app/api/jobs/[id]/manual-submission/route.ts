import { NextResponse } from 'next/server'
import { getJob, saveJob } from '../../../../../../lib/jobStorage'

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const manualSubmission = await request.json()
    const job = await getJob(params.id)

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      )
    }

    // Update the job with manual submission data
    const updatedJob = {
      ...job,
      manualSubmission: {
        ...manualSubmission,
        updatedAt: new Date().toISOString()
      }
    }

    await saveJob(params.id, updatedJob)

    return NextResponse.json({
      success: true,
      manualSubmission: updatedJob.manualSubmission
    })
  } catch (error) {
    console.error('Error saving manual submission:', error)
    return NextResponse.json(
      { error: 'Failed to save manual submission' },
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
      manualSubmission: job.manualSubmission || null
    })
  } catch (error) {
    console.error('Error fetching manual submission:', error)
    return NextResponse.json(
      { error: 'Failed to fetch manual submission' },
      { status: 500 }
    )
  }
}
