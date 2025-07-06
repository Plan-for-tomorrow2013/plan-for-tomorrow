'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@shared/components/ui/card';
import { ArrowLeft, Upload, FileText, X, Check, Loader2, DollarSign } from 'lucide-react';
import { Button } from '@shared/components/ui/button';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from '@shared/components/ui/alert';
import { Document, DOCUMENT_TYPES, DocumentWithStatus } from '@shared/types/consultants';
import { Job } from '@shared/types/jobs';
import { getReportStatus, getReportTitle } from '@shared/utils/report-utils';
import { ConsultantProvider, useConsultants } from '@shared/contexts/consultant-context';
import { useQuery } from '@tanstack/react-query';
import { handleDocumentDownload } from '@shared/utils/document-utils';
import { ConsultantTicket } from '@shared/types/consultantsTickets';
import { ConsultantWorkOrder } from '@shared/types/consultantsWorkOrder';
import { useToast } from '@shared/components/ui/use-toast';

// Define consultant categories
const CONSULTANT_CATEGORIES = [
  'NatHERS & BASIX',
  'Waste Management',
  'Cost Estimate',
  'Stormwater',
  'Traffic',
  'Surveyor',
  'Bushfire',
  'Flooding',
  'Acoustic',
  'Landscaping',
  'Heritage',
  'Biodiversity',
  'Lawyer',
  'Certifiers',
  'Arborist',
  'Geotechnical',
];

