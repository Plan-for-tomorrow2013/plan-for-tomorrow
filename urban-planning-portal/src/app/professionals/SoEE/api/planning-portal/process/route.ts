import { type NextRequest, NextResponse } from "next/server"
import { getDcpStandards } from "@/app/professionals/SoEE/lib/dcp-standards"

interface ProcessedFormData {
  lepName: string
  zoning: string
  heightOfBuildings: string
  floorSpaceRatio: string
  dcpName: string
  dcpStandards: {
    frontSetbackControl: string
    secondaryFrontSetbackControl: string
    rearSetbackGroundControl: string
    rearSetbackUpperControl: string
    sideSetbackNorthGroundControl: string
    sideSetbackNorthUpperControl: string
    sideSetbackSouthGroundControl: string
    sideSetbackSouthUpperControl: string
    siteCoverageControl: string
    landscapedAreaControl: string
    parkingControl: string
  }
}

interface ProcessResponse {
  success: boolean
  data?: ProcessedFormData
  error?: string
}

export async function POST(request: NextRequest): Promise<NextResponse<ProcessResponse>> {
  try {
    const body = await request.json()
    const { address, councilArea } = body

    if (!address || !councilArea) {
      return NextResponse.json({
        success: false,
        error: "Address and council area are required",
      })
    }

    // Get planning portal data (mock implementation)
    let lepName: string
    let dcpName: string
    const zoning = "R2 Low Density Residential"
    let heightOfBuildings = "8.5m"
    let floorSpaceRatio = "0.5:1"

    // Determine LEP and DCP names based on council area
    if (councilArea.toLowerCase().includes("cumberland")) {
      lepName = "Cumberland Local Environmental Plan 2021"
      dcpName = "Cumberland Development Control Plan 2021"
    } else if (councilArea.toLowerCase().includes("parramatta")) {
      lepName = "Parramatta Local Environmental Plan 2011"
      dcpName = "Parramatta Development Control Plan 2011"
      heightOfBuildings = "9m"
    } else if (councilArea.toLowerCase().includes("blacktown")) {
      lepName = "Blacktown Local Environmental Plan 2015"
      dcpName = "Blacktown Development Control Plan 2015"
    } else if (councilArea.toLowerCase().includes("liverpool")) {
      lepName = "Liverpool Local Environmental Plan 2008"
      dcpName = "Liverpool Development Control Plan 2008"
    } else if (councilArea.toLowerCase().includes("fairfield")) {
      lepName = "Fairfield Local Environmental Plan 2013"
      dcpName = "Fairfield Development Control Plan 2013"
    } else if (councilArea.toLowerCase().includes("campbelltown")) {
      lepName = "Campbelltown Local Environmental Plan 2015"
      dcpName = "Campbelltown Development Control Plan 2015"
    } else if (councilArea.toLowerCase().includes("penrith")) {
      lepName = "Penrith Local Environmental Plan 2010"
      dcpName = "Penrith Development Control Plan 2014"
    } else if (councilArea.toLowerCase().includes("hills")) {
      lepName = "The Hills Local Environmental Plan 2012"
      dcpName = "The Hills Development Control Plan 2012"
    } else if (councilArea.toLowerCase().includes("canterbury-bankstown")) {
      lepName = "Canterbury-Bankstown Local Environmental Plan 2023"
      dcpName = "Canterbury-Bankstown Development Control Plan 2023"
    } else if (councilArea.toLowerCase().includes("sydney")) {
      lepName = "Sydney Local Environmental Plan 2012"
      dcpName = "Sydney Development Control Plan 2012"
      heightOfBuildings = "12m"
      floorSpaceRatio = "1:1"
    } else {
      // Extract council name for generic LEP/DCP names
      const councilNameMatch = councilArea.match(/^(.+?)\s+(City\s+)?Council$/i)
      const baseName = councilNameMatch ? councilNameMatch[1] : councilArea
      lepName = `${baseName} Local Environmental Plan`
      dcpName = `${baseName} Development Control Plan`
    }

    // Get DCP standards for the council
    const dcpStandards = getDcpStandards(councilArea)

    const processedData: ProcessedFormData = {
      lepName,
      zoning,
      heightOfBuildings,
      floorSpaceRatio,
      dcpName,
      dcpStandards,
    }

    return NextResponse.json({
      success: true,
      data: processedData,
    })
  } catch (error) {
    console.error("Error processing planning portal data:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to process planning data",
    })
  }
}
