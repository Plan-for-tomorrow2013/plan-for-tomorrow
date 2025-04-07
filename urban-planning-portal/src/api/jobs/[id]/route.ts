import { NextResponse } from 'next/server'
import { getJob, deleteJob, saveJob } from '../../../../lib/jobStorage'
import { promises as fs } from 'fs'
import path from 'path'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const jobPath = path.join(process.cwd(), 'data', 'jobs', `${params.id}.json`)
    const jobData = await fs.readFile(jobPath, 'utf8')
    return NextResponse.json(JSON.parse(jobData))
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch job data' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const jobPath = path.join(process.cwd(), 'data', 'jobs', `${params.id}.json`)
    const jobData = await fs.readFile(jobPath, 'utf8')
    const currentJob = JSON.parse(jobData)
    const updates = await request.json()

    // Merge updates with current job data
    const updatedJob = {
      ...currentJob,
      initialAssessment: {
        ...currentJob.initialAssessment,
        ...updates.initialAssessment
      }
    }

    // Write updated job data back to file
    await fs.writeFile(jobPath, JSON.stringify(updatedJob, null, 2))

    return NextResponse.json(updatedJob)
  } catch (error) {
    console.error('Error updating job:', error)
    return NextResponse.json(
      { error: 'Failed to update job data' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await deleteJob(params.id)
    return NextResponse.json({ message: 'Job deleted successfully' })
  } catch (error) {
    console.error('Error deleting job:', error)
    return NextResponse.json(
      { error: 'Failed to delete job' },
      { status: 500 }
    )
  }
}
