import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

const announcementsPath = path.join(process.cwd(), 'data', 'announcements.json')

// Ensure the announcements file exists
async function ensureAnnouncementsFile() {
  try {
    await fs.access(announcementsPath)
  } catch {
    await fs.writeFile(announcementsPath, '[]')
  }
}

// GET /api/announcements
export async function GET() {
  try {
    await ensureAnnouncementsFile()
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

// POST /api/announcements
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { title, content, author } = body

    if (!title || !content || !author) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    await ensureAnnouncementsFile()
    const data = await fs.readFile(announcementsPath, 'utf8')
    const announcements = JSON.parse(data)

    const newAnnouncement = {
      id: uuidv4(),
      title,
      content,
      author,
      date: new Date().toISOString(),
    }

    announcements.unshift(newAnnouncement) // Add to the beginning of the array
    await fs.writeFile(announcementsPath, JSON.stringify(announcements, null, 2))

    return NextResponse.json(newAnnouncement)
  } catch (error) {
    console.error('Error creating announcement:', error)
    return NextResponse.json(
      { error: 'Failed to create announcement' },
      { status: 500 }
    )
  }
} 