import fs from 'fs/promises'
import path from 'path'
import { Job } from '../types/jobs'

const JOBS_DIR = path.join(process.cwd(), 'data', 'jobs')

async function ensureJobsDirectory() {
  try {
    await fs.mkdir(JOBS_DIR, { recursive: true })
  } catch (error) {
    console.error('Error creating jobs directory:', error)
  }
}

export async function getJob(jobId: string): Promise<Job | null> {
  try {
    await ensureJobsDirectory()
    const jobPath = path.join(JOBS_DIR, `${jobId}.json`)
    const data = await fs.readFile(jobPath, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error reading job:', error)
    return null
  }
}

export async function saveJob(jobId: string, job: Job): Promise<void> {
  try {
    await ensureJobsDirectory()
    const jobPath = path.join(JOBS_DIR, `${jobId}.json`)
    await fs.writeFile(jobPath, JSON.stringify(job, null, 2))
  } catch (error) {
    console.error('Error saving job:', error)
    throw error
  }
}
