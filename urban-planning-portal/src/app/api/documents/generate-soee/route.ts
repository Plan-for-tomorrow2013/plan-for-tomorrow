import { NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Document, DocumentVersion } from '@shared/types/documents';
import { Document as DocxDocument, Packer, Paragraph, TextRun } from 'docx';
import {
  getJob,
  saveJob,
} from '/home/tania/urban-planning-professionals-portal/shared/services/jobStorage';
import { existsSync, mkdirSync, writeFileSync } from 'fs';

const DOCUMENTS_DIR =
  '/home/tania/urban-planning-professionals-portal/urban-planning-portal/data/documents';
const METADATA_PATH =
  '/home/tania/urban-planning-professionals-portal/urban-planning-portal/data/documents/metadata.json';

export async function POST(request: Request) {
  try {
    const { jobId, uploadedBy, formData } = await request.json();
    if (!jobId || !uploadedBy || !formData) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Generate the Word document (simple example, expand as needed)
    const doc = new DocxDocument({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              children: [
                new TextRun({ text: 'Statement of Environmental Effects', bold: true, size: 32 }),
              ],
            }),
            new Paragraph({
              children: [new TextRun(`Job ID: ${jobId}`)],
            }),
            new Paragraph({
              children: [new TextRun(`Generated by: ${uploadedBy}`)],
            }),
            // Add more content from formData as needed
          ],
        },
      ],
    });
    const buffer = await Packer.toBuffer(doc);

    // Load and parse metadata
    let documents: Document[] = [];
    try {
      const metaRaw = await readFile(METADATA_PATH, 'utf-8');
      documents = JSON.parse(metaRaw);
    } catch (e) {
      documents = [];
    }

    // Find existing SoEE document for this job
    let document = documents.find(doc => doc.title === 'SoEE' && doc.metadata?.jobId === jobId);
    let documentId: string;
    let newVersion: number;
    let fileName: string;
    let filePath: string;
    const now = new Date().toISOString();
    let versionObj: DocumentVersion;

    if (document) {
      // Add new version
      documentId = document.id;
      newVersion = document.currentVersion + 1;
      fileName = `${documentId}-v${newVersion}.docx`;
      filePath = path.join(DOCUMENTS_DIR, fileName);
      await writeFile(filePath, buffer);
      versionObj = {
        version: newVersion,
        uploadedAt: now,
        fileName,
        originalName: 'SoEE.docx',
        size: buffer.length,
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        uploadedBy,
      };
      document.versions.push(versionObj);
      document.currentVersion = newVersion;
      document.updatedAt = now;
    } else {
      // Create new document entry
      documentId = uuidv4();
      newVersion = 1;
      fileName = `${documentId}-v${newVersion}.docx`;
      filePath = path.join(DOCUMENTS_DIR, fileName);
      await writeFile(filePath, buffer);
      versionObj = {
        version: 1,
        uploadedAt: now,
        fileName,
        originalName: 'SoEE.docx',
        size: buffer.length,
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        uploadedBy,
      };
      document = {
        id: documentId,
        title: 'SoEE',
        path: '/soee',
        type: 'document',
        category: 'PLANNING',
        versions: [versionObj],
        currentVersion: 1,
        createdAt: now,
        updatedAt: now,
        isActive: true,
        metadata: { jobId, uploadedBy },
      };
      documents.push(document);
    }

    // Save updated metadata
    await writeFile(METADATA_PATH, JSON.stringify(documents, null, 2));

    // --- Link SoEE document to job's documents object ---
    try {
      const job = getJob(jobId);
      if (job) {
        if (!job.documents) job.documents = {};
        job.documents['soee'] = {
          fileName, // use the generated file name
          originalName: 'SoEE.docx',
          type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          uploadedAt: now,
          size: buffer.length,
        };
        await saveJob(jobId, job);

        // --- Copy SoEE file to job's documents directory ---
        const jobDocsDir = `/home/tania/urban-planning-portal/data/jobs/${jobId}/documents`;
        if (!existsSync(jobDocsDir)) {
          mkdirSync(jobDocsDir, { recursive: true });
        }
        const jobFilePath = `${jobDocsDir}/${fileName}`;
        writeFileSync(jobFilePath, buffer);
      }
    } catch (err) {
      console.error('Failed to link SoEE document to job or copy file:', err);
    }

    return NextResponse.json({ success: true, documentId, version: newVersion });
  } catch (error) {
    console.error('Error generating SoEE document:', error);
    return NextResponse.json({ error: 'Failed to generate SoEE document' }, { status: 500 });
  }
}
