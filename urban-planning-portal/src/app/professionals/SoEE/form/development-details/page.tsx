"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/app/professionals/SoEE/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/professionals/SoEE/components/ui/card"
import { Input } from "@/app/professionals/SoEE/components/ui/input"
import { Label } from "@/app/professionals/SoEE/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/professionals/SoEE/components/ui/select"
import { Textarea } from "@/app/professionals/SoEE/components/ui/textarea"
import { Checkbox } from "@/app/professionals/SoEE/components/ui/checkbox"
import { ArrowLeft, ArrowRight, Save, Info } from "lucide-react"
import { FormProgress } from "@/app/professionals/SoEE/components/form-progress"
import Link from "next/link"
import { Popover, PopoverContent, PopoverTrigger } from "@/app/professionals/SoEE/components/ui/popover"
import { useEffect } from "react"

// Form validation schema
const formSchema = z.object({
  // Development Description
  developmentDescription: z.string().min(10, { message: "Please provide a detailed description" }),

  // Demolition
  demolitionRequired: z.boolean().default(false),
  demolitionDetails: z.string().optional(),

  // Height
  storeys: z.string().min(1, { message: "Number of storeys is required" }),
  buildingHeight: z.string().min(1, { message: "Building height is required" }),
  wallHeight: z.string().min(1, { message: "Wall height is required" }),

  // Setbacks
  frontSetback: z.string().min(1, { message: "Front setback is required" }),
  secondaryFrontSetback: z.string().optional(),
  rearSetbackGround: z.string().min(1, { message: "Ground level rear setback is required" }),
  rearSetbackUpper: z.string().optional(),
  sideSetbackOne: z.string().min(1, { message: "Side setback is required" }),
  sideSetbackTwo: z.string().min(1, { message: "Side setback is required" }),

  // Floor Area
  existingGFA: z.string().optional(),
  proposedGFA: z.string().min(1, { message: "Proposed GFA is required" }),
  totalGFA: z.string().min(1, { message: "Total GFA is required" }),
  floorSpaceRatio: z.string().min(1, { message: "FSR is required" }),

  // Site Coverage
  existingSiteCoverage: z.string().optional(),
  proposedSiteCoverage: z.string().min(1, { message: "Proposed site coverage is required" }),

  // Landscaping
  existingLandscapedArea: z.string().optional(),
  proposedLandscapedArea: z.string().min(1, { message: "Proposed landscaped area is required" }),
  landscapedAreaPercentage: z.string().min(1, { message: "Landscaped area percentage is required" }),

  // Materials and Finishes
  externalWalls: z.string().min(1, { message: "External walls material is required" }),
  roof: z.string().min(1, { message: "Roof material is required" }),
  windows: z.string().min(1, { message: "Windows material is required" }),
  otherMaterials: z.string().optional(),

  // Access and Parking
  vehicleAccess: z.string().min(1, { message: "Vehicle access information is required" }),
  carParkingSpaces: z.string().min(1, { message: "Car parking spaces information is required" }),
  pedestrianAccess: z.string().min(1, { message: "Pedestrian access information is required" }),

  // Stormwater
  stormwaterDisposal: z.string().min(1, { message: "Stormwater disposal information is required" }),

  // Waste Management
  wasteManagement: z.string().min(1, { message: "Waste management information is required" }),
})

type FormValues = z.infer<typeof formSchema>

