"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Building2, FileText, Upload } from "lucide-react"
import { useState } from "react"

export default function InitialAssessmentPage() {
  const [projectDetails, setProjectDetails] = useState({
    description: "",
    developmentType: "",
    siteCharacteristics: "",
    environmentalFactors: "",
    zoningRequirements: "",
    developmentControls: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log(projectDetails)
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Initial Assessment</h1>
          <p className="text-gray-500 mt-2">Complete your initial assessment form</p>
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Upload className="w-4 h-4" />
          Upload Documents
        </Button>
      </div>
      
      <div className="grid gap-6 md:grid-cols-7">
        <div className="md:col-span-5">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="details" className="flex-1">Project Details</TabsTrigger>
              <TabsTrigger value="site" className="flex-1">Site Analysis</TabsTrigger>
              <TabsTrigger value="planning" className="flex-1">Planning Controls</TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="space-y-4 mt-6">
              <div className="space-y-4">
                <Label>Project Description</Label>
                <Textarea 
                  placeholder="Enter a detailed description of your project..." 
                  className="min-h-[150px]"
                  value={projectDetails.description}
                  onChange={(e) => setProjectDetails({ ...projectDetails, description: e.target.value })}
                />
              </div>
              <div className="space-y-4">
                <Label>Development Type</Label>
                <Textarea 
                  placeholder="Describe the type of development..." 
                  className="min-h-[100px]"
                  value={projectDetails.developmentType}
                  onChange={(e) => setProjectDetails({ ...projectDetails, developmentType: e.target.value })}
                />
              </div>
            </TabsContent>
            <TabsContent value="site" className="space-y-4 mt-6">
              <div className="space-y-4">
                <Label>Site Characteristics</Label>
                <Textarea 
                  placeholder="Describe the site characteristics..." 
                  className="min-h-[150px]"
                  value={projectDetails.siteCharacteristics}
                  onChange={(e) => setProjectDetails({ ...projectDetails, siteCharacteristics: e.target.value })}
                />
              </div>
              <div className="space-y-4">
                <Label>Environmental Factors</Label>
                <Textarea 
                  placeholder="List any environmental considerations..." 
                  className="min-h-[100px]"
                  value={projectDetails.environmentalFactors}
                  onChange={(e) => setProjectDetails({ ...projectDetails, environmentalFactors: e.target.value })}
                />
              </div>
            </TabsContent>
            <TabsContent value="planning" className="space-y-4 mt-6">
              <div className="space-y-4">
                <Label>Zoning Requirements</Label>
                <Textarea 
                  placeholder="Detail the applicable zoning requirements..." 
                  className="min-h-[150px]"
                  value={projectDetails.zoningRequirements}
                  onChange={(e) => setProjectDetails({ ...projectDetails, zoningRequirements: e.target.value })}
                />
              </div>
              <div className="space-y-4">
                <Label>Development Controls</Label>
                <Textarea 
                  placeholder="List relevant development controls..." 
                  className="min-h-[100px]"
                  value={projectDetails.developmentControls}
                  onChange={(e) => setProjectDetails({ ...projectDetails, developmentControls: e.target.value })}
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Assessment Summary</CardTitle>
              <CardDescription>Quick overview of your assessment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-gray-500" />
                <span className="text-sm">Residential Development</span>
              </div>
              <Separator />
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-500" />
                <span className="text-sm">3 Documents Uploaded</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Next Steps</CardTitle>
              <CardDescription>Complete these actions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full" onClick={handleSubmit}>Generate Report</Button>
              <Button variant="outline" className="w-full">Save Draft</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 