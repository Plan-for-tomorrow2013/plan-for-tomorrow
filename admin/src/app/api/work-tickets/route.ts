import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import { getWorkTicketsPath } from '@shared/utils/paths';
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs

export async function GET() {
  try {
    const filePath = getWorkTicketsPath();
    console.log('Resolved work tickets path for GET:', filePath);
    const data = await fs.readFile(filePath, 'utf8');
    const tickets = JSON.parse(data);
    return NextResponse.json(tickets);
  } catch (error: any) {
    console.error('Error fetching work tickets:', error);
    if (error.code === 'ENOENT') {
      console.log('Work tickets file not found during GET, returning empty array.');
      return NextResponse.json([]); // Return empty array if file not found
    }
    return NextResponse.json(
      { error: 'Failed to fetch work tickets', details: error?.message || String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  let metadataString: string | null = null; // Declare here for wider scope
  try {
    const formData = await request.formData();
    metadataString = formData.get('metadata') as string; // Assign here

    if (!metadataString) {
      console.error('POST /api/work-tickets: Metadata is missing from FormData.');
      return NextResponse.json({ error: 'Metadata is required' }, { status: 400 });
    }

    console.log('POST /api/work-tickets: Received metadata string:', metadataString);
    const metadata = JSON.parse(metadataString);
    const { jobId, jobAddress, ticketType, reportData } = metadata;

    if (!jobId || !ticketType || !reportData) {
      console.error('POST /api/work-tickets: Missing required fields in metadata:', { jobId, ticketType, reportDataExists: !!reportData });
      return NextResponse.json({ error: 'Missing required fields (jobId, ticketType, reportData) in metadata' }, { status: 400 });
    }

    // Validate ticketType to ensure it's one of the expected camelCase values
    const validTicketTypes = ['customAssessment', 'statementOfEnvironmentalEffects', 'complyingDevelopmentCertificate'];
    if (!validTicketTypes.includes(ticketType)) {
      console.error(`POST /api/work-tickets: Invalid ticketType received: ${ticketType}`);
      return NextResponse.json({ error: `Invalid ticketType: ${ticketType}` }, { status: 400 });
    }

    const workTicketsPath = getWorkTicketsPath();
    console.log('POST /api/work-tickets: Resolved work tickets path for POST:', workTicketsPath);
    let workTickets = [];
    try {
      const workTicketsData = await fs.readFile(workTicketsPath, 'utf-8');
      workTickets = JSON.parse(workTicketsData);
      console.log(`POST /api/work-tickets: Successfully read and parsed existing ${workTickets.length} work tickets.`);
    } catch (readError: any) {
      if (readError.code === 'ENOENT') {
        console.log('POST /api/work-tickets: Work tickets file not found, will create a new one.');
        // workTickets remains an empty array, which is fine.
      } else {
        // If it's any error other than file not found, rethrow it
        console.error("POST /api/work-tickets: Error reading work tickets file:", readError);
        throw readError;
      }
    }

    const newTicket = {
      id: uuidv4(),
      jobId,
      jobAddress: jobAddress || '', // Ensure jobAddress is handled
      ticketType, // e.g., "customAssessment" (camelCase)
      status: 'pending', // Initial status for a new ticket
      createdAt: new Date().toISOString(),
      // Embed the reportData (which is the Assessment object) under the key matching the ticketType
      [ticketType]: reportData, // e.g., customAssessment: { developmentType: ..., additionalInfo: ..., documents: ... }
      completedDocument: null // No completed document when a ticket is first created
    };

    console.log('POST /api/work-tickets: Constructed new ticket:', JSON.stringify(newTicket, null, 2));

    workTickets.push(newTicket);

    try {
      await fs.writeFile(workTicketsPath, JSON.stringify(workTickets, null, 2));
      console.log(`POST /api/work-tickets: Successfully wrote ${workTickets.length} tickets to file.`);
    } catch (writeError: any) {
      console.error('POST /api/work-tickets: Error writing work tickets file:', writeError);
      throw writeError; // Propagate error to the main catch block
    }

    return NextResponse.json(newTicket, { status: 201 });

  } catch (error: any) {
    console.error('POST /api/work-tickets: General error creating work ticket:', error);
    // Check if the error is due to JSON parsing from metadataString
    if (error instanceof SyntaxError && metadataString) {
        console.error('POST /api/work-tickets: JSON parsing error for metadata:', metadataString);
        return NextResponse.json(
            { error: 'Invalid JSON format in metadata', details: error.message },
            { status: 400 }
        );
    }
    return NextResponse.json(
      { error: 'Failed to create work ticket', details: error.message || String(error) },
      { status: 500 }
    );
  }
}
