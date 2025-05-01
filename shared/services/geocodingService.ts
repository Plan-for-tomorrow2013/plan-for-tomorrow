// Function to geocode an address
export async function geocodeAddress(address: string) {
  const geocodeUrl = "https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates"

  const params = new URLSearchParams({
    SingleLine: address,
    f: "json",
    outFields: "Match_addr,Addr_type",
  })

  try {
    const response = await fetch(`${geocodeUrl}?${params}`)

    if (response.ok) {
      const data = await response.json()

      if (data.candidates && data.candidates.length > 0) {
        // Take the first match
        const candidate = data.candidates[0]
        const location = candidate.location
        console.log(`Address found: ${candidate.address}`)
        return { longitude: location.x, latitude: location.y }
      } else {
        console.log(`No location found for the address: ${address}`)
        return { longitude: null, latitude: null }
      }
    } else {
      console.log(`Error in geocoding API: ${response.status}`)
      return { longitude: null, latitude: null }
    }
  } catch (error) {
    console.error(`Exception in geocoding API: ${error instanceof Error ? error.message : String(error)}`)
    return { longitude: null, latitude: null }
  }
}

interface ZoningInfo {
  lga_name: string
  lay_class: string
  sym_code: string
  epi_type: string
  purpose: string
}

// Function to get zoning information
export async function getZoningInformation(longitude: number | null, latitude: number | null): Promise<ZoningInfo[] | null> {
  if (!longitude || !latitude) {
    console.log("Cannot retrieve zoning information without valid coordinates")
    return null
  }

  const arcgisServiceUrl = "https://mapprod3.environment.nsw.gov.au/arcgis/rest/services/Planning/EPI_Primary_Planning_Layers/MapServer"
  const queryUrl = `${arcgisServiceUrl}/2/query`

  const params = new URLSearchParams({
    where: "",
    text: "",
    objectIds: "",
    time: "",
    timeRelation: "esriTimeRelationOverlaps",
    geometry: `${longitude},${latitude}`,
    geometryType: "esriGeometryPoint",
    outFields: "LGA_NAME,LAY_CLASS,SYM_CODE,EPI_TYPE,PURPOSE",
    inSR: "4326",
    spatialRel: "esriSpatialRelIntersects",
    distance: "",
    units: "esriSRUnit_Meter",
    f: "json",
  })

  try {
    const response = await fetch(`${queryUrl}?${params}`)

    if (response.ok) {
      const data = await response.json()

      if (data.features && data.features.length > 0) {
        const results: ZoningInfo[] = []

        for (const feature of data.features) {
          const attributes = feature.attributes
          const zoningInfo: ZoningInfo = {
            lga_name: attributes.LGA_NAME || "N/A",
            lay_class: attributes.LAY_CLASS || "N/A",
            sym_code: attributes.SYM_CODE || "N/A",
            epi_type: attributes.EPI_TYPE || "N/A",
            purpose: attributes.PURPOSE || "N/A",
          }

          console.log(`LGA Name: ${zoningInfo.lga_name}`)
          console.log(`Layer Class: ${zoningInfo.lay_class}`)
          console.log(`Symbol Code: ${zoningInfo.sym_code}`)
          console.log(`EPI Type: ${zoningInfo.epi_type}`)
          console.log(`Purpose: ${zoningInfo.purpose}`)

          results.push(zoningInfo)
        }

        return results
      } else {
        console.log("No zoning information found for the provided coordinates.")
        return null
      }
    } else {
      console.log(`Error: Unable to reach the ArcGIS service. Status code: ${response.status}`)
      return null
    }
  } catch (error) {
    console.error(`Exception in zoning API: ${error instanceof Error ? error.message : String(error)}`)
    return null
  }
}

// Main function to get zoning from address
export async function getZoningFromAddress(address: string): Promise<ZoningInfo[] | null> {
  console.log(`Looking up zoning information for: ${address}`)

  const { longitude, latitude } = await geocodeAddress(address)

  if (longitude && latitude) {
    console.log(`Coordinates: Longitude = ${longitude}, Latitude = ${latitude}`)
    const zoningInfo = await getZoningInformation(longitude, latitude)
    return zoningInfo
  } else {
    console.log("Could not retrieve zoning information without valid coordinates.")
    return null
  }
}
