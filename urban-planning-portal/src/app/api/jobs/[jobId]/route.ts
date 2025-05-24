import { NextResponse } from 'next/server'
// Removed unused getJob, saveJob from jobStorage (using fs directly or path utils)
import { deleteJob } from '@shared/services/jobStorage'
import { promises as fs, existsSync } from 'fs' // Import existsSync from fs
import { getJobPath, getJobsPath } from '@shared/utils/paths' // Import getJobsPath as well
import { readFile, writeFile, mkdir } from 'fs/promises'
// Removed unused path import
import { Job } from '@shared/types/jobs'

// Ensure jobs directory exists using path utility
async function ensureDirectoryExists() {
  const jobsDir = getJobsPath() // Use utility
  if (!existsSync(jobsDir)) {
    await mkdir(jobsDir, { recursive: true })
  }
}

export async function GET(
  request: Request,
  { params }: { params: { jobId: string } }
) {
  try {
    // No need to ensure directory here, getJobPath implies base structure
    const jobPath = getJobPath(params.jobId) // Use utility

    if (!existsSync(jobPath)) {
      console.error(`Job not found at expected path: ${jobPath}`) // Add log
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    const jobData = await readFile(jobPath, 'utf-8')
    const job = JSON.parse(jobData)

    // console.log(`[API GET JobId ${params.jobId}] Job data read from ${jobPath}:`, JSON.stringify(job, null, 2));
    // console.log('Job loaded:', job); // Original log, can be removed or kept
    if (job.completedDocument) {
      // console.log(`[API GET JobId ${params.jobId}] Found completedDocument:`, job.completedDocument);
    }

    // Surface completedDocument into the relevant report property for the frontend
    if (job.completedDocument && job.completedDocument.documentId === 'statementOfEnvironmentalEffects') {
      if (job.statementOfEnvironmentalEffects) {
        job.statementOfEnvironmentalEffects.fileName = job.completedDocument.fileName;
        job.statementOfEnvironmentalEffects.originalName = job.completedDocument.originalName;
        job.statementOfEnvironmentalEffects.uploadedAt = job.completedDocument.uploadedAt;
        job.statementOfEnvironmentalEffects.size = job.completedDocument.size;
        job.statementOfEnvironmentalEffects.type = job.completedDocument.type;
        job.statementOfEnvironmentalEffects.status = 'completed';
        // console.log('SURFACED (direct):', job.statementOfEnvironmentalEffects);
      }
    }

    // console.log('Job after surfacing:', job);

    return NextResponse.json(job)
  } catch (error) {
    // console.error('Error getting job:', error)
    return NextResponse.json({ error: 'Failed to get job' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { jobId: string } }
) {
  try {
    // No need to ensure directory here, getJobPath implies base structure
    const jobPath = getJobPath(params.jobId) // Use utility
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
  { params }: { params: { jobId: string } }
) {
  try {
    const jobPath = getJobPath(params.jobId)
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
