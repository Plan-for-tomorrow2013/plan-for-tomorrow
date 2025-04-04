import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

// Helper function to get the work tickets file path
const getWorkTicketsPath = () => {
  return path.join(process.cwd(), 'data', 'work-tickets.json')
}

// Helper function to read work tickets
async function readWorkTickets() {
  const filePath = getWorkTicketsPath()
  const data = await fs.readFile(filePath, 'utf8')
  return JSON.parse(data)
}

// Helper function to write work tickets
async function writeWorkTickets(tickets: any[]) {
  const filePath = getWorkTicketsPath()
  await fs.writeFile(filePath, JSON.stringify(tickets, null, 2))
}

export async function PATCH(
  request: Request,
  { params }: { params: { ticketId: string } }
) {
  try {
    const { ticketId } = params
    const body = await request.json()
    const { status } = body

    // Validate status
    if (!['pending', 'in-progress', 'completed'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }

    // Read existing tickets
    const tickets = await readWorkTickets()

    // Find and update the ticket
    const ticketIndex = tickets.findIndex((t: any) => t.id === ticketId)
    if (ticketIndex === -1) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      )
    }

    const ticket = tickets[ticketIndex]

    // Update the ticket
    tickets[ticketIndex] = {
      ...ticket,
      status,
      // For pre-prepared assessments that are being completed, ensure completedDocument exists
      ...(status === 'completed' 
        ? {
            completedDocument: ticket.completedDocument || {
              fileName: `${ticket.prePreparedAssessment?.assessmentType || 'document'}.pdf`,
              uploadedAt: new Date().toISOString(),
              returnedAt: new Date().toISOString()
            }
          }
        : {})
    }

    // Save updated tickets
    await writeWorkTickets(tickets)

    return NextResponse.json(tickets[ticketIndex])
  } catch (error) {
    console.error('Error updating work ticket:', error)
    return NextResponse.json(
      { error: 'Failed to update work ticket' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { ticketId: string } }
) {
  try {
    const { ticketId } = params

    // Read existing tickets
    const tickets = await readWorkTickets()

    // Find the ticket to delete
    const ticketIndex = tickets.findIndex((t: any) => t.id === ticketId)
    if (ticketIndex === -1) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      )
    }

    // Remove the ticket
    tickets.splice(ticketIndex, 1)

    // Save updated tickets
    await writeWorkTickets(tickets)

    return NextResponse.json({ message: 'Ticket deleted successfully' })
  } catch (error) {
    console.error('Error deleting work ticket:', error)
    return NextResponse.json(
      { error: 'Failed to delete work ticket' },
      { status: 500 }
    )
  }
} 