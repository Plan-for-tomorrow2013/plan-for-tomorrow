'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader } from "@shared/components/ui/card"
import { ArrowLeft, Upload, FileText, X, Check } from 'lucide-react'
import { Button } from "@shared/components/ui/button"
import { useRouter } from 'next/navigation'
import { Alert, AlertDescription, AlertTitle } from "@shared/components/ui/alert"
import { Document, DOCUMENT_TYPES, DocumentWithStatus } from '@shared/types/documents'
import { toast } from "@shared/components/ui/use-toast"
import { useJobs } from '@shared/hooks/useJobs'
import type { Job } from '@shared/types/jobs'
import { getReportStatus, isReportType, getReportTitle } from '@/utils/report-utils'
import { DocumentProvider, useDocuments } from '@shared/contexts/document-context'
import { SiteDetailsProvider, useSiteDetails } from '@shared/contexts/site-details-context'

function DocumentStoreContent({ params }: { params: { jobId: string } }) {
  const router = useRouter()
  const { documents, isLoading, error, uploadDocument, removeDocument, downloadDocument } = useDocuments()
  const { siteDetails, updateSiteDetails, saveSiteDetails, hasUnsavedChanges: hasUnsavedSiteDetails } = useSiteDetails()

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (isLoading) {
    return <div>Loading documents...</div>
  }

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

  const renderDocumentCard = (doc: DocumentWithStatus) => {
    // Use displayStatus instead of status
    const displayStatus = doc.displayStatus
    return (
      <Card key={doc.id} className="relative">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div><h3 className="text-lg font-semibold">{doc.title}</h3></div>
            {/* Show checkmark only when uploaded */}
            {displayStatus === 'uploaded' ? (<Check className="h-5 w-5 text-green-500" />) : null}
          </div>
        </CardHeader>
        <CardContent>
          {/* Conditional rendering based on displayStatus */}
          {displayStatus === 'uploaded' && doc.uploadedFile ? (
            // Render uploaded file details and actions
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
          ) : displayStatus === 'pending_user_upload' ? (
            // Render upload button for user
            <Button variant="outline" className="w-full" onClick={() => handleUpload(doc.id)}>
              <Upload className="h-4 w-4 mr-2" />Upload Document
            </Button>
          ) : displayStatus === 'pending_admin_delivery' ? (
             // Render pending admin delivery message
             <div className="text-sm text-gray-500 text-center py-4">
               Purchase successful. Document pending delivery from admin.
             </div>
          ) : null /* Should not happen, but good practice */}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Document Store</h1>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />Back
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {documents.map(doc => renderDocumentCard(doc))}
      </div>
    </div>
  )
}

export default function DocumentStorePage({ params }: { params: { jobId: string } }) {
  return (
    <DocumentProvider jobId={params.jobId}>
      <SiteDetailsProvider jobId={params.jobId}>
        <DocumentStoreContent params={params} />
      </SiteDetailsProvider>
    </DocumentProvider>
  )
}