export default function DevelopmentDetailsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const jobId = searchParams.get("job")

  // Initialize form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      // Development Description
      developmentDescription:
        "Alterations and additions to the existing dwelling house, including a first floor addition and ground floor extension to the rear.",

      // Demolition
      demolitionRequired: true,
      demolitionDetails: "Partial demolition of the rear portion of the existing dwelling and internal walls.",

      // Construction
      storeys: "2",
      buildingHeight: "7.2",
      wallHeight: "6.0",

      // Setbacks
      frontSetback: "6.5",
      secondaryFrontSetback: "",
      rearSetbackGround: "8.0",
      rearSetbackUpper: "10.0",
      sideSetbackOne: "1.5",
      sideSetbackTwo: "1.0",

      // Floor Area
      existingGFA: "150.0",
      proposedGFA: "100.0",
      totalGFA: "250.0",
      floorSpaceRatio: "0.5",

      // Site Coverage
      existingSiteCoverage: "30",
      proposedSiteCoverage: "40",

      // Landscaping
      existingLandscapedArea: "200.0",
      proposedLandscapedArea: "180.0",
      landscapedAreaPercentage: "36",

      // Materials and Finishes
      externalWalls: "Brick veneer with rendered finish",
      roof: "Colorbond steel in Monument (dark grey)",
      windows: "Aluminum framed in black",
      otherMaterials: "Timber cladding to feature walls",

      // Access and Parking
      vehicleAccess: "Existing driveway from Viola Place",
      carParkingSpaces: "2",
      pedestrianAccess: "Existing pathway from Viola Place",

      // Stormwater
      stormwaterDisposal: "Connected to existing stormwater system",

      // Waste Management
      wasteManagement: "Waste to be stored in council bins at the side of the dwelling",
    },
  })

  // Add calculation functions
  const calculateTotalGFAAndFSR = () => {
    const existingGFA = Number.parseFloat(form.getValues("existingGFA") || "0")
    const proposedGFA = Number.parseFloat(form.getValues("proposedGFA") || "0")

    if (!isNaN(existingGFA) && !isNaN(proposedGFA)) {
      // Calculate total GFA
      const totalGFA = (existingGFA + proposedGFA).toFixed(2)
      form.setValue("totalGFA", totalGFA)

      // Calculate FSR - using a default site area of 500m²
      // In a real application, this would come from the property details form
      const defaultSiteArea = 500
      if (defaultSiteArea > 0) {
        const fsr = (Number.parseFloat(totalGFA) / defaultSiteArea).toFixed(2)
        form.setValue("floorSpaceRatio", fsr)
      }
    }
  }

  const calculateLandscapedAreaPercentage = () => {
    const proposedLandscapedArea = Number.parseFloat(form.getValues("proposedLandscapedArea") || "0")
    // Using a default site area of 500m²
    // In a real application, this would come from the property details form
    const defaultSiteArea = 500

    if (!isNaN(proposedLandscapedArea) && defaultSiteArea > 0) {
      const percentage = Math.round((proposedLandscapedArea / defaultSiteArea) * 100)
      form.setValue("landscapedAreaPercentage", percentage.toString())
    }
  }

  // Handle form submission
  const onSubmit = (data: FormValues) => {
    console.log(data)
    // Save form data to state/localStorage/backend
    // Then navigate to the next step
    router.push(`/professionals/SoEE/form/planning?job=${jobId}`)
  }

  // Handle save draft functionality
  const handleSaveDraft = () => {
    const currentValues = form.getValues()
    // Save draft logic here
    console.log("Saving draft:", currentValues)
    // Show success message
  }

  // Add a useEffect to calculate values on initial load
  useEffect(() => {
    calculateTotalGFAAndFSR()
    calculateLandscapedAreaPercentage()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-10 px-4 max-w-3xl">
        {/* Progress Bar */}
        <FormProgress currentStep={3} />

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Development Details</CardTitle>
            <CardDescription>
              Describe the proposed development for your Statement of Environmental Effects
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Development Description */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Development Description</h3>
                <div className="space-y-2">
                  <Label htmlFor="developmentDescription">Detailed Description</Label>
                  <Textarea
                    id="developmentDescription"
                    placeholder="Provide a detailed description of the proposed development"
                    rows={4}
                    {...form.register("developmentDescription")}
                  />
                  {form.formState.errors.developmentDescription && (
                    <p className="text-sm text-red-500">{form.formState.errors.developmentDescription.message}</p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    Describe what you are proposing to build or modify on the site
                  </p>
                </div>
              </div>

              {/* Demolition */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Demolition</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="demolitionRequired"
                      checked={form.getValues("demolitionRequired")}
                      onCheckedChange={(checked) => form.setValue("demolitionRequired", checked === true)}
                    />
                    <Label htmlFor="demolitionRequired">Demolition Required</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Check if any demolition is required as part of the development
                  </p>
                </div>
                {form.watch("demolitionRequired") && (
                  <div className="space-y-2">
                    <Label htmlFor="demolitionDetails">Demolition Details</Label>
                    <Textarea
                      id="demolitionDetails"
                      placeholder="Describe what will be demolished"
                      rows={3}
                      {...form.register("demolitionDetails")}
                    />
                  </div>
                )}
              </div>

              {/* Building Height */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-medium">Building Height</h3>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-5 w-5">
                        <Info className="h-4 w-4" />
                        <span className="sr-only">Height measurement info</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                      <div className="space-y-2">
                        <h4 className="font-medium">How to Measure Building Height</h4>
                        <p className="text-sm text-muted-foreground">
                          Building height is measured from the natural ground level to the highest point of the
                          building.
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Wall height is measured from the natural ground level to the underside of the eaves.
                        </p>
                        <div className="mt-2">
                          <img
                            src="/placeholder.svg?height=150&width=300"
                            alt="Building height measurement diagram"
                            className="border rounded"
                          />
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="storeys">Number of Storeys</Label>
                    <Select
                      defaultValue={form.getValues("storeys")}
                      onValueChange={(value) => form.setValue("storeys", value)}
                    >
                      <SelectTrigger id="storeys">
                        <SelectValue placeholder="Select number of storeys" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1</SelectItem>
                        <SelectItem value="2">2</SelectItem>
                        <SelectItem value="3">3</SelectItem>
                        <SelectItem value="4+">4+</SelectItem>
                      </SelectContent>
                    </Select>
                    {form.formState.errors.storeys && (
                      <p className="text-sm text-red-500">{form.formState.errors.storeys.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="buildingHeight">Maximum Building Height (m)</Label>
                    <Input id="buildingHeight" placeholder="e.g. 7.2" {...form.register("buildingHeight")} />
                    {form.formState.errors.buildingHeight && (
                      <p className="text-sm text-red-500">{form.formState.errors.buildingHeight.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="wallHeight">Wall Height (m)</Label>
                    <Input id="wallHeight" placeholder="e.g. 6.0" {...form.register("wallHeight")} />
                    {form.formState.errors.wallHeight && (
                      <p className="text-sm text-red-500">{form.formState.errors.wallHeight.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Floor Area */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-medium">Floor Area</h3>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-5 w-5">
                        <Info className="h-4 w-4" />
                        <span className="sr-only">Floor area measurement info</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                      <div className="space-y-2">
                        <h4 className="font-medium">How to Calculate Floor Area</h4>
                        <p className="text-sm text-muted-foreground">
                          Gross Floor Area (GFA) is the sum of the floor area of each floor of a building measured from
                          the internal face of external walls.
                        </p>
                        <p className="text-sm text-muted-foreground">Floor Space Ratio (FSR) = Total GFA ÷ Site Area</p>
                        <div className="mt-2">
                          <img
                            src="/placeholder.svg?height=150&width=300"
                            alt="Floor area calculation diagram"
                            className="border rounded"
                          />
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="existingGFA">Existing Gross Floor Area (m²)</Label>
                    <Input
                      id="existingGFA"
                      placeholder="e.g. 150.0"
                      {...form.register("existingGFA")}
                      onChange={(e) => {
                        form.setValue("existingGFA", e.target.value)
                        calculateTotalGFAAndFSR()
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="proposedGFA">Proposed Additional GFA (m²)</Label>
                    <Input
                      id="proposedGFA"
                      placeholder="e.g. 100.0"
                      {...form.register("proposedGFA")}
                      onChange={(e) => {
                        form.setValue("proposedGFA", e.target.value)
                        calculateTotalGFAAndFSR()
                      }}
                    />
                    {form.formState.errors.proposedGFA && (
                      <p className="text-sm text-red-500">{form.formState.errors.proposedGFA.message}</p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="totalGFA">Total GFA (m²)</Label>
                    <Input
                      id="totalGFA"
                      placeholder="e.g. 250.0"
                      {...form.register("totalGFA")}
                      readOnly
                      className="bg-gray-50"
                    />
                    {form.formState.errors.totalGFA && (
                      <p className="text-sm text-red-500">{form.formState.errors.totalGFA.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="floorSpaceRatio">Floor Space Ratio</Label>
                    <Input
                      id="floorSpaceRatio"
                      placeholder="e.g. 0.5"
                      {...form.register("floorSpaceRatio")}
                      readOnly
                      className="bg-gray-50"
                    />
                    {form.formState.errors.floorSpaceRatio && (
                      <p className="text-sm text-red-500">{form.formState.errors.floorSpaceRatio.message}</p>
                    )}
                    <p className="text-sm text-muted-foreground">Total GFA divided by site area</p>
                  </div>
                </div>
              </div>

              {/* Setbacks */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-medium">Setbacks</h3>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-5 w-5">
                        <Info className="h-4 w-4" />
                        <span className="sr-only">Setback measurement info</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                      <div className="space-y-2">
                        <h4 className="font-medium">How to Measure Setbacks</h4>
                        <p className="text-sm text-muted-foreground">
                          Setbacks are measured from the property boundary to the external wall of the building.
                        </p>
                        <p className="text-sm text-muted-foreground">
                          For upper levels, measure from the property boundary to the external wall of the upper floor.
                        </p>
                        <div className="mt-2">
                          <img
                            src="/placeholder.svg?height=150&width=300"
                            alt="Setback measurement diagram"
                            className="border rounded"
                          />
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="frontSetback">Front Setback (m)</Label>
                    <Input id="frontSetback" placeholder="e.g. 6.5" {...form.register("frontSetback")} />
                    {form.formState.errors.frontSetback && (
                      <p className="text-sm text-red-500">{form.formState.errors.frontSetback.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="secondaryFrontSetback">Secondary Front Setback (m) (if corner lot)</Label>
                    <Input
                      id="secondaryFrontSetback"
                      placeholder="e.g. 3.0"
                      {...form.register("secondaryFrontSetback")}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="rearSetbackGround">Rear Setback (Ground Level) (m)</Label>
                    <Input id="rearSetbackGround" placeholder="e.g. 8.0" {...form.register("rearSetbackGround")} />
                    {form.formState.errors.rearSetbackGround && (
                      <p className="text-sm text-red-500">{form.formState.errors.rearSetbackGround.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rearSetbackUpper">Rear Setback (Upper Level) (m)</Label>
                    <Input id="rearSetbackUpper" placeholder="e.g. 10.0" {...form.register("rearSetbackUpper")} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sideSetbackOne">Side Setback 1 (m)</Label>
                    <Input id="sideSetbackOne" placeholder="e.g. 1.5" {...form.register("sideSetbackOne")} />
                    {form.formState.errors.sideSetbackOne && (
                      <p className="text-sm text-red-500">{form.formState.errors.sideSetbackOne.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sideSetbackTwo">Side Setback 2 (m)</Label>
                    <Input id="sideSetbackTwo" placeholder="e.g. 1.0" {...form.register("sideSetbackTwo")} />
                    {form.formState.errors.sideSetbackTwo && (
                      <p className="text-sm text-red-500">{form.formState.errors.sideSetbackTwo.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Site Coverage */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-medium">Site Coverage</h3>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-5 w-5">
                        <Info className="h-4 w-4" />
                        <span className="sr-only">Site coverage info</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                      <div className="space-y-2">
                        <h4 className="font-medium">How to Calculate Site Coverage</h4>
                        <p className="text-sm text-muted-foreground">
                          Site coverage is the percentage of the site area covered by buildings, measured as the area of
                          the site covered by roofed areas.
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Site Coverage (%) = (Building Footprint Area ÷ Site Area) × 100
                        </p>
                        <div className="mt-2">
                          <img
                            src="/placeholder.svg?height=150&width=300"
                            alt="Site coverage calculation diagram"
                            className="border rounded"
                          />
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="existingSiteCoverage">Existing Site Coverage (%)</Label>
                    <Input id="existingSiteCoverage" placeholder="e.g. 30" {...form.register("existingSiteCoverage")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="proposedSiteCoverage">Proposed Site Coverage (%)</Label>
                    <Input id="proposedSiteCoverage" placeholder="e.g. 40" {...form.register("proposedSiteCoverage")} />
                    {form.formState.errors.proposedSiteCoverage && (
                      <p className="text-sm text-red-500">{form.formState.errors.proposedSiteCoverage.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Landscaping */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-medium">Landscaping</h3>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-5 w-5">
                        <Info className="h-4 w-4" />
                        <span className="sr-only">Landscaping info</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                      <div className="space-y-2">
                        <h4 className="font-medium">How to Calculate Landscaped Area</h4>
                        <p className="text-sm text-muted-foreground">
                          Landscaped area is the part of a site used for growing plants, grasses and trees, but does not
                          include any building, structure or hard paved area.
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Landscaped Area (%) = (Landscaped Area ÷ Site Area) × 100
                        </p>
                        <div className="mt-2">
                          <img
                            src="/placeholder.svg?height=150&width=300"
                            alt="Landscaped area calculation diagram"
                            className="border rounded"
                          />
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="existingLandscapedArea">Existing Landscaped Area (m²)</Label>
                    <Input
                      id="existingLandscapedArea"
                      placeholder="e.g. 200.0"
                      {...form.register("existingLandscapedArea")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="proposedLandscapedArea">Proposed Landscaped Area (m²)</Label>
                    <Input
                      id="proposedLandscapedArea"
                      placeholder="e.g. 180.0"
                      {...form.register("proposedLandscapedArea")}
                      onChange={(e) => {
                        form.setValue("proposedLandscapedArea", e.target.value)
                        calculateLandscapedAreaPercentage()
                      }}
                    />
                    {form.formState.errors.proposedLandscapedArea && (
                      <p className="text-sm text-red-500">{form.formState.errors.proposedLandscapedArea.message}</p>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="landscapedAreaPercentage">Landscaped Area Percentage (%)</Label>
                  <Input
                    id="landscapedAreaPercentage"
                    placeholder="e.g. 36"
                    {...form.register("landscapedAreaPercentage")}
                    readOnly
                    className="bg-gray-50"
                  />
                  {form.formState.errors.landscapedAreaPercentage && (
                    <p className="text-sm text-red-500">{form.formState.errors.landscapedAreaPercentage.message}</p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    Proposed landscaped area as a percentage of the site area
                  </p>
                </div>
              </div>

              {/* Materials and Finishes */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Materials and Finishes</h3>
                <div className="space-y-2">
                  <Label htmlFor="externalWalls">External Walls</Label>
                  <Input
                    id="externalWalls"
                    placeholder="e.g. Brick veneer with rendered finish"
                    {...form.register("externalWalls")}
                  />
                  {form.formState.errors.externalWalls && (
                    <p className="text-sm text-red-500">{form.formState.errors.externalWalls.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="roof">Roof</Label>
                  <Input
                    id="roof"
                    placeholder="e.g. Colorbond steel in Monument (dark grey)"
                    {...form.register("roof")}
                  />
                  {form.formState.errors.roof && (
                    <p className="text-sm text-red-500">{form.formState.errors.roof.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="windows">Windows</Label>
                  <Input id="windows" placeholder="e.g. Aluminum framed in black" {...form.register("windows")} />
                  {form.formState.errors.windows && (
                    <p className="text-sm text-red-500">{form.formState.errors.windows.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="otherMaterials">Other Materials</Label>
                  <Input
                    id="otherMaterials"
                    placeholder="e.g. Timber cladding to feature walls"
                    {...form.register("otherMaterials")}
                  />
                </div>
              </div>

              {/* Access and Parking */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Access and Parking</h3>
                <div className="space-y-2">
                  <Label htmlFor="vehicleAccess">Vehicle Access</Label>
                  <Input
                    id="vehicleAccess"
                    placeholder="e.g. Existing driveway from Viola Place"
                    {...form.register("vehicleAccess")}
                  />
                  {form.formState.errors.vehicleAccess && (
                    <p className="text-sm text-red-500">{form.formState.errors.vehicleAccess.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="carParkingSpaces">Car Parking Spaces</Label>
                  <Select
                    defaultValue={form.getValues("carParkingSpaces")}
                    onValueChange={(value) => form.setValue("carParkingSpaces", value)}
                  >
                    <SelectTrigger id="carParkingSpaces">
                      <SelectValue placeholder="Select number of car spaces" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">0</SelectItem>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="4">4</SelectItem>
                      <SelectItem value="5+">5+</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.carParkingSpaces && (
                    <p className="text-sm text-red-500">{form.formState.errors.carParkingSpaces.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pedestrianAccess">Pedestrian Access</Label>
                  <Input
                    id="pedestrianAccess"
                    placeholder="e.g. Existing pathway from Viola Place"
                    {...form.register("pedestrianAccess")}
                  />
                  {form.formState.errors.pedestrianAccess && (
                    <p className="text-sm text-red-500">{form.formState.errors.pedestrianAccess.message}</p>
                  )}
                </div>
              </div>

              {/* Stormwater */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Stormwater</h3>
                <div className="space-y-2">
                  <Label htmlFor="stormwaterDisposal">Stormwater Disposal</Label>
                  <Select
                    defaultValue={form.getValues("stormwaterDisposal")}
                    onValueChange={(value) => form.setValue("stormwaterDisposal", value)}
                  >
                    <SelectTrigger id="stormwaterDisposal">
                      <SelectValue placeholder="Select stormwater disposal method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Connected to existing stormwater system">
                        Connected to existing stormwater system
                      </SelectItem>
                      <SelectItem value="Connected to street gutter">Connected to street gutter</SelectItem>
                      <SelectItem value="Connected to rainwater tank">Connected to rainwater tank</SelectItem>
                      <SelectItem value="On-site absorption trench">On-site absorption trench</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.stormwaterDisposal && (
                    <p className="text-sm text-red-500">{form.formState.errors.stormwaterDisposal.message}</p>
                  )}
                </div>
              </div>

              {/* Waste Management */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Waste Management</h3>
                <div className="space-y-2">
                  <Label htmlFor="wasteManagement">Waste Management</Label>
                  <Textarea
                    id="wasteManagement"
                    placeholder="Describe how waste will be managed on the site"
                    rows={3}
                    {...form.register("wasteManagement")}
                  />
                  {form.formState.errors.wasteManagement && (
                    <p className="text-sm text-red-500">{form.formState.errors.wasteManagement.message}</p>
                  )}
                  <p className="text-sm text-muted-foreground">Include details about waste storage and collection</p>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Link href="/professionals/SoEE/form/property-details?job=${jobId}">
                  <Button variant="outline" type="button" className="gap-2">
                    <ArrowLeft className="h-4 w-4" /> Back
                  </Button>
                </Link>
                <div className="flex gap-2">
                  <Button variant="outline" type="button" className="gap-2" onClick={handleSaveDraft}>
                    <Save className="h-4 w-4" /> Save Draft
                  </Button>
                  <Button type="submit" className="gap-2">
                    Next <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

