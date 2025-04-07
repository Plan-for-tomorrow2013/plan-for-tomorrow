import { NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Get document metadata from database
    // For now, we'll just try to read the file directly
    const uploadDir = join(process.cwd(), 'uploads', 'admin-documents')
    const filePath = join(uploadDir, params.id)

    try {
      const fileContent = await readFile(filePath)
      
      // Create response with appropriate headers
      const response = new NextResponse(fileContent)
      response.headers.set('Content-Type', 'application/pdf')
      response.headers.set('Content-Disposition', `attachment; filename="${params.id}"`)
      
      return response
    } catch (error) {
      console.error('File not found:', error)
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      )
    }
  } catch (error) {
    console.error('Error downloading file:', error)
    return NextResponse.json(
      { error: 'Failed to download file' },
      { status: 500 }
    )
  }
} 