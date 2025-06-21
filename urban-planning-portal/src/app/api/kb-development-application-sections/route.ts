import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// Use relative path to the admin portal's data directory
const kbDevelopmentApplicationPath = path.join(
  process.cwd(),
  '..',
  'admin',
  'data',
  'kb-development-application.json'
);

// GET /api/kb-development-application-sections
export async function GET() {
  try {
    // Check if the admin kb development application assessments file exists before reading
    try {
      await fs.access(kbDevelopmentApplicationPath);
    } catch (accessError) {
      console.error(
        `Admin kb development application assessments file not found at ${kbDevelopmentApplicationPath}:`,
        accessError
      );
      // Return empty array if the source file doesn't exist
      return NextResponse.json([]);
    }

    const data = await fs.readFile(kbDevelopmentApplicationPath, 'utf8');
    const sections = JSON.parse(data);

    // Return just the sections without their assessments
    const sectionsWithoutAssessments = sections.map((section: any) => ({
      id: section.id,
      title: section.title,
    }));

    return NextResponse.json(sectionsWithoutAssessments);
  } catch (error) {
    console.error('Error reading kb development application sections:', error);
    return NextResponse.json(
      { error: 'Failed to fetch kb development application sections' },
      { status: 500 }
    );
  }
}