function ConsultantStoreContent({ params }: { params: { jobId: string } }) {
  const router = useRouter();
  const {
    consultantDocuments: documents,
    isLoading: isDocsLoading,
    error: docsError,
    downloadDocument,
  } = useConsultants();
  const [consultantTickets, setConsultantTickets] = useState<ConsultantTicket[]>([]);
  const [workOrders, setWorkOrders] = useState<ConsultantWorkOrder[]>([]);
  const [isAcceptingQuote, setIsAcceptingQuote] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch job data for report status
  const {
    data: job,
    isLoading: isJobLoading,
    error: jobError,
  } = useQuery<Job>({
    queryKey: ['job', params.jobId],
    queryFn: async () => {
      const response = await fetch(`/api/jobs/${params.jobId}`);
      if (!response.ok) throw new Error('Failed to fetch job data');
      return response.json();
    },
  });

  useEffect(() => {
    fetchData();
  }, [params.jobId]);

  const fetchData = async () => {
    try {
      const [ticketsRes, workOrdersRes] = await Promise.all([
        fetch('/api/consultant-tickets'),
        fetch('/api/consultant-work-orders'),
      ]);

      if (ticketsRes.ok) {
        const ticketsData = await ticketsRes.json();
        // Filter tickets for this job
        const jobTickets = ticketsData.filter((ticket: ConsultantTicket) => ticket.jobId === params.jobId);
        setConsultantTickets(jobTickets);
      }

      if (workOrdersRes.ok) {
        const workOrdersData = await workOrdersRes.json();
        // Filter work orders for this job
        const jobWorkOrders = workOrdersData.filter((order: ConsultantWorkOrder) => order.jobId === params.jobId);
        setWorkOrders(jobWorkOrders);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  // Filter documents to only show consultant-generated assessment documents
  const filteredDocuments = documents.filter((doc: DocumentWithStatus) => CONSULTANT_CATEGORIES.includes(doc.category));

  const isLoading = isDocsLoading || isJobLoading;
  const error = docsError || jobError?.message;

  const handleUpload = (docId: string) => {
    // Consultant documents are read-only, no upload functionality needed
    console.log('Upload not available for consultant documents');
  };

  const handleDownload = (docId: string) => {
    console.log('[Consultant Store] Download button clicked for', docId);
    handleDocumentDownload(() => {
      console.log('[Consultant Store] Calling downloadDocument for', params.jobId, docId);
      return downloadDocument(params.jobId, docId);
    });
  };

  const handleDelete = (docId: string) => {
    // Consultant documents are read-only, no delete functionality needed
    console.log('Delete not available for consultant documents');
  };

  const handleAcceptQuote = async (quoteTicketId: string) => {
    setIsAcceptingQuote(quoteTicketId);
    try {
      // Find the ticket by ID
      const ticket = consultantTickets.find(t => t.id === quoteTicketId);
      if (!ticket) {
        throw new Error('Consultant ticket not found');
      }
      const response = await fetch('/api/consultant-work-orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quoteTicketId: ticket.id,
          jobId: ticket.jobId,
          category: ticket.category,
          consultantId: ticket.consultantId,
          consultantName: ticket.consultantName,
          jobAddress: ticket.jobAddress,
          assessment: ticket.assessment,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to accept quote');
      }

      const newWorkOrder = await response.json();
      setWorkOrders(prev => [...prev, newWorkOrder]);
      
      // Remove the quote ticket from the list
      setConsultantTickets(prev => prev.filter(ticket => ticket.id !== quoteTicketId));

      toast({
        title: 'Quote Accepted',
        description: 'Your quote has been accepted and work has begun.',
      });

      // Refresh data to update the display
      fetchData();
    } catch (error) {
      console.error('Error accepting quote:', error);
      toast({
        title: 'Error',
        description: 'Failed to accept quote. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsAcceptingQuote(null);
    }
  };

  const handleDownloadWorkOrderDocument = async (orderId: string, documentType: 'report' | 'invoice') => {
    try {
      const response = await fetch('/api/consultant-work-orders/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          documentType,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to download document');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = documentType === 'report' ? 'final-report.pdf' : 'invoice.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading document:', error);
      toast({
        title: 'Error',
        description: 'Failed to download document',
        variant: 'destructive',
      });
    }
  };

  // Type guard for Job (add more fields as needed)
  function isFullJob(obj: any): obj is import('@shared/types/jobs').Job {
    return (
      obj && typeof obj === 'object' && 'council' in obj && 'status' in obj && 'createdAt' in obj
    );
  }

  // For each ticket, find the relevant document and use getReportStatus or fallback
  const tiles: Array<{ key: string; element: JSX.Element }> = [];
  const uniqueTickets = consultantTickets.filter(
    (ticket, idx, arr) =>
      arr.findIndex(
        t => t.consultantId === ticket.consultantId && t.category === ticket.category
      ) === idx
  );

  // Add completed work orders
  workOrders.forEach((workOrder) => {
    if (workOrder.status === 'completed' && workOrder.completedDocument && workOrder.invoice) {
      tiles.push({
        key: `work-order-${workOrder.id}`,
        element: (
          <Card key={workOrder.id} className="shadow-md">
            <CardHeader className="bg-green-600 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">Completed Work</h3>
                  <p className="text-sm text-gray-200">{workOrder.category}</p>
                  <p className="text-sm text-gray-300 font-semibold mt-1">
                    {workOrder.consultantName}
                  </p>
                </div>
                <Check className="h-5 w-5 text-green-400" />
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FileText className="h-4 w-4" />
                  <span>Final Report</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Completed: {workOrder.completedDocument.returnedAt 
                    ? new Date(workOrder.completedDocument.returnedAt).toLocaleDateString()
                    : new Date(workOrder.completedDocument.uploadedAt).toLocaleDateString()}
                </p>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleDownloadWorkOrderDocument(workOrder.id, 'report')}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Download Final Report
                </Button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <DollarSign className="h-4 w-4" />
                  <span>Invoice</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Generated: {workOrder.invoice.returnedAt 
                    ? new Date(workOrder.invoice.returnedAt).toLocaleDateString()
                    : new Date(workOrder.invoice.uploadedAt).toLocaleDateString()}
                </p>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleDownloadWorkOrderDocument(workOrder.id, 'invoice')}
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  Download Invoice
                </Button>
              </div>

              {workOrder.quoteAmount && (
                <div className="text-center text-sm text-gray-600 bg-gray-50 p-2 rounded">
                  Total Amount: ${workOrder.quoteAmount}
                </div>
              )}
            </CardContent>
          </Card>
        ),
      });
      return;
    }

    // Show in-progress work orders
    if (workOrder.status === 'in-progress') {
      tiles.push({
        key: `work-order-progress-${workOrder.id}`,
        element: (
          <Card key={workOrder.id} className="shadow-md">
            <CardHeader className="bg-blue-600 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">Work In Progress</h3>
                  <p className="text-sm text-gray-200">{workOrder.category}</p>
                  <p className="text-sm text-gray-300 font-semibold mt-1">
                    {workOrder.consultantName}
                  </p>
                </div>
                <Loader2 className="h-5 w-5 text-blue-400 animate-spin" />
              </div>
            </CardHeader>
            <CardContent className="p-4 text-center">
              <div className="flex flex-col items-center justify-center space-y-2 py-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 text-blue-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p className="font-semibold text-lg">Work In Progress</p>
                <p className="text-sm text-gray-600 px-4">
                  Thank you for accepting your quote for {workOrder.category} assessment. You will be notified once it's ready.
                </p>
                <p className="text-xs text-gray-500">
                  Accepted: {new Date(workOrder.acceptedAt || workOrder.createdAt).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>
        ),
      });
      return;
    }
  });

  uniqueTickets.forEach(ticket => {
    const doc = documents.find(
      (doc: DocumentWithStatus) => doc.category === ticket.category && doc.consultantId === ticket.consultantId
    );
    if (!doc) {
      // Check if there's a work order for this ticket (quote accepted)
      const hasWorkOrder = workOrders.some(wo => 
        wo.consultantId === ticket.consultantId && 
        wo.category === ticket.category
      );
      
      // Show pending consultant ticket
      tiles.push({
        key: `ticket-pending-${ticket.id}`,
        element: (
          <Card key={ticket.id} className="shadow-md">
            <CardHeader className="bg-[#323A40] text-white">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">{ticket.consultantName}</h3>
                  <p className="text-sm text-gray-300">{ticket.category}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 text-center">
              <div className="flex flex-col items-center justify-center space-y-2 py-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 text-blue-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p className="font-semibold text-lg">Report In Progress</p>
                <p className="text-sm text-gray-600 px-4">
                  {hasWorkOrder 
                    ? `Thank you for accepting your quote for "${ticket.category}" Report for ${ticket.consultantName}. You will be notified once it's ready.`
                    : `We are processing your "${ticket.category}" Report for ${ticket.consultantName}. You will be notified once it's ready.`
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        ),
      });
      return;
    }
    let reportStatus: any = null;
    if (doc && job && isFullJob(job)) {
      reportStatus = getReportStatus(doc, job);
    }
    const isCompleted = doc && doc.uploadedFile && !!doc.uploadedFile.returnedAt;
    const hasFile = doc && doc.uploadedFile && !!doc.uploadedFile.fileName;

    if (
      (reportStatus && reportStatus.isCompleted && reportStatus.hasFile) ||
      (!reportStatus && isCompleted && hasFile)
    ) {
      tiles.push({
        key: `doc-${doc.id}-${ticket.consultantId}`,
        element: (
          <Card key={doc.id} className="shadow-md">
            <CardHeader className="bg-[#323A40] text-white">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">{ticket.consultantName}</h3>
                  <p className="text-sm text-gray-300">{doc.category}</p>
                </div>
                <Check className="h-5 w-5 text-green-400" />
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-[#323A40]">
                  <FileText className="h-4 w-4" />
                  <span>
                    {doc.title || (getReportTitle(doc.id) !== 'Unknown Report' ? getReportTitle(doc.id) : '') || doc.category || 'Consultant Report'}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Uploaded:{' '}
                  {doc.uploadedFile?.uploadedAt
                    ? new Date(doc.uploadedFile.uploadedAt).toLocaleDateString()
                    : 'N/A'}
                </p>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleDownload(doc.id)}
                  disabled={!hasFile}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Download Quote
                </Button>
                <Button
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={() => handleAcceptQuote(ticket.id)}
                  disabled={isAcceptingQuote === ticket.id}
                >
                  {isAcceptingQuote === ticket.id ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Accepting Quote...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Accept Quote
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ),
      });
      return;
    }
    if (reportStatus && reportStatus.isPaid && !reportStatus.isCompleted) {
      tiles.push({
        key: `ticket-inprogress-${ticket.id}`,
        element: (
          <Card key={ticket.id} className="shadow-md">
            <CardHeader className="bg-[#323A40] text-white">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">{ticket.consultantName}</h3>
                  <p className="text-sm text-gray-300">{ticket.category}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 text-center">
              <div className="flex flex-col items-center justify-center space-y-2 py-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 text-blue-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p className="font-semibold text-lg">Report In Progress</p>
                <p className="text-sm text-gray-600 px-4">
                  Our team is working on your {getReportTitle(doc.id)}. You will be notified once
                  it's ready.
                </p>
              </div>
            </CardContent>
          </Card>
        ),
      });
      return;
    }
    // Otherwise, show in-progress consultant ticket (fallback)
    tiles.push({
      key: `ticket-${ticket.id}`,
      element: (
        <Card key={ticket.id} className="shadow-md">
          <CardHeader className="bg-[#323A40] text-white">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">{ticket.consultantName}</h3>
                <p className="text-sm text-gray-300">{ticket.category}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 text-center">
            <div className="flex flex-col items-center justify-center space-y-2 py-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 text-blue-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="font-semibold text-lg">Report In Progress</p>
              <p className="text-sm text-gray-600 px-4">
                Thank you for accepting your quote for "{ticket.category}" Report for {ticket.consultantName}. You
                will be notified once it's ready.
              </p>
            </div>
          </CardContent>
        </Card>
      ),
    });
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Consultant Store</h1>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div>Loading documents...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tiles.map(tile => tile.element)}
        </div>
      )}
    </div>
  );
}

export default function ConsultantStorePage({ params }: { params: { jobId: string } }) {
  return (
    <ConsultantProvider jobId={params.jobId}>
      <ConsultantStoreContent params={params} />
    </ConsultantProvider>
  );
}
