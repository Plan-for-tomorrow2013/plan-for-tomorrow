"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { documentService } from '@/lib/services/documentService'
import { Document, DocumentVersion } from '@/types/documents'
import { AssessmentType, DEFAULT_ASSESSMENT_TYPES } from '@/types/assessments'
import { toast } from '@/components/ui/use-toast'
import { FileText, History, Upload, Trash2, Plus } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
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

export default function AdminInitialAssessmentPage() {
  const [documents, setDocuments] = useState<AdminDocument[]>([])
  const [customPaths, setCustomPaths] = useState<AssessmentType[]>([])
  const [newAssessmentDialog, setNewAssessmentDialog] = useState(false)
  const [newAssessment, setNewAssessment] = useState({
    label: '',
    id: ''
  })
  const [newDocument, setNewDocument] = useState({
    title: '',
    path: '',
    id: ''
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [versionHistory, setVersionHistory] = useState<DocumentVersion[]>([])
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)

  const AVAILABLE_PATHS = [...DEFAULT_ASSESSMENT_TYPES, ...customPaths]

  useEffect(() => {
    loadDocuments()
    loadCustomPaths()
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

  const loadCustomPaths = async () => {
    try {
      const response = await fetch('/api/assessment-types')
      if (response.ok) {
        const data = await response.json()
        setCustomPaths(data.customTypes || [])
      }
    } catch (error) {
      console.error('Error loading custom assessment types:', error)
    }
  }

  const handleAddAssessment = async () => {
    if (!newAssessment.label) return

    const id = newAssessment.label.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    const assessmentType: AssessmentType = {
      id: id,
      value: `/initial-assessment/pre-prepared/${id}`,
      label: newAssessment.label,
      description: `Complying Development Certificate for ${newAssessment.label.toLowerCase()}`,
      documentId: id,
      version: 1,
      file: `/documents/${id}.pdf`
    }

    console.log('Attempting to create assessment type:', assessmentType)

    try {
      const response = await fetch('/api/assessment-types', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(assessmentType),
      })

      const data = await response.json()
      console.log('API response:', data)

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save assessment type')
      }

      const updatedPaths = [...customPaths, assessmentType]
      setCustomPaths(updatedPaths)
      
      setNewAssessment({ label: '', id: '' })
      setNewAssessmentDialog(false)
      
      toast({
        title: 'Success',
        description: 'New assessment type added successfully'
      })
    } catch (error) {
      console.error('Error saving assessment type:', error)
      toast({
        title: 'Error',
        description: 'Failed to save assessment type',
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
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">Initial Assessment Document Management</h1>
          <Dialog open={newAssessmentDialog} onOpenChange={setNewAssessmentDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Assessment Type
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Assessment Type</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Assessment Name</label>
                  <Input
                    placeholder="e.g., CDC Commercial Assessment"
                    value={newAssessment.label}
                    onChange={(e) => setNewAssessment(prev => ({ ...prev, label: e.target.value }))}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={handleAddAssessment}
                  disabled={!newAssessment.label}
                >
                  Add Assessment
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <p className="text-muted-foreground">
          Manage CDC assessment templates and related documents for different dwelling types.
        </p>
      </div>

      {/* Upload Form */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Upload New Assessment Template</CardTitle>
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

      {/* Assessment Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {AVAILABLE_PATHS.map((assessment) => {
          const doc = documents.find(d => d.path === assessment.value)
          // Get the latest version by finding the one with the highest version number
          const latestVersion = doc?.versions?.reduce<DocumentVersion | null>((latest, current) => 
            (latest?.version || 0) < current.version ? current : latest
          , null);

          return (
            <div key={assessment.value} className="bg-white rounded-lg p-6">
              <h3 className="font-medium">{assessment.label.replace(' Assessment', '')}</h3>
              <p className="text-sm text-gray-500 mt-1">
                Complying Development Certificate for a {assessment.label.toLowerCase().replace(' assessment', '')}
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
    </div>
  )
} 