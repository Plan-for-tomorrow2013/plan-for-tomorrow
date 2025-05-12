import { NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { getJob, saveJob } from '@shared/services/jobStorage'
import { existsSync } from 'fs'
import { getJobDocumentsPath } from '@shared/utils/paths'

// Configure upload directory and limits
const MAX_FILE_SIZE = 20 * 1024 * 1024 // 20MB in bytes

export async function POST(
  request: Request,
  { params }: { params: { jobId: string } }
) {
  try {
    const formData = await request.formData()
    const fileEntry = formData.get('file')
    const documentId = formData.get('docId') as string

    if (!fileEntry || !documentId || !(fileEntry instanceof File)) {
      return NextResponse.json(
        { success: false, error: 'File and document ID are required' },
        { status: 400 }
      )
    }

    // Convert the file to a Buffer
    const bytes = await fileEntry.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Validate file size
    if (buffer.length > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: 'File size exceeds the maximum limit of 20MB' },
        { status: 400 }
      )
    }

    // Get job and ensure it exists
    const job = await getJob(params.jobId)
    if (!job) {
      return NextResponse.json(
        { success: false, error: 'Job not found' },
        { status: 404 }
      )
    }

    // Create job documents directory if it doesn't exist
    const documentsDir = getJobDocumentsPath(params.jobId)
    if (!existsSync(documentsDir)) {
      await mkdir(documentsDir, { recursive: true })
    }

    // Create unique fileName and save file
    const timestamp = Date.now()
    const fileName = `${documentId}_${timestamp}_${fileEntry.name}`

    try {
      await writeFile(join(documentsDir, fileName), buffer)
    } catch (writeError) {
      console.error('Error writing file:', writeError)
      return NextResponse.json(
        { success: false, error: 'Failed to save file to disk' },
        { status: 500 }
      )
    }

    // Update job with document information
    const documents = job.documents || {}
    documents[documentId] = {
      fileName,
      originalName: fileEntry.name,
      type: fileEntry.type,
      uploadedAt: new Date().toISOString(),
      size: buffer.length
    }

    // Save the updated job
    try {
      await saveJob(params.jobId, job)
    } catch (saveError) {
      console.error('Error saving job:', saveError)
      return NextResponse.json(
        { success: false, error: 'Failed to update job data' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      document: documents[documentId]
    })
  } catch (error) {
    console.error('Error handling document upload:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to upload document: ' + (error instanceof Error ? error.message : 'Unknown error')
      },
      { status: 500 }
    )
  }
}
