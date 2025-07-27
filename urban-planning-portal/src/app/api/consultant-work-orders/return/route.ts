import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { getConsultantWorkOrdersPath, getJobPath, getDocumentsPath } from '@shared/utils/paths';
import { Assessment, Job } from '@shared/types/jobs';
import { ConsultantWorkOrder } from '@shared/types/consultantsWorkOrder';

type ConsultantReference = {
  name: string;
  notes: string;
  consultantId: string;
  assessment?: Assessment;
};

export async function POST(request: NextRequest) {
  try {
    const { ticketId } = await request.json();

    if (!ticketId) {
      return NextResponse.json({ error: 'Ticket ID is required' }, { status: 400 });
    }

    // Read the consultant tickets file
    const consultantWorkOrdersPath = getConsultantWorkOrdersPath();
    const consultantWorkOrdersData = await fs.readFile(consultantWorkOrdersPath, 'utf-8');
    const consultantWorkOrders: ConsultantWorkOrder[] = JSON.parse(consultantWorkOrdersData);

    // Find the ticket to update
    const ticketIndex = consultantWorkOrders.findIndex(ticket => ticket.id === ticketId);
    if (ticketIndex === -1) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    const ticket = consultantWorkOrders[ticketIndex];

    // Check if the ticket has a completed document
    if (!ticket.completedDocument) {
      return NextResponse.json(
        { error: 'No completed document found for this ticket' },
        { status: 400 }
      );
    }

    // Define the path to the completed document based on category
    const baseDocumentsDir = getDocumentsPath();
    const completedDocPath = path.join(
      baseDocumentsDir,
      ticket.category,
      ticket.completedDocument.fileName
    );

    // Check if the completed document exists
    try {
      await fs.access(completedDocPath);
    } catch (error) {
      console.error('Completed document not found:', error);
      return NextResponse.json({ error: 'Completed document file not found' }, { status: 404 });
    }

    // Read the job file
    const jobPath = getJobPath(ticket.jobId);
    let job: Job;
    try {
      const jobData = await fs.readFile(jobPath, 'utf-8');
      job = JSON.parse(jobData);
    } catch (error) {
      console.error('Error reading job file:', error);
      return NextResponse.json({ error: 'Associated job not found' }, { status: 404 });
    }

    // Create job documents directory if it doesn't exist
    const jobDocDir = path.join(process.cwd(), 'data', 'jobs', ticket.jobId, 'documents');
    await fs.mkdir(jobDocDir, { recursive: true });

    // Generate a unique fileName for the document
    const timestamp = Date.now();
    const newFileName = `${ticket.category.replace(/\s+/g, '_')}_${timestamp}_${ticket.completedDocument.fileName}`;
    const jobDocPath = path.join(jobDocDir, newFileName);

    // Copy the document to the job's document store
    try {
      await fs.copyFile(completedDocPath, jobDocPath);
    } catch (error) {
      console.error('Error copying document:', error);
      return NextResponse.json({ error: 'Failed to copy document to job store' }, { status: 500 });
    }

    // Initialize documents object if it doesn't exist
    if (!job.documents) {
      job.documents = {};
    }

    // Add the document to the job's documents using the category as the key
    job.documents[ticket.category] = {
      fileName: newFileName,
      originalName: ticket.completedDocument.fileName,
      type: 'application/pdf',
      uploadedAt: new Date().toISOString(),
      size: (await fs.stat(completedDocPath)).size,
    };

    // Prepare file details for assessment
    const fileDetails = {
      fileName: newFileName,
      originalName: ticket.completedDocument.fileName,
      type: 'application/pdf',
      uploadedAt: new Date().toISOString(),
      size: (await fs.stat(completedDocPath)).size,
    };

    // Update the consultant's assessment in the job object
    if (ticket.category && job.consultants && job.consultants[ticket.category]) {
      // Initialize the consultants array for this category if it doesn't exist
      if (!Array.isArray(job.consultants[ticket.category])) {
        // If it exists but is not an array, convert it to an array
        job.consultants[ticket.category] = [
          job.consultants[ticket.category] as unknown as ConsultantReference,
        ];
      }

      // Ensure the array exists and find the consultant by consultantId
      const consultantsArray = job.consultants[ticket.category] as Array<ConsultantReference>;

      const consultantIndex = consultantsArray.findIndex(
        c => c.consultantId === ticket.consultantId
      );

      if (consultantIndex !== -1) {
        if (!consultantsArray[consultantIndex].assessment) {
          consultantsArray[consultantIndex].assessment = {};
        }
        consultantsArray[consultantIndex].assessment.status = 'completed';
        consultantsArray[consultantIndex].assessment.returnedAt = new Date().toISOString();
        consultantsArray[consultantIndex].assessment.completedDocument = fileDetails;
        // Optionally remove old top-level file properties if they exist
        delete consultantsArray[consultantIndex].assessment.fileName;
        delete consultantsArray[consultantIndex].assessment.originalName;
      } else {
        console.warn(
          `Consultant with ID ${ticket.consultantId} not found in category ${ticket.category} for job ${ticket.jobId}.`
        );
      }
    } else {
      console.warn(
        `Consultant category ${ticket.category} not found in job object for job ${ticket.jobId}. Cannot update assessment details.`
      );
    }

    // Save the updated job data
    try {
      await fs.writeFile(jobPath, JSON.stringify(job, null, 2));
    } catch (error) {
      console.error('Error saving job data:', error);
      return NextResponse.json({ error: 'Failed to update job data' }, { status: 500 });
    }

    // Update the ticket with the return timestamp
    consultantWorkOrders[ticketIndex] = {
      ...ticket,
      status: 'completed',
      completedDocument: {
        ...ticket.completedDocument,
        returnedAt: new Date().toISOString(),
      },
    };

    // Save the updated tickets
    try {
      await fs.writeFile(consultantWorkOrdersPath, JSON.stringify(consultantWorkOrders, null, 2));
    } catch (error) {
      console.error('Error saving consultant tickets:', error);
      return NextResponse.json({ error: 'Failed to update consultant ticket' }, { status: 500 });
    }

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: 'Document returned successfully',
        ticket: consultantWorkOrders[ticketIndex],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error returning document:', error);
    return NextResponse.json({ error: 'Failed to process document return' }, { status: 500 });
  }
}
