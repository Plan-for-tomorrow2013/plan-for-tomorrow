"use client"

import React from "react"
import { Card, CardContent, CardHeader } from "@shared/components/ui/card"
import { Input } from "@shared/components/ui/input"
import { Label } from "@shared/components/ui/label"
import { Textarea } from "@shared/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@shared/components/ui/select"

export interface SiteDetails {
  siteArea: string
  frontage: string
  depth: string
  slope: string
  orientation: string
  soilType: string
  vegetation: string
  heritage: string
  floodProne: string
  bushfireProne: string
  contamination: string
  otherConstraints: string
  adjoiningNorth: string
  adjoiningSouth: string
  adjoiningEast: string
  adjoiningWest: string
}

interface DetailedSiteDetailsProps {
  siteDetails: SiteDetails
  onSiteDetailsChange: (details: SiteDetails) => void
  className?: string
  readOnly?: boolean
}

export function DetailedSiteDetails({
  siteDetails,
  onSiteDetailsChange,
  className = "",
  readOnly = false
}: DetailedSiteDetailsProps) {
  const handleChange = (field: keyof SiteDetails, value: string) => {
    onSiteDetailsChange({
      ...siteDetails,
      [field]: value
    })
  }

  return (
    <Card className={`shadow-sm border border-gray-200 ${className}`}>
      <CardHeader className="bg-gray-100 border-b border-gray-200">
        <h3 className="text-md font-semibold text-gray-700">Detailed Site Characteristics</h3>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="siteArea">Site Area (m²)</Label>
            <Input
              id="siteArea"
              value={siteDetails.siteArea}
              onChange={(e) => handleChange('siteArea', e.target.value)}
              readOnly={readOnly}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="frontage">Frontage (m)</Label>
            <Input
              id="frontage"
              value={siteDetails.frontage}
              onChange={(e) => handleChange('frontage', e.target.value)}
              readOnly={readOnly}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="depth">Depth (m)</Label>
            <Input
              id="depth"
              value={siteDetails.depth}
              onChange={(e) => handleChange('depth', e.target.value)}
              readOnly={readOnly}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slope">Slope</Label>
            <Select
              value={siteDetails.slope}
              onValueChange={(value) => handleChange('slope', value)}
              disabled={readOnly}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select slope" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="flat">Flat</SelectItem>
                <SelectItem value="gentle">Gentle</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="steep">Steep</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="orientation">Orientation</Label>
            <Select
              value={siteDetails.orientation}
              onValueChange={(value) => handleChange('orientation', value)}
              disabled={readOnly}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select orientation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="north">North</SelectItem>
                <SelectItem value="northeast">Northeast</SelectItem>
                <SelectItem value="east">East</SelectItem>
                <SelectItem value="southeast">Southeast</SelectItem>
                <SelectItem value="south">South</SelectItem>
                <SelectItem value="southwest">Southwest</SelectItem>
                <SelectItem value="west">West</SelectItem>
                <SelectItem value="northwest">Northwest</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="soilType">Soil Type</Label>
            <Select
              value={siteDetails.soilType}
              onValueChange={(value) => handleChange('soilType', value)}
              disabled={readOnly}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select soil type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="clay">Clay</SelectItem>
                <SelectItem value="sandy">Sandy</SelectItem>
                <SelectItem value="loam">Loam</SelectItem>
                <SelectItem value="rocky">Rocky</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="vegetation">Vegetation</Label>
            <Select
              value={siteDetails.vegetation}
              onValueChange={(value) => handleChange('vegetation', value)}
              disabled={readOnly}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select vegetation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="dense">Dense</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="heritage">Heritage Status</Label>
            <Select
              value={siteDetails.heritage}
              onValueChange={(value) => handleChange('heritage', value)}
              disabled={readOnly}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select heritage status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="local">Local</SelectItem>
                <SelectItem value="state">State</SelectItem>
                <SelectItem value="national">National</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="floodProne">Flood Prone</Label>
            <Select
              value={siteDetails.floodProne}
              onValueChange={(value) => handleChange('floodProne', value)}
              disabled={readOnly}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select flood prone status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no">No</SelectItem>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="unknown">Unknown</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="bushfireProne">Bushfire Prone</Label>
            <Select
              value={siteDetails.bushfireProne}
              onValueChange={(value) => handleChange('bushfireProne', value)}
              disabled={readOnly}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select bushfire prone status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no">No</SelectItem>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="unknown">Unknown</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="contamination">Contamination</Label>
            <Select
              value={siteDetails.contamination}
              onValueChange={(value) => handleChange('contamination', value)}
              disabled={readOnly}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select contamination status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no">No</SelectItem>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="unknown">Unknown</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="otherConstraints">Other Site Constraints</Label>
          <Textarea
            id="otherConstraints"
            value={siteDetails.otherConstraints}
            onChange={(e) => handleChange('otherConstraints', e.target.value)}
            readOnly={readOnly}
            placeholder="Enter any other site constraints or characteristics..."
          />
        </div>
      </CardContent>
      <Card className="shadow-sm border border-gray-200 mt-6">
        <CardHeader className="bg-gray-100 border-b border-gray-200">
          <h3 className="text-md font-semibold text-gray-700">Adjoining Sites</h3>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="adjoiningNorth">Adjoining North</Label>
              <Input
                id="adjoiningNorth"
                value={siteDetails.adjoiningNorth}
                onChange={(e) => handleChange('adjoiningNorth', e.target.value)}
                readOnly={readOnly}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="adjoiningSouth">Adjoining South</Label>
              <Input
                id="adjoiningSouth"
                value={siteDetails.adjoiningSouth}
                onChange={(e) => handleChange('adjoiningSouth', e.target.value)}
                readOnly={readOnly}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="adjoiningEast">Adjoining East</Label>
              <Input
                id="adjoiningEast"
                value={siteDetails.adjoiningEast}
                onChange={(e) => handleChange('adjoiningEast', e.target.value)}
                readOnly={readOnly}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="adjoiningWest">Adjoining West</Label>
              <Input
                id="adjoiningWest"
                value={siteDetails.adjoiningWest}
                onChange={(e) => handleChange('adjoiningWest', e.target.value)}
                readOnly={readOnly}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </Card>
  )
}
