import { Job } from '../types/jobs'

class JobService {
  private static instance: JobService
  private constructor() {}

  static getInstance(): JobService {
    if (!JobService.instance) {
      JobService.instance = new JobService()
    }
    return JobService.instance
  }

  async getJob(jobId: string): Promise<Job> {
    try {
      const response = await fetch(`/api/jobs/${jobId}`)
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to fetch job')
      }
      return response.json()
    } catch (error) {
      console.error('Error getting job:', error)
      throw error
    }
  }

  async saveJob(jobId: string, jobData: Job): Promise<void> {
    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jobData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save job')
      }
    } catch (error) {
      console.error('Error saving job:', error)
      throw error
    }
  }
}

export const jobService = JobService.getInstance()
