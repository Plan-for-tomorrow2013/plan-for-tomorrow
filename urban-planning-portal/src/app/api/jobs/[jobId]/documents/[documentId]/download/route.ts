import { NextResponse } from 'next/server'
import { getJob } from '@shared/services/jobStorage'
import { dirname, join } from 'path'
import { readFile } from 'fs/promises'
import { fileURLToPath } from 'url'
import { getJobDocumentsPath } from '@shared/utils/paths'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export async function GET(
  request: Request,
  { params }: { params: { jobId: string; documentId: string } }
) {
  try {
    console.log('[DOWNLOAD API] Params:', params)
    const job = await getJob(params.jobId)
    console.log('[DOWNLOAD API] Loaded job:', !!job)
    if (!job) {
      console.error('[DOWNLOAD API] Job not found:', params.jobId)
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      )
    }

    let document = job.documents?.[params.documentId]
    let fileName, originalName, type
    console.log('[DOWNLOAD API] Document from job.documents:', document)

    // If not found in job.documents, check if this is a generated report (assessment)
    if (!document) {
      // Map documentId to the correct assessment key
      let assessment = null
      if (params.documentId === 'statementOfEnvironmentalEffects') {
        assessment = job.statementOfEnvironmentalEffects
      } else if (params.documentId === 'complyingDevelopmentCertificate') {
        assessment = job.complyingDevelopmentCertificate
      } else if (params.documentId === 'customAssessment') {
        assessment = job.customAssessment
      }
      console.log('[DOWNLOAD API] Assessment:', assessment)
      if (assessment && assessment.completedDocument) {
        fileName = assessment.completedDocument.fileName
        originalName = assessment.completedDocument.originalName
        type = assessment.completedDocument.type || 'application/pdf'
        console.log('[DOWNLOAD API] Found completedDocument:', assessment.completedDocument)
      }
    } else {
      fileName = document.fileName
      originalName = document.originalName
      type = document.type
    }

    console.log('[DOWNLOAD API] fileName:', fileName)
    console.log('[DOWNLOAD API] originalName:', originalName)
    console.log('[DOWNLOAD API] type:', type)

    if (!fileName) {
      console.error('[DOWNLOAD API] No fileName found for document:', params.documentId)
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    // Hardcode the file path to the correct directory
    const filePath = join('/home/tania/urban-planning-portal/data/jobs', params.jobId, 'documents', fileName)
    console.log('[DOWNLOAD API] filePath:', filePath)

    try {
      // Read the file
      const fileBuffer = await readFile(filePath)
      console.log('[DOWNLOAD API] File read successfully')

      // Ensure type and originalName are always strings
      const safeType = type || 'application/pdf';
      const safeOriginalName = originalName || 'download.pdf';

      // Return the file with appropriate headers
      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': safeType,
          'Content-Disposition': `attachment; filename="${safeOriginalName}"`,
        },
      })
    } catch (fileError) {
      console.error('[DOWNLOAD API] Error reading file:', filePath, fileError)
      return NextResponse.json(
        { error: 'Failed to read file' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error downloading document:', error)
    return NextResponse.json(
      { error: 'Failed to download document' },
      { status: 500 }
    )
  }
}
