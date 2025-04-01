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
import { PrePreparedAssessment, DEFAULT_ASSESSMENT_TYPES } from '@/types/assessments'
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

const PRE_PREPARED_TYPES: PrePreparedAssessment[] = [
  {
    id: 'cdc-dwelling',
    value: '/initial-assessment/pre-prepared/cdc-dwelling',
    label: 'CDC Dwelling',
    description: 'Complying Development Certificate for a new dwelling',
    file: '/documents/cdc-dwelling.pdf',
    documentId: 'cdc-dwelling',
    version: 1
  },
  {
    id: 'cdc-dual-occupancy',
    value: '/initial-assessment/pre-prepared/cdc-dual-occupancy',
    label: 'CDC Dual Occupancy',
    description: 'Complying Development Certificate for dual occupancy',
    file: '/documents/cdc-dual-occupancy.pdf',
    documentId: 'cdc-dual-occupancy',
    version: 1
  },
  {
    id: 'cdc-secondary-dwelling',
    value: '/initial-assessment/pre-prepared/cdc-secondary-dwelling',
    label: 'CDC Secondary Dwelling',
    description: 'Complying Development Certificate for a secondary dwelling',
    file: '/documents/cdc-secondary-dwelling.pdf',
    documentId: 'cdc-secondary-dwelling',
    version: 1
  }
]

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
  const [purchasedAssessments, setPurchasedAssessments] = useState<Record<string, boolean>>({})
  const [workTickets, setWorkTickets] = useState<WorkTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isInitialLoad, setIsInitialLoad] = useState(true)

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

          // Handle pre-prepared assessment
          if (jobData.initialAssessment?.status === 'paid' && jobData.initialAssessment?.purchasedAssessment) {
            setPurchasedAssessments(prev => ({
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
    if (!selectedJobId) return

    try {
      const response = await fetch(`/api/jobs/${selectedJobId}/documents/${documentId}/download`)
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

  const handlePrePreparedPurchase = async (assessment: PrePreparedAssessment) => {
    if (!selectedJobId) {
      toast({
        title: "Error",
        description: "Please select a job first",
        variant: "destructive"
      })
      return
    }

    try {
      // Simulate payment process
      await new Promise(resolve => setTimeout(resolve, 1000))

      const doc = documents.find(d => d.value === assessment.value || d.path === assessment.value)
      if (!doc) {
        toast({
          title: "Error",
          description: "Document not found",
          variant: "destructive"
        })
        return
      }

      // Create a new document in the job's document store
      const formData = new FormData()
      formData.append('documentId', 'initial-assessment-report')
      
      // Create a simple PDF file with the assessment title
      const blob = new Blob(['Assessment Document'], { type: 'application/pdf' })
      const file = new File([blob], `${assessment.label.replace(' Assessment', '')}.pdf`, { type: 'application/pdf' })
      formData.append('file', file)

      const documentResponse = await fetch(`/api/jobs/${selectedJobId}/documents/upload`, {
        method: 'POST',
        body: formData
      })

      if (!documentResponse.ok) {
        throw new Error('Failed to create document')
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
            purchasedAssessment: assessment.id
          }
        })
      })

      if (!updateResponse.ok) {
        throw new Error('Failed to update job status')
      }

      // Update local state
      setPurchasedAssessments(prev => ({
        ...prev,
        [selectedJobId]: true
      }))

      // Refresh the documents list
      await fetchJobDocuments()

      // Trigger automatic download
      await handleDownload('initial-assessment-report')

      toast({
        title: "Success",
        description: "Assessment document has been added to your document store",
      })
    } catch (error) {
      console.error('Error purchasing assessment:', error)
      toast({
        title: "Error",
        description: "Failed to purchase assessment",
        variant: "destructive"
      })
    }
  }

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
                  onClick={() => handleDownload(doc.id)}
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

  const handlePurchase = async (ticket: WorkTicket) => {
    try {
      debugLog('Purchasing assessment from ticket:', {
        id: ticket.id,
        type: ticket.prePreparedAssessment?.assessmentType,
        documentId: ticket.prePreparedAssessment?.documentId
      })
      
      await new Promise(resolve => setTimeout(resolve, 1000))

      setPurchasedAssessments(prev => ({
        ...prev,
        [ticket.id]: true
      }))

      toast({
        title: 'Success',
        description: 'Assessment purchased successfully'
      })
    } catch (error) {
      console.error('Error purchasing assessment:', error)
      toast({
        title: 'Error',
        description: 'Failed to purchase assessment',
        variant: 'destructive'
      })
    }
  }

  // Load work tickets and poll for updates
  useEffect(() => {
    const loadWorkTickets = async (isPolling = false) => {
      try {
        setError(null)
        // Only show loading state on initial load
        if (!isPolling) {
          setLoading(true)
        }
        debugLog('Starting to fetch work tickets...')
        
        const response = await fetch('/api/work-tickets')
        debugLog('API Response status:', response.status, response.ok)
        
        if (!response.ok) {
          throw new Error('Failed to fetch work tickets')
        }
        
        const tickets = await response.json()
        debugLog('Raw API response:', tickets.length, 'tickets')

        // First, filter out any non-pre-prepared tickets immediately
        const onlyPrePrepared = tickets.filter((t: WorkTicket) => t.ticketType === 'pre-prepared-assessment')
        debugLog('Pre-prepared tickets:', onlyPrePrepared.length)
        
        // Then filter for completed and valid tickets
        const validTickets = onlyPrePrepared.filter((t: WorkTicket) => {
          const isCompleted = t.status === 'completed'
          const hasDocument = !!t.completedDocument
          const isReturned = !!t.completedDocument?.returnedAt
          const hasAssessmentType = !!t.prePreparedAssessment?.assessmentType

          const isValid = isCompleted && hasDocument && isReturned && hasAssessmentType

          if (!isValid) {
            debugLog('Filtered out ticket:', {
              id: t.id,
              status: t.status,
              failedChecks: {
                status: !isCompleted ? 'not completed' : null,
                document: !hasDocument ? 'no document' : null,
                returned: !isReturned ? 'not returned' : null,
                assessmentType: !hasAssessmentType ? 'no assessment type' : null
              }
            })
          }

          return isValid
        })

        debugLog('Valid tickets after filtering:', {
          total: tickets.length,
          prePrepared: onlyPrePrepared.length,
          valid: validTickets.length,
          tickets: validTickets.map((t: WorkTicket) => ({
            id: t.id,
            type: t.prePreparedAssessment?.assessmentType,
            status: t.status
          }))
        })

        // Only update state if the tickets have actually changed
        const ticketsChanged = JSON.stringify(validTickets) !== JSON.stringify(workTickets)
        if (ticketsChanged) {
          debugLog('Updating work tickets state - tickets have changed')
          setWorkTickets(validTickets)
        } else {
          debugLog('No change in work tickets - skipping state update')
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        debugLog('Error loading work tickets:', {
          error,
          message: errorMessage
        })
        setError(errorMessage)
        toast({
          title: 'Error',
          description: 'Failed to load assessment types',
          variant: 'destructive'
        })
      } finally {
        if (!isPolling) {
          setLoading(false)
        }
        debugLog('Finished loading work tickets')
      }
    }

    // Initial load
    loadWorkTickets(false)
    
    // Set up polling with a shorter interval in debug mode
    const interval = setInterval(() => {
      debugLog('Polling for work ticket updates...')
      loadWorkTickets(true)
    }, DEBUG ? 2000 : 30000) // Reduced to 2 seconds in debug mode for faster updates
    
    return () => {
      debugLog('Component unmounting, clearing interval')
      clearInterval(interval)
    }
  }, [workTickets]) // Added workTickets to dependencies to properly compare changes

  const renderPrePreparedContent = () => {
    if (loading) {
      return (
        <div className="container mx-auto p-6 max-w-7xl">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border rounded-lg p-6">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    }

    if (error) {
      return (
        <div className="container mx-auto p-6">
          <h1 className="text-2xl font-semibold mb-4">Pre-Prepared Assessments</h1>
          <div className="p-6 text-red-500">{error}</div>
        </div>
      )
    }

    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold mb-4">Pre-Prepared Assessments</h1>
          <p className="text-muted-foreground">
            Choose from our selection of pre-prepared assessment templates for common development types.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Default assessment types */}
          {DEFAULT_ASSESSMENT_TYPES.map((assessment) => (
            <Card key={assessment.value}>
              <CardHeader>
                <CardTitle>{assessment.label}</CardTitle>
                <CardDescription>{assessment.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full"
                  onClick={() => handlePrePreparedPurchase(assessment)}
                  disabled={!selectedJobId}
                >
                  Purchase Assessment
                </Button>
              </CardContent>
            </Card>
          ))}

          {/* Custom assessment types from work tickets */}
          {workTickets.map((ticket) => {
            if (!ticket.prePreparedAssessment) return null
            const isPurchased = purchasedAssessments[ticket.id]

            if (isPurchased) {
              return (
                <Card key={ticket.id} className="bg-green-50">
                  <CardHeader>
                    <CardTitle>{ticket.prePreparedAssessment.assessmentType}</CardTitle>
                    <CardDescription>
                      Complying Development Certificate for {ticket.prePreparedAssessment.assessmentType.toLowerCase()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-4">
                      <Check className="h-8 w-8 text-green-500 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-4">
                        Assessment purchased successfully
                      </p>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => handleDownload('initial-assessment-report')}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Download Assessment
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            }

            return (
              <Card key={ticket.id}>
                <CardHeader>
                  <CardTitle>{ticket.prePreparedAssessment.assessmentType}</CardTitle>
                  <CardDescription>
                    Complying Development Certificate for {ticket.prePreparedAssessment.assessmentType.toLowerCase()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-green-600 mb-4">
                    <FileText className="h-4 w-4 mr-2" />
                    <span>Document Available</span>
                  </div>
                  <Button 
                    className="w-full"
                    onClick={() => handlePurchase(ticket)}
                    disabled={!selectedJobId}
                  >
                    Purchase Assessment
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    )
  }

  // Add a function to fetch job documents
  const fetchJobDocuments = async () => {
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
    } catch (err) {
      console.error('Error fetching documents:', err)
      setDocumentError('Failed to load documents')
      setDocuments([])
    }
  }

  // Update the useEffect to use the fetchJobDocuments function
  useEffect(() => {
    fetchJobDocuments()
  }, [selectedJobId])

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
                <TabsTrigger value="pre-prepared" className="data-[state=active]:bg-white">Pre-Prepared</TabsTrigger>
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
                
                <TabsContent value="pre-prepared" className="mt-0">
                  {renderPrePreparedContent()}
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </>
      )}
    </div>
  )
} 