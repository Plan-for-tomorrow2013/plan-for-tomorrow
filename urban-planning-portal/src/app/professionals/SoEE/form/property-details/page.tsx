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
import { ArrowLeft, ArrowRight, Save, Plus, Trash2, Loader2 } from "lucide-react"
import { FormProgress } from "@/app/professionals/SoEE/components/form-progress"
import Link from "next/link"
import { useEffect } from "react"
import { DetailedSiteDetails } from '@shared/components/DetailedSiteDetails';
import { SiteDetailsProvider, useSiteDetails } from '@shared/contexts/site-details-context';

// Form validation schema
const formSchema = z.object({
  // Lot Identification - now supports multiple lots
  lotIdentifications: z.array(z.object({
    lotNumber: z.string().min(1, { message: "Lot number is required" }),
    sectionNumber: z.string().optional(),
    dpNumber: z.string().min(1, { message: "DP/SP number is required" }),
  })).min(1, { message: "At least one lot identification is required" }),

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
  salinity: z.boolean().optional(),
  landslip: z.boolean().optional(),
  heritage: z.string().optional(),
  otherConstraints: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

const defaultSiteDetails = {
  lotType: '',
  siteArea: '',
  primaryStreetWidth: '',
  siteDepth: '',
  secondaryStreetWidth: '',
  gradient: '',
  highestRL: '',
  lowestRL: '',
  fallAmount: '',
  currentLandUse: '',
  existingDevelopmentDetails: '',
  northDevelopment: '',
  southDevelopment: '',
  eastDevelopment: '',
  westDevelopment: '',
  bushfireProne: false,
  floodProne: false,
  acidSulfateSoils: false,
  biodiversity: false,
  salinity: false,
  landslip: false,
  heritage: '',
  otherConstraints: '',
};

export default function PropertyDetailsPageWrapper() {
  const searchParams = useSearchParams();
  const jobId = searchParams.get("job");
  if (!jobId) {
    return <div className="p-10 text-center">No job ID provided.</div>;
  }
  return (
    <SiteDetailsProvider jobId={jobId}>
      <PropertyDetailsPage />
    </SiteDetailsProvider>
  );
}

function PropertyDetailsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const jobId = searchParams.get("job");

  // SoEE-specific form state (address, lot identification)
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      // Lot Identification - now an array with initial entry
      lotIdentifications: [
        {
          lotNumber: "53",
          sectionNumber: "N/A",
          dpNumber: "231533",
        }
      ],

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
      salinity: false,
      landslip: false,
      heritage: "",
      otherConstraints: "",
    },
  })

  // Use site details context for real-time sync
  const { siteDetails, updateSiteDetails, saveSiteDetails, isLoading } = useSiteDetails();

  // Handle form submission
  const onSubmit = (data: any) => {
    // Combine SoEE-specific fields and siteDetails
    const payload = {
      ...data, // SoEE-specific fields
      siteDetails, // all site characteristics and below
    };
    // Save or send payload as needed
    router.push(`/professionals/SoEE/form/development-details?job=${jobId}`);
  };

  // Save handler for site details
  const handleSaveSiteDetails = async () => {
    await saveSiteDetails();
  };

  if (isLoading || !siteDetails) {
    return (
      <div className="flex justify-center items-center p-10">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        <span className="ml-2">Loading site details...</span>
      </div>
    );
  }

  // Handle adding a new lot identification
  const addLotIdentification = () => {
    const currentLots = form.getValues("lotIdentifications")
    form.setValue("lotIdentifications", [
      ...currentLots,
      {
        lotNumber: "",
        sectionNumber: "",
        dpNumber: "",
      }
    ])
  }

  // Handle removing a lot identification
  const removeLotIdentification = (index: number) => {
    const currentLots = form.getValues("lotIdentifications")
    if (currentLots.length > 1) {
      const updatedLots = currentLots.filter((_, i) => i !== index)
      form.setValue("lotIdentifications", updatedLots)
    }
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
              Check and enter the details of the property for your Statement of Environmental Effects. Some information has been
              pre-filled from your Planning Layers and the information in Site Details. You can make adjustments if needed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

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
              
              {/* Lot Identification */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Lot Identification</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addLotIdentification}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" /> Add Lot
                  </Button>
                </div>
                
                {form.watch("lotIdentifications").map((_, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-700">Lot {index + 1}</h4>
                      {form.watch("lotIdentifications").length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeLotIdentification(index)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`lotIdentifications.${index}.lotNumber`}>Lot Number</Label>
                        <Input 
                          id={`lotIdentifications.${index}.lotNumber`} 
                          placeholder="e.g. 53" 
                          {...form.register(`lotIdentifications.${index}.lotNumber`)} 
                        />
                        {form.formState.errors.lotIdentifications?.[index]?.lotNumber && (
                          <p className="text-sm text-red-500">{form.formState.errors.lotIdentifications[index]?.lotNumber?.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`lotIdentifications.${index}.sectionNumber`}>Section Number (if applicable)</Label>
                        <Input 
                          id={`lotIdentifications.${index}.sectionNumber`} 
                          placeholder="e.g. N/A" 
                          {...form.register(`lotIdentifications.${index}.sectionNumber`)} 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`lotIdentifications.${index}.dpNumber`}>DP/SP Number</Label>
                        <Input 
                          id={`lotIdentifications.${index}.dpNumber`} 
                          placeholder="e.g. 231533" 
                          {...form.register(`lotIdentifications.${index}.dpNumber`)} 
                        />
                        {form.formState.errors.lotIdentifications?.[index]?.dpNumber && (
                          <p className="text-sm text-red-500">{form.formState.errors.lotIdentifications[index]?.dpNumber?.message}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {form.formState.errors.lotIdentifications && (
                  <p className="text-sm text-red-500">{form.formState.errors.lotIdentifications.message}</p>
                )}
              </div>

              {/* Site Characteristics and below - shared component */}
              <DetailedSiteDetails
                siteDetails={siteDetails}
                onSiteDetailsChange={updateSiteDetails}
              />

              <div className="flex justify-end pt-4">
                <Button type="button" onClick={handleSaveSiteDetails} className="gap-2">
                  <Save className="h-4 w-4" /> Save Site Details
                </Button>
              </div>

              <div className="flex justify-between pt-4">
                <Link href="/professionals/SoEE/form/project-setup">
                  <Button variant="outline" type="button" className="gap-2">
                    <ArrowLeft className="h-4 w-4" /> Back
                  </Button>
                </Link>
                <div className="flex gap-2">
                  <Button variant="outline" type="button" className="gap-2" onClick={handleSaveSiteDetails}>
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

