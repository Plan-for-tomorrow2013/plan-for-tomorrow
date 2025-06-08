"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader } from "@shared/components/ui/card"
import { Button } from "@shared/components/ui/button"
import { FileText, Clock, Upload, Bell, Loader2 } from 'lucide-react'
import { useToast } from "@shared/components/ui/use-toast"
import { cn } from '@shared/lib/utils'
import Link from 'next/link'
import { WorkTicket } from '@shared/types/workTickets'
import { PageHeader } from "@shared/components/ui/page-header"
import { DocumentWithStatus } from '@shared/types/documents'

// Helper function to get display name for ticket type
const getTicketTypeDisplayName = (type: string): string => {
  switch (type) {
    case 'custom-assessment':
      return 'Custom Assessment'
    case 'statement-of-environmental-effects':
      return 'Statement of Environmental Effects'
    case 'complying-development-certificate':
      return 'Complying Development Certificate'
    default:
      return type
  }
}

// Create a new DocumentRenderer component
function DocumentRenderer({ doc, jobId }: { doc: DocumentWithStatus, jobId: string }) {
  const uploadedFile = doc.uploadedFile;
  if (!uploadedFile?.fileName || !uploadedFile?.originalName) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm">
        <FileText className="h-4 w-4" />
        <span>{uploadedFile.originalName}</span>
      </div>
      <div className="text-sm text-gray-500">
        Uploaded: {new Date(uploadedFile.uploadedAt).toLocaleDateString()}
      </div>
      <Button
        variant="outline"
        className="w-full"
        onClick={() => window.open(`/api/download-document?jobId=${jobId}&fileName=${encodeURIComponent(uploadedFile.fileName)}&originalName=${encodeURIComponent(uploadedFile.originalName)}`, '_blank')}
      >
        <FileText className="h-4 w-4 mr-2" />
        Download Document
      </Button>
    </div>
  );
}

// Reusable component for displaying report summary and attached documents
function ReportSummarySection({ report, jobId }: { report: any, jobId: string }) {
  if (!report) return null;
  const docs = report.documents || {};
  const docList = [
    { key: 'certificate107', label: '10.7 Certificate', doc: docs.certificate107 },
    { key: 'certificateOfTitle', label: 'Certificate of Title', doc: docs.certificateOfTitle },
    { key: 'surveyPlan', label: 'Survey Plan', doc: docs.surveyPlan },
    { key: 'architecturalPlan', label: 'Architectural Plan', doc: docs.architecturalPlan },
  ];
  return (
    <div className="mb-2">
      <div className="font-semibold text-sm">Documents to be Attached:</div>
      <ul className="list-disc list-inside text-xs">
        {docList.map(({ key, label, doc }) =>
          doc && (doc.fileName || doc.originalName) ? (
            <li key={key}>
              {doc.originalName || label}
              {doc.fileName && (
                <>
                  {' '}
                  <a
                    href={`/api/download-document?jobId=${jobId}&fileName=${encodeURIComponent(doc.fileName)}&originalName=${encodeURIComponent(doc.originalName || label)}`}
                    download={doc.originalName || label}
                    className="text-blue-600 hover:underline ml-1"
                  >
                    (Download)
                  </a>
                </>
              )}
            </li>
          ) : null
        )}
      </ul>
      <div className="text-xs mt-1">
        {report.developmentType && (
          <div><strong>Development Type:</strong> {report.developmentType}</div>
        )}
        {report.additionalInfo && (
          <div><strong>Additional Info:</strong> {report.additionalInfo}</div>
        )}
      </div>
    </div>
  );
}

