import { NextResponse } from 'next/server';
import { getJob, saveJob } from '@shared/services/jobStorage';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { Document } from '@shared/types/documents';
import { existsSync } from 'fs';

export async function POST(
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

    const { file } = await request.json();
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Convert base64 to buffer
    const buffer = Buffer.from(file.split(',')[1], 'base64');

    // Ensure documents directory exists
    const documentsDir = join(process.cwd(), 'data', 'jobs', params.jobId, 'documents');
    if (!existsSync(documentsDir)) {
      await mkdir(documentsDir, { recursive: true });
    }

    // Write file to disk using the correct path
    const filePath = join(documentsDir, document.fileName);
    await writeFile(filePath, buffer);

    // Update document size
    document.size = buffer.length;

    // Save updated job data
    await saveJob(params.jobId, job);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}
