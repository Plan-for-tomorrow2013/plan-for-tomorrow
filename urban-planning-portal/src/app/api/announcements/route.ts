import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

// Get the absolute path to the workspace root
const workspaceRoot = path.resolve(process.cwd(), '..')
console.log('Workspace root:', workspaceRoot)

// Correct path pointing to the admin portal's announcements data
const announcementsPath = path.join(workspaceRoot, 'admin', 'data', 'announcements.json')
console.log('Announcements path:', announcementsPath)

// GET /api/announcements
// Reads announcements from the admin portal's data file.
export async function GET() {
  try {
    // Check if the admin announcements file exists before reading
    try {
      await fs.access(announcementsPath)
      console.log('Announcements file exists')
    } catch (accessError) {
      console.error(`Admin announcements file not found at ${announcementsPath}:`, accessError)
      // Return empty array if the source file doesn't exist
      return NextResponse.json({ data: [] })
    }

    const data = await fs.readFile(announcementsPath, 'utf8')
    console.log('Raw file data:', data)
    const announcements = JSON.parse(data)
    console.log('Parsed announcements:', announcements)
    return NextResponse.json({ data: announcements })
  } catch (error) {
    console.error('Error reading announcements:', error)
    return NextResponse.json(
      { error: { message: 'Failed to fetch announcements' } },
      { status: 500 }
    )
  }
}
