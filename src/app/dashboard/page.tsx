"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { Loader2 } from 'lucide-react'
import { UserStats } from '@/components/UserStats'
import { Announcements } from '@/components/Announcements'

interface SearchResult {
  layer: string
  attributes: Record<string, any>
}

interface SearchResponse {
  address: string
  coordinates: {
    longitude: number
    latitude: number
  }
  planningLayers: {
    epiLayers: SearchResult[]
    protectionLayers: SearchResult[]
    localProvisionsLayers: SearchResult[]
  }
}

interface Job {
  id: string
  address: string
  council: string
  currentStage: string
}

interface Announcement {
  id: string
  title: string
  content: string
  date: string
  author: string
}

export default function DashboardPage() {
  const { toast } = useToast()
  const [address, setAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<SearchResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isCreatingJob, setIsCreatingJob] = useState(false)
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [jobs, setJobs] = useState<Job[]>([
    {
      id: '1',
      address: '9 Viola Place, Greystanes',
      council: 'Cumberland Council',
      currentStage: 'initial-assessment'
    },
    {
      id: '2',
      address: '458 Bells Line of Road, Kurmond',
      council: 'Hawkesbury Council',
      currentStage: 'report-writer'
    }
  ])

  // Fetch announcements
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const response = await fetch('/api/announcements')
        if (!response.ok) throw new Error('Failed to fetch announcements')
        const data = await response.json()
        setAnnouncements(data)
      } catch (error) {
        console.error('Error fetching announcements:', error)
        toast({
          title: "Error",
          description: "Failed to load announcements",
          variant: "destructive"
        })
      }
    }

    fetchAnnouncements()
  }, [])

  const handleSearch = async () => {
    if (!address.trim()) {
      setError('Please enter an address')
      return
    }

    setLoading(true)
    setError(null)
    setResults(null)

    try {
      const response = await fetch(`/api/geocode?address=${encodeURIComponent(address)}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch results')
      }

      setResults(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateJob = async () => {
    if (!results) return

    setIsCreatingJob(true)
    try {
      const response = await fetch('/api/jobs/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: results.address,
          coordinates: results.coordinates,
          planningLayers: results.planningLayers
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.details || 'Failed to create job')
      }

      const job = await response.json()
      // Redirect to the new job page
      window.location.href = `/jobs/${job.id}`
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create job')
      console.error('Error creating job:', err)
    } finally {
      setIsCreatingJob(false)
    }
  }

  const renderAttributes = (attributes: Record<string, any>, layerName: string) => {
    const renderRow = (label: string, value: any) => (
      <div key={label} className="grid grid-cols-2 gap-4">
        <div className="text-[#727E86] font-medium">{label}</div>
        <div className="text-[#323A40]">{value?.toString() || 'N/A'}</div>
      </div>
    )

    // Special handling for Floor Space Ratio Additional Controls
    if (layerName === "Floor Space Ratio Additional Controls") {
      return (
        <div className="space-y-3">
          {renderRow("Legislative Area", attributes["Legislative Area"])}
          {renderRow("Legislative Clause", attributes["Legislative Clause"])}
        </div>
      )
    }

    // Special handling for Building Height Additional Controls
    if (layerName === "Building Height Additional Controls") {
      return (
        <div className="space-y-3">
          {renderRow("Legislative Area", attributes["Legislative Area"])}
          {renderRow("Legislative Clause", attributes["Legislative Clause"])}
        </div>
      )
    }

    // Special handling for Local Environmental Plan
    if (layerName === "Local Environmental Plan") {
      return renderRow("EPI Name", attributes["EPI Name"])
    }

    // Special handling for Land Zoning
    if (layerName === "Land Zoning") {
      return (
        <div className="space-y-3">
          {renderRow("Land Use", attributes["Land Use"])}
          {renderRow("Zone", attributes["Zone"])}
        </div>
      )
    }

    // Special handling for Height of Building
    if (layerName === "Height of Building") {
      return (
        <div className="space-y-3">
          {renderRow("Maximum Building Height", attributes["Maximum Building Height"])}
          {renderRow("Units", attributes["Units"])}
        </div>
      )
    }

    // Special handling for Floor Space Ratio (n:1)
    if (layerName === "Floor Space Ratio (n:1)") {
      return (
        <div className="space-y-3">
          {renderRow("Floor Space Ratio", attributes["Floor Space Ratio"])}
        </div>
      )
    }

    // Special handling for Minimum Lot Size
    if (layerName === "Minimum Lot Size") {
      return (
        <div className="space-y-3">
          {renderRow("Lot Size", attributes["Lot Size"])}
          {renderRow("Units", attributes["Units"])}
        </div>
      )
    }

    // Special handling for Heritage
    if (layerName === "Heritage") {
      return (
        <div className="space-y-3">
          {renderRow("Heritage Type", attributes["Heritage Type"])}
          {renderRow("Item Number", attributes["Item Number"])}
          {renderRow("Item Name", attributes["Item Name"])}
          {renderRow("Significance", attributes["Significance"])}
        </div>
      )
    }

    // Special handling for Additional Permitted Uses
    if (layerName === "Additional Permitted Uses") {
      return renderRow("Code", attributes["Code"])
    }

    // Special handling for Protection Layers
    if (results?.planningLayers.protectionLayers.some(layer => layer.layer === layerName)) {
      return renderRow("Class", attributes["Class"])
    }

    // Special handling for Local Provisions
    if (results?.planningLayers.localProvisionsLayers.some(layer => layer.layer === layerName) && 
        layerName !== "Additional Permitted Uses") {
      return (
        <div className="space-y-3">
          {renderRow("Type", attributes["Type"])}
          {renderRow("Class", attributes["Class"])}
        </div>
      )
    }

    // Default rendering for all other layers
    return (
      <div className="space-y-3">
        {Object.entries(attributes).map(([key, value]) => renderRow(key, value))}
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <UserStats
        username="Matt"
        initialAssessments={15}
        designChecks={8}
        reportsWritten={6}
        completedJobs={4}
        initialAssessmentsDiff={-2}
        designChecksDiff={3}
        reportsWrittenDiff={-1}
      />

      {/* Property Search Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Property Search</h2>
        <Card>
          <CardContent className="p-6">
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Enter address (e.g., 63 Elgin St Gunnedah)"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1"
              />
              <Button 
                onClick={handleSearch} 
                disabled={loading}
                className="bg-[#323A40] hover:bg-[#323A40]/90 text-white"
              >
                {loading ? <Loader2 className="animate-spin" /> : 'Search'}
              </Button>
            </div>

            {error && (
              <div className="mt-4 text-red-500">{error}</div>
            )}

            {results && (
              <div className="mt-6 space-y-6">
                {/* Principal Planning Layers */}
                {results.planningLayers.epiLayers.length > 0 && (
                  <Card className="border border-gray-200">
                    <CardHeader className="bg-[#323A40] text-white">
                      <h3 className="font-semibold">Principal Planning Layers</h3>
                    </CardHeader>
                    <CardContent className="divide-y pt-4">
                      {results.planningLayers.epiLayers.map((result, index) => (
                        <div key={`${result.layer}-${index}`} className="py-4 first:pt-0 last:pb-0">
                          <h4 className="font-medium text-[#532200] mb-2">{result.layer}</h4>
                          {renderAttributes(result.attributes, result.layer)}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Protection Layers */}
                {results.planningLayers.protectionLayers.length > 0 && (
                  <Card className="border border-gray-200">
                    <CardHeader className="bg-[#323A40] text-white">
                      <h3 className="font-semibold">Protection Layers</h3>
                    </CardHeader>
                    <CardContent className="divide-y pt-4">
                      {results.planningLayers.protectionLayers.map((result, index) => (
                        <div key={`${result.layer}-${index}`} className="py-4 first:pt-0 last:pb-0">
                          <h4 className="font-medium text-[#532200] mb-2">{result.layer}</h4>
                          {renderAttributes(result.attributes, result.layer)}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Local Provisions */}
                {results.planningLayers.localProvisionsLayers.length > 0 && (
                  <Card className="border border-gray-200">
                    <CardHeader className="bg-[#323A40] text-white">
                      <h3 className="font-semibold">Local Provisions</h3>
                    </CardHeader>
                    <CardContent className="divide-y pt-4">
                      {results.planningLayers.localProvisionsLayers.map((result, index) => (
                        <div key={`${result.layer}-${index}`} className="py-4 first:pt-0 last:pb-0">
                          <h4 className="font-medium text-[#532200] mb-2">{result.layer}</h4>
                          {renderAttributes(result.attributes, result.layer)}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Create Job Button */}
                <div className="flex justify-end">
                  <Button 
                    onClick={handleCreateJob}
                    disabled={isCreatingJob}
                    className="bg-[#532200] hover:bg-[#532200]/90 text-white"
                  >
                    {isCreatingJob ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Job...
                      </>
                    ) : (
                      'Create Job'
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Announcements
        announcements={announcements}
      />
    </div>
  )
} 