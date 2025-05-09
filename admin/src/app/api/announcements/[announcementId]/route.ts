import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

const announcementsPath = path.join(process.cwd(), 'data', 'announcements.json')

export async function PUT(
  request: Request,
  { params }: { params: { announcementId: string } }
) {
  try {
    const data = await fs.readFile(announcementsPath, 'utf8')
    const announcements = JSON.parse(data)
    const { title, content, author } = await request.json()

    const index = announcements.findIndex((a: any) => a.id === params.announcementId)
    if (index === -1) {
      return NextResponse.json(
        { error: 'Announcement not found' },
        { status: 404 }
      )
    }

    // Update the announcement while preserving the id and date
    announcements[index] = {
      ...announcements[index],
      title,
      content,
      author
    }

    await fs.writeFile(announcementsPath, JSON.stringify(announcements, null, 2))
    return NextResponse.json(announcements[index])
  } catch (error) {
    console.error('Error updating announcement:', error)
    return NextResponse.json(
      { error: 'Failed to update announcement' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { announcementId: string } }
) {
  try {
    const data = await fs.readFile(announcementsPath, 'utf8')
    const announcements = JSON.parse(data)

    const index = announcements.findIndex((a: any) => a.id === params.announcementId)
    if (index === -1) {
      return NextResponse.json(
        { error: 'Announcement not found' },
        { status: 404 }
      )
    }

    // Remove the announcement
    announcements.splice(index, 1)

    await fs.writeFile(announcementsPath, JSON.stringify(announcements, null, 2))
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting announcement:', error)
    return NextResponse.json(
      { error: 'Failed to delete announcement' },
      { status: 500 }
    )
  }
}
