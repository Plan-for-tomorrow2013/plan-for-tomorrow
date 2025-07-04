"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@shared/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@shared/components/ui/card"
import { Label } from "@shared/components/ui/label"
import { Textarea } from "@shared/components/ui/textarea"
import { Checkbox } from "@shared/components/ui/checkbox"
import { ArrowLeft, ArrowRight, Save } from "lucide-react"
import { FormProgress } from "@/app/professionals/SoEE/components/form-progress"
import Link from "next/link"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@shared/components/ui/accordion"

// Form validation schema
const formSchema = z.object({
  // Context and Setting
  contextAndSetting: z.object({
    noise: z.string().min(1, { message: "Noise assessment is required" }),
    overlooking: z.string().min(1, { message: "Overlooking assessment is required" }),
    overshadowing: z.string().min(1, { message: "Overshadowing assessment is required" }),
    buildingHeight: z.string().min(1, { message: "Building height assessment is required" }),
    setbacksAndLandscaping: z.string().min(1, { message: "Setbacks and landscaping assessment is required" }),
    architecturalStyle: z.string().min(1, { message: "Architectural style assessment is required" }),
  }),

  // Access, Transport and Traffic
  accessTransportTraffic: z.string().min(1, { message: "Access, transport and traffic assessment is required" }),

  // Public Domain
  publicDomain: z.string().min(1, { message: "Public domain assessment is required" }),

  // Utilities
  utilities: z.string().min(1, { message: "Utilities assessment is required" }),

  // Heritage
  heritage: z.string().min(1, { message: "Heritage assessment is required" }),

  // Other Land Resources
  otherLandResources: z.string().min(1, { message: "Other land resources assessment is required" }),

  // Water
  water: z.string().min(1, { message: "Water assessment is required" }),

  // Soils
  soils: z.string().min(1, { message: "Soils assessment is required" }),

  // Air and Microclimate
  airAndMicroclimate: z.string().min(1, { message: "Air and microclimate assessment is required" }),

  // Flora and Fauna
  floraAndFauna: z.string().min(1, { message: "Flora and fauna assessment is required" }),
  treeRemoval: z.boolean().default(false),
  treeRemovalCount: z.string().optional(),

  // Waste
  waste: z.string().min(1, { message: "Waste assessment is required" }),

  // Energy
  energy: z.string().min(1, { message: "Energy assessment is required" }),

  // Noise and Vibration
  noiseAndVibration: z.string().min(1, { message: "Noise and vibration assessment is required" }),

  // Natural Hazards
  naturalHazards: z.string().min(1, { message: "Natural hazards assessment is required" }),
  bushfireProne: z.boolean().default(false),
  floodProne: z.boolean().default(false),

  // Technological Hazards
  technologicalHazards: z.string().min(1, { message: "Technological hazards assessment is required" }),

  // Safety, Security and Crime Prevention
  safetySecurity: z.string().min(1, { message: "Safety, security and crime prevention assessment is required" }),

  // Social and Economic Impact
  socialEconomicImpact: z.string().min(1, { message: "Social and economic impact assessment is required" }),

  // Site Design and Internal Design
  siteDesign: z.string().min(1, { message: "Site design assessment is required" }),

  // Construction
  construction: z.string().min(1, { message: "Construction assessment is required" }),
  constructionHours: z.string().min(1, { message: "Construction hours information is required" }),
  erosionControl: z.string().min(1, { message: "Erosion control measures are required" }),
  dustControl: z.string().min(1, { message: "Dust control measures are required" }),

  // Cumulative Impacts
  cumulativeImpacts: z.string().min(1, { message: "Cumulative impacts assessment is required" }),

  // Additional Information
  additionalInformation: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

export default function EnvironmentalFactorsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const jobId = searchParams.get("job")

  // Initialize form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      // Context and Setting
      contextAndSetting: {
        noise:
          "The proposed development has been designed to minimize noise impacts on neighboring properties. The location of living areas and windows has been considered to reduce potential noise transmission.",
        overlooking:
          "The proposed development has been designed to minimize privacy impacts on neighboring properties. Windows on the upper level have been positioned to avoid direct overlooking of neighboring private open spaces and living areas.",
        overshadowing:
          "Shadow diagrams have been prepared which demonstrate that the proposed development will not result in unreasonable overshadowing of neighboring properties. The adjoining property to the south will receive at least 3 hours of solar access to private open space between 9am and 3pm on June 21 (winter solstice).",
        buildingHeight:
          "The proposed building height is consistent with the desired future character of the area and complies with Council's building height controls.",
        setbacksAndLandscaping:
          "The proposed setbacks and landscaping are consistent with the requirements of the DCP and provide adequate separation from neighboring properties.",
        architecturalStyle:
          "The architectural style and materials are compatible with the existing streetscape character. The front facade has been designed to complement the existing dwelling and surrounding development.",
      },

      // Access, Transport and Traffic
      accessTransportTraffic:
        "The site has frontage to Viola Place. The development is not expected to result in significant additional vehicle movements with the current road network being suitably designed for the current road construction. The development does not require a change to the vehicle access to the site.",

      // Public Domain
      publicDomain: "A contribution under the S.7.12 contribution plan is payable given the proposed development type.",

      // Utilities
      utilities:
        "The development includes the augmentation or upgrading of essential services required for the development.",

      // Heritage
      heritage:
        "The site is not identified as a heritage item, adjoining or adjacent a heritage item or within a heritage conservation area.",

      // Other Land Resources
      otherLandResources: "The development seeks a residential use on the land.",

      // Water
      water: "The development site has provision of Council's water services to the development site.",

      // Soils
      soils:
        "There is no previous history of usage on the site that could potentially lead to a risk in site contamination. It is considered that the sites soils are adequate for the development.",

      // Air and Microclimate
      airAndMicroclimate:
        "The proposed development is considered to have minimal impact on the existing microclimate in the area.",

      // Flora and Fauna
      floraAndFauna:
        "The development site is not expected to contain any critical habitats or threatened or endangered ecological communities. The development does not prevent access of any species to the site and does not require the removal of any remnant vegetation. The development will retain vegetation to the allotment boundaries. The lot does not appear on the NSW Biodiversity Values Map as a lot identified as containing areas of biodiversity value.",
      treeRemoval: false,
      treeRemovalCount: "0",

      // Waste
      waste:
        "Minimal waste will be generated from the operation of the development. Waste from the development may be managed on site.",

      // Energy
      energy:
        "The development includes eco-friendly practices such as rainwater harvesting and renewable energy utilization or as suitable water and energy rated fittings.",

      // Noise and Vibration
      noiseAndVibration:
        "The development will not result in any noise and vibration with the exception of the construction phase. Council's standard hours of operation will be imposed during construction works.",

      // Natural Hazards
      naturalHazards: "The site is not identified as being subject to bushfire or flooding.",
      bushfireProne: false,
      floodProne: false,

      // Technological Hazards
      technologicalHazards: "Previously addressed throughout the report – natural hazards, soils, etc.",

      // Safety, Security and Crime Prevention
      safetySecurity:
        "The development will not result in any decrease in safety, security and prevention of crime in the surrounding area. The new development on the site will provide an increase in passive surveillance of the surrounding environment.",

      // Social and Economic Impact
      socialEconomicImpact:
        "The development will have a positive social impact on the surrounding area. The development will be consistent with development on the existing and adjoining allotments.",

      // Site Design and Internal Design
      siteDesign: "The proposed development will be located with adequate setbacks from all lot boundaries.",

      // Construction
      construction: "Any construction works must be compliant with the Building Code of Australia.",
      constructionHours:
        "Construction will be limited to standard hours: 7am-5pm Monday to Friday, 8am-1pm Saturday, no work on Sundays or public holidays.",
      erosionControl:
        "Sediment control fencing will be installed prior to commencement of works and maintained throughout construction.",
      dustControl:
        "Water sprays will be used as needed during construction to minimize dust. Construction areas will be screened with appropriate dust control measures.",

      // Cumulative Impacts
      cumulativeImpacts:
        "The proposed development is considered to be compliant with surrounding land uses and approval of the application is not expected to result in any unacceptable land use conflicts. Pertinent matters have been addressed in detail in this report, which demonstrates that the development is consistent with applicable planning legislation.",

      // Additional Information
      additionalInformation: "",
    },
  })

  // Handle form submission
  const onSubmit = (data: FormValues) => {
    console.log(data)
    // Save form data to state/localStorage/backend
    // Then navigate to the next step
    router.push(`/professionals/SoEE/form/preview?job=${jobId}`)
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
        <FormProgress currentStep={5} />

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Environmental Factors</CardTitle>
            <CardDescription>
              Assess the environmental impacts of your development for the Statement of Environmental Effects
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Accordion type="multiple" defaultValue={["item-1"]} className="w-full">
                {/* Context and Setting */}
                <AccordionItem value="item-1" className="border rounded-md px-4">
                  <AccordionTrigger className="text-lg font-medium py-4">Context and Setting</AccordionTrigger>
                  <AccordionContent className="space-y-4 pb-4">
                    <div className="space-y-2">
                      <Label htmlFor="noise">Noise</Label>
                      <Textarea
                        id="noise"
                        placeholder="Describe noise impacts and mitigation measures"
                        rows={3}
                        {...form.register("contextAndSetting.noise")}
                      />
                      {form.formState.errors.contextAndSetting?.noise && (
                        <p className="text-sm text-red-500">{form.formState.errors.contextAndSetting.noise.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="overlooking">Overlooking</Label>
                      <Textarea
                        id="overlooking"
                        placeholder="Describe privacy impacts and mitigation measures"
                        rows={3}
                        {...form.register("contextAndSetting.overlooking")}
                      />
                      {form.formState.errors.contextAndSetting?.overlooking && (
                        <p className="text-sm text-red-500">
                          {form.formState.errors.contextAndSetting.overlooking.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="overshadowing">Overshadowing</Label>
                      <Textarea
                        id="overshadowing"
                        placeholder="Describe overshadowing impacts and solar access"
                        rows={3}
                        {...form.register("contextAndSetting.overshadowing")}
                      />
                      {form.formState.errors.contextAndSetting?.overshadowing && (
                        <p className="text-sm text-red-500">
                          {form.formState.errors.contextAndSetting.overshadowing.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="buildingHeight">Building Height</Label>
                      <Textarea
                        id="buildingHeight"
                        placeholder="Describe building height impacts"
                        rows={3}
                        {...form.register("contextAndSetting.buildingHeight")}
                      />
                      {form.formState.errors.contextAndSetting?.buildingHeight && (
                        <p className="text-sm text-red-500">
                          {form.formState.errors.contextAndSetting.buildingHeight.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="setbacksAndLandscaping">Setbacks and Landscaping</Label>
                      <Textarea
                        id="setbacksAndLandscaping"
                        placeholder="Describe setbacks and landscaping"
                        rows={3}
                        {...form.register("contextAndSetting.setbacksAndLandscaping")}
                      />
                      {form.formState.errors.contextAndSetting?.setbacksAndLandscaping && (
                        <p className="text-sm text-red-500">
                          {form.formState.errors.contextAndSetting.setbacksAndLandscaping.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="architecturalStyle">Architectural Style and Materials</Label>
                      <Textarea
                        id="architecturalStyle"
                        placeholder="Describe architectural style and materials"
                        rows={3}
                        {...form.register("contextAndSetting.architecturalStyle")}
                      />
                      {form.formState.errors.contextAndSetting?.architecturalStyle && (
                        <p className="text-sm text-red-500">
                          {form.formState.errors.contextAndSetting.architecturalStyle.message}
                        </p>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Access, Transport and Traffic */}
                <AccordionItem value="item-2" className="border rounded-md px-4 mt-4">
                  <AccordionTrigger className="text-lg font-medium py-4">
                    Access, Transport and Traffic
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 pb-4">
                    <div className="space-y-2">
                      <Textarea
                        id="accessTransportTraffic"
                        placeholder="Describe access, transport and traffic impacts"
                        rows={3}
                        {...form.register("accessTransportTraffic")}
                      />
                      {form.formState.errors.accessTransportTraffic && (
                        <p className="text-sm text-red-500">{form.formState.errors.accessTransportTraffic.message}</p>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Public Domain */}
                <AccordionItem value="item-3" className="border rounded-md px-4 mt-4">
                  <AccordionTrigger className="text-lg font-medium py-4">Public Domain</AccordionTrigger>
                  <AccordionContent className="space-y-4 pb-4">
                    <div className="space-y-2">
                      <Textarea
                        id="publicDomain"
                        placeholder="Describe public domain impacts"
                        rows={3}
                        {...form.register("publicDomain")}
                      />
                      {form.formState.errors.publicDomain && (
                        <p className="text-sm text-red-500">{form.formState.errors.publicDomain.message}</p>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Utilities */}
                <AccordionItem value="item-4" className="border rounded-md px-4 mt-4">
                  <AccordionTrigger className="text-lg font-medium py-4">Utilities</AccordionTrigger>
                  <AccordionContent className="space-y-4 pb-4">
                    <div className="space-y-2">
                      <Textarea
                        id="utilities"
                        placeholder="Describe utilities impacts"
                        rows={3}
                        {...form.register("utilities")}
                      />
                      {form.formState.errors.utilities && (
                        <p className="text-sm text-red-500">{form.formState.errors.utilities.message}</p>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Heritage */}
                <AccordionItem value="item-5" className="border rounded-md px-4 mt-4">
                  <AccordionTrigger className="text-lg font-medium py-4">Heritage</AccordionTrigger>
                  <AccordionContent className="space-y-4 pb-4">
                    <div className="space-y-2">
                      <Textarea
                        id="heritage"
                        placeholder="Describe heritage impacts"
                        rows={3}
                        {...form.register("heritage")}
                      />
                      {form.formState.errors.heritage && (
                        <p className="text-sm text-red-500">{form.formState.errors.heritage.message}</p>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Other Land Resources */}
                <AccordionItem value="item-6" className="border rounded-md px-4 mt-4">
                  <AccordionTrigger className="text-lg font-medium py-4">Other Land Resources</AccordionTrigger>
                  <AccordionContent className="space-y-4 pb-4">
                    <div className="space-y-2">
                      <Textarea
                        id="otherLandResources"
                        placeholder="Describe other land resources impacts"
                        rows={3}
                        {...form.register("otherLandResources")}
                      />
                      {form.formState.errors.otherLandResources && (
                        <p className="text-sm text-red-500">{form.formState.errors.otherLandResources.message}</p>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Water */}
                <AccordionItem value="item-7" className="border rounded-md px-4 mt-4">
                  <AccordionTrigger className="text-lg font-medium py-4">Water</AccordionTrigger>
                  <AccordionContent className="space-y-4 pb-4">
                    <div className="space-y-2">
                      <Textarea id="water" placeholder="Describe water impacts" rows={3} {...form.register("water")} />
                      {form.formState.errors.water && (
                        <p className="text-sm text-red-500">{form.formState.errors.water.message}</p>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Soils */}
                <AccordionItem value="item-8" className="border rounded-md px-4 mt-4">
                  <AccordionTrigger className="text-lg font-medium py-4">Soils</AccordionTrigger>
                  <AccordionContent className="space-y-4 pb-4">
                    <div className="space-y-2">
                      <Textarea id="soils" placeholder="Describe soils impacts" rows={3} {...form.register("soils")} />
                      {form.formState.errors.soils && (
                        <p className="text-sm text-red-500">{form.formState.errors.soils.message}</p>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Air and Microclimate */}
                <AccordionItem value="item-9" className="border rounded-md px-4 mt-4">
                  <AccordionTrigger className="text-lg font-medium py-4">Air and Microclimate</AccordionTrigger>
                  <AccordionContent className="space-y-4 pb-4">
                    <div className="space-y-2">
                      <Textarea
                        id="airAndMicroclimate"
                        placeholder="Describe air and microclimate impacts"
                        rows={3}
                        {...form.register("airAndMicroclimate")}
                      />
                      {form.formState.errors.airAndMicroclimate && (
                        <p className="text-sm text-red-500">{form.formState.errors.airAndMicroclimate.message}</p>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Flora and Fauna */}
                <AccordionItem value="item-10" className="border rounded-md px-4 mt-4">
                  <AccordionTrigger className="text-lg font-medium py-4">Flora and Fauna</AccordionTrigger>
                  <AccordionContent className="space-y-4 pb-4">
                    <div className="space-y-2">
                      <Textarea
                        id="floraAndFauna"
                        placeholder="Describe flora and fauna impacts"
                        rows={3}
                        {...form.register("floraAndFauna")}
                      />
                      {form.formState.errors.floraAndFauna && (
                        <p className="text-sm text-red-500">{form.formState.errors.floraAndFauna.message}</p>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="treeRemoval"
                        checked={form.getValues("treeRemoval")}
                        onCheckedChange={(checked) => form.setValue("treeRemoval", checked === true)}
                      />
                      <Label htmlFor="treeRemoval">Tree removal proposed</Label>
                    </div>

                    {form.watch("treeRemoval") && (
                      <div className="space-y-2 ml-6">
                        <Label htmlFor="treeRemovalCount">Number of trees to be removed</Label>
                        <Textarea
                          id="treeRemovalCount"
                          placeholder="Describe the number and type of trees to be removed"
                          rows={2}
                          {...form.register("treeRemovalCount")}
                        />
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>

                {/* Waste */}
                <AccordionItem value="item-11" className="border rounded-md px-4 mt-4">
                  <AccordionTrigger className="text-lg font-medium py-4">Waste</AccordionTrigger>
                  <AccordionContent className="space-y-4 pb-4">
                    <div className="space-y-2">
                      <Textarea id="waste" placeholder="Describe waste impacts" rows={3} {...form.register("waste")} />
                      {form.formState.errors.waste && (
                        <p className="text-sm text-red-500">{form.formState.errors.waste.message}</p>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Energy */}
                <AccordionItem value="item-12" className="border rounded-md px-4 mt-4">
                  <AccordionTrigger className="text-lg font-medium py-4">Energy</AccordionTrigger>
                  <AccordionContent className="space-y-4 pb-4">
                    <div className="space-y-2">
                      <Textarea
                        id="energy"
                        placeholder="Describe energy efficiency measures"
                        rows={3}
                        {...form.register("energy")}
                      />
                      {form.formState.errors.energy && (
                        <p className="text-sm text-red-500">{form.formState.errors.energy.message}</p>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Noise and Vibration */}
                <AccordionItem value="item-13" className="border rounded-md px-4 mt-4">
                  <AccordionTrigger className="text-lg font-medium py-4">Noise and Vibration</AccordionTrigger>
                  <AccordionContent className="space-y-4 pb-4">
                    <div className="space-y-2">
                      <Textarea
                        id="noiseAndVibration"
                        placeholder="Describe noise and vibration impacts"
                        rows={3}
                        {...form.register("noiseAndVibration")}
                      />
                      {form.formState.errors.noiseAndVibration && (
                        <p className="text-sm text-red-500">{form.formState.errors.noiseAndVibration.message}</p>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Natural Hazards */}
                <AccordionItem value="item-14" className="border rounded-md px-4 mt-4">
                  <AccordionTrigger className="text-lg font-medium py-4">Natural Hazards</AccordionTrigger>
                  <AccordionContent className="space-y-4 pb-4">
                    <div className="space-y-2">
                      <Textarea
                        id="naturalHazards"
                        placeholder="Describe natural hazards impacts"
                        rows={3}
                        {...form.register("naturalHazards")}
                      />
                      {form.formState.errors.naturalHazards && (
                        <p className="text-sm text-red-500">{form.formState.errors.naturalHazards.message}</p>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="bushfireProne"
                        checked={form.getValues("bushfireProne")}
                        onCheckedChange={(checked) => form.setValue("bushfireProne", checked === true)}
                      />
                      <Label htmlFor="bushfireProne">Site is bushfire prone</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="floodProne"
                        checked={form.getValues("floodProne")}
                        onCheckedChange={(checked) => form.setValue("floodProne", checked === true)}
                      />
                      <Label htmlFor="floodProne">Site is flood prone</Label>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Technological Hazards */}
                <AccordionItem value="item-15" className="border rounded-md px-4 mt-4">
                  <AccordionTrigger className="text-lg font-medium py-4">Technological Hazards</AccordionTrigger>
                  <AccordionContent className="space-y-4 pb-4">
                    <div className="space-y-2">
                      <Textarea
                        id="technologicalHazards"
                        placeholder="Describe technological hazards impacts"
                        rows={3}
                        {...form.register("technologicalHazards")}
                      />
                      {form.formState.errors.technologicalHazards && (
                        <p className="text-sm text-red-500">{form.formState.errors.technologicalHazards.message}</p>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Safety, Security and Crime Prevention */}
                <AccordionItem value="item-16" className="border rounded-md px-4 mt-4">
                  <AccordionTrigger className="text-lg font-medium py-4">
                    Safety, Security and Crime Prevention
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 pb-4">
                    <div className="space-y-2">
                      <Textarea
                        id="safetySecurity"
                        placeholder="Describe safety, security and crime prevention impacts"
                        rows={3}
                        {...form.register("safetySecurity")}
                      />
                      {form.formState.errors.safetySecurity && (
                        <p className="text-sm text-red-500">{form.formState.errors.safetySecurity.message}</p>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Social and Economic Impact */}
                <AccordionItem value="item-17" className="border rounded-md px-4 mt-4">
                  <AccordionTrigger className="text-lg font-medium py-4">Social and Economic Impact</AccordionTrigger>
                  <AccordionContent className="space-y-4 pb-4">
                    <div className="space-y-2">
                      <Textarea
                        id="socialEconomicImpact"
                        placeholder="Describe social and economic impacts"
                        rows={3}
                        {...form.register("socialEconomicImpact")}
                      />
                      {form.formState.errors.socialEconomicImpact && (
                        <p className="text-sm text-red-500">{form.formState.errors.socialEconomicImpact.message}</p>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Site Design and Internal Design */}
                <AccordionItem value="item-18" className="border rounded-md px-4 mt-4">
                  <AccordionTrigger className="text-lg font-medium py-4">
                    Site Design and Internal Design
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 pb-4">
                    <div className="space-y-2">
                      <Textarea
                        id="siteDesign"
                        placeholder="Describe site design and internal design"
                        rows={3}
                        {...form.register("siteDesign")}
                      />
                      {form.formState.errors.siteDesign && (
                        <p className="text-sm text-red-500">{form.formState.errors.siteDesign.message}</p>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Construction */}
                <AccordionItem value="item-19" className="border rounded-md px-4 mt-4">
                  <AccordionTrigger className="text-lg font-medium py-4">Construction</AccordionTrigger>
                  <AccordionContent className="space-y-4 pb-4">
                    <div className="space-y-2">
                      <Textarea
                        id="construction"
                        placeholder="Describe construction impacts"
                        rows={3}
                        {...form.register("construction")}
                      />
                      {form.formState.errors.construction && (
                        <p className="text-sm text-red-500">{form.formState.errors.construction.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="constructionHours">Construction Hours</Label>
                      <Textarea
                        id="constructionHours"
                        placeholder="Describe construction hours"
                        rows={2}
                        {...form.register("constructionHours")}
                      />
                      {form.formState.errors.constructionHours && (
                        <p className="text-sm text-red-500">{form.formState.errors.constructionHours.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="erosionControl">Erosion Control</Label>
                      <Textarea
                        id="erosionControl"
                        placeholder="Describe erosion control measures"
                        rows={2}
                        {...form.register("erosionControl")}
                      />
                      {form.formState.errors.erosionControl && (
                        <p className="text-sm text-red-500">{form.formState.errors.erosionControl.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dustControl">Dust Control</Label>
                      <Textarea
                        id="dustControl"
                        placeholder="Describe dust control measures"
                        rows={2}
                        {...form.register("dustControl")}
                      />
                      {form.formState.errors.dustControl && (
                        <p className="text-sm text-red-500">{form.formState.errors.dustControl.message}</p>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Cumulative Impacts */}
                <AccordionItem value="item-20" className="border rounded-md px-4 mt-4">
                  <AccordionTrigger className="text-lg font-medium py-4">Cumulative Impacts</AccordionTrigger>
                  <AccordionContent className="space-y-4 pb-4">
                    <div className="space-y-2">
                      <Textarea
                        id="cumulativeImpacts"
                        placeholder="Describe cumulative impacts"
                        rows={3}
                        {...form.register("cumulativeImpacts")}
                      />
                      {form.formState.errors.cumulativeImpacts && (
                        <p className="text-sm text-red-500">{form.formState.errors.cumulativeImpacts.message}</p>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              {/* Additional Information */}
              <div className="space-y-4 mt-6">
                <h3 className="text-lg font-medium">Additional Information</h3>
                <div className="space-y-2">
                  <Label htmlFor="additionalInformation">Additional Environmental Considerations</Label>
                  <Textarea
                    id="additionalInformation"
                    placeholder="Provide any additional information about environmental impacts not covered above"
                    rows={4}
                    {...form.register("additionalInformation")}
                  />
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Link href="/professionals/SoEE/form/planning?job=${jobId}">
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

