import React from "react"
import { Card, CardContent, CardHeader } from "@shared/components/ui/card"
import { Input } from "@shared/components/ui/input"
import { Label } from "@shared/components/ui/label"

export interface InitialAssessment {
  maxHeightR: string
  maxGFAR: string
  frontSetbackN1R: string
  frontSetbackN2R: string
  frontSetbackSRR: string
  frontSetbackPRR: string
  sideSetbackGF1R: string
  sideSetbackGF2R: string
  sideSetbackU1R: string
  sideSetbackU2R: string
  rearSetbackGFR: string
  rearSetbackUFR: string
  siteCoverageR: string
  landscapeAreaR: string
  deepSoilAreaR: string
  privateOpenSpaceR: string
  maxCutR: string
  maxFillR: string
  garageSetbackR: string
  OtherRequirementsR: string
}

interface DetailedInitialAssessmentProps {
  initialAssessment: InitialAssessment
  onInitialAssessmentChange: (details: InitialAssessment) => void
  className?: string
  readOnly?: boolean
}

export function DetailedInitialAssessment({
  initialAssessment,
  onInitialAssessmentChange,
  className = "",
  readOnly = false
}: DetailedInitialAssessmentProps) {
  const handleChange = (field: keyof InitialAssessment, value: string) => {
    onInitialAssessmentChange({
      ...initialAssessment,
      [field]: value
    })
  }

  return (
    <Card className={`shadow-sm border border-gray-200 ${className}`}>
      <CardHeader className="bg-gray-100 border-b border-gray-200">
        <h3 className="text-md font-semibold text-gray-700">Initial Assessment Details</h3>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="maxHeightR">Max Height</Label>
            <Input
              id="maxHeightR"
              value={initialAssessment.maxHeightR}
              onChange={(e) => handleChange('maxHeightR', e.target.value)}
              readOnly={readOnly}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="maxGFAR">Max Gross Floor Area</Label>
            <Input
              id="maxGFAR"
              value={initialAssessment.maxGFAR}
              onChange={(e) => handleChange('maxGFAR', e.target.value)}
              readOnly={readOnly}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="frontSetbackN1R">Front Setback Neighbour 1</Label>
            <Input
              id="frontSetbackN1R"
              value={initialAssessment.frontSetbackN1R}
              onChange={(e) => handleChange('frontSetbackN1R', e.target.value)}
              readOnly={readOnly}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="frontSetbackN2R">Front Setback Neighbour 2</Label>
            <Input
              id="frontSetbackN2R"
              value={initialAssessment.frontSetbackN2R}
              onChange={(e) => handleChange('frontSetbackN2R', e.target.value)}
              readOnly={readOnly}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="frontSetbackPRR">Front Setback Primary Road</Label>
            <Input
              id="frontSetbackPRR"
              value={initialAssessment.frontSetbackSRR}
              onChange={(e) => handleChange('frontSetbackPRR', e.target.value)}
              readOnly={readOnly}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="frontSetbackSRR">Front Setback Secondary Road</Label>
            <Input
              id="frontSetbackSRR"
              value={initialAssessment.frontSetbackPRR}
              onChange={(e) => handleChange('frontSetbackSRR', e.target.value)}
              readOnly={readOnly}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sideSetbackGF1R">Side Setback Ground Floor 1</Label>
            <Input
              id="sideSetbackGF1R"
              value={initialAssessment.sideSetbackGF1R}
              onChange={(e) => handleChange('sideSetbackGF1R', e.target.value)}
              readOnly={readOnly}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sideSetbackGF2R">Side Setback Ground Floor 2</Label>
            <Input
              id="sideSetbackGF2R"
              value={initialAssessment.sideSetbackGF2R}
              onChange={(e) => handleChange('sideSetbackGF2R', e.target.value)}
              readOnly={readOnly}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sideSetbackU1R">Side Setback Upper Floor 1</Label>
            <Input
              id="sideSetbackU1R"
              value={initialAssessment.sideSetbackU1R}
              onChange={(e) => handleChange('sideSetbackU1R', e.target.value)}
              readOnly={readOnly}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sideSetbackU2R">Side Setback Upper Floor 2</Label>
            <Input
              id="sideSetbackU2R"
              value={initialAssessment.sideSetbackU2R}
              onChange={(e) => handleChange('sideSetbackU2R', e.target.value)}
              readOnly={readOnly}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rearSetbackGFR">Rear Setback Ground Floor</Label>
            <Input
              id="rearSetbackGFR"
              value={initialAssessment.rearSetbackGFR}
              onChange={(e) => handleChange('rearSetbackGFR', e.target.value)}
              readOnly={readOnly}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rearSetbackUFR">Rear Setback Upper Floor</Label>
            <Input
              id="rearSetbackUFR"
              value={initialAssessment.rearSetbackUFR}
              onChange={(e) => handleChange('rearSetbackUFR', e.target.value)}
              readOnly={readOnly}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="siteCoverageR">Site Coverage</Label>
            <Input
              id="siteCoverageR"
              value={initialAssessment.siteCoverageR}
              onChange={(e) => handleChange('siteCoverageR', e.target.value)}
              readOnly={readOnly}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="landscapeAreaR">Landscape Area</Label>
            <Input
              id="landscapeAreaR"
              value={initialAssessment.landscapeAreaR}
              onChange={(e) => handleChange('landscapeAreaR', e.target.value)}
              readOnly={readOnly}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="deepSoilAreaR">Deep Soil Area</Label>
            <Input
              id="deepSoilAreaR"
              value={initialAssessment.deepSoilAreaR}
              onChange={(e) => handleChange('deepSoilAreaR', e.target.value)}
              readOnly={readOnly}
            />
          </div>
          <div className="space-y-2">
              <Label htmlFor="privateOpenSpaceR">Private Open Space</Label>
            <Input
              id="privateOpenSpaceR"
              value={initialAssessment.privateOpenSpaceR}
              onChange={(e) => handleChange('privateOpenSpaceR', e.target.value)}
              readOnly={readOnly}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="maxCutR">Max Cut</Label>
            <Input
              id="maxCutR"
              value={initialAssessment.maxCutR}
              onChange={(e) => handleChange('maxCutR', e.target.value)}
              readOnly={readOnly}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="maxFillR">Max Fill</Label>
            <Input
              id="maxFillR"
              value={initialAssessment.maxFillR}
              onChange={(e) => handleChange('maxFillR', e.target.value)}
              readOnly={readOnly}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="garageSetbackR">Garage Setback</Label>
            <Input
              id="garageSetbackR"
              value={initialAssessment.garageSetbackR}
              onChange={(e) => handleChange('garageSetbackR', e.target.value)}
              readOnly={readOnly}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="OtherRequirementsR">Other Requirements</Label>
            <Input
              id="OtherRequirementsR"
              value={initialAssessment.OtherRequirementsR}
              onChange={(e) => handleChange('OtherRequirementsR', e.target.value)}
              readOnly={readOnly}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
