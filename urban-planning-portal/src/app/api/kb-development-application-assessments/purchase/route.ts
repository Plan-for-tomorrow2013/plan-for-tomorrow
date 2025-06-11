import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

// Path to the kb development application data file
const kbDevelopmentApplicationPath = '/home/tania/urban-planning-professionals-portal/admin/admin/data/kb-development-application.json';

// POST /api/kb-development-application-assessments/purchase
export async function POST(request: Request) {
  try {
    const { assessment } = await request.json();

    if (!assessment) {
      return NextResponse.json(
        { error: 'Missing assessment data' },
        { status: 400 }
      );
    }

    // Read the assessments data to verify the assessment exists
    const assessmentsData = await fs.readFile(kbDevelopmentApplicationPath, 'utf8');
    const assessments = JSON.parse(assessmentsData);

    // Verify the assessment exists in our data
    const assessmentExists = assessments.some((section: any) =>
      section.assessments.some((a: any) => a.id === assessment.id)
    );

    if (!assessmentExists) {
      return NextResponse.json(
        { error: 'Assessment not found' },
        { status: 404 }
      );
    }

    // Return success response with the assessment data
    return NextResponse.json({
      success: true,
      message: 'Assessment purchased successfully',
      assessment: {
        ...assessment,
        purchaseDate: new Date().toISOString(),
        status: 'paid'
      }
    });
  } catch (error) {
    console.error('Error purchasing assessment:', error);
    return NextResponse.json(
      { error: 'Failed to purchase assessment' },
      { status: 500 }
    );
  }
}
