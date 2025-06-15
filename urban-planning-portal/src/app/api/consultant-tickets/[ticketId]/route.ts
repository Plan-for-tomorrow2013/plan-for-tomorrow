import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import { getConsultantTicketsPath } from '@shared/utils/paths'

// Helper function to read consultant tickets
async function readConsultantTickets() {
  const filePath = getConsultantTicketsPath()
  const data = await fs.readFile(filePath, 'utf8')
  return JSON.parse(data)
}

// Helper function to write consultant tickets
async function writeConsultantTickets(tickets: any[]) {
  const filePath = getConsultantTicketsPath()
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
    const tickets = await readConsultantTickets()

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
    }

    // Save updated tickets
    await writeConsultantTickets(tickets)

    return NextResponse.json(tickets[ticketIndex])
  } catch (error) {
    console.error('Error updating consultant ticket:', error)
    return NextResponse.json(
      { error: 'Failed to update consultant ticket' },
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
    const tickets = await readConsultantTickets()

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
    await writeConsultantTickets(tickets)

    return NextResponse.json({ message: 'Ticket deleted successfully' })
  } catch (error) {
    console.error('Error deleting consultant ticket:', error)
    return NextResponse.json(
      { error: 'Failed to delete consultant ticket' },
      { status: 500 }
    )
  }
}
