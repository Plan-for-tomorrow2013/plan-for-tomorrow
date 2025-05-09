import { NextResponse } from 'next/server'
import { unlink } from 'fs/promises'
import { join } from 'path'

export async function DELETE(
  request: Request,
  { params }: { params: { documentId: string } }
) {
  try {
    // TODO: Get document metadata from database
    // For now, we'll just delete the file if it exists

    const uploadDir = join(process.cwd(), 'uploads', 'admin-documents')
    const filePath = join(uploadDir, params.documentId)

    try {
      await unlink(filePath)
    } catch (error) {
      // If file doesn't exist, that's okay - it might have been already deleted
      console.log('File not found:', error)
    }

    // TODO: Delete document metadata from database

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting document:', error)
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    )
  }
}
