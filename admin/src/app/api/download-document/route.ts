import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { existsSync } from 'fs';
import mime from 'mime-types'; // Using mime-types for better content-type detection

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get('jobId');
  const fileName = searchParams.get('fileName');
  const originalName = searchParams.get('originalName'); // Get original name for Content-Disposition

  // --- Input Validation ---
  if (!jobId) {
    return NextResponse.json({ error: 'Missing required parameter: jobId' }, { status: 400 });
  }
  if (!fileName) {
    return NextResponse.json({ error: 'Missing required parameter: fileName' }, { status: 400 });
  }
   if (!originalName) {
    // While not strictly needed for finding the file, it's crucial for user experience
    console.warn(`Missing originalName for download: jobId=${jobId}, fileName=${fileName}. Using fileName as fallback.`);
    // Fallback to fileName if originalName is missing, though ideally it should always be provided
   }

  // Basic security check: prevent path traversal
  if (fileName.includes('..') || fileName.includes('/')) {
      return NextResponse.json({ error: 'Invalid fileName parameter' }, { status: 400 });
  }

  try {
    // --- Construct File Path ---
    // Path needs to go up one level from 'admin' to the root, then into 'urban-planning-portal'
    const jobFilePath = path.join(
      process.cwd(), // Should be /home/tania/urban-planning-professionals-portal/admin
      '..',          // Go up to /home/tania/urban-planning-professionals-portal
      'urban-planning-portal',
      'data',
      'jobs',
      jobId,
      'documents',
      fileName
    );
    const globalFilePath = path.join(
      process.cwd(),
      '..',
      'urban-planning-portal',
      'data',
      'documents',
      fileName
    );

    let filePathToUse = jobFilePath;
    if (!existsSync(jobFilePath) && existsSync(globalFilePath)) {
      filePathToUse = globalFilePath;
    }

    // --- Check File Existence ---
    if (!existsSync(filePathToUse)) {
      console.error(`File not found at path: ${filePathToUse}`);
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // --- Read File ---
    const fileBuffer = await fs.readFile(filePathToUse);

    // --- Determine Content Type ---
    const contentType = mime.lookup(fileName) || 'application/octet-stream'; // Use mime-types or fallback

    // --- Create Response ---
    const response = new NextResponse(fileBuffer);

    // --- Set Headers for Download ---
    response.headers.set('Content-Type', contentType);
    // Use the provided originalName for the download fileName, fallback to the stored fileName
    response.headers.set(
      'Content-Disposition',
      `attachment; fileName="${originalName || fileName}"`
    );
     response.headers.set('Content-Length', fileBuffer.length.toString());


    return response;

  } catch (error) {
    console.error(`Error serving file (jobId: ${jobId}, fileName: ${fileName}):`, error);
    return NextResponse.json({ error: 'Failed to download file due to server error' }, { status: 500 });
  }
}
