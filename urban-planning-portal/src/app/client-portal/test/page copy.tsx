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

interface reportWriterForm {
  developmentType: string
  additionalInfo: string
}

interface JobFormData {
  [key: string]: reportWriterForm
}

interface PaymentStatus {
  SoEE: boolean;
  CDC: boolean;
  customAssessment?: boolean;
}

export default function ReportWriterPage() {
  const router = useRouter()
  const { jobs, setJobs } = useJobs()
  const [selectedJobId, setSelectedJobId] = useState<string | undefined>(undefined)
  const [documents, setDocuments] = useState<DocumentWithStatus[]>([])
  const [documentError, setDocumentError] = useState<string | null>(null)
  const [formData, setFormData] = useState<JobFormData>({})
  const [showPaymentButton, setShowPaymentButton] = useState(false)
  // Refactored state to track payment status per report type
  const [paymentStatus, setPaymentStatus] = useState<Record<string, PaymentStatus>>({});
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Separate state for state section
  const [statementOfEnvironmentalEffectsComplete, setStatementOfEnvironmentalEffectsComplete] = useState<Record<string, boolean>>({})
  // Separate state for state section
  const [complyingDevelopmentCertificateComplete, setComplyingDevelopmentCertificateComplete] = useState<Record<string, boolean>>({})

  // New state for collapsible section
  const [isDocumentsOpen, setIsDocumentsOpen] = useState(false)
  const [isPropertyInfoOpen, setIsPropertyInfoOpen] = useState(false)
  const [isSiteDetailsOpen, setIsSiteDetailsOpen] = useState(false)

  // State to hold the current site details being edited in the form
  const [currentSiteDetails, setCurrentSiteDetails] = useState<DetailedSiteDetailsData | null>(null);

  // State to hold the form data currently displayed/edited in the inputs
  const [currentReportFormData, setCurrentReportFormData] = useState<reportWriterForm>({ // Corrected state name and type
    developmentType: '',
    additionalInfo: ''
  });

  // New state for report status
  const [isSoEEReportInProgress, setIsSoEEReportInProgress] = useState(false);
  const [isCDCReportInProgress, setIsCDCReportInProgress] = useState(false);

  // New state for progress tracking
  const [reportProgress, setReportProgress] = useState<{
    [jobId: string]: {
      SoEE: boolean;
      CDC: boolean;
    };
  }>({});

  // State to track previous report return status for notifications
  const [prevSoEEReturnedAt, setPrevSoEEReturnedAt] = useState<string | undefined | null>(null);
  const [prevCDCReturnedAt, setPrevCDCReturnedAt] = useState<string | undefined | null>(null);


  // Load data from local storage when the component mounts
  useEffect(() => {
    const savedData = localStorage.getItem(`statementOfEnvironmentalEffects-${selectedJobId}`);
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        // Ensure the loaded data structure matches your expected format
        if (typeof parsedData === 'object' && parsedData !== null) {
          setFormData(parsedData);
        } else {
          console.warn('Invalid data found in local storage for statement of environmental effects, resetting.');
          localStorage.removeItem(`statementOfEnvironmentalEffects-${selectedJobId}`);
          setFormData({}); // Reset form data
        }
      } catch (error) {
        console.error('Failed to parse statement of environmental effects data from local storage:', error);
        localStorage.removeItem(`statementOfEnvironmentalEffects-${selectedJobId}`); // Clear invalid data
        setFormData({}); // Reset form data
      }
    } else {
      setFormData({}); // Reset if no data found for the job
    }
  }, [selectedJobId]);

    // Load data from local storage when the component mounts
    useEffect(() => {
      const savedData = localStorage.getItem(`complyingDevelopmentCertificate-${selectedJobId}`);
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData);
          // Ensure the loaded data structure matches your expected format
          if (typeof parsedData === 'object' && parsedData !== null) {
            setFormData(parsedData);
          } else {
            console.warn('Invalid data found in local storage for complying development certificate, resetting.');
            localStorage.removeItem(`complyingDevelopmentCertificate-${selectedJobId}`);
            setFormData({}); // Reset form data
          }
        } catch (error) {
          console.error('Failed to parse complying development certificate data from local storage:', error);
          localStorage.removeItem(`complyingDevelopmentCertificate-${selectedJobId}`); // Clear invalid data
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

          // Initialize report progress state based on payment status
          setReportProgress(prev => ({
            ...prev,
            [selectedJobId]: {
              SoEE: jobData.statementOfEnvironmentalEffects?.status === 'paid',
              CDC: jobData.complyingDevelopmentCertificate?.status === 'paid',
            },
          }));

          // Initialize payment status based on fetched job data
          setPaymentStatus(prev => ({
            ...prev,
            [selectedJobId]: {
              SoEE: jobData.statementOfEnvironmentalEffects?.status === 'paid',
              CDC: jobData.complyingDevelopmentCertificate?.status === 'paid',
            },
          }));

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
    // Reset previous returned status when job changes
    setPrevSoEEReturnedAt(null);
    setPrevCDCReturnedAt(null);
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

        // Update payment status based on polled job data
        setPaymentStatus(prev => ({
          ...prev,
          [selectedJobId]: {
            SoEE: jobData.statementOfEnvironmentalEffects?.status === 'paid',
            CDC: jobData.complyingDevelopmentCertificate?.status === 'paid',
          },
        }));

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

  // Effect to show toast notification when a report is returned
  useEffect(() => {
    if (!selectedJobId) return;

    const selectedJob = jobs.find(job => job.id === selectedJobId);
    if (!selectedJob) return;

    const currentSoEEReturnedAt = selectedJob.statementOfEnvironmentalEffects?.returnedAt;
    const currentCDCReturnedAt = selectedJob.complyingDevelopmentCertificate?.returnedAt;

    // Check for SoEE return
    if (currentSoEEReturnedAt && currentSoEEReturnedAt !== prevSoEEReturnedAt) {
      toast({
        title: "Report Ready",
        description: "Your Statement of Environmental Effects report is ready for download.",
      });
      setPrevSoEEReturnedAt(currentSoEEReturnedAt); // Update previous status
    }

    // Check for CDC return
    if (currentCDCReturnedAt && currentCDCReturnedAt !== prevCDCReturnedAt) {
      toast({
        title: "Report Ready",
        description: "Your Complying Development Certificate report is ready for download.",
      });
      setPrevCDCReturnedAt(currentCDCReturnedAt); // Update previous status
    }

  }, [jobs, selectedJobId, prevSoEEReturnedAt, prevCDCReturnedAt]); // Depend on jobs, selectedJobId and previous statuses

  const isStatementOfEnvironmentalEffectsReturned = () => {
    if (!selectedJobId) return false
    const selectedJob = jobs.find(job => job.id === selectedJobId)
    return selectedJob?.statementOfEnvironmentalEffects?.returnedAt !== undefined
  }

  const isComplyingDevelopmentCertificateReturned = () => {
    if (!selectedJobId) return false
    const selectedJob = jobs.find(job => job.id === selectedJobId)
    return selectedJob?.complyingDevelopmentCertificate?.returnedAt !== undefined
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

  const handleFormChange = (field: keyof reportWriterForm) => (
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

  const handleStatementPayment = async () => {
    if (!selectedJobId) return;

    try {
      const currentFormData = formData[selectedJobId] || { developmentType: '', additionalInfo: '' };
      const selectedJob = jobs.find(job => job.id === selectedJobId);

      if (!selectedJob) {
        throw new Error('Job not found');
      }

      // Create work ticket for Statement of Environmental Effects
      const statementTicketResponse = await fetch('/api/work-tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobId: selectedJobId,
          jobAddress: selectedJob.address,
          ticketType: 'statement-of-environmental-effects',
          statementOfEnvironmentalEffects: {
            developmentType: currentFormData.developmentType,
            additionalInfo: currentFormData.additionalInfo,
            documents: {
              certificateOfTitle: documents.find(doc => doc.id === 'certificate-of-title')?.uploadedFile?.originalName,
              surveyPlan: documents.find(doc => doc.id === 'survey-plan')?.uploadedFile?.originalName,
              certificate107: documents.find(doc => doc.id === '10-7-certificate')?.uploadedFile?.originalName
            }
          }
        })
      });

      if (!statementTicketResponse.ok) {
        throw new Error('Failed to create statement work ticket');
      }

      // Update the job data to store the purchase
      const updateResponse = await fetch(`/api/jobs/${selectedJobId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          statementOfEnvironmentalEffects: {
            status: 'paid',
            type: 'statement-of-environmental-effects',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            statementOfEnvironmentalEffects: {
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
      });

      if (!updateResponse.ok) {
        throw new Error('Failed to update job status');
      }

      // Update report progress state
      setReportProgress(prev => ({
        ...prev,
        [selectedJobId]: {
          ...prev[selectedJobId],
          SoEE: true, // Mark as in progress
        },
      }));

      // Show success message
      toast({
        title: "Success",
        description: "Your Statement of Environmental Effects has been purchased successfully.",
      });

    } catch (error) {
      console.error('Error processing statement payment:', error);
      toast({
        title: "Error",
        description: "Failed to process payment. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleComplyingDevelopmentPayment = async () => {
    if (!selectedJobId) return;

    try {
      const currentFormData = formData[selectedJobId] || { developmentType: '', additionalInfo: '' };
      const selectedJob = jobs.find(job => job.id === selectedJobId);

      if (!selectedJob) {
        throw new Error('Job not found');
      }

      // Create work ticket for Complying Development Certificate
      const complyingTicketResponse = await fetch('/api/work-tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobId: selectedJobId,
          jobAddress: selectedJob.address,
          ticketType: 'complying-development-certificate',
          complyingDevelopmentCertificate: {
            developmentType: currentFormData.developmentType,
            additionalInfo: currentFormData.additionalInfo,
            documents: {
              certificateOfTitle: documents.find(doc => doc.id === 'certificate-of-title')?.uploadedFile?.originalName,
              surveyPlan: documents.find(doc => doc.id === 'survey-plan')?.uploadedFile?.originalName,
              certificate107: documents.find(doc => doc.id === '10-7-certificate')?.uploadedFile?.originalName
            }
          }
        })
      });

      if (!complyingTicketResponse.ok) {
        throw new Error('Failed to create complying development certificate work ticket');
      }

      // Update the job data to store the purchase
      const updateResponse = await fetch(`/api/jobs/${selectedJobId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          complyingDevelopmentCertificate: {
            status: 'paid',
            type: 'complying-development-certificate',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            complyingDevelopmentCertificate: {
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
      });

      if (!updateResponse.ok) {
        throw new Error('Failed to update job status');
      }

      // Update report progress state
      setReportProgress(prev => ({
        ...prev,
        [selectedJobId]: {
          ...prev[selectedJobId],
          CDC: true, // Mark as in progress
        },
      }));

      // Show success message
      toast({
        title: "Success",
        description: "Your Complying Development Certificate has been purchased successfully.",
      });

    } catch (error) {
      console.error('Error processing complying development payment:', error);
      toast({
        title: "Error",
        description: "Failed to process payment. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Add download function
  const handleDownload = async (documentId: string) => {
    if (!selectedJobId) {
      toast({
        title: "Error",
        description: "Please select a job first",
        variant: "destructive"
      });
      return;
    }

    try {
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

    // Logic for Statement of Environmental Effects Report tile
    if (doc.id === 'statement-of-environmental-effects') {
      const statementOfEnvironmentalEffectsReturned = isStatementOfEnvironmentalEffectsReturned();
      // Check if SoEE payment is complete for the current job OR if the assessment has been returned
      const isSoEEPaid = selectedJobId && paymentStatus[selectedJobId]?.SoEE;
      const shouldShowReportTile = isSoEEPaid || statementOfEnvironmentalEffectsReturned;

      // If neither paid nor returned, render nothing for this tile yet
      if (!shouldShowReportTile) {
        return null;
      }

      // If paid or returned, show the tile (logic for download if returned)
      if (statementOfEnvironmentalEffectsReturned) {
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
                  onClick={() => handleDownload('statement-of-environmental-effects')}
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
                     Our team is working on your statement of environmental effects. You will be notified once it's ready.
                   </p>
                </div>
              </CardContent>
            </Card>
         );
      }
    }

    // Logic for Complying Development Certificate Report tile
    if (doc.id === 'complying-development-certificate') {
      const complyingDevelopmentCertificateReturned = isComplyingDevelopmentCertificateReturned();
      // Check if CDC payment is complete for the current job OR if the assessment has been returned
      const isCDCPaid = selectedJobId && paymentStatus[selectedJobId]?.CDC;
      const shouldShowReportTile = isCDCPaid || complyingDevelopmentCertificateReturned;

      // If neither paid nor returned, render nothing for this tile yet
      if (!shouldShowReportTile) {
        return null;
      }

      // If paid or returned, show the tile (logic for download if returned)
      if (complyingDevelopmentCertificateReturned) {
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
                  onClick={() => handleDownload('complying-development-certificate')}
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
                     Our team is working on your complying development certificate. You will be notified once it's ready.
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
    const requiredDocs = documents.filter(doc =>
      [
        'certificate-of-title',
        '10-7-certificate',
        'survey-plan',
        'statement-of-environmental-effects',
        'complying-development-certificate',
        'custom-assessment'
      ].includes(doc.id)
    );

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {requiredDocs.map(doc => renderDocumentUpload(doc))}

        {/* Conditionally render the returned custom Initial Assessment Report */}
        {(() => {
          if (!selectedJobId) return null;
          const selectedJob = jobs.find(job => job.id === selectedJobId);
          // Check if it's a custom assessment AND it has been returned
          const isCustomAssessmentReturned = selectedJob?.initialAssessment?.type === 'custom' && selectedJob?.initialAssessment?.returnedAt;

          if (isCustomAssessmentReturned) {
            // Find the actual report document using the correct ID
            const initialAssessmentDoc = documents.find(doc => doc.id === 'initial-assessment-report');
            if (initialAssessmentDoc) {
              // Render the document card using the existing function
              // Make sure renderDocumentUpload handles the 'initial-assessment-report' case correctly
              // If it doesn't, we might need to adjust renderDocumentUpload or add specific rendering here.
              // Assuming renderDocumentUpload is generic enough or handles it:
              return renderDocumentUpload(initialAssessmentDoc);
            }
          }
          // Return null if the conditions aren't met
          return null;
        })()}

        {/* The incorrect hardcoded block previously here has been removed. */}
      </div>
    );
  };

  // Add renderReportWriterForm function
  const renderReportWriterForm = (ticketType: 'statement-of-environmental-effects' | 'complying-development-certificate') => {
    if (!selectedJobId) {
      return null; // or handle the case when no job is selected
    }

    const currentFormData = formData[selectedJobId] || { developmentType: '', additionalInfo: '' };
    const certificate107 = documents.find(doc => doc.id === '10-7-certificate');

    // Check if the report has been returned first
    if (ticketType === 'statement-of-environmental-effects' && isStatementOfEnvironmentalEffectsReturned()) {
      return (
        <div className="border rounded-lg p-4 bg-green-50">
          <div className="text-center py-4">
            <Check className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <h4 className="font-medium mb-2">Report Complete</h4>
            <p className="text-sm text-gray-600">Your Statement of Environmental Effects report is available for download in the Documents section.</p>
          </div>
        </div>
      );
    }

    // If not returned, check if it's in progress (paid but not returned)
    if (ticketType === 'statement-of-environmental-effects' && reportProgress[selectedJobId]?.SoEE) {
      return (
        <div className="border rounded-lg p-4 bg-yellow-50">
          <div className="text-center py-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-500 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h4 className="font-medium mb-2">Report In Progress</h4>
            <p className="text-sm text-gray-600">Our team is working on your Statement of Environmental Effects. You will be notified once it's ready.</p>
          </div>
        </div>
      );
    }
    if (ticketType === 'complying-development-certificate' && isComplyingDevelopmentCertificateReturned()) {
       return (
         <div className="border rounded-lg p-4 bg-blue-50">
           <div className="text-center py-4">
             <Check className="h-8 w-8 text-blue-500 mx-auto mb-2" />
             <h4 className="font-medium mb-2">Report Complete</h4>
             <p className="text-sm text-gray-600">Your Complying Development Certificate report is available for download in the Documents section.</p>
           </div>
         </div>
       );
    }

    // If not returned, check if it's in progress (paid but not returned)
    if (ticketType === 'complying-development-certificate' && reportProgress[selectedJobId]?.CDC) {
      return (
        <div className="border rounded-lg p-4 bg-yellow-50"> {/* Changed background for clarity */}
          <div className="text-center py-4">
             {/* Consider an 'in progress' icon instead of Check */}
             <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-500 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
               <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
             </svg>
            <h4 className="font-medium mb-2">Report In Progress</h4>
            <p className="text-sm text-gray-600">Our team is working on your Complying Development Certificate. You will be notified once it's ready.</p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Development Type</label>
            <Input
              placeholder="Enter the type of development"
              value={currentFormData.developmentType}
              onChange={handleFormChange('developmentType')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Additional Information</label>
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
          </div>

          {/* Show notification only when 10.7 is missing */}
          {(!certificate107 || certificate107.status !== 'uploaded') && (
            <Alert variant="destructive">
              <AlertDescription>Please upload the 10.7 Certificate before proceeding.</AlertDescription>
            </Alert>
          )}

          <div className="pt-4">
            {showPaymentButton ? (
              // Show payment button if details are confirmed
              ticketType === 'statement-of-environmental-effects' ? (
                <Button
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={handleStatementPayment}
                >
                  Proceed to Payment for Statement
                </Button>
              ) : (
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={handleComplyingDevelopmentPayment}
                >
                  Proceed to Payment for Complying Development Certificate
                </Button>
              )
            ) : (
              // Show confirm details button if not confirmed
              <Button
                className="w-full"
                onClick={handleConfirmDetails}
                disabled={!certificate107 || certificate107.status !== 'uploaded'}
              >
                Confirm Details
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const handleSaveChanges = () => {
    if (selectedJobId) {
      // Determine which form data to save based on the current tab or context
      const currentFormData = formData[selectedJobId];

      // Save the appropriate form data to local storage
      if (currentFormData) {
        const ticketType = currentFormData.developmentType; // Assuming you have a way to determine the ticket type

        if (ticketType === 'statement-of-environmental-effects') {
          localStorage.setItem(`statementOfEnvironmentalEffects-${selectedJobId}`, JSON.stringify(currentFormData));
        } else if (ticketType === 'complying-development-certificate') {
          localStorage.setItem(`complyingDevelopmentCertificate-${selectedJobId}`, JSON.stringify(currentFormData));
        }

        setHasUnsavedChanges(false);
        toast({
          title: "Success",
          description: "Changes saved successfully.",
        });
      }
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
            <Link href="/client-portal/dashboard">
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
                <ChevronUp className="h-5 w-5 text-white" />
              ) : (
                <ChevronDown className="h-5 w-5 text-white" />
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
            <Tabs defaultValue="statement-of-environmental-effects" className="w-full">
              <TabsList className="w-full grid grid-cols-2 h-12">
                <TabsTrigger value="statement-of-environmental-effects" className="data-[state=active]:bg-white">
                  Statement of Environmental Effects
                </TabsTrigger>
                <TabsTrigger value="complying-development-certificate" className="data-[state=active]:bg-white">
                  Complying Development Certificate
                </TabsTrigger>
              </TabsList>

              <div className="p-6">
                <TabsContent value="statement-of-environmental-effects" className="mt-0">
                  {renderReportWriterForm('statement-of-environmental-effects')}
                </TabsContent>

                <TabsContent value="complying-development-certificate" className="mt-0">
                  {renderReportWriterForm('complying-development-certificate')}
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </>
      )}
    </div>
  )
}
