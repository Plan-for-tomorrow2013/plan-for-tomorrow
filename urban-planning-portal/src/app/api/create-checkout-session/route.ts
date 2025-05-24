import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { jobId, assessmentId, type } = await request.json();

    if (!jobId || !assessmentId || type !== 'pre-prepared-assessment') {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Return success response with redirect URL
    return NextResponse.json({
      url: `/professionals/report-writer?job=${jobId}&payment_success=true&assessment_id=${assessmentId}`
    });
  } catch (error) {
    console.error('Error processing payment:', error);
    return NextResponse.json(
      { error: 'Failed to process payment' },
      { status: 500 }
    );
  }
}
