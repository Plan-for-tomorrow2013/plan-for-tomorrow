"use client"

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
    value: '/report-writer/pre-prepared/statement-environmental-effects', 
    label: 'Statement of Environmental Effects',
    id: 'statement-environmental-effects'
  },
  { 
    value: '/report-writer/pre-prepared/complying-development-certificate', 
    label: 'Complying Development Certificate',
    id: 'complying-development-certificate'
  }
]

export default function AdminReportWriterPage() {
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
        <h1 className="text-2xl font-semibold mb-4">Report Writer Document Management</h1>
        <p className="text-muted-foreground">
          Manage report templates and related documents for different assessment types.
        </p>
      </div>

      {/* Upload Form */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Upload New Report Template</CardTitle>
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
                onChange={handleFileSelect}
                className="flex-1"
              />
              <Button 
                onClick={handleUpload}
                disabled={!selectedFile || !newDocument.title || !newDocument.path}
              >
                Upload
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Document Groups */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {AVAILABLE_PATHS.map((assessment) => {
          const doc = documents.find(d => d.path === assessment.value)
          // Get the latest version by finding the one with the highest version number
          const latestVersion = doc?.versions?.reduce<DocumentVersion | null>((latest, current) => 
            (latest?.version || 0) < current.version ? current : latest
          , null);
          
          return (
            <div key={assessment.value} className="bg-white rounded-lg p-6">
              <h3 className="font-medium">{assessment.label}</h3>
              <p className="text-sm text-gray-500 mt-1">
                Professional report template for {assessment.label.toLowerCase()}
              </p>
              <div className="mt-2">
                {doc ? (
                  <>
                    <div className="flex items-center text-sm text-green-600">
                      <span>Document Available</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500 mt-2">
                      <FileText className="h-4 w-4 mr-2" />
                      <span>{latestVersion?.originalName || 'No filename available'}</span>
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      Version {doc.currentVersion} • Last Updated: {doc.updatedAt ? new Date(doc.updatedAt).toLocaleDateString() : 'N/A'}
                    </div>
                  </>
                ) : (
                  <div className="flex items-center text-sm text-gray-500">
                    <span>No document uploaded</span>
                  </div>
                )}
              </div>
              <input
                type="file"
                id={`file-${assessment.id}`}
                className="hidden"
                accept=".pdf,.doc,.docx"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file && doc) {
                    handleUpdateDocument(doc, file)
                  }
                }}
              />
              <Button 
                className="w-full mt-4 bg-[#0F172A] hover:bg-[#0F172A]/90 text-white"
                onClick={() => document.getElementById(`file-${assessment.id}`)?.click()}
              >
                Replace Document
              </Button>
            </div>
          )
        })}
      </div>

      {/* Version History Dialog */}
      <Dialog>
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
    </div>
  )
} 