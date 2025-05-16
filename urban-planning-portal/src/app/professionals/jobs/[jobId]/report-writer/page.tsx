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
import { getReportStatus, isReportType, getReportTitle } from '@shared/utils/report-utils'
import { DocumentProvider, useDocuments } from '@shared/contexts/document-context'
import { useQuery } from '@tanstack/react-query'

function ReportWriterContent({ params }: { params: { jobId: string } }) {
  const router = useRouter()
  const { documents, isLoading: isDocsLoading, error: docsError, uploadDocument, removeDocument, downloadDocument } = useDocuments()

  // Fetch job data for report status
  const { data: job, isLoading: isJobLoading, error: jobError } = useQuery<Job>({
    queryKey: ['job', params.jobId],
    queryFn: async () => {
      const response = await fetch(`/api/jobs/${params.jobId}`)
      if (!response.ok) throw new Error('Failed to fetch job data')
      return response.json()
    }
  })

  const isLoading = isDocsLoading || isJobLoading
  const error = docsError || jobError?.message

  const handleUpload = (docId: string) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.pdf,.doc,.docx'
    input.onchange = async (event: Event) => {
      const file = (event.target as HTMLInputElement).files?.[0]
      if (file) {
        await uploadDocument(params.jobId, docId, file)
      }
    }
    input.click()
  }

  const handleDownload = async (docId: string) => {
    await downloadDocument(params.jobId, docId)
  }

  const handleDelete = async (docId: string) => {
    if (confirm('Are you sure you want to delete this document?')) {
      await removeDocument(params.jobId, docId)
    }
  }

  const renderDocumentUpload = (doc: DocumentWithStatus) => {
    if (isReportType(doc.id)) {
      const reportStatus = job ? getReportStatus(doc, job) : { isPaid: false, isCompleted: false, hasFile: false }
      const reportTitle = getReportTitle(doc.id)

      // Show "In Progress" if the report is paid but not completed
      if (reportStatus.isPaid && !reportStatus.isCompleted) {
        return (
          <Card key={doc.id} className="shadow-md">
            <CardHeader className="bg-[#323A40] text-white">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">{reportTitle}</h3>
                  <p className="text-sm text-gray-300">{doc.category}</p>
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
                  Our team is working on your {reportTitle}. You will be notified once it's ready.
                </p>
              </div>
            </CardContent>
          </Card>
        )
      }

      // Show completed report if available
      if (reportStatus.isCompleted && reportStatus.hasFile) {
        return (
          <Card key={doc.id} className="shadow-md">
            <CardHeader className="bg-[#323A40] text-white">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">{reportTitle}</h3>
                  <p className="text-sm text-gray-300">{doc.category}</p>
                </div>
                <Check className="h-5 w-5 text-green-400" />
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-[#323A40]">
                  <FileText className="h-4 w-4" />
                  <span>{doc.uploadedFile?.originalName}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Uploaded: {doc.uploadedFile?.uploadedAt ? new Date(doc.uploadedFile.uploadedAt).toLocaleDateString() : 'N/A'}
                </p>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    // ---- ADD THIS LINE ----
                    console.log('[ReportWriter] React Download Button clicked for docId:', doc.id, 'Job ID:', params.jobId);
                    // ----------------------
                    handleDownload(doc.id);
                  }}
                  disabled={false}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Download Report
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      }

      // Don't show anything if the report is not paid or completed
      return null
    }

    // Standard Document Card
    const isUploaded = doc.displayStatus === 'uploaded'
    return (
      <Card key={doc.id} className="relative">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div><h3 className="text-lg font-semibold">{doc.title}</h3></div>
            {isUploaded ? (<Check className="h-5 w-5 text-green-500" />) : null}
          </div>
        </CardHeader>
        <CardContent>
          {isUploaded && doc.uploadedFile ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span className="text-sm">{doc.uploadedFile.originalName}</span>
              </div>
              <div className="text-sm text-gray-500">
                Uploaded on {doc.uploadedFile.uploadedAt ? new Date(doc.uploadedFile.uploadedAt).toLocaleDateString() : 'N/A'}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => handleDownload(doc.id)}>
                  <FileText className="h-4 w-4 mr-2" />Download
                </Button>
                <Button variant="destructive" size="icon" onClick={() => handleDelete(doc.id)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <Button variant="outline" className="w-full" onClick={() => handleUpload(doc.id)}>
              <Upload className="h-4 w-4 mr-2" />Upload Document
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Report Writer</h1>
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
          {documents.map(doc => renderDocumentUpload(doc))}
        </div>
      )}
    </div>
  )
}

export default function ReportWriterPage({ params }: { params: { jobId: string } }) {
  return (
    <DocumentProvider jobId={params.jobId}>
      <ReportWriterContent params={params} />
    </DocumentProvider>
  )
}
