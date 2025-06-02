import { NextResponse } from 'next/server'
import { getAllJobs } from '@shared/services/jobStorage'
import { promises as fs } from 'fs'
import path from 'path'

interface Job {
  id: string;
  purchasedPrePreparedInitialAssessments?: {
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
      fileName: string;
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
  { params }: { params: { assessmentId: string } }
) {
  try {
    const assessmentId = params.assessmentId

    // Find the job that contains this assessment
    const jobs = getAllJobs() as Job[]
    const jobWithAssessment = jobs.find(job =>
      job.purchasedPrePreparedInitialAssessments?.[assessmentId]
    )

    if (!jobWithAssessment) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 })
    }

    // Use a fallback empty object to avoid linter error
    const assessment = (jobWithAssessment.purchasedPrePreparedInitialAssessments || {})[assessmentId]
    if (!assessment.file?.originalName) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    // Use the same directory as pre-prepared assessments
    const filePath = path.join(process.cwd(), 'public', 'documents', 'pre-prepared', assessment.file.originalName)

    try {
      await fs.access(filePath)
    } catch {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    const fileBuffer = await fs.readFile(filePath)
    const headers = new Headers()
    headers.set('Content-Type', 'application/octet-stream')
    headers.set('Content-Disposition', `attachment; filename="${assessment.file.originalName}"`)

    return new NextResponse(fileBuffer, { status: 200, headers })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to download assessment' }, { status: 500 })
  }
}
