import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log('[API] PATCH /api/assessment-types/[id] - Starting', { id: params.id })
    
    const updates = await request.json()
    console.log('[API] PATCH /api/assessment-types/[id] - Updating:', { id: params.id, updates })

    const updated = await prisma.assessmentType.update({
      where: { id: params.id },
      data: updates
    })

    console.log('[API] PATCH /api/assessment-types/[id] - Updated:', updated)

    return NextResponse.json({
      success: true,
      assessmentType: updated
    })
  } catch (error: any) {
    console.error('[API] PATCH /api/assessment-types/[id] - Error:', error)
    return NextResponse.json({
      error: 'Failed to update assessment type',
      details: error.message
    }, { status: 500 })
  }
} 