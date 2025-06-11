import { NextResponse, NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';
import mime from 'mime-types'; // Using mime-types to determine content type

interface FileDetails {
  id: string;
  originalName: string;
  savedPath: string;
}

interface Assessment {
  id: string;
  title: string;
  content: string;
  author: string;
  date: string;
  file?: FileDetails;
}

interface Section {
  id: string;
  title: string;
  assessments: Assessment[];
}

// Define the absolute path to the JSON data file
const dataFilePath = path.resolve(process.cwd(), 'admin/data/kb-development-application-assessments.json');
// Define the absolute base path for the public documents in the other project
const documentsBasePath = path.resolve(process.cwd(), '../urban-planning-portal/public');

export async function GET(
  request: NextRequest,
  { params }: { params: { assessmentId: string } }
) {
  const fileId = params.assessmentId;

  if (!fileId) {
    return NextResponse.json({ error: 'File ID is required' }, { status: 400 });
  }

  try {
    // Read the JSON data file
    if (!fs.existsSync(dataFilePath)) {
      console.error(`Data file not found at: ${dataFilePath}`);
      return NextResponse.json({ error: 'Assessment data not found' }, { status: 500 });
    }
    const jsonData = fs.readFileSync(dataFilePath, 'utf-8');
    const sections: Section[] = JSON.parse(jsonData);

    // Find the file details by ID
    let fileDetails: FileDetails | null = null;
    for (const section of sections) {
      for (const assessment of section.assessments) {
        if (assessment.file && assessment.file.id === fileId) {
          fileDetails = assessment.file;
          break;
        }
      }
      if (fileDetails) break;
    }

    if (!fileDetails) {
      console.error(`File details not found for ID: ${fileId}`);
      return NextResponse.json({ error: 'File not found in assessment data' }, { status: 404 });
    }

    // Construct the full path to the file
    // Ensure savedPath doesn't start with a slash if documentsBasePath already handles the root
    const relativeSavedPath = fileDetails.savedPath.startsWith('/')
      ? fileDetails.savedPath.substring(1)
      : fileDetails.savedPath;
    const filePath = path.join(documentsBasePath, relativeSavedPath);

    console.log(`Attempting to read file from: ${filePath}`); // Log the path being accessed

    // Check if the file exists
    if (!fs.existsSync(filePath)) {
      console.error(`File not found at path: ${filePath}`);
      return NextResponse.json({ error: 'File not found on server' }, { status: 404 });
    }

    // Read the file content
    const fileBuffer = fs.readFileSync(filePath);

    // Determine the content type
    const contentType = mime.lookup(fileDetails.originalName) || 'application/octet-stream';

    // Create the response with appropriate headers
    const response = new NextResponse(fileBuffer);
    response.headers.set('Content-Type', contentType);
    response.headers.set(
      'Content-Disposition',
      `attachment; fileName="${encodeURIComponent(fileDetails.originalName)}"` // Encode fileName
    );

    return response;

  } catch (error) {
    console.error('Error fetching or processing file:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Internal Server Error', details: errorMessage }, { status: 500 });
  }
}
