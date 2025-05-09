'use client'

import React, { useState, useEffect } from 'react'
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
import { PropertyInfo, PropertyDataShape } from '@shared/components/PropertyInfo'
import { DetailedSiteDetails, SiteDetails } from '@shared/components/DetailedSiteDetails'
import { DocumentStatus } from '@shared/components/DocumentStatus' // Keep this one
import { Job, PurchasedPrePreparedAssessments } from '@shared/types/jobs'
import { getReportStatus, isReportType, getReportTitle, getReportData, ReportType } from '@/utils/report-utils'
// Removed duplicate PropertyDataShape import
import { Progress } from "@shared/components/ui/progress"
import { Loader2 } from 'lucide-react'
import { DocumentUpload } from "@shared/components/DocumentUpload"
import { DocumentProvider, useDocuments } from '@shared/contexts/document-context'
import { SiteDetailsProvider, useSiteDetails } from '@shared/contexts/site-details-context'; // Import SiteDetailsProvider and useSiteDetails
import { AlertTitle } from "@shared/components/ui/alert"
import camelcaseKeys from 'camelcase-keys'

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
  purchaseInitiated: boolean // Added flag for purchase initiation
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

// Define fetch function for individual job details
const fetchJobDetails = async (jobId: string): Promise<Job> => {
  const response = await fetch(`/api/jobs/${jobId}`);
  if (!response.ok) {
    const errorBody = await response.text();
    console.error("Failed to fetch job details:", response.status, errorBody);
    throw new Error(`Failed to fetch job details for ID ${jobId}. Status: ${response.status}`);
  }
  const data = await response.json();
  return camelcaseKeys(data, { deep: true });
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
    return camelcaseKeys(data, { deep: true });
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

// *** NEW COMPONENT for Job-Specific Content ***
function JobReportWriter({ jobId }: { jobId: string }) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { documents, isLoading: isDocsLoading, error: docsError, uploadDocument, removeDocument, downloadDocument } = useDocuments()
  console.log('[ReportWriter] documents from context:', documents);
  const { siteDetails, updateSiteDetails, saveSiteDetails, hasUnsavedChanges: hasUnsavedSiteDetails } = useSiteDetails()
  const [documentError, setDocumentError] = useState<string | null>(null)
  // Combined state for both report forms (Keep this)
  const [formState, setFormState] = useState<ReportWriterFormState>({
    'custom-assessment': {
      formData: { developmentType: '', additionalInfo: '', uploadedDocuments: {}, selectedTab: 'details' },
      paymentComplete: false,
      showPaymentButton: false,
      hasUnsavedChanges: false,
      purchaseInitiated: false, // Initialize flag
    },
    'statement-of-environmental-effects': {
      formData: { developmentType: '', additionalInfo: '', uploadedDocuments: {}, selectedTab: 'details' },
      paymentComplete: false,
      showPaymentButton: false,
      hasUnsavedChanges: false,
      purchaseInitiated: false, // Initialize flag
    },
    'complying-development-certificate': {
      formData: { developmentType: '', additionalInfo: '', uploadedDocuments: {}, selectedTab: 'details' },
      paymentComplete: false,
      showPaymentButton: false,
      hasUnsavedChanges: false,
      purchaseInitiated: false, // Initialize flag
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
    if (!jobId) { // Use jobId prop
      // Reset state including purchaseInitiated
      setFormState({
        'custom-assessment': { formData: { developmentType: '', additionalInfo: '', uploadedDocuments: {}, selectedTab: 'details' }, paymentComplete: false, showPaymentButton: false, hasUnsavedChanges: false, purchaseInitiated: false },
        'statement-of-environmental-effects': { formData: { developmentType: '', additionalInfo: '', uploadedDocuments: {}, selectedTab: 'details' }, paymentComplete: false, showPaymentButton: false, hasUnsavedChanges: false, purchaseInitiated: false },
        'complying-development-certificate': { formData: { developmentType: '', additionalInfo: '', uploadedDocuments: {}, selectedTab: 'details' }, paymentComplete: false, showPaymentButton: false, hasUnsavedChanges: false, purchaseInitiated: false },
      });
      return;
    }

    const loadFormData = (formType: keyof ReportWriterFormState): CustomAssessmentForm => { // Ensure return type matches
      const savedData = localStorage.getItem(`${formType}-${jobId}`); // Use jobId prop
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData);
          if (parsedData && typeof parsedData.developmentType === 'string' && typeof parsedData.additionalInfo === 'string') {
            return parsedData;
          } else {
            console.warn(`Invalid data found in local storage for ${formType}, resetting.`);
            localStorage.removeItem(`${formType}-${jobId}`); // Use jobId prop
          }
        } catch (error) {
          console.error(`Failed to parse ${formType} data from local storage:`, error);
          localStorage.removeItem(`${formType}-${jobId}`); // Use jobId prop
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
        purchaseInitiated: false, // Reset on load
      },
      'statement-of-environmental-effects': {
        ...prev['statement-of-environmental-effects'], // Spread specific form type state
        formData: loadFormData('statement-of-environmental-effects'),
        hasUnsavedChanges: false,
        purchaseInitiated: false, // Reset on load
      },
      'complying-development-certificate': {
        ...prev['complying-development-certificate'], // Spread specific form type state
        formData: loadFormData('complying-development-certificate'),
        hasUnsavedChanges: false,
        purchaseInitiated: false, // Reset on load
      },
    }));

  }, [jobId]); // Depend on jobId prop


  // --- React Query for fetching selected job details ---
  const {
    data: currentJob,
    isLoading: isJobLoading,
    error: jobError,
    isError: isJobError,
    refetch: refetchJob, // Add refetch if needed elsewhere
  } = useQuery<Job, Error>({ // *** Use jobId prop ***
    queryKey: ['job', jobId],
    queryFn: () => fetchJobDetails(jobId),
    enabled: !!jobId, // Enable only when jobId is present
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
          showPaymentButton: currentJob.customAssessment?.status === 'paid'
            ? false
            : prev['custom-assessment'].purchaseInitiated && !prev['custom-assessment'].paymentComplete,
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
          showPaymentButton: currentJob.statementOfEnvironmentalEffects?.status === 'paid'
            ? false
            : prev['statement-of-environmental-effects'].purchaseInitiated && !prev['statement-of-environmental-effects'].paymentComplete,
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
          showPaymentButton: currentJob.complyingDevelopmentCertificate?.status === 'paid'
            ? false
            : prev['complying-development-certificate'].purchaseInitiated && !prev['complying-development-certificate'].paymentComplete,
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

      // Update site details state from fetched job if not already modified locally
      if (!hasUnsavedSiteDetails) {
        updateSiteDetails(normalizeSiteDetails(currentJob.siteDetails || {}))
      }

      setDocumentError(null)
    } else if (!jobId) { // Corrected: Use jobId prop here instead of selectedJobId
      // Reset states if no job is selected
      // Reset states including purchaseInitiated if no job is selected
      setFormState({
        'custom-assessment': { formData: { developmentType: '', additionalInfo: '', uploadedDocuments: {}, selectedTab: 'details' }, paymentComplete: false, showPaymentButton: false, hasUnsavedChanges: false, purchaseInitiated: false },
        'statement-of-environmental-effects': { formData: { developmentType: '', additionalInfo: '', uploadedDocuments: {}, selectedTab: 'details' }, paymentComplete: false, showPaymentButton: false, hasUnsavedChanges: false, purchaseInitiated: false },
        'complying-development-certificate': { formData: { developmentType: '', additionalInfo: '', uploadedDocuments: {}, selectedTab: 'details' }, paymentComplete: false, showPaymentButton: false, hasUnsavedChanges: false, purchaseInitiated: false },
      })
      setPurchasedAssessments({})
      updateSiteDetails({}) // Assuming updateSiteDetails({}) resets the site details state
      setDocumentError(null)
    }
    // Dependencies: currentJob, jobId, isJobError, jobError, hasUnsavedSiteDetails, updateSiteDetails
    else if (isJobError) { // Use else if to avoid setting error when resetting
      console.error('Error fetching job data:', jobError)
      setDocumentError(jobError?.message || 'Failed to load job data')
    }
  // *** Depend on jobId prop ***
  }, [currentJob, jobId, isJobError, jobError, hasUnsavedSiteDetails, updateSiteDetails])

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
      // Corrected: Use displayStatus and a valid initial state
      displayStatus: 'pending_user_upload'
    };
    // Note: getReportStatus might need adjustment if it relies on the old status field internally
    const { isCompleted } = getReportStatus(doc, currentJob || {} as Job)
    return isCompleted
  }

  // Generalized form change handler
  const handleFormChange = (formType: keyof ReportWriterFormState, field: keyof CustomAssessmentForm) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
     if (!jobId) return; // Use jobId prop
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

  // Handler to initiate the purchase flow for a specific report type
  const handleInitiatePurchase = (formType: keyof ReportWriterFormState) => {
    setFormState(prev => ({
      ...prev,
      [formType]: {
        ...prev[formType],
        purchaseInitiated: true,
      },
    }));
  };


  // Generalized confirm details handler - Restructured for sequential validation
  const handleConfirmDetails = (formType: keyof ReportWriterFormState) => {
     console.log(`[handleConfirmDetails] Called for formType: ${formType}`);
     if (!jobId) {
        console.log('[handleConfirmDetails] No jobId, returning.');
        return;
     }
     const currentFormData = formState[formType].formData;
     console.log(`[handleConfirmDetails] Checking developmentType: "${currentFormData.developmentType}"`);

     // 1. Check Development Type
     if (currentFormData.developmentType.trim().length === 0) {
       console.log('[handleConfirmDetails] Development type is empty. Showing toast and returning.');
       toast({
         title: "Missing Information",
         description: "Please enter the development type.",
         variant: "destructive",
       });
       return; // Exit if validation fails
     }
     console.log('[handleConfirmDetails] Development type check passed.');

     // 2. Check 10.7 Certificate (if required)
     const requires107Certificate = formType === 'custom-assessment' || formType === 'complying-development-certificate';
     console.log(`[handleConfirmDetails] Requires 10.7 Cert: ${requires107Certificate}`);
     if (requires107Certificate) {
        const certificate107Doc = documents.find(doc => doc.id === '10-7-certificate');
        console.log(`[handleConfirmDetails] Checking 10.7 Cert status: ${certificate107Doc?.displayStatus}`);
        if (!certificate107Doc || certificate107Doc.displayStatus !== 'uploaded') {
          console.log('[handleConfirmDetails] 10.7 Cert missing/not uploaded. Showing toast and returning.');
          toast({
            title: "Missing Document",
            description: "Please upload the 10.7 Certificate before proceeding.",
            variant: "destructive",
          });
          return; // Exit if validation fails
        }
        console.log('[handleConfirmDetails] 10.7 Cert check passed.');
     }

     // 3. All checks passed - Proceed to update state
     console.log('[handleConfirmDetails] All checks passed. Setting showPaymentButton = true.');
     setFormState(prev => ({
       ...prev,
       [formType]: {
         ...prev[formType],
         showPaymentButton: true, // Only set if all checks pass
       },
     }));
  };

  // --- Mutation for Updating Job Status (Payment) ---
  const updateJobMutation = useMutation<Job, Error, { jobId: string; payload: Partial<Job> }>({
    mutationFn: async ({ jobId, payload }) => {
      const response = await fetch(`/api/jobs/${jobId}`, { // Use jobId from arguments
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
      console.log('[updateJobMutation onSuccess] Received data from PATCH. Setting queryClient cache:', data);
      // Directly update the React Query cache with the fresh data from the PATCH response.
      // The useEffect hook observing currentJob will then derive the formState from this.
      queryClient.setQueryData(['job', variables.jobId], data);
      // Intentionally not calling refetchJob() immediately to rely on setQueryData.
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
      // Revert to FormData as expected by the API
      const formData = new FormData();
      // Append metadata as a JSON string. The payload itself contains all necessary info.
      formData.append('metadata', JSON.stringify({
        jobId: payload.jobId, // Ensure jobId is correctly passed in payload
        jobAddress: payload.jobAddress,
        ticketType: payload.ticketType,
        uploadedBy: 'professional', // Assuming this is constant
        // Include the report-specific data from the payload
        reportData: payload[payload.ticketType]
      }));
      // DO NOT append a 'file' field as it's not provided in the payload

      const response = await fetch('/api/work-tickets', {
        method: 'POST',
        body: formData, // Send the FormData object
        // Let the browser set the Content-Type header for FormData
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
    if (!jobId || !currentJob) { // Use jobId prop
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
        jobId: jobId, // Use jobId prop
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
      await updateJobMutation.mutateAsync({ jobId: jobId, payload: jobUpdatePayload }); // Use jobId prop

      // Invalidate the job query so UI refetches latest data
      await queryClient.invalidateQueries({ queryKey: ['job', jobId] });

      // Update the form state immediately after successful payment
      setFormState(prev => ({
        ...prev,
        [formType]: {
          ...prev[formType],
          paymentComplete: true,
          showPaymentButton: false,
          purchaseInitiated: false
        }
      }));

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
          const response = await fetch(`/api/jobs/${jobId}`, { // Use jobId from arguments
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
          queryClient.invalidateQueries({ queryKey: ['job', variables.jobId] }); // Use jobId from variables
          updateSiteDetails({}); // Reset local unsaved changes state in useSiteDetails hook
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
    if (!jobId) { // Use jobId prop
      toast({ title: "Error", description: "No job selected.", variant: "destructive" })
      return
    }
    console.log('Saving Site Details via mutation:', siteDetails)
    saveSiteDetailsMutation.mutate({ jobId: jobId, details: siteDetails }) // Use jobId prop
  }


  // --- Mutation for Purchasing Pre-prepared Assessments ---
  const purchasePrePreparedMutation = useMutation<any, Error, { assessment: PrePreparedAssessment }>({
    mutationFn: async ({ assessment }) => { // Use jobId prop inside
      if (!jobId) throw new Error("No job selected"); // *** Use jobId prop ***
      const response = await fetch(`/api/jobs/${jobId}/pre-prepared-assessments/purchase`, { // *** Use jobId prop ***
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
      queryClient.invalidateQueries({ queryKey: ['job', jobId] }); // Use jobId prop
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
      // Fetch job details using jobId prop
      const jobResponse = await fetch(`/api/jobs/${jobId}`); // *** Use jobId prop ***
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
            jobId: jobId, // Use jobId prop
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
          if (!jobId) throw new Error("No job selected"); // Use jobId prop
          const formData = new FormData();
          formData.append('file', file);
          // Corrected key from 'documentId' to 'docId' to match backend API expectation
          formData.append('docId', documentId);

          const response = await fetch(`/api/jobs/${jobId}/documents/upload`, { // Use jobId prop
              method: 'POST', // Corrected method
              body: formData,
          });
          if (!response.ok) {
              const errorData = await response.json().catch(() => ({}));
              throw new Error(errorData.error || 'Failed to upload document');
          }
          return response.json();
      },
    onSuccess: (data, variables) => {
        // Corrected: Invalidate relevant queries using jobId from component scope
        queryClient.invalidateQueries({ queryKey: ['jobDocuments', jobId] }); // Document context uses this key
        queryClient.invalidateQueries({ queryKey: ['job', jobId] }); // Invalidate job data as well
        toast({
            title: "Success",
            description: "Document uploaded successfully",
        });
    },
  });

  // Refactored handleFileUpload to use mutation
  const handleFileUpload = (documentId: string, file: File) => {
    if (!jobId) { // Use jobId prop
      toast({ title: "Error", description: "Please select a job before uploading documents", variant: "destructive" });
      return;
    }
    uploadDocumentMutation.mutate({ documentId, file });
  }

  const handleDownload = async (documentId: string) => { // Use jobId prop
     if (!jobId) return;
     window.location.href = `/api/jobs/${jobId}/documents/${documentId}/download`; // *** Use jobId prop ***
  };

  const handleUpload = (docId: string) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.pdf,.doc,.docx'
    input.onchange = async (event: Event) => {
      const file = (event.target as HTMLInputElement).files?.[0]
      if (file) {
        // Use the mutation wrapper
        handleFileUpload(docId, file);
        // await uploadDocument(jobId, docId, file) // Avoid direct call if mutation handles it
      }
    }
    input.click()
  }

  // --- Mutation for Removing Document ---
  const removeDocumentMutation = useMutation<any, Error, { documentId: string }>({
      mutationFn: async ({ documentId }) => {
          if (!jobId) throw new Error("No job selected");
          const response = await fetch(`/api/jobs/${jobId}/documents/${documentId}`, { // Use jobId prop
              method: 'DELETE',
          });
          if (!response.ok) {
              const errorData = await response.json().catch(() => ({}));
              throw new Error(errorData.error || 'Failed to delete document');
          }
          return response.json(); // Or handle empty response if API returns 204
      },
      onSuccess: (data, variables) => {
          queryClient.invalidateQueries({ queryKey: ['documents', jobId] }); // Use jobId prop
          queryClient.invalidateQueries({ queryKey: ['job', jobId] }); // Also invalidate job data
          toast({
              title: "Success",
              description: "Document deleted successfully",
          });
      },
      onError: (error) => {
          console.error('Error deleting document:', error);
          toast({
              title: "Delete Error",
              description: `Failed to delete document: ${error.message}`,
              variant: "destructive",
          });
      },
  });

  const handleDelete = async (docId: string) => { // Use jobId prop
    if (confirm('Are you sure you want to delete this document?')) {
      removeDocumentMutation.mutate({ documentId: docId }); // *** Use mutation ***
    }
  }

const renderRequiredDocuments = () => {
  // Debug logging
  console.log('[ReportWriter] Rendering required documents:', {
      documentCount: documents.length,
      documentTypes: documents.map(doc => doc.type)
    });

    // Show loading state if documents are being fetched
    if (isDocsLoading) { // Use specific loading state
      return (
        <div className="flex flex-col items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <p className="mt-4 text-gray-600">Loading documents...</p>
        </div>
      );
    }

    // Show error state if there's an error
    if (docsError) { // Use specific error state
      return (
        <div className="flex flex-col items-center justify-center p-8 bg-red-50 rounded-lg">
          <AlertCircle className="h-8 w-8 text-red-500" />
          <p className="mt-4 text-red-600">Error loading documents: {docsError}</p>
          {/* Corrected: Removed out-of-scope {error} variable */}
          <p className="text-sm text-gray-600 mt-2">Please check the console for details or try again.</p>
        </div>
      );
    }

    // Show empty state if no documents are visible
    if (!documents || documents.length === 0) { // Check raw documents from hook
      return (
        <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg">
          <FileText className="h-8 w-8 text-gray-400" />
          <p className="mt-4 text-gray-600">No documents available</p>
          <p className="text-sm text-gray-500 mt-2">Upload your first document to get started</p>
        </div>
      );
    }

    // Show filtered documents
    const renderDocumentCard = (doc: DocumentWithStatus) => {
      // Uses handleDownload, handleDelete, handleUpload which now use jobId prop correctly
      // Corrected: Use displayStatus
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

    // Corrected: Wrap multiple elements in a React Fragment
    return (
      <>
        {/* Removed wrapping div <div className="space-y-6"> */}
        {/* Removed empty div </div> */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map(doc => renderDocumentCard(doc))}
        </div>
      </>
    )
  }

  // Updated renderCustomAssessmentForm function
  const renderCustomAssessmentForm = (formType: keyof ReportWriterFormState) => {
    // Uses formState, currentJob, documents, handlers from JobReportWriter scope
    const specificFormState = formState[formType];
    const reportTitle = getReportTitle(formType); // Get the display title

    // Use getReportStatus to determine paid/in-progress/completed
    const doc: DocumentWithStatus = {
      id: formType,
      title: reportTitle,
      category: 'Report',
      description: '',
      path: '/document-store',
      type: 'document',
      versions: [],
      currentVersion: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true,
      displayStatus: 'pending_user_upload',
    };
    const { isPaid, isCompleted } = getReportStatus(doc, currentJob || {} as Job);
    const purchaseInitiated = specificFormState.purchaseInitiated; // Get the flag
    const isStatementOfEnvironmentalEffects = formType === 'statement-of-environmental-effects';

    // 1. Check if assessment is returned (completed)
    if (isCompleted) {
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

    // 2. Check if payment is complete (in progress)
    if (isPaid) {
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

    // 3. Check if purchase has been initiated
    if (!purchaseInitiated) {
      // Initial State: Show only the "Purchase" button
      return (
        <div className="flex justify-center items-center p-6">
          <Button
            className="w-full max-w-xs" // Added max-width for better appearance
            onClick={() => handleInitiatePurchase(formType)}
          >
            <ShoppingCart className="h-4 w-4 mr-2" /> Purchase {reportTitle}
          </Button>
        </div>
      );
    }

    // 4. Purchase initiated, but not paid/completed: Show the form
    const currentFormData = specificFormState.formData;
    const showPaymentBtn = specificFormState.showPaymentButton;
    const certificate107Doc = documents.find(doc => doc.id === '10-7-certificate');
    const certificateOfTitle = documents.find(doc => doc.id === 'certificate-of-title');
    const surveyPlan = documents.find(doc => doc.id === 'survey-plan');

    // Only require 10.7 certificate for custom assessment and complying development certificate
    const requires107Certificate = formType === 'custom-assessment' || formType === 'complying-development-certificate';

    // Explicitly calculate disable conditions here for clarity
    const isDevTypeEmpty = currentFormData.developmentType.trim().length === 0;
    const isCertMissing = requires107Certificate && (!certificate107Doc || certificate107Doc.displayStatus !== 'uploaded');
    const isConfirmButtonDisabled = isDevTypeEmpty || isCertMissing;


    return (
      <div className="space-y-6">
        <div className="space-y-4">
          {/* Input Fields */}
          <div><label className="block text-sm font-medium mb-2">Development Type</label><Input placeholder="Enter the type of development" value={currentFormData.developmentType} onChange={handleFormChange(formType, 'developmentType')} /></div>
          <div><label className="block text-sm font-medium mb-2">Additional Information</label><Textarea placeholder="Enter any additional information about your development" value={currentFormData.additionalInfo} onChange={handleFormChange(formType, 'additionalInfo')} rows={4} /></div>

          {/* Attached Documents Section */}
          {(() => {
            const uploadedDocs = [
              certificate107Doc,
              certificateOfTitle,
              surveyPlan
            ].filter(doc => doc?.displayStatus === 'uploaded');

            if (uploadedDocs.length === 0) return null;

            return (
              <div className="space-y-2 border-t pt-4 mt-4">
                <h4 className="font-medium text-gray-700">Documents to be Attached</h4>
                <p className="text-xs text-gray-500">The following uploaded documents will be included with your submission:</p>
                <ul className="list-disc list-inside text-sm space-y-1">
                  {uploadedDocs.map(doc => (
                    // Use optional chaining for safety
                    <li key={doc?.id}>
                      {doc?.title}
                      {doc?.uploadedFile?.originalName && ` (${doc.uploadedFile.originalName})`}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })()}

          {/* Document Requirements - Only shown if 10.7 Cert is required */}
          {requires107Certificate && (
            <div className="space-y-3 border-t pt-4 mt-4">
               <h4 className="font-medium text-gray-700">Document Requirements</h4>
               <p className="text-xs text-gray-500">Please ensure the following document is uploaded in the 'Documents' section above before proceeding.</p>
               {/* Display 10.7 Certificate Status */}
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
                 // Corrected: Use displayStatus and map appropriately
                 displayStatus: certificate107Doc?.displayStatus === 'uploaded' ? 'uploaded' : 'pending_user_upload',
               }} />
             </div>
          )} {/* End of conditional rendering for Document Requirements */}

          {/* 10.7 Cert Alert - only show for required report types */}
          {/* Corrected: Check displayStatus */}
          {requires107Certificate && (!certificate107Doc || certificate107Doc.displayStatus !== 'uploaded') && (
            <Alert variant="destructive">
              <AlertDescription>Please upload the 10.7 Certificate before proceeding.</AlertDescription>
            </Alert>
          )}
          {/* Buttons */}
          <div className="pt-4">
            {!showPaymentBtn ? (
              <Button
                className="w-full"
                onClick={() => {
                    // Add log directly in onClick to see if it fires when disabled
                    console.log(`Confirm Details button clicked. Disabled state: ${isConfirmButtonDisabled}`);
                    handleConfirmDetails(formType);
                }}
                disabled={isConfirmButtonDisabled} // Use the calculated boolean
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
    if (!jobId) return; // Use jobId prop
    let changesSaved = false;
    const updatedFormState = { ...formState };

    if (formState['custom-assessment'].hasUnsavedChanges) {
      localStorage.setItem(`custom-assessment-${jobId}`, JSON.stringify(formState['custom-assessment'].formData)); // *** Use jobId prop ***
      updatedFormState['custom-assessment'] = { ...updatedFormState['custom-assessment'], hasUnsavedChanges: false };
      changesSaved = true;
    }
    if (formState['statement-of-environmental-effects'].hasUnsavedChanges) {
      localStorage.setItem(`statement-of-environmental-effects-${jobId}`, JSON.stringify(formState['statement-of-environmental-effects'].formData)); // *** Use jobId prop ***
      updatedFormState['statement-of-environmental-effects'] = { ...updatedFormState['statement-of-environmental-effects'], hasUnsavedChanges: false };
      changesSaved = true;
    }
    if (formState['complying-development-certificate'].hasUnsavedChanges) {
      localStorage.setItem(`complying-development-certificate-${jobId}`, JSON.stringify(formState['complying-development-certificate'].formData)); // *** Use jobId prop ***
      updatedFormState['complying-development-certificate'] = { ...updatedFormState['complying-development-certificate'], hasUnsavedChanges: false };
      changesSaved = true;
    }
    if (hasUnsavedSiteDetails) {
      handleSaveSiteDetails(); // Triggers mutation (uses jobId prop internally)
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
      if (!jobId) { // Use jobId prop
        throw new Error('No job selected');
      }
      const response = await fetch(`/api/jobs/${jobId}/pre-prepared-assessments/purchase`, { // *** Use jobId prop ***
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

  // Corrected: Change parameter type to PrePreparedAssessment
  const handleAssessmentDownload = async (assessment: PrePreparedAssessment) => {
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
    // Corrected: Use displayStatus
    displayStatus: 'uploaded',
    uploadedFile: assessment.file ? {
      filename: assessment.file.id,
      originalName: assessment.file.originalName,
      type: 'application/pdf',
      uploadedAt: new Date().toISOString(),
      size: 0
    } : undefined
  });

  // --- Main Render Logic for JobReportWriter ---
  const isLoading = isDocsLoading || isJobLoading; // Combined loading state

  // Corrected: Refined loading/error handling
  if (isLoading) return <div>Loading job details and documents...</div>; // Handle combined loading

  // Handle specific errors in JSX below
  if (isJobError) return <Alert variant="destructive"><AlertTitle>Error Loading Job</AlertTitle><AlertDescription>{jobError?.message || 'Failed to load job data.'}</AlertDescription></Alert>;
  if (!currentJob && !isJobLoading) return <div>Job data not available. Select a job or check for errors.</div>; // Refined check
  // We need currentJob for the rest of the render, so ensure it exists if not loading/error
  if (!currentJob) return <div>Loading...</div>; // Fallback if somehow still null

  return (
    <div className="space-y-6">
      {/* Loading States - Removed as handled above */}
      {/* {isJobLoading && <div>Loading job details...</div>} */}
      {isPrePreparedLoading && <div>Loading assessments...</div>}

      {/* Error States - Removed Job Error as handled above */}
      {/* {isJobError && <Alert variant="destructive"><AlertDescription>{jobError?.message}</AlertDescription></Alert>} */}
      {isPrePreparedError && <Alert variant="destructive"><AlertDescription>{prePreparedError?.message}</AlertDescription></Alert>}
      {/* Display document context error if it exists */}
      {docsError && <Alert variant="destructive"><AlertTitle>Document Error</AlertTitle><AlertDescription>{docsError}</AlertDescription></Alert>}
      {/* Display specific document error state if it exists */}
      {documentError && <Alert variant="destructive"><AlertTitle>Operation Error</AlertTitle><AlertDescription>{documentError}</AlertDescription></Alert>}


      {/* Main Content */}
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
                  address={currentJob?.address || 'N/A'}
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
                  siteDetails={siteDetails} // from useSiteDetails()
                  onSiteDetailsChange={updateSiteDetails} // from useSiteDetails()
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
              <div className="mt-4"> {/* Removed extra grid classes here */}
                {renderRequiredDocuments()} {/* Uses documents from useDocuments() */}
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
          {(Object.values(formState).some(s => s.hasUnsavedChanges) ||
            hasUnsavedSiteDetails) && (
            <Button onClick={handleSaveChanges} className="fixed bottom-4 right-4 z-50">
              Save Changes
            </Button>
          )}
        </div> {/* Closing inner div */}
      {/* Corrected: Added missing closing div tag */}
    </div>
  )
}

// *** MAIN PAGE COMPONENT (Handles Job Selection) ***
export default function ReportWriterPage() {
  const { jobs, isLoading: isLoadingJobs, error: jobsError } = useJobs();
  const [selectedJobId, setSelectedJobId] = useState<string | undefined>(undefined);
  const router = useRouter();

  // Effect to set initial job ID from URL query param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const jobId = params.get('job');
    if (jobId && jobs?.find(j => j.id === jobId)) { // Ensure the job exists in the list
      setSelectedJobId(jobId);
    } else if (jobs && jobs.length > 0 && !jobId) {
        // Optionally select the first job if none is in the URL
        // setSelectedJobId(jobs[0].id);
    }
  }, [jobs]); // Depend on jobs loading

  // Update URL when job selection changes
  useEffect(() => {
    if (selectedJobId) {
      router.push(`/professionals/report-writer?job=${selectedJobId}`, { scroll: false });
    }
    // Optional: handle case where selection is cleared
    // else { router.push('/professionals/report-writer', { scroll: false }); }
  }, [selectedJobId, router]);


  return (
    <div className="space-y-6">
      {/* Job Selection */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Report Writer</h1>
        {isLoadingJobs ? (
            <div>Loading jobs...</div>
        ) : jobsError ? (
            <Alert variant="destructive"><AlertDescription>Failed to load jobs.</AlertDescription></Alert>
        ) : (
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
        )}
      </div>

      {/* Conditional Rendering of Job-Specific Content with Providers */}
      {selectedJobId ? (
        // *** Wrap the JobReportWriter with Providers ***
        <DocumentProvider jobId={selectedJobId}>
          <SiteDetailsProvider jobId={selectedJobId}>
            <JobReportWriter jobId={selectedJobId} />
          </SiteDetailsProvider>
        </DocumentProvider>
      ) : (
        <div className="text-center text-gray-500 mt-10 border rounded-lg p-8 bg-gray-50">
          <p>Please select a job from the dropdown above to view the report writer details and manage documents.</p>
        </div>
      )}
    </div>
  );
}
