import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

const dataDir = path.join(process.cwd(), 'admin', 'data')
const prePreparedAssessmentsPath = path.join(dataDir, 'pre-prepared-assessments.json')
const documentsDir = path.join(process.cwd(), 'admin', 'public', 'documents', 'pre-prepared')

// Ensure necessary directories and files exist
async function ensureInfrastructure() {
  try {
    await fs.mkdir(dataDir, { recursive: true });
    await fs.mkdir(documentsDir, { recursive: true });
    // Try to access the file to see if it exists
    await fs.access(prePreparedAssessmentsPath);
  } catch (error: any) {
    // Check if the error is because the file doesn't exist
    if (error.code === 'ENOENT') {
      // If the file doesn't exist, create it with an empty array
      await fs.writeFile(prePreparedAssessmentsPath, '[]')
    } else {
      // If it's another error, rethrow it
      console.error("Error ensuring infrastructure:", error);
      throw error; // Rethrow unexpected errors
    }
  }
}

// GET /api/pre-prepared-assessments
export async function GET() {
  try {
    await ensureInfrastructure() // Ensure file and dirs exist
    const data = await fs.readFile(prePreparedAssessmentsPath, 'utf8')
    const prePreparedAssessments = JSON.parse(data)
    return NextResponse.json(prePreparedAssessments)
  } catch (error) {
    console.error('Error reading pre-prepared assessments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch pre-prepared assessments' },
      { status: 500 }
    )
  }
}

// POST /api/pre-prepared-assessments
export async function POST(request: Request) {
  try {
    await ensureInfrastructure()
    const formData = await request.formData()
    const title = formData.get('title') as string
    const content = formData.get('content') as string
    const author = formData.get('author') as string // Assuming author comes from session or elsewhere, hardcoding for now
    const file = formData.get('file') as File | null

    if (!title || !content) { // Removed author check for now
      return NextResponse.json(
        { error: 'Missing required fields: title or content' },
        { status: 400 }
      )
    }

    // Read existing assessments
    const data = await fs.readFile(prePreparedAssessmentsPath, 'utf8')
    const prePreparedAssessments = JSON.parse(data)

    let fileData = null
    if (file) {
      // Generate a unique ID for the file
      const fileId = uuidv4()
      const fileExtension = path.extname(file.name)
      const newFileName = `${fileId}${fileExtension}`
      const filePath = path.join(documentsDir, newFileName)

      // Convert file buffer to ArrayBuffer, then Buffer
      const fileBuffer = await file.arrayBuffer()
      await fs.writeFile(filePath, Buffer.from(fileBuffer))

      fileData = {
        id: fileId, // Use the generated ID for reference
        originalName: file.name,
        savedPath: `/documents/pre-prepared/${newFileName}` // Path relative to public for serving
      }
    }

    const newPrePreparedAssessment = {
      id: uuidv4(),
      title,
      content,
      author: author || "Admin User", // Use provided author or default
      date: new Date().toISOString(),
      file: fileData, // Include file data if uploaded
    }

    prePreparedAssessments.unshift(newPrePreparedAssessment)
    await fs.writeFile(prePreparedAssessmentsPath, JSON.stringify(prePreparedAssessments, null, 2))

    return NextResponse.json(newPrePreparedAssessment, { status: 201 }) // Return 201 Created status

  } catch (error) {
    console.error('Error creating pre-prepared assessment:', error)
    // Provide more specific error logging if possible
    if (error instanceof Error) {
        console.error(error.message);
        if ('code' in error && error.code === 'ENOENT') {
             return NextResponse.json(
               { error: 'Server configuration error: Directory not found.' },
               { status: 500 }
             )
        }
    }
    return NextResponse.json(
      { error: 'Failed to create pre-prepared assessment' },
      { status: 500 }
    )
  }
}
