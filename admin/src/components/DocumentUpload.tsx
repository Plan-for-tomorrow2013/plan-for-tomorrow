"use client"

import { useState } from "react"
import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { FileText, Upload, X } from "lucide-react"
import { Document } from '@shared/types/documents'
import { documentService } from "../../lib/services/documentService"
import { useToast } from "../../hooks/use-toast"

interface DocumentUploadProps {
  onUploadComplete?: (document: Document) => void
  maxSize?: number // in MB
  allowedTypes?: string[]
  jobId: string
}

export function DocumentUpload({
  onUploadComplete,
  maxSize = 10, // Default max size is 10MB
  allowedTypes = ["application/pdf", "image/jpeg", "image/png"],
  jobId
}: DocumentUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const { toast } = useToast()

  const handleFileUpload = async (file: File) => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('metadata', JSON.stringify({
        type: 'document',
        jobId: jobId,
        title: file.name,
        category: 'REPORTS'
      }))

      const response = await fetch('/api/documents', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) throw new Error('Failed to upload document')
      const document = await response.json()
      onUploadComplete?.(document)
    } catch (error) {
      console.error('Error uploading document:', error)
      toast({
        title: 'Error',
        description: 'Failed to upload document. Please try again.',
        variant: 'destructive',
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Upload Document</CardTitle>
        <CardDescription>Upload your planning documents</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <input
            type="file"
            className="hidden"
            id="file-upload"
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (file) handleFileUpload(file)
            }}
            accept={allowedTypes.join(",")}
            disabled={isUploading}
          />
          <Button
            variant="outline"
            className="w-full h-32 border-dashed"
            onClick={() => document.getElementById("file-upload")?.click()}
            disabled={isUploading}
          >
            <div className="flex flex-col items-center gap-2">
              <Upload className="h-8 w-8" />
              <span>{isUploading ? "Uploading..." : "Click to upload or drag and drop"}</span>
              <span className="text-xs text-muted-foreground">
                Supported formats: PDF, JPEG, PNG (max {maxSize}MB)
              </span>
            </div>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
