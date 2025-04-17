'use client'

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
// Correcting import for Label and Textarea if they come from a specific form sub-component
// Assuming they might be custom or from shadcn/ui directly or a sub-component like './ui/form'
// If './ui/form' doesn't exist, adjust to './ui/label' and './ui/textarea' respectively
// For now, assuming direct import possibility or existence of './ui/form'
import { Label } from './ui/label'; // Or potentially './ui/form'
import { Textarea } from './ui/textarea'; // Or potentially './ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Define the interface for the form data (matches the one from the page)
export interface DetailedSiteDetailsData {
  lotType?: string;
  siteArea?: string;
  primaryStreetWidth?: string;
  secondaryStreetWidth?: string;
  siteGradient?: string;
  highestRL?: string;
  lowestRL?: string;
  fallAmount?: string;
  currentLandUse?: string;
  existingDevelopment?: string;
  developmentNorth?: string;
  developmentSouth?: string;
  developmentEast?: string;
  developmentWest?: string;
  bushfire?: boolean;
  flood?: boolean;
  heritage?: boolean;
  trees?: boolean;
}

interface DetailedSiteDetailsProps {
  // Rename initialData to data, representing the current state from the parent
  data: DetailedSiteDetailsData | null;
  onDataChange: (data: DetailedSiteDetailsData) => void; // Callback to notify parent of changes
  isReadOnly?: boolean; // To disable inputs if needed
}

