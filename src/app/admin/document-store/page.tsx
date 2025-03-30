'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { documentService } from '@/lib/services/documentService'
import { Document, DocumentVersion } from '@/types/documents'
import { toast } from '@/components/ui/use-toast'
import { FileText, History, Upload, Trash2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface AdminDocument extends Document {
  isEditing?: boolean
}

const AVAILABLE_PATHS = [
  { 
    value: '/initial-assessment/pre-prepared/cdc-dwelling', 
    label: 'CDC Dwelling Assessment',
    id: 'cdc-dwelling'
  },
  { 
    value: '/initial-assessment/pre-prepared/cdc-dual-occupancy', 
    label: 'CDC Dual Occupancy Assessment',
    id: 'cdc-dual-occupancy'
  },
  { 
    value: '/initial-assessment/pre-prepared/cdc-secondary-dwelling', 
    label: 'CDC Secondary Dwelling Assessment',
    id: 'cdc-secondary-dwelling'
  }
]

export default function AdminDocumentStorePage() {
  const [documents, setDocuments] = useState<AdminDocument[]>([])
  const [newDocument, setNewDocument] = useState({
    title: '',
    path: '',
    id: ''
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [versionHistory, setVersionHistory] = useState<DocumentVersion[]>([])
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)

  useEffect(() => {
    loadDocuments()
  }, [])

  useEffect(() => {
    const selectedPath = AVAILABLE_PATHS.find(p => p.value === newDocument.path)
    if (selectedPath) {
      setNewDocument(prev => ({
        ...prev,
        id: selectedPath.id
      }))
    }
  }, [newDocument.path])

  const loadDocuments = async () => {
    try {
      const docs = await documentService.getDocuments()
      setDocuments(docs)
    } catch (error) {
      console.error('Error loading documents:', error)
      toast({
        title: 'Error',
        description: 'Failed to load documents',
        variant: 'destructive'
      })
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile || !newDocument.title || !newDocument.path) return

    const formData = new FormData()
    formData.append('file', selectedFile)
    formData.append('metadata', JSON.stringify({
      title: newDocument.title,
      path: newDocument.path,
      id: newDocument.id
    }))

    try {
      const response = await fetch('/api/documents', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) throw new Error('Failed to upload document')

      const result = await response.json()
      setDocuments(prev => [...prev, result])
      setNewDocument({ title: '', path: '', id: '' })
      setSelectedFile(null)
      
      toast({
        title: 'Success',
        description: 'Document uploaded successfully'
      })
    } catch (error) {
      console.error('Error uploading document:', error)
      toast({
        title: 'Error',
        description: 'Failed to upload document',
        variant: 'destructive'
      })
    }
  }

  const handleUpdateDocument = async (document: Document, file: File) => {
    try {
      const updatedDocument = await documentService.updateDocument(document.id, file, {
        uploadedBy: 'admin'
      })
      setDocuments(prev => prev.map(doc => 
        doc.id === document.id ? updatedDocument : doc
      ))
      toast({
        title: 'Success',
        description: 'Document updated successfully'
      })
    } catch (error) {
      console.error('Error updating document:', error)
      toast({
        title: 'Error',
        description: 'Failed to update document',
        variant: 'destructive'
      })
    }
  }

  const handleViewVersions = async (document: Document) => {
    try {
      const versions = await documentService.getDocumentVersions(document.id)
      setVersionHistory(versions)
      setSelectedDocument(document)
    } catch (error) {
      console.error('Error loading versions:', error)
      toast({
        title: 'Error',
        description: 'Failed to load document versions',
        variant: 'destructive'
      })
    }
  }

  const handleDeleteDocument = async (document: Document) => {
    try {
      await documentService.deleteDocument(document.id)
      setDocuments(prev => prev.filter(doc => doc.id !== document.id))
      toast({
        title: 'Success',
        description: 'Document deleted successfully'
      })
    } catch (error) {
      console.error('Error deleting document:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete document',
        variant: 'destructive'
      })
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold mb-4">Administration Document Store</h1>
        <p className="text-muted-foreground">
          Manage documents and assessment templates across different sections of the application.
        </p>
      </div>

      {/* Upload Form */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Upload New Document</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Document Title
            </label>
            <Input
              placeholder="Enter document title"
              value={newDocument.title}
              onChange={(e) => setNewDocument(prev => ({ ...prev, title: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Document Location
            </label>
            <Select
              value={newDocument.path}
              onValueChange={(value) => setNewDocument(prev => ({ ...prev, path: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select where this document should appear" />
              </SelectTrigger>
              <SelectContent>
                {AVAILABLE_PATHS.map((path) => (
                  <SelectItem key={path.value} value={path.value}>
                    {path.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Document File
            </label>
            <div className="flex items-center gap-4">
              <Input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileSelect}
                className="flex-1"
              />
              {selectedFile && (
                <span className="text-sm text-muted-foreground">
                  Selected: {selectedFile.name}
                </span>
              )}
            </div>
          </div>

          <Button 
            onClick={handleUpload}
            disabled={!newDocument.title || !newDocument.path || !selectedFile}
            className="w-full"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Document
          </Button>
        </CardContent>
      </Card>

      {/* Document List */}
      <div className="space-y-6">
        {AVAILABLE_PATHS.map((pathGroup) => {
          const pathDocuments = documents.filter(doc => doc.path === pathGroup.value)
          if (pathDocuments.length === 0) return null

          return (
            <div key={pathGroup.value}>
              <h2 className="text-lg font-semibold mb-4">{pathGroup.label}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pathDocuments.map((doc) => (
                  <Card key={doc.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{doc.title}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            Version {doc.currentVersion}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleViewVersions(doc)}
                              >
                                <History className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Version History</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                {versionHistory.map((version) => (
                                  <div
                                    key={version.version}
                                    className="flex items-center justify-between p-2 border rounded"
                                  >
                                    <div>
                                      <p className="font-medium">Version {version.version}</p>
                                      <p className="text-sm text-muted-foreground">
                                        {new Date(version.uploadedAt).toLocaleDateString()}
                                      </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <FileText className="h-4 w-4" />
                                      <span className="text-sm">{version.originalName}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </DialogContent>
                          </Dialog>
                          <Input
                            type="file"
                            accept=".pdf,.doc,.docx"
                            className="hidden"
                            id={`file-${doc.id}`}
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) handleUpdateDocument(doc, file)
                            }}
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => document.getElementById(`file-${doc.id}`)?.click()}
                          >
                            <Upload className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Document</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{doc.title}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-red-500 hover:bg-red-700"
                                  onClick={() => handleDeleteDocument(doc)}
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-muted-foreground">
                        Last Updated: {new Date(doc.updatedAt).toLocaleDateString()}
                      </div>
                      {doc.required && (
                        <div className="mt-2 text-sm font-medium text-orange-600">
                          Required Document
                        </div>
                      )}
                      {doc.adminOnly && (
                        <div className="mt-2 text-sm font-medium text-blue-600">
                          Admin Only
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
} 