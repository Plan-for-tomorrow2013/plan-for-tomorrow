'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@shared/components/ui/card';
import { Input } from '@shared/components/ui/input';
import { Label } from '@shared/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@shared/components/ui/select';
import { Textarea } from '@shared/components/ui/textarea';
import { Checkbox } from '@shared/components/ui/checkbox';
import { ArrowLeft, ArrowRight, Save, Plus, Trash2 } from 'lucide-react';
import { FormProgress } from '@/app/professionals/SoEE/components/form-progress';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useFormData } from '@/app/professionals/SoEE/lib/form-context';

// Helper functions to extract planning data from property data
const extractPlanningData = (propertyData: any) => {
  if (!propertyData?.planningLayers?.epiLayers) {
    return null;
  }

  const epiLayers = propertyData.planningLayers.epiLayers;
  
  // Extract LEP Name
  const lepLayer = epiLayers.find((layer: any) => layer.layer === 'Local Environmental Plan');
  const lepName = lepLayer?.attributes?.['EPI_NAME'] || lepLayer?.attributes?.['EPI Name'];
  
  // Extract Zoning
  const zoningLayer = epiLayers.find((layer: any) => layer.layer === 'Land Zoning');
  const zoning = zoningLayer?.attributes?.['ZONE'] || zoningLayer?.attributes?.['Zone'];
  
  // Extract Height of Buildings
  const heightLayer = epiLayers.find((layer: any) => 
    layer.layer === 'Height of Building' || layer.layer === 'Height of Building Additional Controls'
  );
  const heightControl = heightLayer?.attributes?.['MAX_B_H_M'] || heightLayer?.attributes?.['Maximum Building Height'];
  
  // Extract Floor Space Ratio
  const fsrLayer = epiLayers.find((layer: any) => 
    layer.layer === 'Floor Space Ratio' || layer.layer === 'Floor Space Ratio (n:1)'
  );
  const fsrControl = fsrLayer?.attributes?.['FSR'] || fsrLayer?.attributes?.['Floor Space Ratio'];
  
  return {
    lepName,
    zoning,
    heightControl,
    fsrControl,
  };
};

// Helper function to determine DCP Name based on LEP Name
const getDcpNameFromLep = (lepName: string) => {
  const planningMappings = [
    { lep: "Cumberland Local Environmental Plan 2021", dcp: "Cumberland Development Control Plan 2023" },
    { lep: "Parramatta Local Environmental Plan 2011", dcp: "Parramatta Development Control Plan 2011" },
    { lep: "Blacktown Local Environmental Plan 2015", dcp: "Blacktown Development Control Plan 2015" },
    { lep: "Liverpool Local Environmental Plan 2008", dcp: "Liverpool Development Control Plan 2008" },
    { lep: "Fairfield Local Environmental Plan 2013", dcp: "Fairfield Development Control Plan 2013" },
    { lep: "Campbelltown Local Environmental Plan 2015", dcp: "Campbelltown Development Control Plan 2015" },
    { lep: "Penrith Local Environmental Plan 2010", dcp: "Penrith Development Control Plan 2014" },
    { lep: "The Hills Local Environmental Plan 2019", dcp: "The Hills Development Control Plan 2012" },
    { lep: "Canterbury-Bankstown Local Environmental Plan 2021", dcp: "Canterbury-Bankstown Development Control Plan 2021" },
    { lep: "Sydney Local Environmental Plan 2012", dcp: "Sydney Development Control Plan 2012" },
    { lep: "Inner West Local Environmental Plan 2022", dcp: "3 DCP" },
  ];
  
  const mapping = planningMappings.find(m => m.lep === lepName);
  return mapping?.dcp || '';
};

// Helper function to extract DCP proposed values from development data
const extractDcpProposedValues = (developmentData: any) => {
  if (!developmentData) {
    return null;
  }

  return {
    frontSetbackProposed: developmentData.frontSetback || '',
    secondaryFrontSetbackProposed: developmentData.secondaryFrontSetback || '',
    rearSetbackGroundProposed: developmentData.rearSetbackGround || '',
    rearSetbackUpperProposed: developmentData.rearSetbackUpper || '',
    sideSetbackNorthGroundProposed: developmentData.sideSetbackGroundOne || '',
    sideSetbackNorthUpperProposed: developmentData.sideSetbackUpperOne || '',
    sideSetbackSouthGroundProposed: developmentData.sideSetbackGroundTwo || '',
    sideSetbackSouthUpperProposed: developmentData.sideSetbackUpperTwo || '',
    siteCoverageProposed: developmentData.proposedSiteCoverage || '',
    landscapedAreaProposed: developmentData.proposedLandscapedArea || '',
    parkingProposed: developmentData.carParkingSpaces || '',
  };
};

// Helper function to extract numeric values from strings
const extractNumericValue = (value: string): number | null => {
  if (!value) return null;
  const match = value.match(/(\d+(?:\.\d+)?)/);
  return match ? parseFloat(match[1]) : null;
};

// Helper function to check compliance
const checkCompliance = (control: string, proposed: string): boolean => {
  if (!control || !proposed) return true; // Assume compliant if missing data
  
  const controlNum = extractNumericValue(control);
  const proposedNum = extractNumericValue(proposed);
  
  if (controlNum === null || proposedNum === null) return true; // Can't compare non-numeric values
  
  // Check for different types of controls
  if (control.toLowerCase().includes('minimum')) {
    return proposedNum >= controlNum;
  } else if (control.toLowerCase().includes('maximum')) {
    return proposedNum <= controlNum;
  } else if (control.toLowerCase().includes('spaces')) {
    // For parking spaces, check if proposed meets or exceeds requirement
    return proposedNum >= controlNum;
  }
  
  return true; // Default to compliant if we can't determine the comparison
};

// Helper function to generate compliance comments
const generateComplianceComments = (formData: any) => {
  const comments: string[] = [];
  
  // Check each field for compliance
  const complianceChecks = [
    { control: formData.frontSetbackControl, proposed: formData.frontSetbackProposed, name: 'Front Setback' },
    { control: formData.secondaryFrontSetbackControl, proposed: formData.secondaryFrontSetbackProposed, name: 'Secondary Front Setback' },
    { control: formData.rearSetbackGroundControl, proposed: formData.rearSetbackGroundProposed, name: 'Rear Setback Ground' },
    { control: formData.rearSetbackUpperControl, proposed: formData.rearSetbackUpperProposed, name: 'Rear Setback Upper' },
    { control: formData.sideSetbackNorthGroundControl, proposed: formData.sideSetbackNorthGroundProposed, name: 'Side Setback North Ground' },
    { control: formData.sideSetbackNorthUpperControl, proposed: formData.sideSetbackNorthUpperProposed, name: 'Side Setback North Upper' },
    { control: formData.sideSetbackSouthGroundControl, proposed: formData.sideSetbackSouthGroundProposed, name: 'Side Setback South Ground' },
    { control: formData.sideSetbackSouthUpperControl, proposed: formData.sideSetbackSouthUpperProposed, name: 'Side Setback South Upper' },
    { control: formData.siteCoverageControl, proposed: formData.siteCoverageProposed, name: 'Site Coverage' },
    { control: formData.landscapedAreaControl, proposed: formData.landscapedAreaProposed, name: 'Landscaped Area' },
    { control: formData.parkingControl, proposed: formData.parkingProposed, name: 'Car Parking' },
  ];
  
  complianceChecks.forEach(({ control, proposed, name }) => {
    if (control && proposed && !checkCompliance(control, proposed)) {
      comments.push(`${name}: see variation attached`);
    }
  });
  
  return comments;
};
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@shared/components/ui/table';
import { PlanningFormSchema } from '@/app/professionals/SoEE/lib/schemas';
type FormValues = z.infer<typeof PlanningFormSchema>;

