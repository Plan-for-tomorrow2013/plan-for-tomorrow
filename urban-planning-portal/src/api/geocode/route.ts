import { NextResponse } from 'next/server'
import { geocodeAddress } from '../../../lib/geocoding-service'

interface LayerResult {
  layerId: number
  name: string
  features: Array<{
    attributes: Record<string, any>
  }>
}

interface ProtectionResult {
  layerName: string
  attributes: Record<string, any>
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const address = searchParams.get('address')

  if (!address) {
    return NextResponse.json({ error: 'Address is required' }, { status: 400 })
  }

  try {
    // Step 1: Get coordinates using our geocoding service
    const { longitude, latitude } = await geocodeAddress(address)

    if (!longitude || !latitude) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 })
    }

    // Step 2: Query all layers in parallel
    const [epiResponse, protectionResponse, localProvisionsResponse] = await Promise.all([
      // EPI Primary Planning Layers
      fetch(`${process.env.ARCGIS_EPI_URL}/identify?${new URLSearchParams({
        geometry: `${longitude},${latitude}`,
        geometryType: "esriGeometryPoint",
        layers: "all",
        tolerance: "1",
        mapExtent: `${longitude-0.005},${latitude-0.005},${longitude+0.005},${latitude+0.005}`,
        imageDisplay: "400,400,96",
        returnGeometry: "false",
        f: "json"
      })}`),

      // Protection Layers
      fetch(`${process.env.ARCGIS_PROTECTION_URL}/identify?${new URLSearchParams({
        geometry: `${longitude},${latitude}`,
        geometryType: "esriGeometryPoint",
        layers: "all",
        tolerance: "1",
        mapExtent: `${longitude-0.005},${latitude-0.005},${longitude+0.005},${latitude+0.005}`,
        imageDisplay: "400,400,96",
        returnGeometry: "false",
        f: "json"
      })}`),

      // Local Provisions Layers
      fetch(`${process.env.ARCGIS_LOCAL_PROVISIONS_URL}/identify?${new URLSearchParams({
        geometry: `${longitude},${latitude}`,
        geometryType: "esriGeometryPoint",
        layers: "all",
        tolerance: "1",
        mapExtent: `${longitude-0.005},${latitude-0.005},${longitude+0.005},${latitude+0.005}`,
        imageDisplay: "400,400,96",
        returnGeometry: "false",
        f: "json"
      })}`)
    ])

    // Process responses in parallel
    const [epiData, protectionData, localProvisionsData] = await Promise.all([
      epiResponse.json(),
      protectionResponse.json(),
      localProvisionsResponse.json()
    ])

    // Process EPI results
    const processedResults = epiData.results?.map((result: any) => ({
      layer: result.layerName,
      attributes: result.attributes || {}
    })) || []

    // Process Protection results
    const processedProtectionResults = protectionData.results?.map((result: ProtectionResult) => ({
      layer: result.layerName,
      attributes: result.attributes || {}
    })) || []

    // Process Local Provisions results
    const processedLocalProvisionsResults = localProvisionsData.results?.map((result: ProtectionResult) => ({
      layer: result.layerName,
      attributes: result.attributes || {}
    })) || []

    return NextResponse.json({
      address,
      coordinates: { longitude, latitude },
      planningLayers: {
        epiLayers: processedResults,
        protectionLayers: processedProtectionResults,
        localProvisionsLayers: processedLocalProvisionsResults
      }
    })

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch property information' },
      { status: 500 }
    )
  }
}
