"use client"

import { useState, useEffect } from "react"
import { Button } from "@shared/components/ui/button"
import { Card } from "@shared/components/ui/card"
import { Label } from "@shared/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@shared/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@shared/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@shared/components/ui/table"
import {
  calculateSingleDwellingWaste,
  calculateMultiUnitWaste,
  calculateCommercialWaste,
  wasteGenerationRates,
  commercialWasteRates,
  getCommercialWasteRatesByCategory,
} from "@/app/professionals/knowledge-base/waste-management/utils/waste-calculations"

// House types and their material quantities (in tonnes)
const houseTypes = {
  asbestos_fibro: {
    name: "Asbestos Fibro",
    materials: {
      asbestos_sheeting: 1.8,
      fittings: 1,
      roof_tiles: 5,
      plasterboard: 2,
      timber: 5.3,
      concrete_bricks: 20,
    },
    total: 35,
  },
  weatherboard: {
    name: "Weatherboard",
    materials: {
      asbestos_sheeting: 0,
      fittings: 1,
      roof_tiles: 5,
      plasterboard: 2,
      timber: 7.2,
      concrete_bricks: 50,
    },
    total: 65,
  },
  brick_veneer: {
    name: "Brick Veneer",
    materials: {
      asbestos_sheeting: 0,
      fittings: 1.5,
      roof_tiles: 12,
      plasterboard: 2.5,
      timber: 9.6,
      concrete_bricks: 120,
    },
    total: 146,
  },
  full_brick: {
    name: "Full Brick",
    materials: {
      asbestos_sheeting: 0,
      fittings: 1.5,
      roof_tiles: 8,
      plasterboard: 1,
      timber: 6.9,
      concrete_bricks: 180,
    },
    total: 197,
  },
}

// Material destinations
const destinations = {
  asbestos_sheeting: {
    name: "Asbestos Sheeting",
    onsite: "N/A",
    offsite: "Sita Australia",
    disposal: "N/A",
  },
  fittings: {
    name: "Fittings",
    onsite: "N/A",
    offsite: "Sell and Parker",
    disposal: "N/A",
  },
  roof_tiles: {
    name: "Roof Tiles",
    onsite: "N/A",
    offsite: "Concrete Recyclers",
    disposal: "N/A",
  },
  plasterboard: {
    name: "Plasterboard",
    onsite: "N/A",
    offsite: "Sita Australia",
    disposal: "N/A",
  },
  timber: {
    name: "Timber",
    onsite: "N/A",
    offsite: "Brandown, Girraween Recycling",
    disposal: "N/A",
  },
  concrete_bricks: {
    name: "Concrete & Bricks",
    onsite: "N/A",
    offsite: "Brandown Concrete Recycling",
    disposal: "N/A",
  },
}

const constructionMaterials = {
  excavation: {
    name: "Excavation Materials",
    volume: 3.25,
    onsite: "Excavation soil to be reused for benching platform",
    offsite: "Re-use on site",
    disposal: "N/A",
  },
  green_waste: {
    name: "Green Waste",
    volume: 1.5,
    onsite: "N/A",
    offsite: "Transferred to Brandowns by Landscaper",
    disposal: "N/A",
  },
  bricks: {
    name: "Bricks",
    volume: 1.75,
    onsite: "Unbroken bricks to be kept on site for reuse",
    offsite: "Brandown, Lot 9 Elizabeth Drive, Kemps Creek NSW",
    disposal: "N/A",
  },
  concrete: {
    name: "Concrete",
    volume: 1.25,
    onsite: "To be spread on driveway to form part of Temp vehicle access",
    offsite: "Brandown, Lot 9 Elizabeth Drive, Kemps Creek NSW",
    disposal: "N/A",
  },
  asbestos: {
    name: "Asbestos Cement Roof & Wall Cladding",
    volume: 0,
    onsite: "N/A",
    offsite: "N/A",
    disposal: "N/A",
  },
  timber: {
    name: "Timber – Pine",
    volume: 2.25,
    onsite: "Reuse framework. Chip suitable for use in landscaping",
    offsite: "Brandown, Lot 9 Elizabeth Drive, Kemps Creek NSW",
    disposal: "N/A",
  },
  plasterboard: {
    name: "Plasterboard",
    volume: 6.5,
    onsite: "Break-up and use in landscape",
    offsite: "Sorted, piles and picked up by Boral Plasterboard",
    disposal: "N/A",
  },
  metals: {
    name: "Metals – Aluminium",
    volume: 1.25,
    onsite: "N/A",
    offsite: "Brandown, Lot 9 Elizabeth Drive, Kemps Creek NSW",
    disposal: "N/A",
  },
  tiles: {
    name: "Tiles",
    volume: 0.75,
    onsite: "Crush and use as granular fill in drainage excavations",
    offsite: "Brandown, Lot 9 Elizabeth Drive, Kemps Creek NSW",
    disposal: "N/A",
  },
  plastic: {
    name: "Other – Plastic, PVC",
    volume: 2.0,
    onsite: "N/A",
    offsite: "Brandown, Lot 9 Elizabeth Drive, Kemps Creek NSW",
    disposal: "N/A",
  },
}

