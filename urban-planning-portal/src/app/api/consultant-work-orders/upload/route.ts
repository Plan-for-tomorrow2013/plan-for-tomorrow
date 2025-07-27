import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import {
  getConsultantWorkOrdersPath,
  getDocumentsMetadataPath,
  ensureDirectoryExists,
} from '../../../../../../shared/utils/paths';
import { ConsultantWorkOrder } from '../../../../../../shared/types/consultantsWorkOrder';
import { Document, DocumentVersion } from '../../../../../../shared/types/documents';

// Extend the Document interface for work order metadata
interface WorkOrderDocument extends Document {
  metadata?: {
    jobId?: string;
    uploadedBy?: string;
    title?: string;
    description?: string;
    category?: string;
    path?: string;
    workOrderId?: string;
    documentType?: 'report' | 'invoice';
  };
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const orderId = formData.get('orderId') as string;
    const type = formData.get('type') as 'report' | 'invoice';

    if (!file || !orderId || !type) {
      return NextResponse.json({ error: 'File, order ID, and type are required' }, { status: 400 });
    }

    // Read work orders
    const workOrdersPath = getConsultantWorkOrdersPath();
    let workOrders: ConsultantWorkOrder[] = [];
    try {
      const workOrdersData = await fs.readFile(workOrdersPath, 'utf-8');
      workOrders = JSON.parse(workOrdersData);
    } catch (readError) {
      if ((readError as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw readError;
      }
    }

    // Find the work order
    const orderIndex = workOrders.findIndex(order => order.id === orderId);
    if (orderIndex === -1) {
      return NextResponse.json({ error: 'Work order not found' }, { status: 404 });
    }

    const workOrder = workOrders[orderIndex];

    // Generate unique filename
    const documentId = uuidv4();
    const version = 1;
    const extension = path.extname(file.name);
    const storedFileName = `${documentId}_v${version}${extension}`;

    // Create directory structure
    const uploadDir = path.join(process.cwd(), 'data', 'work-orders', workOrder.id);
    await ensureDirectoryExists(uploadDir);

    // Save file
    const filePath = path.join(uploadDir, storedFileName);
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filePath, buffer);

    // Create document metadata
    const documentVersion: DocumentVersion = {
      version,
      uploadedAt: new Date().toISOString(),
      fileName: storedFileName,
      originalName: file.name,
      size: file.size,
      type: file.type,
      uploadedBy: 'admin',
    };

    const document: WorkOrderDocument = {
      id: documentId,
      title: `${type === 'report' ? 'Final Report' : 'Invoice'} - ${workOrder.category}`,
      path: `work-orders/${workOrder.id}`,
      type: 'document',
      category: type === 'report' ? 'REPORTS' : 'INVOICES',
      versions: [documentVersion],
      currentVersion: version,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true,
      metadata: {
        jobId: workOrder.jobId,
        workOrderId: workOrder.id,
        documentType: type,
        uploadedBy: 'admin',
      },
    };

    // Update work order with document info
    const documentInfo = {
      fileName: storedFileName,
      originalName: file.name,
      uploadedAt: new Date().toISOString(),
      size: file.size,
      type: file.type,
    };

    if (type === 'report') {
      workOrders[orderIndex].completedDocument = documentInfo;
    } else {
      workOrders[orderIndex].invoice = documentInfo;
    }

    // Save updated work orders
    await fs.writeFile(workOrdersPath, JSON.stringify(workOrders, null, 2));

    // Save document metadata
    const metadataPath = getDocumentsMetadataPath();
    try {
      const existingMetadata = await fs.readFile(metadataPath, 'utf-8');
      const documents = JSON.parse(existingMetadata);
      documents.push(document);
      await fs.writeFile(metadataPath, JSON.stringify(documents, null, 2));
    } catch (error) {
      await fs.writeFile(metadataPath, JSON.stringify([document], null, 2));
    }

    return NextResponse.json(workOrders[orderIndex]);
  } catch (error) {
    console.error('Error uploading work order document:', error);
    return NextResponse.json({ error: 'Failed to upload document' }, { status: 500 });
  }
}
