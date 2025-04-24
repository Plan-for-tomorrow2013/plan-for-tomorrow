import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { existsSync } from 'fs';
import mime from 'mime-types'; // Using mime-types for better content-type detection

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get('jobId');
  const filename = searchParams.get('filename');
  const originalName = searchParams.get('originalName'); // Get original name for Content-Disposition

  // --- Input Validation ---
  if (!jobId) {
    return NextResponse.json({ error: 'Missing required parameter: jobId' }, { status: 400 });
  }
  if (!filename) {
    return NextResponse.json({ error: 'Missing required parameter: filename' }, { status: 400 });
  }
   if (!originalName) {
    // While not strictly needed for finding the file, it's crucial for user experience
    console.warn(`Missing originalName for download: jobId=${jobId}, filename=${filename}. Using filename as fallback.`);
    // Fallback to filename if originalName is missing, though ideally it should always be provided
   }

  // Basic security check: prevent path traversal
  if (filename.includes('..') || filename.includes('/')) {
      return NextResponse.json({ error: 'Invalid filename parameter' }, { status: 400 });
  }

  try {
    // --- Construct File Path ---
    // Path needs to go up one level from 'admin' to the root, then into 'urban-planning-portal'
    const filePath = path.join(
      process.cwd(), // Should be /home/tania/urban-planning-professionals-portal/admin
      '..',          // Go up to /home/tania/urban-planning-professionals-portal
      'urban-planning-portal',
      'data',
      'jobs',
      jobId,
      'documents',
      filename
    );

    // --- Check File Existence ---
    if (!existsSync(filePath)) {
      console.error(`File not found at path: ${filePath}`);
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // --- Read File ---
    const fileBuffer = await fs.readFile(filePath);

    // --- Determine Content Type ---
    const contentType = mime.lookup(filename) || 'application/octet-stream'; // Use mime-types or fallback

    // --- Create Response ---
    const response = new NextResponse(fileBuffer);

    // --- Set Headers for Download ---
    response.headers.set('Content-Type', contentType);
    // Use the provided originalName for the download filename, fallback to the stored filename
    response.headers.set(
      'Content-Disposition',
      `attachment; filename="${originalName || filename}"`
    );
     response.headers.set('Content-Length', fileBuffer.length.toString());


    return response;

  } catch (error) {
    console.error(`Error serving file (jobId: ${jobId}, filename: ${filename}):`, error);
    return NextResponse.json({ error: 'Failed to download file due to server error' }, { status: 500 });
  }
}
