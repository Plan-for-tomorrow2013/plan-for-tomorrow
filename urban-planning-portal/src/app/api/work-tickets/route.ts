import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { WorkTicket } from '@/types/workTickets'

// Helper function to get the work tickets file path
const getWorkTicketsPath = () => {
  return path.join(process.cwd(), 'data', 'work-tickets.json')
}

// Helper function to read work tickets
async function readWorkTickets(): Promise<WorkTicket[]> {
  try {
    const filePath = getWorkTicketsPath()
    const fileExists = await fs.access(filePath).then(() => true).catch(() => false)

    if (!fileExists) {
      await fs.writeFile(filePath, '[]')
      return []
    }

    const data = await fs.readFile(filePath, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error reading work tickets:', error)
    return []
  }
}

// Helper function to write work tickets
async function writeWorkTickets(tickets: WorkTicket[]) {
  const filePath = getWorkTicketsPath()
  await fs.writeFile(filePath, JSON.stringify(tickets, null, 2))
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Destructure only common fields initially
    const { jobId, jobAddress, ticketType } = body;

    // Validate incoming data
    if (!jobId || !jobAddress || !ticketType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate and extract assessment data based on ticketType
    let assessmentData: any; // Use 'any' for simplicity or create a union type
    let specificDataKey: string = '';

    if (ticketType === 'custom-assessment' && body.customAssessment) {
      assessmentData = body.customAssessment;
      specificDataKey = 'customAssessment';
    } else if (ticketType === 'statement-of-environmental-effects' && body['statement-of-environmental-effects']) {
      assessmentData = body['statement-of-environmental-effects'];
      specificDataKey = 'statementOfEnvironmentalEffects';
    } else if (ticketType === 'complying-development-certificate' && body['complying-development-certificate']) {
      assessmentData = body['complying-development-certificate'];
      specificDataKey = 'complyingDevelopmentCertificate';
    }

    // Validate that the assessment data was found for the given type
    if (!assessmentData || !specificDataKey) {
       return NextResponse.json({ error: `Missing or mismatched data for ticket type: ${ticketType}` }, { status: 400 });
    }

    // Create new work ticket structure using the identified key and data
    const newTicket: WorkTicket = {
      id: uuidv4(),
      jobId,
      jobAddress,
      ticketType,
      status: 'pending',
      createdAt: new Date().toISOString(),
      // Use the identified specificDataKey to nest the data correctly
      [specificDataKey]: {
        developmentType: assessmentData?.developmentType,
        additionalInfo: assessmentData?.additionalInfo,
        documents: assessmentData?.documents,
      },
    };

    // Read existing tickets
    const tickets = await readWorkTickets()

    // Add new ticket
    tickets.push(newTicket)

    // Save updated tickets
    await writeWorkTickets(tickets)

    return NextResponse.json(newTicket)
  } catch (error) {
    console.error('Error creating work ticket:', error)
    return NextResponse.json(
      { error: 'Failed to create work ticket in work ticket route' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const tickets = await readWorkTickets()
    return NextResponse.json(tickets)
  } catch (error) {
    console.error('Error fetching work tickets:', error)
    return NextResponse.json(
      { error: 'Failed to fetch work tickets' },
      { status: 500 }
    )
  }
}
