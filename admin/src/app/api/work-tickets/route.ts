import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { WorkTicket } from '../../../../types/workTickets'

// Helper function to get the work tickets file path
// Points to the client portal's work tickets data
const getWorkTicketsPath = () => {
  return path.join(process.cwd(), '..', 'urban-planning-portal', 'data', 'work-tickets.json')
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
  console.log('[API /api/work-tickets] Received POST request');
  try {
    const body = await request.json();
    console.log('[API /api/work-tickets] Request Body:', JSON.stringify(body, null, 2)); // Log the full body

    const { jobId, jobAddress, ticketType, customAssessment, statementOfEnvironmentalEffects, complyingDevelopmentCertificate } = body;
    console.log('[API /api/work-tickets] Destructured Data:', { jobId, jobAddress, ticketType, customAssessment, statementOfEnvironmentalEffects, complyingDevelopmentCertificate }); // Log destructured parts

    // Create new work ticket
    const newTicket: WorkTicket = {
      id: uuidv4(),
      jobId,
      jobAddress,
      ticketType,
      status: 'pending',
      createdAt: new Date().toISOString(),
      ...(ticketType === 'custom-assessment' && customAssessment && {
        customAssessment: {
          developmentType: customAssessment.developmentType,
          additionalInfo: customAssessment.additionalInfo,
          documents: customAssessment.documents,
        },
      }),
      ...(ticketType === 'statement-of-environmental-effects' && statementOfEnvironmentalEffects
        ? {
            statementOfEnvironmentalEffects: {
              developmentType: statementOfEnvironmentalEffects.developmentType,
              additionalInfo: statementOfEnvironmentalEffects.additionalInfo,
              documents: statementOfEnvironmentalEffects.documents,
            },
          }
        : {}), // Use ternary to add empty object if condition fails
      ...(ticketType === 'complying-development-certificate' && complyingDevelopmentCertificate
        ? (() => {
            console.log('[API /api/work-tickets] Processing complyingDevelopmentCertificate:', complyingDevelopmentCertificate); // Log before access
            return {
              complyingDevelopmentCertificate: {
                developmentType: complyingDevelopmentCertificate.developmentType, // Line 57
                additionalInfo: complyingDevelopmentCertificate.additionalInfo,
                documents: complyingDevelopmentCertificate.documents,
              },
            };
          })()
        : {}), // Use ternary to add empty object if condition fails
    }

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
      { error: 'Failed to create work ticket' },
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
