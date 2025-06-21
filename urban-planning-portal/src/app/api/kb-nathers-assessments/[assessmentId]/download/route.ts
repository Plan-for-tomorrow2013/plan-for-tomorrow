import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const kbNathersAssessmentsPath =
  '/home/tania/urban-planning-professionals-portal/admin/admin/data/kb-nathers-assessments.json';

export async function GET(request: Request, { params }: { params: { assessmentId: string } }) {
  try {
    const { assessmentId } = params;
    const data = await fs.readFile(kbNathersAssessmentsPath, 'utf8');
    const sections = JSON.parse(data);

    // Find the assessment by file ID
    let fileMeta;
    for (const section of sections) {
      const found = section.assessments.find((a: any) => a.file?.id === assessmentId);
      if (found) {
        fileMeta = found.file;
        break;
      }
    }

    if (!fileMeta) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // For now, read from disk. Later, fetch from Supabase Storage.
    const filePath = path.join(
      process.cwd(),
      'public',
      'documents',
      'kb-nathers-assessments',
      fileMeta.originalName
    );
    console.log('Resolved file path:', filePath);
    await fs.access(filePath);
    const fileBuffer = await fs.readFile(filePath);

    const headers = new Headers();
    headers.set('Content-Type', 'application/pdf');
    headers.set('Content-Disposition', `inline; filename="${fileMeta.originalName}"`);

    return new NextResponse(fileBuffer, { status: 200, headers });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to download assessment' }, { status: 500 });
  }
}
