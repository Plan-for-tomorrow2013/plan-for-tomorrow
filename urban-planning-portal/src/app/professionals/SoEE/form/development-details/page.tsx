'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@shared/components/ui/card';
import { ArrowLeft, ArrowRight, Save, Loader2 } from 'lucide-react';
import { FormProgress } from '@/app/professionals/SoEE/components/form-progress';
import Link from 'next/link';
import { DetailedDevelopmentDetails } from '@shared/components/DetailedDevelopmentDetails';
import { useFormData } from '@/app/professionals/SoEE/lib/form-context';
import { DevelopmentDetails } from '@shared/types/development-details';
import { Job } from '@shared/types/jobs';
import { useEffect, useState, useMemo } from 'react';
import { toast } from '@shared/components/ui/use-toast';
import { shouldUpdateCalculations, updateDevelopmentDetailsWithCalculations } from "@shared/utils/development-calculations";

// Add normalization helper (same pattern as property-details page)
function normalizeDevelopmentDetails(data: any): DevelopmentDetails {
  return {
    // Development Description
    developmentDescription: data?.developmentDescription || '',
    
    // Demolition
    demolitionRequired: data?.demolitionRequired ?? false,
    demolitionDetails: data?.demolitionDetails || '',
    
    // Construction
    storeys: data?.storeys || '',
    buildingHeight: data?.buildingHeight || '',
    wallHeight: data?.wallHeight || '',
    
    // Setbacks
    frontSetback: data?.frontSetback || '',
    secondaryFrontSetback: data?.secondaryFrontSetback || '',
    rearSetbackGround: data?.rearSetbackGround || '',
    rearSetbackUpper: data?.rearSetbackUpper || '',
    sideSetbackGroundOne: data?.sideSetbackGroundOne || '',
    sideSetbackGroundTwo: data?.sideSetbackGroundTwo || '',
    sideSetbackUpperOne: data?.sideSetbackUpperOne || '',
    sideSetbackUpperTwo: data?.sideSetbackUpperTwo || '',
    garageSetback: data?.garageSetback || '',
    
    // Floor Area
    existingGFA: data?.existingGFA || '',
    proposedGFA: data?.proposedGFA || '',
    totalGFA: data?.totalGFA || '',
    floorSpaceRatio: data?.floorSpaceRatio || '',
    
    // Site Coverage
    existingSiteCoverage: data?.existingSiteCoverage || '',
    proposedSiteCoverage: data?.proposedSiteCoverage || '',
    
    // Landscaping
    existingLandscapedArea: data?.existingLandscapedArea || '',
    proposedLandscapedArea: data?.proposedLandscapedArea || '',
    landscapedAreaPercentage: data?.landscapedAreaPercentage || '',
    
    // Deep soil
    existingDeepSoilArea: data?.existingDeepSoilArea || '',
    proposedDeepSoilArea: data?.proposedDeepSoilArea || '',
    deepSoilAreaPercentage: data?.deepSoilAreaPercentage || '',
    
    // Private open space
    existingPrivateOpenSpaceArea: data?.existingPrivateOpenSpaceArea || '',
    proposedPrivateOpenSpaceArea: data?.proposedPrivateOpenSpaceArea || '',
    
    // Excavation and Fill
    maxCut: data?.maxCut || '',
    maxFill: data?.maxFill || '',
    
    // Materials and Finishes
    externalWalls: data?.externalWalls || '',
    roof: data?.roof || '',
    windows: data?.windows || '',
    otherMaterials: data?.otherMaterials || '',
    
    // Access and Parking
    vehicleAccess: data?.vehicleAccess || '',
    carParkingSpaces: data?.carParkingSpaces || '',
    pedestrianAccess: data?.pedestrianAccess || '',
    
    // Stormwater
    stormwaterDisposal: data?.stormwaterDisposal || '',
    
    // Waste Management
    wasteManagement: data?.wasteManagement || '',
  };
}

export default function DevelopmentDetailsPageWrapper() {
  const searchParams = useSearchParams();
  const jobId = searchParams.get('job');
  if (!jobId) {
    return <div className="p-10 text-center">No job ID provided.</div>;
  }
  return <DevelopmentDetailsPage jobId={jobId} />;
}

