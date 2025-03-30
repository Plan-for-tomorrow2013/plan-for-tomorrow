"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Plus, Upload, X } from "lucide-react"
import { Document, documentService } from "@/lib/services/documentService"

interface DocumentStoreProps {
  title?: string
  description?: string
  onDocumentSelect?: (document: Document) => void
}

export function DocumentStore({ 
  title = "Document Store", 
  description = "Your uploaded documents",
  onDocumentSelect 
}: DocumentStoreProps) {
  const [documents, setDocuments] = useState<Document[]>([])
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    loadDocuments()
  }, [])

  const loadDocuments = async () => {
    const docs = await documentService.getDocuments()
    setDocuments(docs)
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)
    try {
      const newDocument = await documentService.uploadFile(files[0])
      setDocuments((prev: Document[]) => [...prev, newDocument])
    } catch (error) {
      console.error("Error uploading file:", error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await documentService.deleteDocument(id)
      setDocuments((prev: Document[]) => prev.filter((doc: Document) => doc.id !== id))
    } catch (error) {
      console.error("Error deleting document:", error)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {documents.map((doc: Document) => (
            <div key={doc.id} className="flex items-center justify-between p-2 bg-white rounded-lg border">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span className="text-sm">{doc.name}</span>
                <span className="text-xs text-gray-500">({(doc.size / 1024 / 1024).toFixed(2)} MB)</span>
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
                  onClick={() => handleDelete(doc.id)}
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
            onChange={handleFileUpload}
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