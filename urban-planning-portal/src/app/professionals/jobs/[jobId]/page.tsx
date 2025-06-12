'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader } from "@shared/components/ui/card"
import { Loader2, ChevronDown, ChevronUp, CheckCircle2, Check, FileText, ClipboardCheck, DollarSign, FileCheck, Building2, FolderOpen } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from "@shared/components/ui/alert"
import { Button } from "@shared/components/ui/button"
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import type { Job } from '@shared/types/jobs'

interface Props {
  params: {
    jobId: string
  }
}

async function getJob(jobId: string): Promise<Job> {
  const response = await fetch(`/api/jobs/${jobId}`)
  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || 'Failed to fetch job details')
  }
  return response.json()
}

export default function JobPage({ params }: Props) {
  const router = useRouter()
  const { data: job, isLoading, error } = useQuery<Job>({
    queryKey: ['job', params.jobId],
    queryFn: () => getJob(params.jobId),
  })

  const [showPropertyDetails, setShowPropertyDetails] = useState(false)

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

    // Special handling for Floor Space Ratio (n:1)
    if (layerName === "Floor Space Ratio (n:1)") {
      return (
        <div className="space-y-2">
          {renderRow("Floor Space Ratio", attributes["Floor Space Ratio"])}
          {renderRow("Units", attributes["Units"])}
        </div>
      )
    }
    // Special handling for Floor Space Ratio
    if (layerName === "Floor Space Ratio") {
      return (
        <div className="space-y-2">
          {renderRow("Floor Space Ratio", attributes["Floor Space Ratio"])}
          {renderRow("Units", attributes["Units"])}
        </div>
      )
    }
    // Special handling for Floor Space Ratio Additional Controls
    if (layerName === "Floor Space Ratio Additional Controls") {
      return (
        <div className="space-y-3">
          {renderRow("Legislative Area", attributes["Legislative Area"])}
          {renderRow("Legislative Clause", attributes["Legislative Clause"])}
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
    if (job?.propertyData?.planningLayers?.protectionLayers?.some((layer: { layer: string }) => layer.layer === layerName)) {
      return renderRow("Class", attributes["Class"])
    }

    // Special handling for Local Provisions
    if (job?.propertyData?.planningLayers?.localProvisionsLayers?.some((layer: { layer: string }) => layer.layer === layerName) &&
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

  if (isLoading) {
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
          <AlertDescription>{error instanceof Error ? error.message : 'An error occurred'}</AlertDescription>
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
      name: 'Planning Layers',
      id: 'planning-layers',
      description: 'View planning layer details and attributes',
      icon: Building2,
      href: `/professionals/jobs/${params.jobId}/property-info`,
      color: '#EA6B3D'
    },
    {
      name: 'Site Details',
      id: 'site-details',
      description: 'Site specifications and requirements',
      icon: FileCheck,
      href: `/professionals/jobs/${params.jobId}/site-details`,
      color: '#CDC532'
    },
    {
      name: 'Document Store',
      id: 'document-store',
      description: 'Access and manage documents',
      icon: FolderOpen,
      href: `/professionals/jobs/${params.jobId}/document-store`,
      color: '#EEDA54'
    },
    {
      name: 'Initial Assessment',
      id: 'initial-assessment',
      description: 'Initial assessment of the development',
      icon: ClipboardCheck,
      href: `/professionals/jobs/${params.jobId}/initial-assessment`,
      color: '#CDC532'
    },
    {
      name: 'Design Check',
      id: 'design-check',
      description: 'Review design compliance',
      icon: ClipboardCheck,
      href: `/professionals/jobs/${params.jobId}/design-check`,
      color: '#CDC532'
    },
    {
      name: 'Report Writer',
      id: 'report-writer',
      description: 'Generate assessment reports',
      icon: FileText,
      href: `/professionals/jobs/${params.jobId}/report-writer`,
      color: '#532200'
    },
    {
      name: 'Consultants',
      id: 'consultants',
      description: 'View and manage consultants',
      icon: DollarSign,
      href: `/professionals/jobs/${params.jobId}/consultants`,
      color: '#727E86'
    },
    {
      name: 'Certifying Authority',
      id: 'certifying-authority',
      description: 'View and manage your approval',
      icon: DollarSign,
      href: `/professionals/jobs/${params.jobId}/certifying-authority`,
      color: '#727E86'
    },
    {
      name: 'Complete',
      id: 'complete',
      description: 'View completed tasks',
      icon: CheckCircle2,
      href: `/professionals/jobs/${params.jobId}/complete`,
      color: '#323A40'
    }
  ]

  const handleNavigateToPropertyInfo = () => {
    window.location.href = `/professionals/jobs/${job.id}/property-info`;
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <Alert className="mb-6 bg-[#EEDA54]/20 border-[#EEDA54]">
        <AlertTitle className="text-[#532200] font-semibold">Job Details</AlertTitle>
        <AlertDescription className="text-[#532200]">
          {job.address}
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tiles.map((tile) => (
          <Link key={tile.id} href={tile.href}>
            <Card className="hover:bg-gray-50 transition-colors cursor-pointer border-l-4" style={{ borderLeftColor: tile.color }}>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <tile.icon className="h-6 w-6" style={{ color: tile.color }} />
                  <div>
                    <h3 className="font-semibold">{tile.name}</h3>
                    <p className="text-sm text-gray-500">{tile.description}</p>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
