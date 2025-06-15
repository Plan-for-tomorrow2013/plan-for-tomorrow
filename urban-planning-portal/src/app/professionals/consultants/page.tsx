'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from "@shared/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@shared/components/ui/card"
import { Plus, Upload, FileText, X, Check, ArrowLeft, ChevronDown, ChevronUp, Download, AlertCircle, ChevronLeft, ChevronRight } from "@shared/components/ui/icons"
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
import { DocumentStatus } from '@shared/components/DocumentStatus'
import { Job } from '@shared/types/jobs'
import { getReportStatus, isReportType, getReportTitle, getReportData, ReportType } from '@shared/utils/report-utils'
import { getDocumentDisplayStatus } from '@shared/utils/report-utils'
import { Loader2 } from 'lucide-react'
import { DocumentUpload } from "@shared/components/DocumentUpload"
import { DocumentProvider, useDocuments } from '@shared/contexts/document-context'
import { SiteDetailsProvider, useSiteDetails } from '@shared/contexts/site-details-context'
import { AlertTitle } from "@shared/components/ui/alert"
import camelcaseKeys from 'camelcase-keys'
import { DocumentTile } from '@shared/components/DocumentTile'
import { createFileInput, handleDocumentUpload, handleDocumentDownload, handleDocumentDelete, downloadDocumentFromApi } from '@shared/utils/document-utils'
import { LEPFilter } from '@shared/components/LEPFilter'
import { DollarSign } from "lucide-react"
import { CategoryCard } from "@shared/components/CategoryCard"
import { SearchBar } from "@shared/components/SearchBar"

const categories = [
  {
    id: "nathers-basix",
    title: "NatHERS & BASIX",
    icon: "/placeholder.svg?height=100&width=100",
    href: "/professionals/consultants/nathers-basix",
    description: "Energy efficiency and sustainability consultants",
  },
  {
    id: "waste-management",
    title: "Waste Management",
    icon: "/placeholder.svg?height=100&width=100",
    href: "/professionals/consultants/waste-management",
    description: "Waste management consultants and services",
  },
  {
    id: "cost-estimate",
    title: "Cost Estimate",
    icon: "/placeholder.svg?height=100&width=100",
    href: "/professionals/consultants/cost-estimate",
    description: "Cost estimation and quantity surveying",
  },
  {
    id: "stormwater",
    title: "Stormwater",
    icon: "/placeholder.svg?height=100&width=100",
    href: "/professionals/consultants/stormwater",
    description: "Stormwater management consultants",
  },
  {
    id: "traffic",
    title: "Traffic",
    icon: "/placeholder.svg?height=100&width=100",
    href: "/professionals/consultants/traffic",
    description: "Traffic impact assessment consultants",
  },
  {
    id: "surveyor",
    title: "Surveyor",
    icon: "/placeholder.svg?height=100&width=100",
    href: "/professionals/consultants/surveyor",
    description: "Land and construction surveyors",
  },
  {
    id: "bushfire",
    title: "Bushfire",
    icon: "/placeholder.svg?height=100&width=100",
    href: "/professionals/consultants/bushfire",
    description: "Bushfire assessment consultants",
  },
  {
    id: "flooding",
    title: "Flooding",
    icon: "/placeholder.svg?height=100&width=100",
    href: "/professionals/consultants/flooding",
    description: "Flood assessment consultants",
  },
  {
    id: "acoustic",
    title: "Acoustic",
    icon: "/placeholder.svg?height=100&width=100",
    href: "/professionals/consultants/acoustic",
    description: "Acoustic assessment consultants",
  },
  {
    id: "landscaping",
    title: "Landscaping",
    icon: "/placeholder.svg?height=100&width=100",
    href: "/professionals/consultants/landscaping",
    description: "Landscape architects and consultants",
  },
  {
    id: "heritage",
    title: "Heritage",
    icon: "/placeholder.svg?height=100&width=100",
    href: "/professionals/consultants/heritage",
    description: "Heritage impact consultants",
  },
  {
    id: "biodiversity",
    title: "Biodiversity",
    icon: "/placeholder.svg?height=100&width=100",
    href: "/professionals/consultants/biodiversity",
    description: "Biodiversity assessment consultants",
  },
  {
    id: "lawyer",
    title: "Lawyer",
    icon: "/placeholder.svg?height=100&width=100",
    href: "/professionals/consultants/lawyer",
    description: "Planning and property lawyers",
  },
  {
    id: "certifiers",
    title: "Certifiers",
    icon: "/placeholder.svg?height=100&width=100",
    href: "/professionals/consultants/certifiers",
    description: "Building certifiers and inspectors",
  },
  {
    id: "arborist",
    title: "Arborist",
    icon: "/placeholder.svg?height=100&width=100",
    href: "/professionals/consultants/arborist",
    description: "Tree assessment and arborist services",
  }
]

