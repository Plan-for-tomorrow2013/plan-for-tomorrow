"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { Alert, AlertDescription, AlertTitle } from "./ui/alert"
import { AlertCircle, Loader2 } from "lucide-react"
import { Separator } from "./ui/separator"
import { useRouter } from "next/navigation"

interface LayerInfo {
  layerId: number
  layerName: string
  source: string
  attributes: Record<string, string | number | null>
}

interface GeocodingResult {
  longitude: number | null
  latitude: number | null
}

// Function to format attribute names for display
function formatAttributeName(name: string): string {
  return name
    .replace(/_/g, " ")
    .replace(/([A-Z])/g, " $1")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ")
}

export function JobManagement() {
  const router = useRouter()
  const [address, setAddress] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [coordinates, setCoordinates] = useState<GeocodingResult | null>(null)
  const [layersInfo, setLayersInfo] = useState<LayerInfo[]>([])
  const [protectionLayersInfo, setProtectionLayersInfo] = useState<LayerInfo[]>([])

  const handleSearch = async () => {
    if (!address.trim()) {
      setError("Please enter an address")
      return
    }

    setLoading(true)
    setError(null)
    setCoordinates(null)
    setLayersInfo([])
    setProtectionLayersInfo([])

    try {
      // Step 1: Geocode the address
      const geocodeUrl = "https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates"
      const params = new URLSearchParams({
        SingleLine: address,
        f: "json",
        outFields: "Match_addr,Addr_type",
      })

      const response = await fetch(`${geocodeUrl}?${params}`)
      if (!response.ok) {
        throw new Error(`Geocoding API error: ${response.status}`)
      }

      const data = await response.json()
      if (!data.candidates || data.candidates.length === 0) {
        throw new Error(`No location found for the address: ${address}`)
      }

      // Take the first match
      const candidate = data.candidates[0]
      const location = candidate.location
      const coords = { longitude: location.x, latitude: location.y }
      setCoordinates(coords)

      if (coords.longitude && coords.latitude) {
        // Step 2: Get Principal Planning Layers information
        const principalUrl = "https://mapprod3.environment.nsw.gov.au/arcgis/rest/services/Planning/EPI_Primary_Planning_Layers/MapServer"
        const principalResults = await fetchLayerInfo(coords, principalUrl, "Principal Planning Layers")
        setLayersInfo(principalResults)

        // Step 3: Get Protection Layers information
        const protectionUrl = "https://mapprod3.environment.nsw.gov.au/arcgis/rest/services/Planning/Protection/MapServer"
        const protectionResults = await fetchLayerInfo(coords, protectionUrl, "Protection", true)
        setProtectionLayersInfo(protectionResults)

        // Step 4: Create a new job with the property data
        const jobData = {
          address,
          coordinates: coords,
          planningLayers: {
            epiLayers: principalResults,
            protectionLayers: protectionResults,
            localProvisionsLayers: [] // We'll add this later if needed
          }
        }

        const createJobResponse = await fetch('/api/jobs/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(jobData),
        })

        if (!createJobResponse.ok) {
          throw new Error('Failed to create job')
        }

        const { jobId, redirectUrl } = await createJobResponse.json()
        router.push(redirectUrl)
      }
    } catch (error) {
      console.error("Error:", error)
      setError(error instanceof Error ? error.message : "Failed to fetch property information")
    } finally {
      setLoading(false)
    }
  }

  const fetchLayerInfo = async (coords: GeocodingResult, mapServerUrl: string, source: string, isProtection = false) => {
    if (isProtection) {
      // Handle Protection layer differently
      const queryUrl = `${mapServerUrl}/2/query`
      const params = new URLSearchParams({
        where: "",
        text: "",
        objectIds: "",
        time: "",
        timeRelation: "esriTimeRelationOverlaps",
        geometry: `${coords.longitude},${coords.latitude}`,
        geometryType: "esriGeometryPoint",
        outFields: "*",
        inSR: "4326",
        spatialRel: "esriSpatialRelIntersects",
        distance: "",
        units: "esriSRUnit_Meter",
        f: "json",
      })

      try {
        const response = await fetch(`${queryUrl}?${params}`)
        if (!response.ok) {
          console.error(`Error querying Protection layer: ${response.status}`)
          return []
        }

        const data = await response.json()
        if (data.features && data.features.length > 0) {
          const layClass = data.features[0].attributes?.LAY_CLASS
          if (layClass) {
            return [{
              layerId: 2,
              layerName: "Protection Layer",
              source: source,
              attributes: {
                LAY_CLASS: layClass
              }
            }]
          }
        }
      } catch (error) {
        console.error("Error querying Protection layer:", error)
      }
      return []
    }

    // Handle Principal Planning Layers
    const layersToQuery = [
      { id: 14, name: "Heritage" },
      { id: 13, name: "Height of Building" },
      { id: 11, name: "Land Zoning" },
      { id: 12, name: "Minimum Lot Size" },
      { id: 15, name: "Local Environmental Plan" }
    ]

    const results: LayerInfo[] = []

    for (const layer of layersToQuery) {
      const queryUrl = `${mapServerUrl}/${layer.id}/query`
      const params = new URLSearchParams({
        where: "",
        text: "",
        objectIds: "",
        time: "",
        timeRelation: "esriTimeRelationOverlaps",
        geometry: `${coords.longitude},${coords.latitude}`,
        geometryType: "esriGeometryPoint",
        outFields: "*",
        inSR: "4326",
        spatialRel: "esriSpatialRelIntersects",
        distance: "",
        units: "esriSRUnit_Meter",
        f: "json",
      })

      try {
        const response = await fetch(`${queryUrl}?${params}`)
        if (!response.ok) {
          console.error(`Error querying layer ${layer.name}: ${response.status}`)
          continue
        }

        const data = await response.json()
        if (data.features && data.features.length > 0) {
          const attributes = data.features[0].attributes
          let filteredAttributes: Record<string, string | number | null> = {}

          switch (layer.name) {
            case "Local Environmental Plan":
              if (attributes.EPI_NAME || attributes.LGA_NAME) {
                filteredAttributes = {
                  EPI_NAME: attributes.EPI_NAME || "N/A",
                  LGA_NAME: attributes.LGA_NAME || "N/A"
                }
              }
              break
            case "Height of Building":
              if (attributes.MAX_B_H) {
                filteredAttributes = {
                  LAY_NAME: "Maximum Building Height (m)",
                  MAX_B_H: attributes.MAX_B_H || "N/A",
                  UNITS: attributes.UNITS || "m"
                }
              }
              break
            case "Land Zoning":
              if (attributes.LAY_CLASS || attributes.SYM_CODE) {
                filteredAttributes = {
                  LAY_CLASS: attributes.LAY_CLASS || "N/A",
                  SYM_CODE: attributes.SYM_CODE || "N/A"
                }
              }
              break
            case "Minimum Lot Size":
              if (attributes.LOT_SIZE) {
                filteredAttributes = {
                  LOT_SIZE: attributes.LOT_SIZE || "N/A",
                  UNITS: attributes.UNITS || "m²"
                }
              }
              break
            case "Heritage":
              if (attributes.LAY_CLASS || attributes.HID || attributes.HNAME || attributes.SIG) {
                filteredAttributes = {
                  LAY_CLASS: attributes.LAY_CLASS || "N/A",
                  HID: attributes.HID || "N/A",
                  HNAME: attributes.HNAME || "N/A",
                  SIG: attributes.SIG || "N/A"
                }
              }
              break
          }

          if (Object.keys(filteredAttributes).length > 0) {
            results.push({
              layerId: layer.id,
              layerName: layer.name,
              source: source,
              attributes: filteredAttributes
            })
          }
        }
      } catch (error) {
        console.error(`Error querying layer ${layer.name}:`, error)
      }
    }

    return results
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Property Search</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              placeholder="Enter address (e.g., 63 Elgin St Gunnedah)"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleSearch} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                "Search"
              )}
            </Button>
          </div>

          {error && (
            <div className="text-sm text-red-500 mt-2">
              {error}
            </div>
          )}

          {coordinates && coordinates.longitude && coordinates.latitude && (
            <div className="mt-4">
              <h3 className="text-sm font-medium mb-2">Coordinates</h3>
              <p className="text-sm text-muted-foreground">
                Longitude: {coordinates.longitude.toFixed(6)}, Latitude: {coordinates.latitude.toFixed(6)}
              </p>
            </div>
          )}

          {/* Principal Planning Layers Section */}
          {layersInfo.length > 0 && (
            <div className="mt-6 space-y-8">
              <h3 className="text-lg font-medium">Principal Planning Layers</h3>
              {layersInfo.map((layerInfo, index) => (
                <div key={`${layerInfo.source}-${layerInfo.layerId}-${index}`} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="text-md font-medium">{layerInfo.layerName}</h4>
                    <span className="text-xs text-muted-foreground">{layerInfo.source}</span>
                  </div>
                  <Separator />
                  {Object.keys(layerInfo.attributes).length > 0 ? (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Property</TableHead>
                            <TableHead>Value</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {Object.entries(layerInfo.attributes).map(([key, value]) => (
                            <TableRow key={key}>
                              <TableCell className="font-medium">{formatAttributeName(key)}</TableCell>
                              <TableCell>{value !== null ? String(value) : "N/A"}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No information available for this layer at this location.
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Protection Layers Section */}
          {protectionLayersInfo.length > 0 ? (
            <div className="mt-6 space-y-8">
              <h3 className="text-lg font-medium">Protection Layers</h3>
              {protectionLayersInfo.map((layerInfo, index) => (
                <div key={`${layerInfo.source}-${layerInfo.layerId}-${index}`} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="text-md font-medium">{layerInfo.layerName}</h4>
                    <span className="text-xs text-muted-foreground">{layerInfo.source}</span>
                  </div>
                  <Separator />
                  {Object.keys(layerInfo.attributes).length > 0 ? (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Property</TableHead>
                            <TableHead>Value</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {Object.entries(layerInfo.attributes).map(([key, value]) => (
                            <TableRow key={key}>
                              <TableCell className="font-medium">{formatAttributeName(key)}</TableCell>
                              <TableCell>{value !== null ? String(value) : "N/A"}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No information available for this layer at this location.
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : coordinates && !loading ? (
            <div className="mt-6">
              <h3 className="text-lg font-medium">Protection Layers</h3>
              <Alert className="mt-2">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>No Protection Data</AlertTitle>
                <AlertDescription>No protection information found for this address.</AlertDescription>
              </Alert>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}
