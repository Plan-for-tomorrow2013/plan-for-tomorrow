"use client"

import React from 'react'
import { Card, CardContent, CardHeader } from "@shared/components/ui/card"
import { Button } from "@shared/components/ui/button"
import { FileText, Upload, X, Check } from 'lucide-react'
import { DocumentWithStatus } from '@shared/types/documents'

interface DocumentTileProps {
  document: DocumentWithStatus
  onUpload?: () => void
  onDownload?: () => void
  onDelete?: () => void
  isReport?: boolean
  reportStatus?: {
    isPaid: boolean
    isCompleted: boolean
    hasFile: boolean
  }
  className?: string
}

export function DocumentTile({
  document: doc,
  onUpload,
  onDownload,
  onDelete,
  isReport = false,
  reportStatus,
  className = ''
}: DocumentTileProps) {
  const isUploaded = doc.displayStatus === 'uploaded'
  const isInProgress = isReport && reportStatus?.isPaid && !reportStatus?.isCompleted

  // Render different states
  if (isReport && isInProgress) {
    return (
      <Card className={`shadow-md ${className}`}>
        <CardHeader className="bg-[#323A40] text-white">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold">{doc.title}</h3>
              <p className="text-sm text-gray-300">{doc.category}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 text-center">
          <div className="flex flex-col items-center justify-center space-y-2 py-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="font-semibold text-lg">Report In Progress</p>
            <p className="text-sm text-gray-600 px-4">
              Our team is working on your {doc.title}. You will be notified once it's ready.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isReport && reportStatus?.isCompleted && reportStatus?.hasFile) {
    return (
      <Card className={`shadow-md ${className}`}>
        <CardHeader className="bg-[#323A40] text-white">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold">{doc.title}</h3>
              <p className="text-sm text-gray-300">{doc.category}</p>
            </div>
            <Check className="h-5 w-5 text-green-400" />
          </div>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-[#323A40]">
              <FileText className="h-4 w-4" />
              <span>{doc.uploadedFile?.originalName}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Uploaded: {doc.uploadedFile?.uploadedAt ? new Date(doc.uploadedFile.uploadedAt).toLocaleDateString() : 'N/A'}
            </p>
            {onDownload && (
              <Button
                variant="outline"
                className="w-full"
                onClick={onDownload}
              >
                <FileText className="h-4 w-4 mr-2" />
                Download Report
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Standard Document Card
  return (
    <Card className={`relative ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">{doc.title}</h3>
          </div>
          {isUploaded && <Check className="h-5 w-5 text-green-500" />}
        </div>
      </CardHeader>
      <CardContent>
        {isUploaded && doc.uploadedFile ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="text-sm">{doc.uploadedFile.originalName}</span>
            </div>
            <div className="text-sm text-gray-500">
              Uploaded on {doc.uploadedFile.uploadedAt ? new Date(doc.uploadedFile.uploadedAt).toLocaleDateString() : 'N/A'}
            </div>
            <div className="flex gap-2">
              {onDownload && (
                <Button variant="outline" className="flex-1" onClick={onDownload}>
                  <FileText className="h-4 w-4 mr-2" />Download
                </Button>
              )}
              {onDelete && doc.path !== '/pre-prepared-assessment' && (
                <Button variant="destructive" size="icon" onClick={onDelete}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        ) : (
          onUpload && (
            <Button variant="outline" className="w-full" onClick={onUpload}>
              <Upload className="h-4 w-4 mr-2" />Upload Document
            </Button>
          )
        )}
      </CardContent>
    </Card>
  )
}
