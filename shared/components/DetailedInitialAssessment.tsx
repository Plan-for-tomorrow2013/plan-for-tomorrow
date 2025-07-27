import React from "react"
import { Card, CardContent, CardHeader } from "@shared/components/ui/card"
import { Input } from "@shared/components/ui/input"
import { Label } from "@shared/components/ui/label"

export interface InitialAssessment {
  frontSetbackR: string
  frontSetbackP: string
  sideSetback1R: string
  sideSetback1P: string
  sideSetback2R: string
  sideSetback2P: string
  rearSetbackR: string
  rearSetbackP: string
  siteCoverageR: string
  siteCoverageP: string
  landscapeAreaR: string
  landscapeAreaP: string
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
            <Label htmlFor="frontSetbackR">Front Setback (Required)</Label>
            <Input
              id="frontSetbackR"
              value={initialAssessment.frontSetbackR}
              onChange={(e) => handleChange('frontSetbackR', e.target.value)}
              readOnly={readOnly}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="frontSetbackP">Front Setback (Proposed)</Label>
            <Input
              id="frontSetbackP"
              value={initialAssessment.frontSetbackP}
              onChange={(e) => handleChange('frontSetbackP', e.target.value)}
              readOnly={readOnly}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sideSetback1R">Side Setback 1 (Required)</Label>
            <Input
              id="sideSetback1R"
              value={initialAssessment.sideSetback1R}
              onChange={(e) => handleChange('sideSetback1R', e.target.value)}
              readOnly={readOnly}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sideSetback1P">Side Setback 1 (Proposed)</Label>
            <Input
              id="sideSetback1P"
              value={initialAssessment.sideSetback1P}
              onChange={(e) => handleChange('sideSetback1P', e.target.value)}
              readOnly={readOnly}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sideSetback2R">Side Setback 2 (Required)</Label>
            <Input
              id="sideSetback2R"
              value={initialAssessment.sideSetback2R}
              onChange={(e) => handleChange('sideSetback2R', e.target.value)}
              disabled={readOnly}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sideSetback2P">Side Setback 2 (Proposed)</Label>
            <Input
              id="sideSetback2P"
              value={initialAssessment.sideSetback2P}
              onChange={(e) => handleChange('sideSetback2P', e.target.value)}
              disabled={readOnly}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rearSetbackR">Rear Setback (Required)</Label>
            <Input
              id="rearSetbackR"
              value={initialAssessment.rearSetbackR}
              onChange={(e) => handleChange('rearSetbackR', e.target.value)}
              disabled={readOnly}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rearSetbackP">Rear Setback (Proposed)</Label>
            <Input
              id="rearSetbackP"
              value={initialAssessment.rearSetbackP}
              onChange={(e) => handleChange('rearSetbackP', e.target.value)}
              disabled={readOnly}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="siteCoverageR">Site Coverage (Required)</Label>
            <Input
              id="siteCoverageR"
              value={initialAssessment.siteCoverageR}
              onChange={(e) => handleChange('siteCoverageR', e.target.value)}
              disabled={readOnly}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="siteCoverageP">Site Coverage (Proposed)</Label>
            <Input
              id="siteCoverageP"
              value={initialAssessment.siteCoverageP}
              onChange={(e) => handleChange('siteCoverageP', e.target.value)}
              disabled={readOnly}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="landscapeAreaR">Landscape Area (Required)</Label>
            <Input
              id="landscapeAreaR"
              value={initialAssessment.landscapeAreaR}
              onChange={(e) => handleChange('landscapeAreaR', e.target.value)}
              disabled={readOnly}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="landscapeAreaP">Landscape Area (Proposed)</Label>
            <Input
              id="landscapeAreaP"
              value={initialAssessment.landscapeAreaP}
              onChange={(e) => handleChange('landscapeAreaP', e.target.value)}
              disabled={readOnly}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
