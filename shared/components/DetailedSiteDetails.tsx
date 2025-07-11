import React from "react"
import { Card, CardContent, CardHeader } from "@shared/components/ui/card"
import { Input } from "@shared/components/ui/input"
import { Label } from "@shared/components/ui/label"
import { Textarea } from "@shared/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@shared/components/ui/select"
import { Checkbox } from "@shared/components/ui/checkbox"

import type { SiteDetails } from "@shared/types/site-details"

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
  const handleChange = (field: keyof SiteDetails, value: any) => {
    let updatedDetails = { ...siteDetails, [field]: value };
    // Automatically calculate fallAmount if highestRL or lowestRL changes
    if (field === 'highestRL' || field === 'lowestRL') {
      const highest = parseFloat(field === 'highestRL' ? value : siteDetails.highestRL || '');
      const lowest = parseFloat(field === 'lowestRL' ? value : siteDetails.lowestRL || '');
      if (!isNaN(highest) && !isNaN(lowest)) {
        updatedDetails.fallAmount = (highest - lowest).toFixed(2);
      } else {
        updatedDetails.fallAmount = '';
      }
    }
    onSiteDetailsChange(updatedDetails);
  };

  return (
    <Card className={`shadow-sm border border-gray-200 ${className}`}>
      <CardContent className="p-4 space-y-8">
        {/* Site Characteristics */}
        <div className="space-y-4">
          <h4 className="text-lg font-medium">Site Characteristics</h4>
          {/* Lot Type - full width */}
          <div className="space-y-2">
            <Label htmlFor="lotType">Lot Type</Label>
            <Select
              value={siteDetails.lotType}
              onValueChange={(value) => handleChange('lotType', value)}
              disabled={readOnly}
            >
              <SelectTrigger id="lotType">
                <SelectValue placeholder="Select lot type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="corner">Corner</SelectItem>
                <SelectItem value="battle-axe">Battle-axe</SelectItem>
                <SelectItem value="irregular">Irregular</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* Site Area & Primary Street Width */}
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
              <Label htmlFor="primaryStreetWidth">Primary Street Width (m)</Label>
              <Input
                id="primaryStreetWidth"
                value={siteDetails.primaryStreetWidth}
                onChange={(e) => handleChange('primaryStreetWidth', e.target.value)}
                readOnly={readOnly}
              />
            </div>
          </div>
          {/* Site Depth & Secondary Street Width */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="siteDepth">Site Depth (m)</Label>
              <Input
                id="siteDepth"
                value={siteDetails.siteDepth}
                onChange={(e) => handleChange('siteDepth', e.target.value)}
                readOnly={readOnly}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="secondaryStreetWidth">Secondary Street Width (m) (if corner lot)</Label>
              <Input
                id="secondaryStreetWidth"
                value={siteDetails.secondaryStreetWidth}
                onChange={(e) => handleChange('secondaryStreetWidth', e.target.value)}
                readOnly={readOnly}
              />
            </div>
          </div>
          {/* Site Gradient - full width */}
          <div className="space-y-2">
            <Label htmlFor="gradient">Site Gradient</Label>
            <Select
              value={siteDetails.gradient}
              onValueChange={(value) => handleChange('gradient', value)}
              disabled={readOnly}
            >
              <SelectTrigger id="gradient">
                <SelectValue placeholder="Select gradient" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="front-to-rear">A gradient from the front to the rear</SelectItem>
                <SelectItem value="rear-to-front">A gradient from the rear to the front</SelectItem>
                <SelectItem value="cross-fall">A cross-fall gradient</SelectItem>
                <SelectItem value="flat">Relatively flat</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* Highest RL, Lowest RL, Fall Amount - three columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="highestRL">Highest RL (m)</Label>
              <Input
                id="highestRL"
                value={siteDetails.highestRL}
                onChange={(e) => handleChange('highestRL', e.target.value)}
                readOnly={readOnly}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lowestRL">Lowest RL (m)</Label>
              <Input
                id="lowestRL"
                value={siteDetails.lowestRL}
                onChange={(e) => handleChange('lowestRL', e.target.value)}
                readOnly={readOnly}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fallAmount">Fall Amount (m)</Label>
              {/* Calculated field: visually distinct, not tabbable */}
              <Input
                id="fallAmount"
                value={siteDetails.fallAmount}
                readOnly
                className="bg-gray-50 text-gray-700"
                tabIndex={-1}
              />
              <p className="text-xs text-muted-foreground">
                Automatically calculated from highest and lowest RL values
              </p>
            </div>
          </div>
        </div>

        {/* Existing Development */}
        <div className="space-y-4">
          <h4 className="text-lg font-medium">Existing Development</h4>
          <div className="space-y-2">
            <Label htmlFor="currentLandUse">Current Land Use</Label>
            <Select
              value={siteDetails.currentLandUse}
              onValueChange={(value) => handleChange('currentLandUse', value)}
              disabled={readOnly}
            >
              <SelectTrigger id="currentLandUse">
                <SelectValue placeholder="Select current land use" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="residential">Residential</SelectItem>
                <SelectItem value="commercial">Commercial</SelectItem>
                <SelectItem value="industrial">Industrial</SelectItem>
                <SelectItem value="vacant">Vacant</SelectItem>
                <SelectItem value="mixed-use">Mixed Use</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="existingDevelopmentDetails">Existing Development Details</Label>
            <Textarea
              id="existingDevelopmentDetails"
              value={siteDetails.existingDevelopmentDetails}
              onChange={(e) => handleChange('existingDevelopmentDetails', e.target.value)}
              rows={3}
              readOnly={readOnly}
            />
          </div>
        </div>

        {/* Surrounding Development */}
        <div className="space-y-4">
          <h4 className="text-lg font-medium">Surrounding Development</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="northDevelopment">Development to the North</Label>
              <Input
                id="northDevelopment"
                value={siteDetails.northDevelopment}
                onChange={(e) => handleChange('northDevelopment', e.target.value)}
                readOnly={readOnly}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="southDevelopment">Development to the South</Label>
              <Input
                id="southDevelopment"
                value={siteDetails.southDevelopment}
                onChange={(e) => handleChange('southDevelopment', e.target.value)}
                readOnly={readOnly}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="eastDevelopment">Development to the East</Label>
              <Input
                id="eastDevelopment"
                value={siteDetails.eastDevelopment}
                onChange={(e) => handleChange('eastDevelopment', e.target.value)}
                readOnly={readOnly}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="westDevelopment">Development to the West</Label>
              <Input
                id="westDevelopment"
                value={siteDetails.westDevelopment}
                onChange={(e) => handleChange('westDevelopment', e.target.value)}
                readOnly={readOnly}
              />
            </div>
          </div>
        </div>

        {/* Site Constraints */}
        <div className="space-y-4">
          <h4 className="text-lg font-medium">Site Constraints</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="bushfireProne"
                checked={!!siteDetails.bushfireProne}
                onCheckedChange={(checked) => handleChange('bushfireProne', checked === true)}
                disabled={readOnly}
              />
              <Label htmlFor="bushfireProne">Bushfire Prone Land</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="floodProne"
                checked={!!siteDetails.floodProne}
                onCheckedChange={(checked) => handleChange('floodProne', checked === true)}
                disabled={readOnly}
              />
              <Label htmlFor="floodProne">Flood Prone Land</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="acidSulfateSoils"
                checked={!!siteDetails.acidSulfateSoils}
                onCheckedChange={(checked) => handleChange('acidSulfateSoils', checked === true)}
                disabled={readOnly}
              />
              <Label htmlFor="acidSulfateSoils">Acid Sulfate Soils</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="biodiversity"
                checked={!!siteDetails.biodiversity}
                onCheckedChange={(checked) => handleChange('biodiversity', checked === true)}
                disabled={readOnly}
              />
              <Label htmlFor="biodiversity">Biodiversity</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="salinity"
                checked={!!siteDetails.salinity}
                onCheckedChange={(checked) => handleChange('salinity', checked === true)}
                disabled={readOnly}
              />
              <Label htmlFor="salinity">Salinity</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="landslip"
                checked={!!siteDetails.landslip}
                onCheckedChange={(checked) => handleChange('landslip', checked === true)}
                disabled={readOnly}
              />
              <Label htmlFor="landslip">Prone to Landslide</Label>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="heritage">Heritage</Label>
            <Input
              id="heritage"
              value={siteDetails.heritage}
              onChange={(e) => handleChange('heritage', e.target.value)}
              readOnly={readOnly}
              placeholder="e.g. Adjoining, adjacent to a heritage-listed property or heritage-listed conservation area"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="otherConstraints">Other Constraints</Label>
            <Textarea
              id="otherConstraints"
              value={siteDetails.otherConstraints}
              onChange={(e) => handleChange('otherConstraints', e.target.value)}
              rows={2}
              readOnly={readOnly}
              placeholder="Describe any other site constraints not listed above"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
