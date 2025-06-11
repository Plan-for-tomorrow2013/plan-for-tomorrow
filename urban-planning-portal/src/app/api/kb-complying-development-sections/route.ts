import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

// Use relative path to the admin portal's data directory
const kbComplyingDevelopmentPath = path.join(process.cwd(), '..', 'admin', 'data', 'kb-complying-development-sections.json');

// GET /api/kb-complying-development-sections
export async function GET() {
  try {
    // Check if the admin kb complying development sections file exists before reading
    try {
      await fs.access(kbComplyingDevelopmentPath)
    } catch (accessError) {
      console.error(`Admin kb complying development sections file not found at ${kbComplyingDevelopmentPath}:`, accessError)
      // Return empty array if the source file doesn't exist
      return NextResponse.json([])
    }

    const data = await fs.readFile(kbComplyingDevelopmentPath, 'utf8')
    const sections = JSON.parse(data)

    // Return just the sections without their assessments
    const sectionsWithoutAssessments = sections.map((section: any) => ({
      id: section.id,
      title: section.title
    }))

    return NextResponse.json(sectionsWithoutAssessments)
  } catch (error) {
    console.error('Error reading kb complying development sections:', error)
    return NextResponse.json(
      { error: 'Failed to fetch kb complying development sections' },
      { status: 500 }
    )
  }
}
