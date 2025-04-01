'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Check } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'
import { AssessmentType, DEFAULT_ASSESSMENT_TYPES } from '@/types/assessments'

export default function PrePreparedAssessmentsPage() {
  const [assessmentTypes, setAssessmentTypes] = useState<AssessmentType[]>(DEFAULT_ASSESSMENT_TYPES)
  const [purchasedAssessments, setPurchasedAssessments] = useState<Record<string, boolean>>({})

  useEffect(() => {
    loadCustomAssessmentTypes()
  }, [])

  const loadCustomAssessmentTypes = async () => {
    try {
      const response = await fetch('/api/assessment-types')
      if (response.ok) {
        const data = await response.json()
        setAssessmentTypes([...DEFAULT_ASSESSMENT_TYPES, ...(data.customTypes || [])])
      }
    } catch (error) {
      console.error('Error loading custom assessment types:', error)
    }
  }

  const handlePurchase = async (assessment: AssessmentType) => {
    try {
      // Simulate purchase process
      await new Promise(resolve => setTimeout(resolve, 1000))

      setPurchasedAssessments(prev => ({
        ...prev,
        [assessment.id]: true
      }))

      toast({
        title: 'Success',
        description: 'Assessment purchased successfully'
      })
    } catch (error) {
      console.error('Error purchasing assessment:', error)
      toast({
        title: 'Error',
        description: 'Failed to purchase assessment',
        variant: 'destructive'
      })
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold mb-4">Pre-Prepared Assessments</h1>
        <p className="text-muted-foreground">
          Choose from our selection of pre-prepared assessment templates for common development types.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assessmentTypes.map((assessment) => {
          const isPurchased = purchasedAssessments[assessment.id]

          if (isPurchased) {
            return (
              <Card key={assessment.id} className="bg-green-50">
                <CardHeader>
                  <CardTitle>{assessment.label}</CardTitle>
                  <CardDescription>{assessment.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-4">
                    <Check className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-4">
                      Assessment purchased successfully
                    </p>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {/* Handle download */}}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Download Assessment
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          }

          return (
            <Card key={assessment.id}>
              <CardHeader>
                <CardTitle>{assessment.label}</CardTitle>
                <CardDescription>{assessment.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full"
                  onClick={() => handlePurchase(assessment)}
                >
                  Purchase Assessment
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
} 