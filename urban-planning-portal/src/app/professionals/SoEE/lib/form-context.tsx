"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"
import type { FormData } from "@/app/professionals/SoEE/lib/types"

interface FormContextType {
  formData: FormData
  updateFormData: <T extends keyof FormData>(section: T, data: Partial<FormData[T]>) => void
  saveDraft: () => void
  loadDraft: () => void
  clearForm: () => void
}

const FormContext = createContext<FormContextType | undefined>(undefined)

const initialFormData: FormData = {
  project: {
    projectName: "",
    address: "",
    developmentType: "",
    customDevelopmentType: "",
    councilArea: "",
  },
  property: {
    lotNumber: "",
    sectionNumber: "",
    dpNumber: "",
    streetNumber: "",
    streetName: "",
    secondaryStreetName: "",
    suburb: "",
    postcode: "",
    lotType: "",
    siteArea: "",
    primaryStreetWidth: "",
    siteDepth: "",
    secondaryStreetWidth: "",
    gradient: "",
    highestRL: "",
    lowestRL: "",
    fallAmount: "",
    currentLandUse: "",
    existingDevelopmentDetails: "",
    northDevelopment: "",
    southDevelopment: "",
    eastDevelopment: "",
    westDevelopment: "",
    constraints: {
      bushfireProne: false,
      floodProne: false,
      acidSulfateSoils: false,
      biodiversity: false,
      heritageItem: false,
      heritageConservationArea: false,
      contaminatedLand: false,
    },
    otherConstraints: "",
  },
  development: {
    developmentDescription: "",
    demolitionRequired: false,
    demolitionDetails: "",
    storeys: "",
    buildingHeight: "",
    wallHeight: "",
    frontSetback: "",
    secondaryFrontSetback: "",
    rearSetbackGround: "",
    rearSetbackUpper: "",
    sideSetbackGroundOne: "",
    sideSetbackGroundTwo: "",
    sideSetbackUpperOne: "",
    sideSetbackUpperTwo: "",
    garageSetback: "",
    existingGFA: "",
    proposedGFA: "",
    totalGFA: "",
    floorSpaceRatio: "",
    existingSiteCoverage: "",
    proposedSiteCoverage: "",
    existingLandscapedArea: "",
    proposedLandscapedArea: "",
    landscapedAreaPercentage: "",
    existingDeepSoilArea: "",
    proposedDeepSoilArea: "",
    deepSoilAreaPercentage: "",
    existingPrivateOpenSpaceArea: "",
    proposedPrivateOpenSpaceArea: "",
    maxCut: "",
    maxFill: "",
    externalWalls: "",
    roof: "",
    windows: "",
    otherMaterials: "",
    vehicleAccess: "",
    carParkingSpaces: "",
    pedestrianAccess: "",
    stormwaterDisposal: "",
    wasteManagement: "",
  },
  planning: {
    zoning: "",
    landUsePermissibility: "",
    lepName: "",
    lepCompliance: "",
    heightControl: "",
    heightProposed: "",
    heightCompliance: true,
    fsrControl: "",
    fsrProposed: "",
    fsrCompliance: true,
    dcpName: "",
    dcpCompliance: "",
    frontSetbackControl: "",
    frontSetbackProposed: "",
    frontSetbackCompliance: true,
    secondaryFrontSetbackControl: "",
    secondaryFrontSetbackProposed: "",
    secondaryFrontSetbackCompliance: true,
    rearSetbackGroundControl: "",
    rearSetbackGroundProposed: "",
    rearSetbackGroundCompliance: true,
    rearSetbackUpperControl: "",
    rearSetbackUpperProposed: "",
    rearSetbackUpperCompliance: true,
    sideSetbackNorthGroundControl: "",
    sideSetbackNorthGroundProposed: "",
    sideSetbackNorthGroundCompliance: true,
    sideSetbackNorthUpperControl: "",
    sideSetbackNorthUpperProposed: "",
    sideSetbackNorthUpperCompliance: true,
    sideSetbackSouthGroundControl: "",
    sideSetbackSouthGroundProposed: "",
    sideSetbackSouthGroundCompliance: true,
    sideSetbackSouthUpperControl: "",
    sideSetbackSouthUpperProposed: "",
    sideSetbackSouthUpperCompliance: true,
    siteCoverageControl: "",
    siteCoverageProposed: "",
    siteCoverageCompliance: true,
    landscapedAreaControl: "",
    landscapedAreaProposed: "",
    landscapedAreaCompliance: true,
    parkingControl: "",
    parkingProposed: "",
    parkingCompliance: true,
    seppBiodiversity: false,
    seppBiodiversityTreeRemoval: false,
    seppResilience: true,
    seppBasix: true,
    seppTransport: false,
    seppTransportClassifiedRoad: false,
    seppHousing: false,
    seppHousingSecondaryDwelling: false,
    secondaryDwellingFloorArea: "",
    maxFloorAreaByLEP: "",
    additionalPlanning: "",
  },
  environmental: {
    contextAndSetting: {
      noise: "",
      overlooking: "",
      overshadowing: "",
      buildingHeight: "",
      setbacksAndLandscaping: "",
      architecturalStyle: "",
    },
    accessTransportTraffic: "",
    publicDomain: "",
    utilities: "",
    heritage: "",
    otherLandResources: "",
    water: "",
    soils: "",
    airAndMicroclimate: "",
    floraAndFauna: "",
    treeRemoval: false,
    treeRemovalCount: "",
    waste: "",
    energy: "",
    noiseAndVibration: "",
    naturalHazards: "",
    bushfireProne: false,
    floodProne: false,
    technologicalHazards: "",
    safetySecurity: "",
    socialEconomicImpact: "",
    siteDesign: "",
    construction: "",
    constructionHours: "",
    erosionControl: "",
    dustControl: "",
    cumulativeImpacts: "",
    additionalInformation: "",
  },
}

