'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Check, Loader2 } from 'lucide-react'

export default function SiteDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    lotType: 'Standard',
    siteArea: '500.00',
    primaryStreetWidth: '15.24',
    secondaryStreetWidth: '',
    siteGradient: 'A gradient from the rear to the front',
    highestRL: '50.00',
    lowestRL: '48.50',
    fallAmount: '1.50',
    currentLandUse: 'Residential',
    existingDevelopment: 'Single storey dwelling house with associated structures',
    developmentNorth: 'Single storey dwelling house at 11 Viola Place',
    developmentSouth: 'Double storey dwelling house at 7 Viola Place',
    developmentEast: 'Rear yards of properties fronting Carnation Avenue',
    developmentWest: 'Viola Place and single storey dwelling houses opposite'
  })
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    try {
      setSaveStatus('saving')
      const response = await fetch(`/api/jobs/${params.id}/site-details`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to save site details')
      }

      setSaveStatus('success')
      setError(null)
      
      // Reset success status after 3 seconds
      setTimeout(() => {
        setSaveStatus('idle')
      }, 3000)
    } catch (error) {
      console.error('Error saving site details:', error)
      setSaveStatus('error')
      setError(error instanceof Error ? error.message : 'Failed to save site details')
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="ghost" 
          className="p-2"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-semibold text-[#323A40]">Site Details</h1>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {saveStatus === 'success' && (
        <Alert className="mb-6 bg-green-50 border-green-200">
          <Check className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Success</AlertTitle>
          <AlertDescription className="text-green-700">
            Site details saved successfully
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Site Characteristics */}
        <Card className="shadow-md">
          <CardHeader className="bg-[#323A40] text-white">
            <h2 className="text-lg font-semibold">Site Characteristics</h2>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div className="space-y-2">
              <Label>Lot Type</Label>
              <Select value={formData.lotType} onValueChange={(value) => handleInputChange('lotType', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Standard">Standard</SelectItem>
                  <SelectItem value="Corner">Corner</SelectItem>
                  <SelectItem value="Irregular">Irregular</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Site Area (m²)</Label>
                <Input 
                  value={formData.siteArea}
                  onChange={(e) => handleInputChange('siteArea', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Primary Street Width (m)</Label>
                <Input 
                  value={formData.primaryStreetWidth}
                  onChange={(e) => handleInputChange('primaryStreetWidth', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Secondary Street Width (m) (if corner lot)</Label>
              <Input 
                placeholder="e.g. 12.50"
                value={formData.secondaryStreetWidth}
                onChange={(e) => handleInputChange('secondaryStreetWidth', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Site Gradient</Label>
              <Select value={formData.siteGradient} onValueChange={(value) => handleInputChange('siteGradient', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A gradient from the rear to the front">Gradient from rear to front</SelectItem>
                  <SelectItem value="A gradient from the front to the rear">Gradient from front to rear</SelectItem>
                  <SelectItem value="A cross-fall from north to south">Cross-fall from north to south</SelectItem>
                  <SelectItem value="A cross-fall from south to north">Cross-fall from south to north</SelectItem>
                  <SelectItem value="Generally flat">Generally flat</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Highest RL (m)</Label>
                <Input 
                  value={formData.highestRL}
                  onChange={(e) => handleInputChange('highestRL', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Lowest RL (m)</Label>
                <Input 
                  value={formData.lowestRL}
                  onChange={(e) => handleInputChange('lowestRL', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Fall Amount (m)</Label>
                <Input 
                  value={formData.fallAmount}
                  onChange={(e) => handleInputChange('fallAmount', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Existing Development */}
        <Card className="shadow-md">
          <CardHeader className="bg-[#323A40] text-white">
            <h2 className="text-lg font-semibold">Existing Development</h2>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div className="space-y-2">
              <Label>Current Land Use</Label>
              <Select value={formData.currentLandUse} onValueChange={(value) => handleInputChange('currentLandUse', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Residential">Residential</SelectItem>
                  <SelectItem value="Commercial">Commercial</SelectItem>
                  <SelectItem value="Industrial">Industrial</SelectItem>
                  <SelectItem value="Vacant">Vacant Land</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Existing Development Details</Label>
              <Textarea 
                value={formData.existingDevelopment}
                onChange={(e) => handleInputChange('existingDevelopment', e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Surrounding Development */}
        <Card className="shadow-md lg:col-span-2">
          <CardHeader className="bg-[#323A40] text-white">
            <h2 className="text-lg font-semibold">Surrounding Development</h2>
          </CardHeader>
          <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Development to the North</Label>
              <Textarea 
                value={formData.developmentNorth}
                onChange={(e) => handleInputChange('developmentNorth', e.target.value)}
                className="min-h-[80px]"
              />
            </div>
            <div className="space-y-2">
              <Label>Development to the South</Label>
              <Textarea 
                value={formData.developmentSouth}
                onChange={(e) => handleInputChange('developmentSouth', e.target.value)}
                className="min-h-[80px]"
              />
            </div>
            <div className="space-y-2">
              <Label>Development to the East</Label>
              <Textarea 
                value={formData.developmentEast}
                onChange={(e) => handleInputChange('developmentEast', e.target.value)}
                className="min-h-[80px]"
              />
            </div>
            <div className="space-y-2">
              <Label>Development to the West</Label>
              <Textarea 
                value={formData.developmentWest}
                onChange={(e) => handleInputChange('developmentWest', e.target.value)}
                className="min-h-[80px]"
              />
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 flex justify-end">
          <Button 
            className="bg-[#EA6B3D] hover:bg-[#EA6B3D]/90"
            onClick={handleSubmit}
            disabled={saveStatus === 'saving'}
          >
            {saveStatus === 'saving' ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Site Details'
            )}
          </Button>
        </div>
      </div>
    </div>
  )
} 