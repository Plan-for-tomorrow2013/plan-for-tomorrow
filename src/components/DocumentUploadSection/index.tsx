'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Upload } from 'lucide-react'
import { DOCUMENT_TYPES } from '@/types/documents'

interface DocumentUploadSectionProps {
  jobId: string
}

export function DocumentUploadSection({ jobId }: DocumentUploadSectionProps) {
  const [isUploading, setIsUploading] = useState(false)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      // TODO: Implement file upload logic
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulated upload delay
    } catch (error) {
      console.error('Error uploading file:', error)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Upload Documents</h3>
        <p className="text-sm text-gray-500">
          Please upload all required documents for your initial assessment.
        </p>
        <div className="grid gap-4">
          {DOCUMENT_TYPES.filter(doc => !doc.adminOnly).map(docType => (
            <div key={docType.id} className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">{docType.title}</h4>
                <p className="text-sm text-gray-500">{docType.description}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={isUploading}
                onClick={() => {
                  const input = document.createElement('input')
                  input.type = 'file'
                  input.accept = '.pdf,.doc,.docx'
                  input.onchange = handleFileUpload as any
                  input.click()
                }}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </Button>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
} 