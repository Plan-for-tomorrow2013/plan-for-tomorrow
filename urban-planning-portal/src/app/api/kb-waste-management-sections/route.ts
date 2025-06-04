import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

// Use relative path to the admin portal's data directory
const kbWasteManagementAssessmentsPath = path.join(process.cwd(), '..', 'admin', 'data', 'kb-waste-management-assessments.json');

// GET /api/kb-waste-management-sections
export async function GET() {
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
    const sections = JSON.parse(data)

    // Return just the sections without their assessments
    const sectionsWithoutAssessments = sections.map((section: any) => ({
      id: section.id,
      title: section.title
    }))

    return NextResponse.json(sectionsWithoutAssessments)
  } catch (error) {
    console.error('Error reading kb waste management sections:', error)
    return NextResponse.json(
      { error: 'Failed to fetch kb waste management sections' },
      { status: 500 }
    )
  }
}
