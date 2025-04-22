'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader } from '../../../../../components/ui/card'
import { ArrowLeft, Upload, FileText, X, Check } from 'lucide-react'
import { Button } from '../../../../../components/ui/button'
import { useRouter } from 'next/navigation'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Document, DOCUMENT_TYPES } from '@/types/documents'
import { toast } from '@/components/ui/use-toast'
import { useJobs, type Job } from '../../../../../../hooks/useJobs' // Corrected import path

interface DocumentWithStatus extends Document {
  status: 'uploaded' | 'pending' | 'required'
  uploadedFile?: {
    filename: string
    originalName: string
    type: string
    uploadedAt: string
    size: number
  }
}

// Remove the local Job interface definition, use the imported one

export default function DocumentStorePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  // Use the useJobs hook to potentially access the shared job state if needed,
  // although this component primarily fetches its own job data based on params.id
  // const { jobs, setJobs } = useJobs(); // Optional: if needed for other logic
  const [documents, setDocuments] = useState<DocumentWithStatus[]>(
    DOCUMENT_TYPES.map(doc => ({ ...doc, status: 'required' }))
  )
  const [job, setJob] = useState<Job | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await fetch(`/api/jobs/${params.id}`)
        if (!response.ok) {
          throw new Error('Failed to fetch job details')
        }
        const jobData = await response.json()
        setJob(jobData)

        // Update documents with uploaded files
        if (jobData.documents) {
          setDocuments(prev => prev.map(doc => {
            const uploadedFile = jobData.documents[doc.id]
            return uploadedFile ? {
              ...doc,
              status: 'uploaded',
              uploadedFile
            } : doc
          }))
        }
      } catch (err) {
        console.error('Error fetching documents:', err)
        setError('Failed to load documents')
      }
    }

    fetchDocuments()
  }, [params.id])

  const handleFileUpload = async (docId: string, file: File) => {
    try {
      const MAX_FILE_SIZE = 20 * 1024 * 1024
      if (file.size > MAX_FILE_SIZE) {
        setError('File size exceeds the maximum limit of 20MB')
        return
      }

      const formData = new FormData()
      formData.append('file', file)
      formData.append('documentId', docId)

      const response = await fetch(`/api/jobs/${params.id}/documents/upload`, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to upload document')
      }

      const result = await response.json()

      setDocuments(prev => prev.map(doc =>
        doc.id === docId
          ? {
              ...doc,
              status: 'uploaded',
              uploadedFile: {
                ...result.document,
                originalName: file.name,
                uploadedAt: new Date().toISOString()
              }
            }
          : doc
      ))
      setHasUnsavedChanges(true)
      setError(null)
    } catch (err) {
      console.error('Error uploading document:', err)
      setError(err instanceof Error ? err.message : 'Failed to upload document. Please try again.')
    }
  }

  const handleRemoveDocument = async (docId: string) => {
    try {
      const response = await fetch(`/api/jobs/${params.id}/documents/${docId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete document')
      }

      setDocuments(prev => prev.map(doc =>
        doc.id === docId
          ? { ...doc, status: 'required', uploadedFile: undefined }
          : doc
      ))
      setHasUnsavedChanges(true)
    } catch (err) {
      console.error('Error removing document:', err)
      setError(err instanceof Error ? err.message : 'Failed to remove document')
    }
  }

  const handleDownload = async (docId: string) => {
    try {
      const response = await fetch(`/api/jobs/${params.id}/documents/${docId}/download`)
      if (!response.ok) {
        throw new Error('Failed to download document')
      }

      // Get the filename from the Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition')
      const filename = contentDisposition?.split('filename="')[1]?.split('"')[0] || 'document.pdf'

      // Create a blob from the response
      const blob = await response.blob()

      // Create a download link and trigger it
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error downloading document:', error)
      toast({
        title: "Error",
        description: "Failed to download document. Please try again.",
        variant: "destructive"
      })
    }
  }

  // Auto-save when leaving the page
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue = ''
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasUnsavedChanges])

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            className="p-2"
            onClick={() => {
              if (hasUnsavedChanges) {
                const shouldLeave = window.confirm('You have unsaved changes. Do you want to leave without saving?')
                if (!shouldLeave) return
              }
              router.back()
            }}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-semibold text-[#323A40]">Document Store</h1>
        </div>
        {hasUnsavedChanges && (
          <Button
            onClick={async () => {
              try {
                // The save is handled by the document upload/delete endpoints
                setHasUnsavedChanges(false)
              } catch (err) {
                setError('Failed to save changes')
              }
            }}
          >
            Save Changes
          </Button>
        )}
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {documents.map((doc) => {
          // --- Conditional Rendering Logic ---

          // 1. Initial Assessment Report (Existing Logic)
          if (doc.id === 'initial-assessment-report') {
            // Show the report tile if assessment is paid OR the document exists
            const isPaid = job?.initialAssessment?.status === 'paid';
            const isUploaded = Boolean(job?.documents?.[doc.id]);
            const shouldShowReport = isPaid || isUploaded;

            if (!shouldShowReport) {
              return null; // Don't render if not paid and not uploaded
            }

            // Render the tile (logic for 'In Progress' or 'Download' below)

            // (Existing rendering code for initial-assessment-report follows)
            return (
              <Card key={doc.id} className="shadow-md">
                <CardHeader className="bg-[#323A40] text-white">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold">{doc.title}</h3>
                      <p className="text-sm text-gray-300">{doc.category}</p>
                    </div>
                    {isUploaded && (
                      <Check className="h-5 w-5 text-green-400" />
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  {isUploaded && doc.uploadedFile ? ( // Document exists, show download/remove
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-[#323A40]">
                        <FileText className="h-4 w-4" />
                        <span>{doc.uploadedFile.originalName}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Uploaded: {new Date(doc.uploadedFile.uploadedAt).toLocaleDateString()}
                      </p>
                      <div className="flex justify-between gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-600"
                          onClick={() => handleRemoveDocument(doc.id)}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Remove
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(doc.id)}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  ) : ( // Paid but not uploaded, show 'In Progress'
                    <div className="flex flex-col items-center justify-center p-4 text-center space-y-2">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                      <p className="text-sm font-medium">Report In Progress</p>
                      <p className="text-xs text-muted-foreground">
                        Our team is working on your initial assessment report. You will be notified once it's ready.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          }

          // 2. Statement of Environmental Effects
          if (doc.id === 'statement-of-environmental-effects') {
            // Show the report tile if assessment is paid OR the document exists
            const isPaid = job?.statementOfEnvironmentalEffects?.status === 'paid';
            const isUploaded = Boolean(job?.documents?.[doc.id]);
            const shouldShowReport = isPaid || isUploaded;

            if (!shouldShowReport) {
              return null; // Don't render if not paid and not uploaded
            }

            // Render the tile (logic for 'In Progress' or 'Download' below)

            // (Existing rendering code for statement-of-environmental-effects follows)
            return (
              <Card key={doc.id} className="shadow-md">
                <CardHeader className="bg-[#323A40] text-white">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold">{doc.title}</h3>
                      <p className="text-sm text-gray-300">{doc.category}</p>
                    </div>
                    {isUploaded && (
                      <Check className="h-5 w-5 text-green-400" />
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  {isUploaded && doc.uploadedFile ? ( // Document exists, show download/remove
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-[#323A40]">
                        <FileText className="h-4 w-4" />
                        <span>{doc.uploadedFile.originalName}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Uploaded: {new Date(doc.uploadedFile.uploadedAt).toLocaleDateString()}
                      </p>
                      <div className="flex justify-between gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-600"
                          onClick={() => handleRemoveDocument(doc.id)}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Remove
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(doc.id)}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  ) : ( // Paid but not uploaded, show 'In Progress'
                    <div className="flex flex-col items-center justify-center p-4 text-center space-y-2">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                      <p className="text-sm font-medium">Report In Progress</p>
                      <p className="text-xs text-muted-foreground">
                        Our team is working on your Statement of Environmental Effects. You will be notified once it's ready.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          }

          // 3. Complying Development Certificate Report
          if (doc.id === 'complying-development-certificate') {
            // Show the report tile if assessment is paid OR the document exists
            const isPaid = job?.complyingDevelopmentCertificate?.status === 'paid';
            const isUploaded = Boolean(job?.documents?.[doc.id]);
            const shouldShowReport = isPaid || isUploaded;

            if (!shouldShowReport) {
              return null; // Don't render if not paid and not uploaded
            }

            // Render the tile (logic for 'In Progress' or 'Download' below)

            // (Existing rendering code for complying-development-certificate follows)
            return (
              <Card key={doc.id} className="shadow-md">
                <CardHeader className="bg-[#323A40] text-white">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold">{doc.title}</h3>
                      <p className="text-sm text-gray-300">{doc.category}</p>
                    </div>
                    {isUploaded && (
                      <Check className="h-5 w-5 text-green-400" />
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  {isUploaded && doc.uploadedFile ? ( // Document exists, show download/remove
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-[#323A40]">
                        <FileText className="h-4 w-4" />
                        <span>{doc.uploadedFile.originalName}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Uploaded: {new Date(doc.uploadedFile.uploadedAt).toLocaleDateString()}
                      </p>
                      <div className="flex justify-between gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-600"
                          onClick={() => handleRemoveDocument(doc.id)}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Remove
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(doc.id)}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  ) : ( // Paid but not uploaded, show 'In Progress'
                    <div className="flex flex-col items-center justify-center p-4 text-center space-y-2">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                      <p className="text-sm font-medium">Report In Progress</p>
                      <p className="text-xs text-muted-foreground">
                        Our team is working on your Complying Development Certificate report. You will be notified once it's ready.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          }

          // --- Regular Document Handling (for all other docs) ---
          else {
            // Use the existing 'uploaded' status from the documents state for regular docs
            const isRegularUploaded = doc.status === 'uploaded';
            return (
              <Card key={doc.id} className="shadow-md">
                <CardHeader className="bg-[#323A40] text-white">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold">
                        {doc.title}
                        {doc.required && <span className="text-red-400 ml-1">*</span>}
                      </h3>
                      <p className="text-sm text-gray-300">{doc.category}</p>
                    </div>
                    {doc.status === 'uploaded' && (
                      <Check className="h-5 w-5 text-green-400" />
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  {doc.status === 'uploaded' && doc.uploadedFile ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-[#323A40]">
                        <FileText className="h-4 w-4" />
                        <span>{doc.uploadedFile.originalName}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Uploaded: {new Date(doc.uploadedFile.uploadedAt).toLocaleDateString()}
                      </p>
                      <div className="flex justify-between gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-600"
                          onClick={() => handleRemoveDocument(doc.id)}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Remove
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(doc.id)}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        id={doc.id}
                        className="hidden"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleFileUpload(doc.id, file)
                        }}
                      />
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => document.getElementById(doc.id)?.click()}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Document
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          }
        })}
      </div>
    </div>
  )
}
