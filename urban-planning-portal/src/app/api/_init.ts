import { existsSync, mkdirSync } from 'fs'
import { getPortalPath, getDataPath, getJobsPath, getJobDocumentsPath } from '@shared/utils/paths'

// Initialize required directories for the application
export function initializeDataDirectories() {
  const portalDir = getPortalPath()
  const dataDir = getDataPath()
  const jobsDir = getJobsPath()

  try {
    // Create directory structure
    [portalDir, dataDir, jobsDir].forEach(dir => {
      if (!existsSync(dir)) {
        console.log(`Creating directory: ${dir}`)
        mkdirSync(dir, { recursive: true })
      }
    })

    return true
  } catch (error) {
    console.error('Error initializing data directories:', error)
    console.error('Attempted paths:', { portalDir, dataDir, jobsDir })
    return false
  }
}

// Validate job directory structure
export function validateJobDirectory(jobId: string) {
  const jobDir = getJobDocumentsPath(jobId)

  try {
    if (!existsSync(jobDir)) {
      console.log(`Creating job documents directory: ${jobDir}`)
      mkdirSync(jobDir, { recursive: true })
    }
    return true
  } catch (error) {
    console.error(`Error validating job directory for ${jobId}:`, error)
    return false
  }
}

// Initialize directories when this module is imported
initializeDataDirectories()
