"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { SiteDetails } from "../types/site-details"
import { useQueryClient, useMutation, useQuery } from '@tanstack/react-query'
import { toast } from "../components/ui/use-toast"

// Create an empty site details object with default values
const emptySiteDetails: SiteDetails = {
  // Site Characteristics
  lotType: '',
  siteArea: '',
  frontage: '',
  depth: '',
  slope: '',
  orientation: '',
  soilType: '',
  vegetation: '',
  heritage: '',
  primaryStreetWidth: '',
  siteDepth: '',
  secondaryStreetWidth: '',
  gradient: '',
  highestRL: '',
  lowestRL: '',
  fallAmount: '',

  // Existing Development
  currentLandUse: '',
  existingDevelopmentDetails: '',

  // Surrounding Development
  northDevelopment: '',
  southDevelopment: '',
  eastDevelopment: '',
  westDevelopment: '',

  // Site Constraints
  bushfireProne: false,
  floodProne: false,
  acidSulfateSoils: false,
  biodiversity: false,
  salinity: false,
  landslip: false,
  contamination: '',
  otherConstraints: '',
}

// Helper to normalize site details from job data
function normalizeSiteDetails(data: any): SiteDetails {
  return {
    lotType: data?.lotType || '',
    siteArea: data?.siteArea || '',
    frontage: data?.frontage || '',
    depth: data?.depth || '',
    slope: data?.slope || '',
    orientation: data?.orientation || '',
    soilType: data?.soilType || '',
    vegetation: data?.vegetation || '',
    heritage: data?.heritage || '',
    primaryStreetWidth: data?.primaryStreetWidth || '',
    siteDepth: data?.siteDepth || '',
    secondaryStreetWidth: data?.secondaryStreetWidth || '',
    gradient: data?.gradient || '',
    highestRL: data?.highestRL || '',
    lowestRL: data?.lowestRL || '',
    fallAmount: data?.fallAmount || '',
    currentLandUse: data?.currentLandUse || '',
    existingDevelopmentDetails: data?.existingDevelopmentDetails || '',
    northDevelopment: data?.northDevelopment || '',
    southDevelopment: data?.southDevelopment || '',
    eastDevelopment: data?.eastDevelopment || '',
    westDevelopment: data?.westDevelopment || '',
    bushfireProne: data?.bushfireProne || false,
    floodProne: data?.floodProne || false,
    acidSulfateSoils: data?.acidSulfateSoils || false,
    biodiversity: data?.biodiversity || false,
    salinity: data?.salinity || false,
    landslip: data?.landslip || false,
    contamination: data?.contamination || '',
    otherConstraints: data?.otherConstraints || '',
  };
}

interface SiteDetailsContextType {
  siteDetails: SiteDetails
  isLoading: boolean
  error: string | null
  hasUnsavedChanges: boolean
  updateSiteDetails: (details: Partial<SiteDetails>) => void
  saveSiteDetails: () => Promise<void>
}

const SiteDetailsContext = createContext<SiteDetailsContextType | undefined>(undefined)

export interface SiteDetailsProviderProps {
  children: ReactNode
  jobId: string
  initialSiteDetails?: Partial<SiteDetails>
}

export function SiteDetailsProvider({ children, jobId, initialSiteDetails = {} }: SiteDetailsProviderProps) {
  const queryClient = useQueryClient()
  const [siteDetails, setSiteDetails] = useState<SiteDetails>({ ...emptySiteDetails, ...initialSiteDetails })
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Fetch job data to get initial site details
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

  // Update site details when job data is loaded
  useEffect(() => {
    if (jobData?.siteDetails) {
      const normalizedSiteDetails = normalizeSiteDetails(jobData.siteDetails)
      setSiteDetails(normalizedSiteDetails)
      setHasUnsavedChanges(false) // Reset unsaved changes when loading from server
    }
  }, [jobData]) // Remove hasUnsavedChanges from dependencies

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (details: SiteDetails) => {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siteDetails: details }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to save site details')
      }

      return response.json()
    },
    onSuccess: () => {
      setHasUnsavedChanges(false)
      toast({ title: "Success", description: "Site details saved successfully" })
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save site details",
        variant: "destructive"
      })
    }
  })

  const updateSiteDetails = (details: Partial<SiteDetails>) => {
    setSiteDetails(prev => ({ ...prev, ...details }))
    setHasUnsavedChanges(true)
  }

  const saveSiteDetails = async () => {
    await saveMutation.mutateAsync(siteDetails)
  }

  return (
    <SiteDetailsContext.Provider
      value={{
        siteDetails,
        isLoading: isJobLoading || saveMutation.isPending,
        error: saveMutation.error ? saveMutation.error.message : null,
        hasUnsavedChanges,
        updateSiteDetails,
        saveSiteDetails,
      }}
    >
      {children}
    </SiteDetailsContext.Provider>
  )
}

export function useSiteDetails() {
  const context = useContext(SiteDetailsContext)
  if (context === undefined) {
    throw new Error("useSiteDetails must be used within a SiteDetailsProvider")
  }
  return context
}
