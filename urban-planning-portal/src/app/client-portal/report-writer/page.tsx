'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Plus, Upload, FileText, X, Check, ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useJobs, type Job } from '../../../../hooks/useJobs'
import Link from 'next/link'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Document, DOCUMENT_TYPES } from '../../../types/documents'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/components/ui/use-toast'
import { PrePreparedSection } from '@/components/PrePreparedSection'
import PropertyInfo from '@/components/PropertyInfo'; // Adjust the path as necessary
// Remove incorrect form import
import DetailedSiteDetails, { DetailedSiteDetailsData } from '@/components/DetailedSiteDetails'; // Import the CORRECT form component and its type

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

export default function ReportWriterPage() {
  const router = useRouter()
  const { jobs, setJobs } = useJobs()
  const [selectedJobId, setSelectedJobId] = useState<string | undefined>(undefined)
  const [documents, setDocuments] = useState<DocumentWithStatus[]>([])
  const [documentError, setDocumentError] = useState<string | null>(null)
  const [formData, setFormData] = useState<JobFormData>({})
  const [showPaymentButton, setShowPaymentButton] = useState(false)
  const [paymentComplete, setPaymentComplete] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // State to track the selected report type (tab)
  const [selectedReportType, setSelectedReportType] = useState<'statement-of-environmental-effects' | 'complying-development-certificate'>('statement-of-environmental-effects');

  // Separate state for custom section (may need review if it's still relevant)
  const [customAssessmentComplete, setCustomAssessmentComplete] = useState<Record<string, boolean>>({})

  // New state for collapsible sections
  const [isDocumentsOpen, setIsDocumentsOpen] = useState(false)

// New state for property info section
const [isPropertyInfoOpen, setIsPropertyInfoOpen] = useState(false)
// New state for site details section
const [isSiteDetailsOpen, setIsSiteDetailsOpen] = useState(false)
// State to hold the current site details being edited in the form
const [currentSiteDetails, setCurrentSiteDetails] = useState<DetailedSiteDetailsData | null>(null);

// New state for current form data
const [currentFormData, setCurrentFormData] = useState<CustomAssessmentForm>({
  developmentType: '',
  additionalInfo: ''
});

// Assuming you have these documents defined in your state
const [certificateOfTitle, setCertificateOfTitle] = useState<DocumentWithStatus | null>(null);
const [surveyPlan, setSurveyPlan] = useState<DocumentWithStatus | null>(null);
const [certificate107, setCertificate107] = useState<DocumentWithStatus | null>(null);

  // Load data from local storage when the component mounts
  useEffect(() => {
    const savedData = localStorage.getItem(`initialAssessment-${selectedJobId}`);
    if (savedData) {
      setFormData(JSON.parse(savedData));
    }
  }, [selectedJobId]);

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
      // Fetch job data
      fetch(`/api/jobs/${selectedJobId}`)
        .then(jobResponse => jobResponse.json())
        .then(jobData => {
          console.log('Initial load:', {
            jobId: selectedJobId,
            initialAssessment: jobData.initialAssessment,
            paymentStatus: jobData.initialAssessment?.status
          })

          // Set payment complete if the job has a paid custom assessment
          if (jobData.initialAssessment?.status === 'paid') {
            console.log('Setting payment complete - payment status is paid')
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

        // Update the jobs array with the latest job data
        setJobs((prevJobs: Job[]) => prevJobs.map((job: Job) =>
          job.id === selectedJobId ? { ...job, ...jobData } : job
        ))
      } catch (err) {
        console.error('Error fetching documents:', err)
        setDocumentError('Failed to load documents')
        setDocuments([])
      }
    }

    fetchDocuments()
  }, [selectedJobId])

  // Add polling for document updates
  useEffect(() => {
    let pollInterval: NodeJS.Timeout

    const pollForUpdates = async () => {
      if (!selectedJobId) return

      try {
        // Fetch job data
        const jobResponse = await fetch(`/api/jobs/${selectedJobId}`)

        if (!jobResponse.ok) {
          throw new Error('Failed to fetch updates')
        }

        const jobData = await jobResponse.json()

        // Update payment status if needed
        if (jobData.initialAssessment?.status === 'paid') {
          setPaymentComplete(prev => ({
            ...prev,
            [selectedJobId]: true
          }))
        }

        // Update the jobs array with the latest job data
        setJobs((prevJobs: Job[]) => prevJobs.map((job: Job) =>
          job.id === selectedJobId ? { ...job, ...jobData } : job
        ))

        // Update documents if they've changed
        if (jobData.documents) {
          const updatedDocuments = documents.map(doc => {
            const uploadedFile = jobData.documents[doc.id]
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
        }
      } catch (error) {
        console.error('Error polling for updates:', error)
      }
    }

    // Start polling if we have a selected job
    if (selectedJobId) {
      pollInterval = setInterval(pollForUpdates, 5000) // Poll every 5 seconds
    }

    return () => {
      if (pollInterval) {
        clearInterval(pollInterval)
      }
    }
  }, [selectedJobId, documents])

  const isAssessmentReturned = () => {
    if (!selectedJobId) return false
    const selectedJob = jobs.find(job => job.id === selectedJobId)
    return selectedJob?.initialAssessment?.returnedAt !== undefined
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
    setHasUnsavedChanges(true)
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

    // Use the selectedReportType from state
    const reportType = selectedReportType;
    const reportTitle = reportType === 'statement-of-environmental-effects'
      ? 'Statement of Environmental Effects'
      : 'Complying Development Certificate Report';

    try {
      const currentFormData = formData[selectedJobId] || { developmentType: '', additionalInfo: '' }
      const selectedJob = jobs.find(job => job.id === selectedJobId)

      if (!selectedJob) {
        throw new Error('Job not found')
      }

      // Create work ticket for admin
      const workTicketResponse = await fetch('/api/work-tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobId: selectedJobId,
          jobAddress: selectedJob.address,
          ticketType: reportType, // Use dynamic report type
          customAssessment: { // Keep this structure for now, might rename later if needed
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
          initialAssessment: { // Consider renaming 'initialAssessment' if it's confusing
            status: 'paid',
            type: reportType, // Use dynamic report type
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            customAssessment: { // Keep this structure for now
              developmentType: currentFormData.developmentType,
              additionalInfo: currentFormData.additionalInfo,
              documents: {
                certificateOfTitle: documents.find(doc => doc.id === 'certificate-of-title')?.uploadedFile?.originalName,
                surveyPlan: documents.find(doc => doc.id === 'survey-plan')?.uploadedFile?.originalName,
                certificate107: documents.find(doc => doc.id === '10-7-certificate')?.uploadedFile?.originalName
              }
            }
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
        description: `Your ${reportTitle} has been purchased successfully.`, // Dynamic message
      })
    } catch (error) {
      console.error(`Error processing payment for ${reportType}:`, error)
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

      // For report writer report, always try to download from job documents first
      if (documentId === 'report-writer-report') {
        const response = await fetch(`/api/jobs/${selectedJobId}/documents/${documentId}/download`);
        if (!response.ok) {
          throw new Error('Failed to download document');
        }

        // Get the filename from the Content-Disposition header
        const contentDisposition = response.headers.get('Content-Disposition');
        const filename = contentDisposition?.split('filename="')[1]?.split('"')[0] || 'report-writer-report.pdf';

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

    // Logic for the purchased Report tiles (SoEE or CDC)
    const reportDocIds = ['statement-of-environmental-effects', 'complying-development-certificate'];
    if (reportDocIds.includes(doc.id)) {
      const assessmentReturned = isAssessmentReturned();
      // The decision to show this tile is now handled in renderRequiredDocuments.
      // We just need to determine if it's "In Progress" or "Ready for Download".

      // If the assessment/report has been returned by admin
      if (assessmentReturned) {
        // Render tile with download button
        // Use the specific doc.id for the download handler
        return (
          <Card key={doc.id} className="relative">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{doc.title}</h3>
                </div>
                <Check className="h-5 w-5 text-green-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span className="text-sm">{doc.uploadedFile?.originalName}</span>
                </div>
                <div className="text-sm text-gray-500">
                  Uploaded on {doc.uploadedFile?.uploadedAt ? new Date(doc.uploadedFile.uploadedAt).toLocaleDateString() : 'N/A'}
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleDownload(doc.id)} // Use the specific document ID
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Download Report
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      } else {
         // Render a placeholder/status tile if paid but not yet returned (optional)
         // For now, let it fall through to the generic logic which will show "Required"
         // or potentially adapt the generic logic later if needed.
         // Alternatively, show a specific "Processing" state card:
         /*
         return (
           <Card key={doc.id} className="relative opacity-70">
             <CardHeader>
               <h3 className="text-lg font-semibold">{doc.title}</h3>
             </CardHeader>
             <CardContent>
               <div className="flex items-center text-gray-500">
                 <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                 <span className="text-sm">Processing...</span>
               </div>
             </CardContent>
           </Card>
         );
         */
         // Render the "Report In Progress" card matching the Document Store style
         // This should show when payment is complete but assessment is not yet returned.
         return (
            <Card key={doc.id} className="relative">
              {/* Use a consistent title, maybe fetch from doc.title */}
              <CardHeader className="bg-[#323A40] text-white">
                <h3 className="text-lg font-semibold">{doc.title || 'Report'}</h3>
              </CardHeader>
              <CardContent className="p-4 text-center">
                <div className="flex flex-col items-center justify-center space-y-2 py-4">
                   {/* Using a generic document icon */}
                   <FileText className="h-12 w-12 text-blue-500" />
                   <p className="font-semibold text-lg">Report In Progress</p>
                   <p className="text-sm text-gray-600 px-4">
                     Our team is working on your report. You will be notified once it's ready.
                   </p>
                </div>
              </CardContent>
            </Card>
         );
      }
    }

    // Generic rendering logic for other documents OR for the report if paid but not returned

    return (
      <Card key={doc.id} className="relative">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">{doc.title}</h3>
            </div>
            {doc.status === 'uploaded' ? (
              <Check className="h-5 w-5 text-green-500" />
            ) : null}
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
                Uploaded on {doc.uploadedFile?.uploadedAt ? new Date(doc.uploadedFile.uploadedAt).toLocaleDateString() : 'N/A'}
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
    // Find the selected job data to check purchase status
    const selectedJob = jobs.find(job => job.id === selectedJobId);
    const purchasedReportType = selectedJob?.initialAssessment?.status === 'paid'
      ? selectedJob.initialAssessment.type // This should be 'statement-of-environmental-effects' or 'complying-development-certificate'
      : null;

    // Start with base required documents
    const baseDocIds = ['certificate-of-title', '10-7-certificate', 'survey-plan'];
    let documentsToRenderIds = [...baseDocIds];

    // Add the purchased report type ID if applicable and valid
    if (purchasedReportType && ['statement-of-environmental-effects', 'complying-development-certificate'].includes(purchasedReportType)) {
      documentsToRenderIds.push(purchasedReportType);
    }

    // Filter the main documents state based on the IDs we need to render
    const requiredDocs = documents.filter(doc => documentsToRenderIds.includes(doc.id));

    // Ensure the order is consistent (optional but good practice)
    requiredDocs.sort((a, b) => documentsToRenderIds.indexOf(a.id) - documentsToRenderIds.indexOf(b.id));


    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {requiredDocs.map(doc => renderDocumentUpload(doc))}
      </div>
    )
  }

  // Add renderCustomAssessmentForm function
  const renderCustomAssessmentForm = () => {
    const currentJobPaymentComplete = selectedJobId ? paymentComplete[selectedJobId] : false
    const assessmentReturned = isAssessmentReturned();
    const reportTitle = selectedReportType === 'statement-of-environmental-effects'
      ? 'Statement of Environmental Effects'
      : 'Complying Development Certificate Report'; // Get the title based on selected tab

    // Show success message when payment is complete
    if (currentJobPaymentComplete) {
      return (
        <div className="border rounded-lg p-4 bg-green-50">
          <div className="text-center py-4">
            <Check className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <h4 className="font-medium mb-2">Thank you for your payment!</h4>
            {assessmentReturned ? (
              <>
                {/* Use the dynamic report title */}
                <p className="text-sm text-gray-600">Your {reportTitle} is now ready.</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  // Use the actual purchased report type ID for download
                  onClick={() => handleDownload(selectedJobData?.initialAssessment?.type || '')}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Download Report
                </Button>
              </>
            ) : (
              // Show processing message when paid but not returned
              <p className="text-sm text-gray-600">We are processing your {reportTitle}.</p>
            )}
          </div>
        </div>
      )
    }

    // Show the form if payment is not complete
    const currentFormData = selectedJobId ? formData[selectedJobId] || { developmentType: '', additionalInfo: '' } : { developmentType: '', additionalInfo: '' }

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

  const handleSaveChanges = () => {
    if (selectedJobId) {
      localStorage.setItem(`reportWriter-${selectedJobId}`, JSON.stringify(formData));
      setHasUnsavedChanges(false);
      toast({
        title: "Success",
        description: "Changes saved successfully.",
      });
    }
  };

  const toggleDocuments = () => {
    setIsDocumentsOpen(prev => !prev); // Toggle the documents section
  };

  const togglePropertyInfo = () => {
    setIsPropertyInfoOpen(prev => !prev); // Toggle the property info section
  };

  const toggleSiteDetails = () => {
    setIsSiteDetailsOpen(prev => !prev); // Toggle the site details section
  };

  // Find the selected job data from the jobs state
  const selectedJobData = jobs.find(job => job.id === selectedJobId);

  // Effect to initialize currentSiteDetails when selectedJobData changes
  useEffect(() => {
    if (selectedJobData) {
      setCurrentSiteDetails(selectedJobData.siteDetails || {}); // Initialize with job data or empty object
    } else {
      setCurrentSiteDetails(null); // Reset if no job is selected
    }
  }, [selectedJobData]);

  // Handler for when data changes within DetailedSiteDetails component
  const handleSiteDetailsChange = (newData: DetailedSiteDetailsData) => {
    setCurrentSiteDetails(newData);
    setHasUnsavedChanges(true);
     // Clear save status if user makes changes after a save
     // (Assuming a save button might be added later or handled by main save button)
  };


  // Updated save function for Site Details - uses currentSiteDetails state
  const handleSaveSiteDetails = async () => {
    // Check if there's data to save and a job selected
    if (!selectedJobId || !currentSiteDetails) {
       toast({ title: "Error", description: "No job selected or no site details to save.", variant: "destructive" });
       return;
    }
    console.log('Saving Site Details:', currentSiteDetails);

    // Use PATCH request to update the job with the siteDetails
    try {
      const response = await fetch(`/api/jobs/${selectedJobId}`, { // Use correct API endpoint
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siteDetails: currentSiteDetails }), // Send the data from state
      });

       if (!response.ok) {
         const errorData = await response.json().catch(() => ({})); // Try to parse error response
         throw new Error(errorData.error || 'Failed to save site details');
       }

      const updatedJob = await response.json();

      // Update local job state
      setJobs(prevJobs => prevJobs.map(job =>
        job.id === selectedJobId ? { ...job, siteDetails: updatedJob.siteDetails } : job // Update with response data
      ));

      toast({
        title: "Success",
        description: "Site details saved successfully.",
      });
      setHasUnsavedChanges(false); // Assuming save implies changes are persisted
    } catch (error) {
      console.error("Error saving site details:", error);
      toast({
        title: "Error",
        description: "Failed to save site details.",
        variant: "destructive",
      });
    }
  };

  // Determine if the form should be read-only - REMOVED FOR THIS PAGE CONTEXT
  // const isReadOnly = selectedJobId ? (paymentComplete[selectedJobId] || isAssessmentReturned()) : false;
  // For the repor page, we want Site Details to be editable before payment/return.
  const isReadOnly = false;


  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            className="p-2"
            onClick={() => {
              if (hasUnsavedChanges) {
                const shouldLeave = window.confirm('You have unsaved changes. Do you want to leave without saving?');
                if (!shouldLeave) return;
              }
              router.back();
            }}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-semibold text-[#323A40]">Report Writer</h1>
        </div>
        {selectedJobId && hasUnsavedChanges && (
          <Button onClick={handleSaveChanges} disabled={!hasUnsavedChanges}>
            Save Changes
          </Button>
        )}
      </div>

      <div className="mb-8">
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
          {!selectedJobId && (
            <Link href="/dashboard?action=create-job">
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Create New Job
              </Button>
            </Link>
          )}
        </div>
      </div>

    {/* New Section for About Report Writer */}
    {!selectedJobId && ( // Only render this section if no job is selected
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">About Report Writer</h2>
        <p className="text-sm text-gray-700">
          This section provides information about the report writer process, including what to expect and how to prepare.
          Please ensure that all required documents are uploaded before proceeding with your report.
        </p>
      </div>
    )}

      {selectedJobId && (
        <>
          {/* New Planning Info Section */}
          <div className="mb-8">
            <h2
              className="h-12 text-xl font-semibold mb-4 cursor-pointer bg-[#323A40] text-white flex items-center justify-between"
              onClick={togglePropertyInfo}
            >
              Property Info
              {isPropertyInfoOpen ? (
                <ChevronUp className="h-5 w-5 text-white" />
              ) : (
                <ChevronDown className="h-5 w-5 text-white" />
              )}
            </h2>
            {isPropertyInfoOpen && selectedJobData && ( // Conditional rendering based on state and if job data exists
              <div>
                {/* Pass address and propertyData directly */}
                <PropertyInfo
                  address={selectedJobData.address}
                  propertyData={selectedJobData.propertyData || null}
                />
              </div>
            )}
             {isPropertyInfoOpen && !selectedJobData && (
               <p className="p-4 text-sm text-gray-500">Loading job data...</p> // Show loading or placeholder if job data isn't ready
             )}
          </div>

          {/* New Site Details Section */}
          <div className="mb-8">
            <h2
              className="h-12 text-xl font-semibold mb-4 cursor-pointer bg-[#323A40] text-white flex items-center justify-between"
              onClick={toggleSiteDetails}
            >
              Site Details
              {isSiteDetailsOpen ? (
                <ChevronUp className="h-5 w-5 text-white" />
              ) : (
                <ChevronDown className="h-5 w-5 text-white" />
              )}
            </h2>
            {isSiteDetailsOpen && selectedJobData && currentSiteDetails !== null && ( // Render only when data is loaded
              <div>
                 {/* Use the correct DetailedSiteDetails component */}
                 <DetailedSiteDetails
                   // Pass the current state using the 'data' prop
                   data={currentSiteDetails}
                   onDataChange={handleSiteDetailsChange} // Pass the change handler
                   isReadOnly={false} // Ensure form is editable on this page
                 />
                  {/* Add a dedicated save button for this form if needed, or rely on the main page save */}
                  {/* Logic adjusted slightly to check hasUnsavedChanges directly */}
                  {hasUnsavedChanges && (
                    <div className="flex justify-end mt-4">
                        <Button onClick={handleSaveSiteDetails}>Save Site Details</Button>
                    </div>
                 )}
              </div>
            )}
             {isSiteDetailsOpen && (!selectedJobData || currentSiteDetails === null) && ( // Show loading if job/details not ready
               <p className="p-4 text-sm text-gray-500">Loading job data...</p>
             )}
          </div>


          <div className="mb-8">
            <h2
              className="h-12 text-xl font-semibold mb-4 cursor-pointer bg-[#323A40] text-white flex items-center justify-between"
              onClick={toggleDocuments}
            >
              Documents
              {isDocumentsOpen ? (
                <ChevronUp className="h-5 w-5 text-gray-600" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-600" />
              )}
            </h2>
            {isDocumentsOpen && ( // Conditional rendering based on state
              <div>
                {renderRequiredDocuments()}
              </div>
            )}
          </div>

          {/* New AI Chatbot Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">AI-Powered Assessment</h2>
            <div className="p-4 border rounded-lg bg-gray-100">
              <p className="text-sm text-muted-foreground">
                Coming soon! Our AI chatbot will guide you through the assessment process.
              </p>
            </div>
          </div>

          <div className="border rounded-lg bg-white">
            {/* Update Tabs component to set the selected report type */}
            <Tabs
              defaultValue="statement-of-environmental-effects"
              className="w-full"
              onValueChange={(value) => setSelectedReportType(value as 'statement-of-environmental-effects' | 'complying-development-certificate')}
            >
              <TabsList className="w-full grid grid-cols-2 h-12">
                <TabsTrigger value="statement-of-environmental-effects" className="data-[state=active]:bg-white">
                  Statement of Environmental Effects
                </TabsTrigger>
                <TabsTrigger value="complying-development-certificate" className="data-[state=active]:bg-white">
                  Complying Development Certificate Report
                </TabsTrigger>
              </TabsList>

              <div className="p-6">
                <TabsContent value="statement-of-environmental-effects" className="mt-0">
                  {renderCustomAssessmentForm()}
                </TabsContent>

                <TabsContent value="complying-development-certificate" className="mt-0">
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
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </>
      )}
    </div>
  )
}
