import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

// Correct path pointing to the admin portal's kb development application assessments data
const kbComplyingDevelopmentPath = '/home/tania/urban-planning-professionals-portal/admin/admin/data/kb-complying-development-assessments.json';

// GET /api/kb-development-application-assessments
// Reads kb development application assessments from the admin portal's data file.
export async function GET(request: Request) {
  try {
    // Check if the admin kb development application assessments file exists before reading
    try {
      await fs.access(kbComplyingDevelopmentPath)
    } catch (accessError) {
      console.error(`Admin kb complying development assessments file not found at ${kbComplyingDevelopmentPath}:`, accessError)
      // Return empty array if the source file doesn't exist
      return NextResponse.json([])
    }

    const data = await fs.readFile(kbComplyingDevelopmentPath, 'utf8')
    const kbComplyingDevelopmentAssessments = JSON.parse(data)

    // Get the section title from the query parameters
    const url = new URL(request.url)
    const sectionTitle = url.searchParams.get('section')

    if (sectionTitle) {
      // Find the specific section by title
      const section = kbComplyingDevelopmentAssessments.find((section: { title: string }) => section.title === sectionTitle)
      if (section) {
        return NextResponse.json(section)
      } else {
        return NextResponse.json({ error: 'Section not found' }, { status: 404 })
      }
    }

    // If no section title is provided, return all assessments
    return NextResponse.json(kbComplyingDevelopmentAssessments)
  } catch (error) {
    console.error('Error reading kb complying development assessments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch kb complying development assessments' },
      { status: 500 }
    )
  }
}
