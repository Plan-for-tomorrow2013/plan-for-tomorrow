'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@shared/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@shared/components/ui/card';
import {
  Plus,
  Upload,
  FileText,
  X,
  Check,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Download,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from '@shared/components/ui/icons';
import { ShoppingCart } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@shared/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@shared/components/ui/select';
import { useJobs } from '@shared/hooks/useJobs';
import Link from 'next/link';
import { Alert, AlertDescription } from '@shared/components/ui/alert';
import { Document, DOCUMENT_TYPES } from '@shared/types/consultants';
import { DocumentWithStatus } from '@shared/types/consultants';
import { Input } from '@shared/components/ui/input';
import { Textarea } from '@shared/components/ui/textarea';
import { toast } from '@shared/components/ui/use-toast';
import { PropertyInfo, PropertyDataShape } from '@shared/components/PropertyInfo';
import { DetailedSiteDetails, SiteDetails } from '@shared/components/DetailedSiteDetails';
import { ConsultantStatus } from '@shared/components/ConsultantStatus';
import { Job } from '@shared/types/jobs';
import {
  getReportStatus,
  isReportType,
  getReportTitle,
  getReportData,
  ReportType,
} from '@shared/utils/consultant-report-utils';
import { getDocumentDisplayStatus } from '@shared/utils/consultant-report-utils';
import { Loader2 } from 'lucide-react';
import { ConsultantProvider, useConsultants } from '@shared/contexts/consultant-context';
import { SiteDetailsProvider, useSiteDetails } from '@shared/contexts/site-details-context';
import { AlertTitle } from '@shared/components/ui/alert';
import camelcaseKeys from 'camelcase-keys';
import { ConsultantTile } from '@shared/components/ConsultantTile';
import {
  createFileInput,
  handleDocumentUpload,
  handleDocumentDownload,
  handleDocumentDelete,
  downloadDocumentFromApi,
} from '@shared/utils/document-utils';
import { LEPFilter } from '@shared/components/LEPFilter';
import { DollarSign } from 'lucide-react';
import { CategoryCard } from '@shared/components/CategoryCard';
import { SearchBar } from '@shared/components/SearchBar';

const categories = [
  {
    id: 'nathers-basix',
    title: 'NatHERS & BASIX',
    icon: '/placeholder.svg?height=100&width=100',
    href: '/professionals/consultants/nathers-basix',
    description: 'Energy efficiency and sustainability consultants',
  },
  {
    id: 'waste-management',
    title: 'Waste Management',
    icon: '/placeholder.svg?height=100&width=100',
    href: '/professionals/consultants/waste-management',
    description: 'Waste management consultants and services',
  },
  {
    id: 'cost-estimate',
    title: 'Cost Estimate',
    icon: '/placeholder.svg?height=100&width=100',
    href: '/professionals/consultants/cost-estimate',
    description: 'Cost estimation and quantity surveying',
  },
  {
    id: 'stormwater',
    title: 'Stormwater',
    icon: '/placeholder.svg?height=100&width=100',
    href: '/professionals/consultants/stormwater',
    description: 'Stormwater management consultants',
  },
  {
    id: 'traffic',
    title: 'Traffic',
    icon: '/placeholder.svg?height=100&width=100',
    href: '/professionals/consultants/traffic',
    description: 'Traffic impact assessment consultants',
  },
  {
    id: 'surveyor',
    title: 'Surveyor',
    icon: '/placeholder.svg?height=100&width=100',
    href: '/professionals/consultants/surveyor',
    description: 'Land and construction surveyors',
  },
  {
    id: 'bushfire',
    title: 'Bushfire',
    icon: '/placeholder.svg?height=100&width=100',
    href: '/professionals/consultants/bushfire',
    description: 'Bushfire assessment consultants',
  },
  {
    id: 'flooding',
    title: 'Flooding',
    icon: '/placeholder.svg?height=100&width=100',
    href: '/professionals/consultants/flooding',
    description: 'Flood assessment consultants',
  },
  {
    id: 'acoustic',
    title: 'Acoustic',
    icon: '/placeholder.svg?height=100&width=100',
    href: '/professionals/consultants/acoustic',
    description: 'Acoustic assessment consultants',
  },
  {
    id: 'landscaping',
    title: 'Landscaping',
    icon: '/placeholder.svg?height=100&width=100',
    href: '/professionals/consultants/landscaping',
    description: 'Landscape architects and consultants',
  },
  {
    id: 'heritage',
    title: 'Heritage',
    icon: '/placeholder.svg?height=100&width=100',
    href: '/professionals/consultants/heritage',
    description: 'Heritage impact consultants',
  },
  {
    id: 'biodiversity',
    title: 'Biodiversity',
    icon: '/placeholder.svg?height=100&width=100',
    href: '/professionals/consultants/biodiversity',
    description: 'Biodiversity assessment consultants',
  },
  {
    id: 'lawyer',
    title: 'Lawyer',
    icon: '/placeholder.svg?height=100&width=100',
    href: '/professionals/consultants/lawyer',
    description: 'Planning and property lawyers',
  },
  {
    id: 'certifiers',
    title: 'Certifiers',
    icon: '/placeholder.svg?height=100&width=100',
    href: '/professionals/consultants/certifiers',
    description: 'Building certifiers and inspectors',
  },
  {
    id: 'arborist',
    title: 'Arborist',
    icon: '/placeholder.svg?height=100&width=100',
    href: '/professionals/consultants/arborist',
    description: 'Tree assessment and arborist services',
  },
  {
    id: 'geotechnical',
    title: 'Geotechnical',
    icon: '/placeholder.svg?height=100&width=100',
    href: '/professionals/consultants/geotechnical',
    description: 'Geotechnical assessment consultants',
  },
];

export default function ConsultantsPage() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const { jobs, isLoading: isLoadingJobs, error: jobsError } = useJobs();
  const [selectedJobId, setSelectedJobId] = useState<string | undefined>(undefined);
  const router = useRouter();

  const visibleCategories = categories.slice(0, 6);
  const scrollableCategories = categories.slice(6);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 600;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  // Effect to set initial job ID from URL query param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const jobId = params.get('job');
    if (jobId && jobs?.find(j => j.id === jobId)) {
      setSelectedJobId(jobId);
    }
  }, [jobs]);

  // Update URL when job selection changes
  useEffect(() => {
    if (selectedJobId) {
      router.push(`/professionals/consultants?job=${selectedJobId}`, { scroll: false });
    }
  }, [selectedJobId, router]);

  return (
    <ConsultantProvider jobId={selectedJobId || ''}>
      <div className="space-y-6">
        {/* Job Selection */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Consultants</h1>
          {isLoadingJobs ? (
            <div>Loading jobs...</div>
          ) : jobsError ? (
            <Alert variant="destructive">
              <AlertDescription>Failed to load jobs.</AlertDescription>
            </Alert>
          ) : (
            <Select value={selectedJobId} onValueChange={setSelectedJobId}>
              <SelectTrigger className="w-[280px]">
                <SelectValue placeholder="Select a job" />
              </SelectTrigger>
              <SelectContent>
                {jobs?.map(job => (
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
          <SiteDetailsProvider jobId={selectedJobId}>
            <JobConsultants jobId={selectedJobId} />
          </SiteDetailsProvider>
        ) : (
          <div className="text-center text-gray-500 mt-10 border rounded-lg p-8 bg-gray-50">
            <p>Please select a job from the dropdown above to access Consultants.</p>
          </div>
        )}
      </div>
    </ConsultantProvider>
  );
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
  formData: CustomAssessmentForm;
  paymentComplete: boolean;
  showPaymentButton: boolean;
  hasUnsavedChanges: boolean;
  purchaseInitiated: boolean; // Added flag for purchase initiation
}

interface ConsultantsFormState {
  customAssessment: ReportFormState;
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
  doc: DocumentWithStatus;
  job: Job;
  onUpload: (file: File) => void;
  onDownload: () => void;
  onDelete: () => void;
  isLoading: boolean;
}

function reportTypeToId(formType: 'customAssessment'): string {
  return 'custom-assessment';
}

const fetchJobDetails = async (jobId: string): Promise<Job> => {
  const response = await fetch(`/api/jobs/${jobId}`);
  if (!response.ok) {
    const errorBody = await response.text();
    console.error('Failed to fetch job details:', response.status, errorBody);
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
  const router = useRouter();
  const queryClient = useQueryClient();
  const {
    consultantDocuments: documents,
    isLoading: isDocsLoading,
    error: docsError,
    downloadDocument,
  } = useConsultants();
  const {
    siteDetails,
    updateSiteDetails,
    saveSiteDetails,
    hasUnsavedChanges: hasUnsavedSiteDetails,
  } = useSiteDetails();
  const [documentError, setDocumentError] = useState<string | null>(null);

  // Fetch consultant tickets for this job
  const { data: consultantTickets = [] } = useQuery({
    queryKey: ['consultant-tickets', jobId],
    queryFn: async () => {
      const response = await fetch('/api/consultant-tickets');
      if (!response.ok) {
        throw new Error('Failed to fetch consultant tickets');
      }
      const allTickets = await response.json();
      return allTickets.filter((ticket: any) => ticket.jobId === jobId);
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
  });

  // Function to check if any consultant in a category has a quote request
  const hasQuoteRequestForCategory = (categoryId: string): boolean => {
    // Map category IDs to category names used in tickets
    const categoryIdToName: { [key: string]: string } = {
      'nathers-basix': 'NatHERS & BASIX',
      'waste-management': 'Waste Management',
      'cost-estimate': 'Cost Estimate',
      'stormwater': 'Stormwater',
      'traffic': 'Traffic',
      'surveyor': 'Surveyor',
      'bushfire': 'Bushfire',
      'flooding': 'Flooding',
      'acoustic': 'Acoustic',
      'landscaping': 'Landscaping',
      'heritage': 'Heritage',
      'biodiversity': 'Biodiversity',
      'lawyer': 'Lawyer',
      'certifiers': 'Certifiers',
      'arborist': 'Arborist',
      'geotechnical': 'Geotechnical',
    };

    const categoryName = categoryIdToName[categoryId];
    if (!categoryName) return false;

    // Check if there are any tickets for this category with status 'pending', 'in-progress', 'paid', or 'completed'
    return consultantTickets.some((ticket: any) => 
      ticket.category === categoryName && 
      ['pending', 'in-progress', 'paid', 'completed'].includes(ticket.status)
    );
  };

  // Category Tiles logic (must be at the top, before any early returns)
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  // Create job-specific categories
  const jobCategories = categories.map(category => ({
    ...category,
    href: `/professionals/consultants/${jobId}/${category.id}`,
  }));

  const visibleCategories = jobCategories.slice(0, 6);
  const scrollableCategories = jobCategories.slice(6);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 600;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const transformUploadedDocuments = (documents?: Record<string, any>): Record<string, boolean> => {
    if (!documents) return {};
    return Object.keys(documents).reduce(
      (acc, key) => {
        acc[key] = true;
        return acc;
      },
      {} as Record<string, boolean>
    );
  };

  const [formState, setFormState] = useState<ConsultantsFormState>({
    customAssessment: {
      formData: {
        developmentType: '',
        additionalInfo: '',
        uploadedDocuments: {},
        documents: {
          certificateOfTitle: undefined,
          surveyPlan: undefined,
          certificate107: undefined,
        },
        selectedTab: 'details',
      },
      paymentComplete: false,
      showPaymentButton: false,
      hasUnsavedChanges: false,
      purchaseInitiated: false,
    },
  });

  // New state for collapsible section
  const [isDocumentsOpen, setIsDocumentsOpen] = useState(false);
  const [isPropertyInfoOpen, setIsPropertyInfoOpen] = useState(false);
  const [isSiteDetailsOpen, setIsSiteDetailsOpen] = useState(false);

  // Add this after other state declarations
  const [purchasedAssessments, setPurchasedAssessments] = useState<PurchasedAssessments>({});

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
            certificate107: parsedData.documents?.certificate107,
          },
          selectedTab: parsedData.selectedTab || 'details',
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
        certificate107: undefined,
      },
      selectedTab: 'details',
    };
  };

  // Effect to load form data from local storage
  useEffect(() => {
    if (!jobId) {
      // Reset state including purchaseInitiated
      setFormState({
        customAssessment: {
          formData: {
            developmentType: '',
            additionalInfo: '',
            uploadedDocuments: {},
            documents: {
              certificateOfTitle: undefined,
              surveyPlan: undefined,
              certificate107: undefined,
            },
            selectedTab: 'details',
          },
          paymentComplete: false,
          showPaymentButton: false,
          hasUnsavedChanges: false,
          purchaseInitiated: false,
        },
      });
      return;
    }

    // Correctly update form state by spreading previous state
    setFormState(prev => ({
      ...prev, // Spread previous state
      customAssessment: {
        ...prev['customAssessment'], // Spread specific form type state
        formData: loadFormData('customAssessment'),
        hasUnsavedChanges: false,
        purchaseInitiated: false, // Reset on load
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
        customAssessment: {
          ...prev['customAssessment'],
          paymentComplete: currentJob.customAssessment?.status === 'paid',
          showPaymentButton:
            currentJob.customAssessment?.status === 'paid'
              ? false
              : prev['customAssessment'].purchaseInitiated &&
                !prev['customAssessment'].paymentComplete,
          formData: prev['customAssessment'].hasUnsavedChanges
            ? prev['customAssessment'].formData
            : {
                developmentType: currentJob.customAssessment?.developmentType || '',
                additionalInfo: currentJob.customAssessment?.additionalInfo || '',
                uploadedDocuments: transformUploadedDocuments(
                  currentJob.customAssessment?.uploadedDocuments
                ),
                documents: {
                  certificateOfTitle: currentJob.customAssessment?.documents?.certificateOfTitle,
                  surveyPlan: currentJob.customAssessment?.documents?.surveyPlan,
                  certificate107: currentJob.customAssessment?.documents?.certificate107,
                },
                selectedTab: 'details',
              },
        },
      }));

      // Update purchased assessments state from fetched job data
      if (currentJob.purchasedPrePreparedAssessments) {
        setPurchasedAssessments(
          Object.keys(currentJob.purchasedPrePreparedAssessments).reduce(
            (acc, assessmentId) => ({ ...acc, [assessmentId]: true }),
            {}
          )
        );
      } else {
        setPurchasedAssessments({});
      }

      // Update site details state from fetched job if not already modified locally
      if (!hasUnsavedSiteDetails) {
        updateSiteDetails(normalizeSiteDetails(currentJob.siteDetails || {}));
      }

      setDocumentError(null);
    } else if (!jobId) {
      // Corrected: Use jobId prop here instead of selectedJobId
      // Reset states if no job is selected
      // Reset states including purchaseInitiated if no job is selected
      setFormState({
        customAssessment: {
          formData: {
            developmentType: '',
            additionalInfo: '',
            uploadedDocuments: {},
            documents: {
              certificateOfTitle: undefined,
              surveyPlan: undefined,
              certificate107: undefined,
            },
            selectedTab: 'details',
          },
          paymentComplete: false,
          showPaymentButton: false,
          hasUnsavedChanges: false,
          purchaseInitiated: false,
        },
      });
      setPurchasedAssessments({});
      updateSiteDetails({}); // Assuming updateSiteDetails({}) resets the site details state
      setDocumentError(null);
    }
    // Dependencies: currentJob, jobId, isJobError, jobError, hasUnsavedSiteDetails, updateSiteDetails
    else if (isJobError) {
      // Use else if to avoid setting error when resetting
      console.error('Error fetching job data:', jobError);
      setDocumentError(jobError?.message || 'Failed to load job data');
    }
    // *** Depend on jobId prop ***
  }, [currentJob, jobId, isJobError, jobError, hasUnsavedSiteDetails, updateSiteDetails]);

  const isAssessmentReturned = (type: 'customAssessment') => {
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
      displayStatus: 'pending_user_upload',
    };
    const { isCompleted } = getReportStatus(doc, currentJob);
    return isCompleted;
  };

  // Generalized form change handler
  const handleFormChange =
    (formType: keyof ConsultantsFormState, field: keyof CustomAssessmentForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

  // Update form type references
  type FormType = 'customAssessment';

  // Update handleInitiatePurchase
  const handleInitiatePurchase = (formType: FormType) => {
    setFormState(prev => ({
      ...prev,
      [formType]: {
        ...prev[formType],
        purchaseInitiated: true,
      },
    }));
  };

  // Update handleConfirmDetails
  const handleConfirmDetails = (formType: FormType) => {
    if (!currentJob) return;

    const currentFormData = formState[formType].formData;
    if (!currentFormData.developmentType) {
      toast({
        title: 'Missing Information',
        description: 'Please select a development type.',
        variant: 'destructive',
      });
      return;
    }

    const certificate107 = documents.find((doc: DocumentWithStatus) => doc.id === 'tenSevenCertificate');
    if (!certificate107?.uploadedFile) {
      toast({
        title: 'Missing Document',
        description: 'Please upload a 10.7 Certificate.',
        variant: 'destructive',
      });
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
        // Use jobId from arguments
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
      console.log(
        '[updateJobMutation onSuccess] Received data from PATCH. Setting queryClient cache:',
        data
      );
      // Directly update the React Query cache with the fresh data from the PATCH response.
      // The useEffect hook observing currentJob will then derive the formState from this.
      queryClient.setQueryData(['job', variables.jobId], data);
      // Intentionally not calling refetchJob() immediately to rely on setQueryData.
    },
    onError: error => {
      console.error('Error updating job status:', error);
      toast({
        title: 'Error Updating Job',
        description: `${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // --- Mutation for Creating Work Ticket ---
  const createWorkTicketMutation = useMutation<any, Error, any>({
    mutationFn: async payload => {
      // Revert to FormData as expected by the API
      const formData = new FormData();
      // Append metadata as a JSON string. The payload itself contains all necessary info.
      formData.append(
        'metadata',
        JSON.stringify({
          jobId: payload.jobId, // Ensure jobId is correctly passed in payload
          jobAddress: payload.jobAddress,
          ticketType: payload.ticketType,
          uploadedBy: 'professional', // Assuming this is constant
          // Include the report-specific data from the payload
          reportData: payload[payload.ticketType],
        })
      );
      // DO NOT append a 'file' field as it's not provided in the payload

      const response = await fetch('/api/work-tickets', {
        method: 'POST',
        body: formData, // Send the FormData object
        // Let the browser set the Content-Type header for FormData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to create work ticket');
      }
      return response.json();
    },
    onError: error => {
      console.error('Error creating work ticket:', error);
      toast({
        title: 'Error Creating Work Ticket',
        description: `${error.message}`,
        variant: 'destructive',
      });
    },
  });

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
        title: 'Success',
        description: 'Site details saved successfully.',
      });
    },
    onError: error => {
      console.error('Error saving site details:', error);
      toast({
        title: 'Error Saving Site Details',
        description: `${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const handleSaveSiteDetails = () => {
    if (!jobId) {
      toast({ title: 'Error', description: 'No job selected.', variant: 'destructive' });
      return;
    }
    console.log('Saving Site Details via mutation:', siteDetails);
    saveSiteDetailsMutation.mutate({ jobId: jobId, details: siteDetails });
  };

  // --- Mutation for Uploading Document ---
  // All uploadDocument and removeDocument logic removed for consultant documents.

  const handleCustomDocumentDownload = async (document: CustomDocument) => {
    await downloadDocumentFromApi({
      id: document.id,
      title: document.title,
    });
  };

  // Add handlePayment function
  const handlePayment = async (formType: 'customAssessment') => {
    if (!jobId || !currentJob) {
      toast({ title: 'Error', description: 'Job data not loaded.', variant: 'destructive' });
      return;
    }

    const currentFormData = formState[formType].formData;

    const certificateOfTitle = documents.find((doc: DocumentWithStatus) => doc.id === 'certificateOfTitle');
    const surveyPlan = documents.find((doc: DocumentWithStatus) => doc.id === 'surveyPlan');
    const certificate107 = documents.find((doc: DocumentWithStatus) => doc.id === 'tenSevenCertificate');
    const architecturalPlan = documents.find((doc: DocumentWithStatus) => doc.id === 'architecturalPlan');

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
            fileName: certificateOfTitle?.uploadedFile?.fileName,
          },
          surveyPlan: {
            originalName: surveyPlan?.uploadedFile?.originalName,
            fileName: surveyPlan?.uploadedFile?.fileName,
          },
          certificate107: {
            originalName: certificate107?.uploadedFile?.originalName,
            fileName: certificate107?.uploadedFile?.fileName,
          },
          architecturalPlan: {
            originalName: architecturalPlan?.uploadedFile?.originalName,
            fileName: architecturalPlan?.uploadedFile?.fileName,
          },
        },
      },
    };

    const jobUpdatePayload = {
      [formType]: {
        status: 'paid' as const,
        type: formType,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        developmentType: currentFormData.developmentType,
        additionalInfo: currentFormData.additionalInfo,
        documents: (workTicketPayload as any)[formType].documents,
      },
    };

    try {
      await createWorkTicketMutation.mutateAsync(workTicketPayload);
      await updateJobMutation.mutateAsync({ jobId: jobId, payload: jobUpdatePayload });

      await queryClient.invalidateQueries({ queryKey: ['job', jobId] });
      await queryClient.invalidateQueries({ queryKey: ['jobDocuments', jobId] });

      setFormState(prev => ({
        ...prev,
        [formType]: {
          ...prev[formType],
          paymentComplete: true,
          showPaymentButton: false,
          purchaseInitiated: false,
        },
      }));

      toast({
        title: 'Success',
        description: 'Your Custom Assessment Report has been purchased successfully.',
      });
    } catch (error) {
      console.error(`Error processing ${formType} payment sequence:`, error);
      if (!createWorkTicketMutation.isError && !updateJobMutation.isError) {
        toast({
          title: 'Payment Processing Error',
          description:
            'An unexpected error occurred during payment for Custom Assessment Report. Please try again.',
          variant: 'destructive',
        });
      }
    }
  };

  // Fix type issues in renderRequiredDocuments
  const renderRequiredDocuments = () => {
    if (!currentJob) return null;

    console.log('[Consultants] Rendering required documents:', {
      documentCount: documents.length,
      documentTypes: documents.map((doc: DocumentWithStatus) => doc.type),
    });

    if (isDocsLoading) {
      return (
        <div className="flex flex-col items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <p className="mt-4 text-gray-600">Loading documents...</p>
        </div>
      );
    }

    if (docsError) {
      return (
        <div className="flex flex-col items-center justify-center p-8 bg-red-50 rounded-lg">
          <AlertCircle className="h-8 w-8 text-red-500" />
          <p className="mt-4 text-red-600">Error loading documents: {docsError}</p>
          <p className="text-sm text-gray-600 mt-2">
            Please check the console for details or try again.
          </p>
        </div>
      );
    }

    if (!documents || documents.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg">
          <FileText className="h-8 w-8 text-gray-400" />
          <p className="mt-4 text-gray-600">No documents available</p>
          <p className="text-sm text-gray-500 mt-2">Upload your first document to get started</p>
        </div>
      );
    }

    const mappedDocuments = documents.map((doc: DocumentWithStatus) => ({
      ...doc,
      displayStatus: getDocumentDisplayStatus(doc, currentJob),
    }));

    const renderDocumentCard = (doc: DocumentWithStatus) => {
      const isReport = isReportType(doc.id);
      const reportStatus = isReport ? getReportStatus(doc, currentJob) : undefined;
      const shouldBeDownloadableReport =
        isReport && reportStatus?.isCompleted && reportStatus?.hasFile;

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
                  Uploaded:{' '}
                  {reportStatus?.reportData?.completedDocument?.uploadedAt
                    ? new Date(
                        reportStatus.reportData.completedDocument.uploadedAt
                      ).toLocaleDateString()
                    : doc.uploadedFile?.uploadedAt
                      ? new Date(doc.uploadedFile.uploadedAt).toLocaleDateString()
                      : 'N/A'}
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
        );
      }

      return (
        <ConsultantTile
          key={doc.id}
          document={doc}
          onDownload={() => handleDownload(doc.id)}
        />
      );
    };

    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mappedDocuments.map((doc: DocumentWithStatus) => renderDocumentCard(doc))}
        </div>
      </>
    );
  };

  // Generalized save changes handler (Site details save is now separate)
  const handleSaveChanges = () => {
    if (!jobId) return; // Use jobId prop
    let changesSaved = false;
    const updatedFormState = { ...formState };

    if (formState['customAssessment'].hasUnsavedChanges) {
      localStorage.setItem(
        `customAssessment-${jobId}`,
        JSON.stringify(formState['customAssessment'].formData)
      ); // *** Use jobId prop ***
      updatedFormState['customAssessment'] = {
        ...updatedFormState['customAssessment'],
        hasUnsavedChanges: false,
      };
      changesSaved = true;
    }
    if (hasUnsavedSiteDetails) {
      handleSaveSiteDetails(); // Triggers mutation (uses jobId prop internally)
      changesSaved = true;
    }

    if (changesSaved) {
      setFormState(updatedFormState);
      if (updatedFormState['customAssessment'].hasUnsavedChanges === false) {
        toast({ title: 'Form Data Saved', description: 'Unsaved form changes saved locally.' });
      }
    } else {
      toast({ title: 'No Changes', description: 'No unsaved changes to save.' });
    }
  };

  const toggleDocuments = () => {
    setIsDocumentsOpen(prev => !prev);
  };
  const togglePropertyInfo = () => {
    setIsPropertyInfoOpen(prev => !prev);
  };
  const toggleSiteDetails = () => {
    setIsSiteDetailsOpen(prev => !prev);
  };

  const isReadOnly = false;

  // --- Main Render Logic for JobConsultants ---
  const isLoading = isDocsLoading || isJobLoading; // Combined loading state

  // Corrected: Refined loading/error handling
  if (isLoading) return <div>Loading job details and documents...</div>; // Handle combined loading

  // Handle specific errors in JSX below
  if (isJobError)
    return (
      <Alert variant="destructive">
        <AlertTitle>Error Loading Job</AlertTitle>
        <AlertDescription>{jobError?.message || 'Failed to load job data.'}</AlertDescription>
      </Alert>
    );
  if (!currentJob && !isJobLoading)
    return <div>Job data not available. Select a job or check for errors.</div>; // Refined check
  // We need currentJob for the rest of the render, so ensure it exists if not loading/error
  if (!currentJob) return <div>Loading...</div>; // Fallback if somehow still null

  console.log('DEBUG propertyData:', currentJob.propertyData);

  // Add back handleDownload for document download
  const handleDownload = (docId: string) => {
    if (!jobId) {
      toast({
        title: 'Error',
        description: 'Please select a job before downloading documents',
        variant: 'destructive',
      });
      return;
    }
    downloadDocument(jobId, docId);
  };

  return (
    <div className="space-y-6">
      {/* Loading States - Removed as handled above */}
      {/* {isJobLoading && <div>Loading job details...</div>} */}
      {/* Error States - Removed Job Error as handled above */}
      {/* {isJobError && <Alert variant="destructive"><AlertDescription>{jobError?.message}</AlertDescription></Alert>} */}
      {/* Display document context error if it exists */}
      {docsError && (
        <Alert variant="destructive">
          <AlertTitle>Document Error</AlertTitle>
          <AlertDescription>{docsError}</AlertDescription>
        </Alert>
      )}
      {/* Display specific document error state if it exists */}
      {documentError && (
        <Alert variant="destructive">
          <AlertTitle>Operation Error</AlertTitle>
          <AlertDescription>{documentError}</AlertDescription>
        </Alert>
      )}
      {/* Main Content */}
      <div className="space-y-6">
        {/* Property Info Section */}
        <div className="border rounded-lg p-4">
          <button onClick={togglePropertyInfo} className="flex items-center justify-between w-full">
            <h2 className="text-xl font-semibold">Property Information</h2>
            {isPropertyInfoOpen ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
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
          <button onClick={toggleSiteDetails} className="flex items-center justify-between w-full">
            <h2 className="text-xl font-semibold">Site Details</h2>
            {isSiteDetailsOpen ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
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
          <button onClick={toggleDocuments} className="flex items-center justify-between w-full">
            <h2 className="text-xl font-semibold">Documents</h2>
            {isDocumentsOpen ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </button>
          {isDocumentsOpen && <div className="mt-4">{renderRequiredDocuments()}</div>}
        </div>

        {/* Category Tiles Section */}
        <div className="max-w-6xl mx-auto my-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {/*
              If you see a linter error on the Link component below, it is likely due to a mismatch between your Next.js, React, and @types/react versions. 
              Ensure you are using compatible versions. The code below is correct for Next.js 13+ app directory.
            */}
            {jobCategories.map(category => (
              <Link key={category.id} href={category.href}>
                <CategoryCard
                  title={category.title}
                  icon={category.icon}
                  href={category.href}
                  description={category.description}
                  quoteRequested={hasQuoteRequestForCategory(category.id)}
                />
              </Link>
            ))}
          </div>
        </div>

        {/* Save Changes Button */}
        {(Object.values(formState).some(s => s.hasUnsavedChanges) || hasUnsavedSiteDetails) && (
          <Button onClick={handleSaveChanges} className="fixed bottom-4 right-4 z-50">
            Save Changes
          </Button>
        )}
      </div>{' '}
      {/* Closing inner div */}
    </div>
  );
}
