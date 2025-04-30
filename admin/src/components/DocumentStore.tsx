"use client"

import { useState, useEffect } from "react"
import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { FileText, Plus, Upload, X } from "lucide-react"
import { Document } from '@shared/types/documents'
import { documentService } from "../../lib/services/documentService"

interface DocumentStoreProps {
  documents: Document[]
  onUpload?: (document: Document) => void
  onDelete?: (documentId: string) => void
  jobId: string
}

export function DocumentStore({ documents, onUpload, onDelete, jobId }: DocumentStoreProps) {
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
      onUpload?.(document)
    } catch (error) {
      console.error('Error uploading document:', error)
    }
  }

  const handleDelete = async (documentId: string) => {
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
    <Card>
      <CardHeader>
        <CardTitle>Documents</CardTitle>
        <CardDescription>Upload and manage your documents</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {documents.map((doc) => (
            <div key={doc.id} className="flex items-center justify-between p-2 border rounded">
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>{doc.title}</span>
                {doc.size && <span className="text-sm text-gray-500">({Math.round(doc.size / 1024)} KB)</span>}
              </div>
              <button
                onClick={() => handleDelete(doc.id)}
                className="text-red-500 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
          <div className="flex items-center space-x-2">
            <input
              type="file"
              className="hidden"
              id="file-upload"
              onChange={(event) => {
                const file = event.target.files?.[0]
                if (file) handleFileUpload(file)
              }}
            />
            <label
              htmlFor="file-upload"
              className="flex items-center space-x-2 text-blue-500 hover:text-blue-700 cursor-pointer"
            >
              <Upload className="h-4 w-4" />
              <span>Upload Document</span>
            </label>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
