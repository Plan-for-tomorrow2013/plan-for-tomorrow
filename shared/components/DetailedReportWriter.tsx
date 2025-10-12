import React from "react"
import { Card, CardContent, CardHeader } from "@shared/components/ui/card"
import { Input } from "@shared/components/ui/input"
import { Label } from "@shared/components/ui/label"

export interface ReportWriter {
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

interface DetailedReportWriterProps {
  reportWriter: ReportWriter
  onReportWriterChange: (details: ReportWriter) => void
  className?: string
  readOnly?: boolean
}

  export function DetailedReportWriter({
  reportWriter,
  onReportWriterChange,
  className = "",
  readOnly = false
}: DetailedReportWriterProps) {
  const handleChange = (field: keyof ReportWriter, value: string) => {
    onReportWriterChange({
      ...reportWriter,
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
              value={reportWriter.frontSetbackR}
              onChange={(e) => handleChange('frontSetbackR', e.target.value)}
              readOnly={readOnly}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="frontSetbackP">Front Setback (Proposed)</Label>
            <Input
              id="frontSetbackP"
              value={reportWriter.frontSetbackP}
              onChange={(e) => handleChange('frontSetbackP', e.target.value)}
              readOnly={readOnly}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sideSetback1R">Side Setback 1 (Required)</Label>
            <Input
              id="sideSetback1R"
              value={reportWriter.sideSetback1R}
              onChange={(e) => handleChange('sideSetback1R', e.target.value)}
              readOnly={readOnly}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sideSetback1P">Side Setback 1 (Proposed)</Label>
            <Input
              id="sideSetback1P"
              value={reportWriter.sideSetback1P}
              onChange={(e) => handleChange('sideSetback1P', e.target.value)}
              readOnly={readOnly}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sideSetback2R">Side Setback 2 (Required)</Label>
            <Input
              id="sideSetback2R"
              value={reportWriter.sideSetback2R}
              onChange={(e) => handleChange('sideSetback2R', e.target.value)}
              disabled={readOnly}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sideSetback2P">Side Setback 2 (Proposed)</Label>
            <Input
              id="sideSetback2P"
              value={reportWriter.sideSetback2P}
              onChange={(e) => handleChange('sideSetback2P', e.target.value)}
              disabled={readOnly}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rearSetbackR">Rear Setback (Required)</Label>
            <Input
              id="rearSetbackR"
              value={reportWriter.rearSetbackR}
              onChange={(e) => handleChange('rearSetbackR', e.target.value)}
              disabled={readOnly}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rearSetbackP">Rear Setback (Proposed)</Label>
            <Input
              id="rearSetbackP"
              value={reportWriter.rearSetbackP}
              onChange={(e) => handleChange('rearSetbackP', e.target.value)}
              disabled={readOnly}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="siteCoverageR">Site Coverage (Required)</Label>
            <Input
              id="siteCoverageR"
                value={reportWriter.siteCoverageR}
              onChange={(e) => handleChange('siteCoverageR', e.target.value)}
              disabled={readOnly}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="siteCoverageP">Site Coverage (Proposed)</Label>
            <Input
              id="siteCoverageP"
              value={reportWriter.siteCoverageP}
              onChange={(e) => handleChange('siteCoverageP', e.target.value)}
              disabled={readOnly}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="landscapeAreaR">Landscape Area (Required)</Label>
            <Input
              id="landscapeAreaR"
              value={reportWriter.landscapeAreaR}
              onChange={(e) => handleChange('landscapeAreaR', e.target.value)}
              disabled={readOnly}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="landscapeAreaP">Landscape Area (Proposed)</Label>
            <Input
              id="landscapeAreaP"
              value={reportWriter.landscapeAreaP}
              onChange={(e) => handleChange('landscapeAreaP', e.target.value)}
              disabled={readOnly}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
