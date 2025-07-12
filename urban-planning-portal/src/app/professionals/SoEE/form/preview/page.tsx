"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@shared/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@shared/components/ui/card"
import { ArrowLeft, Download, FileText, Pencil, Save } from "lucide-react"
import { FormProgress } from "@/app/professionals/SoEE/components/form-progress"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@shared/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@shared/components/ui/accordion"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@shared/components/ui/table"
import { Badge } from "@shared/components/ui/badge"
import { useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@shared/components/ui/alert"
import { useFormData } from "@/app/professionals/SoEE/lib/form-context"
import { useToast } from "@/app/professionals/SoEE/hooks/use-toast"

export default function PreviewPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const jobId = searchParams.get("job")
  const { formData, saveDraft } = useFormData()
  const { toast } = useToast()
  const [isGenerating, setIsGenerating] = useState(false)
  const [isGenerated, setIsGenerated] = useState(false)
  const [generatedDocId, setGeneratedDocId] = useState<string | null>(null)
  const [generatedVersion, setGeneratedVersion] = useState<number | null>(null)

  // Get development type display name
  const getDevelopmentTypeDisplay = (type: string) => {
    switch (type) {
      case "new-dwelling":
        return "New Dwelling"
      case "alterations-additions":
        return "Alterations and Additions"
      case "dual-occupancy":
        return "Dual Occupancy"
      case "secondary-dwelling":
        return "Secondary Dwelling (Granny Flat)"
      case "multi-dwelling":
        return "Multi Dwelling Housing"
      case "commercial":
        return "Commercial Development"
      case "mixed-use":
        return "Mixed Use Development"
      case "subdivision":
        return "Subdivision"
      case "other":
        return formData.project.customDevelopmentType || "Other"
      default:
        return type
    }
  }

  // Handle generate document
  const handleGenerateDocument = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch('/api/documents/generate-soee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId,
          uploadedBy: 'currentUser', // TODO: Replace with actual user info
          formData,
        }),
      })
      const data = await response.json()
      if (data.success) {
        setIsGenerated(true)
        setGeneratedDocId(data.documentId)
        setGeneratedVersion(data.version)
        toast({
          title: 'Document Generated',
          description: 'Your Statement of Environmental Effects has been generated successfully.',
        })
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to generate document.',
          variant: 'destructive',
        })
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to generate document.',
        variant: 'destructive',
      })
    } finally {
      setIsGenerating(false)
    }
  }

  // Handle download document
  const handleDownloadDocument = async () => {
    if (!generatedDocId) return
    try {
      const url = `/api/documents/${generatedDocId}/download?jobId=${jobId}`
      const response = await fetch(url)
      if (!response.ok) throw new Error('Download failed')
      const blob = await response.blob()
      const a = document.createElement('a')
      a.href = window.URL.createObjectURL(blob)
      a.download = 'SoEE.docx'
      a.click()
      window.URL.revokeObjectURL(a.href)
      toast({
        title: 'Document Downloaded',
        description: 'Your Statement of Environmental Effects has been downloaded.',
      })
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to download document.',
        variant: 'destructive',
      })
    }
  }

  // Handle save and exit
  const handleSaveAndExit = () => {
    saveDraft()

    toast({
      title: "Progress Saved",
      description: "Your progress has been saved. You can continue later.",
    })

    router.push(`/professionals/report-writer?job=${jobId}&soeeGenerated=true`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-10 px-4 max-w-4xl">
        {/* Progress Bar */}
        <FormProgress currentStep={6} />

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Preview and Generate</CardTitle>
            <CardDescription>
              Review your Statement of Environmental Effects and generate the final document
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="summary" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="full">Full Preview</TabsTrigger>
              </TabsList>

              {/* Summary Tab */}
              <TabsContent value="summary" className="space-y-6">
                <div className="grid gap-6">
                  {/* Project Summary */}
                  <Card>
                    <CardHeader className="py-4 px-6 flex flex-row items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">Project Details</CardTitle>
                      </div>
                      <Link href={`/professionals/SoEE/form/project-setup?job=${jobId}`}>
                        <Button variant="ghost" size="sm" className="gap-1">
                          <Pencil className="h-4 w-4" /> Edit
                        </Button>
                      </Link>
                    </CardHeader>
                    <CardContent className="px-6 py-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Project Name</p>
                          <p>{formData.project.projectName || "Not specified"}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Development Type</p>
                          <p>{getDevelopmentTypeDisplay(formData.project.developmentType) || "Not specified"}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Address</p>
                          <p>{formData.project.address || "Not specified"}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Council Area</p>
                          <p>{formData.project.councilArea || "Not specified"}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Property Summary */}
                  <Card>
                    <CardHeader className="py-4 px-6 flex flex-row items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">Property Details</CardTitle>
                      </div>
                      <Link href={`/professionals/SoEE/form/property-details?job=${jobId}`}>
                        <Button variant="ghost" size="sm" className="gap-1">
                          <Pencil className="h-4 w-4" /> Edit
                        </Button>
                      </Link>
                    </CardHeader>
                    <CardContent className="px-6 py-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Lot Details</p>
                          <p>
                            {formData.property.lotNumber && formData.property.dpNumber
                              ? `Lot ${formData.property.lotNumber} DP ${formData.property.dpNumber}`
                              : "Not specified"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Site Area</p>
                          <p>{formData.property.siteArea ? `${formData.property.siteArea} m²` : "Not specified"}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Lot Type</p>
                          <p className="capitalize">{formData.property.lotType || "Not specified"}</p>
                        </div>
                      </div>

                      <div className="mt-4">
                        <p className="text-sm font-medium text-muted-foreground">Site Constraints</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {Object.entries(formData.property.constraints || {}).some(([_, value]) => value) ? (
                            Object.entries(formData.property.constraints || {}).map(([key, value]) => {
                              if (value) {
                                return (
                                  <Badge key={key} variant="outline" className="capitalize">
                                    {key.replace(/([A-Z])/g, " $1").trim()}
                                  </Badge>
                                )
                              }
                              return null
                            })
                          ) : (
                            <span className="text-sm">No significant constraints identified</span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Development Summary */}
                  <Card>
                    <CardHeader className="py-4 px-6 flex flex-row items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">Development Details</CardTitle>
                      </div>
                      <Link href={`/professionals/SoEE/form/development-details?job=${jobId}`}>
                        <Button variant="ghost" size="sm" className="gap-1">
                          <Pencil className="h-4 w-4" /> Edit
                        </Button>
                      </Link>
                    </CardHeader>
                    <CardContent className="px-6 py-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Building Height</p>
                          <p>
                            {formData.development.buildingHeight
                              ? `${formData.development.buildingHeight}m`
                              : "Not specified"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Number of Storeys</p>
                          <p>{formData.development.storeys || "Not specified"}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Floor Space Ratio</p>
                          <p>
                            {formData.development.floorSpaceRatio
                              ? `${formData.development.floorSpaceRatio}:1`
                              : "Not specified"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Landscaped Area</p>
                          <p>
                            {formData.development.landscapedAreaPercentage
                              ? `${formData.development.landscapedAreaPercentage}%`
                              : "Not specified"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Car Parking</p>
                          <p>
                            {formData.development.carParkingSpaces
                              ? `${formData.development.carParkingSpaces} spaces`
                              : "Not specified"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Site Coverage</p>
                          <p>
                            {formData.development.proposedSiteCoverage
                              ? `${formData.development.proposedSiteCoverage}%`
                              : "Not specified"}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4">
                        <p className="text-sm font-medium text-muted-foreground">Description</p>
                        <p className="text-sm mt-1">{formData.development.developmentDescription || "Not specified"}</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Planning Summary */}
                  <Card>
                    <CardHeader className="py-4 px-6 flex flex-row items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">Planning Controls</CardTitle>
                      </div>
                      <Link href={`/professionals/SoEE/form/planning?job=${jobId}`}>
                        <Button variant="ghost" size="sm" className="gap-1">
                          <Pencil className="h-4 w-4" /> Edit
                        </Button>
                      </Link>
                    </CardHeader>
                    <CardContent className="px-6 py-4">
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Zoning</p>
                          <p>{formData.planning.zoning || "Not specified"}</p>
                        </div>

                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Compliance Summary</p>
                          <Table className="mt-2">
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-1/3">Control</TableHead>
                                <TableHead className="w-1/3">Requirement</TableHead>
                                <TableHead className="w-1/3">Proposed</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              <TableRow>
                                <TableCell>Height</TableCell>
                                <TableCell>{formData.planning.heightControl || "Not specified"}</TableCell>
                                <TableCell>
                                  {formData.planning.heightProposed
                                    ? `${formData.planning.heightProposed}m`
                                    : "Not specified"}
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>FSR</TableCell>
                                <TableCell>{formData.planning.fsrControl || "Not specified"}</TableCell>
                                <TableCell>{formData.planning.fsrProposed || "Not specified"}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>Landscaped Area</TableCell>
                                <TableCell>{formData.planning.landscapedAreaControl || "Not specified"}</TableCell>
                                <TableCell>{formData.planning.landscapedAreaProposed || "Not specified"}</TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </div>

                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Applicable SEPPs</p>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {formData.planning.seppBasix && <Badge variant="outline">SEPP (BASIX)</Badge>}
                            {formData.planning.seppResilience && (
                              <Badge variant="outline">SEPP (Resilience and Hazards)</Badge>
                            )}
                            {formData.planning.seppBiodiversity && <Badge variant="outline">SEPP (Biodiversity)</Badge>}
                            {formData.planning.seppTransport && (
                              <Badge variant="outline">SEPP (Transport and Infrastructure)</Badge>
                            )}
                            {!formData.planning.seppBasix &&
                              !formData.planning.seppResilience &&
                              !formData.planning.seppBiodiversity &&
                              !formData.planning.seppTransport && <span className="text-sm">No SEPPs specified</span>}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Environmental Summary */}
                  <Card>
                    <CardHeader className="py-4 px-6 flex flex-row items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">Environmental Factors</CardTitle>
                      </div>
                      <Link href={`/professionals/SoEE/form/environmental-factors?job=${jobId}`}>
                        <Button variant="ghost" size="sm" className="gap-1">
                          <Pencil className="h-4 w-4" /> Edit
                        </Button>
                      </Link>
                    </CardHeader>
                    <CardContent className="px-6 py-4">
                      <div className="space-y-4">
                        {/* Context and Setting */}
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Context and Setting</p>
                          <ul className="list-disc list-inside text-sm mt-1 space-y-1">
                            <li>
                              <span className="font-medium">Privacy:</span>{" "}
                              {formData.environmental?.contextAndSetting?.overlooking
                                ? formData.environmental.contextAndSetting.overlooking.substring(0, 60) + "..."
                                : "Windows positioned to minimize overlooking of neighboring properties"}
                            </li>
                            <li>
                              <span className="font-medium">Overshadowing:</span>{" "}
                              {formData.environmental?.contextAndSetting?.overshadowing
                                ? formData.environmental.contextAndSetting.overshadowing.substring(0, 60) + "..."
                                : "Adequate solar access maintained to neighboring properties"}
                            </li>
                            <li>
                              <span className="font-medium">Visual Bulk and Scale:</span>{" "}
                              {formData.environmental?.contextAndSetting?.buildingHeight
                                ? formData.environmental.contextAndSetting.buildingHeight.substring(0, 60) + "..."
                                : "Building height and scale compatible with surrounding development"}
                            </li>
                            <li>
                              <span className="font-medium">Noise:</span>{" "}
                              {formData.environmental?.contextAndSetting?.noise
                                ? formData.environmental.contextAndSetting.noise.substring(0, 60) + "..."
                                : "Noise impacts minimized through appropriate design"}
                            </li>
                          </ul>
                        </div>

                        {/* Access, Transport and Traffic */}
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Access, Transport and Traffic</p>
                          <p className="text-sm mt-1">
                            {formData.environmental?.accessTransportTraffic
                              ? formData.environmental.accessTransportTraffic.substring(0, 100) + "..."
                              : "The development will not significantly impact local traffic conditions"}
                          </p>
                        </div>

                        {/* Natural Hazards */}
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Natural Hazards</p>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {formData.environmental?.bushfireProne && <Badge variant="outline">Bushfire Prone</Badge>}
                            {formData.environmental?.floodProne && <Badge variant="outline">Flood Prone</Badge>}
                            {!formData.environmental?.bushfireProne && !formData.environmental?.floodProne && (
                              <p className="text-sm">No natural hazards identified</p>
                            )}
                          </div>
                          <p className="text-sm mt-1">
                            {formData.environmental?.naturalHazards
                              ? formData.environmental.naturalHazards.substring(0, 100) + "..."
                              : ""}
                          </p>
                        </div>

                        {/* Flora and Fauna */}
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Flora and Fauna</p>
                          <p className="text-sm mt-1">
                            {formData.environmental?.floraAndFauna
                              ? formData.environmental.floraAndFauna.substring(0, 100) + "..."
                              : "No significant impact on flora and fauna"}
                          </p>
                          {formData.environmental?.treeRemoval && (
                            <p className="text-sm mt-1">
                              <span className="font-medium">Tree Removal:</span>{" "}
                              {formData.environmental.treeRemovalCount || "Number not specified"}
                            </p>
                          )}
                        </div>

                        {/* Construction */}
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Construction Management</p>
                          <ul className="list-disc list-inside text-sm mt-1 space-y-1">
                            <li>
                              <span className="font-medium">Hours:</span>{" "}
                              {formData.environmental?.constructionHours
                                ? formData.environmental.constructionHours.substring(0, 60) + "..."
                                : "Standard construction hours will be observed"}
                            </li>
                            <li>
                              <span className="font-medium">Erosion Control:</span>{" "}
                              {formData.environmental?.erosionControl
                                ? formData.environmental.erosionControl.substring(0, 60) + "..."
                                : "Appropriate erosion control measures will be implemented"}
                            </li>
                            <li>
                              <span className="font-medium">Dust Control:</span>{" "}
                              {formData.environmental?.dustControl
                                ? formData.environmental.dustControl.substring(0, 60) + "..."
                                : "Dust suppression measures will be implemented during construction"}
                            </li>
                          </ul>
                        </div>

                        {/* Other Key Factors */}
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Other Key Factors</p>
                          <ul className="list-disc list-inside text-sm mt-1 space-y-1">
                            <li>
                              <span className="font-medium">Heritage:</span>{" "}
                              {formData.environmental?.heritage
                                ? formData.environmental.heritage.substring(0, 60) + "..."
                                : "No heritage impacts identified"}
                            </li>
                            <li>
                              <span className="font-medium">Energy:</span>{" "}
                              {formData.environmental?.energy
                                ? formData.environmental.energy.substring(0, 60) + "..."
                                : "Energy efficiency measures incorporated into the design"}
                            </li>
                            <li>
                              <span className="font-medium">Waste:</span>{" "}
                              {formData.environmental?.waste
                                ? formData.environmental.waste.substring(0, 60) + "..."
                                : "Appropriate waste management procedures will be implemented"}
                            </li>
                            <li>
                              <span className="font-medium">Water:</span>{" "}
                              {formData.environmental?.water
                                ? formData.environmental.water.substring(0, 60) + "..."
                                : "Water management measures incorporated into the design"}
                            </li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Full Preview Tab */}
              <TabsContent value="full" className="space-y-6">
                <div className="border rounded-lg p-6 bg-white">
                  <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold">STATEMENT OF ENVIRONMENTAL EFFECTS</h1>
                    <h2 className="text-xl mt-2">{formData.project.address || "[Property Address]"}</h2>
                    <p className="mt-2">
                      Prepared for Development Application to {formData.project.councilArea || "[Council Name]"}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">Date: {new Date().toLocaleDateString()}</p>
                  </div>

                  <Accordion type="multiple" defaultValue={["item-1"]} className="w-full">
                    {/* 1. Introduction */}
                    <AccordionItem value="item-1">
                      <AccordionTrigger className="text-lg font-semibold">1. Introduction</AccordionTrigger>
                      <AccordionContent className="space-y-4 text-sm">
                        <p>
                          This Statement of Environmental Effects has been prepared to accompany a Development
                          Application to {formData.project.councilArea || "[Council Name]"} for{" "}
                          {formData.development.developmentDescription?.toLowerCase() || "the proposed development"} at{" "}
                          {formData.project.address || "[Property Address]"}.
                        </p>
                        <p>
                          The purpose of this Statement of Environmental Effects is to describe the proposed development
                          and to assess the potential environmental impacts of the development. It also demonstrates how
                          the proposal complies with the relevant planning controls applicable to the site.
                        </p>
                        <p>
                          The development application seeks approval for{" "}
                          {formData.development.developmentDescription?.toLowerCase() || "the proposed development"}.
                        </p>
                      </AccordionContent>
                    </AccordionItem>

                    {/* 2. Site Analysis */}
                    <AccordionItem value="item-2">
                      <AccordionTrigger className="text-lg font-semibold">2. Site Analysis</AccordionTrigger>
                      <AccordionContent className="space-y-4 text-sm">
                        <h3 className="font-semibold">2.1 Site Identification</h3>
                        <p>
                          The subject site is legally described as Lot {formData.property.lotNumber || "[Lot Number]"}{" "}
                          in DP {formData.property.dpNumber || "[DP Number]"} and is known as{" "}
                          {formData.project.address || "[Property Address]"}.
                        </p>

                        <h3 className="font-semibold mt-4">2.2 Site Description</h3>
                        <p>
                          The site is a {formData.property.lotType || "standard"} allotment with an area of{" "}
                          {formData.property.siteArea ? `${formData.property.siteArea} m²` : "[Site Area]"}. The site
                          has a frontage of{" "}
                          {formData.property.primaryStreetWidth
                            ? `${formData.property.primaryStreetWidth} m`
                            : "[Frontage]"}{" "}
                          to {formData.property.streetName || "[Street Name]"} and a depth of{" "}
                          {formData.property.siteDepth ? `${formData.property.siteDepth} m` : "[Depth]"}.
                        </p>
                        {formData.property.gradient && (
                          <p>
                            The site has a {formData.property.gradient} gradient with a fall of approximately{" "}
                            {formData.property.fallAmount || "[Fall Amount]"} m from the{" "}
                            {formData.property.gradient.includes("rear-to-front")
                              ? "rear to the front"
                              : formData.property.gradient.includes("front-to-rear")
                                ? "front to the rear"
                                : formData.property.gradient}
                            .
                          </p>
                        )}
                        {formData.property.existingDevelopmentDetails && (
                          <p>The site currently contains {formData.property.existingDevelopmentDetails}.</p>
                        )}

                        <h3 className="font-semibold mt-4">2.3 Surrounding Development</h3>
                        <p>The surrounding development consists of:</p>
                        <ul className="list-disc list-inside ml-4 space-y-1">
                          <li>
                            <span className="font-medium">North:</span>{" "}
                            {formData.property.northDevelopment || "[Description of northern development]"}
                          </li>
                          <li>
                            <span className="font-medium">South:</span>{" "}
                            {formData.property.southDevelopment || "[Description of southern development]"}
                          </li>
                          <li>
                            <span className="font-medium">East:</span>{" "}
                            {formData.property.eastDevelopment || "[Description of eastern development]"}
                          </li>
                          <li>
                            <span className="font-medium">West:</span>{" "}
                            {formData.property.westDevelopment || "[Description of western development]"}
                          </li>
                        </ul>

                        <h3 className="font-semibold mt-4">2.4 Site Constraints</h3>
                        {Object.values(formData.property.constraints || {}).some((value) => value) ? (
                          <ul className="list-disc list-inside ml-4 space-y-1">
                            {formData.property.constraints?.heritageItem && (
                              <li>The site is identified as a heritage item.</li>
                            )}
                            {formData.property.constraints?.heritageConservationArea && (
                              <li>The site is located within a heritage conservation area.</li>
                            )}
                            {formData.property.constraints?.bushfireProne && (
                              <li>The site is identified as bushfire prone land.</li>
                            )}
                            {formData.property.constraints?.floodProne && (
                              <li>The site is identified as flood prone land.</li>
                            )}
                            {formData.property.constraints?.acidSulfateSoils && (
                              <li>The site is affected by acid sulfate soils.</li>
                            )}
                            {formData.property.constraints?.contaminatedLand && (
                              <li>The site is identified as potentially contaminated land.</li>
                            )}
                            {formData.property.otherConstraints && <li>{formData.property.otherConstraints}</li>}
                          </ul>
                        ) : (
                          <p>The site is not affected by any significant constraints.</p>
                        )}
                      </AccordionContent>
                    </AccordionItem>

                    {/* 3. Proposed Development */}
                    <AccordionItem value="item-3">
                      <AccordionTrigger className="text-lg font-semibold">3. Proposed Development</AccordionTrigger>
                      <AccordionContent className="space-y-4 text-sm">
                        <h3 className="font-semibold">3.1 Development Description</h3>
                        <p>{formData.development.developmentDescription || "[Development Description]"}</p>

                        {formData.development.demolitionRequired && (
                          <>
                            <h3 className="font-semibold mt-4">3.2 Demolition</h3>
                            <p>{formData.development.demolitionDetails || "[Demolition Details]"}</p>
                          </>
                        )}

                        <h3 className="font-semibold mt-4">3.3 Building Design</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p>
                              <span className="font-medium">Number of Storeys:</span>{" "}
                              {formData.development.storeys || "[Storeys]"}
                            </p>
                            <p>
                              <span className="font-medium">Building Height:</span>{" "}
                              {formData.development.buildingHeight
                                ? `${formData.development.buildingHeight}m`
                                : "[Height]"}
                            </p>
                            <p>
                              <span className="font-medium">Wall Height:</span>{" "}
                              {formData.development.wallHeight
                                ? `${formData.development.wallHeight}m`
                                : "[Wall Height]"}
                            </p>
                          </div>
                          <div>
                            <p>
                              <span className="font-medium">Gross Floor Area:</span>{" "}
                              {formData.development.totalGFA ? `${formData.development.totalGFA}m²` : "[GFA]"}
                            </p>
                            <p>
                              <span className="font-medium">Floor Space Ratio:</span>{" "}
                              {formData.development.floorSpaceRatio
                                ? `${formData.development.floorSpaceRatio}:1`
                                : "[FSR]"}
                            </p>
                            <p>
                              <span className="font-medium">Site Coverage:</span>{" "}
                              {formData.development.proposedSiteCoverage
                                ? `${formData.development.proposedSiteCoverage}%`
                                : "[Site Coverage]"}
                            </p>
                          </div>
                        </div>

                        <h3 className="font-semibold mt-4">3.4 Setbacks</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p>
                              <span className="font-medium">Front Setback:</span>{" "}
                              {formData.development.frontSetback
                                ? `${formData.development.frontSetback}m`
                                : "[Front Setback]"}
                            </p>
                            {formData.development.secondaryFrontSetback && (
                              <p>
                                <span className="font-medium">Secondary Front Setback:</span>{" "}
                                {formData.development.secondaryFrontSetback}m
                              </p>
                            )}
                            <p>
                              <span className="font-medium">Rear Setback (Ground):</span>{" "}
                              {formData.development.rearSetbackGround
                                ? `${formData.development.rearSetbackGround}m`
                                : "[Rear Setback]"}
                            </p>
                          </div>
                          <div>
                            <p>
                              <span className="font-medium">Rear Setback (Upper):</span>{" "}
                              {formData.development.rearSetbackUpper
                                ? `${formData.development.rearSetbackUpper}m`
                                : "[Upper Rear Setback]"}
                            </p>
                            <p>
                              <span className="font-medium">Side Setback (North):</span>{" "}
                              {formData.development.sideSetbackOne
                                ? `${formData.development.sideSetbackOne}m`
                                : "[Side Setback]"}
                            </p>
                            <p>
                              <span className="font-medium">Side Setback (South):</span>{" "}
                              {formData.development.sideSetbackTwo
                                ? `${formData.development.sideSetbackTwo}m`
                                : "[Side Setback]"}
                            </p>
                          </div>
                        </div>

                        <h3 className="font-semibold mt-4">3.5 Materials and Finishes</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p>
                              <span className="font-medium">External Walls:</span>{" "}
                              {formData.development.externalWalls || "[External Walls]"}
                            </p>
                            <p>
                              <span className="font-medium">Roof:</span> {formData.development.roof || "[Roof]"}
                            </p>
                          </div>
                          <div>
                            <p>
                              <span className="font-medium">Windows:</span>{" "}
                              {formData.development.windows || "[Windows]"}
                            </p>
                            {formData.development.otherMaterials && (
                              <p>
                                <span className="font-medium">Other:</span> {formData.development.otherMaterials}
                              </p>
                            )}
                          </div>
                        </div>

                        <h3 className="font-semibold mt-4">3.6 Landscaping</h3>
                        <p>
                          The proposed development will provide{" "}
                          {formData.development.proposedLandscapedArea
                            ? `${formData.development.proposedLandscapedArea}m²`
                            : "[Landscaped Area]"}{" "}
                          of landscaped area, which represents{" "}
                          {formData.development.landscapedAreaPercentage
                            ? `${formData.development.landscapedAreaPercentage}%`
                            : "[Percentage]"}{" "}
                          of the site area.
                        </p>

                        <h3 className="font-semibold mt-4">3.7 Access and Parking</h3>
                        <p>
                          Vehicle access to the site will be via{" "}
                          {formData.development.vehicleAccess || "[Vehicle Access]"}. The development will provide{" "}
                          {formData.development.carParkingSpaces || "[Number]"} car parking spaces.
                        </p>
                        <p>
                          Pedestrian access will be via {formData.development.pedestrianAccess || "[Pedestrian Access]"}
                          .
                        </p>

                        <h3 className="font-semibold mt-4">3.8 Stormwater Management</h3>
                        <p>
                          Stormwater from the development will be{" "}
                          {formData.development.stormwaterDisposal?.toLowerCase() || "[Stormwater Disposal Method]"}.
                        </p>

                        <h3 className="font-semibold mt-4">3.9 Waste Management</h3>
                        <p>{formData.development.wasteManagement || "[Waste Management Details]"}</p>
                      </AccordionContent>
                    </AccordionItem>

                    {/* 4. Planning Assessment */}
                    <AccordionItem value="item-4">
                      <AccordionTrigger className="text-lg font-semibold">4. Planning Assessment</AccordionTrigger>
                      <AccordionContent className="space-y-4 text-sm">
                        <h3 className="font-semibold">5.1 Zoning and Permissibility</h3>
                        <p>
                          The subject site is zoned {formData.planning.zoning || "[Zoning]"} under the{" "}
                          {formData.planning.lepName || "[LEP Name]"}.
                        </p>
                        <p>{formData.planning.landUsePermissibility || "[Land Use Permissibility Assessment]"}</p>

                        <h3 className="font-semibold mt-4">5.2 State Environmental Planning Policies (SEPPs)</h3>
                        <div className="space-y-2">
                          {formData.planning.seppBasix && (
                            <div>
                              <p className="font-medium">SEPP (BASIX) 2004</p>
                              <p>
                                A BASIX Certificate has been submitted with the development application. The proposal
                                satisfies the commitments made in the BASIX Certificate and complies with the
                                requirements of SEPP (BASIX) 2004.
                              </p>
                            </div>
                          )}

                          {formData.planning.seppResilience && (
                            <div>
                              <p className="font-medium">SEPP (Resilience and Hazards) 2021</p>
                              <p>
                                The development has been assessed against the provisions of SEPP (Resilience and
                                Hazards) 2021. The site is not identified as being affected by land contamination and
                                the proposed development is not considered to present any risk to human health or the
                                environment.
                              </p>
                            </div>
                          )}

                          {formData.planning.seppBiodiversity && (
                            <div>
                              <p className="font-medium">SEPP (Biodiversity) 2021</p>
                              <p>
                                {formData.planning.seppBiodiversityTreeRemoval
                                  ? "The development proposes the removal of selected trees supported by an arborist who has no objections to their removal."
                                  : "The development does not propose the removal of any significant trees on the site."}
                              </p>
                            </div>
                          )}

                          {formData.planning.seppTransport && (
                            <div>
                              <p className="font-medium">SEPP (Transport and Infrastructure) 2021</p>
                              <p>
                                {formData.planning.seppTransportClassifiedRoad
                                  ? "The site has a boundary to a classified road. The development has been designed to comply with the relevant provisions of the SEPP relating to development with frontage to a classified road."
                                  : "The site is not fronting or adjacent to a classified road, rail corridor or within the vicinity of a telecommunications structure requiring consideration under the SEPP."}
                              </p>
                            </div>
                          )}

                          {!formData.planning.seppBasix &&
                            !formData.planning.seppResilience &&
                            !formData.planning.seppBiodiversity &&
                            !formData.planning.seppTransport && <p>[SEPP Assessment]</p>}
                        </div>

                        <h3 className="font-semibold mt-4">5.3 Local Environmental Plan (LEP)</h3>
                        <p>{formData.planning.lepCompliance || "[LEP Compliance Assessment]"}</p>

                        <div className="mt-2">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-1/3">Control</TableHead>
                                <TableHead className="w-1/3">Requirement</TableHead>
                                <TableHead className="w-1/3">Proposed</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              <TableRow>
                                <TableCell>Height of Buildings</TableCell>
                                <TableCell>{formData.planning.heightControl || "[Requirement]"}</TableCell>
                                <TableCell>{formData.planning.heightProposed || "[Proposed]"}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>Floor Space Ratio</TableCell>
                                <TableCell>{formData.planning.fsrControl || "[Requirement]"}</TableCell>
                                <TableCell>{formData.planning.fsrProposed || "[Proposed]"}</TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </div>

                        <h3 className="font-semibold mt-4">5.4 Development Control Plan (DCP)</h3>
                        <p>{formData.planning.dcpCompliance || "[DCP Compliance Assessment]"}</p>

                        <div className="mt-2">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-1/3">Control</TableHead>
                                <TableHead className="w-1/3">Requirement</TableHead>
                                <TableHead className="w-1/3">Proposed</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              <TableRow>
                                <TableCell>Front Setback</TableCell>
                                <TableCell>{formData.planning.frontSetbackControl || "[Requirement]"}</TableCell>
                                <TableCell>{formData.planning.frontSetbackProposed || "[Proposed]"}</TableCell>
                              </TableRow>

                              {formData.planning.secondaryFrontSetbackControl && (
                                <TableRow>
                                  <TableCell>Secondary Front Setback</TableCell>
                                  <TableCell>{formData.planning.secondaryFrontSetbackControl}</TableCell>
                                  <TableCell>
                                    {formData.planning.secondaryFrontSetbackProposed || "[Proposed]"}
                                  </TableCell>
                                </TableRow>
                              )}

                              <TableRow>
                                <TableCell>Rear Setback (Ground)</TableCell>
                                <TableCell>{formData.planning.rearSetbackGroundControl || "[Requirement]"}</TableCell>
                                <TableCell>{formData.planning.rearSetbackGroundProposed || "[Proposed]"}</TableCell>
                              </TableRow>

                              <TableRow>
                                <TableCell>Rear Setback (Upper)</TableCell>
                                <TableCell>{formData.planning.rearSetbackUpperControl || "[Requirement]"}</TableCell>
                                <TableCell>{formData.planning.rearSetbackUpperProposed || "[Proposed]"}</TableCell>
                              </TableRow>

                              <TableRow>
                                <TableCell>Side Setback - North (Ground)</TableCell>
                                <TableCell>
                                  {formData.planning.sideSetbackNorthGroundControl || "[Requirement]"}
                                </TableCell>
                                <TableCell>
                                  {formData.planning.sideSetbackNorthGroundProposed || "[Proposed]"}
                                </TableCell>
                              </TableRow>

                              <TableRow>
                                <TableCell>Side Setback - North (Upper)</TableCell>
                                <TableCell>
                                  {formData.planning.sideSetbackNorthUpperControl || "[Requirement]"}
                                </TableCell>
                                <TableCell>{formData.planning.sideSetbackNorthUpperProposed || "[Proposed]"}</TableCell>
                              </TableRow>

                              <TableRow>
                                <TableCell>Side Setback - South (Ground)</TableCell>
                                <TableCell>
                                  {formData.planning.sideSetbackSouthGroundControl || "[Requirement]"}
                                </TableCell>
                                <TableCell>
                                  {formData.planning.sideSetbackSouthGroundProposed || "[Proposed]"}
                                </TableCell>
                              </TableRow>

                              <TableRow>
                                <TableCell>Side Setback - South (Upper)</TableCell>
                                <TableCell>
                                  {formData.planning.sideSetbackSouthUpperControl || "[Requirement]"}
                                </TableCell>
                                <TableCell>{formData.planning.sideSetbackSouthUpperProposed || "[Proposed]"}</TableCell>
                              </TableRow>

                              <TableRow>
                                <TableCell>Site Coverage</TableCell>
                                <TableCell>{formData.planning.siteCoverageControl || "[Requirement]"}</TableCell>
                                <TableCell>{formData.planning.siteCoverageProposed || "[Proposed]"}</TableCell>
                              </TableRow>

                              <TableRow>
                                <TableCell>Landscaped Area</TableCell>
                                <TableCell>{formData.planning.landscapedAreaControl || "[Requirement]"}</TableCell>
                                <TableCell>{formData.planning.landscapedAreaProposed || "[Proposed]"}</TableCell>
                              </TableRow>

                              <TableRow>
                                <TableCell>Car Parking</TableCell>
                                <TableCell>{formData.planning.parkingControl || "[Requirement]"}</TableCell>
                                <TableCell>{formData.planning.parkingProposed || "[Proposed]"}</TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </div>

                        {formData.planning.variationsRequired && (
                          <>
                            <h3 className="font-semibold mt-4">5.5 Variations to Development Standards</h3>
                            <p>{formData.planning.variationDetails || "[Variation Details]"}</p>
                            <p>{formData.planning.variationJustification || "[Variation Justification]"}</p>
                          </>
                        )}

                        {formData.planning.additionalPlanning && (
                          <>
                            <h3 className="font-semibold mt-4">5.6 Additional Planning Considerations</h3>
                            <p>{formData.planning.additionalPlanning}</p>
                          </>
                        )}
                      </AccordionContent>
                    </AccordionItem>

                    {/* 5. Environmental Impacts */}
                    <AccordionItem value="item-5">
                      <AccordionTrigger className="text-lg font-semibold">5. Environmental Impacts</AccordionTrigger>
                      <AccordionContent className="space-y-4 text-sm">
                        {/* Context and Setting */}
                        <h3 className="font-semibold">5.1 Context and Setting</h3>
                        <div className="space-y-2">
                          <p>
                            <span className="font-medium">Noise:</span>{" "}
                            {formData.environmental?.contextAndSetting?.noise || "[Noise Assessment]"}
                          </p>
                          <p>
                            <span className="font-medium">Overlooking:</span>{" "}
                            {formData.environmental?.contextAndSetting?.overlooking || "[Overlooking Assessment]"}
                          </p>
                          <p>
                            <span className="font-medium">Overshadowing:</span>{" "}
                            {formData.environmental?.contextAndSetting?.overshadowing || "[Overshadowing Assessment]"}
                          </p>
                          <p>
                            <span className="font-medium">Building Height:</span>{" "}
                            {formData.environmental?.contextAndSetting?.buildingHeight ||
                              "[Building Height Assessment]"}
                          </p>
                          <p>
                            <span className="font-medium">Setbacks and Landscaping:</span>{" "}
                            {formData.environmental?.contextAndSetting?.setbacksAndLandscaping ||
                              "[Setbacks and Landscaping Assessment]"}
                          </p>
                          <p>
                            <span className="font-medium">Architectural Style:</span>{" "}
                            {formData.environmental?.contextAndSetting?.architecturalStyle ||
                              "[Architectural Style Assessment]"}
                          </p>
                        </div>

                        {/* Access, Transport and Traffic */}
                        <h3 className="font-semibold mt-4">5.2 Access, Transport and Traffic</h3>
                        <p>
                          {formData.environmental?.accessTransportTraffic ||
                            "[Access, Transport and Traffic Assessment]"}
                        </p>

                        {/* Public Domain */}
                        <h3 className="font-semibold mt-4">5.3 Public Domain</h3>
                        <p>{formData.environmental?.publicDomain || "[Public Domain Assessment]"}</p>

                        {/* Utilities */}
                        <h3 className="font-semibold mt-4">5.4 Utilities</h3>
                        <p>{formData.environmental?.utilities || "[Utilities Assessment]"}</p>

                        {/* Heritage */}
                        <h3 className="font-semibold mt-4">5.5 Heritage</h3>
                        <p>{formData.environmental?.heritage || "[Heritage Assessment]"}</p>

                        {/* Other Land Resources */}
                        <h3 className="font-semibold mt-4">5.6 Other Land Resources</h3>
                        <p>{formData.environmental?.otherLandResources || "[Other Land Resources Assessment]"}</p>

                        {/* Water */}
                        <h3 className="font-semibold mt-4">5.7 Water</h3>
                        <p>{formData.environmental?.water || "[Water Assessment]"}</p>

                        {/* Soils */}
                        <h3 className="font-semibold mt-4">5.8 Soils</h3>
                        <p>{formData.environmental?.soils || "[Soils Assessment]"}</p>

                        {/* Air and Microclimate */}
                        <h3 className="font-semibold mt-4">5.9 Air and Microclimate</h3>
                        <p>{formData.environmental?.airAndMicroclimate || "[Air and Microclimate Assessment]"}</p>

                        {/* Flora and Fauna */}
                        <h3 className="font-semibold mt-4">5.10 Flora and Fauna</h3>
                        <p>{formData.environmental?.floraAndFauna || "[Flora and Fauna Assessment]"}</p>
                        {formData.environmental?.treeRemoval && (
                          <p className="mt-2">
                            <span className="font-medium">Tree Removal:</span>{" "}
                            {formData.environmental.treeRemovalCount || "Number not specified"} trees are proposed to be
                            removed.
                          </p>
                        )}

                        {/* Waste */}
                        <h3 className="font-semibold mt-4">5.11 Waste</h3>
                        <p>{formData.environmental?.waste || "[Waste Assessment]"}</p>

                        {/* Energy */}
                        <h3 className="font-semibold mt-4">5.12 Energy</h3>
                        <p>{formData.environmental?.energy || "[Energy Assessment]"}</p>

                        {/* Noise and Vibration */}
                        <h3 className="font-semibold mt-4">5.13 Noise and Vibration</h3>
                        <p>{formData.environmental?.noiseAndVibration || "[Noise and Vibration Assessment]"}</p>

                        {/* Natural Hazards */}
                        <h3 className="font-semibold mt-4">5.14 Natural Hazards</h3>
                        <p>{formData.environmental?.naturalHazards || "[Natural Hazards Assessment]"}</p>
                        {(formData.environmental?.bushfireProne || formData.environmental?.floodProne) && (
                          <div className="mt-2">
                            {formData.environmental?.bushfireProne && (
                              <p>
                                <span className="font-medium">Bushfire Prone Land:</span> The site is identified as
                                bushfire prone land.
                              </p>
                            )}
                            {formData.environmental?.floodProne && (
                              <p>
                                <span className="font-medium">Flood Prone Land:</span> The site is identified as flood
                                prone land.
                              </p>
                            )}
                          </div>
                        )}

                        {/* Technological Hazards */}
                        <h3 className="font-semibold mt-4">5.15 Technological Hazards</h3>
                        <p>{formData.environmental?.technologicalHazards || "[Technological Hazards Assessment]"}</p>

                        {/* Safety, Security and Crime Prevention */}
                        <h3 className="font-semibold mt-4">5.16 Safety, Security and Crime Prevention</h3>
                        <p>
                          {formData.environmental?.safetySecurity ||
                            "[Safety, Security and Crime Prevention Assessment]"}
                        </p>

                        {/* Social and Economic Impact */}
                        <h3 className="font-semibold mt-4">5.17 Social and Economic Impact</h3>
                        <p>
                          {formData.environmental?.socialEconomicImpact || "[Social and Economic Impact Assessment]"}
                        </p>

                        {/* Site Design and Internal Design */}
                        <h3 className="font-semibold mt-4">5.18 Site Design and Internal Design</h3>
                        <p>{formData.environmental?.siteDesign || "[Site Design Assessment]"}</p>

                        {/* Construction */}
                        <h3 className="font-semibold mt-4">5.19 Construction</h3>
                        <p>{formData.environmental?.construction || "[Construction Assessment]"}</p>
                        <div className="mt-2 space-y-2">
                          <p>
                            <span className="font-medium">Construction Hours:</span>{" "}
                            {formData.environmental?.constructionHours || "[Construction Hours]"}
                          </p>
                          <p>
                            <span className="font-medium">Erosion Control:</span>{" "}
                            {formData.environmental?.erosionControl || "[Erosion Control Measures]"}
                          </p>
                          <p>
                            <span className="font-medium">Dust Control:</span>{" "}
                            {formData.environmental?.dustControl || "[Dust Control Measures]"}
                          </p>
                        </div>

                        {/* Cumulative Impacts */}
                        <h3 className="font-semibold mt-4">5.20 Cumulative Impacts</h3>
                        <p>{formData.environmental?.cumulativeImpacts || "[Cumulative Impacts Assessment]"}</p>

                        {/* Additional Information */}
                        {formData.environmental?.additionalInformation && (
                          <>
                            <h3 className="font-semibold mt-4">5.21 Additional Environmental Considerations</h3>
                            <p>{formData.environmental.additionalInformation}</p>
                          </>
                        )}
                      </AccordionContent>
                    </AccordionItem>

                    {/* 6. Conclusion */}
                    <AccordionItem value="item-6">
                      <AccordionTrigger className="text-lg font-semibold">6. Conclusion</AccordionTrigger>
                      <AccordionContent className="space-y-4 text-sm">
                        <p>This Statement of Environmental Effects has demonstrated that the proposed development:</p>
                        <ul className="list-disc list-inside ml-4 space-y-1">
                          <li>Is permissible within the {formData.planning.zoning || "[Zoning]"} zone</li>
                          <li>Is consistent with the objectives of the {formData.planning.lepName || "[LEP Name]"}</li>
                          <li>Complies with the relevant development standards in the LEP and DCP</li>
                          <li>Is compatible with the existing and desired future character of the area</li>
                          <li>Will not result in any unreasonable environmental impacts</li>
                          <li>Is suitable for the site</li>
                          <li>Is in the public interest</li>
                        </ul>
                        <p className="mt-4">
                          Based on the assessment contained in this Statement of Environmental Effects, it is considered
                          that the proposed development is worthy of support by{" "}
                          {formData.project.councilArea || "[Council Name]"}.
                        </p>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              </TabsContent>
            </Tabs>

            {/* Generate Document Button */}
            <div className="flex flex-col items-center justify-center mt-8 space-y-4">
              {!isGenerated ? (
                <Button
                  size="lg"
                  className="gap-2 w-full max-w-md"
                  onClick={handleGenerateDocument}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Generating Document...
                    </>
                  ) : (
                    <>
                      <FileText className="h-5 w-5" /> Generate Statement of Environmental Effects
                    </>
                  )}
                </Button>
              ) : (
                <>
                  <Alert className="max-w-md">
                    <FileText className="h-4 w-4" />
                    <AlertTitle>Document Generated Successfully</AlertTitle>
                    <AlertDescription>
                      Your Statement of Environmental Effects has been generated and is ready to download.
                    </AlertDescription>
                  </Alert>

                  <Button size="lg" className="gap-2 w-full max-w-md" onClick={handleDownloadDocument}>
                    <Download className="h-5 w-5" /> Download Document (PDF)
                  </Button>
                </>
              )}

              <p className="text-sm text-muted-foreground text-center max-w-md">
                This will generate a complete Statement of Environmental Effects document based on the information you
                have provided.
              </p>
            </div>

            <div className="flex justify-between pt-8">
              <Link href={`/professionals/SoEE/form/planning?job=${jobId}`}>
                <Button variant="outline" type="button" className="gap-2">
                  <ArrowLeft className="h-4 w-4" /> Back
                </Button>
              </Link>
              <Button variant="outline" type="button" className="gap-2" onClick={handleSaveAndExit}>
                <Save className="h-4 w-4" /> Save and Exit
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

