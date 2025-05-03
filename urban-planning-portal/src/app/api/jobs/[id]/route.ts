import { NextResponse } from 'next/server'
import { getJob, deleteJob, saveJob } from '@shared/services/jobStorage'
import { promises as fs } from 'fs'
import { getJobPath } from '@shared/utils/paths'
import { readFile, writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { Job } from '@shared/types/jobs'

const JOBS_DIR = path.join(process.cwd(), 'data', 'jobs')

// Ensure jobs directory exists
async function ensureDirectoryExists() {
  if (!existsSync(JOBS_DIR)) {
    await mkdir(JOBS_DIR, { recursive: true })
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await ensureDirectoryExists()
    const jobPath = path.join(JOBS_DIR, `${params.id}.json`)

    if (!existsSync(jobPath)) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    const jobData = await readFile(jobPath, 'utf-8')
    return NextResponse.json(JSON.parse(jobData))
  } catch (error) {
    console.error('Error getting job:', error)
    return NextResponse.json({ error: 'Failed to get job' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await ensureDirectoryExists()
    const jobPath = path.join(JOBS_DIR, `${params.id}.json`)
    const jobData = await request.json()

    await writeFile(jobPath, JSON.stringify(jobData, null, 2))
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving job:', error)
    return NextResponse.json({ error: 'Failed to save job' }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const jobPath = getJobPath(params.id)
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
