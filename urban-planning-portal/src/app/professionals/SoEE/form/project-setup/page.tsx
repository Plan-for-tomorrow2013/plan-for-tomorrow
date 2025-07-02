"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/app/professionals/SoEE/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/professionals/SoEE/components/ui/card"
import { Input } from "@/app/professionals/SoEE/components/ui/input"
import { Label } from "@/app/professionals/SoEE/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/professionals/SoEE/components/ui/select"
import { ArrowRight, Save } from "lucide-react"
import { FormProgress } from "@/app/professionals/SoEE/components/form-progress"
import { AddressSearch } from "@/app/professionals/SoEE/components/address-search"
import { useFormData } from "@/app/professionals/SoEE/lib/form-context"
import { useToast } from "@/app/professionals/SoEE/hooks/use-toast"

// Form validation schema
const formSchema = z.object({
  projectName: z.string().min(3, {
    message: "Project name must be at least 3 characters.",
  }),
  address: z.string().optional(),
  developmentType: z.string({
    required_error: "Please select a development type.",
  }),
  customDevelopmentType: z.string().optional(),
  councilArea: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

export default function ProjectSetupPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const jobId = searchParams.get("job")
  const { formData, updateFormData, saveDraft } = useFormData()
  const { toast } = useToast()
  const [showCustomType, setShowCustomType] = useState(false)

  // Initialize form with values from context if available
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      projectName: formData.project.projectName || "",
      address: formData.project.address || "",
      developmentType: formData.project.developmentType || "",
      customDevelopmentType: formData.project.customDevelopmentType || "",
      councilArea: formData.project.councilArea || "",
    },
  })

  // Set showCustomType based on the development type
  useEffect(() => {
    if (formData.project.developmentType === "other") {
      setShowCustomType(true)
    }
  }, [formData.project.developmentType])

  // Handle form submission
  const onSubmit = (data: FormValues) => {
    // Update context with form data
    updateFormData("project", data)

    // Navigate to the next step
    router.push(`/professionals/SoEE/form/property-details?job=${jobId}`)
  }

  // Handle development type change to show/hide custom type field
  const handleDevelopmentTypeChange = (value: string) => {
    form.setValue("developmentType", value)
    setShowCustomType(value === "other")
  }

  // Handle save draft functionality
  const handleSaveDraft = () => {
    const currentValues = form.getValues()
    updateFormData("project", currentValues)
    saveDraft()

    // Show success message
    toast({
      title: "Draft Saved",
      description: "Your progress has been saved successfully.",
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-10 px-4 max-w-3xl">
        {/* Progress Bar */}
        <FormProgress currentStep={1} />

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Project Setup</CardTitle>
            <CardDescription>Start by providing basic information about your development application</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                {/* Project Name */}
                <div className="space-y-2">
                  <Label htmlFor="projectName">Project Name</Label>
                  <Input
                    id="projectName"
                    placeholder="e.g. 9 Viola Place Alterations and Additions"
                    {...form.register("projectName")}
                  />
                  {form.formState.errors.projectName && (
                    <p className="text-sm text-red-500">{form.formState.errors.projectName.message}</p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    This is for your reference only and won't appear in the document
                  </p>
                </div>

                {/* Address Search (hardcoded) */}
                <div className="space-y-2">
                  <Label htmlFor="address">Property Address</Label>
                  <Input
                    id="address"
                    value="9 Viola Place, Greystanes"
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-sm text-muted-foreground">
                    Address is currently fixed for testing. Geocoding will be integrated later.
                  </p>
                </div>

                {/* Council Area (hardcoded) */}
                <div className="space-y-2">
                  <Label htmlFor="councilArea">Council Area</Label>
                  <Input
                    id="councilArea"
                    value="Cumberland Council"
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-sm text-muted-foreground">Council area is currently fixed for testing.</p>
                </div>

                {/* Development Type */}
                <div className="space-y-2">
                  <Label htmlFor="developmentType">Development Type</Label>
                  <Select onValueChange={handleDevelopmentTypeChange} defaultValue={form.getValues("developmentType")}>
                    <SelectTrigger id="developmentType">
                      <SelectValue placeholder="Select development type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new-dwelling">New Dwelling</SelectItem>
                      <SelectItem value="alterations-additions">Alterations and Additions</SelectItem>
                      <SelectItem value="secondary-dwelling">Secondary Dwelling (Granny Flat)</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.developmentType && (
                    <p className="text-sm text-red-500">{form.formState.errors.developmentType.message}</p>
                  )}
                </div>

                {/* Custom Development Type (conditional) */}
                {showCustomType && (
                  <div className="space-y-2">
                    <Label htmlFor="customDevelopmentType">Custom Development Type</Label>
                    <Input
                      id="customDevelopmentType"
                      placeholder="Please specify development type"
                      {...form.register("customDevelopmentType")}
                    />
                    <p className="text-sm text-muted-foreground">
                      Please provide a specific description of your development type
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-between pt-4">
                <div></div> {/* Empty div to maintain flex spacing */}
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

