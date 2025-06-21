import { NextResponse } from 'next/server';
import { getJob } from '@shared/services/jobStorage';
import { join } from 'path';
import { readFile } from 'fs/promises';

export async function GET(
  request: Request,
  { params }: { params: { jobId: string; documentId: string } }
) {
  try {
    const job = await getJob(params.jobId);
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    const document = job.documents?.[params.documentId];
    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Get the file path
    const filePath = join(
      process.cwd(),
      'data',
      'jobs',
      params.jobId,
      'documents',
      document.fileName
    );

    // Read the file
    const fileBuffer = await readFile(filePath);

    // Return the file with appropriate headers
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': document.type,
        'Content-Disposition': `attachment; fileName="${document.originalName}"`,
      },
    });
  } catch (error) {
    console.error('Error downloading document:', error);
    return NextResponse.json({ error: 'Failed to download document' }, { status: 500 });
  }
}
