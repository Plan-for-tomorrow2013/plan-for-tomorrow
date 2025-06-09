import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { getWorkTicketsPath, getJobPath, getDocumentsPath } from '@shared/utils/paths'

export async function POST(request: Request) {
  try {
    const { ticketId } = await request.json()

    if (!ticketId) {
      return NextResponse.json(
        { error: 'Ticket ID is required' },
        { status: 400 }
      )
    }

    // Read the work tickets file
    const workTicketsPath = getWorkTicketsPath()
    const workTicketsData = await fs.readFile(workTicketsPath, 'utf-8')
    const workTickets = JSON.parse(workTicketsData)

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

    // Define the path to the completed document based on ticket type
    let completedDocPath;
    const baseDocumentsDir = getDocumentsPath();

    // All assessment types use their ticketType as the directory name.
    // ticket.completedDocument.fileName now accurately holds the full name of the file
    // as it was saved in the shared staging directory by the upload route
    // (e.g., "[ticketId]-[originalName].pdf").
    completedDocPath = path.join(
      baseDocumentsDir, // e.g., data/documents
      ticket.ticketType, // e.g., customAssessment
      ticket.completedDocument.fileName // e.g., [ticketId]-[originalName].pdf
    );

    // Check if the completed document exists
    try {
      await fs.access(completedDocPath)
    } catch (error) {
      console.error('Completed document not found:', error)
      return NextResponse.json(
        { error: 'Completed document file not found' },
        { status: 404 }
      )
    }

    // Read the job file
    const jobPath = getJobPath(ticket.jobId)
    let job
    try {
      const jobData = await fs.readFile(jobPath, 'utf-8')
      job = JSON.parse(jobData)
    } catch (error) {
      console.error('Error reading job file:', error)
      return NextResponse.json(
        { error: 'Associated job not found' },
        { status: 404 }
      )
    }

    // Create job documents directory if it doesn't exist
    const jobDocDir = path.join(process.cwd(), 'data', 'jobs', ticket.jobId, 'documents')
    await fs.mkdir(jobDocDir, { recursive: true })

    // Generate a unique fileName for the document
    const timestamp = Date.now()
    const newFileName = `${ticket.ticketType.replace(/-/g, '_')}_${timestamp}_${ticket.completedDocument.fileName}`
    const jobDocPath = path.join(jobDocDir, newFileName)

    // Copy the document to the job's document store
    try {
      await fs.copyFile(completedDocPath, jobDocPath)
    } catch (error) {
      console.error('Error copying document:', error)
      return NextResponse.json(
        { error: 'Failed to copy document to job store' },
        { status: 500 }
      )
    }

    // Initialize documents object if it doesn't exist
    if (!job.documents) {
      job.documents = {}
    }

    // The ticket.ticketType (e.g., 'customAssessment') is already the correct ID
    // that matches DOCUMENT_TYPES[n].id and is used by the frontend for downloads.
    const docIdForJobDocuments = ticket.ticketType; // e.g., 'customAssessment' (camelCase)

    // Add the document to the job's documents using this camelCase ID
    job.documents[docIdForJobDocuments] = {
      fileName: newFileName,
      originalName: ticket.completedDocument.fileName,
      type: ticket.completedDocument.type || 'application/pdf', // Use the actual type from the completed document
      uploadedAt: new Date().toISOString(),
      size: (await fs.stat(completedDocPath)).size
    };

    // Prepare file details for assessment
    const fileDetails = {
      fileName: newFileName,
      originalName: ticket.completedDocument.fileName,
      type: 'application/pdf',
      uploadedAt: new Date().toISOString(),
      size: (await fs.stat(completedDocPath)).size
    }

    // Update the job's assessment status and file details based on ticket type
    if (ticket.ticketType === 'customAssessment') {
      if (!job.customAssessment) {
        job.customAssessment = {};
      }
      job.customAssessment.status = 'completed';
      job.customAssessment.returnedAt = new Date().toISOString();
      job.customAssessment.fileName = fileDetails.fileName;
      job.customAssessment.originalName = fileDetails.originalName;
      job.customAssessment.uploadedAt = fileDetails.uploadedAt;
      job.customAssessment.size = fileDetails.size;
      job.customAssessment.completedDocument = fileDetails;
    } else if (ticket.ticketType === 'statementOfEnvironmentalEffects') {
      if (!job.statementOfEnvironmentalEffects) {
        job.statementOfEnvironmentalEffects = {};
      }
      job.statementOfEnvironmentalEffects.status = 'completed';
      job.statementOfEnvironmentalEffects.returnedAt = new Date().toISOString();
      job.statementOfEnvironmentalEffects.fileName = fileDetails.fileName;
      job.statementOfEnvironmentalEffects.originalName = fileDetails.originalName;
      job.statementOfEnvironmentalEffects.uploadedAt = fileDetails.uploadedAt;
      job.statementOfEnvironmentalEffects.size = fileDetails.size;
      job.statementOfEnvironmentalEffects.completedDocument = fileDetails;
    } else if (ticket.ticketType === 'complyingDevelopmentCertificate') {
      if (!job.complyingDevelopmentCertificate) {
        job.complyingDevelopmentCertificate = {};
      }
      job.complyingDevelopmentCertificate.status = 'completed';
      job.complyingDevelopmentCertificate.returnedAt = new Date().toISOString();
      job.complyingDevelopmentCertificate.fileName = fileDetails.fileName;
      job.complyingDevelopmentCertificate.originalName = fileDetails.originalName;
      job.complyingDevelopmentCertificate.uploadedAt = fileDetails.uploadedAt;
      job.complyingDevelopmentCertificate.size = fileDetails.size;
      job.complyingDevelopmentCertificate.completedDocument = fileDetails;
    } else if (ticket.ticketType === 'wasteManagementAssessment') {
      if (!job.wasteManagementAssessment) {
        job.wasteManagementAssessment = {};
      }
      job.wasteManagementAssessment.status = 'completed';
      job.wasteManagementAssessment.returnedAt = new Date().toISOString();
      job.wasteManagementAssessment.fileName = fileDetails.fileName;
      job.wasteManagementAssessment.originalName = fileDetails.originalName;
      job.wasteManagementAssessment.uploadedAt = fileDetails.uploadedAt;
      job.wasteManagementAssessment.size = fileDetails.size;
      job.wasteManagementAssessment.completedDocument = fileDetails;
    } else {
      throw new Error('Invalid ticket type');
    }

    // Save the updated job data
    try {
      await fs.writeFile(jobPath, JSON.stringify(job, null, 2))
    } catch (error) {
      console.error('Error saving job data:', error)
      return NextResponse.json(
        { error: 'Failed to update job data' },
        { status: 500 }
      )
    }

    // Update the ticket with the return timestamp
    workTickets[ticketIndex] = {
      ...ticket,
      status: 'completed',
      completedDocument: {
        ...ticket.completedDocument,
        returnedAt: new Date().toISOString()
      }
    }

    // Save the updated tickets
    try {
      await fs.writeFile(workTicketsPath, JSON.stringify(workTickets, null, 2))
    } catch (error) {
      console.error('Error saving work tickets:', error)
      return NextResponse.json(
        { error: 'Failed to update work ticket' },
        { status: 500 }
      )
    }

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Document returned successfully',
      ticket: workTickets[ticketIndex]
    }, { status: 200 })
  } catch (error) {
    console.error('Error returning document:', error)
    return NextResponse.json(
      { error: 'Failed to process document return' },
      { status: 500 }
    )
  }
}
