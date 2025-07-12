import { NextResponse } from 'next/server';
import { getJob } from '@shared/services/jobStorage';
import { join } from 'path';
import { readFile } from 'fs/promises';

export async function GET(
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

    // Log the document object and file path
    const filePath = join(process.cwd(), 'data', 'jobs', params.id, 'documents', document.fileName);
    console.log('Job document download:', { filePath, document });

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
