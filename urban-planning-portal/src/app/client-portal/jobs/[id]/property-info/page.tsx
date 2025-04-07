'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader } from '../../../../../components/ui/card'
import { Loader2, ArrowLeft } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '../../../../components/ui/alert'
import { Button } from '../../../../../components/ui/button'
import { useRouter } from 'next/navigation'

interface JobData {
  id: string
  address: string
  council: string
  currentStage: string
  createdAt: string
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

export default function PropertyInfoPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [job, setJob] = useState<JobData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await fetch(`/api/jobs/${params.id}`)
        if (!response.ok) {
          throw new Error('Failed to fetch job details')
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
      <div key={label} className="grid grid-cols-2 gap-4 py-2 border-b border-gray-100 last:border-0">
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
        <div className="space-y-2">
          {renderRow("Land Use", attributes["Land Use"])}
          {renderRow("Zone", attributes["Zone"])}
        </div>
      )
    }

    // Special handling for Height of Building
    if (layerName === "Height of Building") {
      return (
        <div className="space-y-2">
          {renderRow("Maximum Building Height", attributes["Maximum Building Height"])}
          {renderRow("Units", attributes["Units"])}
        </div>
      )
    }

    // Special handling for Minimum Lot Size
    if (layerName === "Minimum Lot Size") {
      return (
        <div className="space-y-2">
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
        <div className="space-y-2">
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
        <div className="space-y-2">
          {renderRow("Type", attributes["Type"])}
          {renderRow("Class", attributes["Class"])}
        </div>
      )
    }

    // Default rendering for all other layers
    return (
      <div className="space-y-2">
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

  if (error || !job) {
    return (
      <div className="container mx-auto p-4">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error || 'Job not found'}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          className="p-2"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-semibold text-[#323A40]">{job.address}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Principal Planning Layers */}
        <Card className="shadow-md">
          <CardHeader className="bg-[#323A40] text-white">
            <h2 className="text-lg font-semibold">Principal Planning Layers</h2>
          </CardHeader>
          <CardContent className="p-4 space-y-6">
            {job.propertyData.planningLayers.epiLayers.map((layer, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-[#532200] mb-3">{layer.layer}</h3>
                {renderAttributes(layer.attributes, layer.layer)}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Protection Layers */}
        <Card className="shadow-md">
          <CardHeader className="bg-[#323A40] text-white">
            <h2 className="text-lg font-semibold">Protection Layers</h2>
          </CardHeader>
          <CardContent className="p-4 space-y-6">
            {job.propertyData.planningLayers.protectionLayers.map((layer, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-[#532200] mb-3">{layer.layer}</h3>
                {renderAttributes(layer.attributes, layer.layer)}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Local Provisions */}
        <Card className="shadow-md lg:col-span-2">
          <CardHeader className="bg-[#323A40] text-white">
            <h2 className="text-lg font-semibold">Local Provisions</h2>
          </CardHeader>
          <CardContent className="p-4 space-y-6">
            {job.propertyData.planningLayers.localProvisionsLayers.map((layer, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-[#532200] mb-3">{layer.layer}</h3>
                {renderAttributes(layer.attributes, layer.layer)}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
