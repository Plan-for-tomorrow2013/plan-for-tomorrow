import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import { getConsultantWorkOrdersPath } from '@shared/utils/paths';
import { ConsultantWorkOrder } from '@shared/types/consultantsWorkOrder';

// Helper function to read consultant tickets
async function readConsultantWorkOrders(): Promise<ConsultantWorkOrder[]> {
  const filePath = getConsultantWorkOrdersPath();
  const data = await fs.readFile(filePath, 'utf8');
  return JSON.parse(data);
}

// Helper function to write consultant tickets
async function writeConsultantWorkOrders(tickets: ConsultantWorkOrder[]) {
  const filePath = getConsultantWorkOrdersPath();
  await fs.writeFile(filePath, JSON.stringify(tickets, null, 2));
}

export async function PATCH(request: NextRequest, { params }: { params: { ticketId: string } }) {
  try {
    const { ticketId } = params;
    const body = await request.json();
    const { status } = body;

    // Validate status
    if (!['pending', 'in-progress', 'paid', 'completed'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // Read existing tickets
    const tickets = await readConsultantWorkOrders();

    // Find and update the ticket
    const ticketIndex = tickets.findIndex((t: ConsultantWorkOrder) => t.id === ticketId);
    if (ticketIndex === -1) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    const ticket = tickets[ticketIndex];

    // Update the ticket
    tickets[ticketIndex] = {
      ...ticket,
      status,
    };

    // If status is 'paid', update the job object's consultant assessment status
    if (status === 'paid') {
      const { getJob, saveJob } = await import('@shared/services/jobStorage');
      const job = getJob(ticket.jobId);
      if (job) {
        job.consultants = job.consultants ?? {};
        let consultantsArray = job.consultants[ticket.category];
        if (!consultantsArray) {
          consultantsArray = [];
          job.consultants[ticket.category] = consultantsArray;
        } else if (!Array.isArray(consultantsArray)) {
          consultantsArray = [consultantsArray as any];
          job.consultants[ticket.category] = consultantsArray;
        }

        const consultantIndex = consultantsArray.findIndex(
          c => c.consultantId === ticket.consultantId
        );
        const now = new Date().toISOString();
        if (consultantIndex !== -1) {
          consultantsArray[consultantIndex].assessment = {
            ...(consultantsArray[consultantIndex].assessment || {}),
            status: 'paid',
            updatedAt: now,
          };
        } else {
          consultantsArray.push({
            name: ticket.consultantName,
            notes: '',
            consultantId: ticket.consultantId,
            assessment: { status: 'paid', updatedAt: now },
          });
        }
        await saveJob(ticket.jobId, job);
      }
    }

    // Save updated tickets
    await writeConsultantWorkOrders(tickets);

    return NextResponse.json(tickets[ticketIndex]);
  } catch (error) {
    console.error('Error updating consultant ticket:', error);
    return NextResponse.json({ error: 'Failed to update consultant ticket' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { ticketId: string } }) {
  try {
    const { ticketId } = params;

    // Read existing tickets
    const tickets = await readConsultantWorkOrders();

    // Find the ticket to delete
    const ticketIndex = tickets.findIndex((t: ConsultantWorkOrder) => t.id === ticketId);
    if (ticketIndex === -1) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    // Remove the ticket
    tickets.splice(ticketIndex, 1);

    // Save updated tickets
    await writeConsultantWorkOrders(tickets);

    return NextResponse.json({ message: 'Ticket deleted successfully' });
  } catch (error) {
    console.error('Error deleting consultant ticket:', error);
    return NextResponse.json({ error: 'Failed to delete consultant ticket' }, { status: 500 });
  }
}
