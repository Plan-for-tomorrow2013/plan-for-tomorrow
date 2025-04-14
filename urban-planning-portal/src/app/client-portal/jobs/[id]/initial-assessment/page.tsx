'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface Props {
  params: {
    id: string
  }
}

export default function JobInitialAssessmentPage({ params }: Props) {
  const router = useRouter()
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

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
          <h1 className="text-2xl font-semibold text-[#323A40]">Initial Assessment</h1>
        </div>
        {hasUnsavedChanges && (
          <Button onClick={() => {/* Handle save changes logic if needed */}}>
            Save Changes
          </Button>
        )}
      </div>

      {/* Section 1: Document Store */}
      <div className="border rounded-lg bg-white p-4">
        <h2 className="font-semibold mb-4">Required Documents</h2>
        <p className="text-sm text-muted-foreground">Please upload all required documents to proceed with the assessment.</p>
      </div>

      {/* Section 2: Assessment Types */}
      <div className="border rounded-lg bg-white">
        <Tabs defaultValue="chatbot" className="w-full">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="chatbot">AI Chatbot</TabsTrigger>
            <TabsTrigger value="custom">Custom Assessment</TabsTrigger>
            <TabsTrigger value="prepared">Pre-Prepared</TabsTrigger>
          </TabsList>

          <div className="p-4">
            <TabsContent value="chatbot">
              <h3 className="font-semibold mb-2">AI-Powered Assessment</h3>
              <p className="text-sm text-muted-foreground">
                Coming soon! Our AI chatbot will guide you through the assessment process.
              </p>
            </TabsContent>

            <TabsContent value="custom">
              <h3 className="font-semibold mb-2">Custom Assessment</h3>
              <p className="text-sm text-muted-foreground">
                Please upload all required documents and complete the assessment form.
              </p>
            </TabsContent>

            <TabsContent value="prepared">
              <h3 className="font-semibold mb-2">Pre-Prepared Assessment</h3>
              <p className="text-sm text-muted-foreground">
                Get an instant assessment based on your project details.
              </p>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}
