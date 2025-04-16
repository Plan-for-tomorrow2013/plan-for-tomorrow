import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const ticketId = formData.get('ticketId') as string

    if (!file || !ticketId) {
      return NextResponse.json(
        { error: 'File and ticket ID are required' },
        { status: 400 }
      )
    }

    // Read the work tickets file from the client portal's data
    const workTicketsPath = path.join(process.cwd(), '..', 'urban-planning-portal', 'data', 'work-tickets.json')
    let workTickets = []
    try {
      const workTicketsData = await fs.readFile(workTicketsPath, 'utf-8')
      workTickets = JSON.parse(workTicketsData)
    } catch (readError) {
      // If the file doesn't exist, start with an empty array
      if ((readError as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw readError; // Re-throw if it's not a "file not found" error
      }
      console.log('Client work tickets file not found, starting fresh.');
    }

    // Find the ticket to update
    const ticketIndex = workTickets.findIndex((ticket: any) => ticket.id === ticketId)
    if (ticketIndex === -1) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      )
    }

    const ticket = workTickets[ticketIndex]

    // Ensure the ticket has a jobId, crucial for saving to the correct folder
    if (!ticket.jobId) {
      console.error(`Ticket ${ticketId} is missing jobId.`);
      return NextResponse.json(
        { error: 'Ticket is missing associated Job ID.' },
        { status: 400 }
      );
    }

    // Define the job-specific documents directory within the client portal's data structure
    const jobDocumentsDir = path.join(process.cwd(), '..', 'urban-planning-portal', 'data', 'jobs', ticket.jobId, 'documents');
    await fs.mkdir(jobDocumentsDir, { recursive: true });

    // Define a consistent filename for the completed initial assessment report
    // Using the original file extension
    const fileExtension = path.extname(file.name);
    const storedFileName = `initial-assessment-report${fileExtension}`;
    const filePath = path.join(jobDocumentsDir, storedFileName);

    // Save the file
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filePath, fileBuffer);

    // Update the ticket with detailed completed document info
    workTickets[ticketIndex] = {
      ...ticket, // Use the fetched ticket object
      status: 'completed', // Update status
      completedDocument: {
        documentId: 'initial-assessment-report', // Standard ID for this document type
        originalName: file.name, // Original filename
        fileName: storedFileName, // Filename used for storage
        uploadedAt: new Date().toISOString(),
        size: file.size,
        type: file.type,
        // Note: 'returnedAt' will be added in the 'return' step
      }
    };

    // Save the updated tickets
    await fs.writeFile(workTicketsPath, JSON.stringify(workTickets, null, 2))

    return NextResponse.json(workTickets[ticketIndex])
  } catch (error) {
    console.error('Error handling file upload:', error)
    return NextResponse.json(
      { error: 'Failed to process file upload' },
      { status: 500 }
    )
  }
}
