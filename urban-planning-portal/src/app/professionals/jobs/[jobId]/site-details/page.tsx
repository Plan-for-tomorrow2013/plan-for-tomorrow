'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Check, Loader2 } from 'lucide-react';
import { Button } from '@shared/components/ui/button';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from '@shared/components/ui/alert';
import { DetailedSiteDetails } from '@shared/components/DetailedSiteDetails';
import { SiteDetails } from '@shared/types/site-details';
import { toast } from '@shared/components/ui/use-toast'; // Import toast

// Add normalization helper
function normalizeSiteDetails(data: any): SiteDetails {
  return {
    // Site Characteristics
    lotType: data?.lotType || '',
    siteArea: data?.siteArea || '',
    primaryStreetWidth: data?.primaryStreetWidth || '',
    siteDepth: data?.siteDepth || '',
    secondaryStreetWidth: data?.secondaryStreetWidth || '',
    gradient: data?.gradient || '',
    highestRL: data?.highestRL || '',
    lowestRL: data?.lowestRL || '',
    fallAmount: data?.fallAmount || '',

    // Existing Development
    currentLandUse: data?.currentLandUse || '',
    existingDevelopmentDetails: data?.existingDevelopmentDetails || '',

    // Surrounding Development
    northDevelopment: data?.northDevelopment || '',
    southDevelopment: data?.southDevelopment || '',
    eastDevelopment: data?.eastDevelopment || '',
    westDevelopment: data?.westDevelopment || '',

    // Site Constraints
    bushfireProne: data?.bushfireProne ?? false,
    floodProne: data?.floodProne ?? false,
    acidSulfateSoils: data?.acidSulfateSoils ?? false,
    biodiversity: data?.biodiversity ?? false,
    salinity: data?.salinity ?? false,
    landslip: data?.landslip ?? false,
    heritage: data?.heritage || '',
    otherConstraints: data?.otherConstraints || '',
  };
}

export default function SiteDetailsPage({ params }: { params: { jobId: string } }) {
  const router = useRouter();
  const [siteDetailsData, setSiteDetailsData] = useState<SiteDetails | null>(null); // State to hold the form data
  const [isLoading, setIsLoading] = useState(true); // Loading state for initial fetch
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Fetch initial data
  useEffect(() => {
    const fetchSiteDetails = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch the whole job data first
        const response = await fetch(`/api/jobs/${params.jobId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch job data');
        }
        const jobData = await response.json();
        // Set the site details state from the job data
        setSiteDetailsData(normalizeSiteDetails(jobData.siteDetails));
      } catch (err) {
        console.error('Error fetching site details:', err);
        setError(err instanceof Error ? err.message : 'Failed to load site details');
        setSiteDetailsData(normalizeSiteDetails({}));
      } finally {
        setIsLoading(false);
      }
    };

    fetchSiteDetails();
  }, [params.jobId]);

  // Handler for when data changes in the child component
  const handleDataChange = (newData: SiteDetails) => {
    setSiteDetailsData(newData);
    setHasUnsavedChanges(true);
    // Clear save status if user makes changes after a save
    if (saveStatus === 'success' || saveStatus === 'error') {
      setSaveStatus('idle');
    }
  };

  // Save handler using the correct API endpoint and method
  const handleSave = async () => {
    if (!siteDetailsData) return; // Don't save if data is null

    setSaveStatus('saving');
    setError(null);
    try {
      // Use PATCH on the main job endpoint to update siteDetails
      const response = await fetch(`/api/jobs/${params.jobId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        // Send only the siteDetails part
        body: JSON.stringify({ siteDetails: siteDetailsData }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({})); // Try to parse error response
        throw new Error(errorData.error || 'Failed to save site details');
      }

      setSaveStatus('success');
      setHasUnsavedChanges(false); // Mark changes as saved
      toast({ title: 'Success', description: 'Site details saved successfully.' });

      // Optionally reset success status after a delay
      setTimeout(() => {
        // Check if still success before resetting, in case another save started
        setSaveStatus(currentStatus => (currentStatus === 'success' ? 'idle' : currentStatus));
      }, 3000);
    } catch (error) {
      console.error('Error saving site details:', error);
      setSaveStatus('error');
      const errorMessage = error instanceof Error ? error.message : 'Failed to save site details';
      setError(errorMessage);
      toast({ title: 'Error', description: errorMessage, variant: 'destructive' });
    }
  };

  // Remove the old local storage save handler and effects

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            className="p-2"
            onClick={() => {
              if (hasUnsavedChanges) {
                const shouldLeave = window.confirm(
                  'You have unsaved changes. Do you want to leave without saving?'
                );
                if (!shouldLeave) return;
              }
              router.back();
            }}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-semibold text-[#323A40]">Site Details</h1>
        </div>
        {/* Update button to call handleSave */}
        {hasUnsavedChanges && (
          <Button onClick={handleSave} disabled={saveStatus === 'saving'}>
            {saveStatus === 'saving' ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        )}
      </div>

      {error &&
        saveStatus === 'error' && ( // Show error only when saveStatus is error
          <Alert variant="destructive" className="mb-6">
            <AlertTitle>Error Saving</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

      {saveStatus === 'success' && ( // Show success message
        <Alert className="mb-6 bg-green-50 border-green-200">
          <Check className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Success</AlertTitle>
          <AlertDescription className="text-green-700">
            Site details saved successfully.
          </AlertDescription>
        </Alert>
      )}

      {/* Render the DetailedSiteDetails component */}
      {isLoading ? (
        <div className="flex justify-center items-center p-10">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        </div>
      ) : siteDetailsData ? (
        <DetailedSiteDetails
          siteDetails={siteDetailsData as SiteDetails}
          onSiteDetailsChange={handleDataChange}
        />
      ) : (
        // Show error if loading finished but data is still null (and no specific load error was set)
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error Loading</AlertTitle>
          <AlertDescription>{error || 'Could not load site details.'}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
