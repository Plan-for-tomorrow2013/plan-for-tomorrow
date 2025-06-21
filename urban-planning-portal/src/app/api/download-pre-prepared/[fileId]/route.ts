import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import mime from 'mime-types'; // Using mime-types to determine content type

// Define the base directory where admin pre-prepared documents are stored
// IMPORTANT: Adjust this path if the actual storage location is different
const ADMIN_DOCUMENTS_BASE_PATH = path.resolve(
  process.cwd(),
  '../../admin/admin/public/documents/pre-prepared'
);

// Define the path to the metadata JSON file in the admin portal
const METADATA_PATH = path.resolve(
  process.cwd(),
  '../../admin/admin/data/pre-prepared-assessments.json'
);

export async function GET(request: Request, { params }: { params: { fileId: string } }) {
  const { fileId } = params;

  if (!fileId) {
    return NextResponse.json({ error: 'File ID is required' }, { status: 400 });
  }

  console.log(`Download request received for fileId: ${fileId}`);

  try {
    // 1. Read the metadata to find the file details using the fileId
    let assessmentMetadata;
    try {
      const metadataContent = await fs.readFile(METADATA_PATH, 'utf8');
      const allAssessments: any[] = JSON.parse(metadataContent);
      // Find the assessment that contains the matching file ID
      assessmentMetadata = allAssessments.find(assessment => assessment.file?.id === fileId);

      if (!assessmentMetadata || !assessmentMetadata.file) {
        console.error(`File metadata not found for fileId: ${fileId} in ${METADATA_PATH}`);
        return NextResponse.json({ error: 'File not found or metadata missing' }, { status: 404 });
      }
      console.log(`Found metadata for fileId ${fileId}:`, assessmentMetadata.file);
    } catch (error) {
      console.error(`Error reading or parsing metadata file ${METADATA_PATH}:`, error);
      return NextResponse.json({ error: 'Failed to read file metadata' }, { status: 500 });
    }

    // 2. Construct the full path to the actual file using the savedPath from metadata
    // The savedPath is relative to the admin public dir, e.g., /documents/pre-prepared/some-id.pdf
    // We need the fileName part: some-id.pdf
    const fileNameFromPath = path.basename(assessmentMetadata.file.savedPath);
    const filePath = path.join(ADMIN_DOCUMENTS_BASE_PATH, fileNameFromPath);

    console.log(`Constructed file path: ${filePath}`);

    // 3. Check if the file exists at the constructed path
    try {
      await fs.access(filePath);
      console.log(`File exists at: ${filePath}`);
    } catch (accessError) {
      console.error(`File not found at path: ${filePath}`, accessError);
      return NextResponse.json({ error: 'File not found on server' }, { status: 404 });
    }

    // 4. Read the file content
    const fileBuffer = await fs.readFile(filePath);
    console.log(`Successfully read file: ${filePath}`);

    // 5. Determine the content type
    const contentType = mime.lookup(filePath) || 'application/octet-stream';
    console.log(`Determined content type: ${contentType}`);

    // 6. Create the response with appropriate headers
    const response = new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        // Use the originalName from metadata for the download fileName
        'Content-Disposition': `attachment; fileName="${assessmentMetadata.file.originalName}"`,
      },
    });

    console.log(`Sending file ${assessmentMetadata.file.originalName} to client.`);
    return response;
  } catch (error) {
    console.error(`Unexpected error processing download for fileId ${fileId}:`, error);
    return NextResponse.json({ error: 'Failed to process file download' }, { status: 500 });
  }
}
