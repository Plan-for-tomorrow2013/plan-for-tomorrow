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
import {
  DevelopmentDetailsProvider,
  useDevelopmentDetails,
} from '@shared/contexts/development-details-context';

export default function DevelopmentDetailsPageWrapper() {
  const searchParams = useSearchParams();
  const jobId = searchParams.get('job');
  if (!jobId) {
    return <div className="p-10 text-center">No job ID provided.</div>;
  }
  return (
    <DevelopmentDetailsProvider jobId={jobId}>
      <DevelopmentDetailsPage jobId={jobId} />
    </DevelopmentDetailsProvider>
  );
}

function DevelopmentDetailsPage({ jobId }: { jobId: string }) {
  const router = useRouter();
  const {
    developmentDetails,
    isLoading,
    error,
    hasUnsavedChanges,
    updateDevelopmentDetails,
    saveDevelopmentDetails,
  } = useDevelopmentDetails();

  // Handle form submission
  const onSubmit = async () => {
    try {
      // Save the development details
      await saveDevelopmentDetails();

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
              developmentDetails={developmentDetails}
              onDevelopmentDetailsChange={updateDevelopmentDetails}
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
                  onClick={saveDevelopmentDetails}
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
