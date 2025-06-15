import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import { getConsultantTicketsPath } from '@shared/utils/paths';
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs

export async function GET() {
  try {
    const filePath = getConsultantTicketsPath();
    console.log('Resolved consultant tickets path for GET:', filePath);
    const data = await fs.readFile(filePath, 'utf8');
    const tickets = JSON.parse(data);
    return NextResponse.json(tickets);
  } catch (error: any) {
    console.error('Error fetching consultant tickets:', error);
    if (error.code === 'ENOENT') {
      console.log('Consultant tickets file not found during GET, returning empty array.');
      return NextResponse.json([]); // Return empty array if file not found
    }
    return NextResponse.json(
      { error: 'Failed to fetch consultant tickets', details: error?.message || String(error) },
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
      console.error('POST /api/consultant-tickets: Metadata is missing from FormData.');
      return NextResponse.json({ error: 'Metadata is required' }, { status: 400 });
    }

    console.log('POST /api/consultant-tickets: Received metadata string:', metadataString);
    const metadata = JSON.parse(metadataString);
    const { jobId, jobAddress, category, assessment } = metadata;

    if (!jobId || !category || !assessment) {
      console.error('POST /api/consultant-tickets: Missing required fields in metadata:', { jobId, category, assessmentExists: !!assessment });
      return NextResponse.json({ error: 'Missing required fields (jobId, category, assessment) in metadata' }, { status: 400 });
    }

    // Optionally, validate category against ConsultantCategory values
    const validCategories = [
      "NatHERS & BASIX",
      "Waste Management",
      "Cost Estimate",
      "Stormwater",
      "Traffic",
      "Surveyor",
      "Bushfire",
      "Flooding",
      "Acoustic",
      "Landscaping",
      "Heritage",
      "Biodiversity",
      "Lawyer",
      "Certifiers",
      "Arborist"
    ];
    if (!validCategories.includes(category)) {
      console.error(`POST /api/consultant-tickets: Invalid category received: ${category}`);
      return NextResponse.json({ error: `Invalid category: ${category}` }, { status: 400 });
    }

    const consultantTicketsPath = getConsultantTicketsPath();
    console.log('POST /api/consultant-tickets: Resolved consultant tickets path for POST:', consultantTicketsPath);
    let consultantTickets = [];
    try {
      const consultantTicketsData = await fs.readFile(consultantTicketsPath, 'utf-8');
      consultantTickets = JSON.parse(consultantTicketsData);
      console.log(`POST /api/consultant-tickets: Successfully read and parsed existing ${consultantTickets.length} consultant tickets.`);
    } catch (readError: any) {
      if (readError.code === 'ENOENT') {
        console.log('POST /api/consultant-tickets: Consultant tickets file not found, will create a new one.');
        // consultantTickets remains an empty array, which is fine.
      } else {
        // If it's any error other than file not found, rethrow it
        console.error("POST /api/consultant-tickets: Error reading consultant tickets file:", readError);
        throw readError;
      }
    }

    const newTicket = {
      id: uuidv4(),
      jobId,
      jobAddress: jobAddress || '',
      category, // ConsultantCategory
      status: 'pending',
      createdAt: new Date().toISOString(),
      assessment, // Store the assessment object directly
      completedDocument: null
    };

    console.log('POST /api/consultant-tickets: Constructed new ticket:', JSON.stringify(newTicket, null, 2));

    consultantTickets.push(newTicket);

    try {
      await fs.writeFile(consultantTicketsPath, JSON.stringify(consultantTickets, null, 2));
      console.log(`POST /api/consultant-tickets: Successfully wrote ${consultantTickets.length} tickets to file.`);
    } catch (writeError: any) {
      console.error('POST /api/consultant-tickets: Error writing consultant tickets file:', writeError);
      throw writeError; // Propagate error to the main catch block
    }

    return NextResponse.json(newTicket, { status: 201 });

  } catch (error: any) {
    console.error('POST /api/consultant-tickets: General error creating consultant ticket:', error);
    // Check if the error is due to JSON parsing from metadataString
    if (error instanceof SyntaxError && metadataString) {
        console.error('POST /api/consultant-tickets: JSON parsing error for metadata:', metadataString);
        return NextResponse.json(
            { error: 'Invalid JSON format in metadata', details: error.message },
            { status: 400 }
        );
    }
    return NextResponse.json(
      { error: 'Failed to create consultant ticket', details: error.message || String(error) },
      { status: 500 }
    );
  }
}