interface FormProviderProps {
  children: ReactNode
  jobId?: string
}

export function FormProvider({ children, jobId }: FormProviderProps) {
  const [formData, setFormData] = useState<FormData>(initialFormData)

  // Create job-specific localStorage key
  const getStorageKey = useCallback(() => {
    return jobId ? `see-generator-draft-${jobId}` : "see-generator-draft"
  }, [jobId])

  // Auto-load draft when jobId changes
  useEffect(() => {
    if (jobId && typeof window !== "undefined") {
      const storageKey = getStorageKey()
      console.log(`Auto-loading draft for job ${jobId} with key: ${storageKey}`)
      const draft = localStorage.getItem(storageKey)
      if (draft) {
        try {
          const parsedDraft = JSON.parse(draft)
          console.log(`Auto-loaded draft data for job ${jobId}:`, parsedDraft)
          setFormData(parsedDraft)
        } catch (error) {
          console.error("Error auto-loading draft:", error)
        }
      } else {
        console.log(`No draft found for job ${jobId}, using initial data`)
        setFormData(initialFormData)
      }
    }
  }, [jobId, getStorageKey])

  const updateFormData = useCallback(<T extends keyof FormData>(section: T, data: Partial<FormData[T]>) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        ...data,
      },
    }))
  }, [])

  const saveDraft = useCallback(() => {
    if (typeof window !== "undefined") {
      const storageKey = getStorageKey()
      console.log(`Saving draft for job ${jobId} with key: ${storageKey}`)
      localStorage.setItem(storageKey, JSON.stringify(formData))
    }
  }, [formData, getStorageKey, jobId])

  const loadDraft = useCallback(() => {
    if (typeof window !== "undefined") {
      const storageKey = getStorageKey()
      console.log(`Loading draft for job ${jobId} with key: ${storageKey}`)
      const draft = localStorage.getItem(storageKey)
      if (draft) {
        try {
          const parsedDraft = JSON.parse(draft)
          console.log(`Loaded draft data for job ${jobId}:`, parsedDraft)
          setFormData(parsedDraft)
        } catch (error) {
          console.error("Error loading draft:", error)
        }
      } else {
        console.log(`No draft found for job ${jobId}`)
      }
    }
  }, [getStorageKey, jobId])

  const clearForm = useCallback(() => {
    setFormData(initialFormData)
    if (typeof window !== "undefined") {
      const storageKey = getStorageKey()
      localStorage.removeItem(storageKey)
    }
  }, [getStorageKey])

  return (
    <FormContext.Provider
      value={{
        formData,
        updateFormData,
        saveDraft,
        loadDraft,
        clearForm,
      }}
    >
      {children}
    </FormContext.Provider>
  )
}

export function useFormData() {
  const context = useContext(FormContext)
  if (context === undefined) {
    throw new Error("useFormData must be used within a FormProvider")
  }
  return context
}
