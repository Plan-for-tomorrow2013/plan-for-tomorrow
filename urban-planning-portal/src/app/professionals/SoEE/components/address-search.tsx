"use client"

import { useState, useEffect } from "react"
import { Search, Loader2, AlertCircle } from "lucide-react"
import { Input } from "@shared/components/ui/input"
import { Button } from "@shared/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@shared/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@shared/components/ui/popover"
import { Alert, AlertDescription } from "@shared/components/ui/alert"

interface AddressSuggestion {
  address: string
  councilArea: string
  lotNumber?: string
  sectionNumber?: string
  dpNumber?: string
}

interface LotDetails {
  lotNumber?: string
  sectionNumber?: string
  dpNumber?: string
}

interface AddressSearchProps {
  onAddressSelect: (address: string, councilArea: string, lotDetails?: LotDetails) => void
  initialValue?: string
}

export function AddressSearch({ onAddressSelect, initialValue = "" }: AddressSearchProps) {
  const [open, setOpen] = useState<boolean>(false)
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [selectedAddress, setSelectedAddress] = useState<string>(initialValue)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isMockData, setIsMockData] = useState<boolean>(false)

  // Set initial value if provided
  useEffect(() => {
    if (initialValue) {
      setSelectedAddress(initialValue)
    }
  }, [initialValue])

  // Search addresses using the API
  const searchAddresses = async (query: string): Promise<void> => {
    if (query.length < 3) {
      setSuggestions([])
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/address-search?query=${encodeURIComponent(query)}`)

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      setSuggestions(data.suggestions || [])

      // Check if we're using mock data
      setIsMockData(data.source === "mock")
    } catch (error) {
      console.error("Error fetching addresses:", error)
      setError("Failed to fetch address suggestions. Please try again or enter address manually.")
      setSuggestions([])
    } finally {
      setIsLoading(false)
    }
  }

  // Handle search input change with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length >= 3) {
        searchAddresses(searchQuery)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Handle search input change
  const handleSearchChange = (value: string): void => {
    setSearchQuery(value)
    if (value.length < 3) {
      setSuggestions([])
    }
  }

  // Handle address selection
  const handleAddressSelect = (address: string, councilArea: string): void => {
    setSelectedAddress(address)
    setOpen(false)

    // Format council area with proper capitalization and "Council" suffix
    let formattedCouncilArea = councilArea
    if (councilArea === "cumberland") {
      formattedCouncilArea = "Cumberland Council"
    } else if (councilArea === "parramatta") {
      formattedCouncilArea = "City of Parramatta"
    } else if (councilArea === "blacktown") {
      formattedCouncilArea = "Blacktown City Council"
    } else if (councilArea === "liverpool") {
      formattedCouncilArea = "Liverpool City Council"
    } else if (councilArea === "fairfield") {
      formattedCouncilArea = "Fairfield City Council"
    } else if (councilArea === "campbelltown") {
      formattedCouncilArea = "Campbelltown City Council"
    } else if (councilArea === "penrith") {
      formattedCouncilArea = "Penrith City Council"
    } else if (councilArea === "hills") {
      formattedCouncilArea = "The Hills Shire Council"
    } else if (councilArea === "canterbury-bankstown") {
      formattedCouncilArea = "Canterbury-Bankstown Council"
    } else if (councilArea === "sydney") {
      formattedCouncilArea = "City of Sydney"
    }

    // Mock lot details based on the address
    // In a real implementation, these would come from the NSW Planning Portal API
    let lotDetails: LotDetails = {}

    if (address.includes("9 Viola Place")) {
      lotDetails = {
        lotNumber: "53",
        sectionNumber: "",
        dpNumber: "231533",
      }
    } else if (address.includes("11 Viola Place")) {
      lotDetails = {
        lotNumber: "54",
        sectionNumber: "",
        dpNumber: "231533",
      }
    } else if (address.includes("7 Viola Place")) {
      lotDetails = {
        lotNumber: "52",
        sectionNumber: "",
        dpNumber: "231533",
      }
    } else if (address.includes("15 Smith Street")) {
      lotDetails = {
        lotNumber: "10",
        sectionNumber: "3",
        dpNumber: "456789",
      }
    }

    onAddressSelect(address, formattedCouncilArea, lotDetails)
  }

  return (
    <div className="relative">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="flex w-full items-center">
            <Input
              value={selectedAddress || searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClick={() => setOpen(true)}
              placeholder="Search for your property address..."
              className="w-full"
            />
            <Button variant="ghost" size="icon" className="absolute right-0 top-0 h-full" onClick={() => setOpen(true)}>
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </PopoverTrigger>
        <PopoverContent className="p-0" align="start" sideOffset={5} style={{ width: "calc(100% - 2rem)" }}>
          <Command>
            <CommandInput
              placeholder="Search for your property address..."
              value={searchQuery}
              onValueChange={handleSearchChange}
            />
            <CommandList>
              {isLoading && (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              )}

              {error && (
                <div className="p-2">
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                </div>
              )}

              {!isLoading && !error && (
                <>
                  {isMockData && (
                    <div className="px-2 pt-2">
                      <Alert variant="warning" className="bg-amber-50 text-amber-800 border-amber-200">
                        <AlertDescription className="text-xs">
                          Using sample address data. NSW Planning Portal integration is currently unavailable.
                        </AlertDescription>
                      </Alert>
                    </div>
                  )}

                  <CommandEmpty>
                    {searchQuery.length > 0 ? (
                      <div className="py-6 text-center text-sm">
                        No addresses found. Try a different search term or enter address manually.
                      </div>
                    ) : (
                      <div className="py-6 text-center text-sm">Start typing to search for addresses</div>
                    )}
                  </CommandEmpty>

                  <CommandGroup heading="Suggested Addresses">
                    {suggestions.map((item, index) => (
                      <CommandItem key={index} onSelect={() => handleAddressSelect(item.address, item.councilArea)}>
                        {item.address}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedAddress && (
        <p className="text-xs text-green-600 mt-1">
          {isMockData
            ? "Address selected (using sample data with lot details)"
            : "Address selected from NSW Planning Portal with lot details"}
        </p>
      )}
    </div>
  )
}

