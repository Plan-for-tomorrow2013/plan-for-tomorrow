"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { DevelopmentDetails } from "../types/development-details"
import { useQueryClient, useMutation, useQuery } from '@tanstack/react-query'
import { toast } from "../components/ui/use-toast"

// Create an empty development details object with default values
const emptyDevelopmentDetails: DevelopmentDetails = {
  // Development Description
  developmentDescription: '',
  
  // Demolition
  demolitionRequired: false,
  demolitionDetails: '',
  
  // Construction
  storeys: '',
  buildingHeight: '',
  wallHeight: '',
  
  // Setbacks
  frontSetback: '',
  secondaryFrontSetback: '',
  rearSetbackGround: '',
  rearSetbackUpper: '',
  sideSetbackGroundOne: '',
  sideSetbackGroundTwo: '',
  sideSetbackUpperOne: '',
  sideSetbackUpperTwo: '',
  garageSetback: '',
  
  // Floor Area
  existingGFA: '',
  proposedGFA: '',
  totalGFA: '',
  floorSpaceRatio: '',
  
  // Site Coverage
  existingSiteCoverage: '',
  proposedSiteCoverage: '',
  
  // Landscaping
  existingLandscapedArea: '',
  proposedLandscapedArea: '',
  landscapedAreaPercentage: '',
  
  // Deep soil
  existingDeepSoilArea: '',
  proposedDeepSoilArea: '',
  deepSoilAreaPercentage: '',
  
  // Private open space
  existingPrivateOpenSpaceArea: '',
  proposedPrivateOpenSpaceArea: '',
  
  // Excavation and Fill
  maxCut: '',
  maxFill: '',
  
  // Materials and Finishes
  externalWalls: '',
  roof: '',
  windows: '',
  otherMaterials: '',
  
  // Access and Parking
  vehicleAccess: '',
  carParkingSpaces: '',
  pedestrianAccess: '',
  
  // Stormwater
  stormwaterDisposal: '',
  
  // Waste Management
  wasteManagement: '',
}

// Helper to normalize development details from job data
function normalizeDevelopmentDetails(data: any): DevelopmentDetails {
  return {
    // Development Description
    developmentDescription: data?.developmentDescription || '',
    
    // Demolition
    demolitionRequired: data?.demolitionRequired ?? false,
    demolitionDetails: data?.demolitionDetails || '',
    
    // Construction
    storeys: data?.storeys || '',
    buildingHeight: data?.buildingHeight || '',
    wallHeight: data?.wallHeight || '',
    
    // Setbacks
    frontSetback: data?.frontSetback || '',
    secondaryFrontSetback: data?.secondaryFrontSetback || '',
    rearSetbackGround: data?.rearSetbackGround || '',
    rearSetbackUpper: data?.rearSetbackUpper || '',
    sideSetbackGroundOne: data?.sideSetbackGroundOne || '',
    sideSetbackGroundTwo: data?.sideSetbackGroundTwo || '',
    sideSetbackUpperOne: data?.sideSetbackUpperOne || '',
    sideSetbackUpperTwo: data?.sideSetbackUpperTwo || '',
    garageSetback: data?.garageSetback || '',
    
    // Floor Area
    existingGFA: data?.existingGFA || '',
    proposedGFA: data?.proposedGFA || '',
    totalGFA: data?.totalGFA || '',
    floorSpaceRatio: data?.floorSpaceRatio || '',
    
    // Site Coverage
    existingSiteCoverage: data?.existingSiteCoverage || '',
    proposedSiteCoverage: data?.proposedSiteCoverage || '',
    
    // Landscaping
    existingLandscapedArea: data?.existingLandscapedArea || '',
    proposedLandscapedArea: data?.proposedLandscapedArea || '',
    landscapedAreaPercentage: data?.landscapedAreaPercentage || '',
    
    // Deep soil
    existingDeepSoilArea: data?.existingDeepSoilArea || '',
    proposedDeepSoilArea: data?.proposedDeepSoilArea || '',
    deepSoilAreaPercentage: data?.deepSoilAreaPercentage || '',
    
    // Private open space
    existingPrivateOpenSpaceArea: data?.existingPrivateOpenSpaceArea || '',
    proposedPrivateOpenSpaceArea: data?.proposedPrivateOpenSpaceArea || '',
    
    // Excavation and Fill
    maxCut: data?.maxCut || '',
    maxFill: data?.maxFill || '',
    
    // Materials and Finishes
    externalWalls: data?.externalWalls || '',
    roof: data?.roof || '',
    windows: data?.windows || '',
    otherMaterials: data?.otherMaterials || '',
    
    // Access and Parking
    vehicleAccess: data?.vehicleAccess || '',
    carParkingSpaces: data?.carParkingSpaces || '',
    pedestrianAccess: data?.pedestrianAccess || '',
    
    // Stormwater
    stormwaterDisposal: data?.stormwaterDisposal || '',
    
    // Waste Management
    wasteManagement: data?.wasteManagement || '',
  };
}