export default function ConsultantsPage() {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(true)

  const { jobs, isLoading: isLoadingJobs, error: jobsError } = useJobs()
  const [selectedJobId, setSelectedJobId] = useState<string | undefined>(undefined)
  const router = useRouter()

  const visibleCategories = categories.slice(0, 6)
  const scrollableCategories = categories.slice(6)

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
      setShowLeftArrow(scrollLeft > 0)
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 600
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      })
    }
  }

  // Effect to set initial job ID from URL query param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const jobId = params.get('job')
    if (jobId && jobs?.find(j => j.id === jobId)) {
      setSelectedJobId(jobId)
    }
  }, [jobs])

  // Update URL when job selection changes
  useEffect(() => {
    if (selectedJobId) {
      router.push(`/professionals/consultants?job=${selectedJobId}`, { scroll: false })
    }
  }, [selectedJobId, router])

  return (
    <div className="space-y-6">
      {/* Job Selection */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Consultants</h1>
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

      {/* Job-specific content */}
      {selectedJobId ? (
        <DocumentProvider jobId={selectedJobId}>
          <SiteDetailsProvider jobId={selectedJobId}>
            <JobConsultants jobId={selectedJobId} />
          </SiteDetailsProvider>
        </DocumentProvider>
      ) : (
        <div className="text-center text-gray-500 mt-10 border rounded-lg p-8 bg-gray-50">
          <p>Please select a job from the dropdown above to access Consultants.</p>
        </div>
      )}
    </div>
  )
}

interface CustomAssessmentForm {
  developmentType: string;
  additionalInfo: string;
  uploadedDocuments: Record<string, boolean>;
  documents: {
    certificateOfTitle?: { originalName?: string; fileName?: string };
    surveyPlan?: { originalName?: string; fileName?: string };
    certificate107?: { originalName?: string; fileName?: string };
  };
  selectedTab: string;
}

interface ReportFormState {
  formData: CustomAssessmentForm
  paymentComplete: boolean
  showPaymentButton: boolean
  hasUnsavedChanges: boolean
  purchaseInitiated: boolean // Added flag for purchase initiation
}

