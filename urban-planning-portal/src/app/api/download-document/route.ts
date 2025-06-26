import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { stat } from 'fs/promises'; // For checking file existence
import { getJobsPath } from '@shared/utils/paths';

export async function GET(request: Request) {
  // Original code below, temporarily commented out for testing

  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get('jobId');
  const fileName = searchParams.get('fileName'); // This is the stored filename, potentially with a unique prefix/timestamp
  const originalName = searchParams.get('originalName') || fileName; // Fallback to fileName if originalName is not provided

  if (!jobId || !fileName) {
    return NextResponse.json(
      { error: 'Missing jobId or fileName query parameters' },
      { status: 400 }
    );
  }

  try {
    // Use the correct path from the paths utility
    const documentsBasePath = getJobsPath();

    const filePath = path.join(documentsBasePath, jobId, 'documents', fileName);

    // Check if file exists before attempting to read
    try {
      await stat(filePath);
    } catch (e: unknown) {
      const error = e as { code?: string };
      if (error.code === 'ENOENT') {
        return NextResponse.json({ error: 'File not found on server.' }, { status: 404 });
      }
      // Other errors (e.g., permissions)
      return NextResponse.json({ error: 'Error accessing file.' }, { status: 500 });
    }

    const fileBuffer = await fs.readFile(filePath);

    // Determine content type (basic implementation)
    let contentType = 'application/octet-stream'; // Default
    if (originalName?.toLowerCase().endsWith('.pdf')) {
      contentType = 'application/pdf';
    } else if (originalName?.toLowerCase().endsWith('.doc')) {
      contentType = 'application/msword';
    } else if (originalName?.toLowerCase().endsWith('.docx')) {
      contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    }
    // Add more MIME types as needed based on expected file types

    const response = new NextResponse(fileBuffer);
    response.headers.set('Content-Type', contentType);
    // Use the originalName for the download attribute if available
    response.headers.set(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(originalName || fileName)}"`
    );

    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Failed to download file' }, { status: 500 });
  }
}
