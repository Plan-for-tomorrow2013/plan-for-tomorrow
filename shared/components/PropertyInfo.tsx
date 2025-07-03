"use client"

import React from "react"
import { Card, CardContent, CardHeader } from "@shared/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@shared/components/ui/alert"
import { renderLayerAttributes } from "@shared/utils/layerAttributeRenderer"

export interface PropertyDataShape {
  coordinates?: {
    longitude: number
    latitude: number
  }
  planningLayers: {
    epiLayers: Array<{ layer: string; attributes: Record<string, any> }>
    protectionLayers: Array<{ layer: string; attributes: Record<string, any> }>
    localProvisionsLayers: Array<{ layer: string; attributes: Record<string, any> }>
  }
}

interface PropertyInfoProps {
  address: string
  propertyData: PropertyDataShape | null
  className?: string
}

export function PropertyInfo({ address, propertyData, className = "" }: PropertyInfoProps) {
  const renderAttributes = (attributes: Record<string, any>, layerName: string) => {
    const renderRow = (label: string, value: any) => (
      <div key={label} className="grid grid-cols-2 gap-4 py-2 border-b border-gray-100 last:border-0">
        <div className="text-sm text-gray-600 font-medium">{label}</div>
        <div className="text-sm text-gray-800">{value?.toString() || 'N/A'}</div>
      </div>
    )

    return renderLayerAttributes({
      attributes,
      layerName,
      renderRow,
      className: "space-y-1"
    });
  }

  if (!propertyData) {
    return (
      <Alert variant="default" className="mt-4">
        <AlertTitle>Property Info Not Available</AlertTitle>
        <AlertDescription>
          Detailed property information (planning layers) is not available for this job.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Principal Planning Layers */}
      <Card className="shadow-sm border border-gray-200">
        <CardHeader className="bg-gray-100 border-b border-gray-200">
          <h3 className="text-md font-semibold text-gray-700">Principal Planning Layers</h3>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          {propertyData.planningLayers.epiLayers.length > 0 ? (
            propertyData.planningLayers.epiLayers.map((layer, index) => (
              <div key={`epi-${index}`} className="bg-white p-3 rounded border border-gray-100">
                <h4 className="font-medium text-gray-600 mb-2 text-sm">{layer.layer}</h4>
                {renderAttributes(layer.attributes, layer.layer)}
              </div>
            ))
          ) : <p className="text-sm text-gray-500">No principal planning layers found.</p>}
        </CardContent>
      </Card>

      {/* Protection Layers */}
      <Card className="shadow-sm border border-gray-200">
        <CardHeader className="bg-gray-100 border-b border-gray-200">
          <h3 className="text-md font-semibold text-gray-700">Protection Layers</h3>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          {propertyData.planningLayers.protectionLayers.length > 0 ? (
            propertyData.planningLayers.protectionLayers.map((layer, index) => (
              <div key={`prot-${index}`} className="bg-white p-3 rounded border border-gray-100">
                <h4 className="font-medium text-gray-600 mb-2 text-sm">{layer.layer}</h4>
                {renderAttributes(layer.attributes, layer.layer)}
              </div>
            ))
          ) : <p className="text-sm text-gray-500">No protection layers found.</p>}
        </CardContent>
      </Card>

      {/* Local Provisions */}
      <Card className="shadow-sm border border-gray-200">
        <CardHeader className="bg-gray-100 border-b border-gray-200">
          <h3 className="text-md font-semibold text-gray-700">Local Provisions</h3>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          {propertyData.planningLayers.localProvisionsLayers.length > 0 ? (
            propertyData.planningLayers.localProvisionsLayers.map((layer, index) => (
              <div key={`local-${index}`} className="bg-white p-3 rounded border border-gray-100">
                <h4 className="font-medium text-gray-600 mb-2 text-sm">{layer.layer}</h4>
                {renderAttributes(layer.attributes, layer.layer)}
              </div>
            ))
          ) : <p className="text-sm text-gray-500">No local provisions layers found.</p>}
        </CardContent>
      </Card>
    </div>
  )
}