interface ConsultantsFormState {
  'customAssessment': ReportFormState
  'statementOfEnvironmentalEffects': ReportFormState
  'complyingDevelopmentCertificate': ReportFormState
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

interface ReportSectionProps {
  doc: DocumentWithStatus
  job: Job
  onUpload: (file: File) => void
  onDownload: () => void
  onDelete: () => void
  isLoading: boolean
}

function reportTypeToId(formType: keyof ConsultantsFormState): string {
  switch (formType) {
    case 'customAssessment': return 'custom-assessment';
    case 'statementOfEnvironmentalEffects': return 'statement-of-environmental-effects';
    case 'complyingDevelopmentCertificate': return 'complying-development-certificate';
    default: return formType;
  }
}

const fetchJobDetails = async (jobId: string): Promise<Job> => {
  const response = await fetch(`/api/jobs/${jobId}`);
  if (!response.ok) {
    const errorBody = await response.text();
    console.error("Failed to fetch job details:", response.status, errorBody);
    throw new Error(`Failed to fetch job details for ID ${jobId}. Status: ${response.status}`);
  }
  const data = await response.json();
  return data;
};

const formatDate = (dateString: string) => {
  try {
    return new Date(dateString).toLocaleDateString();
  } catch (e) {
    return dateString;
  }
};

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

function JobConsultants({ jobId }: { jobId: string }): JSX.Element {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { documents, isLoading: isDocsLoading, error: docsError, uploadDocument, removeDocument, downloadDocument } = useDocuments()
  const { siteDetails, updateSiteDetails, saveSiteDetails, hasUnsavedChanges: hasUnsavedSiteDetails } = useSiteDetails()
  const [documentError, setDocumentError] = useState<string | null>(null)

  // Category Tiles logic (must be at the top, before any early returns)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(true)

  // Create job-specific categories
  const jobCategories = categories.map(category => ({
    ...category,
    href: `/professionals/consultants/${jobId}/${category.id}`
  }))

  const visibleCategories = jobCategories.slice(0, 6)
  const scrollableCategories = jobCategories.slice(6)

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
      setShowLeftArrow(scrollLeft > 0)
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 600
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      })
    }
  }

  const transformUploadedDocuments = (documents?: Record<string, any>): Record<string, boolean> => {
    if (!documents) return {};
    return Object.keys(documents).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {} as Record<string, boolean>);
  };

  const [formState, setFormState] = useState<ConsultantsFormState>({
    'customAssessment': {
      formData: {
        developmentType: '',
        additionalInfo: '',
        uploadedDocuments: {},
        documents: {
          certificateOfTitle: undefined,
          surveyPlan: undefined,
          certificate107: undefined
        },
        selectedTab: 'details'
      },
      paymentComplete: false,
      showPaymentButton: false,
      hasUnsavedChanges: false,
      purchaseInitiated: false,
    },
    'statementOfEnvironmentalEffects': {
      formData: {
        developmentType: '',
        additionalInfo: '',
        uploadedDocuments: {},
        documents: {
          certificateOfTitle: undefined,
          surveyPlan: undefined,
          certificate107: undefined
        },
        selectedTab: 'details'
      },
      paymentComplete: false,
      showPaymentButton: false,
      hasUnsavedChanges: false,
      purchaseInitiated: false,
    },
    'complyingDevelopmentCertificate': {
      formData: {
        developmentType: '',
        additionalInfo: '',
        uploadedDocuments: {},
        documents: {
          certificateOfTitle: undefined,
          surveyPlan: undefined,
          certificate107: undefined
        },
        selectedTab: 'details'
      },
      paymentComplete: false,
      showPaymentButton: false,
      hasUnsavedChanges: false,
      purchaseInitiated: false,
    },
  });

  // New state for collapsible section
  const [isDocumentsOpen, setIsDocumentsOpen] = useState(false)
  const [isPropertyInfoOpen, setIsPropertyInfoOpen] = useState(false)
  const [isSiteDetailsOpen, setIsSiteDetailsOpen] = useState(false)

  // Add this after other state declarations
  const [purchasedAssessments, setPurchasedAssessments] = useState<PurchasedAssessments>({})

  // Add loadFormData function inside component
  const loadFormData = (formType: keyof ConsultantsFormState): CustomAssessmentForm => {
    const storedData = localStorage.getItem(`formData_${jobId}_${formType}`);
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        return {
          developmentType: parsedData.developmentType || '',
          additionalInfo: parsedData.additionalInfo || '',
          uploadedDocuments: parsedData.uploadedDocuments || {},
          documents: {
            certificateOfTitle: parsedData.documents?.certificateOfTitle,
            surveyPlan: parsedData.documents?.surveyPlan,
            certificate107: parsedData.documents?.certificate107
          },
          selectedTab: parsedData.selectedTab || 'details'
        };
      } catch (error) {
        console.error('Error parsing stored form data:', error);
      }
    }
    return {
      developmentType: '',
      additionalInfo: '',
      uploadedDocuments: {},
      documents: {
        certificateOfTitle: undefined,
        surveyPlan: undefined,
        certificate107: undefined
      },
      selectedTab: 'details'
    };
  };

  // Effect to load form data from local storage
  useEffect(() => {
    if (!jobId) {
      // Reset state including purchaseInitiated
      setFormState({
        'customAssessment': { formData: { developmentType: '', additionalInfo: '', uploadedDocuments: {}, documents: { certificateOfTitle: undefined, surveyPlan: undefined, certificate107: undefined }, selectedTab: 'details' }, paymentComplete: false, showPaymentButton: false, hasUnsavedChanges: false, purchaseInitiated: false },
        'statementOfEnvironmentalEffects': { formData: { developmentType: '', additionalInfo: '', uploadedDocuments: {}, documents: { certificateOfTitle: undefined, surveyPlan: undefined, certificate107: undefined }, selectedTab: 'details' }, paymentComplete: false, showPaymentButton: false, hasUnsavedChanges: false, purchaseInitiated: false },
        'complyingDevelopmentCertificate': { formData: { developmentType: '', additionalInfo: '', uploadedDocuments: {}, documents: { certificateOfTitle: undefined, surveyPlan: undefined, certificate107: undefined }, selectedTab: 'details' }, paymentComplete: false, showPaymentButton: false, hasUnsavedChanges: false, purchaseInitiated: false },
      });
      return;
    }

    // Correctly update form state by spreading previous state
    setFormState(prev => ({
      ...prev, // Spread previous state
      'customAssessment': {
        ...prev['customAssessment'], // Spread specific form type state
        formData: loadFormData('customAssessment'),
        hasUnsavedChanges: false,
        purchaseInitiated: false, // Reset on load
      },
      'statementOfEnvironmentalEffects': {
        ...prev['statementOfEnvironmentalEffects'],
        formData: loadFormData('statementOfEnvironmentalEffects'),
        hasUnsavedChanges: false,
        purchaseInitiated: false,
      },
      'complyingDevelopmentCertificate': {
        ...prev['complyingDevelopmentCertificate'],
        formData: loadFormData('complyingDevelopmentCertificate'),
        hasUnsavedChanges: false,
        purchaseInitiated: false,
      },
    }));

  }, [jobId]);

  // --- React Query for fetching selected job details ---
  const {
    data: currentJob,
    isLoading: isJobLoading,
    error: jobError,
    isError: isJobError,
    refetch: refetchJob,
  } = useQuery<Job, Error>({
    queryKey: ['job', jobId],
    queryFn: () => fetchJobDetails(jobId),
    enabled: !!jobId,
    staleTime: 0,
  });

  // Effect to update local component state based on fetched job data
  useEffect(() => {
    if (currentJob) {
      // Update form state based on job data
      setFormState(prev => ({
        'customAssessment': {
          ...prev['customAssessment'],
          paymentComplete: currentJob.customAssessment?.status === 'paid',
          showPaymentButton: currentJob.customAssessment?.status === 'paid'
            ? false
            : prev['customAssessment'].purchaseInitiated && !prev['customAssessment'].paymentComplete,
          formData: prev['customAssessment'].hasUnsavedChanges
            ? prev['customAssessment'].formData
            : {
                developmentType: currentJob.customAssessment?.developmentType || '',
                additionalInfo: currentJob.customAssessment?.additionalInfo || '',
                uploadedDocuments: transformUploadedDocuments(currentJob.customAssessment?.uploadedDocuments),
                documents: {
                  certificateOfTitle: currentJob.customAssessment?.documents?.certificateOfTitle,
                  surveyPlan: currentJob.customAssessment?.documents?.surveyPlan,
                  certificate107: currentJob.customAssessment?.documents?.certificate107
                },
                selectedTab: 'details'
              },
        },
        'statementOfEnvironmentalEffects': {
          ...prev['statementOfEnvironmentalEffects'],
          paymentComplete: currentJob.statementOfEnvironmentalEffects?.status === 'paid',
          showPaymentButton: currentJob.statementOfEnvironmentalEffects?.status === 'paid'
            ? false
            : prev['statementOfEnvironmentalEffects'].purchaseInitiated && !prev['statementOfEnvironmentalEffects'].paymentComplete,
          formData: prev['statementOfEnvironmentalEffects'].hasUnsavedChanges
            ? prev['statementOfEnvironmentalEffects'].formData
            : {
                developmentType: currentJob.statementOfEnvironmentalEffects?.developmentType || '',
                additionalInfo: currentJob.statementOfEnvironmentalEffects?.additionalInfo || '',
                uploadedDocuments: transformUploadedDocuments(currentJob.statementOfEnvironmentalEffects?.uploadedDocuments),
                documents: {
                  certificateOfTitle: currentJob.statementOfEnvironmentalEffects?.documents?.certificateOfTitle,
                  surveyPlan: currentJob.statementOfEnvironmentalEffects?.documents?.surveyPlan,
                  certificate107: currentJob.statementOfEnvironmentalEffects?.documents?.certificate107
                },
                selectedTab: 'details'
              },
        },
        'complyingDevelopmentCertificate': {
          ...prev['complyingDevelopmentCertificate'],
          paymentComplete: currentJob.complyingDevelopmentCertificate?.status === 'paid',
          showPaymentButton: currentJob.complyingDevelopmentCertificate?.status === 'paid'
            ? false
            : prev['complyingDevelopmentCertificate'].purchaseInitiated && !prev['complyingDevelopmentCertificate'].paymentComplete,
          formData: prev['complyingDevelopmentCertificate'].hasUnsavedChanges
            ? prev['complyingDevelopmentCertificate'].formData
            : {
                developmentType: currentJob.complyingDevelopmentCertificate?.developmentType || '',
                additionalInfo: currentJob.complyingDevelopmentCertificate?.additionalInfo || '',
                uploadedDocuments: transformUploadedDocuments(currentJob.complyingDevelopmentCertificate?.uploadedDocuments),
                documents: {
                  certificateOfTitle: currentJob.complyingDevelopmentCertificate?.documents?.certificateOfTitle,
                  surveyPlan: currentJob.complyingDevelopmentCertificate?.documents?.surveyPlan,
                  certificate107: currentJob.complyingDevelopmentCertificate?.documents?.certificate107
                },
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
        'customAssessment': { formData: { developmentType: '', additionalInfo: '', uploadedDocuments: {}, documents: { certificateOfTitle: undefined, surveyPlan: undefined, certificate107: undefined }, selectedTab: 'details' }, paymentComplete: false, showPaymentButton: false, hasUnsavedChanges: false, purchaseInitiated: false },
        'statementOfEnvironmentalEffects': { formData: { developmentType: '', additionalInfo: '', uploadedDocuments: {}, documents: { certificateOfTitle: undefined, surveyPlan: undefined, certificate107: undefined }, selectedTab: 'details' }, paymentComplete: false, showPaymentButton: false, hasUnsavedChanges: false, purchaseInitiated: false },
        'complyingDevelopmentCertificate': { formData: { developmentType: '', additionalInfo: '', uploadedDocuments: {}, documents: { certificateOfTitle: undefined, surveyPlan: undefined, certificate107: undefined }, selectedTab: 'details' }, paymentComplete: false, showPaymentButton: false, hasUnsavedChanges: false, purchaseInitiated: false },
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

  const isAssessmentReturned = (type: 'customAssessment' | 'statementOfEnvironmentalEffects' | 'complyingDevelopmentCertificate') => {
    if (!currentJob) return false;
    const doc: DocumentWithStatus = {
      id: reportTypeToId(type),
      title: getReportTitle(reportTypeToId(type)),
      category: 'Report',
      description: '',
      path: '/document-store',
      type: 'document',
      versions: [],
      currentVersion: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true,
      displayStatus: 'pending_user_upload'
    };
    const { isCompleted } = getReportStatus(doc, currentJob || {} as Job)
    return isCompleted
  }

  // Generalized form change handler
  const handleFormChange = (formType: keyof ConsultantsFormState, field: keyof CustomAssessmentForm) => (
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
  const handleInitiatePurchase = (formType: keyof ConsultantsFormState) => {
    setFormState(prev => ({
      ...prev,
      [formType]: {
        ...prev[formType],
        purchaseInitiated: true,
      },
    }));
  };

  // Generalized confirm details handler - Restructured for sequential validation
  const handleConfirmDetails = (formType: keyof ConsultantsFormState) => {
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
     const requires107Certificate = formType === 'customAssessment' || formType === 'complyingDevelopmentCertificate';
     console.log(`[handleConfirmDetails] Requires 10.7 Cert: ${requires107Certificate}`);
     const certificate107Doc = documents.find(doc => doc.id === 'tenSevenCertificate');
     const isCertMissing = !certificate107Doc || certificate107Doc.displayStatus !== 'uploaded';
     console.log(`[handleConfirmDetails] Checking 10.7 Cert status: ${certificate107Doc?.displayStatus}`);
     if (requires107Certificate && isCertMissing) {
       console.log('[handleConfirmDetails] 10.7 Cert missing/not uploaded. Showing toast and returning.');
       toast({
         title: "Missing Document",
         description: "Please upload the 10.7 Certificate before proceeding.",
         variant: "destructive",
       });
       return; // Exit if validation fails
     }
     console.log('[handleConfirmDetails] 10.7 Cert check passed.');

     // 3. Check Architectural Plan (if required)
     const requiresArchitecturalPlan = formType === 'statementOfEnvironmentalEffects' || formType === 'complyingDevelopmentCertificate';
     console.log(`[handleConfirmDetails] Requires Architectural Plan: ${requiresArchitecturalPlan}`);
     const architecturalPlanDoc = documents.find(doc => doc.id === 'architecturalPlan');
     const isArchitecturalPlanMissing = !architecturalPlanDoc || architecturalPlanDoc.displayStatus !== 'uploaded';
     console.log(`[handleConfirmDetails] Checking Architectural Plan status: ${architecturalPlanDoc?.displayStatus}`);
     if (requiresArchitecturalPlan && isArchitecturalPlanMissing) {
       console.log('[handleConfirmDetails] Architectural Plan missing/not uploaded. Showing toast and returning.');
       toast({
         title: "Missing Document",
         description: "Please upload the Architectural Plan before proceeding.",
         variant: "destructive",
       });
       return; // Exit if validation fails
     }
     console.log('[handleConfirmDetails] Architectural Plan check passed.');

     // 4. All checks passed - Proceed to update state
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
  const handlePayment = async (formType: keyof ConsultantsFormState) => {
    if (!jobId || !currentJob) { // Use jobId prop
      toast({ title: "Error", description: "Job data not loaded.", variant: "destructive" });
      return;
    }

    const currentFormData = formState[formType].formData;

    // Type guard to ensure formType is a valid report type
    if (!['customAssessment', 'statementOfEnvironmentalEffects', 'complyingDevelopmentCertificate'].includes(formType)) {
      toast({ title: "Error", description: "Invalid report type.", variant: "destructive" });
      return;
    }

    const certificateOfTitle = documents.find(doc => doc.id === 'certificateOfTitle');
    const surveyPlan = documents.find(doc => doc.id === 'surveyPlan');
    const certificate107 = documents.find(doc => doc.id === 'tenSevenCertificate');
    const architecturalPlan = documents.find(doc => doc.id === 'architecturalPlan');

    const workTicketPayload = {
      jobId: jobId,
      jobAddress: currentJob.address,
      ticketType: formType,
      [formType]: {
        developmentType: currentFormData.developmentType,
        additionalInfo: currentFormData.additionalInfo,
        documents: {
          certificateOfTitle: {
            originalName: certificateOfTitle?.uploadedFile?.originalName,
            fileName: certificateOfTitle?.uploadedFile?.fileName
          },
          surveyPlan: {
            originalName: surveyPlan?.uploadedFile?.originalName,
            fileName: surveyPlan?.uploadedFile?.fileName
          },
          certificate107: {
            originalName: certificate107?.uploadedFile?.originalName,
            fileName: certificate107?.uploadedFile?.fileName
          },
          architecturalPlan: {
            originalName: architecturalPlan?.uploadedFile?.originalName,
            fileName: architecturalPlan?.uploadedFile?.fileName
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
      await queryClient.invalidateQueries({ queryKey: ['jobDocuments', jobId] });

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
        description: `Your ${formType === 'customAssessment' ? 'Custom Assessment Report' : formType === 'statementOfEnvironmentalEffects' ? 'Statement of Environmental Effects' : 'Complying Development Certificate'} has been purchased successfully.`,
      });

    } catch (error) {
      console.error(`Error processing ${formType} payment sequence:`, error);
      if (!createWorkTicketMutation.isError && !updateJobMutation.isError) {
         toast({
           title: "Payment Processing Error",
           description: `An unexpected error occurred during payment for ${formType === 'customAssessment' ? 'Custom Assessment Report' : formType === 'statementOfEnvironmentalEffects' ? 'Statement of Environmental Effects' : 'Complying Development Certificate'}. Please try again.`,
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

  const handleSaveSiteDetails = () => {
    if (!jobId) {
      toast({ title: "Error", description: "No job selected.", variant: "destructive" })
      return
    }
    console.log('Saving Site Details via mutation:', siteDetails)
    saveSiteDetailsMutation.mutate({ jobId: jobId, details: siteDetails }) // Use jobId prop
  }

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
  const handleUpload = (docId: string) => {
    if (!jobId) {
      toast({ title: "Error", description: "Please select a job before uploading documents", variant: "destructive" });
      return;
    }
    createFileInput(async (file) => {
      await handleDocumentUpload(
        () => uploadDocument(jobId, docId, file)
      )
    })
  }

  const handleDownload = (docId: string) => { // This is the existing handleDownload
    if (!jobId) {
      toast({ title: "Error", description: "Please select a job before downloading documents", variant: "destructive" });
      return;
    }
    handleDocumentDownload( // This is from document-utils
      () => {
        return downloadDocument(jobId, docId); // downloadDocument is from useDocuments context
      }
    )
  }

  const handleDelete = (docId: string) => {
    if (!jobId) {
      toast({ title: "Error", description: "Please select a job before deleting documents", variant: "destructive" });
      return;
    }
    handleDocumentDelete(
      () => removeDocument(jobId, docId)
    )
  }

  const handleCustomDocumentDownload = async (document: CustomDocument) => {
    await downloadDocumentFromApi({
      id: document.id,
      title: document.title
    })
  }

  const renderRequiredDocuments = () => {
    console.log('[Consultants] Rendering required documents:', {
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
    const mappedDocuments = documents.map(doc => ({
      ...doc,
      displayStatus: getDocumentDisplayStatus(doc, currentJob || {} as Job)
    }));

    const renderDocumentCard = (doc: DocumentWithStatus) => {
      const isReport = isReportType(doc.id)
      const reportStatus = isReport ? getReportStatus(doc, currentJob || {} as Job) : undefined

      // reportStatus.isCompleted && reportStatus.hasFile
      const shouldBeDownloadableReport = isReport && reportStatus?.isCompleted && reportStatus?.hasFile;

      // Show completed report if available
      if (shouldBeDownloadableReport) {
        return (
          <Card key={doc.id} className="shadow-md">
            <CardHeader className="bg-[#323A40] text-white">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">{getReportTitle(doc.id)}</h3>
                  <p className="text-sm text-gray-300">{doc.category}</p>
                </div>
                <Check className="h-5 w-5 text-green-400" />
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-[#323A40]">
                  <FileText className="h-4 w-4" />
                  <span>{getReportTitle(doc.id)}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Uploaded: {reportStatus?.reportData?.completedDocument?.uploadedAt ? new Date(reportStatus.reportData.completedDocument.uploadedAt).toLocaleDateString() : (doc.uploadedFile?.uploadedAt ? new Date(doc.uploadedFile.uploadedAt).toLocaleDateString() : 'N/A')}
                </p>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
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

      return (
        <DocumentTile
          key={doc.id}
          document={doc}
          isReport={isReport}
          reportStatus={reportStatus}
          onUpload={() => handleUpload(doc.id)}
          onDownload={() => handleDownload(doc.id)}
          onDelete={() => handleDelete(doc.id)}
        />
      )
    }

    // Corrected: Wrap multiple elements in a React Fragment
    return (
      <>
        {/* Removed wrapping div <div className="space-y-6"> */}
        {/* Removed empty div </div> */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mappedDocuments.map(doc => renderDocumentCard(doc))}
        </div>
      </>
    )
  }

  // Updated renderCustomAssessmentForm function
  const renderCustomAssessmentForm = (formType: keyof ConsultantsFormState) => {
    // At the start of renderCustomAssessmentForm, add a guard for currentJob
    if (!currentJob) return null;
    // Remove any previous or duplicate declarations of isPaid and isCompleted in this function
    // Only use:
    const jobSection = currentJob[formType];
    const isPaid = jobSection?.status === 'paid';
    const isCompleted = jobSection?.status === 'completed'; // Adjust if you have a different completion status
    const purchaseInitiated = formState[formType].purchaseInitiated; // Get the flag
    const isStatementOfEnvironmentalEffects = formType === 'statementOfEnvironmentalEffects';

    // 1. Check if assessment is returned (completed)
    if (isCompleted) {
      // Show Report Complete
      return (
        <div className="border rounded-lg p-4 bg-green-50">
          <div className="text-center py-4">
            <Check className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <h4 className="font-medium mb-2">Report Complete</h4>
            <p className="text-sm text-gray-600 mb-4">
              Your {formType === 'statementOfEnvironmentalEffects'
                ? 'Statement of Environmental Effects'
                : formType === 'complyingDevelopmentCertificate'
                ? 'Complying Development Certificate'
                : 'Custom Assessment Report'} is available for download in the Documents section above.
            </p>
          </div>
        </div>
      );
    } else if (isPaid) {
      // Show Report In Progress
      return (
        <div className="border rounded-lg p-4 bg-yellow-50">
          <div className="text-center py-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-500 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h4 className="font-medium mb-2">Report In Progress</h4>
            <p className="text-sm text-gray-600">
              We are processing your {formType === 'statementOfEnvironmentalEffects'
                ? 'Statement of Environmental Effects'
                : formType === 'complyingDevelopmentCertificate'
                ? 'Complying Development Certificate'
                : 'Custom Assessment Report'}. You will be notified when it's ready.
            </p>
          </div>
        </div>
      );
    } else if (purchaseInitiated) {
      // Show the form
      const currentFormData = formState[formType].formData;
      const showPaymentBtn = formState[formType].showPaymentButton;
      const certificate107Doc = documents.find(doc => doc.id === 'tenSevenCertificate');
      const certificateOfTitle = documents.find(doc => doc.id === 'certificateOfTitle');
      const surveyPlan = documents.find(doc => doc.id === 'surveyPlan');
      const architecturalPlanDoc = documents.find(doc => doc.id === 'architecturalPlan');

      // Only require 10.7 certificate for custom assessment and complying development certificate
      const requires107Certificate = formType === 'customAssessment' || formType === 'complyingDevelopmentCertificate';

      // Only require architectural plan for statement of environmental effects and complying development certificate
      const requiresArchitecturalPlan = formType === 'statementOfEnvironmentalEffects' || formType === 'complyingDevelopmentCertificate';

      // Explicitly calculate disable conditions here for clarity
      const isDevTypeEmpty = currentFormData.developmentType.trim().length === 0;
      const isCertPresent = !!certificate107Doc;
      const isCertMissing = !certificate107Doc || certificate107Doc.displayStatus !== 'uploaded';
      const isArchitecturalPlanMissing = !architecturalPlanDoc || architecturalPlanDoc.displayStatus !== 'uploaded';
      const isConfirmButtonDisabled = isDevTypeEmpty || (requires107Certificate && isCertMissing) || (requiresArchitecturalPlan && isArchitecturalPlanMissing);

      // In renderCustomAssessmentForm, fix uploadedDocs type:
      const attachedDocs = [
        certificate107Doc,
        certificateOfTitle,
        surveyPlan,
        architecturalPlanDoc,
      ].filter((doc): doc is DocumentWithStatus => !!doc);

      // Add debug logging
      console.log('[AttachedDocs] 10.7 Cert:', certificate107Doc, 'Architectural Plan:', architecturalPlanDoc, 'All docs:', documents);

      console.log('DEBUG:', { formType, certificate107Doc, isCertMissing, architecturalPlanDoc, isArchitecturalPlanMissing, documents });

      return (
        <div className="space-y-6">
          <div className="space-y-4">
            {/* Input Fields */}
            <div><label className="block text-sm font-medium mb-2">Development Type</label><Input placeholder="Enter the type of development" value={currentFormData.developmentType} onChange={handleFormChange(formType, 'developmentType')} /></div>
            <div><label className="block text-sm font-medium mb-2">Additional Information</label><Textarea placeholder="Enter any additional information about your development" value={currentFormData.additionalInfo} onChange={handleFormChange(formType, 'additionalInfo')} rows={4} /></div>

            {/* Attached Documents Section */}
            {attachedDocs.length > 0 && (
              <div className="space-y-2 border-t pt-4 mt-4">
                <h4 className="font-medium text-gray-700">Documents to be Attached</h4>
                <p className="text-xs text-gray-500">The following documents will be included with your submission:</p>
                <ul className="list-disc list-inside text-sm space-y-1">
                  {attachedDocs.map(doc => (
                    <li key={doc.id}>
                      {doc.title}
                      {doc.uploadedFile?.originalName && ` (${doc.uploadedFile.originalName})`}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Document Requirements Section */}
            <div className="space-y-3 border-t pt-4 mt-4">
              <h4 className="font-medium text-gray-700">Document Requirements</h4>
              <p className="text-xs text-gray-500">Please ensure the following documents are available in the document store before proceeding:</p>

              {/* 10.7 Certificate Requirements */}
              {requires107Certificate && !isCertPresent && (
                <div className="mt-2">
                  {certificate107Doc ? (
                    <DocumentStatus document={certificate107Doc} />
                  ) : (
                    <Alert variant="destructive">
                      <AlertDescription>Please ensure the 10.7 Certificate is available in the document store before proceeding.</AlertDescription>
                    </Alert>
                  )}
                </div>
              )}

              {/* Architectural Plan Requirements */}
              {requiresArchitecturalPlan && !architecturalPlanDoc && (
                <div className="mt-2">
                  {architecturalPlanDoc ? (
                    <DocumentStatus document={architecturalPlanDoc} />
                  ) : (
                    <Alert variant="destructive">
                      <AlertDescription>Please ensure the Architectural Plan is available in the document store before proceeding.</AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="pt-4">
              {!showPaymentBtn ? (
                <Button
                  className="w-full"
                  onClick={() => handleConfirmDetails(formType)}
                  disabled={isConfirmButtonDisabled}
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
    } else {
      // Show the purchase button
      return (
        <div className="flex justify-center items-center p-6">
          <Button
            className="w-full max-w-xs" // Added max-width for better appearance
            onClick={() => handleInitiatePurchase(formType)}
          >
            <ShoppingCart className="h-4 w-4 mr-2" /> Purchase {getReportTitle(reportTypeToId(formType))}
          </Button>
        </div>
      );
    }
  };

  // Generalized save changes handler (Site details save is now separate)
  const handleSaveChanges = () => {
    if (!jobId) return; // Use jobId prop
    let changesSaved = false;
    const updatedFormState = { ...formState };

    if (formState['customAssessment'].hasUnsavedChanges) {
      localStorage.setItem(`customAssessment-${jobId}`, JSON.stringify(formState['customAssessment'].formData)); // *** Use jobId prop ***
      updatedFormState['customAssessment'] = { ...updatedFormState['customAssessment'], hasUnsavedChanges: false };
      changesSaved = true;
    }
    if (formState['statementOfEnvironmentalEffects'].hasUnsavedChanges) {
      localStorage.setItem(`statementOfEnvironmentalEffects-${jobId}`, JSON.stringify(formState['statementOfEnvironmentalEffects'].formData)); // *** Use jobId prop ***
      updatedFormState['statementOfEnvironmentalEffects'] = { ...updatedFormState['statementOfEnvironmentalEffects'], hasUnsavedChanges: false };
      changesSaved = true;
    }
    if (formState['complyingDevelopmentCertificate'].hasUnsavedChanges) {
      localStorage.setItem(`complyingDevelopmentCertificate-${jobId}`, JSON.stringify(formState['complyingDevelopmentCertificate'].formData)); // *** Use jobId prop ***
      updatedFormState['complyingDevelopmentCertificate'] = { ...updatedFormState['complyingDevelopmentCertificate'], hasUnsavedChanges: false };
      changesSaved = true;
    }
    if (hasUnsavedSiteDetails) {
      handleSaveSiteDetails(); // Triggers mutation (uses jobId prop internally)
      changesSaved = true;
    }

    if (changesSaved) {
      setFormState(updatedFormState);
      if (updatedFormState['customAssessment'].hasUnsavedChanges === false ||
          updatedFormState['statementOfEnvironmentalEffects'].hasUnsavedChanges === false ||
          updatedFormState['complyingDevelopmentCertificate'].hasUnsavedChanges === false) {
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

  // --- Main Render Logic for JobConsultants ---
  const isLoading = isDocsLoading || isJobLoading; // Combined loading state

  // Corrected: Refined loading/error handling
  if (isLoading) return <div>Loading job details and documents...</div>; // Handle combined loading

  // Handle specific errors in JSX below
  if (isJobError) return <Alert variant="destructive"><AlertTitle>Error Loading Job</AlertTitle><AlertDescription>{jobError?.message || 'Failed to load job data.'}</AlertDescription></Alert>;
  if (!currentJob && !isJobLoading) return <div>Job data not available. Select a job or check for errors.</div>; // Refined check
  // We need currentJob for the rest of the render, so ensure it exists if not loading/error
  if (!currentJob) return <div>Loading...</div>; // Fallback if somehow still null

  console.log('DEBUG propertyData:', currentJob.propertyData);

  return (
    <div className="space-y-6">
      {/* Loading States - Removed as handled above */}
      {/* {isJobLoading && <div>Loading job details...</div>} */}

      {/* Error States - Removed Job Error as handled above */}
      {/* {isJobError && <Alert variant="destructive"><AlertDescription>{jobError?.message}</AlertDescription></Alert>} */}
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
              <div className="mt-4">
                {renderRequiredDocuments()}
              </div>
            )}
          </div>

          {/* Category Tiles Section */}
          <div className="max-w-6xl mx-auto my-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {jobCategories.map((category) => (
                <Link key={category.id} href={category.href} passHref legacyBehavior>
                  <a style={{ textDecoration: 'none' }}>
                    <CategoryCard
                      title={category.title}
                      icon={category.icon}
                      href={category.href}
                      description={category.description}
                    />
                  </a>
                </Link>
              ))}
            </div>
          </div>

          {/* Statement of Environmental Effects Section */}
          <div className="border rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-4">Statement of Environmental Effects</h2>
            {renderCustomAssessmentForm('statementOfEnvironmentalEffects')}
          </div>

          {/* Complying Development Certificate Section */}
          <div className="border rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-4">Complying Development Certificate</h2>
            {renderCustomAssessmentForm('complyingDevelopmentCertificate')}
          </div>

          {/* Save Changes Button */}
          {(Object.values(formState).some(s => s.hasUnsavedChanges) ||
            hasUnsavedSiteDetails) && (
            <Button onClick={handleSaveChanges} className="fixed bottom-4 right-4 z-50">
              Save Changes
            </Button>
          )}
        </div> {/* Closing inner div */}
    </div>
  )
}
