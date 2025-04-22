import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

// Correct path pointing to the admin portal's pre-prepared data
// Use the absolute path directly, without path.join or process.cwd()
const prePreparedAssessmentsPath = '/home/tania/urban-planning-professionals-portal/admin/admin/data/pre-prepared-assessments.json';

// GET /api/pre-prepared-assessment
// Reads pre-prepared assessments from the admin portal's data file.
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
    const prePreparedAssessments = JSON.parse(data)
    return NextResponse.json(prePreparedAssessments)
  } catch (error) {
    console.error('Error reading pre-prepared assessments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch pre-prepared assessments' },
      { status: 500 }
    )
  }
}