export default function PlanningPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const jobId = searchParams.get('job');
  const [showSeppFields, setShowSeppFields] = useState(false);
  const [autoFilledFields, setAutoFilledFields] = useState<Set<string>>(new Set());
  const [isLoadingPropertyData, setIsLoadingPropertyData] = useState(false);
  const [complianceComments, setComplianceComments] = useState<string[]>([]);
  const { formData, updateFormData, saveDraft } = useFormData();

  // Initialize form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(PlanningFormSchema),
    defaultValues: {
      // Zoning and Permissibility
      zoning: formData.planning.zoning || 'R2 Low Density Residential',
      landUsePermissibility:
        formData.planning.landUsePermissibility ||
        'Dwelling houses are permitted with consent in the R2 Low Density Residential zone.',

      // LEP Compliance
      lepName: formData.planning.lepName || 'Cumberland Local Environmental Plan 2021',
      lepCompliance:
        formData.planning.lepCompliance ||
        'The proposed development complies with the relevant provisions of the Cumberland Local Environmental Plan 2021.',

      // Height of Buildings
      heightControl: formData.planning.heightControl || '8.5m',
      heightProposed: formData.planning.heightProposed || '7.2m',
      heightCompliance: formData.planning.heightCompliance ?? true,

      // Floor Space Ratio
      fsrControl: formData.planning.fsrControl || '0.5:1',
      fsrProposed: formData.planning.fsrProposed || '0.5:1',
      fsrCompliance: formData.planning.fsrCompliance ?? true,

      // DCP Compliance
      dcpName: formData.planning.dcpName || 'Cumberland Development Control Plan 2021',
      dcpCompliance:
        formData.planning.dcpCompliance ||
        'The proposed development generally complies with the relevant provisions of the Cumberland Development Control Plan 2021.',

      // Updated Setbacks
      frontSetbackControl:
        formData.planning.frontSetbackControl || 'Average of adjoining dwellings or 6m minimum',
      frontSetbackProposed: formData.planning.frontSetbackProposed || '6.5m',
      frontSetbackCompliance: formData.planning.frontSetbackCompliance ?? true,

      secondaryFrontSetbackControl:
        formData.planning.secondaryFrontSetbackControl || '3m minimum (if corner lot)',
      secondaryFrontSetbackProposed: formData.planning.secondaryFrontSetbackProposed || 'N/A',
      secondaryFrontSetbackCompliance: formData.planning.secondaryFrontSetbackCompliance ?? true,

      rearSetbackGroundControl: formData.planning.rearSetbackGroundControl || '6m minimum',
      rearSetbackGroundProposed: formData.planning.rearSetbackGroundProposed || '8.0m',
      rearSetbackGroundCompliance: formData.planning.rearSetbackGroundCompliance ?? true,

      rearSetbackUpperControl: formData.planning.rearSetbackUpperControl || '8m minimum',
      rearSetbackUpperProposed: formData.planning.rearSetbackUpperProposed || '10.0m',
      rearSetbackUpperCompliance: formData.planning.rearSetbackUpperCompliance ?? true,

      sideSetbackNorthGroundControl:
        formData.planning.sideSetbackNorthGroundControl || '0.9m minimum',
      sideSetbackNorthGroundProposed: formData.planning.sideSetbackNorthGroundProposed || '1.5m',
      sideSetbackNorthGroundCompliance: formData.planning.sideSetbackNorthGroundCompliance ?? true,

      sideSetbackNorthUpperControl:
        formData.planning.sideSetbackNorthUpperControl || '1.2m minimum',
      sideSetbackNorthUpperProposed: formData.planning.sideSetbackNorthUpperProposed || '1.5m',
      sideSetbackNorthUpperCompliance: formData.planning.sideSetbackNorthUpperCompliance ?? true,

      sideSetbackSouthGroundControl:
        formData.planning.sideSetbackSouthGroundControl || '0.9m minimum',
      sideSetbackSouthGroundProposed: formData.planning.sideSetbackSouthGroundProposed || '1.0m',
      sideSetbackSouthGroundCompliance: formData.planning.sideSetbackSouthGroundCompliance ?? true,

      sideSetbackSouthUpperControl:
        formData.planning.sideSetbackSouthUpperControl || '1.2m minimum',
      sideSetbackSouthUpperProposed: formData.planning.sideSetbackSouthUpperProposed || '1.2m',
      sideSetbackSouthUpperCompliance: formData.planning.sideSetbackSouthUpperCompliance ?? true,

      // Site Coverage
      siteCoverageControl: formData.planning.siteCoverageControl || '50% maximum',
      siteCoverageProposed: formData.planning.siteCoverageProposed || '40%',
      siteCoverageCompliance: formData.planning.siteCoverageCompliance ?? true,

      // Landscaped Area
      landscapedAreaControl: formData.planning.landscapedAreaControl || '35% minimum',
      landscapedAreaProposed: formData.planning.landscapedAreaProposed || '36%',
      landscapedAreaCompliance: formData.planning.landscapedAreaCompliance ?? true,

      // Car Parking
      parkingControl: formData.planning.parkingControl || '2 spaces minimum',
      parkingProposed: formData.planning.parkingProposed || '2 spaces',
      parkingCompliance: formData.planning.parkingCompliance ?? true,

      // SEPP Compliance
      seppBiodiversity: formData.planning.seppBiodiversity ?? false,
      seppBiodiversityTreeRemoval: formData.planning.seppBiodiversityTreeRemoval ?? false,
      seppResilience: formData.planning.seppResilience ?? true,
      seppBasix: formData.planning.seppBasix ?? true,
      seppTransport: formData.planning.seppTransport ?? false,
      seppTransportClassifiedRoad: formData.planning.seppTransportClassifiedRoad ?? false,
      seppHousing: formData.planning.seppHousing ?? false,
      seppHousingSecondaryDwelling: formData.planning.seppHousingSecondaryDwelling ?? false,
      secondaryDwellingFloorArea: formData.planning.secondaryDwellingFloorArea || '',
      maxFloorAreaByLEP: formData.planning.maxFloorAreaByLEP || '',

      // Additional Planning Considerations
      additionalPlanning: formData.planning.additionalPlanning || '',

      // Dynamic arrays for additional controls
      additionalControls: [],
      lepAdditionalControls: [],
    },
  });

  // Reset form when formData changes (after loading from localStorage)
  useEffect(() => {
    console.log('🔄 Form reset useEffect triggered');
    console.log('📊 formData.planning:', formData.planning);
    
    form.reset({
      // Zoning and Permissibility
      zoning: formData.planning.zoning || 'R2 Low Density Residential',
      landUsePermissibility:
        formData.planning.landUsePermissibility ||
        'Dwelling houses are permitted with consent in the R2 Low Density Residential zone.',

      // LEP Compliance
      lepName: formData.planning.lepName || 'Cumberland Local Environmental Plan 2021',
      lepCompliance:
        formData.planning.lepCompliance ||
        'The proposed development complies with the relevant provisions of the Cumberland Local Environmental Plan 2021.',

      // Height of Buildings
      heightControl: formData.planning.heightControl || '8.5m',
      heightProposed: formData.planning.heightProposed || '7.2m',
      heightCompliance: formData.planning.heightCompliance ?? true,

      // Floor Space Ratio
      fsrControl: formData.planning.fsrControl || '0.5:1',
      fsrProposed: formData.planning.fsrProposed || '0.5:1',
      fsrCompliance: formData.planning.fsrCompliance ?? true,

      // DCP Compliance
      dcpName: formData.planning.dcpName || 'Cumberland Development Control Plan 2021',
      dcpCompliance:
        formData.planning.dcpCompliance ||
        'The proposed development generally complies with the relevant provisions of the Cumberland Development Control Plan 2021.',

      // Updated Setbacks
      frontSetbackControl:
        formData.planning.frontSetbackControl || 'Average of adjoining dwellings or 6m minimum',
      frontSetbackProposed: formData.planning.frontSetbackProposed || '6.5m',
      frontSetbackCompliance: formData.planning.frontSetbackCompliance ?? true,

      secondaryFrontSetbackControl:
        formData.planning.secondaryFrontSetbackControl || '3m minimum (if corner lot)',
      secondaryFrontSetbackProposed: formData.planning.secondaryFrontSetbackProposed || 'N/A',
      secondaryFrontSetbackCompliance: formData.planning.secondaryFrontSetbackCompliance ?? true,

      rearSetbackGroundControl: formData.planning.rearSetbackGroundControl || '6m minimum',
      rearSetbackGroundProposed: formData.planning.rearSetbackGroundProposed || '8.0m',
      rearSetbackGroundCompliance: formData.planning.rearSetbackGroundCompliance ?? true,

      rearSetbackUpperControl: formData.planning.rearSetbackUpperControl || '8m minimum',
      rearSetbackUpperProposed: formData.planning.rearSetbackUpperProposed || '10.0m',
      rearSetbackUpperCompliance: formData.planning.rearSetbackUpperCompliance ?? true,

      sideSetbackNorthGroundControl:
        formData.planning.sideSetbackNorthGroundControl || '0.9m minimum',
      sideSetbackNorthGroundProposed: formData.planning.sideSetbackNorthGroundProposed || '1.5m',
      sideSetbackNorthGroundCompliance: formData.planning.sideSetbackNorthGroundCompliance ?? true,

      sideSetbackNorthUpperControl:
        formData.planning.sideSetbackNorthUpperControl || '1.2m minimum',
      sideSetbackNorthUpperProposed: formData.planning.sideSetbackNorthUpperProposed || '1.5m',
      sideSetbackNorthUpperCompliance: formData.planning.sideSetbackNorthUpperCompliance ?? true,

      sideSetbackSouthGroundControl:
        formData.planning.sideSetbackSouthGroundControl || '0.9m minimum',
      sideSetbackSouthGroundProposed: formData.planning.sideSetbackSouthGroundProposed || '1.0m',
      sideSetbackSouthGroundCompliance: formData.planning.sideSetbackSouthGroundCompliance ?? true,

      sideSetbackSouthUpperControl:
        formData.planning.sideSetbackSouthUpperControl || '1.2m minimum',
      sideSetbackSouthUpperProposed: formData.planning.sideSetbackSouthUpperProposed || '1.2m',
      sideSetbackSouthUpperCompliance: formData.planning.sideSetbackSouthUpperCompliance ?? true,

      // Site Coverage
      siteCoverageControl: formData.planning.siteCoverageControl || '50% maximum',
      siteCoverageProposed: formData.planning.siteCoverageProposed || '40%',
      siteCoverageCompliance: formData.planning.siteCoverageCompliance ?? true,

      // Landscaped Area
      landscapedAreaControl: formData.planning.landscapedAreaControl || '35% minimum',
      landscapedAreaProposed: formData.planning.landscapedAreaProposed || '36%',
      landscapedAreaCompliance: formData.planning.landscapedAreaCompliance ?? true,

      // Car Parking
      parkingControl: formData.planning.parkingControl || '2 spaces minimum',
      parkingProposed: formData.planning.parkingProposed || '2 spaces',
      parkingCompliance: formData.planning.parkingCompliance ?? true,

      // SEPP Compliance
      seppBiodiversity: formData.planning.seppBiodiversity ?? false,
      seppBiodiversityTreeRemoval: formData.planning.seppBiodiversityTreeRemoval ?? false,
      seppResilience: formData.planning.seppResilience ?? true,
      seppBasix: formData.planning.seppBasix ?? true,
      seppTransport: formData.planning.seppTransport ?? false,
      seppTransportClassifiedRoad: formData.planning.seppTransportClassifiedRoad ?? false,
      seppHousing: formData.planning.seppHousing ?? false,
      seppHousingSecondaryDwelling: formData.planning.seppHousingSecondaryDwelling ?? false,
      secondaryDwellingFloorArea: formData.planning.secondaryDwellingFloorArea || '',
      maxFloorAreaByLEP: formData.planning.maxFloorAreaByLEP || '',

      // Additional Planning Considerations
      additionalPlanning: formData.planning.additionalPlanning || '',

      // Dynamic arrays for additional controls
      additionalControls: formData.planning.additionalControls || [],
      lepAdditionalControls: formData.planning.lepAdditionalControls || [],
    });
  }, [formData.planning, form]);

  // Fetch job data and populate property data if not already available
  useEffect(() => {
    console.log('🔄 Fetch job data useEffect triggered');
    console.log('📊 jobId:', jobId);
    console.log('📊 formData.propertyData:', formData.propertyData);
    
    const fetchJobData = async () => {
      if (!formData.propertyData && jobId) {
        console.log('📡 Fetching job data...');
        setIsLoadingPropertyData(true);
        try {
          const response = await fetch(`/api/jobs/${jobId}`);
          if (response.ok) {
            const jobData = await response.json();
            console.log('📊 Received job data:', jobData);
            if (jobData.propertyData) {
              console.log('✅ Updating property data in form context');
              updateFormData('propertyData', jobData.propertyData);
            }
          } else {
            console.error('❌ Failed to fetch job data:', response.status, response.statusText);
          }
        } catch (error) {
          console.error('❌ Failed to fetch job data:', error);
        } finally {
          setIsLoadingPropertyData(false);
        }
      } else {
        console.log('⏭️ Skipping job data fetch - already has property data or no jobId');
      }
    };

    fetchJobData();
  }, [jobId, formData.propertyData, updateFormData]);

  // Auto-fill planning data from property data if available
  useEffect(() => {
    console.log('🔄 Property data auto-fill useEffect triggered');
    console.log('📊 formData.propertyData:', formData.propertyData);
    console.log('📊 formData.planning.lepName:', formData.planning.lepName);
    
    if (formData.propertyData && !formData.planning.lepName) {
      const planningData = extractPlanningData(formData.propertyData);
      console.log('📝 Extracted planning data:', planningData);
      
      if (planningData) {
        const newAutoFilledFields = new Set<string>();
        
        // Auto-fill LEP Name
        if (planningData.lepName) {
          console.log(`✅ Auto-filling lepName with ${planningData.lepName}`);
          form.setValue('lepName', planningData.lepName);
          newAutoFilledFields.add('lepName');
        }
        
        // Auto-fill Zoning
        if (planningData.zoning) {
          console.log(`✅ Auto-filling zoning with ${planningData.zoning}`);
          form.setValue('zoning', planningData.zoning);
          newAutoFilledFields.add('zoning');
        }
        
        // Auto-fill Height Control
        if (planningData.heightControl) {
          console.log(`✅ Auto-filling heightControl with ${planningData.heightControl}`);
          form.setValue('heightControl', planningData.heightControl);
          newAutoFilledFields.add('heightControl');
        }
        
        // Auto-fill FSR Control
        if (planningData.fsrControl) {
          console.log(`✅ Auto-filling fsrControl with ${planningData.fsrControl}`);
          form.setValue('fsrControl', planningData.fsrControl);
          newAutoFilledFields.add('fsrControl');
        }
        
        // Auto-fill DCP Name based on LEP
        if (planningData.lepName) {
          const dcpName = getDcpNameFromLep(planningData.lepName);
          if (dcpName) {
            console.log(`✅ Auto-filling dcpName with ${dcpName}`);
            form.setValue('dcpName', dcpName);
            newAutoFilledFields.add('dcpName');
          }
        }
        
        console.log('📝 New auto-filled fields:', newAutoFilledFields);
        setAutoFilledFields(newAutoFilledFields);
        
        // Update form data in context
        updateFormData('planning', {
          lepName: planningData.lepName || formData.planning.lepName,
          zoning: planningData.zoning || formData.planning.zoning,
          heightControl: planningData.heightControl || formData.planning.heightControl,
          fsrControl: planningData.fsrControl || formData.planning.fsrControl,
          dcpName: planningData.lepName ? getDcpNameFromLep(planningData.lepName) : formData.planning.dcpName,
        });
      }
    }
  }, [formData.propertyData, formData.planning.lepName, form, updateFormData]);

  // Auto-fill DCP proposed values from development data
  useEffect(() => {
    console.log('🔄 DCP auto-fill useEffect triggered');
    console.log('📊 formData.development:', formData.development);
    console.log('📊 autoFilledFields:', autoFilledFields);
    
    if (formData.development) {
      const dcpProposedData = extractDcpProposedValues(formData.development);
      console.log('📝 Extracted DCP proposed data:', dcpProposedData);
      
      if (dcpProposedData) {
        const newAutoFilledFields = new Set<string>(autoFilledFields);
        
        // Auto-fill DCP proposed values
        Object.entries(dcpProposedData).forEach(([fieldName, value]) => {
          if (value && !form.getValues(fieldName as keyof FormValues)) {
            console.log(`✅ Auto-filling ${fieldName} with ${value}`);
            form.setValue(fieldName as keyof FormValues, value);
            newAutoFilledFields.add(fieldName);
          }
        });
        
        console.log('📝 New auto-filled fields:', newAutoFilledFields);
        setAutoFilledFields(newAutoFilledFields);
        
        // Update form data in context
        updateFormData('planning', dcpProposedData);
      }
    }
  }, [formData.development, form, updateFormData]);

  // Check compliance when form values change
  useEffect(() => {
    console.log('🔄 Compliance check useEffect triggered');
    const currentValues = form.getValues();
    console.log('📊 Current form values:', currentValues);
    const comments = generateComplianceComments(currentValues);
    console.log('📝 Generated compliance comments:', comments);
    setComplianceComments(comments);
  }, [form.watch('frontSetbackControl'), form.watch('frontSetbackProposed'), 
      form.watch('secondaryFrontSetbackControl'), form.watch('secondaryFrontSetbackProposed'),
      form.watch('rearSetbackGroundControl'), form.watch('rearSetbackGroundProposed'),
      form.watch('rearSetbackUpperControl'), form.watch('rearSetbackUpperProposed'),
      form.watch('sideSetbackNorthGroundControl'), form.watch('sideSetbackNorthGroundProposed'),
      form.watch('sideSetbackNorthUpperControl'), form.watch('sideSetbackNorthUpperProposed'),
      form.watch('sideSetbackSouthGroundControl'), form.watch('sideSetbackSouthGroundProposed'),
      form.watch('sideSetbackSouthUpperControl'), form.watch('sideSetbackSouthUpperProposed'),
      form.watch('siteCoverageControl'), form.watch('siteCoverageProposed'),
      form.watch('landscapedAreaControl'), form.watch('landscapedAreaProposed'),
      form.watch('parkingControl'), form.watch('parkingProposed')]);

  // Handle form submission
  const onSubmit = (data: FormValues) => {
    console.log('🎉 Form submitted successfully!');
    console.log('📊 Form data:', data);
    console.log('📊 LEP Additional controls:', data.lepAdditionalControls);
    console.log('📊 DCP Additional controls:', data.additionalControls);

    // Save form data to context
    updateFormData('planning', {
      zoning: data.zoning,
      landUsePermissibility: data.landUsePermissibility,
      lepName: data.lepName,
      lepCompliance: data.lepCompliance,
      heightControl: data.heightControl,
      heightProposed: data.heightProposed,
      heightCompliance: data.heightCompliance,
      fsrControl: data.fsrControl,
      fsrProposed: data.fsrProposed,
      fsrCompliance: data.fsrCompliance,
      dcpName: data.dcpName,
      dcpCompliance: data.dcpCompliance,
      frontSetbackControl: data.frontSetbackControl,
      frontSetbackProposed: data.frontSetbackProposed,
      frontSetbackCompliance: data.frontSetbackCompliance,
      secondaryFrontSetbackControl: data.secondaryFrontSetbackControl,
      secondaryFrontSetbackProposed: data.secondaryFrontSetbackProposed,
      secondaryFrontSetbackCompliance: data.secondaryFrontSetbackCompliance,
      rearSetbackGroundControl: data.rearSetbackGroundControl,
      rearSetbackGroundProposed: data.rearSetbackGroundProposed,
      rearSetbackGroundCompliance: data.rearSetbackGroundCompliance,
      rearSetbackUpperControl: data.rearSetbackUpperControl,
      rearSetbackUpperProposed: data.rearSetbackUpperProposed,
      rearSetbackUpperCompliance: data.rearSetbackUpperCompliance,
      sideSetbackNorthGroundControl: data.sideSetbackNorthGroundControl,
      sideSetbackNorthGroundProposed: data.sideSetbackNorthGroundProposed,
      sideSetbackNorthGroundCompliance: data.sideSetbackNorthGroundCompliance,
      sideSetbackNorthUpperControl: data.sideSetbackNorthUpperControl,
      sideSetbackNorthUpperProposed: data.sideSetbackNorthUpperProposed,
      sideSetbackNorthUpperCompliance: data.sideSetbackNorthUpperCompliance,
      sideSetbackSouthGroundControl: data.sideSetbackSouthGroundControl,
      sideSetbackSouthGroundProposed: data.sideSetbackSouthGroundProposed,
      sideSetbackSouthGroundCompliance: data.sideSetbackSouthGroundCompliance,
      sideSetbackSouthUpperControl: data.sideSetbackSouthUpperControl,
      sideSetbackSouthUpperProposed: data.sideSetbackSouthUpperProposed,
      sideSetbackSouthUpperCompliance: data.sideSetbackSouthUpperCompliance,
      siteCoverageControl: data.siteCoverageControl,
      siteCoverageProposed: data.siteCoverageProposed,
      siteCoverageCompliance: data.siteCoverageCompliance,
      landscapedAreaControl: data.landscapedAreaControl,
      landscapedAreaProposed: data.landscapedAreaProposed,
      landscapedAreaCompliance: data.landscapedAreaCompliance,
      parkingControl: data.parkingControl,
      parkingProposed: data.parkingProposed,
      parkingCompliance: data.parkingCompliance,
      seppBiodiversity: data.seppBiodiversity,
      seppBiodiversityTreeRemoval: data.seppBiodiversityTreeRemoval,
      seppResilience: data.seppResilience,
      seppBasix: data.seppBasix,
      seppTransport: data.seppTransport,
      seppTransportClassifiedRoad: data.seppTransportClassifiedRoad,
      seppHousing: data.seppHousing,
      seppHousingSecondaryDwelling: data.seppHousingSecondaryDwelling,
      secondaryDwellingFloorArea: data.secondaryDwellingFloorArea,
      maxFloorAreaByLEP: data.maxFloorAreaByLEP,
      additionalPlanning: data.additionalPlanning,
      additionalControls: data.additionalControls,
      lepAdditionalControls: data.lepAdditionalControls,
    });

    // Then navigate to the next step
    router.push(`/professionals/SoEE/form/environmental-factors?job=${jobId}`);
  };

  // Handle form submission errors
  const onError = (errors: any) => {
    console.error('❌ Form validation errors:', errors);
  };

  // Handle save draft functionality
  const handleSaveDraft = () => {
    console.log('💾 Save draft button clicked');
    const currentValues = form.getValues();
    console.log('📊 Current form values:', currentValues);

    // Save form data to context
    updateFormData('planning', {
      zoning: currentValues.zoning,
      landUsePermissibility: currentValues.landUsePermissibility,
      lepName: currentValues.lepName,
      lepCompliance: currentValues.lepCompliance,
      heightControl: currentValues.heightControl,
      heightProposed: currentValues.heightProposed,
      heightCompliance: currentValues.heightCompliance,
      fsrControl: currentValues.fsrControl,
      fsrProposed: currentValues.fsrProposed,
      fsrCompliance: currentValues.fsrCompliance,
      dcpName: currentValues.dcpName,
      dcpCompliance: currentValues.dcpCompliance,
      frontSetbackControl: currentValues.frontSetbackControl,
      frontSetbackProposed: currentValues.frontSetbackProposed,
      frontSetbackCompliance: currentValues.frontSetbackCompliance,
      secondaryFrontSetbackControl: currentValues.secondaryFrontSetbackControl,
      secondaryFrontSetbackProposed: currentValues.secondaryFrontSetbackProposed,
      secondaryFrontSetbackCompliance: currentValues.secondaryFrontSetbackCompliance,
      rearSetbackGroundControl: currentValues.rearSetbackGroundControl,
      rearSetbackGroundProposed: currentValues.rearSetbackGroundProposed,
      rearSetbackGroundCompliance: currentValues.rearSetbackGroundCompliance,
      rearSetbackUpperControl: currentValues.rearSetbackUpperControl,
      rearSetbackUpperProposed: currentValues.rearSetbackUpperProposed,
      rearSetbackUpperCompliance: currentValues.rearSetbackUpperCompliance,
      sideSetbackNorthGroundControl: currentValues.sideSetbackNorthGroundControl,
      sideSetbackNorthGroundProposed: currentValues.sideSetbackNorthGroundProposed,
      sideSetbackNorthGroundCompliance: currentValues.sideSetbackNorthGroundCompliance,
      sideSetbackNorthUpperControl: currentValues.sideSetbackNorthUpperControl,
      sideSetbackNorthUpperProposed: currentValues.sideSetbackNorthUpperProposed,
      sideSetbackNorthUpperCompliance: currentValues.sideSetbackNorthUpperCompliance,
      sideSetbackSouthGroundControl: currentValues.sideSetbackSouthGroundControl,
      sideSetbackSouthGroundProposed: currentValues.sideSetbackSouthGroundProposed,
      sideSetbackSouthGroundCompliance: currentValues.sideSetbackSouthGroundCompliance,
      sideSetbackSouthUpperControl: currentValues.sideSetbackSouthUpperControl,
      sideSetbackSouthUpperProposed: currentValues.sideSetbackSouthUpperProposed,
      sideSetbackSouthUpperCompliance: currentValues.sideSetbackSouthUpperCompliance,
      siteCoverageControl: currentValues.siteCoverageControl,
      siteCoverageProposed: currentValues.siteCoverageProposed,
      siteCoverageCompliance: currentValues.siteCoverageCompliance,
      landscapedAreaControl: currentValues.landscapedAreaControl,
      landscapedAreaProposed: currentValues.landscapedAreaProposed,
      landscapedAreaCompliance: currentValues.landscapedAreaCompliance,
      parkingControl: currentValues.parkingControl,
      parkingProposed: currentValues.parkingProposed,
      parkingCompliance: currentValues.parkingCompliance,
      seppBiodiversity: currentValues.seppBiodiversity,
      seppBiodiversityTreeRemoval: currentValues.seppBiodiversityTreeRemoval,
      seppResilience: currentValues.seppResilience,
      seppBasix: currentValues.seppBasix,
      seppTransport: currentValues.seppTransport,
      seppTransportClassifiedRoad: currentValues.seppTransportClassifiedRoad,
      seppHousing: currentValues.seppHousing,
      seppHousingSecondaryDwelling: currentValues.seppHousingSecondaryDwelling,
      secondaryDwellingFloorArea: currentValues.secondaryDwellingFloorArea,
      maxFloorAreaByLEP: currentValues.maxFloorAreaByLEP,
      additionalPlanning: currentValues.additionalPlanning,
    });

    // Save to localStorage
    saveDraft();
    console.log('Saving draft:', currentValues);
    console.log('LEP Additional controls:', currentValues.lepAdditionalControls);
    console.log('DCP Additional controls:', currentValues.additionalControls);
    // Show success message
  };

  // Add a new additional control
  const addAdditionalControl = () => {
    const currentControls = form.getValues('additionalControls') || [];
    form.setValue('additionalControls', [
      ...currentControls,
      { name: '', control: '', proposed: '' },
    ]);
  };

  // Remove an additional control
  const removeAdditionalControl = (index: number) => {
    const currentControls = form.getValues('additionalControls') || [];
    const updatedControls = currentControls.filter((_, i) => i !== index);
    form.setValue('additionalControls', updatedControls);
  };

  // Update an additional control
  const updateAdditionalControl = (index: number, field: string, value: string) => {
    const currentControls = form.getValues('additionalControls') || [];
    const updatedControls = [...currentControls];
    updatedControls[index] = { ...updatedControls[index], [field]: value };
    form.setValue('additionalControls', updatedControls);
  };

  // Add these functions after the existing additionalControl functions
  // Add a new LEP additional control
  const addLepAdditionalControl = () => {
    const currentControls = form.getValues('lepAdditionalControls') || [];
    form.setValue('lepAdditionalControls', [
      ...currentControls,
      { name: '', control: '', proposed: '' },
    ]);
  };

  // Remove a LEP additional control
  const removeLepAdditionalControl = (index: number) => {
    const currentControls = form.getValues('lepAdditionalControls') || [];
    const updatedControls = currentControls.filter((_, i) => i !== index);
    form.setValue('lepAdditionalControls', updatedControls);
  };

  // Update a LEP additional control
  const updateLepAdditionalControl = (index: number, field: string, value: string) => {
    const currentControls = form.getValues('lepAdditionalControls') || [];
    const updatedControls = [...currentControls];
    updatedControls[index] = { ...updatedControls[index], [field]: value };
    form.setValue('lepAdditionalControls', updatedControls);
  };

  // Helper component for input fields with auto-fill indicator
  const AutoFillInput = ({ 
    fieldName, 
    placeholder, 
    register, 
    error, 
    className = "" 
  }: {
    fieldName: string;
    placeholder: string;
    register: any;
    error?: any;
    className?: string;
  }) => {
    const isAutoFilled = autoFilledFields.has(fieldName);
    
    return (
      <div className="relative">
        <Input
          placeholder={placeholder}
          {...register}
          className={`${className} ${isAutoFilled ? 'border-green-500 bg-green-50' : ''}`}
        />
        {isAutoFilled && (
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
            <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
              Auto-filled
            </span>
          </div>
        )}
        {error && (
          <p className="text-sm text-red-500">{error.message}</p>
        )}
      </div>
    );
  };

  // Helper component for DCP proposed fields with compliance checking
  const DcpProposedInput = ({ 
    fieldName, 
    controlFieldName,
    placeholder, 
    register, 
    error, 
    className = "" 
  }: {
    fieldName: string;
    controlFieldName: string;
    placeholder: string;
    register: any;
    error?: any;
    className?: string;
  }) => {
    const isAutoFilled = autoFilledFields.has(fieldName);
    const currentValues = form.getValues();
    const isNonCompliant = !checkCompliance(
      currentValues[controlFieldName as keyof FormValues] as string,
      currentValues[fieldName as keyof FormValues] as string
    );
    
    return (
      <div className="relative">
        <Input
          placeholder={placeholder}
          {...register}
          className={`${className} ${
            isAutoFilled ? 'border-green-500 bg-green-50' : ''
          } ${
            isNonCompliant ? 'border-red-500 bg-red-50' : ''
          }`}
        />
        {isAutoFilled && (
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
            <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
              Auto-filled
            </span>
          </div>
        )}
        {isNonCompliant && (
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
            <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded">
              Non-compliant
            </span>
          </div>
        )}
        {error && (
          <p className="text-sm text-red-500">{error.message}</p>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-10 px-4 max-w-3xl">
        {/* Progress Bar */}
        <FormProgress currentStep={4} />

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Planning Controls Assessment</CardTitle>
            <CardDescription>
              Assess your development against relevant planning controls for your Statement of
              Environmental Effects
            </CardDescription>
            {isLoadingPropertyData && (
              <div className="flex items-center gap-2 text-sm text-blue-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                Loading property data...
              </div>
            )}
            {autoFilledFields.size > 0 && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <span>✓</span>
                Auto-filled {autoFilledFields.size} field{autoFilledFields.size > 1 ? 's' : ''} from property and development data
              </div>
            )}
            {complianceComments.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-red-600">
                <span>⚠</span>
                {complianceComments.length} non-compliance issue{complianceComments.length > 1 ? 's' : ''} detected
              </div>
            )}
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit, onError)} className="space-y-6">
              {/* SEPP Compliance */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">
                  State Environmental Planning Policies (SEPPs)
                </h3>

                {/* SEPP (Biodiversity) */}
                <div className="space-y-2 border p-4 rounded-md">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="seppBiodiversity"
                      checked={form.getValues('seppBiodiversity')}
                      onCheckedChange={checked => {
                        form.setValue('seppBiodiversity', checked === true);
                      }}
                    />
                    <Label htmlFor="seppBiodiversity" className="font-medium">
                      SEPP (Biodiversity)
                    </Label>
                  </div>

                  {form.watch('seppBiodiversity') && (
                    <div className="ml-6 mt-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="seppBiodiversityTreeRemoval"
                          checked={form.getValues('seppBiodiversityTreeRemoval')}
                          onCheckedChange={checked => {
                            form.setValue('seppBiodiversityTreeRemoval', checked === true);
                          }}
                        />
                        <Label htmlFor="seppBiodiversityTreeRemoval">Tree removal proposed</Label>
                      </div>

                      <div className="mt-2 p-3 bg-gray-50 rounded text-sm">
                        {form.watch('seppBiodiversityTreeRemoval')
                          ? 'The development proposes the removal of selected trees supported by an arborist who has no objections to their removal.'
                          : 'The development does not propose the removal of any significant trees on the site.'}
                      </div>
                    </div>
                  )}
                </div>

                {/* SEPP (Resilience and Hazards) */}
                <div className="space-y-2 border p-4 rounded-md">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="seppResilience"
                      checked={form.getValues('seppResilience')}
                      onCheckedChange={checked => {
                        form.setValue('seppResilience', checked === true);
                      }}
                      disabled
                    />
                    <Label htmlFor="seppResilience" className="font-medium">
                      SEPP (Resilience and Hazards)
                    </Label>
                    <span className="text-xs text-muted-foreground">(Always included)</span>
                  </div>

                  {form.watch('seppResilience') && (
                    <div className="mt-2 p-3 bg-gray-50 rounded text-sm">
                      The development has been assessed against the provisions of SEPP (Resilience
                      and Hazards) 2021. The site is not identified as being affected by land
                      contamination and the proposed development is not considered to present any
                      risk to human health or the environment.
                    </div>
                  )}
                </div>

                {/* SEPP (BASIX) */}
                <div className="space-y-2 border p-4 rounded-md">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="seppBasix"
                      checked={form.getValues('seppBasix')}
                      onCheckedChange={checked => {
                        form.setValue('seppBasix', checked === true);
                      }}
                      disabled
                    />
                    <Label htmlFor="seppBasix" className="font-medium">
                      SEPP (BASIX)
                    </Label>
                    <span className="text-xs text-muted-foreground">(Always included)</span>
                  </div>

                  {form.watch('seppBasix') && (
                    <div className="mt-2 p-3 bg-gray-50 rounded text-sm">
                      A BASIX Certificate has been submitted with the development application. The
                      proposal satisfies the commitments made in the BASIX Certificate and complies
                      with the requirements of SEPP (BASIX) 2004.
                    </div>
                  )}
                </div>

                {/* SEPP (Transport and Infrastructure) */}
                <div className="space-y-2 border p-4 rounded-md">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="seppTransport"
                      checked={form.getValues('seppTransport')}
                      onCheckedChange={checked => {
                        form.setValue('seppTransport', checked === true);
                      }}
                    />
                    <Label htmlFor="seppTransport" className="font-medium">
                      SEPP (Transport and Infrastructure)
                    </Label>
                  </div>

                  {form.watch('seppTransport') && (
                    <div className="ml-6 mt-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="seppTransportClassifiedRoad"
                          checked={form.getValues('seppTransportClassifiedRoad')}
                          onCheckedChange={checked => {
                            form.setValue('seppTransportClassifiedRoad', checked === true);
                          }}
                        />
                        <Label htmlFor="seppTransportClassifiedRoad">
                          Site has frontage to a classified road
                        </Label>
                      </div>

                      <div className="mt-2 p-3 bg-gray-50 rounded text-sm">
                        {form.watch('seppTransportClassifiedRoad') ? (
                          <>
                            <p className="mb-2">The site has a boundary to a classified road:</p>
                            <p className="mb-2">
                              • Clause 2.119 Development with frontage to classified road
                            </p>
                            <p className="mb-2">
                              (2) The consent authority must not grant consent to development on
                              land that has a frontage to a classified road unless it is satisfied
                              that—
                            </p>
                            <p className="mb-2">
                              (a) where practicable and safe, vehicular access to the land is
                              provided by a road other than the classified road, and
                            </p>
                            <p className="mb-2">
                              (b) the safety, efficiency and ongoing operation of the classified
                              road will not be adversely affected by the development as a result of—
                            </p>
                            <p className="mb-2">
                              (i) the design of the vehicular access to the land, or
                            </p>
                            <p className="mb-2">
                              (ii) the emission of smoke or dust from the development, or
                            </p>
                            <p className="mb-2">
                              (iii) the nature, volume or frequency of vehicles using the classified
                              road to gain access to the land, and
                            </p>
                            <p className="mb-2">
                              (c) the development is of a type that is not sensitive to traffic
                              noise or vehicle emissions, or is appropriately located and designed,
                              or includes measures, to ameliorate potential traffic noise or vehicle
                              emissions within the site of the development arising from the adjacent
                              classified road.
                            </p>
                            <p className="mb-2">
                              The development proposes a single driveway crossing with sufficient
                              area for vehicles to enter and exit in a forward direction, thereby
                              not affecting the efficiency and ongoing operation of the classified
                              road.
                            </p>
                            <p className="mb-2">
                              • Clause 2.120 Impact of road noise or vibration on non-road
                              development
                            </p>
                            <p className="mb-2">
                              (1) This clause applies to development for any of the following
                              purposes that is on land in or adjacent to the road corridor for a
                              freeway, a tollway or a transitway or any other road with an annual
                              average daily traffic volume of more than 20,000 vehicles (based on
                              the traffic volume data published on the website of TfNSW) and that
                              the consent authority considers is likely to be adversely affected by
                              road noise or vibration—
                            </p>
                            <p className="mb-2">(a) residential accommodation,</p>
                            <p className="mb-2">(b) a place of public worship,</p>
                            <p className="mb-2">(c) a hospital,</p>
                            <p className="mb-2">
                              (d) an educational establishment or centre-based child care facility.
                            </p>
                            <p className="mb-2">
                              As the proposal is for residential accommodation, this clause applies
                              as follows:
                            </p>
                            <p className="mb-2">
                              (3) If the development is for the purposes of residential
                              accommodation, the consent authority must not grant consent to the
                              development unless it is satisfied that appropriate measures will be
                              taken to ensure that the following LAeq levels are not exceeded—
                            </p>
                            <p className="mb-2">
                              (a) in any bedroom in the residential accommodation—35 dB(A) at any
                              time between 10 pm and 7 am,
                            </p>
                            <p className="mb-2">
                              (b) anywhere else in the residential accommodation (other than a
                              garage, kitchen, bathroom or hallway)—40 dB(A) at any time.
                            </p>
                            <p>
                              Appropriate mitigation measures can be put in place for the proposed
                              development so that the level of noise intrusion into the proposed new
                              residential type developments will meet the internal noise design
                              goals derived from Clause 120 of the SEPP. Through the implementation
                              of appropriate conditions of consent, it is considered that the
                              requirements of Clause 120 will be met accordingly.
                            </p>
                          </>
                        ) : (
                          'The site is not fronting or adjacent to a classified road, rail corridor or within the vicinity of a telecommunications structure requiring consideration under the SEPP.'
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* SEPP (Housing) */}
                <div className="space-y-2 border p-4 rounded-md">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="seppHousing"
                      checked={form.getValues('seppHousing')}
                      onCheckedChange={checked => {
                        form.setValue('seppHousing', checked === true);
                      }}
                    />
                    <Label htmlFor="seppHousing" className="font-medium">
                      SEPP (Housing) 2021
                    </Label>
                  </div>

                  {form.watch('seppHousing') && (
                    <div className="ml-6 mt-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="seppHousingSecondaryDwelling"
                          checked={form.getValues('seppHousingSecondaryDwelling')}
                          onCheckedChange={checked => {
                            form.setValue('seppHousingSecondaryDwelling', checked === true);
                          }}
                        />
                        <Label htmlFor="seppHousingSecondaryDwelling">
                          Secondary dwelling provisions apply
                        </Label>
                      </div>

                      {form.watch('seppHousingSecondaryDwelling') && (
                        <div className="mt-2 space-y-3">
                          <div className="space-y-2">
                            <Label htmlFor="secondaryDwellingFloorArea">
                              Secondary Dwelling Floor Area (m²)
                            </Label>
                            <Input
                              id="secondaryDwellingFloorArea"
                              placeholder="e.g. 46"
                              {...form.register('secondaryDwellingFloorArea')}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="maxFloorAreaByLEP">
                              Maximum Floor Area Permitted by LEP (if specified)
                            </Label>
                            <Input
                              id="maxFloorAreaByLEP"
                              placeholder="e.g. 60 or leave blank if not specified"
                              {...form.register('maxFloorAreaByLEP')}
                            />
                            <p className="text-xs text-muted-foreground">
                              Leave blank if your LEP doesn't specify a maximum floor area for
                              secondary dwellings
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="mt-2 p-3 bg-gray-50 rounded text-sm">
                        <p className="mb-2">
                          State Environmental Planning Policy (Housing) 2021 (Housing SEPP)
                          incentivizes the supply of affordable and diverse housing in the right
                          places and for every stage of life.
                        </p>

                        {form.watch('seppHousingSecondaryDwelling') ? (
                          <>
                            <p className="font-medium mb-2">
                              Chapter 3 Diverse housing - Part 1 Secondary dwellings
                            </p>

                            <p className="mb-2">Division 1 Preliminary</p>
                            <p className="mb-2">
                              49 & 50. The development is for a secondary dwelling in zone{' '}
                              {form.watch('zoning')}. {form.watch('lepName')} permits dwelling
                              houses in the zone.
                            </p>
                            <p className="mb-2">51. No subdivision is being sought.</p>

                            <p className="mb-2">
                              Division 2 Secondary dwellings permitted with consent
                            </p>
                            <p className="mb-2">
                              52. (1) Consent is being sought through this Development Application.
                            </p>
                            <p className="mb-2">
                              52. (a) The development would not result in more than the principal
                              dwelling and the secondary dwelling on the property and
                            </p>
                            <p className="mb-2">
                              52. (b) The total floor area of the principal dwelling and the
                              secondary dwelling is no more than the maximum floor area permitted
                              for a dwelling house permitted by{' '}
                              {form.watch('lepName')?.split(' ').pop() || ''}{' '}
                              {form.watch('maxFloorAreaByLEP')
                                ? `(${form.watch('maxFloorAreaByLEP')}m²)`
                                : '(none identified)'}
                              .
                            </p>
                            <p className="mb-2">
                              52. (c) The total floor area of the secondary dwelling permitted by{' '}
                              {form.watch('lepName')?.split(' ').pop() || ''} is{' '}
                              {form.watch('maxFloorAreaByLEP') || '60'}m² or 25% of the total floor
                              area of the principal dwelling, whichever is the greater. The
                              secondary dwelling proposes a floor area of{' '}
                              {form.watch('secondaryDwellingFloorArea') || '[Floor Area]'}m².
                            </p>

                            <p className="mb-2">
                              53. (2) The development is for a detached secondary dwelling and the
                              site is greater than 450sqm (500.9sqm). No additional parking has been
                              provided on site and the secondary dwelling does not reduce the number
                              of parking spaces on the site.
                            </p>
                          </>
                        ) : (
                          <p>
                            The development does not involve a secondary dwelling or other
                            provisions of the Housing SEPP.
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* LEP Compliance - General */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-medium">Local Environmental Plan (LEP) Compliance</h3>
                  {/* Removed Popover as per edit hint */}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lepName">LEP Name</Label>
                  <AutoFillInput
                    fieldName="lepName"
                    placeholder="e.g. Cumberland Local Environmental Plan 2021"
                    register={form.register('lepName')}
                    error={form.formState.errors.lepName}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lepCompliance">General LEP Compliance</Label>
                  <Textarea
                    id="lepCompliance"
                    placeholder="Describe how your development complies with the LEP"
                    rows={2}
                    {...form.register('lepCompliance')}
                  />
                  {form.formState.errors.lepCompliance && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.lepCompliance.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Zoning and Permissibility */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-medium">Zoning and Permissibility</h3>
                  {/* Removed Popover as per edit hint */}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zoning">Zoning</Label>
                  <AutoFillInput
                    fieldName="zoning"
                    placeholder="e.g. R2 Low Density Residential"
                    register={form.register('zoning')}
                    error={form.formState.errors.zoning}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="landUsePermissibility">Land Use Permissibility</Label>
                  <Textarea
                    id="landUsePermissibility"
                    placeholder="Describe how your development is permitted in the zone"
                    rows={2}
                    {...form.register('landUsePermissibility')}
                  />
                  {form.formState.errors.landUsePermissibility && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.landUsePermissibility.message}
                    </p>
                  )}
                </div>
              </div>

              {/* LEP Development Standards */}
              <div className="space-y-2">
                <h4 className="font-medium">LEP Development Standards</h4>
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-1/3">Control</TableHead>
                        <TableHead className="w-1/3">Requirement</TableHead>
                        <TableHead className="w-1/3">Proposed</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {/* Height of Buildings */}
                      <TableRow>
                        <TableCell className="font-medium">Height of Buildings</TableCell>
                        <TableCell>
                          <div className="relative">
                            <Input
                              id="heightControl"
                              placeholder="e.g. 8.5m"
                              {...form.register('heightControl')}
                              className={autoFilledFields.has('heightControl') ? 'border-green-500 bg-green-50' : ''}
                            />
                            {autoFilledFields.has('heightControl') && (
                              <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                                <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                                  Auto-filled
                                </span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Input
                            id="heightProposed"
                            placeholder="e.g. 7.2m"
                            {...form.register('heightProposed')}
                          />
                        </TableCell>
                      </TableRow>

                      {/* Floor Space Ratio */}
                      <TableRow>
                        <TableCell className="font-medium">Floor Space Ratio</TableCell>
                        <TableCell>
                          <div className="relative">
                            <Input
                              id="fsrControl"
                              placeholder="e.g. 0.5:1"
                              {...form.register('fsrControl')}
                              className={autoFilledFields.has('fsrControl') ? 'border-green-500 bg-green-50' : ''}
                            />
                            {autoFilledFields.has('fsrControl') && (
                              <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                                <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                                  Auto-filled
                                </span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Input
                            id="fsrProposed"
                            placeholder="e.g. 0.5:1"
                            {...form.register('fsrProposed')}
                          />
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Additional LEP Controls */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Additional LEP Controls (if applicable)</h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addLepAdditionalControl}
                    className="flex items-center gap-1"
                  >
                    <Plus className="h-4 w-4" /> Add Control
                  </Button>
                </div>

                {(form.watch('lepAdditionalControls') || [])?.length > 0 && (
                  <div className="border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-1/3">Control Name</TableHead>
                          <TableHead className="w-1/3">Requirement</TableHead>
                          <TableHead className="w-1/3">Proposed</TableHead>
                          <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(form.watch('lepAdditionalControls') || [])?.map((control, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <Input
                                placeholder="e.g. Minimum Lot Size"
                                value={control.name}
                                onChange={e =>
                                  updateLepAdditionalControl(index, 'name', e.target.value)
                                }
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                placeholder="e.g. 450m²"
                                value={control.control}
                                onChange={e =>
                                  updateLepAdditionalControl(index, 'control', e.target.value)
                                }
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                placeholder="e.g. 500m²"
                                value={control.proposed}
                                onChange={e =>
                                  updateLepAdditionalControl(index, 'proposed', e.target.value)
                                }
                              />
                            </TableCell>
                            <TableCell>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeLepAdditionalControl(index)}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>

              {/* DCP Compliance */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-medium">Development Control Plan (DCP) Compliance</h3>
                  {/* Removed Popover as per edit hint */}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dcpName">DCP Name</Label>
                  <AutoFillInput
                    fieldName="dcpName"
                    placeholder="e.g. Cumberland Development Control Plan 2021"
                    register={form.register('dcpName')}
                    error={form.formState.errors.dcpName}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dcpCompliance">General DCP Compliance</Label>
                  <Textarea
                    id="dcpCompliance"
                    placeholder="Describe how your development complies with the DCP"
                    rows={2}
                    {...form.register('dcpCompliance')}
                  />
                  {form.formState.errors.dcpCompliance && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.dcpCompliance.message}
                    </p>
                  )}
                </div>

                {/* DCP Development Standards Table */}
                <div className="space-y-2">
                  <h4 className="font-medium">DCP Development Standards</h4>
                  <div className="border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-1/3">Control</TableHead>
                          <TableHead className="w-1/3">Requirement</TableHead>
                          <TableHead className="w-1/3">Proposed</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {/* Front Setback */}
                        <TableRow>
                          <TableCell className="font-medium">Front Setback</TableCell>
                          <TableCell>
                            <Input
                              id="frontSetbackControl"
                              placeholder="e.g. 6m minimum"
                              {...form.register('frontSetbackControl')}
                            />
                          </TableCell>
                          <TableCell>
                            <DcpProposedInput
                              fieldName="frontSetbackProposed"
                              controlFieldName="frontSetbackControl"
                              placeholder="e.g. 6.5m"
                              register={form.register('frontSetbackProposed')}
                              error={form.formState.errors.frontSetbackProposed}
                            />
                          </TableCell>
                        </TableRow>

                        {/* Secondary Front Setback (if applicable) */}
                        <TableRow>
                          <TableCell className="font-medium">
                            Secondary Front Setback (if corner lot)
                          </TableCell>
                          <TableCell>
                            <Input
                              id="secondaryFrontSetbackControl"
                              placeholder="e.g. 3m minimum"
                              {...form.register('secondaryFrontSetbackControl')}
                            />
                          </TableCell>
                          <TableCell>
                            <DcpProposedInput
                              fieldName="secondaryFrontSetbackProposed"
                              controlFieldName="secondaryFrontSetbackControl"
                              placeholder="e.g. 3.5m or N/A"
                              register={form.register('secondaryFrontSetbackProposed')}
                              error={form.formState.errors.secondaryFrontSetbackProposed}
                            />
                          </TableCell>
                        </TableRow>

                        {/* Rear Setback - Ground Floor */}
                        <TableRow>
                          <TableCell className="font-medium">Rear Setback (Ground Floor)</TableCell>
                          <TableCell>
                            <Input
                              id="rearSetbackGroundControl"
                              placeholder="e.g. 6m minimum"
                              {...form.register('rearSetbackGroundControl')}
                            />
                          </TableCell>
                          <TableCell>
                            <DcpProposedInput
                              fieldName="rearSetbackGroundProposed"
                              controlFieldName="rearSetbackGroundControl"
                              placeholder="e.g. 8.0m"
                              register={form.register('rearSetbackGroundProposed')}
                              error={form.formState.errors.rearSetbackGroundProposed}
                            />
                          </TableCell>
                        </TableRow>

                        {/* Rear Setback - Upper Floor */}
                        <TableRow>
                          <TableCell className="font-medium">Rear Setback (Upper Floor)</TableCell>
                          <TableCell>
                            <Input
                              id="rearSetbackUpperControl"
                              placeholder="e.g. 8m minimum"
                              {...form.register('rearSetbackUpperControl')}
                            />
                          </TableCell>
                          <TableCell>
                            <DcpProposedInput
                              fieldName="rearSetbackUpperProposed"
                              controlFieldName="rearSetbackUpperControl"
                              placeholder="e.g. 10.0m"
                              register={form.register('rearSetbackUpperProposed')}
                              error={form.formState.errors.rearSetbackUpperProposed}
                            />
                          </TableCell>
                        </TableRow>

                        {/* Side Setback - North Ground Floor */}
                        <TableRow>
                          <TableCell className="font-medium">
                            Side Setback - North (Ground Floor)
                          </TableCell>
                          <TableCell>
                            <Input
                              id="sideSetbackNorthGroundControl"
                              placeholder="e.g. 0.9m minimum"
                              {...form.register('sideSetbackNorthGroundControl')}
                            />
                          </TableCell>
                          <TableCell>
                            <DcpProposedInput
                              fieldName="sideSetbackNorthGroundProposed"
                              controlFieldName="sideSetbackNorthGroundControl"
                              placeholder="e.g. 1.5m"
                              register={form.register('sideSetbackNorthGroundProposed')}
                              error={form.formState.errors.sideSetbackNorthGroundProposed}
                            />
                          </TableCell>
                        </TableRow>

                        {/* Side Setback - North Upper Floor */}
                        <TableRow>
                          <TableCell className="font-medium">
                            Side Setback - North (Upper Floor)
                          </TableCell>
                          <TableCell>
                            <Input
                              id="sideSetbackNorthUpperControl"
                              placeholder="e.g. 1.2m minimum"
                              {...form.register('sideSetbackNorthUpperControl')}
                            />
                          </TableCell>
                          <TableCell>
                            <DcpProposedInput
                              fieldName="sideSetbackNorthUpperProposed"
                              controlFieldName="sideSetbackNorthUpperControl"
                              placeholder="e.g. 1.5m"
                              register={form.register('sideSetbackNorthUpperProposed')}
                              error={form.formState.errors.sideSetbackNorthUpperProposed}
                            />
                          </TableCell>
                        </TableRow>

                        {/* Side Setback - South Ground Floor */}
                        <TableRow>
                          <TableCell className="font-medium">
                            Side Setback - South (Ground Floor)
                          </TableCell>
                          <TableCell>
                            <Input
                              id="sideSetbackSouthGroundControl"
                              placeholder="e.g. 0.9m minimum"
                              {...form.register('sideSetbackSouthGroundControl')}
                            />
                          </TableCell>
                          <TableCell>
                            <DcpProposedInput
                              fieldName="sideSetbackSouthGroundProposed"
                              controlFieldName="sideSetbackSouthGroundControl"
                              placeholder="e.g. 1.0m"
                              register={form.register('sideSetbackSouthGroundProposed')}
                              error={form.formState.errors.sideSetbackSouthGroundProposed}
                            />
                          </TableCell>
                        </TableRow>

                        {/* Side Setback - South Upper Floor */}
                        <TableRow>
                          <TableCell className="font-medium">
                            Side Setback - South (Upper Floor)
                          </TableCell>
                          <TableCell>
                            <Input
                              id="sideSetbackSouthUpperControl"
                              placeholder="e.g. 1.2m minimum"
                              {...form.register('sideSetbackSouthUpperControl')}
                            />
                          </TableCell>
                          <TableCell>
                            <DcpProposedInput
                              fieldName="sideSetbackSouthUpperProposed"
                              controlFieldName="sideSetbackSouthUpperControl"
                              placeholder="e.g. 1.2m"
                              register={form.register('sideSetbackSouthUpperProposed')}
                              error={form.formState.errors.sideSetbackSouthUpperProposed}
                            />
                          </TableCell>
                        </TableRow>

                        {/* Site Coverage */}
                        <TableRow>
                          <TableCell className="font-medium">Site Coverage</TableCell>
                          <TableCell>
                            <Input
                              id="siteCoverageControl"
                              placeholder="e.g. 50% maximum"
                              {...form.register('siteCoverageControl')}
                            />
                          </TableCell>
                          <TableCell>
                            <DcpProposedInput
                              fieldName="siteCoverageProposed"
                              controlFieldName="siteCoverageControl"
                              placeholder="e.g. 40%"
                              register={form.register('siteCoverageProposed')}
                              error={form.formState.errors.siteCoverageProposed}
                            />
                          </TableCell>
                        </TableRow>

                        {/* Landscaped Area */}
                        <TableRow>
                          <TableCell className="font-medium">Landscaped Area</TableCell>
                          <TableCell>
                            <Input
                              id="landscapedAreaControl"
                              placeholder="e.g. 35% minimum"
                              {...form.register('landscapedAreaControl')}
                            />
                          </TableCell>
                          <TableCell>
                            <DcpProposedInput
                              fieldName="landscapedAreaProposed"
                              controlFieldName="landscapedAreaControl"
                              placeholder="e.g. 36%"
                              register={form.register('landscapedAreaProposed')}
                              error={form.formState.errors.landscapedAreaProposed}
                            />
                          </TableCell>
                        </TableRow>

                        {/* Car Parking */}
                        <TableRow>
                          <TableCell className="font-medium">Car Parking</TableCell>
                          <TableCell>
                            <Input
                              id="parkingControl"
                              placeholder="e.g. 2 spaces minimum"
                              {...form.register('parkingControl')}
                            />
                          </TableCell>
                          <TableCell>
                            <DcpProposedInput
                              fieldName="parkingProposed"
                              controlFieldName="parkingControl"
                              placeholder="e.g. 2 spaces"
                              register={form.register('parkingProposed')}
                              error={form.formState.errors.parkingProposed}
                            />
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* Compliance Comments */}
                {complianceComments.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-red-600">Non-Compliance Issues</h4>
                    <div className="bg-red-50 border border-red-200 rounded-md p-4">
                      <p className="text-sm text-red-800 mb-2">
                        The following items require variation applications:
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-sm text-red-700">
                        {complianceComments.map((comment, index) => (
                          <li key={index}>{comment}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Additional Controls */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Additional Controls (if applicable)</h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addAdditionalControl}
                      className="flex items-center gap-1"
                    >
                      <Plus className="h-4 w-4" /> Add Control
                    </Button>
                  </div>

                  {(form.watch('additionalControls') || [])?.length > 0 && (
                    <div className="border rounded-md">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-1/3">Control Name</TableHead>
                            <TableHead className="w-1/3">Requirement</TableHead>
                            <TableHead className="w-1/3">Proposed</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {(form.watch('additionalControls') || [])?.map((control, index) => (
                            <TableRow key={index}>
                              <TableCell>
                                <Input
                                  placeholder="e.g. Private Open Space"
                                  value={control.name}
                                  onChange={e =>
                                    updateAdditionalControl(index, 'name', e.target.value)
                                  }
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  placeholder="e.g. 24m² minimum"
                                  value={control.control}
                                  onChange={e =>
                                    updateAdditionalControl(index, 'control', e.target.value)
                                  }
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  placeholder="e.g. 30m²"
                                  value={control.proposed}
                                  onChange={e =>
                                    updateAdditionalControl(index, 'proposed', e.target.value)
                                  }
                                />
                              </TableCell>
                              <TableCell>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeAdditionalControl(index)}
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Planning Considerations */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Additional Planning Considerations</h3>
                <div className="space-y-2">
                  <Label htmlFor="additionalPlanning">Additional Information</Label>
                  <Textarea
                    id="additionalPlanning"
                    placeholder="Provide any additional planning information not covered above"
                    rows={4}
                    {...form.register('additionalPlanning')}
                  />
                  <p className="text-sm text-muted-foreground">
                    Include any other relevant planning considerations such as Section 7.11
                    contributions, planning agreements, etc.
                  </p>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button 
                  variant="outline" 
                  type="button" 
                  className="gap-2"
                  onClick={() => {
                    console.log('Back button clicked');
                    router.push(`/professionals/SoEE/form/development-details?job=${jobId}`);
                  }}
                >
                  <ArrowLeft className="h-4 w-4" /> Back
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    type="button"
                    className="gap-2"
                    onClick={() => {
                      console.log('Save draft button clicked');
                      handleSaveDraft();
                    }}
                  >
                    <Save className="h-4 w-4" /> Save Draft
                  </Button>
                  <Button type="submit" className="gap-2">
                    Next <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
