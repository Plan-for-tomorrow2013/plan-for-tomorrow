import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// Define paths
const prePreparedAssessmentsPath = path.join(
  process.cwd(),
  '..',
  'admin',
  'data',
  'pre-prepared-assessments.json'
);
const documentsBasePath = path.join(process.cwd(), 'public', 'documents', 'pre-prepared');

export async function GET(request: Request, { params }: { params: { assessmentId: string } }) {
  try {
    // Read the assessments data
    const data = await fs.readFile(prePreparedAssessmentsPath, 'utf8');
    const sections = JSON.parse(data);

    // Find the assessment with the matching ID
    let assessment = null;
    for (const section of sections) {
      const found = section.assessments.find((a: any) => a.id === params.assessmentId);
      if (found) {
        assessment = found;
        break;
      }
    }

    if (!assessment || !assessment.file) {
      return NextResponse.json({ error: 'Assessment or file not found' }, { status: 404 });
    }

    // Construct the file path
    const filePath = path.join(documentsBasePath, assessment.file.originalName);

    // Check if file exists
    try {
      await fs.access(filePath);
    } catch (error) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Read the file
    const fileBuffer = await fs.readFile(filePath);

    // Set appropriate headers
    const headers = new Headers();
    headers.set('Content-Type', 'application/octet-stream');
    headers.set('Content-Disposition', `attachment; filename="${assessment.file.originalName}"`);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('Error downloading assessment:', error);
    return NextResponse.json({ error: 'Failed to download assessment' }, { status: 500 });
  }
}
