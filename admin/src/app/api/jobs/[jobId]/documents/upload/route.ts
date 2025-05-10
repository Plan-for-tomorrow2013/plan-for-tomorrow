import { NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { getJob, saveJob } from '@shared/services/jobStorage'
import { existsSync } from 'fs'

// Configure upload directory and limits
const MAX_FILE_SIZE = 20 * 1024 * 1024 // 20MB in bytes

export async function POST(
  request: Request,
  { params }: { params: { jobId: string } }
) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const documentId = formData.get('documentId') as string

    if (!file || !documentId) {
      return NextResponse.json(
        { error: 'File and document ID are required' },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds the maximum limit of 20MB' },
        { status: 400 }
      )
    }

    // Get job and ensure it exists
    const job = await getJob(params.jobId)
    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      )
    }

    // Create job documents directory if it doesn't exist
    const jobDir = join(process.cwd(), 'data', 'jobs', params.jobId)
    const documentsDir = join(jobDir, 'documents')
    if (!existsSync(documentsDir)) {
      await mkdir(documentsDir, { recursive: true })
    }

    // Create unique fileName and save file
    const timestamp = Date.now()
    const fileName = `${documentId}_${timestamp}_${file.name}`
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    try {
      await writeFile(join(documentsDir, fileName), buffer)
    } catch (writeError) {
      console.error('Error writing file:', writeError)
      return NextResponse.json(
        { error: 'Failed to save file to disk' },
        { status: 500 }
      )
    }

    // Update job with document information
    const documents = job.documents || {}
    documents[documentId] = {
      fileName,
      originalName: file.name,
      type: file.type,
      uploadedAt: new Date().toISOString(),
      size: file.size
    }

    const updatedJob = {
      ...job,
      documents
    }

    await saveJob(params.jobId, updatedJob)

    return NextResponse.json({
      success: true,
      document: documents[documentId]
    })
  } catch (error) {
    console.error('Error handling document upload:', error)
    return NextResponse.json(
      { error: 'Failed to upload document: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    )
  }
}
