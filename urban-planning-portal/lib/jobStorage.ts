import { promises as fsPromises } from 'fs'
import { existsSync, mkdirSync, writeFileSync, readFileSync, readdirSync, unlinkSync } from 'fs'
import path from 'path'

const JOBS_DIR = path.join(process.cwd(), 'data', 'jobs')

// Create jobs directory if it doesn't exist
if (!existsSync(JOBS_DIR)) {
  mkdirSync(JOBS_DIR, { recursive: true })
}

export async function saveJob(jobId: string, jobData: any): Promise<void> {
  try {
    const jobPath = path.join(JOBS_DIR, `${jobId}.json`)
    const jobDir = path.join(JOBS_DIR, jobId)

    // Create job directory if it doesn't exist
    if (!existsSync(jobDir)) {
      mkdirSync(jobDir, { recursive: true })
    }

    writeFileSync(jobPath, JSON.stringify(jobData, null, 2))
  } catch (error) {
    console.error(`Error saving job ${jobId}:`, error)
    throw error
  }
}

export function getJob(jobId: string): any {
  try {
    const jobPath = path.join(JOBS_DIR, `${jobId}.json`)
    if (!existsSync(jobPath)) {
      throw new Error(`Job ${jobId} not found`)
    }

    const jobData = readFileSync(jobPath, 'utf-8')
    return JSON.parse(jobData)
  } catch (error) {
    console.error(`Error getting job ${jobId}:`, error)
    throw error
  }
}

export function getAllJobs(): any[] {
  try {
    if (!existsSync(JOBS_DIR)) {
      return []
    }

    const files = readdirSync(JOBS_DIR).filter(file => file.endsWith('.json'))
    return files.map(file => {
      const jobPath = path.join(JOBS_DIR, file)
      const jobData = readFileSync(jobPath, 'utf-8')
      return JSON.parse(jobData)
    })
  } catch (error) {
    console.error('Error getting all jobs:', error)
    throw error
  }
}

export async function deleteJob(jobId: string): Promise<void> {
  const jobPath = path.join(JOBS_DIR, `${jobId}.json`)
  
  // Check if job exists
  if (!existsSync(jobPath)) {
    throw new Error(`Job ${jobId} not found`)
  }

  try {
    // Delete the job file
    unlinkSync(jobPath)

    // Delete associated documents directory if it exists
    const documentsPath = path.join(JOBS_DIR, jobId, 'documents')
    if (existsSync(documentsPath)) {
      await fsPromises.rm(documentsPath, { recursive: true, force: true })
    }

    // Delete the job directory if it exists
    const jobDirPath = path.join(JOBS_DIR, jobId)
    if (existsSync(jobDirPath)) {
      await fsPromises.rm(jobDirPath, { recursive: true, force: true })
    }
  } catch (error) {
    console.error(`Error deleting job ${jobId}:`, error)
    throw new Error(`Failed to delete job ${jobId}`)
  }
} 