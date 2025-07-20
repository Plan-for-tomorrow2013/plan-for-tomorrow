'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@shared/components/ui/card';
import { ArrowLeft, Upload, FileText, X, Check, Loader2, DollarSign } from 'lucide-react';
import { Button } from '@shared/components/ui/button';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from '@shared/components/ui/alert';
import { Document, DOCUMENT_TYPES, DocumentWithStatus } from '@shared/types/consultants';
import { Job } from '@shared/types/jobs';
import { getReportStatus, getReportTitle } from '@shared/utils/report-utils';
import { ConsultantProvider, useConsultants } from '@shared/contexts/consultant-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  const queryClient = useQueryClient();
  const {
    consultantDocuments: documents,
    isLoading: isDocsLoading,
    error: docsError,
    downloadDocument,
  } = useConsultants();
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

  // Fetch consultant tickets using React Query
  const {
    data: consultantTickets = [],
    isLoading: isTicketsLoading,
    error: ticketsError,
  } = useQuery<ConsultantTicket[]>({
    queryKey: ['consultant-tickets', params.jobId],
    queryFn: async () => {
      const response = await fetch('/api/consultant-tickets');
      if (!response.ok) throw new Error('Failed to fetch consultant tickets');
      const ticketsData = await response.json();
      // Filter tickets for this job
      return ticketsData.filter((ticket: ConsultantTicket) => ticket.jobId === params.jobId);
    },
    refetchInterval: 5000, // Poll every 5 seconds
    refetchIntervalInBackground: true,
  });

  // Fetch work orders using React Query
  const {
    data: workOrders = [],
    isLoading: isWorkOrdersLoading,
    error: workOrdersError,
  } = useQuery<ConsultantWorkOrder[]>({
    queryKey: ['consultant-work-orders', params.jobId],
    queryFn: async () => {
      const response = await fetch('/api/consultant-work-orders');
      if (!response.ok) throw new Error('Failed to fetch work orders');
      const workOrdersData = await response.json();
      // Filter work orders for this job
      return workOrdersData.filter((order: ConsultantWorkOrder) => order.jobId === params.jobId);
    },
    refetchInterval: 5000, // Poll every 5 seconds
    refetchIntervalInBackground: true,
  });

  // Accept quote mutation
  const acceptQuoteMutation = useMutation({
    mutationFn: async (quoteTicketId: string) => {
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

      return response.json();
    },
    // Optimistic update for instant UI feedback
    onMutate: async (quoteTicketId: string) => {
      await queryClient.cancelQueries({ queryKey: ['consultant-tickets', params.jobId] });
      await queryClient.cancelQueries({ queryKey: ['consultant-work-orders', params.jobId] });
      const previousTickets = queryClient.getQueryData<ConsultantTicket[]>(['consultant-tickets', params.jobId]);
      const previousWorkOrders = queryClient.getQueryData<ConsultantWorkOrder[]>(['consultant-work-orders', params.jobId]);
      // Optimistically remove the ticket and add a placeholder work order
      if (previousTickets && previousWorkOrders) {
        const ticket = previousTickets.find(t => t.id === quoteTicketId);
        if (ticket) {
          queryClient.setQueryData(
            ['consultant-tickets', params.jobId],
            previousTickets.filter(t => t.id !== quoteTicketId)
          );
          queryClient.setQueryData(
            ['consultant-work-orders', params.jobId],
            [
              ...previousWorkOrders,
              {
                id: 'optimistic-' + quoteTicketId,
                jobId: ticket.jobId,
                jobAddress: ticket.jobAddress,
                category: ticket.category,
                status: 'in-progress',
                createdAt: new Date().toISOString(),
                consultantId: ticket.consultantId,
                consultantName: ticket.consultantName,
                assessment: ticket.assessment,
                documents: ticket.documents,
              },
            ]
          );
        }
      }
      return { previousTickets, previousWorkOrders };
    },
    onSuccess: (newWorkOrder) => {
      // Invalidate and refetch the relevant queries
      queryClient.invalidateQueries({ queryKey: ['consultant-tickets', params.jobId] });
      queryClient.invalidateQueries({ queryKey: ['consultant-work-orders', params.jobId] });
      queryClient.invalidateQueries({ queryKey: ['job', params.jobId] });
      toast({
        title: 'Quote Accepted',
        description: 'Your quote has been accepted and work has begun.',
      });
    },
    onError: (error, _quoteTicketId, context) => {
      // Rollback optimistic update
      if (context?.previousTickets) {
        queryClient.setQueryData(['consultant-tickets', params.jobId], context.previousTickets);
      }
      if (context?.previousWorkOrders) {
        queryClient.setQueryData(['consultant-work-orders', params.jobId], context.previousWorkOrders);
      }
      console.error('Error accepting quote:', error);
      toast({
        title: 'Error',
        description: 'Failed to accept quote. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Filter documents to only show consultant-generated assessment documents
  const filteredDocuments = documents.filter((doc: DocumentWithStatus) => CONSULTANT_CATEGORIES.includes(doc.category));

  const isLoading = isDocsLoading || isJobLoading || isTicketsLoading || isWorkOrdersLoading;
  const error = docsError || jobError?.message || ticketsError?.message || workOrdersError?.message;

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
      await acceptQuoteMutation.mutateAsync(quoteTicketId);
    } finally {
      setIsAcceptingQuote(null);
    }
  };

  const handleDownloadWorkOrderDocument = async (orderId: string, documentType: 'report' | 'invoice') => {
    try {
      // Find the work order
      const workOrder = workOrders.find((wo) => wo.id === orderId);
      if (!workOrder) throw new Error('Work order not found');
      // Get the correct fileName
      let fileName = '';
      let originalName = '';
      if (documentType === 'report' && workOrder.completedDocument) {
        fileName = workOrder.completedDocument.fileName;
        originalName = workOrder.completedDocument.originalName || fileName;
      } else if (documentType === 'invoice' && workOrder.invoice) {
        fileName = workOrder.invoice.fileName;
        originalName = workOrder.invoice.originalName || fileName;
      } else {
        throw new Error('Requested document not found');
      }
      // Use the download-document endpoint (GET)
      const url = `/api/download-document?jobId=${encodeURIComponent(workOrder.jobId)}&fileName=${encodeURIComponent(fileName)}&originalName=${encodeURIComponent(originalName)}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to download document');
      }
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = originalName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
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
    // Check if there's already a work order for this ticket (quote accepted)
    const hasWorkOrder = workOrders.some(wo => 
      wo.consultantId === ticket.consultantId && 
      wo.category === ticket.category
    );
    
    // If there's a work order, skip showing the ticket tile
    if (hasWorkOrder) {
      return;
    }

    const doc = documents.find(
      (doc: DocumentWithStatus) => doc.category === ticket.category && doc.consultantId === ticket.consultantId
    );
    if (!doc) {
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
                  We are requesting a quote for your "{ticket.category}" Report for {ticket.consultantName}. You will be notified once it's ready.
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
                  disabled={isAcceptingQuote === ticket.id || acceptQuoteMutation.isPending}
                >
                  {isAcceptingQuote === ticket.id || acceptQuoteMutation.isPending ? (
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
