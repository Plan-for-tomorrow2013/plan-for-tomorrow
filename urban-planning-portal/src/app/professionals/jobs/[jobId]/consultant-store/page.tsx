'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader } from "@shared/components/ui/card"
import { ArrowLeft, Upload, FileText, X, Check } from 'lucide-react'
import { Button } from "@shared/components/ui/button"
import { useRouter } from 'next/navigation'
import { Alert, AlertDescription, AlertTitle } from "@shared/components/ui/alert"
import { Document, DOCUMENT_TYPES, DocumentWithStatus } from '@shared/types/documents'
import { toast } from "@shared/components/ui/use-toast"
import { useJobs } from '@shared/hooks/useJobs'
import type { Job } from '@shared/types/jobs'
import { getReportStatus, isReportType, getReportTitle, getDocumentDisplayStatus } from '@shared/utils/report-utils'
import { DocumentProvider, useDocuments } from '@shared/contexts/document-context'
import { SiteDetailsProvider, useSiteDetails } from '@shared/contexts/site-details-context'
import { useQuery } from '@tanstack/react-query'
import { createFileInput, handleDocumentUpload, handleDocumentDownload, handleDocumentDelete } from '@shared/utils/document-utils'
import type { ConsultantTicket } from '@shared/types/consultantsTickets'

// Define consultant categories
const CONSULTANT_CATEGORIES = [
  "NatHERS & BASIX",
  "Waste Management",
  "Cost Estimate",
  "Stormwater",
  "Traffic",
  "Surveyor",
  "Bushfire",
  "Flooding",
  "Acoustic",
  "Landscaping",
  "Heritage",
  "Biodiversity",
  "Lawyer",
  "Certifiers",
  "Arborist",
  "Geotechnical"
]

function ConsultantStoreContent({ params }: { params: { jobId: string } }) {
  const router = useRouter()
  const { documents, isLoading: isDocsLoading, error: docsError, uploadDocument, removeDocument, downloadDocument } = useDocuments()
  const [consultantTickets, setConsultantTickets] = useState<ConsultantTicket[]>([])
  const [isTicketsLoading, setIsTicketsLoading] = useState(true)
  const [ticketsError, setTicketsError] = useState<string | null>(null)

  // Fetch consultant tickets for this job
  useEffect(() => {
    setIsTicketsLoading(true)
    setTicketsError(null)
    fetch('/api/consultant-tickets')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch consultant tickets')
        return res.json()
      })
      .then((tickets: ConsultantTicket[]) => {
        setConsultantTickets(tickets.filter(t => t.jobId === params.jobId))
      })
      .catch(err => setTicketsError(err.message))
      .finally(() => setIsTicketsLoading(false))
  }, [params.jobId])

  // Filter documents to only show consultant-generated assessment documents
  const filteredDocuments = documents.filter(doc => CONSULTANT_CATEGORIES.includes(doc.category))

  // Fetch job data for report status
  const { data: job, isLoading: isJobLoading, error: jobError } = useQuery<Job>({
    queryKey: ['job', params.jobId],
    queryFn: async () => {
      const response = await fetch(`/api/jobs/${params.jobId}`)
      if (!response.ok) throw new Error('Failed to fetch job data')
      return response.json()
    }
  })

  const isLoading = isDocsLoading || isJobLoading || isTicketsLoading
  const error = docsError || jobError?.message || ticketsError

  const handleUpload = (docId: string) => {
    createFileInput(async (file) => {
      await handleDocumentUpload(
        () => uploadDocument(params.jobId, docId, file)
      )
    })
  }

  const handleDownload = (docId: string) => {    console.log('[Consultant Store] Download button clicked for', docId);
    handleDocumentDownload(
      () => {
        console.log('[Consultant Store] Calling downloadDocument for', params.jobId, docId);
        return downloadDocument(params.jobId, docId);
      }
    )
  }

  const handleDelete = (docId: string) => {
    handleDocumentDelete(
      () => removeDocument(params.jobId, docId)
    )
  }

  // Type guard for Job (add more fields as needed)
  function isFullJob(obj: any): obj is import('@shared/types/jobs').Job {
    return obj && typeof obj === 'object' && 'council' in obj && 'status' in obj && 'createdAt' in obj;
  }

  // For each ticket, find the relevant document and use getReportStatus or fallback
  const tiles: Array<{ key: string, element: JSX.Element }> = [];
  const uniqueTickets = consultantTickets.filter((ticket, idx, arr) =>
    arr.findIndex(t => t.consultantId === ticket.consultantId && t.category === ticket.category) === idx
  );
  uniqueTickets.forEach(ticket => {
    const doc = documents.find(
      doc => doc.category === ticket.category && doc.consultantId === ticket.consultantId
    );
    if (!doc) {
      // If no document exists for this ticket, show in-progress/fallback state
      tiles.push({
        key: `ticket-nodoc-${ticket.id}`,
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
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="font-semibold text-lg">Report In Progress</p>
                <p className="text-sm text-gray-600 px-4">
                  We are processing your "{ticket.category}" Report for {ticket.consultantName}. You will be notified once it's ready.
                </p>
              </div>
            </CardContent>
          </Card>
        )
      });
      return;
    }
    let reportStatus: any = null;
    if (doc && job && isFullJob(job)) {
      reportStatus = getReportStatus(doc, job);
    }
    const isCompleted = doc && doc.uploadedFile && !!doc.uploadedFile.returnedAt;
    const hasFile = doc && doc.uploadedFile && !!doc.uploadedFile.fileName;

    if ((reportStatus && reportStatus.isCompleted && reportStatus.hasFile) || (!reportStatus && isCompleted && hasFile)) {
      tiles.push({
        key: `doc-${doc.id}-${ticket.consultantId}`,
        element: (
          <Card key={doc.id} className="shadow-md">
            <CardHeader className="bg-[#323A40] text-white">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">{getReportTitle(doc.id)}</h3>
                  <p className="text-sm text-gray-300">{doc.category}</p>
                  {ticket?.consultantName && (
                    <p className="text-sm text-gray-200 font-semibold mt-1">{ticket.consultantName}</p>
                  )}
                </div>
                <Check className="h-5 w-5 text-green-400" />
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-[#323A40]">
                  <FileText className="h-4 w-4" />
                  <span>{getReportTitle(doc.id)}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Uploaded: {doc.uploadedFile?.uploadedAt ? new Date(doc.uploadedFile.uploadedAt).toLocaleDateString() : 'N/A'}
                </p>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleDownload(doc.id)}
                  disabled={!hasFile}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Download Report
                </Button>
              </div>
            </CardContent>
          </Card>
        )
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
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="font-semibold text-lg">Report In Progress</p>
                <p className="text-sm text-gray-600 px-4">
                  Our team is working on your {getReportTitle(doc.id)}. You will be notified once it's ready.
                </p>
              </div>
            </CardContent>
          </Card>
        )
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
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="font-semibold text-lg">Report In Progress</p>
              <p className="text-sm text-gray-600 px-4">
                We are processing your "{ticket.category}" Report for {ticket.consultantName}. You will be notified once it's ready.
              </p>
            </div>
          </CardContent>
        </Card>
      )
    });
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Consultant Store</h1>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />Back
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
  )
}

export default function ConsultantStorePage({ params }: { params: { jobId: string } }) {
  return (
    <DocumentProvider jobId={params.jobId}>
      <ConsultantStoreContent params={params} />
    </DocumentProvider>
  )
}
