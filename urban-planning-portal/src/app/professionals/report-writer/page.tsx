'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from "@shared/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@shared/components/ui/card"
import { Plus, Upload, FileText, X, Check, ArrowLeft, ChevronDown, ChevronUp, Download, AlertCircle } from "@shared/components/ui/icons"
import { ShoppingCart } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@shared/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@shared/components/ui/select"
import { useJobs } from '@shared/hooks/useJobs'
import Link from 'next/link'
import { Alert, AlertDescription } from "@shared/components/ui/alert"
import { Document, DOCUMENT_TYPES } from '@shared/types/documents'
import { DocumentWithStatus } from '@shared/types/documents'
import { Input } from "@shared/components/ui/input"
import { Textarea } from "@shared/components/ui/textarea"
import { toast } from "@shared/components/ui/use-toast"
import { PropertyInfo } from '@shared/components/PropertyInfo'
import { DetailedSiteDetails, SiteDetails } from '@shared/components/DetailedSiteDetails'
import { DocumentStatus } from '@shared/components/DocumentStatus'
import { Job, PurchasedPrePreparedAssessments } from '@shared/types/jobs'
import { getReportStatus, isReportType, getReportTitle, getReportData, ReportType } from '@/utils/report-utils'
import type { PropertyDataShape } from '@shared/components/PropertyInfo'
import { Progress } from "@shared/components/ui/progress"
import { Loader2 } from 'lucide-react'
import { DocumentUpload } from "@shared/components/DocumentUpload"
import { DocumentProvider, useDocuments } from '@shared/contexts/document-context'
import { SiteDetailsProvider, useSiteDetails } from '@shared/contexts/site-details-context'

interface CustomAssessmentForm {
  developmentType: string;
  additionalInfo: string;
  uploadedDocuments: Record<string, boolean>;
  selectedTab: string;
}

interface ReportFormState {
  formData: CustomAssessmentForm
  paymentComplete: boolean
  showPaymentButton: boolean
  hasUnsavedChanges: boolean
}

interface ReportWriterFormState {
  'custom-assessment': ReportFormState
  'statement-of-environmental-effects': ReportFormState
  'complying-development-certificate': ReportFormState
}

interface PrePreparedAssessmentSection {
  title: string;
  assessments: PrePreparedAssessment[];
}

interface CustomDocument {
  id: string;
  title: string;
  url: string;
  type: string;
  size: number;
  createdAt: string;
}

type PurchasedAssessments = Record<string, boolean>;

interface PrePreparedAssessment {
  id: string;
  section: string;
  title: string;
  content: string;
  date: string;
  author: string;
  file?: {
    originalName: string;
    id: string;
  };
  purchaseDate?: string;
}

interface ReportSectionProps {
  doc: DocumentWithStatus
  job: Job
  onUpload: (file: File) => void
  onDownload: () => void
  onDelete: () => void
  isLoading: boolean
}

