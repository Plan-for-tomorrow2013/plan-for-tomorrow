import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import { getWorkTicketsPath } from '@shared/utils/paths';
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs

interface WorkTicket {
  id: string;
  jobId: string;
  jobAddress: string;
  ticketType: string;
  status: string;
  createdAt: string;
  [key: string]: any; // For dynamic properties like customAssessment, etc.
  completedDocument: any;
}

interface WorkTicketMetadata {
  jobId: string;
  jobAddress?: string;
  ticketType: string;
  reportData: any;
}

export async function GET() {
  try {
    const filePath = getWorkTicketsPath();
    const data = await fs.readFile(filePath, 'utf8');
    const tickets: WorkTicket[] = JSON.parse(data);
    return NextResponse.json(tickets);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return NextResponse.json([]); // Return empty array if file not found
    }
    return NextResponse.json(
      {
        error: 'Failed to fetch work tickets',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  let metadataString: string | null = null; // Declare here for wider scope
  try {
    const formData = await request.formData();
    metadataString = formData.get('metadata') as string; // Assign here

    if (!metadataString) {
      return NextResponse.json({ error: 'Metadata is required' }, { status: 400 });
    }

    const metadata: WorkTicketMetadata = JSON.parse(metadataString);
    const { jobId, jobAddress, ticketType, reportData } = metadata;

    if (!jobId || !ticketType || !reportData) {
      return NextResponse.json(
        { error: 'Missing required fields (jobId, ticketType, reportData) in metadata' },
        { status: 400 }
      );
    }

    // Validate ticketType to ensure it's one of the expected camelCase values
    const validTicketTypes = [
      'customAssessment',
      'statementOfEnvironmentalEffects',
      'complyingDevelopmentCertificate',
    ];
    if (!validTicketTypes.includes(ticketType)) {
      return NextResponse.json({ error: `Invalid ticketType: ${ticketType}` }, { status: 400 });
    }

    const workTicketsPath = getWorkTicketsPath();
    let workTickets: WorkTicket[] = [];
    try {
      const workTicketsData = await fs.readFile(workTicketsPath, 'utf-8');
      workTickets = JSON.parse(workTicketsData);
    } catch (readError) {
      if ((readError as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw readError;
      }
    }

    const newTicket: WorkTicket = {
      id: uuidv4(),
      jobId,
      jobAddress: jobAddress || '', // Ensure jobAddress is handled
      ticketType, // e.g., "customAssessment" (camelCase)
      status: 'pending', // Initial status for a new ticket
      createdAt: new Date().toISOString(),
      // Embed the reportData (which is the Assessment object) under the key matching the ticketType
      [ticketType]: reportData, // e.g., customAssessment: { developmentType: ..., additionalInfo: ..., documents: ... }
      completedDocument: null, // No completed document when a ticket is first created
    };

    workTickets.push(newTicket);

    try {
      await fs.writeFile(workTicketsPath, JSON.stringify(workTickets, null, 2));
    } catch (writeError) {
      throw writeError; // Propagate error to the main catch block
    }

    return NextResponse.json(newTicket, { status: 201 });
  } catch (error) {
    // Check if the error is due to JSON parsing from metadataString
    if (error instanceof SyntaxError && metadataString) {
      return NextResponse.json(
        { error: 'Invalid JSON format in metadata', details: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      {
        error: 'Failed to create work ticket',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
