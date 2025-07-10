"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import { SiteDetails } from "../types/site-details"
import { useQueryClient, useMutation } from '@tanstack/react-query'
import { toast } from "../components/ui/use-toast"

// Create an empty site details object with default values
const emptySiteDetails: SiteDetails = {
  // Site Characteristics
  lotType: '',
  siteArea: '',
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
  heritage: '',
  otherConstraints: '',
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
      queryClient.invalidateQueries({ queryKey: ['job', jobId] })
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
        isLoading: saveMutation.isPending,
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