const ReportSection = ({ doc, job, onUpload, onDownload, onDelete, isLoading }: ReportSectionProps) => {
  const status = getReportStatus(doc, job)
  const title = getReportTitle(doc.id)

  return (
    <Card className="mb-4">
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <div className="flex items-center space-x-2">
            {status.isPaid && <span className="text-green-500">Paid</span>}
            {status.isCompleted && <span className="text-blue-500">Completed</span>}
            {status.isUploaded && <span className="text-purple-500">Uploaded</span>}
          </div>
        </div>

        <div className="space-y-4">
          {status.hasFile && (
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={onDownload}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Download'
                )}
              </Button>
              <Button
                variant="destructive"
                onClick={onDelete}
                disabled={isLoading}
              >
                Delete
              </Button>
            </div>
          )}

          {!status.hasFile && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) onUpload(file)
                  }}
                  disabled={isLoading}
                />
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              </div>
              <p className="text-sm text-gray-500">
                Upload a PDF or Word document
              </p>
            </div>
          )}

          {status.reportData && (
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Report Data</h4>
              <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
                {JSON.stringify(status.reportData, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}

// Define fetch function for individual job details
const fetchJobDetails = async (jobId: string): Promise<Job> => {
  const response = await fetch(`/api/jobs/${jobId}`);
  if (!response.ok) {
    const errorBody = await response.text();
    console.error("Failed to fetch job details:", response.status, errorBody);
    throw new Error(`Failed to fetch job details for ID ${jobId}. Status: ${response.status}`);
  }
  return response.json();
};

// Define fetch function for pre-prepared assessments
const fetchPrePreparedAssessments = async (): Promise<PrePreparedAssessmentSection[]> => {
    const response = await fetch('/api/pre-prepared-assessments');
    if (!response.ok) {
        const errorBody = await response.text();
        console.error("Failed to fetch pre-prepared assessments:", response.status, errorBody);
        throw new Error(`Failed to fetch pre-prepared assessments. Status: ${response.status}`);
    }
    const data = await response.json();
    // Add validation if necessary
    if (!Array.isArray(data)) {
        console.error("Invalid pre-prepared assessments data received:", data);
        throw new Error('Invalid pre-prepared assessments data received');
    }
    return data;
};

const formatDate = (dateString: string) => {
  try {
    return new Date(dateString).toLocaleDateString();
  } catch (e) {
    return dateString;
  }
};

// Helper to normalize any site details object to SiteDetails shape
function normalizeSiteDetails(data: any): SiteDetails {
  return {
    siteArea: data?.siteArea || '',
    frontage: data?.frontage || '',
    depth: data?.depth || '',
    slope: data?.slope || '',
    orientation: data?.orientation || '',
    soilType: data?.soilType || '',
    vegetation: data?.vegetation || '',
    heritage: data?.heritage || '',
    floodProne: data?.floodProne || '',
    bushfireProne: data?.bushfireProne || '',
    contamination: data?.contamination || '',
    otherConstraints: data?.otherConstraints || '',
    adjoiningNorth: data?.adjoiningNorth || '',
    adjoiningSouth: data?.adjoiningSouth || '',
    adjoiningEast: data?.adjoiningEast || '',
    adjoiningWest: data?.adjoiningWest || '',
  };
}

function ReportWriterContent({ params }: { params: { id: string } }) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { jobs } = useJobs()
  const [selectedJobId, setSelectedJobId] = useState<string | undefined>(undefined)
  const { documents, isLoading, error, uploadDocument, removeDocument, downloadDocument } = useDocuments()
  const { siteDetails, updateSiteDetails, saveSiteDetails, hasUnsavedChanges: hasUnsavedSiteDetails } = useSiteDetails()
  const [documentError, setDocumentError] = useState<string | null>(null)
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  // Combined state for both report forms (Keep this)
  const [formState, setFormState] = useState<ReportWriterFormState>({
    'custom-assessment': {
      formData: { developmentType: '', additionalInfo: '', uploadedDocuments: {}, selectedTab: 'details' },
      paymentComplete: false,
      showPaymentButton: false,
      hasUnsavedChanges: false,
    },
    'statement-of-environmental-effects': {
      formData: { developmentType: '', additionalInfo: '', uploadedDocuments: {}, selectedTab: 'details' },
      paymentComplete: false,
      showPaymentButton: false,
      hasUnsavedChanges: false,
    },
    'complying-development-certificate': {
      formData: { developmentType: '', additionalInfo: '', uploadedDocuments: {}, selectedTab: 'details' },
      paymentComplete: false,
      showPaymentButton: false,
      hasUnsavedChanges: false,
    },
  });

  // New state for collapsible section
  const [isDocumentsOpen, setIsDocumentsOpen] = useState(false)
  const [isPropertyInfoOpen, setIsPropertyInfoOpen] = useState(false)
  const [isSiteDetailsOpen, setIsSiteDetailsOpen] = useState(false)

  // Add this after other state declarations
  const [purchasedAssessments, setPurchasedAssessments] = useState<PurchasedAssessments>({})

  // Load form data from local storage when the job ID changes
  useEffect(() => {
    if (!selectedJobId) {
      setFormState({
        'custom-assessment': { formData: { developmentType: '', additionalInfo: '', uploadedDocuments: {}, selectedTab: 'details' }, paymentComplete: false, showPaymentButton: false, hasUnsavedChanges: false },
        'statement-of-environmental-effects': { formData: { developmentType: '', additionalInfo: '', uploadedDocuments: {}, selectedTab: 'details' }, paymentComplete: false, showPaymentButton: false, hasUnsavedChanges: false },
        'complying-development-certificate': { formData: { developmentType: '', additionalInfo: '', uploadedDocuments: {}, selectedTab: 'details' }, paymentComplete: false, showPaymentButton: false, hasUnsavedChanges: false },
      });
      return;
    }

    const loadFormData = (formType: keyof ReportWriterFormState): CustomAssessmentForm => { // Ensure return type matches
      const savedData = localStorage.getItem(`${formType}-${selectedJobId}`);
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData);
          if (parsedData && typeof parsedData.developmentType === 'string' && typeof parsedData.additionalInfo === 'string') {
            return parsedData;
          } else {
            console.warn(`Invalid data found in local storage for ${formType}, resetting.`);
            localStorage.removeItem(`${formType}-${selectedJobId}`);
          }
        } catch (error) {
          console.error(`Failed to parse ${formType} data from local storage:`, error);
          localStorage.removeItem(`${formType}-${selectedJobId}`);
        }
      }
      return { developmentType: '', additionalInfo: '', uploadedDocuments: {}, selectedTab: 'details' }; // Default empty form
    };

    // Correctly update form state by spreading previous state
    setFormState(prev => ({
      ...prev, // Spread previous state
      'custom-assessment': {
        ...prev['custom-assessment'], // Spread specific form type state
        formData: loadFormData('custom-assessment'),
        hasUnsavedChanges: false,
      },
      'statement-of-environmental-effects': {
        ...prev['statement-of-environmental-effects'], // Spread specific form type state
        formData: loadFormData('statement-of-environmental-effects'),
        hasUnsavedChanges: false,
      },
      'complying-development-certificate': {
        ...prev['complying-development-certificate'], // Spread specific form type state
        formData: loadFormData('complying-development-certificate'),
        hasUnsavedChanges: false,
      },
    }));

  }, [selectedJobId]);


    // Set initial job ID from URL if present
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const jobId = params.get('job')
    if (jobId) {
      setSelectedJobId(jobId)
    }
  }, [])

  // --- React Query for fetching selected job details ---
  const {
    data: currentJob,
    isLoading: isJobLoading,
    error: jobError,
    isError: isJobError,
  } = useQuery<Job, Error>({
    queryKey: ['job', selectedJobId],
    queryFn: () => fetchJobDetails(selectedJobId!),
    enabled: !!selectedJobId,
  });
  // --- End React Query ---

  // --- React Query for fetching pre-prepared assessments ---
  const {
      data: prePreparedAssessmentsData = [], // Default to empty array
      isLoading: isPrePreparedLoading,
      error: prePreparedError,
      isError: isPrePreparedError,
  } = useQuery<PrePreparedAssessmentSection[], Error>({
      queryKey: ['prePreparedAssessments'], // Unique key
      queryFn: fetchPrePreparedAssessments, // Use the fetch function
      staleTime: 1000 * 60 * 10, // Example: Cache for 10 minutes
  });
  // --- End React Query ---


  // Effect to update local component state based on fetched job data
  useEffect(() => {
    if (currentJob) {
      // Helper function to transform uploaded documents into boolean record
      const transformUploadedDocuments = (documents?: Record<string, any>): Record<string, boolean> => {
        if (!documents) return {}
        return Object.keys(documents).reduce((acc, key) => {
          acc[key] = true
          return acc
        }, {} as Record<string, boolean>)
      }

      // Update form state based on job data
      setFormState(prev => ({
        'custom-assessment': {
          ...prev['custom-assessment'],
          paymentComplete: currentJob.customAssessment?.status === 'paid',
          showPaymentButton: currentJob.customAssessment?.status !== 'paid',
          formData: prev['custom-assessment'].hasUnsavedChanges
            ? prev['custom-assessment'].formData
            : {
                developmentType: currentJob.customAssessment?.developmentType || '',
                additionalInfo: currentJob.customAssessment?.additionalInfo || '',
                uploadedDocuments: transformUploadedDocuments(currentJob.customAssessment?.uploadedDocuments),
                selectedTab: 'details'
              },
        },
        'statement-of-environmental-effects': {
          ...prev['statement-of-environmental-effects'],
          paymentComplete: currentJob.statementOfEnvironmentalEffects?.status === 'paid',
          showPaymentButton: currentJob.statementOfEnvironmentalEffects?.status !== 'paid',
          formData: prev['statement-of-environmental-effects'].hasUnsavedChanges
            ? prev['statement-of-environmental-effects'].formData
            : {
                developmentType: currentJob.statementOfEnvironmentalEffects?.developmentType || '',
                additionalInfo: currentJob.statementOfEnvironmentalEffects?.additionalInfo || '',
                uploadedDocuments: transformUploadedDocuments(currentJob.statementOfEnvironmentalEffects?.uploadedDocuments),
                selectedTab: 'details'
              },
        },
        'complying-development-certificate': {
          ...prev['complying-development-certificate'],
          paymentComplete: currentJob.complyingDevelopmentCertificate?.status === 'paid',
          showPaymentButton: currentJob.complyingDevelopmentCertificate?.status !== 'paid',
          formData: prev['complying-development-certificate'].hasUnsavedChanges
            ? prev['complying-development-certificate'].formData
            : {
                developmentType: currentJob.complyingDevelopmentCertificate?.developmentType || '',
                additionalInfo: currentJob.complyingDevelopmentCertificate?.additionalInfo || '',
                uploadedDocuments: transformUploadedDocuments(currentJob.complyingDevelopmentCertificate?.uploadedDocuments),
                selectedTab: 'details'
              },
        },
      }))

      // Update purchased assessments state from fetched job data
      if (currentJob.purchasedPrePreparedAssessments) {
        setPurchasedAssessments(
          Object.keys(currentJob.purchasedPrePreparedAssessments).reduce(
            (acc, assessmentId) => ({ ...acc, [assessmentId]: true }),
            {}
          )
        )
      } else {
        setPurchasedAssessments({})
      }

      // Update site details state if not already modified locally
      if (!hasUnsavedSiteDetails) {
        updateSiteDetails(normalizeSiteDetails(currentJob.siteDetails || {}))
      }

      setDocumentError(null)
    } else if (!selectedJobId) {
      // Reset states if no job is selected
      setFormState({
        'custom-assessment': { formData: { developmentType: '', additionalInfo: '', uploadedDocuments: {}, selectedTab: 'details' }, paymentComplete: false, showPaymentButton: false, hasUnsavedChanges: false },
        'statement-of-environmental-effects': { formData: { developmentType: '', additionalInfo: '', uploadedDocuments: {}, selectedTab: 'details' }, paymentComplete: false, showPaymentButton: false, hasUnsavedChanges: false },
        'complying-development-certificate': { formData: { developmentType: '', additionalInfo: '', uploadedDocuments: {}, selectedTab: 'details' }, paymentComplete: false, showPaymentButton: false, hasUnsavedChanges: false },
      })
      setPurchasedAssessments({})
      updateSiteDetails({})
      setDocumentError(null)
    }

    if (isJobError) {
      console.error('Error fetching job data:', jobError)
      setDocumentError(jobError?.message || 'Failed to load job data')
    }
  }, [currentJob, selectedJobId, isJobError, jobError, hasUnsavedSiteDetails])


  const isAssessmentReturned = (type: 'custom-assessment' | 'statement-of-environmental-effects' | 'complying-development-certificate') => {
    if (!currentJob) return false;
    const doc: DocumentWithStatus = {
      id: type,
      title: getReportTitle(type),
      category: 'Report',
      description: '',
      path: '/document-store',
      type: 'document',
      versions: [],
      currentVersion: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true,
      status: 'pending'
    };
    const { isCompleted } = getReportStatus(doc, currentJob)
    return isCompleted
  }

  // Generalized form change handler
  const handleFormChange = (formType: keyof ReportWriterFormState, field: keyof CustomAssessmentForm) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
     if (!selectedJobId) return;
     setFormState(prev => ({
       ...prev,
       [formType]: {
         ...prev[formType],
         formData: {
           ...prev[formType].formData,
           [field]: e.target.value,
         },
         hasUnsavedChanges: true,
       },
     }));
  };


  // Generalized confirm details handler
  const handleConfirmDetails = (formType: keyof ReportWriterFormState) => {
     if (!selectedJobId) return;
     const currentFormData = formState[formType].formData;
     if (!currentFormData.developmentType.trim()) {
       alert('Please enter the development type');
       return;
     }
     const certificate107Doc = documents.find(doc => doc.id === '10-7-certificate');
     if (!certificate107Doc || certificate107Doc.status !== 'uploaded') {
       alert('Please upload the 10.7 Certificate before proceeding');
       return;
     }
     setFormState(prev => ({
       ...prev,
       [formType]: {
         ...prev[formType],
         showPaymentButton: true,
       },
     }));
  };

  // --- Mutation for Updating Job Status (Payment) ---
  const updateJobMutation = useMutation<Job, Error, { jobId: string; payload: Partial<Job> }>({
    mutationFn: async ({ jobId, payload }) => {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to update job status');
      }
      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['job', variables.jobId] });
      const formType = Object.keys(variables.payload)[0] as keyof ReportWriterFormState | undefined;
      if (formType && (formType === 'custom-assessment' || formType === 'statement-of-environmental-effects' || formType === 'complying-development-certificate')) {
          setFormState(prev => ({
            ...prev,
            [formType]: {
              ...prev[formType],
              showPaymentButton: false,
            },
          }));
      }
    },
    onError: (error) => {
      console.error("Error updating job status:", error);
      toast({
        title: "Error Updating Job",
        description: `${error.message}`,
        variant: "destructive",
      });
    },
  });

  // --- Mutation for Creating Work Ticket ---
  const createWorkTicketMutation = useMutation<any, Error, any>({
    mutationFn: async (payload) => {
      const formData = new FormData()
      formData.append('file', payload.file)
      formData.append('metadata', JSON.stringify({
        jobId: params.id,
        jobAddress: payload.jobAddress,
        ticketType: payload.ticketType,
        uploadedBy: 'professional'
      }))

      const response = await fetch('/api/work-tickets', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to create work ticket')
      }
      return response.json()
    },
    onError: (error) => {
      console.error("Error creating work ticket:", error)
      toast({
        title: "Error Creating Work Ticket",
        description: `${error.message}`,
        variant: "destructive",
      })
    },
  })


  // Generalized payment handler - Refactored with useMutation
  const handlePayment = async (formType: keyof ReportWriterFormState) => {
    if (!selectedJobId || !currentJob) {
      toast({ title: "Error", description: "Job data not loaded.", variant: "destructive" });
      return;
    }

    const currentFormData = formState[formType].formData;

    // Type guard to ensure formType is a valid report type
    if (!['custom-assessment', 'statement-of-environmental-effects', 'complying-development-certificate'].includes(formType)) {
      toast({ title: "Error", description: "Invalid report type.", variant: "destructive" });
      return;
    }

    const workTicketPayload = {
      jobId: selectedJobId,
      jobAddress: currentJob.address,
      ticketType: formType,
      [formType]: {
        developmentType: currentFormData.developmentType,
        additionalInfo: currentFormData.additionalInfo,
        documents: {
          certificateOfTitle: {
            originalName: documents.find(doc => doc.id === 'certificate-of-title')?.uploadedFile?.originalName,
            filename: documents.find(doc => doc.id === 'certificate-of-title')?.uploadedFile?.filename
          },
          surveyPlan: {
            originalName: documents.find(doc => doc.id === 'survey-plan')?.uploadedFile?.originalName,
            filename: documents.find(doc => doc.id === 'survey-plan')?.uploadedFile?.filename
          },
          certificate107: {
            originalName: documents.find(doc => doc.id === '10-7-certificate')?.uploadedFile?.originalName,
            filename: documents.find(doc => doc.id === '10-7-certificate')?.uploadedFile?.filename
          }
        }
      }
    };

    const jobUpdatePayload = {
      [formType]: {
        status: 'paid',
        type: formType,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        developmentType: currentFormData.developmentType,
        additionalInfo: currentFormData.additionalInfo,
        documents: (workTicketPayload as any)[formType].documents
      }
    };

    try {
      await createWorkTicketMutation.mutateAsync(workTicketPayload);
      await updateJobMutation.mutateAsync({ jobId: selectedJobId, payload: jobUpdatePayload });

      toast({
        title: "Success",
        description: `Your ${formType === 'custom-assessment' ? 'Custom Assessment Report' : formType === 'statement-of-environmental-effects' ? 'Statement of Environmental Effects' : 'Complying Development Certificate'} has been purchased successfully.`,
      });

    } catch (error) {
      console.error(`Error processing ${formType} payment sequence:`, error);
      if (!createWorkTicketMutation.isError && !updateJobMutation.isError) {
         toast({
           title: "Payment Processing Error",
           description: `An unexpected error occurred during payment for ${formType === 'custom-assessment' ? 'Custom Assessment Report' : formType === 'statement-of-environmental-effects' ? 'Statement of Environmental Effects' : 'Complying Development Certificate'}. Please try again.`,
           variant: "destructive",
         });
      }
    }
  };


  // --- Mutation for Saving Site Details ---
  const saveSiteDetailsMutation = useMutation<Job, Error, { jobId: string; details: SiteDetails }>({
      mutationFn: async ({ jobId, details }) => {
          const response = await fetch(`/api/jobs/${jobId}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ siteDetails: details }),
          });
          if (!response.ok) {
              const errorData = await response.json().catch(() => ({}));
              throw new Error(errorData.error || 'Failed to save site details');
          }
          return response.json();
      },
      onSuccess: (data, variables) => {
          queryClient.invalidateQueries({ queryKey: ['job', variables.jobId] });
          updateSiteDetails({});
          toast({
              title: "Success",
              description: "Site details saved successfully.",
          });
      },
      onError: (error) => {
          console.error("Error saving site details:", error);
          toast({
              title: "Error Saving Site Details",
              description: `${error.message}`,
              variant: "destructive",
          });
      },
  });

  // Updated save function for Site Details - uses useMutation
  const handleSaveSiteDetails = () => {
    if (!selectedJobId) {
      toast({ title: "Error", description: "No job selected.", variant: "destructive" })
      return
    }
    console.log('Saving Site Details via mutation:', siteDetails)
    saveSiteDetailsMutation.mutate({ jobId: selectedJobId, details: siteDetails })
  }


  // --- Mutation for Purchasing Pre-prepared Assessments ---
  const purchasePrePreparedMutation = useMutation<any, Error, { assessment: PrePreparedAssessment }>({
    mutationFn: async ({ assessment }) => {
      if (!selectedJobId) throw new Error("No job selected");
      const response = await fetch(`/api/jobs/${selectedJobId}/pre-prepared-assessments/purchase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assessment: {
            id: assessment.id,
            section: assessment.section,
            title: assessment.title,
            content: assessment.content,
            author: assessment.author,
            file: assessment.file
          }
        }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to purchase assessment');
      }
      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['job', selectedJobId] });
      setPurchasedAssessments(prev => ({
        ...prev,
        [variables.assessment.id]: true
      }));
      toast({
        title: "Success",
        description: "Assessment purchased successfully.",
      });
    },
    onError: (error) => {
      console.error('Error purchasing pre-prepared assessments:', error);
      toast({
        title: "Purchase Error",
        description: `Failed to purchase assessment: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Handle pre-prepared assessments purchase and download
  const handlePrePreparedAssessments = async (assessment: PrePreparedAssessment) => {
    try {
      // Fetch job details
      const jobResponse = await fetch(`/api/jobs/${selectedJobId}`);
      if (!jobResponse.ok) {
        throw new Error('Failed to fetch job details');
      }
      const jobData = await jobResponse.json();

      // Check if assessment is already purchased
      const isPurchased = jobData.purchasedPrePreparedAssessments?.some(
        (purchased: { id: string }) => purchased.id === assessment.id
      );

      if (!isPurchased) {
        // Handle payment through Stripe
        const response = await fetch('/api/create-checkout-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            jobId: selectedJobId,
            assessmentId: assessment.id,
            type: 'pre-prepared-assessment',
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to create checkout session');
        }

        const { url } = await response.json();
        window.location.href = url;
      } else {
        // Download the assessment
        if (assessment.file) {
          window.open(`/api/documents/${assessment.file.id}/download`, '_blank');
        }
      }
    } catch (error) {
      console.error('Error handling pre-prepared assessments:', error);
      toast({
        title: "Error",
        description: "Failed to process assessment. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Update the renderPrePreparedAssessmentCard function
  const renderPrePreparedAssessmentCard = (assessment: PrePreparedAssessment) => {
    return (
      <Card key={assessment.id} className="shadow-md">
        <CardHeader className="bg-[#323A40] text-white">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-medium">{assessment.title}</h3>
              <p className="text-sm text-gray-300">{assessment.section}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-2">{assessment.content}</p>
            <p className="text-xs text-gray-500">
              Posted by {assessment.author} on {new Date(assessment.date).toLocaleDateString()}
            </p>
          </div>
          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => handleAssessmentDownload(assessment)}
            >
              <FileText className="h-4 w-4 mr-2" />
              Download Assessment
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  // --- Mutation for Uploading Document ---
  const uploadDocumentMutation = useMutation<any, Error, { documentId: string; file: File }>({
      mutationFn: async ({ documentId, file }) => {
          if (!selectedJobId) throw new Error("No job selected");
          const formData = new FormData();
          formData.append('file', file);
          formData.append('documentId', documentId);

          const response = await fetch(`/api/jobs/${selectedJobId}/documents/upload`, {
              method: 'POST',
              body: formData,
          });
          if (!response.ok) {
              const errorData = await response.json().catch(() => ({}));
              throw new Error(errorData.error || 'Failed to upload document');
          }
          return response.json();
      },
      onSuccess: (data, variables) => {
          queryClient.invalidateQueries({ queryKey: ['job', selectedJobId] });
          toast({
              title: "Success",
              description: "Document uploaded successfully",
          });
      },
      onError: (error) => {
          console.error('Error uploading document:', error);
          toast({
              title: "Upload Error",
              description: `Failed to upload document: ${error.message}`,
              variant: "destructive",
          });
      },
  });

  // Refactored handleFileUpload to use mutation
  const handleFileUpload = (documentId: string, file: File) => {
    if (!selectedJobId) {
      toast({ title: "Error", description: "Please select a job before uploading documents", variant: "destructive" });
      return;
    }
    uploadDocumentMutation.mutate({ documentId, file });
  }

  const handleDownload = async (documentId: string) => {
     if (!selectedJobId) return;
     window.location.href = `/api/jobs/${selectedJobId}/documents/${documentId}/download`;
  };

  const handleUpload = (docId: string) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.pdf,.doc,.docx'
    input.onchange = async (event: Event) => {
      const file = (event.target as HTMLInputElement).files?.[0]
      if (file) {
        await uploadDocument(params.id, docId, file)
      }
    }
    input.click()
  }

  const handleDelete = async (docId: string) => {
    if (confirm('Are you sure you want to delete this document?')) {
      await removeDocument(params.id, docId)
    }
  }

  // Add the renderDocumentCard function from document store
  const renderDocumentCard = (doc: DocumentWithStatus) => {
    const isUploaded = doc.status === 'uploaded'
    const isRequired = ['certificate-of-title', 'survey-plan'].includes(doc.id) ||
      (doc.id === '10-7-certificate' && currentJob?.customAssessment?.status === 'paid')

    return (
      <Card key={doc.id} className="relative">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">{doc.title}</h3>
              {isRequired && (
                <p className="text-sm text-red-500">Required</p>
              )}
            </div>
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
                {doc.uploadedFile.size && (
                  <span className="ml-2">
                    ({(doc.uploadedFile.size / (1024 * 1024)).toFixed(2)} MB)
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    try {
                      handleDownload(doc.id)
                    } catch (error) {
                      console.error('Error downloading document:', error)
                      toast({
                        title: "Download Failed",
                        description: error instanceof Error ? error.message : "Failed to download document",
                        variant: "destructive"
                      })
                    }
                  }}
                >
                  <FileText className="h-4 w-4 mr-2" />Download
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
                      try {
                        handleDelete(doc.id)
                      } catch (error) {
                        console.error('Error deleting document:', error)
                        toast({
                          title: "Delete Failed",
                          description: error instanceof Error ? error.message : "Failed to delete document",
                          variant: "destructive"
                        })
                      }
                    }
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  try {
                    handleUpload(doc.id)
                  } catch (error) {
                    console.error('Error initiating upload:', error)
                    toast({
                      title: "Upload Failed",
                      description: error instanceof Error ? error.message : "Failed to initiate upload",
                      variant: "destructive"
                    })
                  }
                }}
              >
                <Upload className="h-4 w-4 mr-2" />Upload Document
              </Button>
              {isRequired && (
                <p className="text-sm text-red-500">
                  This document is required to proceed
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  const renderRequiredDocuments = () => {
    // Debug logging
    console.log('[ReportWriter] Rendering required documents:', {
      documentCount: documents.length,
      documentTypes: documents.map(doc => doc.type)
    });

    // Show loading state if documents are being fetched
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <p className="mt-4 text-gray-600">Loading documents...</p>
        </div>
      );
    }

    // Show error state if there's an error
    if (error) {
      return (
        <div className="flex flex-col items-center justify-center p-8 bg-red-50 rounded-lg">
          <AlertCircle className="h-8 w-8 text-red-500" />
          <p className="mt-4 text-red-600">Error loading documents</p>
          <p className="text-sm text-gray-600 mt-2">{error}</p>
        </div>
      );
    }

    // Filter documents based on visibility rules
    const visibleDocuments = documents.filter(doc => {
      // Base documents are always visible
      if (['certificate-of-title', 'survey-plan', '10-7-certificate'].includes(doc.id)) {
        return true;
      }

      // Assessment documents visibility depends on job status
      if (doc.type === 'assessment') {
        // Check if the assessment is associated with a paid job
        const isPaid =
          (doc.id === 'custom-assessment' && currentJob?.customAssessment?.status === 'paid') ||
          (doc.id === 'statement-of-environmental-effects' && currentJob?.statementOfEnvironmentalEffects?.status === 'paid') ||
          (doc.id === 'complying-development-certificate' && currentJob?.complyingDevelopmentCertificate?.status === 'paid');
        return isPaid;
      }

      // All other documents are visible
      return true;
    });

    // Show empty state if no documents are visible
    if (!visibleDocuments || visibleDocuments.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg">
          <FileText className="h-8 w-8 text-gray-400" />
          <p className="mt-4 text-gray-600">No documents available</p>
          <p className="text-sm text-gray-500 mt-2">Upload your first document to get started</p>
        </div>
      );
    }

    // Show filtered documents
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibleDocuments.map(doc => {
          // Debug logging for each document
          console.log('[ReportWriter] Rendering document:', {
            id: doc.id,
            type: doc.type,
            status: doc.status,
            visibility: 'visible'
          });
          return renderDocumentCard(doc);
        })}
      </div>
    );
  }

  // Updated renderCustomAssessmentForm function
  const renderCustomAssessmentForm = (formType: keyof ReportWriterFormState) => {
    const specificFormState = formState[formType];
    const paymentComplete = formType === 'statement-of-environmental-effects'
      ? currentJob?.statementOfEnvironmentalEffects?.status === 'paid'
      : formType === 'complying-development-certificate'
      ? currentJob?.complyingDevelopmentCertificate?.status === 'paid'
      : currentJob?.customAssessment?.status === 'paid';
    const assessmentReturned = isAssessmentReturned(formType);
    const isStatementOfEnvironmentalEffects = formType === 'statement-of-environmental-effects';

    if (assessmentReturned) {
      // Completed Card JSX
      return (
        <div className="border rounded-lg p-4 bg-green-50">
          <div className="text-center py-4">
            <Check className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <h4 className="font-medium mb-2">Report Complete</h4>
            <p className="text-sm text-gray-600 mb-4">
              Your {formType === 'statement-of-environmental-effects'
                ? 'Statement of Environmental Effects'
                : formType === 'complying-development-certificate'
                ? 'Complying Development Certificate'
                : 'Custom Assessment Report'} is available for download in the Documents section above.
            </p>
          </div>
        </div>
      );
    }
    if (paymentComplete) {
      // In Progress Card JSX
      return (
        <div className="border rounded-lg p-4 bg-yellow-50">
          <div className="text-center py-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-500 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h4 className="font-medium mb-2">Report In Progress</h4>
            <p className="text-sm text-gray-600">
              We are processing your {formType === 'statement-of-environmental-effects'
                ? 'Statement of Environmental Effects'
                : formType === 'complying-development-certificate'
                ? 'Complying Development Certificate'
                : 'Custom Assessment Report'}. You will be notified when it's ready.
            </p>
          </div>
        </div>
      );
    }

    const currentFormData = specificFormState.formData;
    const showPaymentBtn = specificFormState.showPaymentButton;
    const certificate107Doc = documents.find(doc => doc.id === '10-7-certificate');
    const certificateOfTitle = documents.find(doc => doc.id === 'certificate-of-title');
    const surveyPlan = documents.find(doc => doc.id === 'survey-plan');

    // Only require 10.7 certificate for custom assessment and complying development certificate
    const requires107Certificate = formType === 'custom-assessment' || formType === 'complying-development-certificate';

    return (
      <div className="space-y-6">
        <div className="space-y-4">
          {/* Input Fields */}
          <div><label className="block text-sm font-medium mb-2">Development Type</label><Input placeholder="Enter the type of development" value={currentFormData.developmentType} onChange={handleFormChange(formType, 'developmentType')} /></div>
          <div><label className="block text-sm font-medium mb-2">Additional Information</label><Textarea placeholder="Enter any additional information about your development" value={currentFormData.additionalInfo} onChange={handleFormChange(formType, 'additionalInfo')} rows={4} /></div>
          {/* Document Requirements */}
          <div className="space-y-3 border-t pt-4 mt-4">
             <h4 className="font-medium text-gray-700">Document Requirements</h4>
             <p className="text-xs text-gray-500">Please ensure the following documents are uploaded in the 'Documents' section above before proceeding.</p>
             {requires107Certificate && (
               <DocumentStatus document={{
                 id: '10-7-certificate',
                 title: '10.7 Certificate',
                 path: '',
                 type: 'document',
                 category: '',
                 versions: [],
                 currentVersion: 1,
                 createdAt: '',
                 updatedAt: '',
                 isActive: true,
                 status: certificate107Doc?.status === 'uploaded' ? 'uploaded' : 'pending',
               }} />
             )}
             {certificateOfTitle && (
               <DocumentStatus document={{
                 id: 'certificate-of-title',
                 title: 'Certificate of Title',
                 path: '',
                 type: 'document',
                 category: '',
                 versions: [],
                 currentVersion: 1,
                 createdAt: '',
                 updatedAt: '',
                 isActive: true,
                 status: certificateOfTitle.status === 'uploaded' ? 'uploaded' : 'pending',
               }} />
             )}
             {surveyPlan && (
               <DocumentStatus document={{
                 id: 'survey-plan',
                 title: 'Survey Plan',
                 path: '',
                 type: 'document',
                 category: '',
                 versions: [],
                 currentVersion: 1,
                 createdAt: '',
                 updatedAt: '',
                 isActive: true,
                 status: surveyPlan.status === 'uploaded' ? 'uploaded' : 'pending',
               }} />
             )}
          </div>
          {/* 10.7 Cert Alert - only show for required report types */}
          {requires107Certificate && (!certificate107Doc || certificate107Doc.status !== 'uploaded') && (
            <Alert variant="destructive">
              <AlertDescription>Please upload the 10.7 Certificate before proceeding.</AlertDescription>
            </Alert>
          )}
          {/* Buttons */}
          <div className="pt-4">
            {!showPaymentBtn ? (
              <Button
                className="w-full"
                onClick={() => handleConfirmDetails(formType)}
                disabled={requires107Certificate && (!certificate107Doc || certificate107Doc.status !== 'uploaded')}
              >
                Confirm Details & Proceed
              </Button>
            ) : (
              <Button
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={() => handlePayment(formType)}
                disabled={createWorkTicketMutation.isPending || updateJobMutation.isPending}
              >
                {createWorkTicketMutation.isPending || updateJobMutation.isPending ? 'Processing...' : 'Confirm & Pay'}
              </Button>
            )}
            {(createWorkTicketMutation.isPending || updateJobMutation.isPending) && (
               <p className="text-sm text-gray-500 text-center mt-2">Processing payment...</p>
            )}
          </div>
        </div>
      </div>
    );
  };


  // Generalized save changes handler (Site details save is now separate)
  const handleSaveChanges = () => {
    if (!selectedJobId) return;
    let changesSaved = false;
    const updatedFormState = { ...formState };

    if (formState['custom-assessment'].hasUnsavedChanges) {
      localStorage.setItem(`custom-assessment-${selectedJobId}`, JSON.stringify(formState['custom-assessment'].formData));
      updatedFormState['custom-assessment'] = { ...updatedFormState['custom-assessment'], hasUnsavedChanges: false };
      changesSaved = true;
    }
    if (formState['statement-of-environmental-effects'].hasUnsavedChanges) {
      localStorage.setItem(`statement-of-environmental-effects-${selectedJobId}`, JSON.stringify(formState['statement-of-environmental-effects'].formData));
      updatedFormState['statement-of-environmental-effects'] = { ...updatedFormState['statement-of-environmental-effects'], hasUnsavedChanges: false };
      changesSaved = true;
    }
    if (formState['complying-development-certificate'].hasUnsavedChanges) {
      localStorage.setItem(`complying-development-certificate-${selectedJobId}`, JSON.stringify(formState['complying-development-certificate'].formData));
      updatedFormState['complying-development-certificate'] = { ...updatedFormState['complying-development-certificate'], hasUnsavedChanges: false };
      changesSaved = true;
    }
    if (hasUnsavedSiteDetails) {
      handleSaveSiteDetails(); // Triggers mutation
      changesSaved = true;
    }

    if (changesSaved) {
      setFormState(updatedFormState);
      if (updatedFormState['custom-assessment'].hasUnsavedChanges === false ||
          updatedFormState['statement-of-environmental-effects'].hasUnsavedChanges === false ||
          updatedFormState['complying-development-certificate'].hasUnsavedChanges === false) {
        toast({ title: "Form Data Saved", description: "Unsaved form changes saved locally." });
      }
    } else {
      toast({ title: "No Changes", description: "No unsaved changes to save." });
    }
  };

  const toggleDocuments = () => { setIsDocumentsOpen(prev => !prev); };
  const togglePropertyInfo = () => { setIsPropertyInfoOpen(prev => !prev); };
  const toggleSiteDetails = () => { setIsSiteDetailsOpen(prev => !prev); };

  const isReadOnly = false;

  const handleDocumentDownload = async (document: CustomDocument) => {
    try {
      const downloadResponse = await fetch(`/api/documents/${document.id}/download`);
      if (!downloadResponse.ok) throw new Error('Failed to download document');

      const blob = await downloadResponse.blob();
      const url = window.URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = document.title;
      window.document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      window.document.body.removeChild(a);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download document",
        variant: "destructive",
      });
    }
  };

  const handleAssessmentPurchase = async (assessmentId: string) => {
    try {
      if (!selectedJobId) {
        throw new Error('No job selected');
      }
      const response = await fetch(`/api/jobs/${selectedJobId}/pre-prepared-assessments/purchase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ assessmentId }),
      });

      if (!response.ok) {
        throw new Error('Failed to purchase assessment');
      }

      const data = await response.json();
      setPurchasedAssessments(prev => ({
        ...prev,
        [assessmentId]: true
      }));
      toast({
        title: "Success",
        description: "Assessment purchased successfully",
      });
    } catch (error) {
      console.error('Error purchasing assessment:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to purchase assessment",
        variant: "destructive"
      });
    }
  };

  const handleAssessmentDownload = async (assessment: PurchasedPrePreparedAssessments) => {
    try {
      if (!assessment.file) {
        throw new Error('No file available for download');
      }
      const response = await fetch(`/api/pre-prepared-assessments/${assessment.file.id}/download`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = assessment.file.originalName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading assessment:', error);
      toast({
        title: "Error",
        description: "Failed to download assessment",
        variant: "destructive"
      });
    }
  };

  // Update the document creation to use the correct properties
  const createDocumentFromAssessment = (assessment: PurchasedPrePreparedAssessments): DocumentWithStatus => ({
    id: assessment.id,
    title: assessment.title,
    category: 'Pre-prepared Assessments',
    description: assessment.content,
    path: '/document-store',
    type: 'document',
    versions: [],
    currentVersion: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true,
    status: 'uploaded',
    uploadedFile: assessment.file ? {
      filename: assessment.file.id,
      originalName: assessment.file.originalName,
      type: 'application/pdf',
      uploadedAt: new Date().toISOString(),
      size: 0
    } : undefined
  });

  return (
    <div className="space-y-6">
      {/* Job Selection */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Report Writer</h1>
        <Select value={selectedJobId} onValueChange={setSelectedJobId}>
          <SelectTrigger className="w-[280px]">
            <SelectValue placeholder="Select a job" />
          </SelectTrigger>
          <SelectContent>
            {jobs?.map((job) => (
              <SelectItem key={job.id} value={job.id}>
                {job.address}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Loading States */}
      {isJobLoading && <div>Loading job details...</div>}
      {isPrePreparedLoading && <div>Loading assessments...</div>}

      {/* Error States */}
      {isJobError && <Alert variant="destructive"><AlertDescription>{jobError?.message}</AlertDescription></Alert>}
      {isPrePreparedError && <Alert variant="destructive"><AlertDescription>{prePreparedError?.message}</AlertDescription></Alert>}

      {/* Main Content */}
      {selectedJobId && currentJob && (
        <div className="space-y-6">
          {/* Property Info Section */}
          <div className="border rounded-lg p-4">
            <button
              onClick={togglePropertyInfo}
              className="flex items-center justify-between w-full"
            >
              <h2 className="text-xl font-semibold">Property Information</h2>
              {isPropertyInfoOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </button>
            {isPropertyInfoOpen && (
              <div className="mt-4">
                <PropertyInfo
                  address={currentJob.address}
                  propertyData={currentJob.propertyData || null}
                />
              </div>
            )}
          </div>

          {/* Site Details Section */}
          <div className="border rounded-lg p-4">
            <button
              onClick={toggleSiteDetails}
              className="flex items-center justify-between w-full"
            >
              <h2 className="text-xl font-semibold">Site Details</h2>
              {isSiteDetailsOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </button>
            {isSiteDetailsOpen && (
              <div className="mt-4">
                <DetailedSiteDetails
                  siteDetails={siteDetails}
                  onSiteDetailsChange={updateSiteDetails}
                  readOnly={isReadOnly}
                />
              </div>
            )}
          </div>

          {/* Documents Section */}
          <div className="border rounded-lg p-4">
            <button
              onClick={toggleDocuments}
              className="flex items-center justify-between w-full"
            >
              <h2 className="text-xl font-semibold">Documents</h2>
              {isDocumentsOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </button>
            {isDocumentsOpen && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {renderRequiredDocuments()}
              </div>
            )}
          </div>

          {/* Pre-prepared Assessments Section */}
          <div className="border rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-4">Pre-prepared Assessments</h2>
            {isPrePreparedLoading ? (
              <div>Loading assessments...</div>
            ) : (
              prePreparedAssessmentsData.map((section) => (
                <div key={section.title} className="space-y-4 mb-6">
                  <h3 className="text-lg font-medium">{section.title}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {section.assessments.map((assessment) => renderPrePreparedAssessmentCard(assessment))}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Statement of Environmental Effects Section */}
          <div className="border rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-4">Statement of Environmental Effects</h2>
            {renderCustomAssessmentForm('statement-of-environmental-effects')}
          </div>

          {/* Complying Development Certificate Section */}
          <div className="border rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-4">Complying Development Certificate</h2>
            {renderCustomAssessmentForm('complying-development-certificate')}
          </div>

          {/* Custom Assessment Section */}
          <div className="border rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-4">Custom Assessment</h2>
            {renderCustomAssessmentForm('custom-assessment')}
          </div>

          {/* Save Changes Button */}
          {(formState['statement-of-environmental-effects'].hasUnsavedChanges ||
            formState['complying-development-certificate'].hasUnsavedChanges ||
            hasUnsavedSiteDetails) && (
            <Button onClick={handleSaveChanges} className="fixed bottom-4 right-4 z-50">
              Save Changes
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export default function ReportWriterPage({ params }: { params: { id: string } }) {
  return (
    <DocumentProvider jobId={params.id}>
      <SiteDetailsProvider jobId={params.id}>
        <ReportWriterContent params={params} />
      </SiteDetailsProvider>
    </DocumentProvider>
  )
}
