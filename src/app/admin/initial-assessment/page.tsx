"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { documentService } from '@/lib/services/documentService'
import { Document, DocumentVersion } from '@/types/documents'
import { AssessmentType, DEFAULT_ASSESSMENT_TYPES } from '@/types/assessments'
import { WorkTicket } from '@/types/workTickets'
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
  const [workTickets, setWorkTickets] = useState<WorkTicket[]>([])
  const [newAssessmentDialog, setNewAssessmentDialog] = useState(false)
  const [newAssessment, setNewAssessment] = useState({
    label: '',
    id: ''
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [versionHistory, setVersionHistory] = useState<DocumentVersion[]>([])
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)

  useEffect(() => {
    loadDocuments()
    loadWorkTickets()
  }, [])

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

  const loadWorkTickets = async () => {
    try {
      const response = await fetch('/api/work-tickets')
      if (response.ok) {
        const tickets = await response.json()
        setWorkTickets(tickets.filter((t: WorkTicket) => t.ticketType === 'pre-prepared-assessment'))
      }
    } catch (error) {
      console.error('Error loading work tickets:', error)
    }
  }

  const handleAddAssessment = async () => {
    if (!newAssessment.label || !selectedFile) return

    try {
      // First, upload the document to the document store
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('metadata', JSON.stringify({
        title: newAssessment.label,
        type: 'pre-prepared-assessment',
        category: 'ASSESSMENT'
      }))

      const uploadResponse = await fetch('/api/documents', {
        method: 'POST',
        body: formData
      })

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload document')
      }

      const uploadResult = await uploadResponse.json()
      const documentId = uploadResult.id

      // Create a work ticket for the pre-prepared assessment
      const id = newAssessment.label.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      const workTicketResponse = await fetch('/api/work-tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobId: 'admin', // Special case for admin-created assessments
          jobAddress: 'System',
          ticketType: 'pre-prepared-assessment',
          status: 'completed', // Set as completed immediately
          prePreparedAssessment: {
            assessmentType: newAssessment.label,
            documentId: documentId
          },
          completedDocument: {
            fileName: selectedFile.name,
            uploadedAt: new Date().toISOString(),
            returnedAt: new Date().toISOString() // Mark as immediately available
          }
        })
      })

      if (!workTicketResponse.ok) {
        throw new Error('Failed to create work ticket')
      }

      const workTicket = await workTicketResponse.json()
      setWorkTickets(prev => [...prev, workTicket])
      
      setNewAssessment({ label: '', id: '' })
      setSelectedFile(null)
      setNewAssessmentDialog(false)

      toast({
        title: 'Success',
        description: 'Assessment type added successfully'
      })
    } catch (error) {
      console.error('Error adding assessment:', error)
      toast({
        title: 'Error',
        description: 'Failed to add assessment type',
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

  const handleSetAvailable = async (ticket: WorkTicket) => {
    try {
      // Update the work ticket to mark it as completed and available
      const response = await fetch(`/api/work-tickets/${ticket.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'completed',
          completedDocument: {
            ...ticket.completedDocument,
            fileName: ticket.prePreparedAssessment?.assessmentType + '.pdf',
            uploadedAt: new Date().toISOString(),
            returnedAt: new Date().toISOString()
          }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update work ticket')
      }

      // Refresh the work tickets list
      const updatedTicketsResponse = await fetch('/api/work-tickets')
      if (!updatedTicketsResponse.ok) {
        throw new Error('Failed to fetch updated tickets')
      }
      const updatedTickets = await updatedTicketsResponse.json()
      setWorkTickets(updatedTickets)

      toast({
        title: 'Success',
        description: 'Assessment is now available'
      })
    } catch (error) {
      console.error('Error setting assessment available:', error)
      toast({
        title: 'Error',
        description: 'Failed to make assessment available',
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
                <div className="space-y-2">
                  <label className="text-sm font-medium">Assessment Document</label>
                  <Input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileSelect}
                  />
                  {selectedFile && (
                    <p className="text-sm text-muted-foreground">
                      Selected: {selectedFile.name}
                    </p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={handleAddAssessment}
                  disabled={!newAssessment.label || !selectedFile}
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

      {/* Assessment Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...DEFAULT_ASSESSMENT_TYPES, ...workTickets.map(ticket => ({
          id: ticket.id,
          value: `/initial-assessment/pre-prepared/${ticket.id}`,
          label: ticket.prePreparedAssessment?.assessmentType || 'Unknown Assessment',
          description: `Complying Development Certificate for ${ticket.prePreparedAssessment?.assessmentType?.toLowerCase() || 'unknown type'}`,
          documentId: ticket.prePreparedAssessment?.documentId || '',
          version: 1,
          ticket: ticket // Pass the full ticket for the Set Available button
        }))].map(assessment => {
          const doc = documents.find(d => d.id === assessment.documentId)
          const latestVersion = doc?.versions?.reduce<DocumentVersion | null>((latest, current) => 
            (latest?.version || 0) < current.version ? current : latest
          , null)

          return (
            <div key={assessment.value} className="bg-white rounded-lg p-6 border">
              <h3 className="font-medium">{assessment.label.replace(' Assessment', '')}</h3>
              <p className="text-sm text-gray-500 mt-1">
                {assessment.description}
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
              <div className="mt-4 space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    const doc = documents.find(d => d.id === assessment.documentId)
                    if (doc) {
                      handleUpdateDocument(doc, selectedFile || new File([], ''))
                    }
                  }}
                >
                  Replace Document
                </Button>
                {/* Only show Set Available button for work tickets that aren't completed */}
                {'ticket' in assessment && assessment.ticket && assessment.ticket.status !== 'completed' && (
                  <Button 
                    className="w-full"
                    onClick={() => handleSetAvailable(assessment.ticket)}
                  >
                    Set Available
                  </Button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
} 