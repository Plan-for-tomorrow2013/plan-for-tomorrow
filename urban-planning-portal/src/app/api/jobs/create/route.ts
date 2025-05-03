import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { Job } from '@shared/types/jobs'

const JOBS_DIR = path.join(process.cwd(), 'data', 'jobs')
const DOCUMENTS_DIR = path.join(process.cwd(), 'data', 'documents')

// Ensure directories exist
async function ensureDirectoriesExist() {
  if (!existsSync(JOBS_DIR)) {
    await mkdir(JOBS_DIR, { recursive: true })
  }
  if (!existsSync(DOCUMENTS_DIR)) {
    await mkdir(DOCUMENTS_DIR, { recursive: true })
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

    // Store the job
    const jobPath = path.join(JOBS_DIR, `${jobId}.json`)
    await writeFile(jobPath, JSON.stringify(job, null, 2))

    return NextResponse.json(job)
  } catch (error) {
    console.error('Error creating job:', error)
    return NextResponse.json({ error: 'Failed to create job' }, { status: 500 })
  }
}
