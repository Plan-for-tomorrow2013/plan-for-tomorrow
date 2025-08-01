'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@shared/components/ui/button';
import { Card, CardContent } from '@shared/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@shared/components/ui/select';
import { Input } from '@shared/components/ui/input';
import { Alert, AlertDescription } from '@shared/components/ui/alert';
import { useJobs } from '@shared/hooks/useJobs';
import { Job } from '@shared/types/jobs';
import { JobProvider, useJob } from '@shared/contexts/job-context';

// Function to fetch job details
async function fetchJobDetails(jobId: string): Promise<Job> {
  const response = await fetch(`/api/jobs/${jobId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch job details');
  }
  return response.json();
}

function CertifyingAuthorityContent({ jobId }: { jobId: string }): JSX.Element {
  const [webAddress, setWebAddress] = useState<string>('');
  const [isValidUrl, setIsValidUrl] = useState<boolean>(true);

  // Fetch job details
  const {
    data: currentJob,
    isLoading: isJobLoading,
    error: jobError,
  } = useQuery<Job, Error>({
    queryKey: ['job', jobId],
    queryFn: () => fetchJobDetails(jobId),
    enabled: !!jobId,
  });

  // Load saved web address from job data
  useEffect(() => {
    if (currentJob?.certifyingAuthority?.webAddress) {
      setWebAddress(currentJob.certifyingAuthority.webAddress);
    }
  }, [currentJob]);

  // Validate URL
  const validateUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // Handle web address change
  const handleWebAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setWebAddress(newUrl);
    setIsValidUrl(newUrl === '' || validateUrl(newUrl));
  };

  // Save web address
  const handleSaveWebAddress = async () => {
    if (!isValidUrl) return;

    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          certifyingAuthority: {
            webAddress: webAddress,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save web address');
      }
    } catch (error) {
      console.error('Error saving web address:', error);
    }
  };

  if (isJobLoading) return <div>Loading...</div>;
  if (jobError)
    return (
      <Alert variant="destructive">
        <AlertDescription>{jobError.message}</AlertDescription>
      </Alert>
    );

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Web Address</label>
              <div className="flex gap-2">
                <Input
                  type="url"
                  placeholder="Enter web address (e.g., https://example.com)"
                  value={webAddress}
                  onChange={handleWebAddressChange}
                  className={!isValidUrl ? 'border-red-500' : ''}
                />
                <Button onClick={handleSaveWebAddress} disabled={!isValidUrl}>
                  Save
                </Button>
              </div>
              {!isValidUrl && <p className="text-sm text-red-500 mt-1">Please enter a valid URL</p>}
              {isValidUrl && webAddress && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-sm text-blue-700">
                    <strong>Note:</strong> Some websites may not display in the preview above due to
                    their security settings. If you can't see the website content, please use the
                    "Open in New Tab" button below to view it directly.
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {webAddress && isValidUrl && (
        <>
          <Card>
            <CardContent className="p-0">
              <iframe
                src={webAddress}
                className="w-full h-[800px] border-0"
                title="Certifying Authority Website"
              />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex justify-center p-6">
              <Button asChild variant="default" size="lg">
                <a href={webAddress} target="_blank" rel="noopener noreferrer">
                  Open in New Tab
                </a>
              </Button>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

function CertifyingAuthorityPageContent(): JSX.Element {
  const { jobs, isLoading: isLoadingJobs, error: jobsError } = useJobs();
  const { currentJob, setCurrentJob } = useJob();
  const router = useRouter();

  // Effect to set initial job from URL query param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const jobId = params.get('job');
    if (jobId && jobs?.find(j => j.id === jobId)) {
      const job = jobs.find(j => j.id === jobId);
      if (job) {
        setCurrentJob(job);
      }
    }
  }, [jobs, setCurrentJob]);

  // Update URL when job selection changes
  useEffect(() => {
    if (currentJob) {
      router.push(`/professionals/certifying-authority?job=${currentJob.id}`, { scroll: false });
    }
  }, [currentJob, router]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Certifying Authority</h1>
        {isLoadingJobs ? (
          <div>Loading jobs...</div>
        ) : jobsError ? (
          <Alert variant="destructive">
            <AlertDescription>Failed to load jobs.</AlertDescription>
          </Alert>
        ) : (
          <Select
            value={currentJob?.id}
            onValueChange={jobId => {
              const job = jobs?.find(j => j.id === jobId);
              if (job) {
                setCurrentJob(job);
              }
            }}
          >
            <SelectTrigger className="w-[280px]">
              <SelectValue placeholder="Select a job" />
            </SelectTrigger>
            <SelectContent>
              {jobs?.map(job => (
                <SelectItem key={job.id} value={job.id}>
                  {job.address}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {currentJob ? (
        <CertifyingAuthorityContent jobId={currentJob.id} />
      ) : (
        <div className="text-center text-gray-500 mt-10 border rounded-lg p-8 bg-gray-50">
          <p>Please select a job from the dropdown above to access Certifying Authority.</p>
        </div>
      )}
    </div>
  );
}

export default function CertifyingAuthorityPage() {
  return (
    <JobProvider storageKey="urban-planning-jobs">
      <CertifyingAuthorityPageContent />
    </JobProvider>
  );
}
