"use client"

import React from "react"
import { PropertyDataShape } from "./PropertyInfo"

interface LEPFilterProps {
  propertyData: PropertyDataShape | null
  onLEPChange?: (lepName: string | null) => void
}

export function LEPFilter({ propertyData, onLEPChange }: LEPFilterProps) {
  // Find the Local Environmental Plan layer
  const lepLayer = propertyData?.planningLayers.epiLayers.find(
    layer => layer.layer === "Local Environmental Plan"
  )

  // Get the EPI Name from the layer attributes
  const lepName = lepLayer?.attributes["EPI Name"] || null

  // Call the callback when LEP changes
  React.useEffect(() => {
    onLEPChange?.(lepName)
  }, [lepName, onLEPChange])

  return null // This is a utility component that doesn't render anything
}
