import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

// Correct path pointing to the admin portal's kb development application assessments data
// Use the absolute path directly, without path.join or process.cwd()
const kbDevelopmentApplicationPath = '/home/tania/urban-planning-professionals-portal/admin/admin/data/kb-development-application.json';

// GET /api/kb-development-application-assessments
// Reads kb development application assessments from the admin portal's data file.
export async function GET(request: Request) {
  try {
    // Check if the admin kb development application assessments file exists before reading
    try {
      await fs.access(kbDevelopmentApplicationPath)
    } catch (accessError) {
      console.error(`Admin kb development application assessments file not found at ${kbDevelopmentApplicationPath}:`, accessError)
      // Return empty array if the source file doesn't exist
      return NextResponse.json([])
    }

    const data = await fs.readFile(kbDevelopmentApplicationPath, 'utf8')
    const kbDevelopmentApplicationAssessments = JSON.parse(data)

    // Get the section title from the query parameters
    const url = new URL(request.url)
    const sectionTitle = url.searchParams.get('section')

    if (sectionTitle) {
      // Find the specific section by title
      const section = kbDevelopmentApplicationAssessments.find((section: { title: string }) => section.title === sectionTitle)
      if (section) {
        return NextResponse.json(section)
      } else {
        return NextResponse.json({ error: 'Section not found' }, { status: 404 })
      }
    }

    // If no section title is provided, return all assessments
    return NextResponse.json(kbDevelopmentApplicationAssessments)
  } catch (error) {
    console.error('Error reading kb development application assessments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch kb development application assessments' },
      { status: 500 }
    )
  }
}
