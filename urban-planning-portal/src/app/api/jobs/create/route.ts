import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { Job } from '@shared/types/jobs'
import { getJobPath, getJobsPath, getDocumentsPath } from '@shared/utils/paths' // Import path utilities

// Ensure directories exist using path utilities
async function ensureDirectoriesExist() {
  const jobsDir = getJobsPath()
  const documentsDir = getDocumentsPath()
  if (!existsSync(jobsDir)) {
    await mkdir(jobsDir, { recursive: true })
  }
  if (!existsSync(documentsDir)) {
    await mkdir(documentsDir, { recursive: true })
  }
}

export async function POST(request: Request) {
  try {
    await ensureDirectoriesExist()
    const data = await request.json()
    const jobId = uuidv4()

    // Create a new job with the property search data and proper document structure
    const job: Job = {
      id: jobId,
      address: data.address,
      council: data.council,
      currentStage: 'design-check',
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      propertyData: {
        coordinates: data.coordinates,
        planningLayers: data.planningLayers
      },
      // Initialize empty documents object - documents will be added when uploaded
      documents: {},
      // Initialize empty assessment objects
      customAssessment: {
        uploadedDocuments: {}
      },
      statementOfEnvironmentalEffects: {
        uploadedDocuments: {}
      },
      complyingDevelopmentCertificate: {
        uploadedDocuments: {}
      }
    }

    // Store the job using the correct path utility
    const jobPath = getJobPath(jobId) // Use the utility function
    await writeFile(jobPath, JSON.stringify(job, null, 2))

    // Construct the redirect URL
    const redirectUrl = `/professionals/jobs/${jobId}`

    // Return the redirect URL instead of the full job object
    return NextResponse.json({ redirectUrl })
  } catch (error) {
    console.error('Error creating job:', error)
    return NextResponse.json({ error: 'Failed to create job' }, { status: 500 })
  }
}
