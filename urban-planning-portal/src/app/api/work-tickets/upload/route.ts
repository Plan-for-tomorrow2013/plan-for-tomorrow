import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import {
  getJobDocumentsPath,
  getWorkTicketsPath,
  getDocumentsMetadataPath,
  ensureDirectoryExists,
} from '@shared/utils/paths';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const ticketId = formData.get('ticketId') as string;

    if (!file || !ticketId) {
      return NextResponse.json({ error: 'File and ticket ID are required' }, { status: 400 });
    }

    // Read the work tickets file
    const workTicketsPath = getWorkTicketsPath();
    const workTicketsData = await fs.readFile(workTicketsPath, 'utf-8');
    const workTickets = JSON.parse(workTicketsData);

    // Find the ticket to update
    const ticketIndex = workTickets.findIndex((ticket: any) => ticket.id === ticketId);
    if (ticketIndex === -1) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    const ticket = workTickets[ticketIndex];

    // Create appropriate documents directory based on ticket type
    const documentsDir = path.join(getDocumentsMetadataPath(), '..', ticket.ticketType);
    await fs.mkdir(documentsDir, { recursive: true });

    // Generate consistent fileName for the file in the shared/staging directory
    const actualSavedFileNameInSharedStore = `${ticketId}-${file.name}`;

    // Save the file to the shared/staging directory
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const filePathInSharedStore = path.join(documentsDir, actualSavedFileNameInSharedStore);
    await fs.writeFile(filePathInSharedStore, fileBuffer);

    // Update the ticket with accurate completed document info
    workTickets[ticketIndex] = {
      ...workTickets[ticketIndex],
      status: 'completed', // This status indicates the admin has uploaded the file;
      // 'return' step will finalize it for the job.
      completedDocument: {
        fileName: actualSavedFileNameInSharedStore, // Name of the file in the shared staging area
        originalName: file.name, // Original name of the uploaded file
        type: file.type || 'application/pdf', // Actual file type from the uploaded file
        size: file.size, // Actual file size from the uploaded file
        uploadedAt: new Date().toISOString(), // Timestamp of this admin upload
      },
    };

    // Save the updated tickets (work-tickets.json)
    await fs.writeFile(workTicketsPath, JSON.stringify(workTickets, null, 2));

    // All logic below this point related to updating the job file (job.json)
    // or copying to the job-specific document store is removed from this endpoint.
    // That responsibility lies with the /api/work-tickets/return endpoint.

    return NextResponse.json(workTickets[ticketIndex]);
  } catch (error) {
    console.error('Error handling file upload:', error);
    return NextResponse.json({ error: 'Failed to process file upload' }, { status: 500 });
  }
}
