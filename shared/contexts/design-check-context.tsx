"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { DesignCheck } from "@shared/components/DetailedDesignCheck"
import { useQueryClient, useMutation, useQuery } from '@tanstack/react-query'
import { toast } from "../components/ui/use-toast"

// Create an empty design check object with default values
const emptyDesignCheck: DesignCheck = {
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

// Helper to normalize design check from job data
function normalizeDesignCheck(data: any): DesignCheck {
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

interface DesignCheckContextType {
  designCheck: DesignCheck
  isLoading: boolean
  error: string | null
  hasUnsavedChanges: boolean
  updateDesignCheck: (assessment: Partial<DesignCheck>) => void
  saveDesignCheck: () => Promise<void>
}

const DesignCheckContext = createContext<DesignCheckContextType | undefined>(undefined)

export interface DesignCheckProviderProps {
  children: ReactNode
  jobId: string
  initialDesignCheck?: Partial<DesignCheck>
}

export function DesignCheckProvider({ children, jobId, initialDesignCheck = {} }: DesignCheckProviderProps) {
  const queryClient = useQueryClient()
  const [designCheck, setDesignCheck] = useState<DesignCheck>({ ...emptyDesignCheck, ...initialDesignCheck })
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Fetch job data to get design check
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

  // Update design check when job data is loaded
  useEffect(() => {
    if (jobData?.designCheck) {
      const normalizedDesignCheck = normalizeDesignCheck(jobData.designCheck)
      setDesignCheck(normalizedDesignCheck)
      setHasUnsavedChanges(false) // Reset unsaved changes when loading from server
    }
  }, [jobData]) // Remove hasUnsavedChanges from dependencies

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (assessment: DesignCheck) => {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ designCheck: assessment }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to save design check')
      }

      return response.json()
    },
    onSuccess: () => {
      setHasUnsavedChanges(false)
      toast({ title: "Success", description: "Design check saved successfully" })
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save design check",
        variant: "destructive"
      })
    }
  })

  const updateDesignCheck = (assessment: Partial<DesignCheck>) => {
    setDesignCheck((prev: DesignCheck) => ({ ...prev, ...assessment }))
    setHasUnsavedChanges(true)
  }

  const saveDesignCheck = async () => {
    await saveMutation.mutateAsync(designCheck)
  }

  return (
    <DesignCheckContext.Provider
      value={{
        designCheck,
        isLoading: isJobLoading || saveMutation.isPending,
        error: saveMutation.error ? saveMutation.error.message : null,
        hasUnsavedChanges,
        updateDesignCheck,
        saveDesignCheck,
      }}
    >
      {children}
    </DesignCheckContext.Provider>
  )
}

export function useDesignCheck() {
  const context = useContext(DesignCheckContext)
  if (context === undefined) {
    throw new Error("useDesignCheck must be used within a DesignCheckProvider")
  }
  return context
}

