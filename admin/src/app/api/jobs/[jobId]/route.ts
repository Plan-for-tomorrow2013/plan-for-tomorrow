import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { deleteJob } from '@shared/services/jobStorage'
export async function GET(
  request: Request,
  { params }: { params: { jobId: string } }
) {
  try {
    const jobPath = path.join(process.cwd(), 'data', 'jobs', `${params.jobId}.json`)
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
  { params }: { params: { jobId: string } }
) {
  try {
    const jobPath = path.join(process.cwd(), 'data', 'jobs', `${params.jobId}.json`)
    const jobData = await fs.readFile(jobPath, 'utf8')
    const currentJob = JSON.parse(jobData)
    const updates = await request.json()

    // Merge updates with current job data - Generic merge
    const updatedJob = { ...currentJob, ...updates };

    // Handle all assessment types consistently
    const assessmentTypes = ['customAssessment', 'statementOfEnvironmentalEffects', 'complyingDevelopmentCertificate'];

    for (const type of assessmentTypes) {
      if (updates[type]) {
        const update = updates[type];
        updatedJob[type] = {
          ...currentJob[type],
          ...update,
          status: update.status || currentJob[type]?.status,
        };
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
  { params }: { params: { jobId: string } }
) {
  try {
    await deleteJob(params.jobId)
    return NextResponse.json({ message: 'Job deleted successfully' })
  } catch (error) {
    console.error('Error deleting job:', error)
    return NextResponse.json(
      { error: 'Failed to delete job' },
      { status: 500 }
    )
  }
}
