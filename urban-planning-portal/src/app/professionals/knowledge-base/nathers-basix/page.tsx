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
import { Input } from "@shared/components/ui/input"
import { Textarea } from "@shared/components/ui/textarea"
import { toast } from "@shared/components/ui/use-toast"
import { Job, Assessment, PurchasedPrePreparedAssessments } from '@shared/types/jobs'
import { getReportStatus, isReportType, getReportTitle, getReportData, ReportType } from '@shared/utils/report-utils'
import { Progress } from "@shared/components/ui/progress"
import { Loader2 } from 'lucide-react'
import { AlertTitle } from "@shared/components/ui/alert"
import camelcaseKeys from 'camelcase-keys'
import { DocumentWithStatus } from '@shared/types/documents'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@shared/components/ui/dialog"
import PdfViewer from "@/components/PdfViewer"

interface CustomAssessmentForm {
  developmentType: string;
  additionalInfo: string;
  selectedTab: string;
}

interface ReportFormState {
  formData: CustomAssessmentForm
  paymentComplete: boolean
  showPaymentButton: boolean
  hasUnsavedChanges: boolean
  purchaseInitiated: boolean
}

interface WasteManagementFormState {
  'wasteManagementAssessment': ReportFormState
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
  isPurchased?: boolean;
  lepName?: string;
}

interface ReportSectionProps {
  doc: DocumentWithStatus
  job: Job
  onUpload: (file: File) => void
  onDownload: () => void
  onDelete: () => void
  isLoading: boolean
}

interface PurchasedPrePreparedAssessment {
  id: string;
  purchaseDate: string;
}

// Place this at the top of your file, before any usage
function reportTypeToId(formType: keyof WasteManagementFormState): string {
  return 'waste-management-assessment';
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
  return data;
};

