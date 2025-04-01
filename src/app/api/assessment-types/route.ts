import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { AssessmentType } from '@/types/assessments'

export async function GET() {
  try {
    const customTypes = await prisma.assessmentType.findMany({
      where: {
        isCustom: true
      }
    })

    return NextResponse.json({
      success: true,
      customTypes
    })
  } catch (error) {
    console.error('Error fetching assessment types:', error)
    return NextResponse.json(
      { error: 'Failed to fetch assessment types' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const assessmentType: AssessmentType = await request.json()
    console.log('Attempting to create:', assessmentType)

    // Log the exact data we're trying to insert
    console.log('Data being sent to database:', {
      id: assessmentType.id,
      value: assessmentType.value,
      label: assessmentType.label,
      description: assessmentType.description,
      documentId: assessmentType.documentId,
      file: assessmentType.file,
      version: assessmentType.version,
      isCustom: true
    })

    const created = await prisma.assessmentType.create({
      data: {
        id: assessmentType.id,
        value: assessmentType.value,
        label: assessmentType.label,
        description: assessmentType.description,
        documentId: assessmentType.documentId,
        file: assessmentType.file,
        version: assessmentType.version,
        isCustom: true
      }
    })

    return NextResponse.json({
      success: true,
      assessmentType: created
    })
  } catch (error: any) {
    // Log detailed error information
    console.error('Database error:', {
      name: error.name,
      message: error.message,
      code: error.code,
      meta: error.meta,
      stack: error.stack
    })

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