import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import {
  getConsultantWorkOrdersPath,
  getJobPath,
  getDocumentsMetadataPath,
} from '@shared/utils/paths';
import { ConsultantWorkOrder } from '@shared/types/consultantsWorkOrder';
import { Job, Assessment } from '@shared/types/jobs';

type ConsultantReference = {
  name: string;
  notes: string;
  consultantId: string;
  assessment?: Assessment;
};

export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    // Read work orders
    const workOrdersPath = getConsultantWorkOrdersPath();
    let workOrders: ConsultantWorkOrder[] = [];
    try {
      const workOrdersData = await fs.readFile(workOrdersPath, 'utf-8');
      workOrders = JSON.parse(workOrdersData);
    } catch (readError) {
      if ((readError as NodeJS.ErrnoException).code === 'ENOENT') {
        return NextResponse.json({ error: 'Work orders file not found.' }, { status: 404 });
      }
      throw readError;
    }

    // Find the work order
    const orderIndex = workOrders.findIndex(order => order.id === orderId);
    if (orderIndex === -1) {
      return NextResponse.json({ error: 'Work order not found' }, { status: 404 });
    }

    const workOrder = workOrders[orderIndex];

    // Check if both report and invoice are uploaded
    if (!workOrder.completedDocument || !workOrder.invoice) {
      return NextResponse.json(
        { error: 'Both final report and invoice must be uploaded before completing' },
        { status: 400 }
      );
    }

    // Read job data
    const jobPath = getJobPath(workOrder.jobId);
    let job: Job;
    try {
      const jobData = await fs.readFile(jobPath, 'utf-8');
      job = JSON.parse(jobData);
    } catch (readError) {
      if ((readError as NodeJS.ErrnoException).code === 'ENOENT') {
        return NextResponse.json({ error: 'Job file not found.' }, { status: 404 });
      }
      throw readError;
    }

    // Update the job's consultant assessment status
    if (workOrder.category && job.consultants) {
      let consultantsArray = job.consultants[workOrder.category] as
        | ConsultantReference[]
        | undefined;
      if (!consultantsArray) {
        consultantsArray = [];
        job.consultants[workOrder.category] = consultantsArray;
      } else if (!Array.isArray(consultantsArray)) {
        consultantsArray = [consultantsArray as ConsultantReference];
        job.consultants[workOrder.category] = consultantsArray;
      }

      const consultantIndex = consultantsArray.findIndex(
        c => c.consultantId === workOrder.consultantId
      );

      const consultantData = {
        name: workOrder.consultantName,
        notes: '',
        consultantId: workOrder.consultantId,
        assessment: {
          status: 'work_completed' as const,
          completedDocument: {
            ...workOrder.completedDocument!,
            returnedAt: new Date().toISOString(),
          },
          invoice: {
            ...workOrder.invoice!,
            returnedAt: new Date().toISOString(),
          },
        },
      };

      if (consultantIndex === -1) {
        consultantsArray.push(consultantData as any);
      } else {
        consultantsArray[consultantIndex] = {
          ...consultantsArray[consultantIndex],
          ...(consultantData as any),
        };
      }

      // Save the updated job
      try {
        await fs.writeFile(jobPath, JSON.stringify(job, null, 2));
      } catch (writeError) {
        console.error(`Error writing updated job file for ${workOrder.jobId}:`, writeError);
      }
    }

    // Update document metadata
    const metadataPath = getDocumentsMetadataPath();
    try {
      const metadataData = await fs.readFile(metadataPath, 'utf-8');
      const documents = JSON.parse(metadataData);

      // Find and update the documents
      const reportDocIndex = documents.findIndex(
        (doc: any) =>
          doc.metadata?.workOrderId === orderId && doc.metadata?.documentType === 'report'
      );
      const invoiceDocIndex = documents.findIndex(
        (doc: any) =>
          doc.metadata?.workOrderId === orderId && doc.metadata?.documentType === 'invoice'
      );

      if (reportDocIndex !== -1) {
        if (documents[reportDocIndex].metadata) {
          documents[reportDocIndex].metadata!.returnedAt = new Date().toISOString();
        }
      }
      if (invoiceDocIndex !== -1) {
        if (documents[invoiceDocIndex].metadata) {
          documents[invoiceDocIndex].metadata!.returnedAt = new Date().toISOString();
        }
      }

      await fs.writeFile(metadataPath, JSON.stringify(documents, null, 2));
    } catch (readError) {
      if ((readError as NodeJS.ErrnoException).code !== 'ENOENT') {
        console.error('Error updating document metadata:', readError);
      }
    }

    // Update work order status
    workOrders[orderIndex] = {
      ...workOrder,
      status: 'completed',
      completedDocument: {
        ...workOrder.completedDocument!,
        returnedAt: new Date().toISOString(),
      },
      invoice: {
        ...workOrder.invoice!,
        returnedAt: new Date().toISOString(),
      },
    };

    // Save updated work orders
    await fs.writeFile(workOrdersPath, JSON.stringify(workOrders, null, 2));

    return NextResponse.json(workOrders[orderIndex]);
  } catch (error) {
    console.error('Error completing work order:', error);
    return NextResponse.json({ error: 'Failed to complete work order' }, { status: 500 });
  }
}
