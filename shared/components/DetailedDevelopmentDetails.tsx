import React from "react"
import { Card, CardContent } from "@shared/components/ui/card"
import { Input } from "@shared/components/ui/input"
import { Label } from "@shared/components/ui/label"
import { Textarea } from "@shared/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@shared/components/ui/select"
import { Checkbox } from "@shared/components/ui/checkbox"

import type { DevelopmentDetails } from "@shared/types/development-details"

interface DetailedDevelopmentDetailsProps {
  developmentDetails: DevelopmentDetails
  onDevelopmentDetailsChange: (details: DevelopmentDetails) => void
  className?: string
  readOnly?: boolean
  isLoading?: boolean
}

export function DetailedDevelopmentDetails({
  developmentDetails,
  onDevelopmentDetailsChange,
  className = "",
  readOnly = false,
  isLoading = false
}: DetailedDevelopmentDetailsProps) {
  const handleChange = (field: keyof DevelopmentDetails, value: any) => {
    onDevelopmentDetailsChange({
      ...developmentDetails,
      [field]: value
    })
  }

  return (
    <Card className={`shadow-sm border border-gray-200 ${className}`}>
      <CardContent className="p-4 space-y-8">
        {/* Development Description */}
        <div className="space-y-4">
          <h4 className="text-lg font-medium">Development Description</h4>
          <div className="space-y-2">
            <Label htmlFor="developmentDescription">Development Description</Label>
            <Textarea
              id="developmentDescription"
              value={developmentDetails.developmentDescription}
              onChange={(e) => handleChange('developmentDescription', e.target.value)}
              placeholder="Provide a detailed description of the proposed development"
              rows={4}
              readOnly={readOnly}
            />
          </div>
        </div>

        {/* Demolition */}
        <div className="space-y-4">
          <h4 className="text-lg font-medium">Demolition</h4>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="demolitionRequired"
                checked={developmentDetails.demolitionRequired}
                onCheckedChange={(checked) => handleChange('demolitionRequired', checked === true)}
                disabled={readOnly}
              />
              <Label htmlFor="demolitionRequired">Demolition Required</Label>
            </div>
            {developmentDetails.demolitionRequired && (
              <div className="space-y-2">
                <Label htmlFor="demolitionDetails">Demolition Details</Label>
                <Textarea
                  id="demolitionDetails"
                  value={developmentDetails.demolitionDetails || ""}
                  onChange={(e) => handleChange('demolitionDetails', e.target.value)}
                  placeholder="Describe what will be demolished"
                  rows={3}
                  readOnly={readOnly}
                />
              </div>
            )}
          </div>
        </div>

        {/* Construction */}
        <div className="space-y-4">
          <h4 className="text-lg font-medium">Construction</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="storeys">Number of Storeys</Label>
              <Input
                id="storeys"
                value={developmentDetails.storeys}
                onChange={(e) => handleChange('storeys', e.target.value)}
                placeholder="e.g., 2"
                readOnly={readOnly}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="buildingHeight">Building Height (m)</Label>
              <Input
                id="buildingHeight"
                value={developmentDetails.buildingHeight}
                onChange={(e) => handleChange('buildingHeight', e.target.value)}
                placeholder="e.g., 8.5"
                readOnly={readOnly}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="wallHeight">Wall Height (m)</Label>
              <Input
                id="wallHeight"
                value={developmentDetails.wallHeight}
                onChange={(e) => handleChange('wallHeight', e.target.value)}
                placeholder="e.g., 2.7"
                readOnly={readOnly}
              />
            </div>
          </div>
        </div>

        {/* Setbacks */}
        <div className="space-y-4">
          <h4 className="text-lg font-medium">Setbacks</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="frontSetback">Front Setback (m)</Label>
              <Input
                id="frontSetback"
                value={developmentDetails.frontSetback}
                onChange={(e) => handleChange('frontSetback', e.target.value)}
                placeholder="e.g., 6.0"
                readOnly={readOnly}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="secondaryFrontSetback">Secondary Front Setback (m)</Label>
              <Input
                id="secondaryFrontSetback"
                value={developmentDetails.secondaryFrontSetback || ""}
                onChange={(e) => handleChange('secondaryFrontSetback', e.target.value)}
                placeholder="e.g., 3.0"
                readOnly={readOnly}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rearSetbackGround">Rear Setback - Ground (m)</Label>
              <Input
                id="rearSetbackGround"
                value={developmentDetails.rearSetbackGround}
                onChange={(e) => handleChange('rearSetbackGround', e.target.value)}
                placeholder="e.g., 6.0"
                readOnly={readOnly}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rearSetbackUpper">Rear Setback - Upper (m)</Label>
              <Input
                id="rearSetbackUpper"
                value={developmentDetails.rearSetbackUpper || ""}
                onChange={(e) => handleChange('rearSetbackUpper', e.target.value)}
                placeholder="e.g., 9.0"
                readOnly={readOnly}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sideSetbackGroundOne">Side Setback 1 - Ground (m)</Label>
              <Input
                id="sideSetbackGroundOne"
                value={developmentDetails.sideSetbackGroundOne}
                onChange={(e) => handleChange('sideSetbackGroundOne', e.target.value)}
                placeholder="e.g., 1.5"
                readOnly={readOnly}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sideSetbackGroundTwo">Side Setback 2 - Ground (m)</Label>
              <Input
                id="sideSetbackGroundTwo"
                value={developmentDetails.sideSetbackGroundTwo}
                onChange={(e) => handleChange('sideSetbackGroundTwo', e.target.value)}
                placeholder="e.g., 1.5"
                readOnly={readOnly}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sideSetbackUpperOne">Side Setback 1 - Upper (m)</Label>
              <Input
                id="sideSetbackUpperOne"
                value={developmentDetails.sideSetbackUpperOne}
                onChange={(e) => handleChange('sideSetbackUpperOne', e.target.value)}
                placeholder="e.g., 3.0"
                readOnly={readOnly}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sideSetbackUpperTwo">Side Setback 2 - Upper (m)</Label>
              <Input
                id="sideSetbackUpperTwo"
                value={developmentDetails.sideSetbackUpperTwo}
                onChange={(e) => handleChange('sideSetbackUpperTwo', e.target.value)}
                placeholder="e.g., 3.0"
                readOnly={readOnly}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="garageSetback">Garage Setback (m)</Label>
              <Input
                id="garageSetback"
                value={developmentDetails.garageSetback}
                onChange={(e) => handleChange('garageSetback', e.target.value)}
                placeholder="e.g., 5.5"
                readOnly={readOnly}
              />
            </div>
          </div>
        </div>

        {/* Floor Area */}
        <div className="space-y-4">
          <h4 className="text-lg font-medium">Floor Area</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="existingGFA">Existing GFA (m²)</Label>
              <Input
                id="existingGFA"
                value={developmentDetails.existingGFA || ""}
                onChange={(e) => handleChange('existingGFA', e.target.value)}
                placeholder="e.g., 150"
                readOnly={readOnly}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="proposedGFA">Proposed GFA (m²)</Label>
              <Input
                id="proposedGFA"
                value={developmentDetails.proposedGFA}
                onChange={(e) => handleChange('proposedGFA', e.target.value)}
                placeholder="e.g., 300"
                readOnly={readOnly}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="totalGFA">Total GFA (m²)</Label>
              <Input
                id="totalGFA"
                value={developmentDetails.totalGFA}
                onChange={(e) => handleChange('totalGFA', e.target.value)}
                placeholder="Calculated automatically"
                readOnly={true}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="floorSpaceRatio">Floor Space Ratio</Label>
              <Input
                id="floorSpaceRatio"
                value={developmentDetails.floorSpaceRatio}
                onChange={(e) => handleChange('floorSpaceRatio', e.target.value)}
                placeholder="Calculated automatically"
                readOnly={true}
              />
            </div>
          </div>
        </div>

        {/* Site Coverage */}
        <div className="space-y-4">
          <h4 className="text-lg font-medium">Site Coverage</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="existingSiteCoverage">Existing Site Coverage (m²)</Label>
              <Input
                id="existingSiteCoverage"
                value={developmentDetails.existingSiteCoverage || ""}
                onChange={(e) => handleChange('existingSiteCoverage', e.target.value)}
                placeholder="e.g., 100"
                readOnly={readOnly}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="proposedSiteCoverage">Proposed Site Coverage (m²)</Label>
              <Input
                id="proposedSiteCoverage"
                value={developmentDetails.proposedSiteCoverage}
                onChange={(e) => handleChange('proposedSiteCoverage', e.target.value)}
                placeholder="e.g., 200"
                readOnly={readOnly}
              />
            </div>
          </div>
        </div>

        {/* Landscaping */}
        <div className="space-y-4">
          <h4 className="text-lg font-medium">Landscaping</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="existingLandscapedArea">Existing Landscaped Area (m²)</Label>
              <Input
                id="existingLandscapedArea"
                value={developmentDetails.existingLandscapedArea || ""}
                onChange={(e) => handleChange('existingLandscapedArea', e.target.value)}
                placeholder="e.g., 200"
                readOnly={readOnly}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="proposedLandscapedArea">Proposed Landscaped Area (m²)</Label>
              <Input
                id="proposedLandscapedArea"
                value={developmentDetails.proposedLandscapedArea}
                onChange={(e) => handleChange('proposedLandscapedArea', e.target.value)}
                placeholder="e.g., 250"
                readOnly={readOnly}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="landscapedAreaPercentage">Landscaped Area Percentage (%)</Label>
              <Input
                id="landscapedAreaPercentage"
                value={developmentDetails.landscapedAreaPercentage}
                onChange={(e) => handleChange('landscapedAreaPercentage', e.target.value)}
                placeholder="Calculated automatically"
                readOnly={true}
              />
            </div>
          </div>
        </div>

        {/* Deep Soil */}
        <div className="space-y-4">
          <h4 className="text-lg font-medium">Deep Soil</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="existingDeepSoilArea">Existing Deep Soil Area (m²)</Label>
              <Input
                id="existingDeepSoilArea"
                value={developmentDetails.existingDeepSoilArea || ""}
                onChange={(e) => handleChange('existingDeepSoilArea', e.target.value)}
                placeholder="e.g., 150"
                readOnly={readOnly}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="proposedDeepSoilArea">Proposed Deep Soil Area (m²)</Label>
              <Input
                id="proposedDeepSoilArea"
                value={developmentDetails.proposedDeepSoilArea}
                onChange={(e) => handleChange('proposedDeepSoilArea', e.target.value)}
                placeholder="e.g., 180"
                readOnly={readOnly}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deepSoilAreaPercentage">Deep Soil Area Percentage (%)</Label>
              <Input
                id="deepSoilAreaPercentage"
                value={developmentDetails.deepSoilAreaPercentage}
                onChange={(e) => handleChange('deepSoilAreaPercentage', e.target.value)}
                placeholder="Calculated automatically"
                readOnly={true}
              />
            </div>
          </div>
        </div>

        {/* Private Open Space */}
        <div className="space-y-4">
          <h4 className="text-lg font-medium">Private Open Space</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="existingPrivateOpenSpaceArea">Existing Private Open Space (m²)</Label>
              <Input
                id="existingPrivateOpenSpaceArea"
                value={developmentDetails.existingPrivateOpenSpaceArea || ""}
                onChange={(e) => handleChange('existingPrivateOpenSpaceArea', e.target.value)}
                placeholder="e.g., 80"
                readOnly={readOnly}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="proposedPrivateOpenSpaceArea">Proposed Private Open Space (m²)</Label>
              <Input
                id="proposedPrivateOpenSpaceArea"
                value={developmentDetails.proposedPrivateOpenSpaceArea}
                onChange={(e) => handleChange('proposedPrivateOpenSpaceArea', e.target.value)}
                placeholder="e.g., 120"
                readOnly={readOnly}
              />
            </div>
          </div>
        </div>

        {/* Excavation and Fill */}
        <div className="space-y-4">
          <h4 className="text-lg font-medium">Excavation and Fill</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="maxCut">Maximum Cut (m)</Label>
              <Input
                id="maxCut"
                value={developmentDetails.maxCut}
                onChange={(e) => handleChange('maxCut', e.target.value)}
                placeholder="e.g., 1.5"
                readOnly={readOnly}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxFill">Maximum Fill (m)</Label>
              <Input
                id="maxFill"
                value={developmentDetails.maxFill}
                onChange={(e) => handleChange('maxFill', e.target.value)}
                placeholder="e.g., 0.5"
                readOnly={readOnly}
              />
            </div>
          </div>
        </div>

        {/* Materials and Finishes */}
        <div className="space-y-4">
          <h4 className="text-lg font-medium">Materials and Finishes</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="externalWalls">External Walls</Label>
              <Input
                id="externalWalls"
                value={developmentDetails.externalWalls}
                onChange={(e) => handleChange('externalWalls', e.target.value)}
                placeholder="e.g., Brick veneer"
                readOnly={readOnly}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="roof">Roof</Label>
              <Input
                id="roof"
                value={developmentDetails.roof}
                onChange={(e) => handleChange('roof', e.target.value)}
                placeholder="e.g., Colorbond steel"
                readOnly={readOnly}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="windows">Windows</Label>
              <Input
                id="windows"
                value={developmentDetails.windows}
                onChange={(e) => handleChange('windows', e.target.value)}
                placeholder="e.g., Aluminium frames"
                readOnly={readOnly}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="otherMaterials">Other Materials</Label>
              <Input
                id="otherMaterials"
                value={developmentDetails.otherMaterials || ""}
                onChange={(e) => handleChange('otherMaterials', e.target.value)}
                placeholder="e.g., Timber decking"
                readOnly={readOnly}
              />
            </div>
          </div>
        </div>

        {/* Access and Parking */}
        <div className="space-y-4">
          <h4 className="text-lg font-medium">Access and Parking</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vehicleAccess">Vehicle Access</Label>
              <Input
                id="vehicleAccess"
                value={developmentDetails.vehicleAccess}
                onChange={(e) => handleChange('vehicleAccess', e.target.value)}
                placeholder="e.g., From street"
                readOnly={readOnly}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="carParkingSpaces">Car Parking Spaces</Label>
              <Input
                id="carParkingSpaces"
                value={developmentDetails.carParkingSpaces}
                onChange={(e) => handleChange('carParkingSpaces', e.target.value)}
                placeholder="e.g., 2"
                readOnly={readOnly}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pedestrianAccess">Pedestrian Access</Label>
              <Input
                id="pedestrianAccess"
                value={developmentDetails.pedestrianAccess}
                onChange={(e) => handleChange('pedestrianAccess', e.target.value)}
                placeholder="e.g., From street"
                readOnly={readOnly}
              />
            </div>
          </div>
        </div>

        {/* Stormwater */}
        <div className="space-y-4">
          <h4 className="text-lg font-medium">Stormwater</h4>
          <div className="space-y-2">
            <Label htmlFor="stormwaterDisposal">Stormwater Disposal</Label>
            <Input
              id="stormwaterDisposal"
              value={developmentDetails.stormwaterDisposal}
              onChange={(e) => handleChange('stormwaterDisposal', e.target.value)}
              placeholder="e.g., Connected to street drainage"
              readOnly={readOnly}
            />
          </div>
        </div>

        {/* Waste Management */}
        <div className="space-y-4">
          <h4 className="text-lg font-medium">Waste Management</h4>
          <div className="space-y-2">
            <Label htmlFor="wasteManagement">Waste Management</Label>
            <Input
              id="wasteManagement"
              value={developmentDetails.wasteManagement}
              onChange={(e) => handleChange('wasteManagement', e.target.value)}
              placeholder="e.g., Council collection"
              readOnly={readOnly}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 