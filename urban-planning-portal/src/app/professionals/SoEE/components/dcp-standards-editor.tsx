"use client"

import { useState } from "react"
import { Button } from "@/app/professionals/SoEE/components/ui/button"
import { Input } from "@/app/professionals/SoEE/components/ui/input"
import { Label } from "@/app/professionals/SoEE/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/professionals/SoEE/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/app/professionals/SoEE/components/ui/accordion"
import { Alert, AlertDescription } from "@/app/professionals/SoEE/components/ui/alert"
import { Info } from "lucide-react"

interface DCPStandardsValues {
  frontSetbackControl: string
  secondaryFrontSetbackControl: string
  rearSetbackGroundControl: string
  rearSetbackUpperControl: string
  sideSetbackNorthGroundControl: string
  sideSetbackNorthUpperControl: string
  sideSetbackSouthGroundControl: string
  sideSetbackSouthUpperControl: string
  siteCoverageControl: string
  landscapedAreaControl: string
  parkingControl: string
}

interface DCPStandardsEditorProps {
  councilName: string
  initialValues: DCPStandardsValues
  onUpdate: (values: DCPStandardsValues) => void
}

export function DCPStandardsEditor({ councilName, initialValues, onUpdate }: DCPStandardsEditorProps) {
  const [values, setValues] = useState<DCPStandardsValues>(initialValues)
  const [isEditing, setIsEditing] = useState<boolean>(false)

  const handleChange = (field: keyof DCPStandardsValues, value: string): void => {
    setValues((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSave = (): void => {
    onUpdate(values)
    setIsEditing(false)
  }

  return (
    <Card className="mt-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>DCP Standards for {councilName}</span>
          {!isEditing ? (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              Edit Standards
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button variant="default" size="sm" onClick={handleSave}>
                Save Changes
              </Button>
            </div>
          )}
        </CardTitle>
        <CardDescription>
          Development Control Plan standards automatically populated based on council area
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!isEditing ? (
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="setbacks">
              <AccordionTrigger>Setbacks</AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium">Front Setback:</p>
                    <p>{values.frontSetbackControl}</p>
                  </div>
                  <div>
                    <p className="font-medium">Secondary Front Setback:</p>
                    <p>{values.secondaryFrontSetbackControl}</p>
                  </div>
                  <div>
                    <p className="font-medium">Rear Setback (Ground):</p>
                    <p>{values.rearSetbackGroundControl}</p>
                  </div>
                  <div>
                    <p className="font-medium">Rear Setback (Upper):</p>
                    <p>{values.rearSetbackUpperControl}</p>
                  </div>
                  <div>
                    <p className="font-medium">Side Setback North (Ground):</p>
                    <p>{values.sideSetbackNorthGroundControl}</p>
                  </div>
                  <div>
                    <p className="font-medium">Side Setback North (Upper):</p>
                    <p>{values.sideSetbackNorthUpperControl}</p>
                  </div>
                  <div>
                    <p className="font-medium">Side Setback South (Ground):</p>
                    <p>{values.sideSetbackSouthGroundControl}</p>
                  </div>
                  <div>
                    <p className="font-medium">Side Setback South (Upper):</p>
                    <p>{values.sideSetbackSouthUpperControl}</p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="other">
              <AccordionTrigger>Other Controls</AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium">Site Coverage:</p>
                    <p>{values.siteCoverageControl}</p>
                  </div>
                  <div>
                    <p className="font-medium">Landscaped Area:</p>
                    <p>{values.landscapedAreaControl}</p>
                  </div>
                  <div>
                    <p className="font-medium">Car Parking:</p>
                    <p>{values.parkingControl}</p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        ) : (
          <div className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Edit the DCP standards below if they don't match the current requirements for {councilName}
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="frontSetbackControl">Front Setback</Label>
                <Input
                  id="frontSetbackControl"
                  value={values.frontSetbackControl}
                  onChange={(e) => handleChange("frontSetbackControl", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="secondaryFrontSetbackControl">Secondary Front Setback</Label>
                <Input
                  id="secondaryFrontSetbackControl"
                  value={values.secondaryFrontSetbackControl}
                  onChange={(e) => handleChange("secondaryFrontSetbackControl", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rearSetbackGroundControl">Rear Setback (Ground)</Label>
                <Input
                  id="rearSetbackGroundControl"
                  value={values.rearSetbackGroundControl}
                  onChange={(e) => handleChange("rearSetbackGroundControl", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rearSetbackUpperControl">Rear Setback (Upper)</Label>
                <Input
                  id="rearSetbackUpperControl"
                  value={values.rearSetbackUpperControl}
                  onChange={(e) => handleChange("rearSetbackUpperControl", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sideSetbackNorthGroundControl">Side Setback North (Ground)</Label>
                <Input
                  id="sideSetbackNorthGroundControl"
                  value={values.sideSetbackNorthGroundControl}
                  onChange={(e) => handleChange("sideSetbackNorthGroundControl", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sideSetbackNorthUpperControl">Side Setback North (Upper)</Label>
                <Input
                  id="sideSetbackNorthUpperControl"
                  value={values.sideSetbackNorthUpperControl}
                  onChange={(e) => handleChange("sideSetbackNorthUpperControl", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sideSetbackSouthGroundControl">Side Setback South (Ground)</Label>
                <Input
                  id="sideSetbackSouthGroundControl"
                  value={values.sideSetbackSouthGroundControl}
                  onChange={(e) => handleChange("sideSetbackSouthGroundControl", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sideSetbackSouthUpperControl">Side Setback South (Upper)</Label>
                <Input
                  id="sideSetbackSouthUpperControl"
                  value={values.sideSetbackSouthUpperControl}
                  onChange={(e) => handleChange("sideSetbackSouthUpperControl", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="siteCoverageControl">Site Coverage</Label>
                <Input
                  id="siteCoverageControl"
                  value={values.siteCoverageControl}
                  onChange={(e) => handleChange("siteCoverageControl", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="landscapedAreaControl">Landscaped Area</Label>
                <Input
                  id="landscapedAreaControl"
                  value={values.landscapedAreaControl}
                  onChange={(e) => handleChange("landscapedAreaControl", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="parkingControl">Car Parking</Label>
                <Input
                  id="parkingControl"
                  value={values.parkingControl}
                  onChange={(e) => handleChange("parkingControl", e.target.value)}
                />
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