const wastePercentages = {
  timber: {
    name: "Timber",
    min: 5,
    max: 7,
  },
  plasterboard: {
    name: "Plasterboard",
    min: 5,
    max: 20,
  },
  concrete: {
    name: "Concrete",
    min: 3,
    max: 5,
  },
  bricks: {
    name: "Bricks",
    min: 5,
    max: 10,
  },
  tiles: {
    name: "Tiles",
    min: 2,
    max: 5,
  },
  steel: {
    name: "Steel",
    min: 2.5,
    max: 5,
  },
}

// Add this after the wastePercentages object
const ongoingWasteTypes = {
  residential: {
    name: "Residential",
    description: "For ongoing waste management in residential properties",
  },
  commercial: {
    name: "Commercial/Industrial",
    description: "For ongoing waste management in commercial or industrial properties",
  },
}

type ApartmentCounts = {
  studio: number
  twoBedroom: number
  threeBedroom: number
}

// Add this type definition after the ApartmentCounts type
type CommercialData = {
  businessType: keyof typeof commercialWasteRates
  floorArea: number
  operatingDays: number
  businessCategory: string
}

// Update the DemolitionData type
type DemolitionData = {
  houseType: keyof typeof houseTypes
  results: null | {
    materials: Record<
      string,
      {
        quantity: number
        destinations: {
          onsite: string
          offsite: string
          disposal: string
        }
      }
    >
    total: number
  }
}

