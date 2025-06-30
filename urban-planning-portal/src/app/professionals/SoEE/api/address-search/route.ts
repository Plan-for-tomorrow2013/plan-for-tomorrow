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
  source: "nsw-planning-portal" | "mock"
}

export async function GET(request: NextRequest): Promise<NextResponse<AddressSearchResponse | { error: string }>> {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get("query")

  if (!query || query.length < 3) {
    return NextResponse.json({
      suggestions: [],
      source: "mock" as const,
    })
  }

  try {
    // In a real implementation, this would call the NSW Planning Portal API
    // For now, we'll return mock data
    const mockSuggestions: AddressSuggestion[] = [
      {
        address: "9 Viola Place, Greystanes NSW 2145",
        councilArea: "cumberland",
        lotNumber: "53",
        dpNumber: "231533",
      },
      {
        address: "11 Viola Place, Greystanes NSW 2145",
        councilArea: "cumberland",
        lotNumber: "54",
        dpNumber: "231533",
      },
      {
        address: "7 Viola Place, Greystanes NSW 2145",
        councilArea: "cumberland",
        lotNumber: "52",
        dpNumber: "231533",
      },
      {
        address: "15 Smith Street, Parramatta NSW 2150",
        councilArea: "parramatta",
        lotNumber: "10",
        sectionNumber: "3",
        dpNumber: "456789",
      },
      {
        address: "123 Main Street, Blacktown NSW 2148",
        councilArea: "blacktown",
        lotNumber: "1",
        dpNumber: "123456",
      },
    ]

    // Filter suggestions based on query
    const filteredSuggestions = mockSuggestions.filter((suggestion) =>
      suggestion.address.toLowerCase().includes(query.toLowerCase()),
    )

    return NextResponse.json({
      suggestions: filteredSuggestions,
      source: "mock" as const,
    })
  } catch (error) {
    console.error("Error in address search:", error)
    return NextResponse.json({ error: "Failed to search addresses" }, { status: 500 })
  }
}
