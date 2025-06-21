import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// Correct path pointing to the admin portal's pre-prepared data
// Use the absolute path directly, without path.join or process.cwd()
const prePreparedAssessmentsPath =
  '/home/tania/urban-planning-professionals-portal/admin/admin/data/pre-prepared-assessments.json';

// GET /api/pre-prepared-assessments
// Reads pre-prepared assessments from the admin portal's data file.
export async function GET(request: Request) {
  try {
    // Check if the admin pre-prepared assessments file exists before reading
    try {
      await fs.access(prePreparedAssessmentsPath);
    } catch (accessError) {
      console.error(
        `Admin pre-prepared assessments file not found at ${prePreparedAssessmentsPath}:`,
        accessError
      );
      // Return empty array if the source file doesn't exist
      return NextResponse.json([]);
    }

    const data = await fs.readFile(prePreparedAssessmentsPath, 'utf8');
    const prePreparedAssessments = JSON.parse(data);

    // Get the section title from the query parameters
    const url = new URL(request.url);
    const sectionTitle = url.searchParams.get('section');

    if (sectionTitle) {
      // Find the specific section by title
      const section = prePreparedAssessments.find(
        (section: { title: string }) => section.title === sectionTitle
      );
      if (section) {
        return NextResponse.json(section);
      } else {
        return NextResponse.json({ error: 'Section not found' }, { status: 404 });
      }
    }

    // If no section title is provided, return all assessments
    return NextResponse.json(prePreparedAssessments);
  } catch (error) {
    console.error('Error reading pre-prepared assessments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pre-prepared assessments' },
      { status: 500 }
    );
  }
}
