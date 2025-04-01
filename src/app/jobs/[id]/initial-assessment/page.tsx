'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ChevronLeft } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'

interface Props {
  params: {
    id: string
  }
}

export default function JobInitialAssessmentPage({ params }: Props) {
  const router = useRouter()

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Back Button */}
      <div className="flex items-center gap-2 mb-4">
        <Link href={`/jobs/${params.id}`}>
          <Button 
            variant="ghost" 
            className="gap-2 pl-0 text-muted-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Job
          </Button>
        </Link>
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