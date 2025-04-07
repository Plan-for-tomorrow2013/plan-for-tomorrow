"use client"

import { useState } from "react"
import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { FileText, Upload, X } from "lucide-react"
import { Document, documentService } from "../../lib/services/documentService"
import { useToast } from "../../hooks/use-toast"
import { ToastProvider } from "@radix-ui/react-toast"

interface DocumentUploadProps {
  onUploadComplete?: (document: Document) => void
  maxSize?: number // in MB
  allowedTypes?: string[]
}

export function DocumentUpload({
  onUploadComplete,
  maxSize = 10, // Default max size is 10MB
  allowedTypes = ["application/pdf", "image/jpeg", "image/png"]
}: DocumentUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const { toast } = useToast()

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

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
    try {
      const document = await documentService.uploadFile(file)
      toast({
        title: "Success",
        description: "File uploaded successfully"
      })

      if (document) {
        onUploadComplete?.(document)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload file",
        variant: "destructive"
      })
      console.error("Error uploading file:", error)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <ToastProvider>
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
              onChange={handleFileUpload}
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
    </ToastProvider>
  )
}
