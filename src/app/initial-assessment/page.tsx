'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Plus, Upload, FileText, X, Check } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useJobs } from '@/hooks/useJobs'
import Link from 'next/link'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Document, DOCUMENT_TYPES, DocumentVersion } from '@/types/documents'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { toast } from '@/components/ui/use-toast'
import { documentService } from '@/lib/services/documentService'
import { WorkTicket } from '@/types/workTickets'

// Debug flag - set to true to enable console logging
const DEBUG = true

const debugLog = (...args: any[]) => {
  if (DEBUG) {
    console.log('[PrePrepared]', ...args)
  }
}

interface DocumentWithStatus extends Document {
  status: 'uploaded' | 'pending' | 'required'
  value?: string
  uploadedFile?: {
    filename: string
    originalName: string
    type: string
    uploadedAt: string
    size: number
    returnedAt?: string
  }
}

interface CustomAssessmentForm {
  developmentType: string
  additionalInfo: string
}

interface JobFormData {
  [key: string]: CustomAssessmentForm
}

export default function InitialAssessmentPage() {
  const router = useRouter()
  const { jobs } = useJobs()
  const [selectedJobId, setSelectedJobId] = useState<string | undefined>(undefined)
  const [documents, setDocuments] = useState<DocumentWithStatus[]>([])
  const [allDocuments, setAllDocuments] = useState<Document[]>([])
  const [documentError, setDocumentError] = useState<string | null>(null)
  const [formData, setFormData] = useState<JobFormData>({})
  const [showPaymentButton, setShowPaymentButton] = useState(false)
  const [paymentComplete, setPaymentComplete] = useState<Record<string, boolean>>({})
  const [workTickets, setWorkTickets] = useState<WorkTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  // Separate state for custom section
  const [customAssessmentComplete, setCustomAssessmentComplete] = useState<Record<string, boolean>>({})

  // Set initial job ID from URL if present
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const jobId = params.get('job')
    if (jobId) {
      setSelectedJobId(jobId)
    }
  }, [])

  // Reset purchase state when job changes
  useEffect(() => {
    if (selectedJobId) {
      // Fetch both job and work tickets
      Promise.all([
        fetch(`/api/jobs/${selectedJobId}`),
        fetch('/api/work-tickets')
      ])
        .then(([jobResponse, workTicketsResponse]) => 
          Promise.all([jobResponse.json(), workTicketsResponse.json()])
        )
        .then(([jobData, workTickets]) => {
          console.log('Initial load:', {
            jobId: selectedJobId,
            initialAssessment: jobData.initialAssessment,
            paymentStatus: jobData.initialAssessment?.status
          })

          // Find the work ticket for this job
          const workTicket = workTickets.find((ticket: WorkTicket) => 
            ticket.jobId === selectedJobId && 
            ticket.ticketType === 'custom-assessment'
          )

          // Set payment complete if either:
          // 1. The job has a paid custom assessment
          // 2. There's a work ticket for this job
          if ((jobData.initialAssessment?.status === 'paid' && jobData.initialAssessment?.type === 'custom') ||
              workTicket) {
            console.log('Setting payment complete - work ticket found or payment status is paid')
            setPaymentComplete(prev => ({
              ...prev,
              [selectedJobId]: true
            }))
          }
        })
        .catch(error => {
          console.error('Error checking status:', error)
        })
    }
  }, [selectedJobId])

  // Fetch documents when a job is selected
  useEffect(() => {
    const fetchDocuments = async () => {
      if (!selectedJobId) {
        setDocuments([])
        return
      }

      try {
        const response = await fetch(`/api/jobs/${selectedJobId}`)
        if (!response.ok) {
          throw new Error('Failed to fetch job details')
        }
        const jobData = await response.json()
        
        // Initialize documents with their status
        const updatedDocuments = DOCUMENT_TYPES.map(doc => {
          const uploadedFile = jobData.documents?.[doc.id]
          return {
            ...doc,
            status: uploadedFile ? 'uploaded' as const : 'required' as const,
            uploadedFile: uploadedFile ? {
              filename: uploadedFile.filename,
              originalName: uploadedFile.originalName,
              type: uploadedFile.type,
              uploadedAt: uploadedFile.uploadedAt,
              size: uploadedFile.size
            } : undefined
          }
        })
        
        setDocuments(updatedDocuments)
        setDocumentError(null)

        // Also check for custom assessment payment status
        if (jobData.initialAssessment?.status === 'paid' && jobData.initialAssessment?.type === 'custom') {
          setPaymentComplete(prev => ({
            ...prev,
            [selectedJobId]: true
          }))
        }
      } catch (err) {
        console.error('Error fetching documents:', err)
        setDocumentError('Failed to load documents')
        setDocuments([])
      }
    }

    fetchDocuments()
  }, [selectedJobId])

  // Add new effect to fetch all documents
  useEffect(() => {
    const fetchAllDocuments = async () => {
      try {
        const docs = await documentService.getDocuments()
        setAllDocuments(docs)
      } catch (error) {
        console.error('Error fetching all documents:', error)
      }
    }

    fetchAllDocuments()
  }, [])

  // Add polling for document updates
  useEffect(() => {
    let pollInterval: NodeJS.Timeout

    const pollForUpdates = async () => {
      if (!selectedJobId) return

      try {
        // Fetch both job and work tickets
        const [jobResponse, workTicketsResponse] = await Promise.all([
          fetch(`/api/jobs/${selectedJobId}`),
          fetch('/api/work-tickets')
        ])

        if (!jobResponse.ok || !workTicketsResponse.ok) {
          throw new Error('Failed to fetch updates')
        }

        const [jobData, workTickets] = await Promise.all([
          jobResponse.json(),
          workTicketsResponse.json()
        ])

        // Find the work ticket for this job
        const workTicket = workTickets.find((ticket: WorkTicket) => 
          ticket.jobId === selectedJobId && 
          ticket.ticketType === 'custom-assessment'
        )
        
        // Update documents state
        const updatedDocuments = DOCUMENT_TYPES.map(doc => {
          const uploadedFile = jobData.documents?.[doc.id]
          const isInitialAssessment = doc.id === 'initial-assessment-report'
          
          return {
            ...doc,
            status: uploadedFile ? 'uploaded' as const : 'required' as const,
            uploadedFile: uploadedFile ? {
              filename: uploadedFile.filename,
              originalName: uploadedFile.originalName,
              type: uploadedFile.type,
              uploadedAt: uploadedFile.uploadedAt,
              size: uploadedFile.size,
              // For initial assessment, use the work ticket's returnedAt
              returnedAt: isInitialAssessment ? workTicket?.completedDocument?.returnedAt : undefined
            } : undefined
          }
        })
        
        setDocuments(updatedDocuments)

        // Always ensure payment status is set if we have a work ticket
        if (workTicket || (jobData.initialAssessment?.status === 'paid' && jobData.initialAssessment?.type === 'custom')) {
          setPaymentComplete(prev => ({
            ...prev,
            [selectedJobId]: true
          }))
        }

        // Stop polling if the document has been returned
        if (workTicket?.completedDocument?.returnedAt) {
          clearInterval(pollInterval)
        }
      } catch (err) {
        console.error('Error polling for updates:', err)
      }
    }

    // Always poll when a job is selected
    if (selectedJobId) {
      pollInterval = setInterval(pollForUpdates, 5000)
      pollForUpdates() // Initial poll
    }

    return () => {
      if (pollInterval) {
        clearInterval(pollInterval)
      }
    }
  }, [selectedJobId]) // Only depend on selectedJobId

  // Add effect to fetch work tickets
  useEffect(() => {
    if (selectedJobId) {
      fetch('/api/work-tickets')
        .then(response => response.json())
        .then(tickets => {
          console.log('Fetched work tickets:', tickets)
          setWorkTickets(tickets)
        })
        .catch(error => {
          console.error('Error fetching work tickets:', error)
        })
    }
  }, [selectedJobId])

  const getCurrentWorkTicket = () => {
    return workTickets.find(ticket => 
      ticket.jobId === selectedJobId && 
      ticket.ticketType === 'custom-assessment'
    )
  }

  const isAssessmentReturned = () => {
    const workTicket = getCurrentWorkTicket()
    return workTicket?.completedDocument?.returnedAt !== undefined
  }

  const renderDocumentStatus = (doc: DocumentWithStatus) => {
    if (doc.status === 'uploaded') {
      return (
        <div className="flex items-center text-green-600">
          <Check className="h-4 w-4 mr-2" />
          <span className="text-sm">Uploaded: {doc.uploadedFile?.originalName}</span>
        </div>
      )
    }
    return (
      <div className="flex items-center text-amber-600">
        <Upload className="h-4 w-4 mr-2" />
        <span className="text-sm">Required</span>
      </div>
    )
  }

  const handleFormChange = (field: keyof CustomAssessmentForm) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (!selectedJobId) return
    
    setFormData(prev => ({
      ...prev,
      [selectedJobId]: {
        ...(prev[selectedJobId] || { developmentType: '', additionalInfo: '' }),
        [field]: e.target.value
      }
    }))
  }

  const handleConfirmDetails = () => {
    if (!selectedJobId) return
    
    const currentFormData = formData[selectedJobId] || { developmentType: '', additionalInfo: '' }
    
    // Validate form
    if (!currentFormData.developmentType.trim()) {
      alert('Please enter the development type')
      return
    }
    
    // Check specifically for 10.7 certificate
    const certificate107 = documents.find(doc => doc.id === '10-7-certificate')
    if (!certificate107 || certificate107.status !== 'uploaded') {
      alert('Please upload all required documents before proceeding')
      return
    }

    setShowPaymentButton(true)
  }

  const handleDummyPayment = async () => {
    if (!selectedJobId) return
    
    try {
      const currentFormData = formData[selectedJobId] || { developmentType: '', additionalInfo: '' }
      const selectedJob = jobs.find(job => job.id === selectedJobId)

      if (!selectedJob) {
        throw new Error('Job not found')
      }

      // Create work ticket
      const workTicketResponse = await fetch('/api/work-tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobId: selectedJobId,
          jobAddress: selectedJob.address,
          ticketType: 'custom-assessment',
          customAssessment: {
            developmentType: currentFormData.developmentType,
            additionalInfo: currentFormData.additionalInfo,
            documents: {
              certificateOfTitle: documents.find(doc => doc.id === 'certificate-of-title')?.uploadedFile?.originalName,
              surveyPlan: documents.find(doc => doc.id === 'survey-plan')?.uploadedFile?.originalName,
              certificate107: documents.find(doc => doc.id === '10-7-certificate')?.uploadedFile?.originalName
            }
          }
        })
      })

      if (!workTicketResponse.ok) {
        throw new Error('Failed to create work ticket')
      }

      // Update the job data to store the purchase
      const updateResponse = await fetch(`/api/jobs/${selectedJobId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          initialAssessment: {
            status: 'paid',
            type: 'custom',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        })
      })

      if (!updateResponse.ok) {
        throw new Error('Failed to update job status')
      }

      // Update local state
      setPaymentComplete(prev => ({
        ...prev,
        [selectedJobId]: true
      }))

      toast({
        title: "Success",
        description: "Your custom assessment has been purchased successfully.",
      })
    } catch (error) {
      console.error('Error processing payment:', error)
      toast({
        title: "Error",
        description: "Failed to process payment. Please try again.",
        variant: "destructive"
      })
    }
  }

  // Add download function
  const handleDownload = async (documentId: string) => {
    try {
      if (!selectedJobId) {
        toast({
          title: "Error",
          description: "Please select a job first",
          variant: "destructive"
        });
        return;
      }

      // For initial assessment report, always try to download from job documents first
      if (documentId === 'initial-assessment-report') {
        const response = await fetch(`/api/jobs/${selectedJobId}/documents/${documentId}/download`);
        if (!response.ok) {
          throw new Error('Failed to download document');
        }

        // Get the filename from the Content-Disposition header
        const contentDisposition = response.headers.get('Content-Disposition');
        const filename = contentDisposition?.split('filename="')[1]?.split('"')[0] || 'assessment-report.pdf';

        // Create a blob from the response
        const blob = await response.blob();
        
        // Create a download link and trigger it
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        toast({
          title: "Success",
          description: "Document downloaded successfully"
        });
        return;
      }

      // Handle other document downloads
      const response = await fetch(`/api/jobs/${selectedJobId}/documents/${documentId}/download`);
      if (!response.ok) {
        throw new Error('Failed to download document');
      }

      // Get the filename from the Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition');
      const filename = contentDisposition?.split('filename="')[1]?.split('"')[0] || 'document.pdf';

      // Create a blob from the response
      const blob = await response.blob();
      
      // Create a download link and trigger it
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Success",
        description: "Document downloaded successfully"
      });
    } catch (error) {
      console.error('Error downloading document:', error);
      toast({
        title: "Error",
        description: "Failed to download document. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleFileUpload = async (documentId: string, file: File) => {
    if (!selectedJobId) {
      toast({
        title: "Error",
        description: "Please select a job before uploading documents",
        variant: "destructive"
      })
      return
    }

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('documentId', documentId)

      const response = await fetch(`/api/jobs/${selectedJobId}/documents/upload`, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Failed to upload document')
      }

      const result = await response.json()
      
      // Update local state
      const updatedDocuments = documents.map(doc => 
        doc.id === documentId 
          ? { 
              ...doc, 
              status: 'uploaded' as const,
              uploadedFile: result.document
            }
          : doc
      )
      setDocuments(updatedDocuments)

      toast({
        title: "Success",
        description: "Document uploaded successfully"
      })
    } catch (error) {
      console.error('Error uploading document:', error)
      toast({
        title: "Error",
        description: "Failed to upload document. Please try again.",
        variant: "destructive"
      })
    }
  }

  const renderDocumentUpload = (doc: DocumentWithStatus) => {
    const handleClick = () => {
      if (doc.status === 'uploaded') {
        handleDownload(doc.id)
        return
      }

      const input = document.createElement('input')
      input.type = 'file'
      input.accept = '.pdf,.doc,.docx'
      input.onchange = async (event: Event) => {
        const file = (event.target as HTMLInputElement).files?.[0]
        if (file) await handleFileUpload(doc.id, file)
      }
      input.click()
    }

    // Show success message for initial assessment report when custom assessment is purchased
    const currentJobPaymentComplete = selectedJobId ? paymentComplete[selectedJobId] : false
    if (doc.id === 'initial-assessment-report' && currentJobPaymentComplete) {
      const assessmentReturned = isAssessmentReturned()

      return (
        <Card key={doc.id} className="relative">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">{doc.title}</h3>
                <p className="text-sm text-gray-500">{doc.value || doc.path}</p>
              </div>
              <Check className="h-5 w-5 text-green-500" />
            </div>
          </CardHeader>
          <CardContent className="bg-green-50">
            <div className="text-center py-4">
              <Check className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <h4 className="font-medium mb-2">Thank you for your payment!</h4>
              <p className="text-sm text-gray-600">
                {assessmentReturned
                  ? "Your initial assessment is now ready."
                  : "We are processing your initial assessment."
                }
              </p>
              {assessmentReturned && (
                <Button
                  variant="outline"
                  className="mt-4 w-full"
                  onClick={() => handleDownload('initial-assessment-report')}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Download Assessment
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )
    }

    return (
      <Card key={doc.id} className="relative">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">{doc.title}</h3>
              <p className="text-sm text-gray-500">{doc.value || doc.path}</p>
            </div>
            {doc.status === 'uploaded' ? (
              <Check className="h-5 w-5 text-green-500" />
            ) : (
              <div className="text-sm text-orange-500">Required</div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {doc.status === 'uploaded' && doc.uploadedFile ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span className="text-sm">{doc.uploadedFile.originalName}</span>
              </div>
              <div className="text-sm text-gray-500">
                Uploaded on {new Date(doc.uploadedFile.uploadedAt).toLocaleDateString()}
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleDownload(doc.id)}
              >
                <FileText className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              className="w-full"
              onClick={handleClick}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Document
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  const renderRequiredDocuments = () => {
    const requiredDocs = documents.filter(doc => 
      ['certificate-of-title', '10-7-certificate', 'survey-plan', 'initial-assessment-report'].includes(doc.id)
    )

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {requiredDocs.map(doc => renderDocumentUpload(doc))}
      </div>
    )
  }

  // Add renderCustomAssessmentForm function
  const renderCustomAssessmentForm = () => {
    const currentJobPaymentComplete = selectedJobId ? paymentComplete[selectedJobId] : false
    console.log('Render state:', {
      selectedJobId,
      paymentComplete,
      currentJobPaymentComplete,
      workTicket: getCurrentWorkTicket(),
      isReturned: isAssessmentReturned()
    })
    
    const currentFormData = selectedJobId ? (formData[selectedJobId] || { developmentType: '', additionalInfo: '' }) : { developmentType: '', additionalInfo: '' }
    
    if (currentJobPaymentComplete) {
      const assessmentReturned = isAssessmentReturned()

      return (
        <div className="border rounded-lg p-4 bg-green-50">
          <div className="text-center py-4">
            <Check className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <h4 className="font-medium mb-2">Thank you for your payment!</h4>
            <p className="text-sm text-gray-600">
              {assessmentReturned
                ? "Your initial assessment is now ready."
                : "We are processing your initial assessment."
              }
            </p>
            {assessmentReturned && (
              <Button 
                variant="outline"
                className="mt-4 w-full"
                onClick={() => handleDownload('initial-assessment-report')}
              >
                <FileText className="h-4 w-4 mr-2" />
                Download Assessment
              </Button>
            )}
          </div>
        </div>
      )
    }

    const certificateOfTitle = documents.find(doc => doc.id === 'certificate-of-title')
    const surveyPlan = documents.find(doc => doc.id === 'survey-plan')
    const certificate107 = documents.find(doc => doc.id === '10-7-certificate')

    return (
      <div className="space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Development Type
            </label>
            <Input
              placeholder="Enter the type of development"
              value={currentFormData.developmentType}
              onChange={handleFormChange('developmentType')}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              Additional Information
            </label>
            <Textarea
              placeholder="Enter any additional information about your development"
              value={currentFormData.additionalInfo}
              onChange={handleFormChange('additionalInfo')}
              rows={4}
            />
          </div>

          {/* Document Attachments Section */}
          <div className="space-y-2">
            <h4 className="font-medium">Attached Documents</h4>
            
            {certificateOfTitle?.status === 'uploaded' && (
              <div className="flex items-center text-sm">
                <Check className="h-4 w-4 mr-2 text-green-600" />
                <span>Certificate of Title: {certificateOfTitle.uploadedFile?.originalName}</span>
              </div>
            )}

            {surveyPlan?.status === 'uploaded' && (
              <div className="flex items-center text-sm">
                <Check className="h-4 w-4 mr-2 text-green-600" />
                <span>Survey Plan: {surveyPlan.uploadedFile?.originalName}</span>
              </div>
            )}

            {certificate107?.status === 'uploaded' && (
              <div className="flex items-center text-sm">
                <Check className="h-4 w-4 mr-2 text-green-600" />
                <span>10.7 Certificate: {certificate107.uploadedFile?.originalName}</span>
              </div>
            )}
          </div>

          {/* Show notification only when 10.7 is missing */}
          {(!certificate107 || certificate107.status !== 'uploaded') && (
            <Alert variant="destructive">
              <AlertDescription>
                Please upload all required documents before proceeding
              </AlertDescription>
            </Alert>
          )}

          <div className="pt-4">
            {!showPaymentButton ? (
              <Button 
                className="w-full"
                onClick={handleConfirmDetails}
                disabled={!certificate107 || certificate107.status !== 'uploaded'}
              >
                Confirm Details
              </Button>
            ) : (
              <Button 
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={handleDummyPayment}
              >
                Proceed to Payment
              </Button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold mb-4">Initial Assessment</h1>
        <div className="flex items-center justify-between">
          <div className="flex-1 mr-4">
            <Select value={selectedJobId} onValueChange={setSelectedJobId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a job" />
              </SelectTrigger>
              <SelectContent>
                {jobs.map((job) => (
                  <SelectItem key={job.id} value={job.id}>
                    {job.address}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Link href="/dashboard?action=create-job">
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Create New Job
            </Button>
          </Link>
        </div>
      </div>

      {selectedJobId && (
        <>
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Required Documents</h2>
            {renderRequiredDocuments()}
          </div>

          <div className="border rounded-lg bg-white">
            <Tabs defaultValue="ai-chatbot" className="w-full">
              <TabsList className="w-full grid grid-cols-3 h-12">
                <TabsTrigger value="ai-chatbot" className="data-[state=active]:bg-white">AI Chatbot</TabsTrigger>
                <TabsTrigger value="custom-assessment" className="data-[state=active]:bg-white">Custom Assessment</TabsTrigger>
              </TabsList>
              
              <div className="p-6">
                <TabsContent value="ai-chatbot" className="mt-0">
                  <div>
                    <h3 className="font-semibold mb-2">AI-Powered Assessment</h3>
                    <p className="text-sm text-muted-foreground">
                      Coming soon! Our AI chatbot will guide you through the assessment process.
                    </p>
                  </div>
                </TabsContent>
                
                <TabsContent value="custom-assessment" className="mt-0">
                  {renderCustomAssessmentForm()}
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </>
      )}
    </div>
  )
} 