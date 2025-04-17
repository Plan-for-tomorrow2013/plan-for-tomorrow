import { useEffect, useState } from 'react'

export interface Job {
  id: string
  address: string
  council?: string
  currentStage?: string
  createdAt?: string
  initialAssessment?: {
    status?: 'pending' | 'completed' | 'paid'
    returnedAt?: string
  };
  // Add propertyData field, making it optional
  propertyData?: {
    coordinates?: {
      longitude: number;
      latitude: number;
    };
    planningLayers: {
      epiLayers: Array<{ layer: string; attributes: Record<string, any> }>;
      protectionLayers: Array<{ layer: string; attributes: Record<string, any> }>;
      localProvisionsLayers: Array<{ layer: string; attributes: Record<string, any> }>;
    };
  } | null;
  // Add siteDetails field, making it optional
  siteDetails?: {
    siteAddressDetails?: string;
    siteArea?: string;
    currentLandUse?: string;
    zoningInfo?: string;
    siteConstraints?: string;
  } | null;
}

export function useJobs() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const response = await fetch('/api/jobs')

        if (!response.ok) {
          throw new Error('Failed to fetch jobs')
        }

        const data = await response.json()

        if (Array.isArray(data)) {
          setJobs(data.filter((job: Job) => job.id && job.address))
        } else {
          throw new Error('Invalid jobs data received')
        }
      } catch (error) {
        console.error('Error fetching jobs:', error)
        setError('Failed to fetch jobs. Please try again later.')
        setJobs([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchJobs()
  }, [])

  return { jobs, setJobs, isLoading, error }
}
