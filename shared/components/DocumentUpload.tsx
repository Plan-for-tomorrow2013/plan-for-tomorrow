"use client"

import React, { useState } from "react"
import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Upload } from "lucide-react"
import { Document } from "../types/documents"
import { useToast } from "@shared/components/ui/use-toast"

interface DocumentUploadProps {
  onUploadComplete?: (document: Document) => void
  maxSize?: number // in MB
  allowedTypes?: string[]
  jobId: string
  lightMode?: boolean
  className?: string
  section?: boolean
  documentTypes?: Array<{
    id: string
    title: string
    description: string
    adminOnly?: boolean
  }>
}

export function DocumentUpload({
  onUploadComplete,
  maxSize = 10, // Default max size is 10MB
  allowedTypes = ["application/pdf", "image/jpeg", "image/png"],
  jobId,
  lightMode = false,
  className = "",
  section = false,
  documentTypes
}: DocumentUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const { toast } = useToast()

  const handleFileUpload = async (file: File, documentType?: string) => {
    try {
      // Validate file size
      if (file.size > maxSize * 1024 * 1024) {
        toast({
          title: "Error",
          description: `File size must be less than ${maxSize}MB`,
          variant: "destructive"
        })
        return
      }

      // Validate file type
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Error",
          description: "Invalid file type",
          variant: "destructive"
        })
        return
      }

      setIsUploading(true)
      const formData = new FormData()
      formData.append('file', file)
      formData.append('metadata', JSON.stringify({
        type: 'document',
        jobId: jobId,
        title: file.name,
        category: documentType || 'REPORTS'
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
    } finally {
      setIsUploading(false)
    }
  }

  if (lightMode) {
    return (
      <div className={className}>
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
          onClick={() => document.getElementById("file-upload")?.click()}
          disabled={isUploading}
          className="w-full"
        >
          <Upload className="h-4 w-4 mr-2" />
          {isUploading ? "Uploading..." : "Upload Document"}
        </Button>
      </div>
    )
  }

  if (section) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg">Upload Documents</CardTitle>
          <CardDescription>Please upload all required documents for your initial assessment.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {documentTypes?.filter(doc => !doc.adminOnly).map(docType => (
              <div key={docType.id} className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">{docType.title}</h4>
                  <p className="text-sm text-muted-foreground">{docType.description}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isUploading}
                  onClick={() => {
                    const input = document.createElement('input')
                    input.type = 'file'
                    input.accept = allowedTypes.join(",")
                    input.onchange = (event) => {
                      const file = (event.target as HTMLInputElement).files?.[0]
                      if (file) handleFileUpload(file, docType.id)
                    }
                    input.click()
                  }}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
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
