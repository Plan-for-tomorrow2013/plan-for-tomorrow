"use client"

import { useState, useEffect, useLayoutEffect } from 'react'
import { Card, CardContent, CardHeader } from "@shared/components/ui/card"
import { Input } from "@shared/components/ui/input"
import { Button } from "@shared/components/ui/button"
import { useToast } from "@shared/components/ui/use-toast"
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useRef } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@shared/components/ui/select"
import { useQueryClient, useMutation } from '@tanstack/react-query'
import { useJobs } from '@shared/hooks/useJobs'
import { Job } from '@shared/types/jobs'
import { UserStats } from '@shared/components/UserStats'
import { Announcements } from '@shared/components/Announcements'

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

interface Announcement {
  id: string
  title: string
  content: string
  date: string
  author: string
}

export default function DashboardPage() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [address, setAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<SearchResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isCreatingJob, setIsCreatingJob] = useState(false)
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const { jobs, isLoading, error: jobsError } = useJobs()
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [jobDetails, setJobDetails] = useState<Job | null>(null);
  const router = useRouter(); // Initialize the router

  const createJobMutation = useMutation({
    mutationFn: async (jobData: any) => {
      const response = await fetch('/api/jobs/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobData),
      })
      if (!response.ok) throw new Error('Failed to create job')
      return response.json()
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      router.push(data.redirectUrl); // Use router.push for client-side navigation
    },
    onError: (error) => {
      setError(error instanceof Error ? error.message : 'Failed to create job')
      toast({
        title: "Error",
        description: "Failed to create job",
        variant: "destructive"
      })
    }
  })

  // Fetch announcements
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        console.log('Fetching announcements...')
        const response = await fetch('/api/announcements');
        console.log('API Response status:', response.status)
        if (!response.ok) throw new Error('Failed to fetch announcements');
        const data = await response.json();
        console.log('API Response data:', data)
        if (data.error) {
          throw new Error(data.error.message);
        }
        console.log('Setting announcements:', data.data)
        setAnnouncements(data.data || []);
      } catch (error) {
        console.error('Error fetching announcements:', error);
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to load announcements",
          variant: "destructive"
        });
      }
    };

    fetchAnnouncements();

    // Set up polling to check for updates every 30 seconds
    const interval = setInterval(fetchAnnouncements, 30000);

    return () => clearInterval(interval);
  }, [toast]);

  useEffect(() => {
    if (selectedJobId) {
      const fetchJobDetails = async () => {
        const response = await fetch(`/api/jobs/${selectedJobId}`);
        const data = await response.json();
        setJobDetails(data);
      };

      fetchJobDetails();
    } else {
      setJobDetails(null); // Clear job details if no job is selected
    }
  }, [selectedJobId]);

  const handleSearch = async () => {
    if (!address.trim()) {
      setError('Please enter an address');
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await fetch(`/api/geocode?address=${encodeURIComponent(address)}`);

      // Check if the response is OK
      if (!response.ok) {
        const errorText = await response.text(); // Get the response as text
        throw new Error(`Error: ${response.status} - ${errorText}`);
      }

      const data = await response.json(); // Parse as JSON
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateJob = async () => {
    if (!results) return
    setIsCreatingJob(true)
    try {
      await createJobMutation.mutateAsync({
        address: results.address,
        coordinates: results.coordinates,
        planningLayers: results.planningLayers,
      })
    } finally {
      setIsCreatingJob(false)
    }
  }

  const renderAttributes = (attributes: Record<string, any>, layerName: string) => {
    if (!attributes) return null;

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
    if (layerName === "Height of Building Additional Controls") {
      return (
        <div className="space-y-3">
          {renderRow("Legislative Area", attributes["Legislative Area"])}
          {renderRow("Legislative Clause", attributes["Legislative Clause"])}
        </div>
      )
    }

        // Special handling for Minimum Lot Size Additional Controls
        if (layerName === "Minimum Lot Size Additional Controls") {
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
            {renderRow("Units", attributes["Units"])}
          </div>
        )
      }

    // Special handling for Floor Space Ratio
    if (layerName === "Floor Space Ratio") {
      return (
        <div className="space-y-3">
          {renderRow("Floor Space Ratio", attributes["Floor Space Ratio"])}
          {renderRow("Units", attributes["Units"])}
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

    // Special handling for Minimum Dwelling Density Area
    if (layerName === "Minimum Dwelling Density Area") {
      return (
        <div className="space-y-3">
          {renderRow("Minimum Dwelling Density", attributes["Minimum Dwelling Density"])}
          {renderRow("Code", attributes["Code"])}
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
        role="professional"
        designChecks={8}
        reportsWritten={6}
        completedJobs={4}
        designChecksDiff={3}
        reportsWrittenDiff={-1}
      />

      {/* Property Search Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Search a property to create a new job</h2>
        <Card>
          <CardContent className="p-6">
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Enter address (e.g., 9 Viola Place, Greystanes)"
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

      {/* Job status section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Job Status</h2>
        {jobs.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-lg text-gray-600 mb-4">No jobs found</p>
              <p className="text-sm text-gray-500">Search for a property above to create your first job</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="flex-1 mr-4">
              <Select value={selectedJobId || undefined} onValueChange={setSelectedJobId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a job" />
                </SelectTrigger>
                <SelectContent>
                  {jobs.map((job) => (
                    <SelectItem key={job.id} value={job.id}>
                      {job.address}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Job Details Section */}
            {jobDetails && (
              <Card>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-4">
                    {[
                      {
                        name: 'Planning Layers',
                        id: 'planning-layers',
                        description: 'View planning layer details and attributes',
                        color: '#EA6B3D',
                      },
                      {
                        name: 'Site Details',
                        id: 'site-details',
                        description: 'Site specifications and requirements',
                        color: '#CDC532',
                      },
                      {
                        name: 'Document Store',
                        id: 'document-store',
                        description: 'Access and manage documents',
                        color: '#EEDA54',
                      },
                      {
                        name: 'Initial Assessment',
                        id: 'initial-assessment',
                        description: 'Initial assessment of the development',
                        color: '#EEDA54',
                      },
                      {
                        name: 'Design Check',
                        id: 'design-check',
                        description: 'Review design specifications',
                        color: '#CDC532',
                      },
                      {
                        name: 'Report Writer',
                        id: 'report-writer',
                        description: 'Generate detailed reports',
                        color: '#532200',
                      },
                      {
                        name: 'Quotes',
                        id: 'quotes',
                        description: 'Manage cost estimates',
                        color: '#727E86',
                      },
                      {
                        name: 'Complete',
                        id: 'complete',
                        description: 'View completed tasks',
                        color: '#323A40',
                      },
                    ].map((tile) => (
                      <Card
                        key={tile.id}
                        className={`shadow-md hover:shadow-lg transition-shadow cursor-pointer hover:bg-${tile.color}/5 border-l-4`}
                        style={{ borderLeftColor: tile.color }}
                        onClick={() => {
                          // Handle navigation or display logic here
                          console.log(`Navigating to ${tile.id}`);
                          // Example: router.push(`/jobs/${jobDetails.id}/${tile.id}`);
                        }}
                      >
                        <CardHeader>
                          <h3 className="font-semibold">{tile.name}</h3>
                          <p className="text-sm text-gray-500">{tile.description}</p>
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>

      {/* Announcements Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Announcements</h2>
        <Announcements
          announcements={announcements}
        />
      </div>
    </div>
  )
}
