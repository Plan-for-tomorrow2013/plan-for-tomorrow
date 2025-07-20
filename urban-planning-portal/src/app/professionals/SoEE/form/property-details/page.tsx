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
import { useEffect, useState } from "react"
import { DetailedSiteDetails } from '@shared/components/DetailedSiteDetails';
import { SiteDetailsProvider, useSiteDetails } from '@shared/contexts/site-details-context';
import CouncilFilter from '@shared/components/CouncilFilter';
import { Job } from '@shared/types/jobs';

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
  const [jobData, setJobData] = useState<Job | null>(null);

  // Fetch job data to get property data (which contains LEP)
  useEffect(() => {
    const fetchJobData = async () => {
      if (jobId) {
        try {
          const response = await fetch(`/api/jobs/${jobId}`);
          if (response.ok) {
            const data = await response.json();
            setJobData(data);
          }
        } catch (error) {
          console.error('Error fetching job data:', error);
        }
      }
    };
    
    fetchJobData();
  }, [jobId]);

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
    },
  })

  // Load form data from job when it's fetched
  useEffect(() => {
    if (jobData?.formData) {
      form.reset({
        // Lot Identification
        lotIdentifications: jobData.formData.lotIdentifications || [
          {
            lotNumber: "53",
            sectionNumber: "N/A",
            dpNumber: "231533",
          }
        ],

        // Address Details
        streetNumber: jobData.formData.addressDetails?.streetNumber || "9",
        streetName: jobData.formData.addressDetails?.streetName || "Viola Place",
        secondaryStreetName: jobData.formData.addressDetails?.secondaryStreetName || "",
        suburb: jobData.formData.addressDetails?.suburb || "Greystanes",
        postcode: jobData.formData.addressDetails?.postcode || "2145",
      });
    }
  }, [jobData, form]);

  // Use site details context for real-time sync
  const { siteDetails, updateSiteDetails, saveSiteDetails, isLoading } = useSiteDetails();

  // Handle form submission
  const onSubmit = async (data: any) => {
    try {
      // Save the form data to the job
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          formData: {
            lotIdentifications: data.lotIdentifications,
            addressDetails: {
              streetNumber: data.streetNumber,
              streetName: data.streetName,
              secondaryStreetName: data.secondaryStreetName,
              suburb: data.suburb,
              postcode: data.postcode,
            }
          },
          // siteDetails are saved separately by the site details context
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save property details');
      }

      // Navigate to next page
      router.push(`/professionals/SoEE/form/development-details?job=${jobId}`);
    } catch (error) {
      console.error('Error saving property details:', error);
    }
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
                <CouncilFilter propertyData={jobData?.propertyData} showDCP={false} showCouncil={true} />
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