interface DevelopmentDetailsContextType {
  developmentDetails: DevelopmentDetails
  isLoading: boolean
  error: string | null
  hasUnsavedChanges: boolean
  updateDevelopmentDetails: (details: Partial<DevelopmentDetails>) => void
  saveDevelopmentDetails: () => Promise<void>
}

const DevelopmentDetailsContext = createContext<DevelopmentDetailsContextType | undefined>(undefined)

export interface DevelopmentDetailsProviderProps {
  children: ReactNode
  jobId: string
  initialDevelopmentDetails?: Partial<DevelopmentDetails>
}

export function DevelopmentDetailsProvider({ children, jobId, initialDevelopmentDetails = {} }: DevelopmentDetailsProviderProps) {
  const queryClient = useQueryClient()
  const [developmentDetails, setDevelopmentDetails] = useState<DevelopmentDetails>({ ...emptyDevelopmentDetails, ...initialDevelopmentDetails })
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Fetch job data to get initial development details
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

  // Update development details when job data is loaded
  useEffect(() => {
    if (jobData?.formData?.development || jobData?.developmentDetails) {
      const jobDevelopmentData = jobData?.formData?.development || jobData?.developmentDetails;
      const normalizedDevelopmentDetails = normalizeDevelopmentDetails(jobDevelopmentData)
      setDevelopmentDetails(normalizedDevelopmentDetails)
      setHasUnsavedChanges(false) // Reset unsaved changes when loading from server
    }
  }, [jobData]) // Remove hasUnsavedChanges from dependencies

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (details: DevelopmentDetails) => {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          formData: {
            ...jobData?.formData,
            development: details
          }
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to save development details')
      }

      return response.json()
    },
    onSuccess: () => {
      setHasUnsavedChanges(false)
      toast({ title: "Success", description: "Development details saved successfully" })
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save development details",
        variant: "destructive"
      })
    }
  })

  const updateDevelopmentDetails = (details: Partial<DevelopmentDetails>) => {
    setDevelopmentDetails(prev => ({ ...prev, ...details }))
    setHasUnsavedChanges(true)
  }

  const saveDevelopmentDetails = async () => {
    await saveMutation.mutateAsync(developmentDetails)
  }

  return (
    <DevelopmentDetailsContext.Provider
      value={{
        developmentDetails,
        isLoading: isJobLoading || saveMutation.isPending,
        error: saveMutation.error ? saveMutation.error.message : null,
        hasUnsavedChanges,
        updateDevelopmentDetails,
        saveDevelopmentDetails,
      }}
    >
      {children}
    </DevelopmentDetailsContext.Provider>
  )
}

export function useDevelopmentDetails() {
  const context = useContext(DevelopmentDetailsContext)
  if (context === undefined) {
    throw new Error("useDevelopmentDetails must be used within a DevelopmentDetailsProvider")
  }
  return context
} 