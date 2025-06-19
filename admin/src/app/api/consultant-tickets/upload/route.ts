import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { getJobDocumentsPath, getConsultantTicketsPath, getDocumentsMetadataPath, ensureDirectoryExists, getJobPath } from '@shared/utils/paths'

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

    // Read the consultant tickets file
    const consultantTicketsPath = getConsultantTicketsPath()
    let consultantTickets = []
    try {
      const consultantTicketsData = await fs.readFile(consultantTicketsPath, 'utf-8')
      consultantTickets = JSON.parse(consultantTicketsData)
    } catch (readError) {
      if ((readError as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw readError
      }
      console.log('Consultant tickets file not found, starting fresh.')
    }

    // Find the ticket to update
    const ticketIndex = consultantTickets.findIndex((ticket: any) => ticket.id === ticketId)
    if (ticketIndex === -1) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      )
    }

    const ticket = consultantTickets[ticketIndex]
    const ticketCategory = ticket.category

    // Ensure the ticket has a jobId
    if (!ticket.jobId) {
      console.error(`Ticket ${ticketId} is missing jobId.`)
      return NextResponse.json(
        { error: 'Ticket is missing associated Job ID.' },
        { status: 400 }
      )
    }

    // Ensure the job documents directory exists
    const jobDocumentsDir = getJobDocumentsPath(ticket.jobId)
    await ensureDirectoryExists(jobDocumentsDir)

    // Define the fileName based on the ticket category
    const fileExtension = path.extname(file.name)
    const storedFileName = `${ticketCategory}${fileExtension}`
    const filePath = path.join(jobDocumentsDir, storedFileName)

    // Save the file
    const fileBuffer = Buffer.from(await file.arrayBuffer())
    await fs.writeFile(filePath, fileBuffer)

    // Map ticket category to the expected documentId used by the client portal
    let clientDocumentId = ticketCategory

    // Update document metadata
    const metadataPath = getDocumentsMetadataPath()
    let documents = []
    try {
      const metadataData = await fs.readFile(metadataPath, 'utf-8')
      documents = JSON.parse(metadataData)
    } catch (readError) {
      if ((readError as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw readError
      }
      console.log('Documents metadata file not found, starting fresh.')
    }

    // Add new document metadata
    documents.push({
      id: clientDocumentId,
      metadata: {
        ticketId,
        jobId: ticket.jobId,
        uploadedAt: new Date().toISOString(),
        fileName: storedFileName,
        originalName: file.name,
        size: file.size,
        type: file.type
      }
    })

    // Save metadata
    await fs.writeFile(metadataPath, JSON.stringify(documents, null, 2))

    // Update the ticket with completed document info
    console.log('[UPLOAD] Ticket object BEFORE update:', JSON.stringify(ticket, null, 2));

    const newTicketData = {
      ...ticket,
      completedDocument: {
        documentId: clientDocumentId,
        originalName: file.name,
        fileName: storedFileName,
        uploadedAt: new Date().toISOString(),
        size: file.size,
        type: file.type,
      },
      consultantId: ticket.consultantId,
      consultantName: ticket.consultantName
    };
    consultantTickets[ticketIndex] = newTicketData;

    // === BEGIN MODIFICATION: Update the Job object with completed report details ===
    try {
      const jobPath = getJobPath(ticket.jobId)
      let job
      try {
        const jobData = await fs.readFile(jobPath, 'utf-8')
        job = JSON.parse(jobData)
      } catch (readError) {
        job = null
      }
      if (job && ticketCategory && job.consultants) {
        // Initialize the consultants array for this category if it doesn't exist
        if (!job.consultants[ticketCategory]) {
          job.consultants[ticketCategory] = [];
        }

        // Find the consultant in the array by consultantId
        const consultantIndex = job.consultants[ticketCategory].findIndex(
          (c: any) => c.consultantId === ticket.consultantId
        );

        const consultantData = {
          name: ticket.consultantName,
          notes: '',
          consultantId: ticket.consultantId,
          assessment: {
            status: 'completed',
            completedDocument: {
              documentId: clientDocumentId,
              originalName: file.name,
              fileName: storedFileName,
              uploadedAt: new Date().toISOString(),
              size: file.size,
              type: file.type,
              returnedAt: new Date().toISOString()
            }
          }
        };

        if (consultantIndex === -1) {
          // Add new consultant to the array
          job.consultants[ticketCategory].push(consultantData);
        } else {
          // Update existing consultant
          job.consultants[ticketCategory][consultantIndex] = {
            ...job.consultants[ticketCategory][consultantIndex],
            ...consultantData
          };
        }

        await fs.writeFile(jobPath, JSON.stringify(job, null, 2))
        console.log(`Job ${ticket.jobId} updated successfully with completed assessment for consultant category ${ticketCategory}.`)
      } else {
        console.warn(`Job or consultant category ${ticketCategory} not found in job object for job ${ticket.jobId}. Cannot update assessment details.`)
      }
    } catch (err) {
      console.error('Error updating job consultants assessment field:', err)
    }
    // === END MODIFICATION ===

    console.log('[UPLOAD] Ticket object AFTER update (before save):', JSON.stringify(consultantTickets[ticketIndex], null, 2));
    console.log('[UPLOAD] Entire consultantTickets array BEFORE save (first 2 tickets):', JSON.stringify(consultantTickets.slice(0,2), null, 2));

    // Save updated tickets
    await fs.writeFile(consultantTicketsPath, JSON.stringify(consultantTickets, null, 2))
    console.log('[UPLOAD] Successfully wrote consultantTicketsPath');

    return NextResponse.json(consultantTickets[ticketIndex])
  } catch (error) {
    console.error('Error handling file upload:', error)
    return NextResponse.json(
      { error: 'Failed to process file upload' },
      { status: 500 }
    )
  }
}