// Define fetch function for pre-prepared assessments
const fetchPrePreparedAssessments = async (): Promise<PrePreparedAssessmentSection[]> => {
    const response = await fetch('/api/kb-waste-management-assessments');
    if (!response.ok) {
        const errorBody = await response.text();
        console.error("Failed to fetch kb waste management assessments:", response.status, errorBody);
        throw new Error(`Failed to fetch kb waste management assessments. Status: ${response.status}`);
    }
    const data = await response.json();
    if (!Array.isArray(data)) {
        console.error("Invalid kb waste management assessments data received:", data);
        throw new Error('Invalid kb waste management assessments data received');
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

function JobInitialAssessment({
  jobId,
  jobs,
  isLoadingJobs,
  jobsError,
  selectedJobId,
  setSelectedJobId
}: {
  jobId: string;
  jobs?: Job[];
  isLoadingJobs: boolean;
  jobsError: string | null;
  selectedJobId: string | undefined;
  setSelectedJobId: (id: string) => void;
}): JSX.Element {
  const router = useRouter()
  const queryClient = useQueryClient()

  // Combined state for both report forms
  const [formState, setFormState] = useState<WasteManagementFormState>({
    'wasteManagementAssessment': {
      formData: {
        developmentType: '',
        additionalInfo: '',
        selectedTab: 'details'
      },
      paymentComplete: false,
      showPaymentButton: false,
      hasUnsavedChanges: false,
      purchaseInitiated: false,
    },
  });

  // Add this after other state declarations
  const [selectedAssessment, setSelectedAssessment] = useState<PrePreparedAssessment | null>(null);
  // pdfUrl state is no longer needed as PdfViewer will directly receive the path

  // First, add this state near your other state declarations
  const [isOverlayVisible, setIsOverlayVisible] = useState(true);
  const [isAssessmentOverlayVisible, setIsAssessmentOverlayVisible] = useState(true);

  // Helper to get/set overlay state per job in localStorage
  const getOverlayStateForJob = (jobId: string) => {
    if (!jobId) return true; // default to visible
    const stored = localStorage.getItem(`soeOverlayVisible_${jobId}`);
    return stored === null ? true : stored === "true";
  };

  const setOverlayStateForJob = (jobId: string, visible: boolean) => {
    if (!jobId) return;
    localStorage.setItem(`soeOverlayVisible_${jobId}`, visible ? "true" : "false");
  };

  // Helper to get/set assessment overlay state per job in localStorage
  const getAssessmentOverlayStateForJob = (jobId: string) => {
    if (!jobId) return true; // default to visible
    const stored = localStorage.getItem(`assessmentOverlayVisible_${jobId}`);
    return stored === null ? true : stored === "true";
  };

  const setAssessmentOverlayStateForJob = (jobId: string, visible: boolean) => {
    if (!jobId) return;
    localStorage.setItem(`assessmentOverlayVisible_${jobId}`, visible ? "true" : "false");
  };

  // Sync overlay state with jobId and localStorage
  useEffect(() => {
    setIsOverlayVisible(getOverlayStateForJob(jobId));
    setIsAssessmentOverlayVisible(getAssessmentOverlayStateForJob(jobId));
  }, [jobId]);

  // Add loadFormData function inside component
  const loadFormData = (formType: keyof WasteManagementFormState): CustomAssessmentForm => {
    const storedData = localStorage.getItem(`formData_${jobId}_${formType}`);
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        return {
          developmentType: parsedData.developmentType || '',
          additionalInfo: parsedData.additionalInfo || '',
          selectedTab: parsedData.selectedTab || 'details'
        };
      } catch (error) {
        console.error('Error parsing stored form data:', error);
      }
    }
    return {
      developmentType: '',
      additionalInfo: '',
      selectedTab: 'details'
    };
  };

  // Effect to load form data from local storage
  useEffect(() => {
    if (!jobId) {
      setFormState({
        'wasteManagementAssessment': {
          formData: {
            developmentType: '',
            additionalInfo: '',
            selectedTab: 'details'
          },
          paymentComplete: false,
          showPaymentButton: false,
          hasUnsavedChanges: false,
          purchaseInitiated: false
        },
      });
      return;
    }

    setFormState(prev => ({
      ...prev,
      'wasteManagementAssessment': {
        ...prev['wasteManagementAssessment'],
        formData: loadFormData('wasteManagementAssessment'),
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

  // --- React Query for fetching pre-prepared assessments ---
  const {
      data: prePreparedAssessmentsData = [],
      isLoading: isPrePreparedLoading,
      error: prePreparedError,
      isError: isPrePreparedError,
  } = useQuery<PrePreparedAssessmentSection[], Error>({
      queryKey: ['prePreparedAssessments', 'waste-management'],
      queryFn: fetchPrePreparedAssessments,
      staleTime: 1000 * 60 * 10,
  });

  const filteredAssessments = prePreparedAssessmentsData || [];

  // Effect to update local component state based on fetched job data
  useEffect(() => {
    if (currentJob) {
      setFormState(prev => ({
        'wasteManagementAssessment': {
          ...prev['wasteManagementAssessment'],
          paymentComplete: currentJob.wasteManagementAssessment?.status === 'paid',
          showPaymentButton: currentJob.wasteManagementAssessment?.status === 'paid'
            ? false
            : prev['wasteManagementAssessment'].purchaseInitiated && !prev['wasteManagementAssessment'].paymentComplete,
          formData: prev['wasteManagementAssessment'].hasUnsavedChanges
            ? prev['wasteManagementAssessment'].formData
            : {
                developmentType: currentJob.wasteManagementAssessment?.developmentType || '',
                additionalInfo: currentJob.wasteManagementAssessment?.additionalInfo || '',
                selectedTab: 'details'
              },
        },
      }))
    } else if (!jobId) {
      setFormState({
        'wasteManagementAssessment': {
          formData: {
            developmentType: '',
            additionalInfo: '',
            selectedTab: 'details'
          },
          paymentComplete: false,
          showPaymentButton: false,
          hasUnsavedChanges: false,
          purchaseInitiated: false
        },
      })
    }
  }, [currentJob, jobId, isJobError, jobError])

  // Generalized form change handler
  const handleFormChange = (formType: keyof WasteManagementFormState, field: keyof CustomAssessmentForm) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
     if (!jobId) return;
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
  const handleInitiatePurchase = (formType: keyof WasteManagementFormState) => {
    setFormState(prev => ({
      ...prev,
      [formType]: {
        ...prev[formType],
        purchaseInitiated: true,
      },
    }));
  };

  // Generalized confirm details handler
  const handleConfirmDetails = (formType: keyof WasteManagementFormState) => {
     console.log(`[handleConfirmDetails] Called for formType: ${formType}`);
     if (!jobId) {
        console.log('[handleConfirmDetails] No jobId, returning.');
        return;
     }
     const currentFormData = formState[formType].formData;
     console.log(`[handleConfirmDetails] Checking developmentType: "${currentFormData.developmentType}"`);

     if (currentFormData.developmentType.trim().length === 0) {
       console.log('[handleConfirmDetails] Development type is empty. Showing toast and returning.');
       toast({
         title: "Missing Information",
         description: "Please enter the development type.",
         variant: "destructive",
       });
       return;
     }
     console.log('[handleConfirmDetails] Development type check passed.');

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
      console.log('[updateJobMutation onSuccess] Received data from PATCH. Setting queryClient cache:', data);
      queryClient.setQueryData(['job', variables.jobId], data);
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
      const formData = new FormData();
      formData.append('metadata', JSON.stringify({
        jobId: payload.jobId,
        jobAddress: payload.jobAddress,
        ticketType: payload.ticketType,
        uploadedBy: 'professional',
        reportData: payload[payload.ticketType]
      }));

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

  // Generalized payment handler
  const handlePayment = async (formType: keyof WasteManagementFormState) => {
    if (!jobId || !currentJob) {
      toast({ title: "Error", description: "Job data not loaded.", variant: "destructive" });
      return;
    }

    const currentFormData = formState[formType].formData;

    if (!['wasteManagementAssessment'].includes(formType)) {
      toast({ title: "Error", description: "Invalid report type.", variant: "destructive" });
      return;
    }

    const workTicketPayload = {
      jobId: jobId,
      jobAddress: currentJob.address,
      ticketType: formType,
      [formType]: {
        developmentType: currentFormData.developmentType,
        additionalInfo: currentFormData.additionalInfo
      }
    };

    const jobUpdatePayload = {
      wasteManagementAssessment: {
        status: 'paid' as const,
        type: 'wasteManagementAssessment' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        developmentType: currentFormData.developmentType,
        additionalInfo: currentFormData.additionalInfo
      }
    };

    try {
      await createWorkTicketMutation.mutateAsync(workTicketPayload);
      await updateJobMutation.mutateAsync({ jobId: jobId, payload: jobUpdatePayload });

      await queryClient.invalidateQueries({ queryKey: ['job', jobId] });

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
        description: `Your Waste Management Report has been purchased successfully.`,
      });
    } catch (error) {
      console.error(`Error processing ${formType} payment sequence:`, error);
      if (!createWorkTicketMutation.isError && !updateJobMutation.isError) {
         toast({
           title: "Payment Processing Error",
           description: `An unexpected error occurred during payment for Waste Management Report. Please try again.`,
           variant: "destructive",
         });
      }
    }
  };

  // --- Tile rendering logic ---
  const renderPrePreparedAssessmentCard = (assessment: PrePreparedAssessment) => {
    return (
      <div className="border rounded-lg p-4 bg-green-50">
        <div className="text-center py-4">
          <h4 className="font-medium mb-2">{assessment.title}</h4>
          <p className="text-sm text-gray-600 mb-4">
            {assessment.content}
          </p>
          <Button
            variant="default"
            className="w-full bg-green-600 hover:bg-green-700"
            onClick={() => {
              if (assessment.file) {
                router.push(
                  `/professionals/knowledge-base/waste-management/document?path=${encodeURIComponent(
                    `/api/kb-waste-management-assessments/${assessment.file.id}/download`
                  )}&title=${encodeURIComponent(assessment.title)}`
                );
              }
            }}
          >
            <FileText className="h-4 w-4 mr-2" />
            View Assessment
          </Button>
        </div>
      </div>
    );
  };

  // Updated renderCustomAssessmentForm function
  const renderCustomAssessmentForm = (formType: keyof WasteManagementFormState) => {
    if (!currentJob) return null;
    const jobSection = currentJob[formType];
    const isPaid = jobSection?.status === 'paid';
    const isCompleted = jobSection?.status === 'completed';
    const purchaseInitiated = formState[formType].purchaseInitiated;

    if (isCompleted) {
      return (
        <div className="border rounded-lg p-4 bg-green-50">
          <div className="text-center py-4">
            <Check className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <h4 className="font-medium mb-2">Report Complete</h4>
            <p className="text-sm text-gray-600 mb-4">
              Your Waste Management Report is available for download in the Documents section above.
            </p>
          </div>
        </div>
      );
    } else if (isPaid) {
      return (
        <div className="border rounded-lg p-4 bg-yellow-50">
          <div className="text-center py-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-500 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h4 className="font-medium mb-2">Report In Progress</h4>
            <p className="text-sm text-gray-600">
              We are processing your Waste Management Report. You will be notified when it's ready.
            </p>
          </div>
        </div>
      );
    } else if (purchaseInitiated) {
      const currentFormData = formState[formType].formData;
      const showPaymentBtn = formState[formType].showPaymentButton;

      return (
        <div className="space-y-6">
          <div className="space-y-4">
            <div><label className="block text-sm font-medium mb-2">Development Type</label><Input placeholder="Enter the type of development" value={currentFormData.developmentType} onChange={handleFormChange(formType, 'developmentType')} /></div>
            <div><label className="block text-sm font-medium mb-2">Additional Information</label><Textarea placeholder="Enter any additional information about your development" value={currentFormData.additionalInfo} onChange={handleFormChange(formType, 'additionalInfo')} rows={4} /></div>

            <div className="pt-4">
              {!showPaymentBtn ? (
                <Button
                  className="w-full"
                  onClick={() => handleConfirmDetails(formType)}
                  disabled={currentFormData.developmentType.trim().length === 0}
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
      return (
        <div className="flex justify-center items-center p-6">
          <Button
            className="w-full max-w-xs"
            onClick={() => handleInitiatePurchase(formType)}
          >
            <ShoppingCart className="h-4 w-4 mr-2" /> Purchase Waste Management Report
          </Button>
        </div>
      );
    }
  };

  // Generalized save changes handler
  const handleSaveChanges = () => {
    if (!jobId) return;
    let changesSaved = false;
    const updatedFormState = { ...formState };

    if (formState['wasteManagementAssessment'].hasUnsavedChanges) {
      localStorage.setItem(`wasteManagementAssessment-${jobId}`, JSON.stringify(formState['wasteManagementAssessment'].formData));
      updatedFormState['wasteManagementAssessment'] = { ...updatedFormState['wasteManagementAssessment'], hasUnsavedChanges: false };
      changesSaved = true;
    }

    if (changesSaved) {
      setFormState(updatedFormState);
      if (updatedFormState['wasteManagementAssessment'].hasUnsavedChanges === false) {
        toast({ title: "Form Data Saved", description: "Unsaved form changes saved locally." });
      }
    } else {
      toast({ title: "No Changes", description: "No unsaved changes to save." });
    }
  };

  // --- Main Render Logic for JobReportWriter ---
  const isLoading = isJobLoading;

  if (isLoading) return <div>Loading job details...</div>;

  if (isJobError) return <Alert variant="destructive"><AlertTitle>Error Loading Job</AlertTitle><AlertDescription>{jobError?.message || 'Failed to load job data.'}</AlertDescription></Alert>;
  if (!currentJob && !isJobLoading) return <div>Job data not available. Select a job or check for errors.</div>;
  if (!currentJob) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      {/* Loading States */}
      {isPrePreparedLoading && <div>Loading assessments...</div>}

      {/* Error States */}
      {isPrePreparedError && <Alert variant="destructive"><AlertDescription>{prePreparedError?.message}</AlertDescription></Alert>}

      {/* Main Content */}
      <div className="space-y-6">
          {/* Waste Management Calculator Section */}
          <div className="border rounded-lg p-4 relative min-h-[200px] flex items-center justify-center">
            {/* The actual content that will be revealed */}
            <div className={`transition-opacity duration-300 ${isOverlayVisible ? 'opacity-0' : 'opacity-100'}`}>
              <div className="space-y-4">
                <p>This is the actual content that will be revealed!</p>
                {/* Add your form elements, inputs, etc. here */}

                {/* Show Overlay Again Button */}
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsOverlayVisible(true);
                    setOverlayStateForJob(jobId, true);
                  }}
                >
                  Show Overlay Again
                </Button>
              </div>
            </div>

            {/* The overlay that covers the content */}
            <div
              className={`absolute inset-0 bg-[#EEDA54]/20 border-[#EEDA54] transition-all duration-300 cursor-pointer flex items-center justify-center
                ${isOverlayVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
              onClick={() => {
                setIsOverlayVisible(false);
                setOverlayStateForJob(jobId, false);
              }}
            >
              <div className="flex flex-col items-center justify-center w-full p-8">
                <p className="text-[#532200] font-semibold text-lg mb-2">Do It Yourself</p>
                <p>Use our waste calculator to estimate the amount of waste generated by your project.</p>
                <p className="text-[#532200] text-sm mt-2">Click to preview</p>
              </div>
            </div>
          </div>

          {/* Waste Management Resources Section */}
          <div className="border rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-4">Waste Management Resources</h2>
            {isPrePreparedLoading ? (
              <div>Loading Resources...</div>
            ) : (
              filteredAssessments.map((section) => (
                <div key={section.title} className="space-y-4 mb-6">
                  <h3 className="text-lg font-medium">{section.title}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {section.assessments.map((assessment) => {
                      return renderPrePreparedAssessmentCard(assessment);
                    })}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Waste Management Assessment Section */}
          <div className="border rounded-lg p-4 relative min-h-[200px] flex items-center justify-center">
            {/* The actual content that will be revealed */}
            <div className={`transition-opacity duration-300 ${isAssessmentOverlayVisible ? 'opacity-0' : 'opacity-100'}`}>
              <div className="space-y-4">
                <h2 className="text-xl font-semibold mb-4">Waste Management Assessment</h2>
                {renderCustomAssessmentForm('wasteManagementAssessment')}

                {/* Show Overlay Again Button */}
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAssessmentOverlayVisible(true);
                    setAssessmentOverlayStateForJob(jobId, true);
                  }}
                >
                  Back to Resources
                </Button>
              </div>
            </div>

            {/* The overlay that covers the content */}
            <div
              className={`absolute inset-0 bg-[#EEDA54]/20 border-[#EEDA54] transition-all duration-300 cursor-pointer flex items-center justify-center
                ${isAssessmentOverlayVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            >
              <div className="flex flex-col items-center justify-center w-full p-8">
                <p className="text-[#532200] font-semibold text-lg mb-2">Waste Management Assessment</p>
                <p>Get a waste management report for your project.</p>

                {/* Job Selection Dropdown */}
                <div className="w-full max-w-md mt-4">
                  {isLoadingJobs ? (
                    <div>Loading jobs...</div>
                  ) : jobsError ? (
                    <Alert variant="destructive"><AlertDescription>Failed to load jobs.</AlertDescription></Alert>
                  ) : (
                    <Select
                      value={selectedJobId}
                      onValueChange={(value) => {
                        setSelectedJobId(value);
                        setIsAssessmentOverlayVisible(false);
                        setAssessmentOverlayStateForJob(value, false);
                      }}
                    >
                      <SelectTrigger className="w-full">
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
              </div>
            </div>
          </div>

          {/* Save Changes Button */}
          {(Object.values(formState).some(s => s.hasUnsavedChanges)) && (
            <Button onClick={handleSaveChanges} className="fixed bottom-4 right-4 z-50">
              Save Changes
            </Button>
          )}
        </div>

        {/* Assessment View Dialog for Text Content */}
        <Dialog open={!!selectedAssessment} onOpenChange={() => setSelectedAssessment(null)}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedAssessment?.title}</DialogTitle>
              <DialogDescription>
                {selectedAssessment?.section} • Posted by {selectedAssessment?.author} on {selectedAssessment?.date && new Date(selectedAssessment.date).toLocaleDateString()}
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4 space-y-4">
              <div className="prose max-w-none">
                <p className="text-gray-700">{selectedAssessment?.content}</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
    </div>
  )
}

// *** MAIN PAGE COMPONENT (Handles Job Selection) ***
export default function WasteManagementPage() {
  const { jobs, isLoading: isLoadingJobs, error: jobsError } = useJobs();
  const [selectedJobId, setSelectedJobId] = useState<string | undefined>(undefined);
  const router = useRouter();

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
      router.push(`/professionals/knowledge-base/waste-management?job=${selectedJobId}`, { scroll: false });
    }
  }, [selectedJobId, router]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Waste Management</h1>
      <JobInitialAssessment
        jobId={selectedJobId || ''}
        jobs={jobs}
        isLoadingJobs={isLoadingJobs}
        jobsError={jobsError}
        selectedJobId={selectedJobId}
        setSelectedJobId={setSelectedJobId}
      />
    </div>
  );
}
