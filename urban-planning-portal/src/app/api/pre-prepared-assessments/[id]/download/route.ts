import { NextResponse } from 'next/server'
import { getAllJobs } from '@/lib/jobStorage'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

interface Job {
  id: string;
  purchasedPrePreparedAssessments?: {
    [key: string]: {
      id: string;
      title: string;
      content: string;
      purchaseDate: string;
      file?: {
        id: string;
        originalName: string;
        savedPath: string;
      };
    };
  };
  documents?: {
    [key: string]: {
      filename: string;
      originalName: string;
      type: string;
      uploadedAt: string;
      size: number;
      savedPath?: string;
    };
  };
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const assessmentId = params.id
    console.log('Attempting to download assessment:', assessmentId)

    // Find the job that contains this assessment
    const jobs = getAllJobs() as Job[]
    console.log('Found jobs:', jobs.length)

    // Debug: Log all jobs with their purchased assessments
    jobs.forEach(job => {
      console.log(`Job ${job.id} has assessments:`,
        Object.keys(job.purchasedPrePreparedAssessments || {}))
    })

    const jobWithAssessment = jobs.find(job =>
      job.purchasedPrePreparedAssessments?.[assessmentId]
    )

    if (!jobWithAssessment) {
      console.log('No job found containing assessment:', assessmentId)
      // Debug: Log the assessment ID we're looking for
      console.log('Looking for assessment ID:', assessmentId)
      // Debug: Log all available assessment IDs
      const allAssessmentIds = jobs.flatMap(job =>
        Object.keys(job.purchasedPrePreparedAssessments || {}))
      console.log('Available assessment IDs:', allAssessmentIds)
      return NextResponse.json(
        { error: 'Assessment not found' },
        { status: 404 }
      )
    }

    console.log('Found job with assessment:', jobWithAssessment.id)
    const assessment = jobWithAssessment.purchasedPrePreparedAssessments![assessmentId]
    console.log('Assessment details:', JSON.stringify(assessment, null, 2))

    if (!assessment.file?.savedPath) {
      console.log('No saved path found for assessment:', assessmentId)
      return NextResponse.json(
        { error: 'File path not found' },
        { status: 404 }
      )
    }

    // Remove leading slash if present
    const relativePath = assessment.file.savedPath.startsWith('/')
      ? assessment.file.savedPath.slice(1)
      : assessment.file.savedPath

    // Construct the file path to the public documents directory
    const filePath = join(process.cwd(), 'public', relativePath)
    console.log('Full file path:', filePath)
    console.log('Current working directory:', process.cwd())

    // Check if file exists before trying to read it
    if (!existsSync(filePath)) {
      console.error('File does not exist at path:', filePath)
      // Try alternative path
      const alternativePath = join(process.cwd(), 'public', 'documents', 'pre-prepared', assessment.file.originalName)
      console.log('Trying alternative path:', alternativePath)
      if (existsSync(alternativePath)) {
        console.log('File found at alternative path')
        // Use the alternative path if file exists there
        return new NextResponse(await readFile(alternativePath), {
          headers: {
            'Content-Type': 'application/octet-stream',
            'Content-Disposition': `attachment; filename="${assessment.file.originalName}"`
          },
          status: 200
        })
      }
      return NextResponse.json(
        { error: 'File not found on disk' },
        { status: 404 }
      )
    }

    try {
      // Read the file
      const fileBuffer = await readFile(filePath)
      console.log('Successfully read file')

      // Set headers for file download
      const headers = new Headers()
      headers.set('Content-Type', 'application/octet-stream')
      headers.set('Content-Disposition', `attachment; filename="${assessment.file.originalName}"`)

      return new NextResponse(fileBuffer, {
        headers,
        status: 200
      })
    } catch (fileError) {
      console.error('Error reading file:', fileError)
      return NextResponse.json(
        { error: 'Failed to read file from disk', details: (fileError as Error).message },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error in download route:', error)
    if (error instanceof Error) {
      console.error('Error details:', error.message)
      console.error('Error stack:', error.stack)
    }
    return NextResponse.json(
      { error: 'Failed to download assessment', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