function DevelopmentDetailsPage({ jobId }: { jobId: string }) {
  const router = useRouter();
  const [jobData, setJobData] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const { formData, updateFormData } = useFormData();

  // Get development details from FormContext (like property-details page)
  const developmentDetailsData = useMemo(() => normalizeDevelopmentDetails(formData.development), [formData.development]);

  // Calculate totalGFA, floorSpaceRatio, landscapedAreaPercentage, and deepSoilAreaPercentage automatically
  useEffect(() => {
    if (developmentDetailsData) {
      const inputs = {
        existingGFA: developmentDetailsData.existingGFA || '0',
        proposedGFA: developmentDetailsData.proposedGFA || '0',
        proposedLandscapedArea: developmentDetailsData.proposedLandscapedArea || '0',
        proposedDeepSoilArea: developmentDetailsData.proposedDeepSoilArea || '0',
        siteArea: formData.property.siteArea || '0',
      };
      if (shouldUpdateCalculations(developmentDetailsData, inputs)) {
        const updatedData = updateDevelopmentDetailsWithCalculations(developmentDetailsData, inputs);
        updateFormData('development', updatedData);
        setHasUnsavedChanges(true);
      }
    }
  }, [
    formData.development.existingGFA,
    formData.development.proposedGFA,
    formData.development.proposedLandscapedArea,
    formData.development.proposedDeepSoilArea,
    formData.property.siteArea,
    updateFormData
  ]);

  // Fetch job data to get development details (for initial load from server)
  useEffect(() => {
    const fetchJobData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/jobs/${jobId}`);
        if (response.ok) {
          const data = await response.json();
          setJobData(data);

          // Only update FormContext if we don't already have development data
          if (!formData.development.developmentDescription && data.formData?.development) {
            updateFormData('development', normalizeDevelopmentDetails(data.formData.development));
          }
        }
      } catch (error) {
        console.error('Error fetching job data:', error);
        setError('Failed to load job data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobData();
  }, [jobId, updateFormData]);

  // Handler for when data changes in the child component (like property-details page)
  const handleDevelopmentDetailsChange = (newData: DevelopmentDetails) => {
    updateFormData('development', newData);
    setHasUnsavedChanges(true);
    // Clear save status if user makes changes after a save
    if (saveStatus === 'success' || saveStatus === 'error') {
      setSaveStatus('idle');
    }
  };

  // Save handler for development details (like property-details page)
  const handleSaveDevelopmentDetails = async () => {
    if (!developmentDetailsData) return;

    setSaveStatus('saving');
    setError(null);
    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          formData: {
            ...jobData?.formData,
            development: developmentDetailsData
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to save development details');
      }

      setSaveStatus('success');
      setHasUnsavedChanges(false);
      toast({ title: 'Success', description: 'Development details saved successfully.' });

      setTimeout(() => {
        setSaveStatus(currentStatus => (currentStatus === 'success' ? 'idle' : currentStatus));
      }, 3000);
    } catch (error) {
      console.error('Error saving development details:', error);
      setSaveStatus('error');
      const errorMessage = error instanceof Error ? error.message : 'Failed to save development details';
      setError(errorMessage);
      toast({ title: 'Error', description: errorMessage, variant: 'destructive' });
    }
  };

  // Handle form submission
  const onSubmit = async () => {
    try {
      // Save the development details
      await handleSaveDevelopmentDetails();

      // Navigate to the next step
      router.push(`/professionals/SoEE/form/planning?job=${jobId}`);
    } catch (error) {
      console.error('Error saving form data:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-10">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        <span className="ml-2">Loading development details...</span>
      </div>
    );
  }

  if (error) {
    return <div className="p-10 text-center text-red-500">Error: {error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-10 px-4 max-w-4xl">
        {/* Progress Bar */}
        <FormProgress currentStep={3} />

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Development Details</CardTitle>
            <CardDescription>
              Describe the proposed development for your Statement of Environmental Effects
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DetailedDevelopmentDetails
              developmentDetails={developmentDetailsData}
              onDevelopmentDetailsChange={handleDevelopmentDetailsChange}
              isLoading={isLoading}
            />

            {/* Action Buttons */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t">
              <Link href={`/professionals/SoEE/form/property-details?job=${jobId}`}>
                <Button variant="outline" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Previous
                </Button>
              </Link>

              <div className="flex gap-4">
                <Button
                  onClick={handleSaveDevelopmentDetails}
                  disabled={isLoading || !hasUnsavedChanges}
                  className="flex items-center gap-2"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {isLoading ? 'Saving...' : 'Save Draft'}
                </Button>

                <Button onClick={onSubmit} className="flex items-center gap-2">
                  Next
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
