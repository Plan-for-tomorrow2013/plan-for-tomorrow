// This is a mock service that would be replaced with a real address lookup API
// Could use services like Google Places API, Australian GNAF, or council-specific APIs

export interface AddressDetails {
  fullAddress: string
  council: string
  state: string
  postcode: string
}

const MOCK_ADDRESSES: Record<string, AddressDetails> = {
  "9 Viola Place, Greystanes": {
    fullAddress: "9 Viola Place, Greystanes NSW 2145",
    council: "Cumberland Council",
    state: "NSW",
    postcode: "2145"
  },
  "458 Bells Line of Road, Kurmond": {
    fullAddress: "458 Bells Line of Road, Kurmond NSW 2757",
    council: "Hawkesbury Council",
    state: "NSW",
    postcode: "2757"
  }
}

export const addressService = {
  async searchAddresses(query: string): Promise<AddressDetails[]> {
    // In a real implementation, this would call an address lookup API
    return Object.entries(MOCK_ADDRESSES)
      .filter(([address]) => 
        address.toLowerCase().includes(query.toLowerCase())
      )
      .map(([_, details]) => details)
  },

  async getAddressDetails(address: string): Promise<AddressDetails | null> {
    // In a real implementation, this would validate and standardize the address
    return MOCK_ADDRESSES[address] || null
  }
} 