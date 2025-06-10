import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

// Use relative path to the admin portal's data directory
const kbNathersAssessmentsPath = path.join(process.cwd(), '..', 'admin', 'data', 'kb-nathers-assessments.json');

// GET /api/kb-nathers-sections
export async function GET() {
  try {
    // Check if the admin kb nathers assessments file exists before reading
    try {
      await fs.access(kbNathersAssessmentsPath)
    } catch (accessError) {
      console.error(`Admin kb nathers assessments file not found at ${kbNathersAssessmentsPath}:`, accessError)
      // Return empty array if the source file doesn't exist
      return NextResponse.json([])
    }

    const data = await fs.readFile(kbNathersAssessmentsPath, 'utf8')
    const sections = JSON.parse(data)

    // Return just the sections without their assessments
    const sectionsWithoutAssessments = sections.map((section: any) => ({
      id: section.id,
      title: section.title
    }))

    return NextResponse.json(sectionsWithoutAssessments)
  } catch (error) {
    console.error('Error reading kb nathers sections:', error)
    return NextResponse.json(
      { error: 'Failed to fetch kb nathers sections' },
      { status: 500 }
    )
  }
}
