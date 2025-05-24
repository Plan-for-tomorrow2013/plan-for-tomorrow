"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@shared/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@shared/components/ui/card"
import { FileText, Plus, Upload, X } from "lucide-react"
import { Document, DocumentWithStatus } from '../types/documents'
import { documentService } from "@shared/services/documentService"

interface DocumentStoreBaseProps {
  title?: string
  description?: string
  className?: string
  documents: DocumentWithStatus[]
  onUpload: (file: File) => void
  onDelete: (id: string) => void
  onDocumentSelect?: (document: DocumentWithStatus) => void
  isUploading?: boolean
}

interface ManagedDocumentStoreProps extends DocumentStoreBaseProps {
  onDocumentSelect?: (document: DocumentWithStatus) => void
}

interface ControlledDocumentStoreProps {
  documents: DocumentWithStatus[]
  onUpload?: (document: DocumentWithStatus) => void
  onDelete: (id: string) => void
  jobId: string
  title?: string
  description?: string
}

// Base component with shared UI logic
export function BaseDocumentStore({
  documents,
  onUpload,
  onDelete,
  onDocumentSelect,
  title = "Document Store",
  description = "Your uploaded documents",
  isUploading = false
}: DocumentStoreBaseProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {documents.map((doc: DocumentWithStatus) => {
            const isReportType = doc.category === 'REPORTS';
            const isInProgress = isReportType && doc.displayStatus === 'pending_admin_delivery';
            const isCompleted = isReportType && doc.displayStatus === 'uploaded';

            return (
              <div key={doc.id} className="flex items-center justify-between p-2 bg-white rounded-lg border">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span className="text-sm">{doc.title}</span>
                  {isInProgress && (
                    <span className="text-xs text-blue-600">(In Progress)</span>
                  )}
                  {isCompleted && (
                    <span className="text-xs text-green-600">(Completed)</span>
                  )}
                  <span className="text-xs text-gray-500">
                    ({doc.size ? (doc.size / 1024 / 1024).toFixed(2) : '0.00'} MB)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {onDocumentSelect && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDocumentSelect(doc)}
                    >
                      Select
                    </Button>
                  )}
                  {!isInProgress && doc.path !== '/pre-prepared-assessment' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(doc.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <div className="relative">
          <input
            type="file"
            className="hidden"
            id="file-upload"
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (file) onUpload(file)
            }}
            disabled={isUploading}
          />
          <Button
            variant="outline"
            className="w-full"
            onClick={() => document.getElementById("file-upload")?.click()}
            disabled={isUploading}
          >
            <Plus className="mr-2 h-4 w-4" />
            {isUploading ? "Uploading..." : "Add More"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Managed component that handles its own state
export function ManagedDocumentStore(props: ManagedDocumentStoreProps) {
  const [isUploading, setIsUploading] = React.useState(false)

  const handleUpload = async (file: File) => {
    setIsUploading(true)
    try {
      await props.onUpload(file)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <BaseDocumentStore
      {...props}
      isUploading={isUploading}
      onUpload={handleUpload}
    />
  )
}

// Controlled component that receives documents as props
export function ControlledDocumentStore({
  documents,
  onUpload,
  onDelete,
  jobId,
  title,
  description
}: ControlledDocumentStoreProps) {
  const [isUploading, setIsUploading] = React.useState(false)

  const handleUpload = async (file: File) => {
    if (!onUpload) return
    setIsUploading(true)
    try {
      const newDocument = await documentService.uploadDocument({
        file,
        type: file.type,
        jobId,
        docId: 'temp' // This should be replaced with the actual document ID
      })
      onUpload(newDocument)
    } catch (error) {
      console.error('Error uploading document:', error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await documentService.removeDocument(id, jobId)
      onDelete(id)
    } catch (error) {
      console.error('Error removing document:', error)
    }
  }

  return (
    <BaseDocumentStore
      documents={documents}
      onUpload={handleUpload}
      onDelete={handleDelete}
      title={title}
      description={description}
      isUploading={isUploading}
    />
  )
}
