import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

// Correct path pointing to the admin portal's announcements data
const announcementsPath = path.join(process.cwd(), '..', 'admin', 'data', 'announcements.json')

// GET /api/announcements
// Reads announcements from the admin portal's data file.
export async function GET() {
  try {
    // Check if the admin announcements file exists before reading
    try {
      await fs.access(announcementsPath)
    } catch (accessError) {
      console.error(`Admin announcements file not found at ${announcementsPath}:`, accessError)
      // Return empty array if the source file doesn't exist
      return NextResponse.json([])
    }

    const data = await fs.readFile(announcementsPath, 'utf8')
    const announcements = JSON.parse(data)
    return NextResponse.json(announcements)
  } catch (error) {
    console.error('Error reading announcements:', error)
    return NextResponse.json(
      { error: 'Failed to fetch announcements' },
      { status: 500 }
    )
  }
}
