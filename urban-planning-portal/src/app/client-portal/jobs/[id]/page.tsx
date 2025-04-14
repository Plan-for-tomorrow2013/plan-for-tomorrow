'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Loader2, ChevronDown, ChevronUp, CheckCircle2, Check, FileText } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { InitialAssessment } from '@/types/documents'

interface JobData {
  id: string
  address: string
  council: string
  currentStage: string
  createdAt: string
  documents?: Record<string, {
    filename: string
    originalName: string
    type: string
    uploadedAt: string
    size: number
  }>
  initialAssessment?: InitialAssessment
  propertyData: {
    coordinates: {
      longitude: number
      latitude: number
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

export default function JobPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [job, setJob] = useState<JobData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showPropertyDetails, setShowPropertyDetails] = useState(false)

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await fetch(`/api/jobs/${params.id}`)
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to fetch job details')
        }
        const data = await response.json()
        setJob(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchJob()
  }, [params.id])

  const renderAttributes = (attributes: Record<string, any>, layerName: string) => {
    const renderRow = (label: string, value: any) => (
      <div key={label} className="grid grid-cols-2 gap-4">
        <div className="text-[#727E86] font-medium">{label}</div>
        <div className="text-[#323A40]">{value?.toString() || 'N/A'}</div>
      </div>
    )

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

    // Special handling for Minimum Lot Size
    if (layerName === "Minimum Lot Size") {
      return (
        <div className="space-y-3">
          {renderRow("Lot Size", attributes["Lot Size"])}
          {renderRow("Units", attributes["Units"])}
        </div>
      )
    }

    // Special handling for Floor Space Ratio
    if (layerName === "Floor Space Ratio") {
      return renderRow("Floor Space Ratio", attributes["Floor Space Ratio"])
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
    if (job?.propertyData.planningLayers.protectionLayers.some(layer => layer.layer === layerName)) {
      return renderRow("Class", attributes["Class"])
    }

    // Special handling for Local Provisions
    if (job?.propertyData.planningLayers.localProvisionsLayers.some(layer => layer.layer === layerName) &&
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="container mx-auto p-4">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Job not found</AlertDescription>
        </Alert>
      </div>
    )
  }

  const tiles = [
    {
      name: 'Planning Info',
      id: 'planning-info',
      description: 'View Principal Planning Information',
      color: '#EA6B3D',
      href: `/client-portal/jobs/${params.id}/property-info`
    },
    {
      name: 'Site Details',
      id: 'site-details',
      description: 'Add Site specific details to your job',
      color: '#CDC532',
      href: `/client-portal/jobs/${params.id}/site-details`
    },
    {
      name: 'Document Store',
      id: 'document-store',
      description: 'Add and manage documents',
      color: '#EEDA54',
      href: `/client-portal/jobs/${params.id}/document-store`
    },
    {
      name: 'Initial Assessment',
      id: 'initial-assessment',
      description: 'Complete an initial assessment',
      color: '#4A90E2',
      status: job.initialAssessment ? 'completed' : 'pending',
      href: `/client-portal/jobs/${params.id}/initial-assessment`
    },
    {
      name: 'Design Check',
      id: 'design-check',
      description: 'Review your design',
      color: '#CDC532',
      href: `/client-portal/jobs/${params.id}/design-check`
    },
    {
      name: 'Report Writer',
      id: 'report-writer',
      description: 'Generate or Purchase reports',
      color: '#532200',
      href: `/client-portal/jobs/${params.id}/report-writer`
    },
    {
      name: 'Quotes',
      id: 'quotes',
      description: 'Request and manage Quotes',
      color: '#727E86',
      href: `/client-portal/jobs/${params.id}/quotes`
    },
    {
      name: 'Complete',
      id: 'complete',
      description: 'Celebrate and view the completed job',
      color: '#323A40',
      href: `/client-portal/jobs/${params.id}/complete`
    }
  ]

  const handleNavigateToPropertyInfo = () => {
    window.location.href = `/client-portal/jobs/${job.id}/property-info`;
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <Alert className="mb-6 bg-[#EEDA54]/20 border-[#EEDA54]">
        <CheckCircle2 className="h-4 w-4 text-[#532200]" />
        <AlertTitle className="text-[#532200] font-semibold">Job Details</AlertTitle>
        <AlertDescription className="text-[#532200]">
          {job.address}
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {tiles.map((tile) => (
          <Card
            key={tile.id}
            className={`shadow-md hover:shadow-lg transition-shadow cursor-pointer
              hover:bg-${tile.color}/5 border-l-4`}
            style={{ borderLeftColor: tile.color }}
            onClick={() => {
              if (tile.href) {
                router.push(tile.href)
              } else if (tile.id === 'initial-assessment') {
                router.push(`/initial-assessment?job=${params.id}`)
              } else {
                router.push(`/client-portal/jobs/${params.id}/${tile.id}`)
              }
            }}
          >
            <CardHeader>
              <h3 className="font-semibold text-[#323A40]">{tile.name}</h3>
              <p className="text-sm text-[#727E86]">{tile.description}</p>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  )
}
