"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@shared/components/ui/card"
import { Button } from "@shared/components/ui/button"
import { Plus, FileText, Download } from "lucide-react"
import { useToast } from "../lib/toast-context"

interface PrePreparedAssessment {
  id: string
  title: string
  content: string
  date: string
  author: string
  file?: {
    id: string
    originalName: string
    savedPath: string
  }
}

interface PrePreparedAssessmentsProps {
  assessments: PrePreparedAssessment[]
  isAdmin?: boolean
  onAddAssessment?: () => void
  onDownload?: (assessment: PrePreparedAssessment) => Promise<void>
  className?: string
}

export function PrePreparedAssessments({
  assessments: initialAssessments,
  isAdmin = false,
  onAddAssessment,
  onDownload,
  className = ""
}: PrePreparedAssessmentsProps) {
  const [assessments, setAssessments] = useState<PrePreparedAssessment[]>(initialAssessments)
  const { toast } = useToast()

  const handleDownload = async (assessment: PrePreparedAssessment) => {
    if (!assessment.file) {
      toast({
        title: "Error",
        description: "No file associated with this assessment.",
        variant: "destructive",
      })
      return
    }

    if (onDownload) {
      try {
        await onDownload(assessment)
        toast({
          title: "Success",
          description: "File downloaded successfully.",
        })
      } catch (error: any) {
        console.error('Error downloading assessment:', error)
        toast({
          title: "Download Error",
          description: error.message || "An unexpected error occurred during download.",
          variant: "destructive",
        })
      }
      return
    }

    // Default download behavior if no onDownload callback provided
    try {
      const downloadUrl = `/api/download-pre-prepared/${assessment.file.id}`
      const response = await fetch(downloadUrl)

      if (!response.ok) {
        throw new Error('Failed to download file')
      }

      const contentDisposition = response.headers.get('Content-Disposition')
      let fileName = assessment.file.originalName
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/fileName="?(.+)"?/i)
        if (fileNameMatch && fileNameMatch[1]) {
          fileName = fileNameMatch[1]
        }
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: "Success",
        description: "File downloaded successfully.",
      })
    } catch (error: any) {
      console.error('Error downloading assessment:', error)
      toast({
        title: "Download Error",
        description: error.message || "An unexpected error occurred during download.",
        variant: "destructive",
      })
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString()
    } catch (e) {
      return dateString
    }
  }

  return (
    <Card className={className}>
      <CardHeader className="pt-4 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle>Pre-prepared Assessments</CardTitle>
          {isAdmin && onAddAssessment && (
            <Button variant="outline" size="sm" onClick={onAddAssessment}>
              <Plus className="h-4 w-4 mr-2" />
              New
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {assessments.map((assessment) => (
            <div key={assessment.id} className="border rounded-lg p-4 shadow-sm">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-lg">{assessment.title}</h3>
                <span className="text-sm text-muted-foreground">{formatDate(assessment.date)}</span>
              </div>
              <p className="mt-1 text-sm text-gray-700 mb-3">{assessment.content}</p>
              <p className="mt-2 text-xs text-gray-500 mb-4">Posted by {assessment.author}</p>

              {assessment.file && (
                <div className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="h-4 w-4 text-gray-600" />
                    <span>{assessment.file.originalName}</span>
                  </div>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleDownload(assessment)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              )}
            </div>
          ))}
          {assessments.length === 0 && !isAdmin && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No pre-prepared assessments available at this time
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
