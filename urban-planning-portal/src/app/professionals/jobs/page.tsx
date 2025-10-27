'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@shared/components/ui/button';
import { Input } from '@shared/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@shared/components/ui/card';
import { Skeleton } from '@shared/components/ui/skeleton';
import { useQuery } from '@tanstack/react-query';
import { Job } from '@shared/types/jobs';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Grid3X3, List } from 'lucide-react';

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

async function getJobs(
  page: number = 1,
  limit: number = 10,
  search: string = ''
): Promise<PaginatedResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (search) {
    params.append('search', search);
  }

  const response = await fetch(`/api/jobs?${params}`);
  if (!response.ok) {
    throw new Error('Failed to fetch jobs');
  }
  return response.json();
}

export default function JobsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'board'>('board');
  
  // Define the 6 stages in order
  const stages = [
    { id: 'initial-assessment', label: 'Initial Assessment', color: 'bg-blue-100' },
    { id: 'design-check', label: 'Design Check', color: 'bg-yellow-100' },
    { id: 'report-writer', label: 'Report Writer', color: 'bg-orange-100' },
    { id: 'consultant-store', label: 'Consultants', color: 'bg-purple-100' },
    { id: 'certifying-authority', label: 'Certifying Authority', color: 'bg-green-100' },
    { id: 'complete', label: 'Complete', color: 'bg-gray-100' }
  ];
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setCurrentPage(1); // Reset to first page when searching
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const {
    data: paginatedData,
    isLoading,
    error,
  } = useQuery<PaginatedResponse>({
    queryKey: ['jobs', currentPage, debouncedSearchQuery],
    queryFn: () => getJobs(currentPage, 10, debouncedSearchQuery),
    // keepPreviousData: true, // Not supported in v4, remove this line
  });

  const jobs = paginatedData?.data || [];
  const pagination = paginatedData?.pagination;

  // Group jobs by currentActiveStage
  const jobsByStage = stages.reduce((acc, stage) => {
    acc[stage.id] = jobs.filter(job => 
      (job.currentActiveStage || 'initial-assessment') === stage.id
    );
    return acc;
  }, {} as Record<string, Job[]>);

  // Calculate stage progress for a job
  const getStageProgress = (job: Job) => {
    const completedCount = job.completedStages?.length || 0;
    return { completed: completedCount, total: stages.length };
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

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
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4 mr-2" />
              List
            </Button>
            <Button
              variant={viewMode === 'board' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('board')}
            >
              <Grid3X3 className="h-4 w-4 mr-2" />
              Board
            </Button>
          </div>
          <Button onClick={() => router.push('/professionals/dashboard')}>Create New Job</Button>
        </div>
      </div>

      <div className="mb-6">
        <Input
          placeholder="Start typing to find a job..."
          value={searchQuery}
          onChange={handleSearchChange}
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
      ) : jobs.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Jobs Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p>No jobs match your search criteria.</p>
          </CardContent>
        </Card>
      ) : viewMode === 'board' ? (
        // Kanban Board View
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
          {stages.map(stage => (
            <div key={stage.id} className={`${stage.color} rounded-lg p-4 min-h-[400px]`}>
              <h3 className="font-semibold text-gray-800 mb-4">{stage.label}</h3>
              <div className="space-y-3">
                {jobsByStage[stage.id].map((job: Job) => {
                  const progress = getStageProgress(job);
                  return (
                    <Card
                      key={job.id}
                      className="cursor-pointer hover:shadow-md transition-shadow bg-white"
                      onClick={() => router.push(`/professionals/jobs/${job.id}`)}
                    >
                      <CardContent className="p-3">
                        <h4 className="font-medium text-sm mb-1 truncate">{job.address}</h4>
                        <p className="text-xs text-gray-600 mb-2">{job.council}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            {progress.completed}/{progress.total} stages
                          </span>
                          <div className="w-16 bg-gray-200 rounded-full h-1.5">
                            <div 
                              className="bg-blue-600 h-1.5 rounded-full" 
                              style={{ width: `${(progress.completed / progress.total) * 100}%` }}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
                {jobsByStage[stage.id].length === 0 && (
                  <p className="text-gray-500 text-sm text-center py-8">No jobs in this stage</p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        // List View (existing)
        <>
          <div className="space-y-4 mb-6">
            {jobs.map((job: Job) => {
              const progress = getStageProgress(job);
              return (
                <Card
                  key={job.id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => router.push(`/professionals/jobs/${job.id}`)}
                >
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>{job.address}</CardTitle>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">
                          {job.currentActiveStage ? stages.find(s => s.id === job.currentActiveStage)?.label : 'Initial Assessment'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {progress.completed}/{progress.total}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{job.council}</p>
                    <p className="text-sm text-gray-500">
                      Created: {new Date(job.createdAt).toLocaleDateString()}
                    </p>
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(progress.completed / progress.total) * 100}%` }}
                      />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}

      {/* Pagination Controls - show for both views */}
      {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {(pagination.currentPage - 1) * 10 + 1} -{' '}
                {Math.min(pagination.currentPage * 10, pagination.totalItems)} of{' '}
                {pagination.totalItems} jobs
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(1)}
                  disabled={!pagination.hasPreviousPage}
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={!pagination.hasPreviousPage}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="flex items-center space-x-1">
                  {Array.from(Array(Math.min(5, pagination.totalPages)), (_, i) => {
                    let pageNum;
                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (pagination.currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (pagination.currentPage >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + i;
                    } else {
                      pageNum = pagination.currentPage - 2 + i;
                    }

                    return (
                      <Button
                        key={pageNum}
                        variant={pagination.currentPage === pageNum ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                        className="w-8 h-8 p-0"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={!pagination.hasNextPage}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.totalPages)}
                  disabled={!pagination.hasNextPage}
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
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
