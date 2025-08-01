import { NextResponse } from 'next/server';
import { getJob, saveJob } from '@shared/services/jobStorage';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { Document } from '@shared/types/documents';

export async function POST(
  request: Request,
  { params }: { params: { id: string; documentId: string } }
) {
  try {
    const job = await getJob(params.id);
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

    // Write file to disk
    const filePath = join(process.cwd(), 'uploads', job.id, document.fileName);
    await writeFile(filePath, buffer);

    // Update document size
    document.size = buffer.length;

    // Save updated job data
    await saveJob(job.id, job);

    return NextResponse.json({ success: true });
  } catch (error) {
    // Log error for debugging but don't expose details to client
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}
