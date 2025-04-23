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
import PropertyInfo from '@/components/PropertyInfo'; // Adjust the path as necessary
import DetailedSiteDetails, { DetailedSiteDetailsData } from '@/components/DetailedSiteDetails'
import DocumentStatus from '@/components/DocumentStatus'

import { PrePreparedAssessments } from '../../../components/PrePreparedAssessments'

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

interface PrePreparedAssessmentSection {
  id: string;
  title: string;
  assessments: PrePreparedAssessments[];
}

interface UploadedFile {
  filename: string;
  originalName: string;
  type: string;
  uploadedAt: string;
  size: number;
  returnedAt?: string;
  savedPath?: string;
}

interface PrePreparedAssessments {
  id: string;
  title: string;
  content: string;
  date: string;
  author: string;
  file?: UploadedFile;
}

// Define the type for the state based on the updated interface
type PrePreparedAssessmentData = PrePreparedAssessments[];

export default function InitialAssessmentPage() {
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

  // Separate state for custom section
  const [customAssessmentComplete, setCustomAssessmentComplete] = useState<Record<string, boolean>>({})

  // State for pre-prepared assessment - Use the specific type alias
  const [prePreparedAssessments, setPrePreparedAssessments] = useState<PrePreparedAssessmentSection[]>([])

  // New state for collapsible section
  const [isDocumentsOpen, setIsDocumentsOpen] = useState(false)
  const [isPropertyInfoOpen, setIsPropertyInfoOpen] = useState(false)
  const [isSiteDetailsOpen, setIsSiteDetailsOpen] = useState(false)

  // State to hold the current site details being edited in the form
  const [currentSiteDetails, setCurrentSiteDetails] = useState<DetailedSiteDetailsData | null>(null);

  // State to hold the form data currently displayed/edited in the inputs
  const [currentReportFormData, setCurrentReportFormData] = useState<CustomAssessmentForm>({ // Corrected state name and type
    developmentType: '',
    additionalInfo: ''
  });

  // Load data from local storage when the component mounts
  useEffect(() => {
    const savedData = localStorage.getItem(`initialAssessment-${selectedJobId}`);
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        // Ensure the loaded data structure matches your expected format
        if (typeof parsedData === 'object' && parsedData !== null) {
          setFormData(parsedData);
        } else {
          console.warn('Invalid data found in local storage for initial assessment, resetting.');
          localStorage.removeItem(`initialAssessment-${selectedJobId}`);
          setFormData({}); // Reset form data
        }
      } catch (error) {
        console.error('Failed to parse initial assessment data from local storage:', error);
        localStorage.removeItem(`initialAssessment-${selectedJobId}`); // Clear invalid data
        setFormData({}); // Reset form data
      }
    } else {
      setFormData({}); // Reset if no data found for the job
    }
  }, [selectedJobId]);

  // Set initial job ID from URL if present
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const jobId = params.get('job')
    if (jobId) {
      setSelectedJobId(jobId)
    }
    setLoading(false); // Set loading to false after attempting to get job ID
  }, [])

  // Reset purchase state when job changes
  useEffect(() => {
    if (selectedJobId) {
      // Fetch job data
      const fetchJobData = async () => {
        try {
          const jobResponse = await fetch(`/api/jobs/${selectedJobId}`);
          if (!jobResponse.ok) {
            throw new Error('Failed to fetch job details');
          }
          const jobData = await jobResponse.json();

          // Update the global jobs state
          setJobs((prevJobs: Job[]) => prevJobs.map((job: Job) =>
            job.id === selectedJobId ? { ...job, ...jobData } : job
          ));

          // Check for initial assessment payment status
          if (jobData.initialAssessment?.status === 'paid') {
            setPaymentComplete(prev => ({
              ...prev,
              [selectedJobId]: true
            }));
          }

          // Initialize documents with their status
          const updatedDocuments = DOCUMENT_TYPES.map(doc => {
            const uploadedFile = jobData.documents?.[doc.id];
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
            };
          });

          setDocuments(updatedDocuments);
          setDocumentError(null);
        } catch (error) {
          console.error('Error fetching job data:', error);
          setDocumentError('Failed to load job data');
          setDocuments([]); // Reset documents on error
        }
      };

      fetchJobData();
    }
  }, [selectedJobId]);

  // Fetch documents when a job is selected
  useEffect(() => {
    const fetchDocuments = async () => {
      if (!selectedJobId) {
        setDocuments([]);
        return;
      }

      try {
        const response = await fetch(`/api/jobs/${selectedJobId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch job details');
        }
        const jobData = await response.json();

        // Initialize documents with their status
        const updatedDocuments = DOCUMENT_TYPES.map(doc => {
          const uploadedFile = jobData.documents?.[doc.id];
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
          };
        });

        setDocuments(updatedDocuments);
        setDocumentError(null);
      } catch (error) {
        console.error('Error fetching documents:', error);
        setDocumentError('Failed to load documents');
        setDocuments([]); // Reset documents on error
      }
    };

    fetchDocuments();
  }, [selectedJobId]);

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
            updatedAt: new Date().toISOString(),
            customAssessment: {
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
  const handleDownload = async (assessment: PrePreparedAssessments) => {
    if (!assessment.file) {
      toast({
        title: "Error",
        description: "No file associated with this assessment.",
        variant: "destructive",
      });
      return;
    }

    console.log("Downloading from:", assessment.file.savedPath); // Log the path
    // Fetch directly using the savedPath, as the file is now in the client portal's public dir
    const downloadUrl = assessment.file.savedPath!;
    console.log("Attempting fetch from:", downloadUrl);
    try {
      const response = await fetch(downloadUrl); // Fetch the file using the relative path
      if (!response.ok) {
        // Log the status for debugging
        console.error(`Failed to download file: ${response.status} ${response.statusText}`);
        // Check if the response has text, maybe an error message from the server
        const errorText = await response.text().catch(() => 'Could not read error response.');
        console.error("Server response:", errorText);
        throw new Error(`Failed to download file. Status: ${response.status}`);
      }

      const blob = await response.blob(); // Convert response to blob
      const url = window.URL.createObjectURL(blob); // Create a URL for the blob
      const a = document.createElement('a'); // Create a link element
      a.href = url;
      a.download = assessment.file.originalName; // Set the file name
      document.body.appendChild(a);
      a.click(); // Trigger the download
      window.URL.revokeObjectURL(url); // Clean up
      document.body.removeChild(a);

      toast({
        title: "Success",
        description: "File downloaded successfully.",
      });
    } catch (error) {
      console.error('Error downloading pre-prepared assessment:', error);
      toast({
        title: "Download Error",
        description: (error as Error).message || "An unexpected error occurred during download.",
        variant: "destructive",
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
        const assessment = prePreparedAssessments.flatMap(section => section.assessments).find(a => a.file?.originalName === doc.uploadedFile?.originalName);
        if (assessment) {
          handleDownload(assessment);
        }
        return;
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

    // Logic for Initial Assessment Report tile
    if (doc.id === 'initial-assessment-report') {
      const assessmentReturned = isAssessmentReturned();
      // Check if payment is complete for the current job OR if the assessment has been returned
      const shouldShowReportTile = (selectedJobId && paymentComplete[selectedJobId]) || assessmentReturned;

      // If neither paid nor returned, render nothing for this tile yet
      if (!shouldShowReportTile) {
        return null;
      }

      // If paid or returned, show the tile (logic for download if returned)
      if (assessmentReturned) {
        // Render tile with download button if returned
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
                  onClick={() => handleDownload(doc.uploadedFile as unknown as PrePreparedAssessments)}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      } else {

         return (
            <Card key={doc.id} className="relative">
              <CardHeader className="bg-[#323A40] text-white"> {/* Match header style */}
                <h3 className="text-lg font-semibold">{doc.title}</h3>
                {/* Optionally add subtitle like "REPORTS" if needed */}
              </CardHeader>
              <CardContent className="p-4 text-center"> {/* Center content */}
                <div className="flex flex-col items-center justify-center space-y-2 py-4">
                   {/* Placeholder for the document icon (replace with actual icon if available) */}
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                     <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                   </svg>
                   <p className="font-semibold text-lg">Report In Progress</p>
                   <p className="text-sm text-gray-600 px-4">
                     Our team is working on your initial assessment report. You will be notified once it's ready.
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
                onClick={() => handleDownload(doc.uploadedFile as unknown as PrePreparedAssessments)}
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
    const currentJobPaymentComplete = selectedJobId ? paymentComplete[selectedJobId] : false;
    const assessmentReturned = isAssessmentReturned();

    // First, check if the assessment has been returned
    if (assessmentReturned) {
      return (
        <div className="border rounded-lg p-4 bg-green-50">
          <div className="text-center py-4">
            <Check className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <h4 className="font-medium mb-2">Report Complete</h4>
            <p className="text-sm text-gray-600 mb-4">Your initial assessment report is available for download in the documents section.</p>
          </div>
        </div>
      );
    }

    // If not returned, check if payment is complete (report in progress)
    if (currentJobPaymentComplete) {
      return (
        <div className="border rounded-lg p-4 bg-yellow-50"> {/* Use yellow for in-progress */}
          <div className="text-center py-4">
            {/* Consider an 'in progress' icon */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-500 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h4 className="font-medium mb-2">Report In Progress</h4>
            <p className="text-sm text-gray-600">We are processing your initial assessment. You will be notified when it's ready.</p>
          </div>
        </div>
      );
    }

    // If neither returned nor paid, show the form
    const currentFormData = selectedJobId ? formData[selectedJobId] || { developmentType: '', additionalInfo: '' } : { developmentType: '', additionalInfo: '' };
    const certificateOfTitle = documents.find(doc => doc.id === 'certificate-of-title');
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
            <DocumentStatus document={{ id: '10-7-certificate', status: certificate107?.status || 'not-uploaded' }} />

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
          </div>

          {/* Show notification only when 10.7 is missing */}
          {(!certificate107 || certificate107.status !== 'uploaded') && (
            <Alert variant="destructive">
              <AlertDescription>
                Please upload the 10.7 Certificate before proceeding.
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
      localStorage.setItem(`initialAssessment-${selectedJobId}`, JSON.stringify(formData));
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

  const isReadOnly = false;

  // Fetch pre-prepared assessment - Now runs when selectedJobId changes
  useEffect(() => {
    const fetchPrePreparedAssessments = async () => {
      if (!selectedJobId) {
        setPrePreparedAssessments([]); // Clear assessments if no job is selected
        return;
      }

      try {
        const response = await fetch('/api/pre-prepared-assessments');
        if (!response.ok) {
          throw new Error('Failed to fetch pre-prepared assessments');
        }
        const data = await response.json();
        setPrePreparedAssessments(data); // Assuming data is structured as an array of sections
      } catch (error) {
        console.error('Error fetching pre-prepared assessments:', error);
      }
    };

    fetchPrePreparedAssessments();
  }, [selectedJobId]);

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
          <h1 className="text-2xl font-semibold text-[#323A40]">Initial Assessment</h1>
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
            <Link href="/client-portal/dashboard">
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Create New Job
              </Button>
            </Link>
          )}
        </div>
      </div>

    {/* New Section for About Initial Assessment */}
    {!selectedJobId && ( // Only render this section if no job is selected
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">About Initial Assessment</h2>
        <p className="text-sm text-gray-700">
          This section provides information about the initial assessment process, including what to expect and how to prepare.
          Please ensure that all required documents are uploaded before proceeding with your assessment.
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
            <Tabs defaultValue="custom-assessment" className="w-full">
              <TabsList className="w-full grid grid-cols-3 h-12">
                <TabsTrigger value="custom-assessment" className="data-[state=active]:bg-white">Custom Assessment</TabsTrigger>
                <TabsTrigger value="pre-prepared" className="data-[state=active]:bg-white">Pre-prepared</TabsTrigger>
              </TabsList>

              <div className="p-6">
                <TabsContent value="custom-assessment" className="mt-0">
                  {renderCustomAssessmentForm()}
                </TabsContent>

                <TabsContent value="pre-prepared" className="mt-0">
                  <div className="flex flex-wrap gap-4">
                    {prePreparedAssessments
                      .sort((a, b) => a.title.localeCompare(b.title))
                      .map((section) => (
                        <div key={section.id} className="flex-none w-full mb-4">
                          <h2 className="text-xl font-semibold mb-2">{section.title}</h2>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {section.assessments.length > 0 ? (
                              section.assessments.map((assessment) => (
                                <Card key={assessment.id} className="bg-white p-4 rounded-lg shadow-md mb-2">
                                  <CardHeader>
                                    <CardTitle className="text-lg font-semibold">{assessment.title}</CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <p className="text-sm text-gray-600">{assessment.content}</p>
                                    <p className="text-sm text-gray-500">{new Date(assessment.date).toLocaleDateString()}</p>
                                    <p className="text-sm text-gray-500">Posted by {assessment.author}</p>
                                    {assessment.file && (
                                      <Button onClick={() => handleDownload(assessment)} className="text-blue-500 hover:underline">
                                        Download
                                      </Button>
                                    )}
                                  </CardContent>
                                </Card>
                              ))
                            ) : (
                              <p>No assessments available for this section.</p>
                            )}
                          </div>
                        </div>
                      ))}
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
