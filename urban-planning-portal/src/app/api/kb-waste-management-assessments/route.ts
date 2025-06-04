import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

// Correct path pointing to the admin portal's kb waste management assessments data
// Use the absolute path directly, without path.join or process.cwd()
const kbWasteManagementAssessmentsPath = '/home/tania/urban-planning-professionals-portal/admin/admin/data/kb-waste-management-assessments.json';

// GET /api/kb-waste-management-assessments
// Reads kb waste management assessments from the admin portal's data file.
export async function GET(request: Request) {
  try {
    // Check if the admin kb waste management assessments file exists before reading
    try {
      await fs.access(kbWasteManagementAssessmentsPath)
    } catch (accessError) {
      console.error(`Admin kb waste management assessments file not found at ${kbWasteManagementAssessmentsPath}:`, accessError)
      // Return empty array if the source file doesn't exist
      return NextResponse.json([])
    }

    const data = await fs.readFile(kbWasteManagementAssessmentsPath, 'utf8')
    const kbWasteManagementAssessments = JSON.parse(data)

    // Get the section title from the query parameters
    const url = new URL(request.url)
    const sectionTitle = url.searchParams.get('section')

    if (sectionTitle) {
      // Find the specific section by title
      const section = kbWasteManagementAssessments.find((section: { title: string }) => section.title === sectionTitle)
      if (section) {
        return NextResponse.json(section)
      } else {
        return NextResponse.json({ error: 'Section not found' }, { status: 404 })
      }
    }

    // If no section title is provided, return all assessments
    return NextResponse.json(kbWasteManagementAssessments)
  } catch (error) {
    console.error('Error reading kb waste management assessments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch kb waste management assessments' },
      { status: 500 }
    )
  }
}
