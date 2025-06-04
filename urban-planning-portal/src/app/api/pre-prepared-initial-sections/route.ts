import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

// Use relative path to the admin portal's data directory
const prePreparedInitialAssessmentsPath = path.join(process.cwd(), '..', 'admin', 'data', 'pre-prepared-initial-assessments.json');

// GET /api/pre-prepared-initial-sections
export async function GET() {
  try {
    // Check if the admin pre-prepared initial assessments file exists before reading
    try {
      await fs.access(prePreparedInitialAssessmentsPath)
    } catch (accessError) {
      console.error(`Admin pre-prepared initial assessments file not found at ${prePreparedInitialAssessmentsPath}:`, accessError)
      // Return empty array if the source file doesn't exist
      return NextResponse.json([])
    }

    const data = await fs.readFile(prePreparedInitialAssessmentsPath, 'utf8')
    const sections = JSON.parse(data)

    // Return just the sections without their assessments
    const sectionsWithoutAssessments = sections.map((section: any) => ({
      id: section.id,
      title: section.title
    }))

    return NextResponse.json(sectionsWithoutAssessments)
  } catch (error) {
    console.error('Error reading pre-prepared initial sections:', error)
    return NextResponse.json(
      { error: 'Failed to fetch pre-prepared initial sections' },
      { status: 500 }
    )
  }
}
