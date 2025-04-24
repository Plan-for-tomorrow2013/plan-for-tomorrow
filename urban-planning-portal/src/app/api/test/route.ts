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
    const body = await request.json()
    const { jobId, jobAddress, ticketType, customAssessment, statementOfEnvironmentalEffects, complyingDevelopmentCertificate } = body
    const formData = await request.formData();
    const developmentType = formData.get('developmentType') as string; // Get the section title
    const additionalInfo = formData.get('additionalInfo') as string;
    const documents = formData.get('documents') as File | null;

    // Validate incoming data
    if (!jobId || !jobAddress || !ticketType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    console.log('Received body:', body);

    // Create new work ticket
    const newTicket: WorkTicket = {
      id: uuidv4(),
      jobId,
      jobAddress,
      ticketType,
      status: 'pending',
      createdAt: new Date().toISOString(),
      ...(ticketType === 'custom-assessment' && {
        customAssessment: {
          developmentType: customAssessment?.developmentType,
          additionalInfo: customAssessment?.additionalInfo,
          documents: {
            savedPath: `/initial-assessment/required-documents/${documents?.name}`,
          },
        },
      }),
      ...(ticketType === 'statement-of-environmental-effects' && {
        statementOfEnvironmentalEffects: {
          developmentType: statementOfEnvironmentalEffects?.developmentType,
          additionalInfo: statementOfEnvironmentalEffects?.additionalInfo,
          documents: {
            savedPath: `/initial-assessment/required-documents/${documents?.name}`,
          },
        },
      }),
      ...(ticketType === 'complying-development-certificate' && {
        complyingDevelopmentCertificate: {
          developmentType: complyingDevelopmentCertificate?.developmentType,
          additionalInfo: complyingDevelopmentCertificate?.additionalInfo,
          documents: {
            savedPath: `/initial-assessment/required-documents/${documents?.name}`,
          },
        },
      }),
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
