'use client'

import { useState } from 'react'
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { geocodeAddress, getZoningFromAddress } from "../../lib/geocoding-service"

interface SearchResults {
  address: string
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
  }
}

export default function PropertyLookupPage() {
  const [address, setAddress] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async () => {
    if (!address.trim()) {
      setError('Please enter an address')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // First get the coordinates
      const coords = await geocodeAddress(address)
      
      if (!coords.longitude || !coords.latitude) {
        setError('Address not found')
        return
      }

      // Then get the planning layers data
      const response = await fetch(`/api/geocode?address=${encodeURIComponent(address)}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch property information')
      }

      setSearchResults(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Search failed:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-4">Property Search</h1>
        <div className="flex gap-2">
          <Input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter address..."
            className="flex-1"
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button 
            onClick={handleSearch}
            disabled={loading}
            className="bg-[#0f172a] text-white hover:bg-[#1e293b]"
          >
            {loading ? 'Searching...' : 'Search'}
          </Button>
        </div>
        {error && (
          <p className="text-red-500 mt-2 text-sm">{error}</p>
        )}
      </div>

      {searchResults && (
        <div className="space-y-6">
          {/* Coordinates Section */}
          <div>
            <h2 className="text-lg font-semibold mb-2">Coordinates</h2>
            <p className="text-gray-600">
              Longitude: {searchResults.coordinates.longitude.toFixed(6)}, 
              Latitude: {searchResults.coordinates.latitude.toFixed(6)}
            </p>
          </div>

          {/* Principal Planning Layers Section */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Principal Planning Layers</h2>
            {searchResults.planningLayers.epiLayers.map((layer, index) => {
              if (!layer.attributes || Object.keys(layer.attributes).length === 0) return null
              
              return (
                <div key={index} className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">{layer.layer}</h3>
                    <span className="text-xs text-gray-500">Principal Planning Layers</span>
                  </div>
                  <div className="border rounded">
                    <table className="w-full">
                      <tbody>
                        {Object.entries(layer.attributes).map(([key, value]) => (
                          <tr key={key} className="border-b last:border-b-0">
                            <td className="py-2 px-4 text-sm uppercase text-gray-600 w-1/3">{key}</td>
                            <td className="py-2 px-4">{value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Protection Layers Section */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Protection Layers</h2>
            {searchResults.planningLayers.protectionLayers.length > 0 ? (
              searchResults.planningLayers.protectionLayers.map((layer, index) => (
                <div key={index} className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">{layer.layer}</h3>
                    <span className="text-xs text-gray-500">Protection</span>
                  </div>
                  <div className="border rounded">
                    <table className="w-full">
                      <tbody>
                        {Object.entries(layer.attributes).map(([key, value]) => (
                          <tr key={key} className="border-b last:border-b-0">
                            <td className="py-2 px-4 text-sm uppercase text-gray-600 w-1/3">{key}</td>
                            <td className="py-2 px-4">{value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-gray-50 rounded p-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="font-medium">No Protection Data</p>
                    <p className="text-sm">No protection information found for this address.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="text-xs text-gray-500 mt-4">
            Data provided by NSW Planning Services and ArcGIS REST API
          </div>
        </div>
      )}
    </div>
  )
} 