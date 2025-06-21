import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// Correct path pointing to the admin portal's kb nathers assessments data
// Use the absolute path directly, without path.join or process.cwd()
const kbNathersAssessmentsPath =
  '/home/tania/urban-planning-professionals-portal/admin/admin/data/kb-nathers-assessments.json';

// GET /api/kb-nathers-assessments
// Reads kb nathers assessments from the admin portal's data file.
export async function GET(request: Request) {
  try {
    // Check if the admin kb nathers assessments file exists before reading
    try {
      await fs.access(kbNathersAssessmentsPath);
    } catch (accessError) {
      console.error(
        `Admin kb nathers assessments file not found at ${kbNathersAssessmentsPath}:`,
        accessError
      );
      // Return empty array if the source file doesn't exist
      return NextResponse.json([]);
    }

    const data = await fs.readFile(kbNathersAssessmentsPath, 'utf8');
    const kbNathersAssessments = JSON.parse(data);

    // Get the section title from the query parameters
    const url = new URL(request.url);
    const sectionTitle = url.searchParams.get('section');

    if (sectionTitle) {
      // Find the specific section by title
      const section = kbNathersAssessments.find(
        (section: { title: string }) => section.title === sectionTitle
      );
      if (section) {
        return NextResponse.json(section);
      } else {
        return NextResponse.json({ error: 'Section not found' }, { status: 404 });
      }
    }

    // If no section title is provided, return all assessments
    return NextResponse.json(kbNathersAssessments);
  } catch (error) {
    console.error('Error reading kb nathers assessments:', error);
    return NextResponse.json({ error: 'Failed to fetch kb nathers assessments' }, { status: 500 });
  }
}
