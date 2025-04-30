'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Define the structure of the propertyData prop
// This interface defines the *shape* of the propertyData object
export interface PropertyDataShape { // Added export keyword
    coordinates?: { // Make coordinates optional
      longitude: number;
      latitude: number;
    };
    planningLayers: {
      epiLayers: Array<{ layer: string; attributes: Record<string, any> }>;
      protectionLayers: Array<{ layer: string; attributes: Record<string, any> }>;
      localProvisionsLayers: Array<{ layer: string; attributes: Record<string, any> }>;
    };
}

// Update props interface to accept data directly
interface PropertyInfoProps {
  address: string;
  propertyData: PropertyDataShape | null; // Use the shape interface, allow null
}

// Removed duplicate interface definition


const PropertyInfo: React.FC<PropertyInfoProps> = ({ address, propertyData }) => {
  // Remove useState for fetchedData, loading, error
  // Remove useEffect hook as data is passed via props

  // Helper function to render attributes, mirroring PropertyInfoPage logic
  const renderAttributes = (attributes: Record<string, any>, layerName: string) => {
    const renderRow = (label: string, value: any) => (
      <div key={label} className="grid grid-cols-2 gap-4 py-2 border-b border-gray-100 last:border-0">
        <div className="text-sm text-gray-600 font-medium">{label}</div>
        <div className="text-sm text-gray-800">{value?.toString() || 'N/A'}</div>
      </div>
    );

    // Special handling for Local Environmental Plan
    if (layerName === "Local Environmental Plan") {
      return renderRow("EPI Name", attributes["EPI Name"])
    }

    // Special handling for Land Zoning
    if (layerName === "Land Zoning") {
      return (
        <div className="space-y-1">
          {renderRow("Land Use", attributes["Land Use"])}
          {renderRow("Zone", attributes["Zone"])}
        </div>
      )
    }

    // Special handling for Height of Building
    if (layerName === "Height of Building") {
      return (
        <div className="space-y-1">
          {renderRow("Maximum Building Height", attributes["Maximum Building Height"])}
          {renderRow("Units", attributes["Units"])}
        </div>
      )
    }

    // Special handling for Minimum Lot Size
    if (layerName === "Minimum Lot Size") {
      return (
        <div className="space-y-1">
          {renderRow("Lot Size", attributes["Lot Size"])}
          {renderRow("Units", attributes["Units"])}
        </div>
      )
    }

    // Special handling for Floor Space Ratio
    if (layerName === "Floor Space Ratio") {
      return renderRow("Floor Space Ratio", attributes["Floor Space Ratio"])
    }

    // Special handling for Minimum Dwelling Density Area
    if (layerName === "Minimum Dwelling Density Area") {
      return renderRow("Type", attributes["Type"])
    }

    // Special handling for Heritage
    if (layerName === "Heritage") {
      return (
        <div className="space-y-1">
          {renderRow("Heritage Type", attributes["Heritage Type"])}
          {renderRow("Item Number", attributes["Item Number"])}
          {renderRow("Item Name", attributes["Item Name"])}
          {renderRow("Significance", attributes["Significance"])}
        </div>
      )
    }

    // Special handling for Additional Permitted Uses
    if (layerName === "Additional Permitted Uses") {
      return renderRow("Code", attributes["Code"])
    }

    // Special handling for Protection Layers (using propertyData prop)
    if (propertyData?.planningLayers.protectionLayers.some(layer => layer.layer === layerName)) {
      return renderRow("Class", attributes["Class"])
    }

    // Special handling for Local Provisions (using propertyData prop)
    if (propertyData?.planningLayers.localProvisionsLayers.some(layer => layer.layer === layerName) &&
        layerName !== "Additional Permitted Uses") {
      return (
        <div className="space-y-1">
          {renderRow("Type", attributes["Type"])}
          {renderRow("Class", attributes["Class"])}
        </div>
      )
    }

    // Default rendering for all other layers
    return (
      <div className="space-y-1">
        {Object.entries(attributes).map(([key, value]) => renderRow(key, value))}
      </div>
    );
  };

  // Remove loading state check

  // Check if propertyData exists directly from props
  if (!propertyData) {
    // Add return statement for the Alert
    return (
      <Alert variant="warning" className="mt-4"> {/* Changed to warning */}
        <AlertTitle>Property Info Not Available</AlertTitle>
        <AlertDescription>
          Detailed property information (planning layers) is not available for this job.
        </AlertDescription>
      </Alert>
    ); // Removed stray parenthesis
  }

  // address and propertyData are directly available from props

  return (
    <div className="space-y-6">
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
  );
};

export default PropertyInfo;
