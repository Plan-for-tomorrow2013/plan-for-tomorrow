import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Announcement, AnnouncementError, AnnouncementResponse } from '@shared/types/announcements';

const announcementsPath = path.join(process.cwd(), 'data', 'announcements.json');

// Ensure the announcements file exists
async function ensureAnnouncementsFile() {
  try {
    await fs.access(announcementsPath);
  } catch {
    await fs.writeFile(announcementsPath, '[]');
  }
}

// GET /api/announcements
export async function GET() {
  try {
    await ensureAnnouncementsFile();
    const data = await fs.readFile(announcementsPath, 'utf8');
    const announcements = JSON.parse(data) as Announcement[];

    const response: AnnouncementResponse = {
      data: announcements,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error reading announcements:', error);

    const errorResponse: AnnouncementResponse = {
      error: {
        code: 'ANNOUNCEMENT_FETCH_FAILED',
        message: 'Failed to fetch announcements',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}

// POST /api/announcements
export async function POST(request: NextRequest) {
  try {
    await ensureAnnouncementsFile();
    const data = await fs.readFile(announcementsPath, 'utf8');
    const announcements = JSON.parse(data) as Announcement[];

    const newAnnouncement: Announcement = {
      ...(await request.json()),
      id: uuidv4(),
      date: new Date().toISOString(),
    };

    announcements.push(newAnnouncement);
    await fs.writeFile(announcementsPath, JSON.stringify(announcements, null, 2));

    const response: AnnouncementResponse = {
      data: newAnnouncement,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error creating announcement:', error);

    const errorResponse: AnnouncementResponse = {
      error: {
        code: 'ANNOUNCEMENT_CREATION_FAILED',
        message: 'Failed to create announcement',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}
