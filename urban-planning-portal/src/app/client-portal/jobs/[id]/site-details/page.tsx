'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Label, Textarea } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Check, Loader2 } from 'lucide-react'

// Define the interface for your form data
interface FormData {
  lotType: string;
  siteArea: string;
  primaryStreetWidth: string;
  secondaryStreetWidth: string;
  siteGradient: string;
  highestRL: string;
  lowestRL: string;
  fallAmount: string;
  currentLandUse: string;
  existingDevelopment: string;
  developmentNorth: string;
  developmentSouth: string;
  developmentEast: string;
  developmentWest: string;
  bushfire: boolean;
  flood: boolean;
  heritage: boolean;
  trees: boolean;
}

export default function SiteDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [formData, setFormData] = useState<FormData>({
    lotType: 'Standard',
    siteArea: '',
    primaryStreetWidth: '',
    secondaryStreetWidth: '',
    siteGradient: 'A gradient from the rear to the front',
    highestRL: '',
    lowestRL: '',
    fallAmount: '',
    currentLandUse: 'Residential',
    existingDevelopment: '',
    developmentNorth: '',
    developmentSouth: '',
    developmentEast: '',
    developmentWest: '',
    bushfire: false,
    flood: false,
    heritage: false,
    trees: false
  })
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setHasUnsavedChanges(true)
  }

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>, field: keyof typeof formData) => {
    setFormData(prev => ({ ...prev, [field]: event.target.checked }))
    setHasUnsavedChanges(true)
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

  const handleSaveChanges = () => {
    localStorage.setItem(`siteDetails-${params.id}`, JSON.stringify(formData))
    setHasUnsavedChanges(false)
  }

  // Auto-save when leaving the page
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue = ''
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasUnsavedChanges])

  // Load data from local storage when the component mounts
  useEffect(() => {
    const savedData = localStorage.getItem(`siteDetails-${params.id}`)
    if (savedData) {
      setFormData(JSON.parse(savedData))
    }
  }, [params.id])

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            className="p-2"
            onClick={() => {
              if (hasUnsavedChanges) {
                const shouldLeave = window.confirm('You have unsaved changes. Do you want to leave without saving?')
                if (!shouldLeave) return
              }
              router.back()
            }}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-semibold text-[#323A40]">Site Details</h1>
        </div>
        {hasUnsavedChanges && (
          <Button onClick={handleSaveChanges}>
            Save Changes
          </Button>
        )}
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
                  placeholder="e.g. 500"
                  value={formData.siteArea}
                  onChange={(e) => handleInputChange('siteArea', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Primary Street Width (m)</Label>
                <Input
                  placeholder="e.g. 15.24"
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
                  placeholder="e.g. 50.00"
                  value={formData.highestRL}
                  onChange={(e) => handleInputChange('highestRL', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Lowest RL (m)</Label>
                <Input
                  placeholder="e.g. 48.50"
                  value={formData.lowestRL}
                  onChange={(e) => handleInputChange('lowestRL', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Fall Amount (m)</Label>
                <Input
                  placeholder="e.g. 1.50"
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
                placeholder="e.g. Single storey dwelling house with associated structures"
                value={formData.existingDevelopment}
                onChange={(e) => handleInputChange('existingDevelopment', e.target.value)}
                className="min-h-[100px] w-full"
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
                placeholder="e.g. Single storey dwelling house at 11 Viola Place"
                value={formData.developmentNorth}
                onChange={(e) => handleInputChange('developmentNorth', e.target.value)}
                className="min-h-[80px] w-full"
              />
            </div>
            <div className="space-y-2">
              <Label>Development to the South</Label>
              <Textarea
                placeholder="e.g. Double storey dwelling house at 7 Viola Place"
                value={formData.developmentSouth}
                onChange={(e) => handleInputChange('developmentSouth', e.target.value)}
                className="min-h-[80px] w-full"
              />
            </div>
            <div className="space-y-2">
              <Label>Development to the East</Label>
              <Textarea
                placeholder="e.g. Rear yards of properties fronting Carnation Avenue"
                value={formData.developmentEast}
                onChange={(e) => handleInputChange('developmentEast', e.target.value)}
                className="min-h-[80px] w-full"
              />
            </div>
            <div className="space-y-2">
              <Label>Development to the West</Label>
              <Textarea
                placeholder="e.g. Viola Place and single storey dwelling houses opposite"
                value={formData.developmentWest}
                onChange={(e) => handleInputChange('developmentWest', e.target.value)}
                className="min-h-[80px] w-full"
              />
            </div>
          </CardContent>
        </Card>

        {/* Site constraints */}
        <Card className="shadow-md lg:col-span-2">
          <CardHeader className="bg-[#323A40] text-white">
            <h2 className="text-lg font-semibold">Site Constraints</h2>
          </CardHeader>
          <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>
                <input
                  type="checkbox"
                  checked={formData.bushfire}
                  onChange={(e) => handleCheckboxChange(e, 'bushfire')}
                  className="mr-2"
                />
                Bushfire
              </Label>
            </div>

            <div className="space-y-2">
              <Label>
                <input
                  type="checkbox"
                  checked={formData.flood}
                  onChange={(e) => handleCheckboxChange(e, 'flood')}
                  className="mr-2"
                />
                Flood
              </Label>
            </div>

            <div className="space-y-2">
              <Label>
                <input
                  type="checkbox"
                  checked={formData.heritage}
                  onChange={(e) => handleCheckboxChange(e, 'heritage')}
                  className="mr-2"
                />
                Heritage
              </Label>
              <p className="text-sm text-gray-600">
                Is the site adjoining or adjacent to a heritage item or heritage conservation area?
              </p>
            </div>

            <div className="space-y-2">
              <Label>
                <input
                  type="checkbox"
                  checked={formData.trees}
                  onChange={(e) => handleCheckboxChange(e, 'trees')}
                  className="mr-2"
                />
                Trees
              </Label>
              <p className="text-sm text-gray-600">
                Will tree removal be required or are there any trees on adjoining sites to consider?
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
