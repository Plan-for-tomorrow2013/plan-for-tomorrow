'use client'

import { useEffect, useState } from 'react'
import { Input } from '../../components/ui/input'
import { Card, CardContent } from '../../components/ui/card'
import Link from 'next/link'
import { FileText, Search, Loader2, Trash2 } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert'

interface Job {
  id: string
  address: string
  council: string
  currentStage: string
  createdAt: string
  propertyData: {
    coordinates: {
      latitude: number
      longitude: number
    }
    planningLayers: {
      epiLayers: Array<{
        layer: string
        attributes: Record<string, any>
      }>
      protectionLayers: Array<{
        layer: string
        attributes: Record<string, any>
      }>
      localProvisionsLayers: Array<{
        layer: string
        attributes: Record<string, any>
      }>
    }
  }
}

export default function JobsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteStatus, setDeleteStatus] = useState<{ [key: string]: boolean }>({})

  // Fetch jobs from the API
  const fetchJobs = async () => {
    try {
      const response = await fetch('/api/jobs')
      if (!response.ok) {
        throw new Error('Failed to fetch jobs')
      }
      const data = await response.json()
      setJobs(data)
      setError(null)
    } catch (err) {
      setError('Failed to load jobs. Please try again later.')
      console.error('Error fetching jobs:', err)
    } finally {
      setLoading(false)
    }
  }

  // Fetch jobs on mount and set up polling
  useEffect(() => {
    fetchJobs()

    // Poll for updates every 30 seconds
    const interval = setInterval(fetchJobs, 30000)

    return () => clearInterval(interval)
  }, [])

  // Filter jobs based on search query
  const filteredJobs = jobs.filter(job => {
    const searchLower = searchQuery.toLowerCase()
    return (
      (job?.address?.toLowerCase()?.includes(searchLower) ?? false) ||
      (job?.council?.toLowerCase()?.includes(searchLower) ?? false) ||
      (job?.currentStage?.toLowerCase()?.includes(searchLower) ?? false)
    )
  })

  // Helper function to format stage name
  const formatStageName = (stage: string) => {
    return stage.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  // Helper function to get stage color
  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'initial-assessment':
        return 'bg-blue-50 text-blue-700'
      case 'design-check':
        return 'bg-purple-50 text-purple-700'
      case 'report-writer':
        return 'bg-green-50 text-green-700'
      default:
        return 'bg-gray-50 text-gray-700'
    }
  }

  const handleDelete = async (jobId: string) => {
    try {
      setDeleteStatus(prev => ({ ...prev, [jobId]: true }))
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete job')
      }

      // Remove the deleted job from the state
      setJobs(prev => prev.filter(job => job.id !== jobId))
      setError(null)
    } catch (error) {
      console.error('Error deleting job:', error)
      setError('Failed to delete job. Please try again.')
    } finally {
      setDeleteStatus(prev => ({ ...prev, [jobId]: false }))
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-2 mb-2">
          <FileText className="h-6 w-6" />
          Jobs
        </h1>
        <p className="text-[#727E86]">View and manage your planning assessment jobs</p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <Input
          type="text"
          placeholder="Search jobs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredJobs.map((job) => (
          <div
            key={job.id}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow relative group"
          >
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => handleDelete(job.id)}
              disabled={deleteStatus[job.id]}
            >
              {deleteStatus[job.id] ? (
                <Loader2 className="h-4 w-4 animate-spin text-red-600" />
              ) : (
                <Trash2 className="h-4 w-4 text-red-600" />
              )}
            </Button>

            <Link href={`/jobs/${job.id}`}>
              <h3 className="text-lg font-semibold mb-2 text-[#323A40]">
                {job.address ?? 'Untitled Job'}
              </h3>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  Stage: {job.currentStage ?? 'unknown'}
                </p>
                <p className="text-sm text-gray-600">
                  Council: {job.council ?? 'Not specified'}
                </p>
                <p className="text-sm text-gray-600">
                  Created: {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'Date not available'}
                </p>
              </div>
            </Link>
          </div>
        ))}
      </div>

      {/* No Results */}
      {!loading && filteredJobs.length === 0 && (
        <div className="text-center py-12">
          <p className="text-[#727E86]">No jobs found matching your search criteria</p>
        </div>
      )}
    </div>
  )
} 