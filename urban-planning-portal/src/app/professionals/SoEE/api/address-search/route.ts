import { type NextRequest, NextResponse } from "next/server"

interface AddressSuggestion {
  address: string
  councilArea: string
  lotNumber?: string
  sectionNumber?: string
  dpNumber?: string
}

interface AddressSearchResponse {
  suggestions: AddressSuggestion[]
  source: "nsw-planning-portal"
}

export async function GET(request: NextRequest): Promise<NextResponse<AddressSearchResponse | { error: string }>> {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get("query")

  if (!query || query.length < 3) {
    return NextResponse.json({
      suggestions: [],
      source: "nsw-planning-portal" as const,
    })
  }

  try {
    // TODO: Implement NSW Planning Portal API integration
    // This endpoint will be used when AddressSearch component is integrated
    // For now, return empty suggestions as the component is not in use
    
    return NextResponse.json({
      suggestions: [],
      source: "nsw-planning-portal" as const,
    })
  } catch (error) {
    console.error("Error in address search:", error)
    return NextResponse.json({ error: "Failed to search addresses" }, { status: 500 })
  }
}