export default function WasteCalculator() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("demolition")
  const [commercialCategories, setCommercialCategories] = useState(getCommercialWasteRatesByCategory())

  // Demolition state
  const [demolitionData, setDemolitionData] = useState<DemolitionData>({
    houseType: "asbestos_fibro",
    results: null,
  })

  // Add after the demolitionData state
  const [materialQuantities, setMaterialQuantities] = useState({
    timber: 0,
    plasterboard: 0,
    concrete: 0,
    bricks: 0,
    tiles: 0,
    steel: 0,
  })

  // Add this after the materialQuantities state
  const [ongoingType, setOngoingType] = useState<"residential" | "commercial">("residential")

  const [residentialType, setResidentialType] = useState<"single" | "multi">("single")
  const [apartmentCounts, setApartmentCounts] = useState<ApartmentCounts>({
    studio: 0,
    twoBedroom: 0,
    threeBedroom: 0,
  })

  // Add this state after the apartmentCounts state
  const [commercialData, setCommercialData] = useState<CommercialData>({
    businessType: "retail_small",
    floorArea: 100,
    operatingDays: 5,
    businessCategory: "retail",
  })

  const [commercialResults, setCommercialResults] = useState<any>(null)

  const [singleDwellingResults, setSingleDwellingResults] = useState(calculateSingleDwellingWaste())
  const [multiUnitResults, setMultiUnitResults] = useState<any>(null)

  // Keep your existing construction and ongoing states here...

  useEffect(() => {
    const results = calculateMultiUnitWaste(apartmentCounts)
    setMultiUnitResults(results)
  }, [apartmentCounts])

  // Add this useEffect after the existing useEffect
  useEffect(() => {
    const results = calculateCommercialWaste(
      commercialData.businessType,
      commercialData.floorArea,
      commercialData.operatingDays,
    )
    setCommercialResults(results)
  }, [commercialData])

  const calculateDemolitionWaste = () => {
    const { houseType } = demolitionData
    const houseData = houseTypes[houseType]

    const results = {
      materials: Object.entries(houseData.materials).reduce(
        (acc, [material, quantity]) => {
          acc[material] = {
            quantity,
            destinations: {
              onsite: destinations[material as keyof typeof destinations].onsite,
              offsite: destinations[material as keyof typeof destinations].offsite,
              disposal: destinations[material as keyof typeof destinations].disposal,
            },
          }
          return acc
        },
        {} as Record<string, any>,
      ),
      total: houseData.total,
    }

    setDemolitionData((prev) => ({ ...prev, results }))
  }

  // Keep your existing construction and ongoing calculation functions here...

  if (!isOpen) {
    return (
      <Button className="bg-amber-800 hover:bg-amber-900 text-white" onClick={() => setIsOpen(true)}>
        Open Waste Calculator
      </Button>
    )
  }

  return (
    <div className="mt-4">
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Waste Estimation Calculator</h2>

        <Tabs defaultValue="demolition" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="demolition">Demolition</TabsTrigger>
            <TabsTrigger value="construction">Construction</TabsTrigger>
            <TabsTrigger value="ongoing">Ongoing</TabsTrigger>
          </TabsList>

          {/* Demolition Tab */}
          <TabsContent value="demolition" className="space-y-6">
            <div>
              <Label htmlFor="demolition-house-type">Existing Construction Type</Label>
              <Select
                value={demolitionData.houseType}
                onValueChange={(value: keyof typeof houseTypes) =>
                  setDemolitionData((prev) => ({ ...prev, houseType: value }))
                }
              >
                <SelectTrigger id="demolition-house-type">
                  <SelectValue placeholder="Select house type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(houseTypes).map(([value, { name }]) => (
                    <SelectItem key={value} value={value}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Close
              </Button>
              <Button onClick={calculateDemolitionWaste}>Calculate Demolition Waste</Button>
            </div>

            {demolitionData.results && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4">Demolition Waste Results</h3>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Materials on site</TableHead>
                      <TableHead>Quantity (tonnes)</TableHead>
                      <TableHead>On-site</TableHead>
                      <TableHead>Off-Site (Reuse & Recycling)</TableHead>
                      <TableHead>Disposal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(demolitionData.results.materials).map(([material, data]) => (
                      <TableRow key={material}>
                        <TableCell className="font-medium">{destinations[material as keyof typeof destinations].name}</TableCell>
                        <TableCell>{data.quantity.toFixed(1)}</TableCell>
                        <TableCell>{data.destinations.onsite}</TableCell>
                        <TableCell>{data.destinations.offsite}</TableCell>
                        <TableCell>{data.destinations.disposal}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="font-bold">
                      <TableCell>Total</TableCell>
                      <TableCell>{demolitionData.results.total}</TableCell>
                      <TableCell colSpan={3}></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          {/* Construction Tab */}
          <TabsContent value="construction" className="space-y-6">
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4">Waste Percentages Reference</h3>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Materials</TableHead>
                    <TableHead>Percentage of Waste / Total Materials Ordered</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(wastePercentages).map(([key, material]) => (
                    <TableRow key={key}>
                      <TableCell className="font-medium">{material.name}</TableCell>
                      <TableCell>
                        {material.min} - {material.max}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="my-6 grid grid-cols-2 gap-4">
                {Object.entries(wastePercentages).map(([key, material]) => (
                  <div key={key} className="space-y-2">
                    <Label htmlFor={`material-${key}`}>Total {material.name} Ordered (m³)</Label>
                    <input
                      type="number"
                      id={`material-${key}`}
                      className="w-full p-2 border rounded"
                      value={materialQuantities[key as keyof typeof materialQuantities]}
                      onChange={(e) =>
                        setMaterialQuantities((prev) => ({
                          ...prev,
                          [key]: Number.parseFloat(e.target.value) || 0,
                        }))
                      }
                    />
                  </div>
                ))}
              </div>

              <h3 className="text-lg font-semibold mb-4">Construction Waste Management</h3>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type of Material</TableHead>
                    <TableHead>Estimated Volume (m³)</TableHead>
                    <TableHead>On-site</TableHead>
                    <TableHead>Off-Site</TableHead>
                    <TableHead>Disposal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(constructionMaterials).map(([key, material]) => (
                    <TableRow key={key}>
                      <TableCell className="font-medium">{material.name}</TableCell>
                      <TableCell>
                        {key in wastePercentages
                          ? `${((materialQuantities[key as keyof typeof materialQuantities] * wastePercentages[key as keyof typeof wastePercentages].max) / 100).toFixed(2)}m³`
                          : `${material.volume}m²`}
                      </TableCell>
                      <TableCell>{material.onsite}</TableCell>
                      <TableCell>{material.offsite}</TableCell>
                      <TableCell>{material.disposal}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Ongoing Tab */}
          <TabsContent value="ongoing" className="space-y-6">
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4">Ongoing Waste Management</h3>

              <div className="flex space-x-4 mb-6">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="residential"
                    name="ongoing-type"
                    className="mr-2 h-4 w-4"
                    checked={ongoingType === "residential"}
                    onChange={() => setOngoingType("residential")}
                  />
                  <Label htmlFor="residential">Residential</Label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="commercial"
                    name="ongoing-type"
                    className="mr-2 h-4 w-4"
                    checked={ongoingType === "commercial"}
                    onChange={() => setOngoingType("commercial")}
                  />
                  <Label htmlFor="commercial">Commercial/Industrial</Label>
                </div>
              </div>

              {ongoingType === "residential" && (
                <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                  <h4 className="font-medium mb-4">Residential Waste Management</h4>

                  <div className="mb-6">
                    <Label htmlFor="residential-type">Development Type</Label>
                    <Select
                      value={residentialType}
                      onValueChange={(value: "single" | "multi") => setResidentialType(value)}
                    >
                      <SelectTrigger id="residential-type">
                        <SelectValue placeholder="Select development type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="single">Single Dwelling / Dual Occupancy</SelectItem>
                        <SelectItem value="multi">Multi Unit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {residentialType === "single" ? (
                    <div className="mt-4">
                      <h5 className="font-medium mb-4">Waste Generation Estimates</h5>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Type of Waste to be Generated</TableHead>
                            <TableHead>Expected Volume Per Week</TableHead>
                            <TableHead>Proposed On-Site Storage and Treatment Facilities</TableHead>
                            <TableHead>Destination</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell>Other waste</TableCell>
                            <TableCell>80 Litres</TableCell>
                            <TableCell>Stored in mobile garbage bins awaiting collection</TableCell>
                            <TableCell>To landfill by council (weekly)</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Household recyclables (bottles, cans, paper)</TableCell>
                            <TableCell>55 litres</TableCell>
                            <TableCell>Stored in mobile garbage bins awaiting collection</TableCell>
                            <TableCell>Council recycling service (weekly)</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="text-red-600">Organic Waste</TableCell>
                            <TableCell>-</TableCell>
                            <TableCell className="text-red-600">
                              Stored in mobile garbage bins awaiting collection
                            </TableCell>
                            <TableCell className="text-red-600">Council recycling service (weekly)</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="mt-4 space-y-6">
                      <h5 className="font-medium mb-4">Apartment Details</h5>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="studio-count">1 Bedroom or Studio Units</Label>
                          <input
                            type="number"
                            id="studio-count"
                            min="0"
                            className="w-full p-2 border rounded mt-1"
                            value={apartmentCounts.studio}
                            onChange={(e) =>
                              setApartmentCounts((prev) => ({
                                ...prev,
                                studio: Number.parseInt(e.target.value) || 0,
                              }))
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="two-bedroom-count">2 Bedroom Units</Label>
                          <input
                            type="number"
                            id="two-bedroom-count"
                            min="0"
                            className="w-full p-2 border rounded mt-1"
                            value={apartmentCounts.twoBedroom}
                            onChange={(e) =>
                              setApartmentCounts((prev) => ({
                                ...prev,
                                twoBedroom: Number.parseInt(e.target.value) || 0,
                              }))
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="three-bedroom-count">3+ Bedroom Units</Label>
                          <input
                            type="number"
                            id="three-bedroom-count"
                            min="0"
                            className="w-full p-2 border rounded mt-1"
                            value={apartmentCounts.threeBedroom}
                            onChange={(e) =>
                              setApartmentCounts((prev) => ({
                                ...prev,
                                threeBedroom: Number.parseInt(e.target.value) || 0,
                              }))
                            }
                          />
                        </div>
                      </div>

                      {multiUnitResults && (
                        <div className="space-y-6">
                          <div className="mt-4">
                            <h5 className="font-medium mb-2">Waste Generation Summary</h5>
                            <p className="text-sm text-gray-600 mb-4">
                              Based on {multiUnitResults.totalOccupants.toFixed(1)} estimated occupants across{" "}
                              {apartmentCounts.studio + apartmentCounts.twoBedroom + apartmentCounts.threeBedroom} units
                            </p>

                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Waste Stream</TableHead>
                                  <TableHead>Weekly Volume</TableHead>
                                  <TableHead>Recommended Bins</TableHead>
                                  <TableHead>Total Capacity</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {Object.entries(multiUnitResults.weeklyVolumes).map(([wasteType, volume]) => (
                                  <TableRow key={wasteType}>
                                    <TableCell className="font-medium">
                                      {wasteGenerationRates[wasteType].name}
                                    </TableCell>
                                    <TableCell>{volume as number} L</TableCell>
                                    <TableCell>
                                      {Object.entries(multiUnitResults.binRequirements[wasteType].bins).map(
                                        ([size, count]) => (
                                          <div key={size} className="mb-1">
                                            {count as number}x {size}L bins
                                          </div>
                                        ),
                                      )}
                                    </TableCell>
                                    <TableCell>{multiUnitResults.binRequirements[wasteType].totalCapacity} L</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>

                          <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
                            <h5 className="font-medium mb-2 text-blue-800">Waste Storage Area Requirements</h5>
                            <p className="text-sm text-blue-700 mb-2">
                              Your development requires a dedicated waste storage area to accommodate:
                            </p>
                            <ul className="list-disc pl-5 text-sm text-blue-700">
                              <li>
                                {multiUnitResults.binRequirements.general.totalBins} general waste bins (
                                {Object.entries(multiUnitResults.binRequirements.general.bins)
                                  .map(([size, count]) => `${count}x ${size}L`)
                                  .join(", ")}
                                )
                              </li>
                              <li>
                                {multiUnitResults.binRequirements.recycling.totalBins} recycling bins (
                                {Object.entries(multiUnitResults.binRequirements.recycling.bins)
                                  .map(([size, count]) => `${count}x ${size}L`)
                                  .join(", ")}
                                )
                              </li>
                              <li>
                                {multiUnitResults.binRequirements.organic.totalBins} organic waste bins (
                                {Object.entries(multiUnitResults.binRequirements.organic.bins)
                                  .map(([size, count]) => `${count}x ${size}L`)
                                  .join(", ")}
                                )
                              </li>
                            </ul>
                            <p className="text-sm text-blue-700 mt-2">
                              Ensure the waste storage area is easily accessible for collection vehicles and residents.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
              {ongoingType === "commercial" ? (
                <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                  <h4 className="font-medium mb-4">Commercial/Industrial Waste Management</h4>

                  <div className="mb-6">
                    <Label htmlFor="business-category">Business Category</Label>
                    <Select
                      value={commercialData.businessCategory}
                      onValueChange={(value: string) => {
                        const firstBusinessType = commercialCategories[value][0].id as keyof typeof commercialWasteRates
                        setCommercialData((prev) => ({
                          ...prev,
                          businessCategory: value,
                          businessType: firstBusinessType,
                        }))
                      }}
                    >
                      <SelectTrigger id="business-category">
                        <SelectValue placeholder="Select business category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="retail">Retail</SelectItem>
                        <SelectItem value="food">Commercial Food & Beverage</SelectItem>
                        <SelectItem value="other">Other Commercial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <Label htmlFor="business-type">Business Type</Label>
                      <Select
                        value={commercialData.businessType as string}
                        onValueChange={(value: string) =>
                          setCommercialData((prev) => ({ ...prev, businessType: value }))
                        }
                      >
                        <SelectTrigger id="business-type">
                          <SelectValue placeholder="Select business type" />
                        </SelectTrigger>
                        <SelectContent>
                          {commercialCategories[commercialData.businessCategory as keyof typeof commercialCategories].map((business) => (
                            <SelectItem key={business.id} value={business.id}>
                              {business.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="operating-days">Operating Days per Week</Label>
                      <input
                        type="number"
                        id="operating-days"
                        min="1"
                        max="7"
                        className="w-full p-2 border rounded mt-1"
                        value={commercialData.operatingDays}
                        onChange={(e) =>
                          setCommercialData((prev) => ({
                            ...prev,
                            operatingDays: Number.parseInt(e.target.value) || 0,
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div className="mb-6">
                    <Label htmlFor="floor-area">Floor Area (m²)</Label>
                    <input
                      type="number"
                      id="floor-area"
                      min="1"
                      className="w-full p-2 border rounded mt-1"
                      value={commercialData.floorArea}
                      onChange={(e) =>
                        setCommercialData((prev) => ({
                          ...prev,
                          floorArea: Number.parseInt(e.target.value) || 0,
                        }))
                      }
                    />
                  </div>

                  {commercialResults && (
                    <div className="space-y-6">
                      <div className="mt-4">
                        <h5 className="font-medium mb-2">Waste Generation Summary</h5>
                        <p className="text-sm text-gray-600 mb-4">
                          Based on {commercialResults.floorArea}m²{" "}
                          {commercialWasteRates[commercialResults.businessType].name} operating{" "}
                          {commercialResults.operatingDays} days per week
                        </p>

                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Waste Stream</TableHead>
                              <TableHead>Daily Volume</TableHead>
                              <TableHead>Weekly Volume</TableHead>
                              <TableHead>Recommended Bins</TableHead>
                              <TableHead>Total Capacity</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {Object.entries(commercialResults.weeklyVolumes).map(([wasteType, weeklyVolume]) => (
                              <TableRow key={wasteType}>
                                <TableCell className="font-medium">{wasteGenerationRates[wasteType].name}</TableCell>
                                <TableCell>{commercialResults.dailyVolumes[wasteType].toFixed(0)} L</TableCell>
                                <TableCell>{weeklyVolume as number} L</TableCell>
                                <TableCell>
                                  {Object.entries(commercialResults.binRequirements[wasteType].bins).map(
                                    ([size, count]) => (
                                      <div key={size} className="mb-1">
                                        {count as unknown as number}x {size as unknown as number}L bins
                                      </div>
                                    ),
                                  )}
                                </TableCell>
                                <TableCell>{commercialResults.binRequirements[wasteType].totalCapacity} L</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>

                      <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
                        <h5 className="font-medium mb-2 text-blue-800">Waste Storage Area Requirements</h5>
                        <p className="text-sm text-blue-700 mb-2">
                          Your {commercialWasteRates[commercialResults.businessType].name} requires a dedicated waste
                          storage area to accommodate:
                        </p>
                        <ul className="list-disc pl-5 text-sm text-blue-700">
                          <li>
                            {commercialResults.binRequirements.general.totalBins} general waste bins (
                            {Object.entries(commercialResults.binRequirements.general.bins)
                              .map(([size, count]) => `${count}x ${size}L`)
                              .join(", ")}
                            )
                          </li>
                          <li>
                            {commercialResults.binRequirements.recycling.totalBins} recycling bins (
                            {Object.entries(commercialResults.binRequirements.recycling.bins)
                              .map(([size, count]) => `${count}x ${size}L`)
                              .join(", ")}
                            )
                          </li>
                          <li>
                            {commercialResults.binRequirements.organic.totalBins} organic waste bins (
                            {Object.entries(commercialResults.binRequirements.organic.bins)
                              .map(([size, count]) => `${count}x ${size}L`)
                              .join(", ")}
                            )
                          </li>
                        </ul>
                        <p className="text-sm text-blue-700 mt-2">
                          Ensure the waste storage area is easily accessible for collection vehicles and staff.
                        </p>
                      </div>

                      <div className="bg-amber-50 p-4 rounded-md border border-amber-200">
                        <h5 className="font-medium mb-2 text-amber-800">Additional Considerations</h5>
                        <ul className="list-disc pl-5 text-sm text-amber-700">
                          <li>Commercial waste may require more frequent collection than residential waste</li>
                          <li>
                            Consider separate collection arrangements for specific waste streams (e.g., cardboard,
                            glass)
                          </li>
                          <li>Food businesses should implement systems to manage food waste efficiently</li>
                          <li>Consult with your local council about commercial waste collection services</li>
                          <li>Consider waste compactors for high-volume waste generators</li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}

