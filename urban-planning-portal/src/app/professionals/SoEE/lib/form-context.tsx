"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
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
    sideSetbackOne: "",
    sideSetbackTwo: "",
    existingGFA: "",
    proposedGFA: "",
    totalGFA: "",
    floorSpaceRatio: "",
    existingSiteCoverage: "",
    proposedSiteCoverage: "",
    existingLandscapedArea: "",
    proposedLandscapedArea: "",
    landscapedAreaPercentage: "",
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
}

export function FormProvider({ children }: FormProviderProps) {
  const [formData, setFormData] = useState<FormData>(initialFormData)

  const updateFormData = <T extends keyof FormData>(section: T, data: Partial<FormData[T]>) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        ...data,
      },
    }))
  }

  const saveDraft = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("see-generator-draft", JSON.stringify(formData))
    }
  }

  const loadDraft = () => {
    if (typeof window !== "undefined") {
      const draft = localStorage.getItem("see-generator-draft")
      if (draft) {
        try {
          const parsedDraft = JSON.parse(draft)
          setFormData(parsedDraft)
        } catch (error) {
          console.error("Error loading draft:", error)
        }
      }
    }
  }

  const clearForm = () => {
    setFormData(initialFormData)
    if (typeof window !== "undefined") {
      localStorage.removeItem("see-generator-draft")
    }
  }

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
