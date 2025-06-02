import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

// Use relative path to the admin portal's data directory
const prePreparedAssessmentsPath = path.join(process.cwd(), '..', 'admin', 'data', 'pre-prepared-assessments.json');

// GET /api/pre-prepared-sections
export async function GET() {
  try {
    // Check if the admin pre-prepared assessments file exists before reading
    try {
      await fs.access(prePreparedAssessmentsPath)
    } catch (accessError) {
      console.error(`Admin pre-prepared assessments file not found at ${prePreparedAssessmentsPath}:`, accessError)
      // Return empty array if the source file doesn't exist
      return NextResponse.json([])
    }

    const data = await fs.readFile(prePreparedAssessmentsPath, 'utf8')
    const sections = JSON.parse(data)

    // Return just the sections without their assessments
    const sectionsWithoutAssessments = sections.map((section: any) => ({
      id: section.id,
      title: section.title
    }))

    return NextResponse.json(sectionsWithoutAssessments)
  } catch (error) {
    console.error('Error reading pre-prepared sections:', error)
    return NextResponse.json(
      { error: 'Failed to fetch pre-prepared sections' },
      { status: 500 }
    )
  }
}
