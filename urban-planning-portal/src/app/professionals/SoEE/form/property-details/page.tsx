"use client"

import { useRouter } from "next/navigation"
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
import { ArrowLeft, ArrowRight, Save } from "lucide-react"
import { FormProgress } from "@/app/professionals/SoEE/components/form-progress"
import Link from "next/link"
import { useState } from "react"

// Form validation schema
const formSchema = z.object({
  // Lot Identification
  lotNumber: z.string().min(1, { message: "Lot number is required" }),
  sectionNumber: z.string().optional(),
  dpNumber: z.string().min(1, { message: "DP/SP number is required" }),

  // Address Details (pre-filled from previous step)
  streetNumber: z.string().min(1, { message: "Street number is required" }),
  streetName: z.string().min(1, { message: "Street name is required" }),
  secondaryStreetName: z.string().optional(),
  suburb: z.string().min(1, { message: "Suburb is required" }),
  postcode: z.string().min(4, { message: "Valid postcode is required" }),

  // Site Characteristics
  lotType: z.string().min(1, { message: "Lot type is required" }),
  siteArea: z.string().min(1, { message: "Site area is required" }),
  primaryStreetWidth: z.string().min(1, { message: "Primary street width is required" }),
  siteDepth: z.string().min(1, { message: "Site depth is required" }),
  secondaryStreetWidth: z.string().optional(),
  gradient: z.string().min(1, { message: "Gradient is required" }),
  highestRL: z.string().optional(),
  lowestRL: z.string().optional(),
  fallAmount: z.string().optional(),

  // Existing Development
  currentLandUse: z.string().min(1, { message: "Current land use is required" }),
  existingDevelopmentDetails: z.string().optional(),

  // Surrounding Development
  northDevelopment: z.string().optional(),
  southDevelopment: z.string().optional(),
  eastDevelopment: z.string().optional(),
  westDevelopment: z.string().optional(),

  // Site Constraints
  bushfireProne: z.boolean().optional(),
  floodProne: z.boolean().optional(),
  acidSulfateSoils: z.boolean().optional(),
  biodiversity: z.boolean().optional(),
  otherConstraints: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

export default function PropertyDetailsPage() {
  const router = useRouter()
  const [siteArea, setSiteArea] = useState("500.00")

  // Initialize form with default values
  // In a real app, these would be populated from the previous step or saved data
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      // Lot Identification
      lotNumber: "53",
      sectionNumber: "N/A",
      dpNumber: "231533",

      // Address Details
      streetNumber: "9",
      streetName: "Viola Place",
      secondaryStreetName: "",
      suburb: "Greystanes",
      postcode: "2145",

      // Site Characteristics
      lotType: "standard",
      siteArea: "500.00",
      primaryStreetWidth: "15.24",
      siteDepth: "32.80",
      secondaryStreetWidth: "",
      gradient: "rear-to-front",
      highestRL: "50.00",
      lowestRL: "48.50",
      fallAmount: "1.50",

      // Existing Development
      currentLandUse: "residential",
      existingDevelopmentDetails: "Single-storey dwelling house with associated structures",

      // Surrounding Development
      northDevelopment: "Single-storey dwelling house at 11 Viola Place",
      southDevelopment: "Double-storey dwelling house at 7 Viola Place",
      eastDevelopment: "Rear yards of properties fronting Carnation Avenue",
      westDevelopment: "Viola Place and single-storey dwelling houses opposite",

      // Site Constraints
      bushfireProne: false,
      floodProne: false,
      acidSulfateSoils: false,
      biodiversity: false,
      otherConstraints: "",
    },
  })

  // Handle form submission
  const onSubmit = (data: FormValues) => {
    console.log(data)
    // Save form data to state/localStorage/backend
    // Then navigate to the next step
    router.push("/professionals/SoEE/form/development-details")
  }

  // Handle save draft functionality
  const handleSaveDraft = () => {
    const currentValues = form.getValues()
    // Save draft logic here
    console.log("Saving draft:", currentValues)
    // Show success message
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-10 px-4 max-w-3xl">
        {/* Progress Bar */}
        <FormProgress currentStep={2} />

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Property Details</CardTitle>
            <CardDescription>
              Enter the details of the property for your Statement of Environmental Effects. Some information has been
              pre-filled from your property search. You can make adjustments if needed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Lot Identification */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Lot Identification</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="lotNumber">Lot Number</Label>
                    <Input id="lotNumber" placeholder="e.g. 53" {...form.register("lotNumber")} />
                    {form.formState.errors.lotNumber && (
                      <p className="text-sm text-red-500">{form.formState.errors.lotNumber.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sectionNumber">Section Number (if applicable)</Label>
                    <Input id="sectionNumber" placeholder="e.g. N/A" {...form.register("sectionNumber")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dpNumber">DP/SP Number</Label>
                    <Input id="dpNumber" placeholder="e.g. 231533" {...form.register("dpNumber")} />
                    {form.formState.errors.dpNumber && (
                      <p className="text-sm text-red-500">{form.formState.errors.dpNumber.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Address Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Address Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="streetNumber">Street Number</Label>
                    <Input id="streetNumber" placeholder="e.g. 9" {...form.register("streetNumber")} />
                    {form.formState.errors.streetNumber && (
                      <p className="text-sm text-red-500">{form.formState.errors.streetNumber.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="streetName">Street Name</Label>
                    <Input id="streetName" placeholder="e.g. Viola Place" {...form.register("streetName")} />
                    {form.formState.errors.streetName && (
                      <p className="text-sm text-red-500">{form.formState.errors.streetName.message}</p>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secondaryStreetName">Secondary Street Name (for corner lots)</Label>
                  <Input
                    id="secondaryStreetName"
                    placeholder="Secondary street name (if applicable)"
                    {...form.register("secondaryStreetName")}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="suburb">Suburb</Label>
                    <Input id="suburb" placeholder="e.g. Greystanes" {...form.register("suburb")} />
                    {form.formState.errors.suburb && (
                      <p className="text-sm text-red-500">{form.formState.errors.suburb.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postcode">Postcode</Label>
                    <Input id="postcode" placeholder="e.g. 2145" {...form.register("postcode")} />
                    {form.formState.errors.postcode && (
                      <p className="text-sm text-red-500">{form.formState.errors.postcode.message}</p>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="council">Council</Label>
                  <Input id="council" value="Cumberland Council" disabled className="bg-gray-50" />
                </div>
              </div>

              {/* Site Characteristics */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Site Characteristics</h3>
                <div className="space-y-2">
                  <Label htmlFor="lotType">Lot Type</Label>
                  <Select
                    defaultValue={form.getValues("lotType")}
                    onValueChange={(value) => form.setValue("lotType", value)}
                  >
                    <SelectTrigger id="lotType">
                      <SelectValue placeholder="Select lot type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="corner">Corner</SelectItem>
                      <SelectItem value="battle-axe">Battle-axe</SelectItem>
                      <SelectItem value="irregular">Irregular</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.lotType && (
                    <p className="text-sm text-red-500">{form.formState.errors.lotType.message}</p>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="siteArea">Site Area (m²)</Label>
                    <Input id="siteArea" placeholder="e.g. 500.00" {...form.register("siteArea")} />
                    {form.formState.errors.siteArea && (
                      <p className="text-sm text-red-500">{form.formState.errors.siteArea.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="primaryStreetWidth">Primary Street Width (m)</Label>
                    <Input id="primaryStreetWidth" placeholder="e.g. 15.24" {...form.register("primaryStreetWidth")} />
                    {form.formState.errors.primaryStreetWidth && (
                      <p className="text-sm text-red-500">{form.formState.errors.primaryStreetWidth.message}</p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="siteDepth">Site Depth (m)</Label>
                    <Input id="siteDepth" placeholder="e.g. 32.80" {...form.register("siteDepth")} />
                    {form.formState.errors.siteDepth && (
                      <p className="text-sm text-red-500">{form.formState.errors.siteDepth.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="secondaryStreetWidth">Secondary Street Width (m) (if corner lot)</Label>
                    <Input
                      id="secondaryStreetWidth"
                      placeholder="e.g. 12.50"
                      {...form.register("secondaryStreetWidth")}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gradient">Site Gradient</Label>
                  <Select
                    defaultValue={form.getValues("gradient")}
                    onValueChange={(value) => form.setValue("gradient", value)}
                  >
                    <SelectTrigger id="gradient">
                      <SelectValue placeholder="Select gradient" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="front-to-rear">A gradient from the front to the rear</SelectItem>
                      <SelectItem value="rear-to-front">A gradient from the rear to the front</SelectItem>
                      <SelectItem value="cross-fall">A cross-fall gradient</SelectItem>
                      <SelectItem value="flat">Relatively flat</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.gradient && (
                    <p className="text-sm text-red-500">{form.formState.errors.gradient.message}</p>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="highestRL">Highest RL (m)</Label>
                    <Input
                      id="highestRL"
                      placeholder="e.g. 50.00"
                      {...form.register("highestRL")}
                      onChange={(e) => {
                        form.setValue("highestRL", e.target.value)
                        const highest = Number.parseFloat(e.target.value)
                        const lowest = Number.parseFloat(form.getValues("lowestRL") || "0")
                        if (!isNaN(highest) && !isNaN(lowest)) {
                          const fall = Math.abs(highest - lowest).toFixed(2)
                          form.setValue("fallAmount", fall)
                        }
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lowestRL">Lowest RL (m)</Label>
                    <Input
                      id="lowestRL"
                      placeholder="e.g. 48.50"
                      {...form.register("lowestRL")}
                      onChange={(e) => {
                        form.setValue("lowestRL", e.target.value)
                        const lowest = Number.parseFloat(e.target.value)
                        const highest = Number.parseFloat(form.getValues("highestRL") || "0")
                        if (!isNaN(highest) && !isNaN(lowest)) {
                          const fall = Math.abs(highest - lowest).toFixed(2)
                          form.setValue("fallAmount", fall)
                        }
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fallAmount">Fall Amount (m)</Label>
                    <Input
                      id="fallAmount"
                      placeholder="e.g. 1.50"
                      {...form.register("fallAmount")}
                      readOnly
                      className="bg-gray-50"
                    />
                    <p className="text-xs text-muted-foreground">
                      Automatically calculated from highest and lowest RL values
                    </p>
                  </div>
                </div>
              </div>

              {/* Existing Development */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Existing Development</h3>
                <div className="space-y-2">
                  <Label htmlFor="currentLandUse">Current Land Use</Label>
                  <Select
                    defaultValue={form.getValues("currentLandUse")}
                    onValueChange={(value) => form.setValue("currentLandUse", value)}
                  >
                    <SelectTrigger id="currentLandUse">
                      <SelectValue placeholder="Select current land use" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="residential">Residential</SelectItem>
                      <SelectItem value="commercial">Commercial</SelectItem>
                      <SelectItem value="industrial">Industrial</SelectItem>
                      <SelectItem value="vacant">Vacant</SelectItem>
                      <SelectItem value="mixed-use">Mixed Use</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.currentLandUse && (
                    <p className="text-sm text-red-500">{form.formState.errors.currentLandUse.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="existingDevelopmentDetails">Existing Development Details</Label>
                  <Textarea
                    id="existingDevelopmentDetails"
                    placeholder="Provide additional details about the existing development on site"
                    rows={3}
                    {...form.register("existingDevelopmentDetails")}
                  />
                </div>
              </div>

              {/* Surrounding Development */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Surrounding Development</h3>
                <div className="space-y-2">
                  <Label htmlFor="northDevelopment">Development to the North</Label>
                  <Input
                    id="northDevelopment"
                    placeholder="e.g. Single-storey dwelling house at 11 Viola Place"
                    {...form.register("northDevelopment")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="southDevelopment">Development to the South</Label>
                  <Input
                    id="southDevelopment"
                    placeholder="e.g. Double-storey dwelling house at 7 Viola Place"
                    {...form.register("southDevelopment")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="eastDevelopment">Development to the East</Label>
                  <Input
                    id="eastDevelopment"
                    placeholder="e.g. Rear yards of properties fronting Carnation Avenue"
                    {...form.register("eastDevelopment")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="westDevelopment">Development to the West</Label>
                  <Input
                    id="westDevelopment"
                    placeholder="e.g. Viola Place and single-storey dwelling houses opposite"
                    {...form.register("westDevelopment")}
                  />
                </div>
              </div>

              {/* Site Constraints */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Site Constraints</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="bushfireProne"
                      checked={form.getValues("bushfireProne")}
                      onCheckedChange={(checked) => form.setValue("bushfireProne", checked === true)}
                    />
                    <Label htmlFor="bushfireProne">Bushfire Prone Land</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="floodProne"
                      checked={form.getValues("floodProne")}
                      onCheckedChange={(checked) => form.setValue("floodProne", checked === true)}
                    />
                    <Label htmlFor="floodProne">Flood Prone Land</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="acidSulfateSoils"
                      checked={form.getValues("acidSulfateSoils")}
                      onCheckedChange={(checked) => form.setValue("acidSulfateSoils", checked === true)}
                    />
                    <Label htmlFor="acidSulfateSoils">Acid Sulfate Soils</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="biodiversity"
                      checked={form.getValues("biodiversity")}
                      onCheckedChange={(checked) => form.setValue("biodiversity", checked === true)}
                    />
                    <Label htmlFor="biodiversity">Biodiversity</Label>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="otherConstraints">Other Constraints</Label>
                  <Textarea
                    id="otherConstraints"
                    placeholder="Describe any other site constraints not listed above"
                    rows={2}
                    {...form.register("otherConstraints")}
                  />
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Link href="/professionals/SoEE/form/project-setup">
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

