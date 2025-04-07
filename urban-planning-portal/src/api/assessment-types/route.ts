import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'
import { AssessmentType } from '../../types/assessments'

export async function GET() {
  try {
    console.log('[API] GET /api/assessment-types - Starting fetch')
    const customTypes = await prisma.assessmentType.findMany({
      where: {
        isCustom: true
      }
    })
    console.log('[API] GET /api/assessment-types - Found types:', customTypes)

    return NextResponse.json({
      success: true,
      customTypes
    })
  } catch (error) {
    console.error('[API] GET /api/assessment-types - Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch assessment types' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    console.log('[API] POST /api/assessment-types - Starting')
    const assessmentType: AssessmentType = await request.json()
    console.log('[API] POST /api/assessment-types - Received:', assessmentType)

    // Validate required fields
    if (!assessmentType.id || !assessmentType.value || !assessmentType.label) {
      console.log('[API] POST /api/assessment-types - Validation failed:', { id: assessmentType.id, value: assessmentType.value, label: assessmentType.label })
      return NextResponse.json({
        error: 'Missing required fields: id, value, and label are required',
      }, { status: 400 })
    }

    // Log the exact data we're trying to insert
    const data = {
      id: assessmentType.id,
      value: assessmentType.value,
      label: assessmentType.label,
      description: assessmentType.description || `Complying Development Certificate for ${assessmentType.label.toLowerCase()}`,
      documentId: assessmentType.documentId || assessmentType.id,
      file: assessmentType.file || `/documents/${assessmentType.id}.pdf`,
      version: assessmentType.version || 1,
      isCustom: true
    }
    console.log('[API] POST /api/assessment-types - Prepared data:', data)

    const created = await prisma.assessmentType.create({
      data
    })

    console.log('[API] POST /api/assessment-types - Created:', created)

    const response = {
      success: true,
      assessmentType: created
    }
    console.log('[API] POST /api/assessment-types - Sending response:', response)

    return NextResponse.json(response)
  } catch (error: any) {
    // Log detailed error information
    console.error('[API] POST /api/assessment-types - Database error:', {
      name: error.name,
      message: error.message,
      code: error.code,
      meta: error.meta,
      stack: error.stack
    })

    // Check for specific error types
    if (error.code === 'P2002') {
      return NextResponse.json({
        error: 'An assessment type with this ID or value already exists',
        details: error.meta
      }, { status: 409 })
    }

    return NextResponse.json({
      error: 'Failed to create assessment type',
      details: {
        message: error.message,
        code: error.code,
        meta: error.meta
      }
    }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    console.log('[API] PATCH /api/assessment-types - Starting')
    const url = new URL(request.url)
    const id = url.pathname.split('/').pop()

    if (!id) {
      return NextResponse.json({
        error: 'Assessment type ID is required'
      }, { status: 400 })
    }

    const updates = await request.json()
    console.log('[API] PATCH /api/assessment-types - Updating:', { id, updates })

    const updated = await prisma.assessmentType.update({
      where: { id },
      data: updates
    })

    console.log('[API] PATCH /api/assessment-types - Updated:', updated)

    return NextResponse.json({
      success: true,
      assessmentType: updated
    })
  } catch (error: any) {
    console.error('[API] PATCH /api/assessment-types - Error:', error)
    return NextResponse.json({
      error: 'Failed to update assessment type',
      details: error.message
    }, { status: 500 })
  }
}
