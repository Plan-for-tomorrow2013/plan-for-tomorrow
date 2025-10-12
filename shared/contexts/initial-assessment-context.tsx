"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { InitialAssessment } from "../components/DetailedInitialAssessment"
import { useQueryClient, useMutation, useQuery } from '@tanstack/react-query'
import { toast } from "../components/ui/use-toast"

// Create an empty initial assessment object with default values
const emptyInitialAssessment: InitialAssessment = {
  maxHeightR: '',
  maxGFAR: '',
  frontSetbackN1R: '',
  frontSetbackN2R: '',
  frontSetbackSRR: '',
  frontSetbackPRR: '',
  sideSetbackGF1R: '',
  sideSetbackGF2R: '',
  sideSetbackU1R: '',
  sideSetbackU2R: '',
  rearSetbackGFR: '',
  rearSetbackUFR: '',
  siteCoverageR: '',
  landscapeAreaR: '',
  deepSoilAreaR: '',
  privateOpenSpaceR: '',
  maxCutR: '',
  maxFillR: '',
  garageSetbackR: '',
  OtherRequirementsR: '',
  }

// Helper to normalize initial assessment from job data
function normalizeInitialAssessment(data: any): InitialAssessment {
  return {
    maxHeightR: data?.maxHeightR || '',
    maxGFAR: data?.maxGFAR || '',
    frontSetbackN1R: data?.frontSetbackN1R || '',
    frontSetbackN2R: data?.frontSetbackN2R || '',
    frontSetbackSRR: data?.frontSetbackSRR || '',
    frontSetbackPRR: data?.frontSetbackPRR || '',
    sideSetbackGF1R: data?.sideSetbackGF1R || '',
    sideSetbackGF2R: data?.sideSetbackGF2R || '',
    sideSetbackU1R: data?.sideSetbackU1R || '',
    sideSetbackU2R: data?.sideSetbackU2R || '',
    rearSetbackGFR: data?.rearSetbackGFR || '',
    rearSetbackUFR: data?.rearSetbackUFR || '',
    siteCoverageR: data?.siteCoverageR || '',
    landscapeAreaR: data?.landscapeAreaR || '',
    deepSoilAreaR: data?.deepSoilAreaR || '',
    privateOpenSpaceR: data?.privateOpenSpaceR || '',
    maxCutR: data?.maxCutR || '',
    maxFillR: data?.maxFillR || '',
    garageSetbackR: data?.garageSetbackR || '',
    OtherRequirementsR: data?.OtherRequirementsR || '',
  };
}

interface InitialAssessmentContextType {
  initialAssessment: InitialAssessment
  isLoading: boolean
  error: string | null
  hasUnsavedChanges: boolean
  updateInitialAssessment: (assessment: Partial<InitialAssessment>) => void
  saveInitialAssessment: () => Promise<void>
}

const InitialAssessmentContext = createContext<InitialAssessmentContextType | undefined>(undefined)

export interface InitialAssessmentProviderProps {
  children: ReactNode
  jobId: string
  initialInitialAssessment?: Partial<InitialAssessment>
}

export function InitialAssessmentProvider({ children, jobId, initialInitialAssessment = {} }: InitialAssessmentProviderProps) {
  const queryClient = useQueryClient()
  const [initialAssessment, setInitialAssessment] = useState<InitialAssessment>({ ...emptyInitialAssessment, ...initialInitialAssessment })
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Fetch job data to get initial assessment
  const { data: jobData, isLoading: isJobLoading } = useQuery({
    queryKey: ['job', jobId],
    queryFn: async () => {
      const response = await fetch(`/api/jobs/${jobId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch job data')
      }
      return response.json()
    },
    enabled: !!jobId,
  })

  // Update initial assessment when job data is loaded
  useEffect(() => {
    if (jobData?.initialAssessment) {
      const normalizedInitialAssessment = normalizeInitialAssessment(jobData.initialAssessment)
      setInitialAssessment(normalizedInitialAssessment)
      setHasUnsavedChanges(false) // Reset unsaved changes when loading from server
    }
  }, [jobData]) // Remove hasUnsavedChanges from dependencies

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (assessment: InitialAssessment) => {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initialAssessment: assessment }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to save initial assessment')
      }

      return response.json()
    },
    onSuccess: () => {
      setHasUnsavedChanges(false)
      toast({ title: "Success", description: "Initial assessment saved successfully" })
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save initial assessment",
        variant: "destructive"
      })
    }
  })

  const updateInitialAssessment = (assessment: Partial<InitialAssessment>) => {
    setInitialAssessment(prev => ({ ...prev, ...assessment }))
    setHasUnsavedChanges(true)
  }

  const saveInitialAssessment = async () => {
    await saveMutation.mutateAsync(initialAssessment)
  }

  return (
    <InitialAssessmentContext.Provider
      value={{
        initialAssessment,
        isLoading: isJobLoading || saveMutation.isPending,
        error: saveMutation.error ? saveMutation.error.message : null,
        hasUnsavedChanges,
        updateInitialAssessment,
        saveInitialAssessment,
      }}
    >
      {children}
    </InitialAssessmentContext.Provider>
  )
}

export function useInitialAssessment() {
  const context = useContext(InitialAssessmentContext)
  if (context === undefined) {
    throw new Error("useInitialAssessment must be used within a InitialAssessmentProvider")
  }
  return context
}

