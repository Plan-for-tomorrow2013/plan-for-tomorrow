import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import { getWorkTicketsPath, getJobPath, getDocumentsMetadataPath } from '@shared/utils/paths'

export async function POST(request: Request) {
  try {
    const { ticketId } = await request.json()

    if (!ticketId) {
      return NextResponse.json(
        { error: 'Ticket ID is required' },
        { status: 400 }
      )
    }

    // Read work tickets
    const workTicketsPath = getWorkTicketsPath()
    let workTickets = []
    try {
      const workTicketsData = await fs.readFile(workTicketsPath, 'utf-8')
      workTickets = JSON.parse(workTicketsData)
    } catch (readError) {
      if ((readError as NodeJS.ErrnoException).code === 'ENOENT') {
        return NextResponse.json({ error: 'Work tickets file not found.' }, { status: 404 })
      }
      throw readError
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

    // Check if the ticket has a completed document
    if (!ticket.completedDocument) {
      return NextResponse.json(
        { error: 'No completed document found for this ticket' },
        { status: 400 }
      )
    }

    // Ensure the ticket has a jobId
    if (!ticket.jobId) {
      console.error(`Ticket ${ticketId} is missing jobId.`)
      return NextResponse.json({ error: 'Ticket is missing associated Job ID.' }, { status: 400 })
    }

    // Read job data
    const jobPath = getJobPath(ticket.jobId)
    let job
    try {
      const jobData = await fs.readFile(jobPath, 'utf-8')
      job = JSON.parse(jobData)
    } catch (readError) {
      if ((readError as NodeJS.ErrnoException).code === 'ENOENT') {
        return NextResponse.json({ error: 'Job file not found.' }, { status: 404 })
      }
      throw readError
    }

    // Update document metadata
    const metadataPath = getDocumentsMetadataPath()
    try {
      const metadataData = await fs.readFile(metadataPath, 'utf-8')
      const documents = JSON.parse(metadataData)

      // Find and update the document
      const documentIndex = documents.findIndex(
        (doc: any) => doc.metadata?.ticketId === ticketId
      )

      if (documentIndex !== -1) {
        documents[documentIndex].metadata.returnedAt = new Date().toISOString()
        await fs.writeFile(metadataPath, JSON.stringify(documents, null, 2))
      }
    } catch (error) {
      console.error('Error updating document metadata:', error)
    }

    // Update ticket status
    workTickets[ticketIndex] = {
      ...ticket,
      status: 'completed',
      completedDocument: {
        ...ticket.completedDocument,
        returnedAt: new Date().toISOString()
      }
    }

    // Save updated tickets
    await fs.writeFile(workTicketsPath, JSON.stringify(workTickets, null, 2))

    return NextResponse.json(workTickets[ticketIndex])
  } catch (error) {
    console.error('Error returning work ticket:', error)
    return NextResponse.json(
      { error: 'Failed to return work ticket' },
      { status: 500 }
    )
  }
}