export default function WorkTicketsPage() {
  const [tickets, setTickets] = useState<WorkTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await fetch('/api/work-tickets')
        if (!response.ok) {
          throw new Error('Failed to fetch work tickets')
        }
        const data = await response.json()
        setTickets(data)
      } catch (error) {
        console.error('Error fetching work tickets:', error)
        setError('Failed to load work tickets')
      } finally {
        setLoading(false)
      }
    }

    fetchTickets()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'in-progress':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleUploadDocument = async (ticketId: string, file: File) => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('ticketId', ticketId)

      const response = await fetch('/api/work-tickets/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to upload document')
      }

      const updatedTicket = await response.json()
      setTickets(tickets.map(ticket =>
        ticket.id === ticketId ? updatedTicket : ticket
      ))

      toast({
        title: 'Document uploaded successfully',
        description: 'The completed assessment has been uploaded.',
      })
    } catch (error) {
      console.error('Error uploading document:', error)
      toast({
        title: 'Error uploading document',
        description: 'Failed to upload the document. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleReturnDocument = async (ticketId: string) => {
    try {
      const response = await fetch('/api/work-tickets/return', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ticketId }),
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || 'Failed to return document')
      }

      const result = await response.json()
      setTickets(tickets.map(ticket =>
        ticket.id === ticketId ? result : ticket
      ))

      toast({
        title: 'Success',
        description: 'The document has been returned successfully.'
      })
    } catch (error) {
      console.error('Error returning document:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to process the document. Please try again.',
        variant: 'destructive'
      })
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <PageHeader
          title="Work Tickets"
          description="View and manage work tickets"
          backHref="/admin"
        />
        <div className="flex justify-center items-center min-h-[calc(100vh-4rem)]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <PageHeader
          title="Work Tickets"
          description="View and manage work tickets"
          backHref="/admin"
        />
        <div className="flex justify-center items-center min-h-[calc(100vh-4rem)]">
          <p>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <PageHeader
        title="Work Tickets"
        description="View and manage work tickets"
        backHref="/admin"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {tickets.map((ticket) => (
          <Card key={ticket.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-medium">
                    {getTicketTypeDisplayName(ticket.ticketType)} {/* Use helper function */}
                  </h2>
                  <p className="text-xs text-gray-500 truncate">{ticket.jobAddress}</p>
                  {/* Add report summary for all types */}
                  <ReportSummarySection
                    report={ticket.customAssessment || ticket.statementOfEnvironmentalEffects || ticket.complyingDevelopmentCertificate}
                    jobId={ticket.jobId}
                  />
                </div>
                <div className={cn("rounded-md px-2 py-1 text-xs font-semibold", getStatusColor(ticket.status))}>
                  {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3">
                {ticket.ticketType === 'custom-assessment' && ticket.customAssessment && (
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-medium text-sm mb-1">Development Details</h3>
                      <p className="text-xs mb-1">
                        <strong>Type:</strong> {ticket.customAssessment.developmentType}
                      </p>
                      <p className="text-xs truncate">
                        <strong>Info:</strong> {ticket.customAssessment.additionalInfo}
                      </p>
                    </div>
                    <DocumentRenderer
                      doc={{
                        id: 'custom-assessment',
                        title: 'Custom Assessment',
                        path: 'custom-assessment',
                        type: 'document',
                        category: 'REPORTS',
                        versions: [],
                        currentVersion: 1,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        isActive: true,
                        displayStatus: 'uploaded',
                        uploadedFile: {
                          fileName: ticket.customAssessment.fileName || '',
                          originalName: ticket.customAssessment.originalName || '',
                          type: 'application/pdf',
                          uploadedAt: ticket.customAssessment.uploadedAt || new Date().toISOString(),
                          size: ticket.customAssessment.size || 0
                        }
                      }}
                      jobId={ticket.jobId}
                    />
                  </div>
                )}

                {ticket.ticketType === 'statement-of-environmental-effects' && ticket.statementOfEnvironmentalEffects && (
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-medium text-sm mb-1">Development Details</h3>
                      <p className="text-xs mb-1">
                        <strong>Type:</strong> {ticket.statementOfEnvironmentalEffects.developmentType}
                      </p>
                      <p className="text-xs truncate">
                        <strong>Info:</strong> {ticket.statementOfEnvironmentalEffects.additionalInfo}
                      </p>
                    </div>
                    <DocumentRenderer
                      doc={{
                        id: 'statement-of-environmental-effects',
                        title: 'Statement of Environmental Effects',
                        path: 'statement-of-environmental-effects',
                        type: 'document',
                        category: 'REPORTS',
                        versions: [],
                        currentVersion: 1,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        isActive: true,
                        displayStatus: 'uploaded',
                        uploadedFile: {
                          fileName: ticket.statementOfEnvironmentalEffects.fileName || '',
                          originalName: ticket.statementOfEnvironmentalEffects.originalName || '',
                          type: 'application/pdf',
                          uploadedAt: ticket.statementOfEnvironmentalEffects.uploadedAt || new Date().toISOString(),
                          size: ticket.statementOfEnvironmentalEffects.size || 0
                        }
                      }}
                      jobId={ticket.jobId}
                    />
                  </div>
                )}

                {ticket.ticketType === 'complying-development-certificate' && ticket.complyingDevelopmentCertificate && (
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-medium text-sm mb-1">Development Details</h3>
                      <p className="text-xs mb-1">
                        <strong>Type:</strong> {ticket.complyingDevelopmentCertificate.developmentType}
                      </p>
                      <p className="text-xs truncate">
                        <strong>Info:</strong> {ticket.complyingDevelopmentCertificate.additionalInfo}
                      </p>
                    </div>
                    <DocumentRenderer
                      doc={{
                        id: 'complying-development-certificate',
                        title: 'Complying Development Certificate',
                        path: 'complying-development-certificate',
                        type: 'document',
                        category: 'REPORTS',
                        versions: [],
                        currentVersion: 1,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        isActive: true,
                        displayStatus: 'uploaded',
                        uploadedFile: {
                          fileName: ticket.complyingDevelopmentCertificate.fileName || '',
                          originalName: ticket.complyingDevelopmentCertificate.originalName || '',
                          type: 'application/pdf',
                          uploadedAt: ticket.complyingDevelopmentCertificate.uploadedAt || new Date().toISOString(),
                          size: ticket.complyingDevelopmentCertificate.size || 0
                        }
                      }}
                      jobId={ticket.jobId}
                    />
                  </div>
                )}

                <div className="border-t pt-2">
                  <h3 className="font-medium text-sm mb-1">Completed Assessment</h3>
                  {ticket.completedDocument ? (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-xs">
                          <FileText className="h-3 w-3 mr-1" />
                          <span className="truncate">{ticket.completedDocument.originalName}</span>
                        </div>
                        {!ticket.completedDocument.returnedAt && (
                          <Button
                            size="sm"
                            onClick={() => handleReturnDocument(ticket.id)}
                            className="flex items-center h-6 text-xs"
                          >
                            <Bell className="h-3 w-3 mr-1" />
                            Add
                          </Button>
                        )}
                      </div>
                      {ticket.completedDocument.returnedAt && (
                        <div className="text-xs text-gray-500">
                          <p>Added to stores</p>
                          <p className="text-[10px]">
                            {new Date(ticket.completedDocument.returnedAt).toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <label htmlFor={`file-upload-${ticket.id}`} className="cursor-pointer">
                        <div className="flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-800">
                          <Upload className="h-3 w-3" />
                          <span>Upload Assessment</span>
                        </div>
                      </label>
                      <input
                        id={`file-upload-${ticket.id}`}
                        type="file"
                        className="hidden"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            handleUploadDocument(ticket.id, file)
                          }
                        }}
                      />
                    </div>
                  )}
                </div>
                <div className="flex items-center text-xs text-gray-500">
                  <Clock size={12} className="mr-1" />
                  <span>{new Date(ticket.createdAt).toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {tickets.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No work tickets found
          </div>
        )}
      </div>
    </div>
  )
}
