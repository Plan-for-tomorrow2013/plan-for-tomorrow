'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@shared/components/ui/button';
import { Input } from '@shared/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@shared/components/ui/card';
import { Badge } from '@shared/components/ui/badge';
import { Skeleton } from '@shared/components/ui/skeleton';
import { useQuery } from '@tanstack/react-query';
import { Job } from '@shared/types/jobs';

interface PaginatedResponse {
  data: Job[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

async function getJobs(): Promise<Job[]> {
  const response = await fetch('/api/jobs');
  if (!response.ok) {
    throw new Error('Failed to fetch jobs');
  }
  const data: PaginatedResponse = await response.json();
  return data.data;
}

export default function JobsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const {
    data: jobs = [],
    isLoading,
    error,
  } = useQuery<Job[]>({
    queryKey: ['jobs'],
    queryFn: getJobs,
  });

  // Filter jobs based on search query
  const filteredJobs = jobs.filter(job => {
    const searchLower = searchQuery.toLowerCase();
    return (
      job.address.toLowerCase().includes(searchLower) ||
      job.council?.toLowerCase().includes(searchLower) ||
      job.currentStage.toLowerCase().includes(searchLower)
    );
  });

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-500">Failed to load jobs. Please try again later.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Jobs</h1>
        <Button onClick={() => router.push('/professionals/dashboard')}>Create New Job</Button>
      </div>

      <div className="mb-6">
        <Input
          placeholder="Search jobs..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-1/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredJobs.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Jobs Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p>No jobs match your search criteria.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredJobs.map(job => (
            <Card
              key={job.id}
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => router.push(`/professionals/jobs/${job.id}`)}
            >
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>{job.address}</CardTitle>
                  <Badge variant={getStatusVariant(job.currentStage)}>{job.currentStage}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{job.council}</p>
                <p className="text-sm text-gray-500">
                  Created: {new Date(job.createdAt).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function getStatusVariant(status: string): 'default' | 'destructive' | 'outline' | 'secondary' {
  switch (status.toLowerCase()) {
    case 'completed':
      return 'default';
    case 'in progress':
      return 'outline';
    case 'pending':
      return 'secondary';
    default:
      return 'default';
  }
}
