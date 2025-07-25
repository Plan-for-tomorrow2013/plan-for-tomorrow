"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@shared/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@shared/components/ui/card"
import { Input } from "@shared/components/ui/input"
import { Label } from "@shared/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@shared/components/ui/select"
import { Textarea } from "@shared/components/ui/textarea"
import { Checkbox } from "@shared/components/ui/checkbox"
import { ArrowLeft, ArrowRight, Save, Info } from "lucide-react"
import { FormProgress } from "@/app/professionals/SoEE/components/form-progress"
import Link from "next/link"
import { Popover, PopoverContent, PopoverTrigger } from "@shared/components/ui/popover"
import { useEffect } from "react"
import { useFormData } from "@/app/professionals/SoEE/lib/form-context"
import { DevelopmentDataSchema } from "@/app/professionals/SoEE/lib/schemas";

type FormValues = z.infer<typeof DevelopmentDataSchema>

export default function DevelopmentDetailsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const jobId = searchParams.get("job")
  const { formData, updateFormData, saveDraft } = useFormData()

  // Initialize form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(DevelopmentDataSchema),
    defaultValues: {
      // Development Description
      developmentDescription: formData.development.developmentDescription || "",

      // Demolition
      demolitionRequired: formData.development.demolitionRequired || false,
      demolitionDetails: formData.development.demolitionDetails || "",

      // Construction
      storeys: formData.development.storeys || "",
      buildingHeight: formData.development.buildingHeight || "",
      wallHeight: formData.development.wallHeight || "",

      // Setbacks
      frontSetback: formData.development.frontSetback || "",
      secondaryFrontSetback: formData.development.secondaryFrontSetback || "",
      rearSetbackGround: formData.development.rearSetbackGround || "",
      rearSetbackUpper: formData.development.rearSetbackUpper || "",
      sideSetbackGroundOne: formData.development.sideSetbackGroundOne || "",
      sideSetbackGroundTwo: formData.development.sideSetbackGroundTwo || "",
      sideSetbackUpperOne: formData.development.sideSetbackUpperOne || "",
      sideSetbackUpperTwo: formData.development.sideSetbackUpperTwo || "",
      garageSetback: "",
      
      // Floor Area
      existingGFA: formData.development.existingGFA || "",
      proposedGFA: formData.development.proposedGFA || "",
      totalGFA: formData.development.totalGFA || "",
      floorSpaceRatio: formData.development.floorSpaceRatio || "",

      // Site Coverage
      existingSiteCoverage: formData.development.existingSiteCoverage || "",
      proposedSiteCoverage: formData.development.proposedSiteCoverage || "",

      // Landscaping
      existingLandscapedArea: formData.development.existingLandscapedArea || "",
      proposedLandscapedArea: formData.development.proposedLandscapedArea || "",
      landscapedAreaPercentage: formData.development.landscapedAreaPercentage || "",

      // Deep soil
      existingDeepSoilArea: "",
      proposedDeepSoilArea: "",
      deepSoilAreaPercentage: "",

      // Private open space
      existingPrivateOpenSpaceArea: "",
      proposedPrivateOpenSpaceArea: "",
      
      // Excavation and Fill
      maxCut: "",
      maxFill: "",
      
      // Materials and Finishes
      externalWalls: formData.development.externalWalls || "",
      roof: formData.development.roof || "",
      windows: formData.development.windows || "",
      otherMaterials: formData.development.otherMaterials || "",

      // Access and Parking
      vehicleAccess: formData.development.vehicleAccess || "",
      carParkingSpaces: formData.development.carParkingSpaces || "",
      pedestrianAccess: formData.development.pedestrianAccess || "",

      // Stormwater
      stormwaterDisposal: formData.development.stormwaterDisposal || "",

      // Waste Management
      wasteManagement: formData.development.wasteManagement || "",
    },
  })

  // Reset form when formData changes (after loading from localStorage)
  useEffect(() => {
    form.reset({
      // Development Description
      developmentDescription: formData.development.developmentDescription || "",

      // Demolition
      demolitionRequired: formData.development.demolitionRequired || false,
      demolitionDetails: formData.development.demolitionDetails || "",

      // Construction
      storeys: formData.development.storeys || "",
      buildingHeight: formData.development.buildingHeight || "",
      wallHeight: formData.development.wallHeight || "",

      // Setbacks
      frontSetback: formData.development.frontSetback || "",
      secondaryFrontSetback: formData.development.secondaryFrontSetback || "",
      rearSetbackGround: formData.development.rearSetbackGround || "",
      rearSetbackUpper: formData.development.rearSetbackUpper || "",
      sideSetbackGroundOne: formData.development.sideSetbackGroundOne || "",
      sideSetbackGroundTwo: formData.development.sideSetbackGroundTwo || "",
      sideSetbackUpperOne: formData.development.sideSetbackUpperOne || "",
      sideSetbackUpperTwo: formData.development.sideSetbackUpperTwo || "",
      garageSetback: "",
      
      // Floor Area
      existingGFA: formData.development.existingGFA || "",
      proposedGFA: formData.development.proposedGFA || "",
      totalGFA: formData.development.totalGFA || "",
      floorSpaceRatio: formData.development.floorSpaceRatio || "",

      // Site Coverage
      existingSiteCoverage: formData.development.existingSiteCoverage || "",
      proposedSiteCoverage: formData.development.proposedSiteCoverage || "",

      // Landscaping
      existingLandscapedArea: formData.development.existingLandscapedArea || "",
      proposedLandscapedArea: formData.development.proposedLandscapedArea || "",
      landscapedAreaPercentage: formData.development.landscapedAreaPercentage || "",

      // Deep soil
      existingDeepSoilArea: "",
      proposedDeepSoilArea: "",
      deepSoilAreaPercentage: "",

      // Private open space
      existingPrivateOpenSpaceArea: "",
      proposedPrivateOpenSpaceArea: "",
      
      // Excavation and Fill
      maxCut: "",
      maxFill: "",
      
      // Materials and Finishes
      externalWalls: formData.development.externalWalls || "",
      roof: formData.development.roof || "",
      windows: formData.development.windows || "",
      otherMaterials: formData.development.otherMaterials || "",

      // Access and Parking
      vehicleAccess: formData.development.vehicleAccess || "",
      carParkingSpaces: formData.development.carParkingSpaces || "",
      pedestrianAccess: formData.development.pedestrianAccess || "",

      // Stormwater
      stormwaterDisposal: formData.development.stormwaterDisposal || "",

      // Waste Management
      wasteManagement: formData.development.wasteManagement || "",
    })
  }, [formData.development, form])

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

  const calculateDeepSoilAreaPercentage = () => {
    const proposedDeepSoilArea = Number.parseFloat(form.getValues("proposedDeepSoilArea") || "0")
    // Using a default site area of 500m²
    // In a real application, this would come from the property details form
    const defaultSiteArea = 500

    if (!isNaN(proposedDeepSoilArea) && defaultSiteArea > 0) {
      const percentage = Math.round((proposedDeepSoilArea / defaultSiteArea) * 100)
      form.setValue("deepSoilAreaPercentage", percentage.toString())
    }
  }

  // Handle form submission
  const onSubmit = (data: FormValues) => {
    console.log(data)
    // Save form data to context
    updateFormData("development", {
      developmentDescription: data.developmentDescription,
      demolitionRequired: data.demolitionRequired,
      demolitionDetails: data.demolitionDetails,
      storeys: data.storeys,
      buildingHeight: data.buildingHeight,
      wallHeight: data.wallHeight,
      frontSetback: data.frontSetback,
      secondaryFrontSetback: data.secondaryFrontSetback,
      rearSetbackGround: data.rearSetbackGround,
      rearSetbackUpper: data.rearSetbackUpper,
      sideSetbackGroundOne: data.sideSetbackGroundOne,
      sideSetbackGroundTwo: data.sideSetbackGroundTwo,
      sideSetbackUpperOne: data.sideSetbackUpperOne,
      sideSetbackUpperTwo: data.sideSetbackUpperTwo,
      garageSetback: data.garageSetback,
      existingGFA: data.existingGFA,
      proposedGFA: data.proposedGFA,
      totalGFA: data.totalGFA,
      floorSpaceRatio: data.floorSpaceRatio,
      existingSiteCoverage: data.existingSiteCoverage,
      proposedSiteCoverage: data.proposedSiteCoverage,
      existingLandscapedArea: data.existingLandscapedArea,
      proposedLandscapedArea: data.proposedLandscapedArea,
      landscapedAreaPercentage: data.landscapedAreaPercentage,
      externalWalls: data.externalWalls,
      roof: data.roof,
      windows: data.windows,
      otherMaterials: data.otherMaterials,
      vehicleAccess: data.vehicleAccess,
      carParkingSpaces: data.carParkingSpaces,
      pedestrianAccess: data.pedestrianAccess,
      stormwaterDisposal: data.stormwaterDisposal,
      wasteManagement: data.wasteManagement,
    })
    // Then navigate to the next step
    router.push(`/professionals/SoEE/form/planning?job=${jobId}`)
  }

  // Handle save draft functionality
  const handleSaveDraft = () => {
    const currentValues = form.getValues()
    // Save form data to context
    updateFormData("development", {
      developmentDescription: currentValues.developmentDescription,
      demolitionRequired: currentValues.demolitionRequired,
      demolitionDetails: currentValues.demolitionDetails,
      storeys: currentValues.storeys,
      buildingHeight: currentValues.buildingHeight,
      wallHeight: currentValues.wallHeight,
      frontSetback: currentValues.frontSetback,
      secondaryFrontSetback: currentValues.secondaryFrontSetback,
      rearSetbackGround: currentValues.rearSetbackGround,
      rearSetbackUpper: currentValues.rearSetbackUpper,
      sideSetbackGroundOne: currentValues.sideSetbackGroundOne,
      sideSetbackGroundTwo: currentValues.sideSetbackGroundTwo,
      sideSetbackUpperOne: currentValues.sideSetbackUpperOne,
      sideSetbackUpperTwo: currentValues.sideSetbackUpperTwo,
      garageSetback: currentValues.garageSetback,
      existingGFA: currentValues.existingGFA,
      proposedGFA: currentValues.proposedGFA,
      totalGFA: currentValues.totalGFA,
      floorSpaceRatio: currentValues.floorSpaceRatio,
      existingSiteCoverage: currentValues.existingSiteCoverage,
      proposedSiteCoverage: currentValues.proposedSiteCoverage,
      existingLandscapedArea: currentValues.existingLandscapedArea,
      proposedLandscapedArea: currentValues.proposedLandscapedArea,
      landscapedAreaPercentage: currentValues.landscapedAreaPercentage,
      externalWalls: currentValues.externalWalls,
      roof: currentValues.roof,
      windows: currentValues.windows,
      otherMaterials: currentValues.otherMaterials,
      vehicleAccess: currentValues.vehicleAccess,
      carParkingSpaces: currentValues.carParkingSpaces,
      pedestrianAccess: currentValues.pedestrianAccess,
      stormwaterDisposal: currentValues.stormwaterDisposal,
      wasteManagement: currentValues.wasteManagement,
    })
    // Save to localStorage
    saveDraft()
    console.log("Saving draft:", currentValues)
    // Show success message
  }

  // Add a useEffect to calculate values on initial load
  useEffect(() => {
    calculateTotalGFAAndFSR()
    calculateLandscapedAreaPercentage()
    calculateDeepSoilAreaPercentage()
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
                <p className="text-sm text-muted-foreground">
                    Describe what you are proposing to build or modify on the site
                  </p>
                  <Textarea
                    id="developmentDescription"
                    placeholder="Provide a detailed description of the proposed development"
                    rows={4}
                    {...form.register("developmentDescription")}
                  />
                  {form.formState.errors.developmentDescription && (
                    <p className="text-sm text-red-500">{form.formState.errors.developmentDescription.message}</p>
                  )}
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
                    <PopoverContent className="w-80 bg-white text-black border border-gray-200">
                      <div className="space-y-2">
                        <h4 className="font-medium text-black">How to Measure Building Height</h4>
                        <p className="text-sm text-gray-700">
                          Building height is measured from the natural ground level to the highest point of the
                          building.
                        </p>
                        <p className="text-sm text-gray-700">
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
                      <SelectContent className="bg-white text-black border border-gray-200">
                        <SelectItem value="1" className="text-black hover:bg-gray-100">1</SelectItem>
                        <SelectItem value="2" className="text-black hover:bg-gray-100">2</SelectItem>
                        <SelectItem value="3" className="text-black hover:bg-gray-100">3</SelectItem>
                        <SelectItem value="4+" className="text-black hover:bg-gray-100">4+</SelectItem>
                      </SelectContent>
                    </Select>
                    {form.formState.errors.storeys && (
                      <p className="text-sm text-red-500">{form.formState.errors.storeys.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="buildingHeight">Maximum Building Height (m)</Label>
                    <Input id="buildingHeight" placeholder="e.g. 8.5" {...form.register("buildingHeight")} />
                    {form.formState.errors.buildingHeight && (
                      <p className="text-sm text-red-500">{form.formState.errors.buildingHeight.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="wallHeight">Wall Height (m)</Label>
                    <Input id="wallHeight" placeholder="e.g. 7.0" {...form.register("wallHeight")} />
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
                    <PopoverContent className="w-80 bg-white text-black border border-gray-200">
                      <div className="space-y-2">
                        <h4 className="font-medium text-black">How to Calculate Floor Area</h4>
                        <p className="text-sm text-gray-700">
                          Gross Floor Area (GFA) is the sum of the floor area of each floor of a building measured from
                          the internal face of external walls.
                        </p>
                        <p className="text-sm text-gray-700">Floor Space Ratio (FSR) = Total GFA ÷ Site Area</p>
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
                      placeholder="e.g. 100.0"
                      {...form.register("existingGFA")}
                      onChange={(e) => {
                        form.setValue("existingGFA", e.target.value)
                        calculateTotalGFAAndFSR()
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="proposedGFA">Proposed Gross Floor Area (m²)</Label>
                    <Input
                      id="proposedGFA"
                      placeholder="e.g. 150.0"
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
                    <Label htmlFor="floorSpaceRatio">Floor Space Ratio (FSR)</Label>
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
                    <PopoverContent className="w-80 bg-white text-black border border-gray-200">
                      <div className="space-y-2">
                        <h4 className="font-medium text-black">How to Measure Setbacks</h4>
                        <p className="text-sm text-gray-700">
                          Setbacks are measured from the property boundary to the external wall of the building.
                        </p>
                        <p className="text-sm text-gray-700">
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
                    <Input id="frontSetback" placeholder="e.g. 5.5" {...form.register("frontSetback")} />
                    {form.formState.errors.frontSetback && (
                      <p className="text-sm text-red-500">{form.formState.errors.frontSetback.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="secondaryFrontSetback">Secondary Front Setback (m) (if corner lot)</Label>
                    <Input
                      id="secondaryFrontSetback"
                      placeholder="e.g. 2.0"
                      {...form.register("secondaryFrontSetback")}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="rearSetbackGround">Rear Setback (Ground Level) (m)</Label>
                    <Input id="rearSetbackGround" placeholder="e.g. 3.0" {...form.register("rearSetbackGround")} />
                    {form.formState.errors.rearSetbackGround && (
                      <p className="text-sm text-red-500">{form.formState.errors.rearSetbackGround.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rearSetbackUpper">Rear Setback (Upper Level) (m)</Label>
                    <Input id="rearSetbackUpper" placeholder="e.g. 8.0" {...form.register("rearSetbackUpper")} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sideSetbackGroundOne">Side Setback Ground Level RHS (m)</Label>
                    <Input id="sideSetbackGroundOne" placeholder="e.g. 900" {...form.register("sideSetbackGroundOne")} />
                    {form.formState.errors.sideSetbackGroundOne && (
                      <p className="text-sm text-red-500">{form.formState.errors.sideSetbackGroundOne.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sideSetbackGroundTwo">Side Setback Ground Level LHS (m)</Label>
                    <Input id="sideSetbackGroundTwo" placeholder="e.g. 900" {...form.register("sideSetbackGroundTwo")} />
                    {form.formState.errors.sideSetbackGroundTwo && (
                      <p className="text-sm text-red-500">{form.formState.errors.sideSetbackGroundTwo.message}</p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sideSetbackUpperOne">Side Setback Upper Level RHS (m)</Label>
                    <Input id="sideSetbackUpperOne" placeholder="e.g. 1.5" {...form.register("sideSetbackUpperOne")} />
                    {form.formState.errors.sideSetbackUpperOne && (
                      <p className="text-sm text-red-500">{form.formState.errors.sideSetbackUpperOne.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sideSetbackUpperTwo">Side Setback Upper Level LHS (m)</Label>
                    <Input id="sideSetbackUpperTwo" placeholder="e.g. 1.5" {...form.register("sideSetbackUpperTwo")} />
                    {form.formState.errors.sideSetbackUpperTwo && (
                      <p className="text-sm text-red-500">{form.formState.errors.sideSetbackUpperTwo.message}</p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="garageSetback">Garage Setback (m)</Label>
                    <Input id="garageSetback" placeholder="e.g. 1.5" {...form.register("garageSetback")} />
                    {form.formState.errors.garageSetback && (
                      <p className="text-sm text-red-500">{form.formState.errors.garageSetback.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    {/* Empty div to maintain grid layout */}
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
                    <PopoverContent className="w-80 bg-white text-black border border-gray-200">
                      <div className="space-y-2">
                        <h4 className="font-medium text-black">How to Calculate Site Coverage</h4>
                        <p className="text-sm text-gray-700">
                          Site coverage is the percentage of the site area covered by buildings, measured as the area of
                          the site covered by roofed areas.
                        </p>
                        <p className="text-sm text-gray-700">
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
                    <PopoverContent className="w-80 bg-white text-black border border-gray-200">
                      <div className="space-y-2">
                        <h4 className="font-medium text-black">How to Calculate Landscaped Area</h4>
                        <p className="text-sm text-gray-700">
                          Landscaped area is the areas of soil used for growing plants, grasses and trees, but does not include any building, structure or hard paved area.
                        </p>
                        <p className="text-sm text-gray-700">
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

              {/* Deep soil */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-medium">Deep Soil</h3>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-5 w-5">
                        <Info className="h-4 w-4" />
                        <span className="sr-only">Deep soil info</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 bg-white text-black border border-gray-200">
                      <div className="space-y-2">
                        <h4 className="font-medium text-black">How to Calculate Deep Soil Area</h4>
                        <p className="text-sm text-gray-700">
                          Deep soil area is the areas of soil not covered by buildings or structures within a development.
                        </p>
                        <p className="text-sm text-gray-700">
                          Deep Soil Area (%) = (Deep Soil Area ÷ Site Area) × 100
                        </p>
                        <div className="mt-2">
                          <img
                            src="/placeholder.svg?height=150&width=300"
                            alt="Deep soil area calculation diagram"
                            className="border rounded"
                          />
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="existingDeepSoilArea">Existing Deep Soil Area (m²)</Label>
                    <Input
                      id="existingDeepSoilArea"
                      placeholder="e.g. 200.0"
                      {...form.register("existingDeepSoilArea")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="proposedDeepSoilArea">Proposed Deep Soil Area (m²)</Label>
                    <Input
                      id="proposedDeepSoilArea"
                      placeholder="e.g. 180.0"
                      {...form.register("proposedDeepSoilArea")}
                      onChange={(e) => {
                        form.setValue("proposedDeepSoilArea", e.target.value)
                        calculateDeepSoilAreaPercentage()
                      }}
                    />
                    {form.formState.errors.proposedDeepSoilArea && (
                      <p className="text-sm text-red-500">{form.formState.errors.proposedDeepSoilArea.message}</p>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deepSoilAreaPercentage">Deep Soil Area Percentage (%)</Label>
                  <Input
                    id="deepSoilAreaPercentage"
                    placeholder="e.g. 36"
                    {...form.register("deepSoilAreaPercentage")}
                    readOnly
                    className="bg-gray-50"
                  />
                  {form.formState.errors.deepSoilAreaPercentage && (
                    <p className="text-sm text-red-500">{form.formState.errors.deepSoilAreaPercentage.message}</p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    Proposed deep soil area as a percentage of the site area
                  </p>
                </div>
              </div>

              {/* Private open space */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Private Open Space</h3>
                <div className="space-y-2">
                  <Label htmlFor="existingPrivateOpenSpaceArea">Existing Private Open Space Area (m²)</Label>
                  <Input id="existingPrivateOpenSpaceArea" placeholder="e.g. 200.0" {...form.register("existingPrivateOpenSpaceArea")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="proposedPrivateOpenSpaceArea">Proposed Private Open Space Area (m²)</Label>
                  <Input id="proposedPrivateOpenSpaceArea" placeholder="e.g. 180.0" {...form.register("proposedPrivateOpenSpaceArea")} />
                  {form.formState.errors.proposedPrivateOpenSpaceArea && (
                    <p className="text-sm text-red-500">{form.formState.errors.proposedPrivateOpenSpaceArea.message}</p>
                  )}
                </div>
              </div>

              {/* Excavation and Fill */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Excavation and Fill</h3>
                <div className="space-y-2">
                  <Label htmlFor="maxCut">Max Cut (m)</Label>
                  <Input id="maxCut" placeholder="e.g. 1m" {...form.register("maxCut")} />
                  {form.formState.errors.maxCut && (
                    <p className="text-sm text-red-500">{form.formState.errors.maxCut.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxFill">Max Fill (m)</Label>
                  <Input id="maxFill" placeholder="e.g. 1m" {...form.register("maxFill")} />
                  {form.formState.errors.maxFill && (
                    <p className="text-sm text-red-500">{form.formState.errors.maxFill.message}</p>
                  )}
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
                    <SelectContent className="bg-white text-black border border-gray-200">
                      <SelectItem value="0" className="text-black hover:bg-gray-100">0</SelectItem>
                      <SelectItem value="1" className="text-black hover:bg-gray-100">1</SelectItem>
                      <SelectItem value="2" className="text-black hover:bg-gray-100">2</SelectItem>
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
                    <SelectContent className="bg-white text-black border border-gray-200">
                      <SelectItem value="Connected to existing stormwater system" className="text-black hover:bg-gray-100">
                        Connected to existing stormwater system
                      </SelectItem>
                      <SelectItem value="Connected to street gutter" className="text-black hover:bg-gray-100">Connected to street gutter</SelectItem>
                      <SelectItem value="Connected to rainwater tank" className="text-black hover:bg-gray-100">Connected to rainwater tank</SelectItem>
                      <SelectItem value="On-site absorption trench" className="text-black hover:bg-gray-100">On-site absorption trench</SelectItem>
                      <SelectItem value="Other" className="text-black hover:bg-gray-100">Other</SelectItem>
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
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Link href={`/professionals/SoEE/form/property-details?job=${jobId}`}>
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

