import { promises as fsPromises } from 'fs'
import { existsSync, mkdirSync, writeFileSync, readFileSync, readdirSync, unlinkSync } from 'fs'
import path from 'path'
import { Job } from '../types/jobs'
import { getJobsPath, getJobPath, getJobDocumentsPath } from '../utils/paths'

// Ensure the jobs directory exists
try {
  const jobsDir = getJobsPath()
  if (!existsSync(jobsDir)) {
    mkdirSync(jobsDir, { recursive: true })
    console.log('Created jobs directory at:', jobsDir)
  }
} catch (error) {
  console.error('Error creating jobs directory:', error)
}

export async function saveJob(jobId: string, jobData: Job): Promise<void> {
  try {
    const jobPath = getJobPath(jobId)
    const jobDir = getJobDocumentsPath(jobId)

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

export function getJob(jobId: string): Job {
  try {
    const jobPath = getJobPath(jobId)
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

export function getAllJobs(): Job[] {
  try {
    const jobsDir = getJobsPath()
    if (!existsSync(jobsDir)) {
      return []
    }

    const files = readdirSync(jobsDir).filter(file => file.endsWith('.json'))
    return files.map(file => {
      const jobPath = path.join(jobsDir, file)
      const jobData = readFileSync(jobPath, 'utf-8')
      return JSON.parse(jobData)
    })
  } catch (error) {
    console.error('Error getting all jobs:', error)
    throw error
  }
}

export async function deleteJob(jobId: string): Promise<void> {
  const jobPath = getJobPath(jobId)

  // Check if job exists
  if (!existsSync(jobPath)) {
    throw new Error(`Job ${jobId} not found`)
  }

  try {
    // Delete the job file
    unlinkSync(jobPath)

    // Delete associated documents directory if it exists
    const documentsPath = getJobDocumentsPath(jobId)
    if (existsSync(documentsPath)) {
      await fsPromises.rm(documentsPath, { recursive: true, force: true })
    }

    // Delete the job directory if it exists
    const jobDirPath = path.dirname(documentsPath)
    if (existsSync(jobDirPath)) {
      await fsPromises.rm(jobDirPath, { recursive: true, force: true })
    }
  } catch (error) {
    console.error(`Error deleting job ${jobId}:`, error)
    throw new Error(`Failed to delete job ${jobId}`)
  }
}
