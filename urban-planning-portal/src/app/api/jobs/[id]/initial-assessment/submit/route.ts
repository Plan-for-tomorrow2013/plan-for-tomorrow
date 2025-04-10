import { NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import path from 'path'
import { getJob } from '@/lib/jobStorage'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const formData = await request.formData()
    const jobId = params.id

    // Verify job exists
    const job = getJob(jobId)
    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      )
    }

    // Create directory for assessment request if it doesn't exist
    const assessmentDir = path.join(process.cwd(), 'data', 'jobs', jobId, 'initial-assessment')
    await writeFile(
      path.join(assessmentDir, 'request.json'),
      JSON.stringify({
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        notes: formData.get('notes'),
        submittedAt: new Date().toISOString(),
        status: 'pending'
      }, null, 2)
    )

    // Save uploaded documents
    const entries = Array.from(formData.entries())
    const documents = entries
      .filter(([key, value]) => key.startsWith('document-') && value instanceof File)
      .map(([_, value]) => value as File)

    for (let i = 0; i < documents.length; i++) {
      const document = documents[i]
      const buffer = Buffer.from(await document.arrayBuffer())
      await writeFile(
        path.join(assessmentDir, `document-${i + 1}${path.extname(document.name)}`),
        buffer
      )
    }

    return NextResponse.json({
      message: 'Initial assessment request submitted successfully',
      jobId
    })
  } catch (error) {
    console.error('Error submitting initial assessment request:', error)
    return NextResponse.json(
      { error: 'Failed to submit initial assessment request' },
      { status: 500 }
    )
  }
}
