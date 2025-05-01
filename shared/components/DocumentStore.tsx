"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@shared/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@shared/components/ui/card"
import { FileText, Plus, Upload, X } from "lucide-react"
import { Document } from '../types/documents'
import { documentService } from "../../admin/lib/services/documentService"

interface DocumentStoreBaseProps {
  title?: string
  description?: string
  className?: string
}

interface ManagedDocumentStoreProps extends DocumentStoreBaseProps {
  onDocumentSelect?: (document: Document) => void
}

interface ControlledDocumentStoreProps extends DocumentStoreBaseProps {
  documents: Document[]
  onUpload?: (document: Document) => void
  onDelete?: (documentId: string) => void
  jobId: string
}

// Base component with shared UI logic
function BaseDocumentStore({
  title = "Document Store",
  description = "Your uploaded documents",
  documents,
  onDelete,
  onDocumentSelect,
  isUploading,
  onUpload,
}: {
  title: string
  description: string
  documents: Document[]
  onDelete: (id: string) => void
  onDocumentSelect?: (document: Document) => void
  isUploading: boolean
  onUpload: (file: File) => void
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {documents.map((doc) => (
            <div key={doc.id} className="flex items-center justify-between p-2 bg-white rounded-lg border">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span className="text-sm">{doc.title}</span>
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
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(doc.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
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

// Managed version (for urban-planning-portal)
export function ManagedDocumentStore({
  title = "Document Store",
  description = "Your uploaded documents",
  onDocumentSelect
}: ManagedDocumentStoreProps) {
  const [documents, setDocuments] = useState<Document[]>([])
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    loadDocuments()
  }, [])

  const loadDocuments = async () => {
    const docs = await documentService.getDocuments()
    setDocuments(docs)
  }

  const handleUpload = async (file: File) => {
    setIsUploading(true)
    try {
      const newDocument = await documentService.uploadDocument({
        file,
        type: 'document',
        jobId: 'temp'
      })
      setDocuments(prev => [...prev, newDocument])
    } catch (error) {
      console.error("Error uploading file:", error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await documentService.removeDocument({ documentId: id, jobId: 'temp' })
      setDocuments(prev => prev.filter(doc => doc.id !== id))
    } catch (error) {
      console.error("Error deleting document:", error)
    }
  }

  return (
    <BaseDocumentStore
      title={title}
      description={description}
      documents={documents}
      isUploading={isUploading}
      onDelete={handleDelete}
      onDocumentSelect={onDocumentSelect}
      onUpload={handleUpload}
    />
  )
}

// Controlled version (for admin)
export function ControlledDocumentStore({
  documents,
  onUpload,
  onDelete,
  jobId,
  title = "Document Store",
  description = "Your uploaded documents"
}: ControlledDocumentStoreProps) {
  const handleControlledUpload = async (file: File) => {
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
      onUpload?.(document)
    } catch (error) {
      console.error('Error uploading document:', error)
    }
  }

  const handleControlledDelete = async (documentId: string) => {
    try {
      const response = await fetch(`/api/documents/${documentId}?jobId=${jobId}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete document')
      onDelete?.(documentId)
    } catch (error) {
      console.error('Error deleting document:', error)
    }
  }

  return (
    <BaseDocumentStore
      title={title}
      description={description}
      documents={documents}
      isUploading={false}
      onDelete={handleControlledDelete}
      onUpload={handleControlledUpload}
    />
  )
}
