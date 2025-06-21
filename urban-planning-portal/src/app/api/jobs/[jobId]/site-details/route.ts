import { NextResponse } from 'next/server';
import { getJob, saveJob } from '@shared/services/jobStorage';

export async function POST(request: Request, { params }: { params: { jobId: string } }) {
  try {
    const siteDetails = await request.json();
    const job = await getJob(params.jobId);

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // Update the job with site details
    const updatedJob = {
      ...job,
      siteDetails,
    };

    await saveJob(params.jobId, updatedJob);

    return NextResponse.json(updatedJob);
  } catch (error) {
    console.error('Error saving site details:', error);
    return NextResponse.json({ error: 'Failed to save site details' }, { status: 500 });
  }
}
