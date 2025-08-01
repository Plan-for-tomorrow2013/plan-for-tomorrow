import { useQuery } from '@tanstack/react-query'
import { Job as JobType } from '../types/jobs'

export type Job = JobType

// Define the fetch function outside the hook for clarity
const fetchJobs = async (): Promise<Job[]> => {
  const response = await fetch('/api/jobs?limit=1000') // Fetch up to 10jobs to ensure all jobs are available

  if (!response.ok) {
    // Try to get error details from response body
    const errorBody = await response.text();
    console.error("Failed to fetch jobs:", response.status, errorBody);
    throw new Error(`Failed to fetch jobs. Status: ${response.status}`)
  }

  const data = await response.json()

  // Handle paginated response
  if (data && data.data && Array.isArray(data.data)) {
    return data.data.filter((job: Job) => job.id && job.address)
  } else {
    console.error("Invalid jobs data received:", data);
    throw new Error('Invalid jobs data received')
  }
}

export function useJobs() {
  const {
    data: jobs = [], // Default to empty array while loading/error
    isLoading,
    error,
    isError, // Use isError for boolean check
  } = useQuery<Job[], Error>({ // Specify types for data and error
    queryKey: ['jobs'], // Unique key for this query
    queryFn: fetchJobs, // The function to fetch data
    refetchInterval: 5000, // Poll every 5 seconds
    refetchIntervalInBackground: true, // Continue polling even when tab is not active
  })

  // Construct the error message based on React Query's error object
  const errorMessage = isError ? error?.message || 'Failed to fetch jobs. Please try again later.' : null;

  // Note: setJobs is removed. Updates should be handled via mutations
  // and query invalidation elsewhere in the application.
  return { jobs, isLoading, error: errorMessage }
}