const DetailedSiteDetails: React.FC<DetailedSiteDetailsProps> = ({
  data, // Use data prop
  onDataChange,
  isReadOnly = false,
}) => {
  // Remove internal formData state and useEffect

  // Ensure data is not null before accessing properties
  const currentData = data || {
    lotType: 'Standard',
    siteArea: '',
    primaryStreetWidth: '',
      secondaryStreetWidth: '',
      siteGradient: 'A gradient from the rear to the front',
      highestRL: '',
      lowestRL: '',
      fallAmount: '',
      currentLandUse: 'Residential',
      existingDevelopment: '',
      developmentNorth: '',
      developmentSouth: '',
      developmentEast: '',
      developmentWest: '',
      bushfire: false,
      flood: false,
      heritage: false,
    trees: false
  };

  // Generic handler for input/select/textarea changes - directly calls onDataChange
  const handleChange = (field: keyof DetailedSiteDetailsData, value: string | boolean) => {
    // Construct the new data object based on the current data from props
    const newData = { ...currentData, [field]: value };
    onDataChange(newData); // Notify parent component of the change
  };

  // Specific handler for checkbox changes - directly calls onDataChange
  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>, field: keyof DetailedSiteDetailsData) => {
     // Construct the new data object based on the current data from props
    const newData = { ...currentData, [field]: event.target.checked };
    onDataChange(newData); // Notify parent component of the change
  };


  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Site Characteristics */}
      <Card className="shadow-md">
        <CardHeader className="bg-[#323A40] text-white">
          <h2 className="text-lg font-semibold">Site Characteristics</h2>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div className="space-y-2">
            <Label>Lot Type</Label>
            <Select
              // Read value from props.data (currentData)
              value={currentData.lotType || 'Standard'}
              onValueChange={(value) => handleChange('lotType', value)}
              disabled={isReadOnly}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Standard">Standard</SelectItem>
                <SelectItem value="Corner">Corner</SelectItem>
                <SelectItem value="Irregular">Irregular</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
            <Label>Site Area (m²)</Label>
            <Input
              placeholder="e.g. 500"
              // Read value from props.data (currentData)
              value={currentData.siteArea || ''}
              onChange={(e) => handleChange('siteArea', e.target.value)}
              readOnly={isReadOnly}
              disabled={isReadOnly}
              />
            </div>
            <div className="space-y-2">
            <Label>Primary Street Width (m)</Label>
            <Input
              placeholder="e.g. 15.24"
              // Read value from props.data (currentData)
              value={currentData.primaryStreetWidth || ''}
              onChange={(e) => handleChange('primaryStreetWidth', e.target.value)}
              readOnly={isReadOnly}
              disabled={isReadOnly}
              />
            </div>
          </div>

          <div className="space-y-2">
          <Label>Secondary Street Width (m) (if corner lot)</Label>
          <Input
            placeholder="e.g. 12.50"
            // Read value from props.data (currentData)
            value={currentData.secondaryStreetWidth || ''}
            onChange={(e) => handleChange('secondaryStreetWidth', e.target.value)}
            readOnly={isReadOnly}
            disabled={isReadOnly}
            />
          </div>

          <div className="space-y-2">
          <Label>Site Gradient</Label>
          <Select
            // Read value from props.data (currentData)
            value={currentData.siteGradient || 'A gradient from the rear to the front'}
            onValueChange={(value) => handleChange('siteGradient', value)}
            disabled={isReadOnly}
          >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A gradient from the rear to the front">Gradient from rear to front</SelectItem>
                <SelectItem value="A gradient from the front to the rear">Gradient from front to rear</SelectItem>
                <SelectItem value="A cross-fall from north to south">Cross-fall from north to south</SelectItem>
                <SelectItem value="A cross-fall from south to north">Cross-fall from south to north</SelectItem>
                <SelectItem value="Generally flat">Generally flat</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
            <Label>Highest RL (m)</Label>
            <Input
              placeholder="e.g. 50.00"
              // Read value from props.data (currentData)
              value={currentData.highestRL || ''}
              onChange={(e) => handleChange('highestRL', e.target.value)}
              readOnly={isReadOnly}
              disabled={isReadOnly}
              />
            </div>
            <div className="space-y-2">
            <Label>Lowest RL (m)</Label>
            <Input
              placeholder="e.g. 48.50"
              // Read value from props.data (currentData)
              value={currentData.lowestRL || ''}
              onChange={(e) => handleChange('lowestRL', e.target.value)}
              readOnly={isReadOnly}
              disabled={isReadOnly}
              />
            </div>
            <div className="space-y-2">
            <Label>Fall Amount (m)</Label>
            <Input
              placeholder="e.g. 1.50"
              // Read value from props.data (currentData)
              value={currentData.fallAmount || ''}
              onChange={(e) => handleChange('fallAmount', e.target.value)}
              readOnly={isReadOnly}
              disabled={isReadOnly}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Existing Development */}
      <Card className="shadow-md">
        <CardHeader className="bg-[#323A40] text-white">
          <h2 className="text-lg font-semibold">Existing Development</h2>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div className="space-y-2">
          <Label>Current Land Use</Label>
          <Select
            // Read value from props.data (currentData)
            value={currentData.currentLandUse || 'Residential'}
            onValueChange={(value) => handleChange('currentLandUse', value)}
            disabled={isReadOnly}
          >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Residential">Residential</SelectItem>
                <SelectItem value="Commercial">Commercial</SelectItem>
                <SelectItem value="Industrial">Industrial</SelectItem>
                <SelectItem value="Vacant">Vacant Land</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
          <Label>Existing Development Details</Label>
          <Textarea
            placeholder="e.g. Single storey dwelling house with associated structures"
            // Read value from props.data (currentData)
            value={currentData.existingDevelopment || ''}
            onChange={(e) => handleChange('existingDevelopment', e.target.value)}
            className="min-h-[100px] w-full"
            readOnly={isReadOnly}
            disabled={isReadOnly}
            />
          </div>
        </CardContent>
      </Card>

      {/* Surrounding Development */}
      <Card className="shadow-md lg:col-span-2">
        <CardHeader className="bg-[#323A40] text-white">
          <h2 className="text-lg font-semibold">Surrounding Development</h2>
        </CardHeader>
        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
          <Label>Development to the North</Label>
          <Textarea
            placeholder="e.g. Single storey dwelling house at 11 Viola Place"
            // Read value from props.data (currentData)
            value={currentData.developmentNorth || ''}
            onChange={(e) => handleChange('developmentNorth', e.target.value)}
            className="min-h-[80px] w-full"
            readOnly={isReadOnly}
            disabled={isReadOnly}
            />
          </div>
          <div className="space-y-2">
          <Label>Development to the South</Label>
          <Textarea
            placeholder="e.g. Double storey dwelling house at 7 Viola Place"
            // Read value from props.data (currentData)
            value={currentData.developmentSouth || ''}
            onChange={(e) => handleChange('developmentSouth', e.target.value)}
            className="min-h-[80px] w-full"
            readOnly={isReadOnly}
            disabled={isReadOnly}
            />
          </div>
          <div className="space-y-2">
          <Label>Development to the East</Label>
          <Textarea
            placeholder="e.g. Rear yards of properties fronting Carnation Avenue"
            // Read value from props.data (currentData)
            value={currentData.developmentEast || ''}
            onChange={(e) => handleChange('developmentEast', e.target.value)}
            className="min-h-[80px] w-full"
            readOnly={isReadOnly}
            disabled={isReadOnly}
            />
          </div>
          <div className="space-y-2">
          <Label>Development to the West</Label>
          <Textarea
            placeholder="e.g. Viola Place and single storey dwelling houses opposite"
            // Read value from props.data (currentData)
            value={currentData.developmentWest || ''}
            onChange={(e) => handleChange('developmentWest', e.target.value)}
            className="min-h-[80px] w-full"
            readOnly={isReadOnly}
            disabled={isReadOnly}
            />
          </div>
        </CardContent>
      </Card>

      {/* Site constraints */}
      <Card className="shadow-md lg:col-span-2">
        <CardHeader className="bg-[#323A40] text-white">
          <h2 className="text-lg font-semibold">Site Constraints</h2>
        </CardHeader>
        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
          <Label className="flex items-center">
            <input
              type="checkbox"
              // Read checked state from props.data (currentData)
              checked={currentData.bushfire || false}
              onChange={(e) => handleCheckboxChange(e, 'bushfire')}
              className="mr-2"
              disabled={isReadOnly}
              />
              Bushfire
            </Label>
          </div>

          <div className="space-y-2">
          <Label className="flex items-center">
            <input
              type="checkbox"
              // Read checked state from props.data (currentData)
              checked={currentData.flood || false}
              onChange={(e) => handleCheckboxChange(e, 'flood')}
              className="mr-2"
              disabled={isReadOnly}
              />
              Flood
            </Label>
          </div>

          <div className="space-y-2">
          <Label className="flex items-center">
            <input
              type="checkbox"
              // Read checked state from props.data (currentData)
              checked={currentData.heritage || false}
              onChange={(e) => handleCheckboxChange(e, 'heritage')}
              className="mr-2"
              disabled={isReadOnly}
              />
              Heritage
            </Label>
            <p className="text-sm text-gray-600 pl-6"> {/* Indent description */}
              Is the site adjoining or adjacent to a heritage item or heritage conservation area?
            </p>
          </div>

          <div className="space-y-2">
          <Label className="flex items-center">
            <input
              type="checkbox"
              // Read checked state from props.data (currentData)
              checked={currentData.trees || false}
              onChange={(e) => handleCheckboxChange(e, 'trees')}
              className="mr-2"
              disabled={isReadOnly}
              />
              Trees
            </Label>
            <p className="text-sm text-gray-600 pl-6"> {/* Indent description */}
              Will tree removal be required or are there any trees on adjoining sites to consider?
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DetailedSiteDetails;
