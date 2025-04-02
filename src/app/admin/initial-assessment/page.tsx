"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { documentService } from '@/lib/services/documentService'
import { Document, DOCUMENT_TYPES, DocumentVersion } from '@/types/documents'
import { AssessmentType, DEFAULT_ASSESSMENT_TYPES } from '@/types/assessments'
import { WorkTicket } from '@/types/workTickets'
import { toast } from '@/components/ui/use-toast'
import { FileText, History, Upload, Trash2, Plus, Check } from 'lucide-react'
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
import { useJobs } from '@/hooks/useJobs'
import Link from 'next/link'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { PrePreparedAssessment } from '@/types/assessments'

// Debug flag - set to true to enable console logging
const DEBUG = true

interface DocumentWithStatus extends Document {
  status: 'uploaded' | 'pending' | 'required'
  value?: string
  uploadedFile?: {
    filename: string
    originalName: string
    type: string
    uploadedAt: string
    size: number
    returnedAt?: string
  }
}

interface CustomAssessmentForm {
  developmentType: string
  additionalInfo: string
}

interface JobFormData {
  [key: string]: CustomAssessmentForm
}

interface AdminDocument extends Document {
  status: 'uploaded' | 'pending' | 'required'
  uploadedFile?: {
    filename: string
    originalName: string
    type: string
    uploadedAt: string
    size: number
    returnedAt?: string
  }
}

interface AdminAssessment extends AssessmentType {
  description: string;
  file: string;
  documentId: string;
  version: number;
  ticket?: WorkTicket;
}

export default function AdminInitialAssessmentPage() {
  const router = useRouter()
  const { jobs } = useJobs()
  const [selectedJobId, setSelectedJobId] = useState<string | undefined>(undefined)
  const [documents, setDocuments] = useState<DocumentWithStatus[]>([])
  const [allDocuments, setAllDocuments] = useState<Document[]>([])
  const [documentError, setDocumentError] = useState<string | null>(null)
  const [formData, setFormData] = useState<JobFormData>({})
  const [showPaymentButton, setShowPaymentButton] = useState(false)
  const [paymentComplete, setPaymentComplete] = useState<Record<string, boolean>>({})
  const [purchasedAssessments, setPurchasedAssessments] = useState<Record<string, boolean>>({})
  const [workTickets, setWorkTickets] = useState<WorkTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
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
      setDocuments(docs.map(doc => ({
        ...doc,
        status: 'uploaded' as const,
        uploadedFile: undefined
      })) as DocumentWithStatus[])
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
        const prePreparedTickets = tickets.filter((t: WorkTicket) => 
          t.ticketType === 'pre-prepared-assessment' && 
          (t.jobId === 'admin' || t.status === 'completed')
        )
        setWorkTickets(prePreparedTickets)
      }
    } catch (error) {
      console.error('Error loading work tickets:', error)
      toast({
        title: 'Error',
        description: 'Failed to load work tickets',
        variant: 'destructive'
      })
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
      // First, update the document in the document service
      const updatedDocument = await documentService.updateDocument(document.id, file, {
        uploadedBy: 'admin'
      })

      // Find and update the work ticket
      const workTicket = workTickets.find(t => t.prePreparedAssessment?.documentId === document.id);
      
      if (workTicket) {
        const workTicketResponse = await fetch(`/api/work-tickets/${workTicket.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: 'completed',
            completedDocument: {
              fileName: file.name,
              uploadedAt: new Date().toISOString(),
              returnedAt: new Date().toISOString()
            },
            prePreparedAssessment: {
              ...workTicket.prePreparedAssessment,
              documentId: document.id
            }
          })
        });

        if (!workTicketResponse.ok) {
          throw new Error('Failed to update work ticket');
        }

        // Refresh work tickets list
        await loadWorkTickets();
      }

      // Update the documents state
      setDocuments(prev => prev.map(doc => 
        doc.id === document.id ? {
          ...updatedDocument,
          status: 'uploaded' as const,
          uploadedFile: {
            filename: file.name,
            originalName: file.name,
            type: file.type,
            uploadedAt: new Date().toISOString(),
            size: file.size
          }
        } : doc
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

  const handleViewVersions = async (assessment: AdminAssessment) => {
    try {
      if (!assessment.documentId) {
        toast({
          title: 'Error',
          description: 'No document associated with this assessment',
          variant: 'destructive'
        })
        return
      }
      const versions = await documentService.getDocumentVersions(assessment.documentId)
      setVersionHistory(versions)
      
      // Get the upload date from the ticket if available
      const uploadedAt = assessment.ticket?.completedDocument?.uploadedAt || new Date().toISOString()
      
      // Create a proper Document object with all required properties
      const document: Document = {
        id: assessment.documentId,
        title: assessment.label,
        type: 'pre-prepared-assessment',
        category: 'ASSESSMENT',
        path: assessment.value,
        versions: versions || [],
        currentVersion: versions?.length || 0,
        createdAt: assessment.ticket?.createdAt || new Date().toISOString(),
        updatedAt: uploadedAt,
        isActive: true,
        value: assessment.value
      }
      
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

  const handleDeleteAssessment = async (ticket: WorkTicket) => {
    try {
      console.log('Deleting assessment:', ticket)
      console.log('Document ID:', ticket.prePreparedAssessment?.documentId)

      // Delete the work ticket
      const ticketResponse = await fetch(`/api/work-tickets/${ticket.id}`, {
        method: 'DELETE'
      })

      if (!ticketResponse.ok) {
        const ticketError = await ticketResponse.json()
        console.error('Failed to delete work ticket:', ticketError)
        throw new Error('Failed to delete work ticket')
      }

      console.log('Work ticket deleted successfully')

      // If there's an associated document, delete it too
      if (ticket.prePreparedAssessment?.documentId) {
        console.log('Deleting associated document:', ticket.prePreparedAssessment.documentId)
        const docResponse = await fetch(`/api/documents/${ticket.prePreparedAssessment.documentId}`, {
          method: 'DELETE'
        })

        if (!docResponse.ok) {
          const docError = await docResponse.json()
          console.warn('Failed to delete associated document:', ticket.prePreparedAssessment.documentId, docError)
        } else {
          console.log('Document deleted successfully')
        }
      }

      // Update local state
      setWorkTickets(prev => prev.filter(t => t.id !== ticket.id))

      toast({
        title: 'Success',
        description: 'Assessment type deleted successfully'
      })
    } catch (error) {
      console.error('Error deleting assessment:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete assessment type',
        variant: 'destructive'
      })
    }
  }

  const handlePurchase = async (ticket: WorkTicket) => {
    if (!selectedJobId) return;
    
    try {
      console.log('Purchasing assessment from ticket:', {
        id: ticket.id,
        type: ticket.prePreparedAssessment?.assessmentType,
        documentId: ticket.prePreparedAssessment?.documentId
      })
      
      // Create a new document in the job's document store
      const formData = new FormData()
      formData.append('documentId', 'initial-assessment-report')
      
      // Create a simple PDF file with the assessment title
      const blob = new Blob(['Assessment Document'], { type: 'application/pdf' })
      const file = new File([blob], `${ticket.prePreparedAssessment?.assessmentType}.pdf`, { type: 'application/pdf' })
      formData.append('file', file)

      const documentResponse = await fetch(`/api/jobs/${selectedJobId}/documents/upload`, {
        method: 'POST',
        body: formData
      })

      if (!documentResponse.ok) {
        throw new Error('Failed to create document')
      }

      // Update the job data to store the purchase
      const updateResponse = await fetch(`/api/jobs/${selectedJobId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          initialAssessment: {
            status: 'paid',
            purchasedAssessment: ticket.prePreparedAssessment?.assessmentType
          }
        })
      })

      if (!updateResponse.ok) {
        throw new Error('Failed to update job status')
      }

      // Update local state using the jobId
      setPurchasedAssessments(prev => ({
        ...prev,
        [selectedJobId]: true
      }))

      // Refresh the documents list to show the new document
      const jobResponse = await fetch(`/api/jobs/${selectedJobId}`)
      if (!jobResponse.ok) {
        throw new Error('Failed to fetch updated job details')
      }
      const jobData = await jobResponse.json()
      
      // Update documents state with the new document
      const updatedDocs = documents.map(doc => {
        if (doc.id === 'initial-assessment-report') {
          return {
            ...doc,
            status: 'uploaded' as const,
            uploadedFile: jobData.documents?.['initial-assessment-report']
          } as DocumentWithStatus
        }
        return doc
      }) as DocumentWithStatus[]
      setDocuments(updatedDocs)

      // Trigger automatic download
      await handleDownload('initial-assessment-report')

      toast({
        title: 'Success',
        description: 'Assessment purchased successfully'
      })

      // Force a re-render of the assessment tiles
      setWorkTickets([...workTickets])
    } catch (error) {
      console.error('Error purchasing assessment:', error)
      toast({
        title: 'Error',
        description: 'Failed to purchase assessment',
        variant: 'destructive'
      })
    }
  }

  const renderPrePreparedContent = () => {
    if (loading) {
      return (
        <div className="container mx-auto p-6 max-w-7xl">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border rounded-lg p-6">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    }

    if (error) {
      return (
        <div className="container mx-auto p-6">
          <h1 className="text-2xl font-semibold mb-4">Pre-Prepared Assessments</h1>
          <div className="p-6 text-red-500">{error}</div>
        </div>
      )
    }

    // Get purchased assessment for current job
    const currentJobPurchasedAssessment = selectedJobId ? purchasedAssessments[selectedJobId] : false

    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold mb-4">Pre-Prepared Assessments</h1>
          <p className="text-muted-foreground">
            Choose from our selection of pre-prepared assessment templates for common development types.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Default assessment types */}
          {DEFAULT_ASSESSMENT_TYPES.map((assessment) => (
            <Card key={assessment.value}>
              <CardHeader>
                <CardTitle>{assessment.label}</CardTitle>
                <CardDescription>{assessment.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full"
                  onClick={() => handlePrePreparedPurchase(assessment)}
                  disabled={!selectedJobId || currentJobPurchasedAssessment}
                >
                  {currentJobPurchasedAssessment ? 'Already Purchased' : 'Purchase Assessment'}
                </Button>
              </CardContent>
            </Card>
          ))}

          {/* Custom assessment types from work tickets */}
          {workTickets
            .filter(ticket => ticket.jobId === 'admin' && ticket.prePreparedAssessment) // Only show admin-created assessments
            .map((ticket) => {
              const isPurchased = selectedJobId ? purchasedAssessments[selectedJobId] : false

              if (isPurchased) {
                return (
                  <Card key={ticket.id} className="bg-green-50">
                    <CardHeader>
                      <CardTitle>{ticket.prePreparedAssessment?.assessmentType}</CardTitle>
                      <CardDescription>
                        Complying Development Certificate for {ticket.prePreparedAssessment?.assessmentType.toLowerCase()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-4">
                        <Check className="h-8 w-8 text-green-500 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 mb-4">
                          Assessment purchased successfully
                        </p>
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => handleDownload('initial-assessment-report')}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Download Assessment
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              }

              return (
                <Card key={ticket.id}>
                  <CardHeader>
                    <CardTitle>{ticket.prePreparedAssessment?.assessmentType}</CardTitle>
                    <CardDescription>
                      Complying Development Certificate for {ticket.prePreparedAssessment?.assessmentType.toLowerCase()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm text-green-600">
                          <FileText className="h-4 w-4 mr-2" />
                          <span>Document Available</span>
                        </div>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Assessment Type</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this assessment type? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteAssessment(ticket)}
                                className="bg-red-500 hover:bg-red-600"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>

                      {/* Document Information Section */}
                      <div className="border rounded-md p-3 bg-gray-50 space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Document ID:</span>
                          <span className="font-mono">{ticket.prePreparedAssessment?.documentId?.substring(0, 8)}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Status:</span>
                          <span className="capitalize">{ticket.status}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Last Updated:</span>
                          <span>
                            {ticket.completedDocument?.uploadedAt 
                              ? new Date(ticket.completedDocument.uploadedAt).toLocaleDateString()
                              : 'Not available'}
                          </span>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full mt-2"
                          onClick={() => handleViewVersions({
                            id: ticket.prePreparedAssessment?.documentId || '',
                            label: ticket.prePreparedAssessment?.assessmentType || '',
                            value: `/initial-assessment/pre-prepared/${ticket.id}`,
                            description: `Complying Development Certificate for ${ticket.prePreparedAssessment?.assessmentType?.toLowerCase() || 'unknown type'}`,
                            documentId: ticket.prePreparedAssessment?.documentId || '',
                            version: 1,
                            file: '',
                            ticket
                          })}
                        >
                          <History className="h-4 w-4 mr-2" />
                          View Version History
                        </Button>
                      </div>

                      {!ticket.status?.includes('completed') && (
                        <Button 
                          onClick={() => handleSetAvailable(ticket)}
                          variant="outline"
                          className="w-full"
                        >
                          Set Available
                        </Button>
                      )}

                      <Button 
                        className="w-full"
                        onClick={() => handlePurchase(ticket)}
                        disabled={!selectedJobId || currentJobPurchasedAssessment}
                      >
                        {currentJobPurchasedAssessment ? 'Already Purchased' : 'Purchase Assessment'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
        </div>
      </div>
    )
  }

  // Add handleDownload function
  const handleDownload = async (documentId: string) => {
    if (!selectedJobId) return

    try {
      const response = await fetch(`/api/jobs/${selectedJobId}/documents/${documentId}/download`)
      if (!response.ok) {
        throw new Error('Failed to download document')
      }

      // Get the filename from the Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition')
      const filename = contentDisposition?.split('filename="')[1]?.split('"')[0] || 'document.pdf'

      // Create a blob from the response
      const blob = await response.blob()
      
      // Create a download link and trigger it
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error downloading document:', error)
      toast({
        title: "Error",
        description: "Failed to download document. Please try again.",
        variant: "destructive"
      })
    }
  }

  // Add handlePrePreparedPurchase function
  const handlePrePreparedPurchase = async (assessment: PrePreparedAssessment) => {
    if (!selectedJobId) {
      toast({
        title: "Error",
        description: "Please select a job first",
        variant: "destructive"
      })
      return
    }

    try {
      // Create a new document in the job's document store
      const formData = new FormData()
      formData.append('documentId', 'initial-assessment-report')
      
      // Create a simple PDF file with the assessment title
      const blob = new Blob(['Assessment Document'], { type: 'application/pdf' })
      const file = new File([blob], `${assessment.label.replace(' Assessment', '')}.pdf`, { type: 'application/pdf' })
      formData.append('file', file)

      const documentResponse = await fetch(`/api/jobs/${selectedJobId}/documents/upload`, {
        method: 'POST',
        body: formData
      })

      if (!documentResponse.ok) {
        throw new Error('Failed to create document')
      }

      // Update the job data to store the purchase
      const updateResponse = await fetch(`/api/jobs/${selectedJobId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          initialAssessment: {
            status: 'paid',
            purchasedAssessment: assessment.id
          }
        })
      })

      if (!updateResponse.ok) {
        throw new Error('Failed to update job status')
      }

      // Update local state
      setPurchasedAssessments(prev => ({
        ...prev,
        [selectedJobId]: true
      }))

      // Refresh the documents list
      await fetchJobDocuments()

      // Trigger automatic download
      await handleDownload('initial-assessment-report')

      toast({
        title: "Success",
        description: "Assessment document has been added to your document store",
      })
    } catch (error) {
      console.error('Error purchasing assessment:', error)
      toast({
        title: "Error",
        description: "Failed to purchase assessment",
        variant: "destructive"
      })
    }
  }

  // Update fetchJobDocuments function to fix type issues
  const fetchJobDocuments = async () => {
    if (!selectedJobId) {
      setDocuments([])
      return
    }

    try {
      interface JobData {
        documents?: Record<string, {
          filename: string
          originalName: string
          type: string
          uploadedAt: string
          size: number
        }>
        initialAssessment?: {
          status: string
        }
      }

      const response = await fetch(`/api/jobs/${selectedJobId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch job details')
      }
      const jobData: JobData = await response.json()
      
      // Initialize documents with their status
      const updatedDocuments = DOCUMENT_TYPES.map((doc: Document): DocumentWithStatus => ({
        ...doc,
        status: jobData.documents?.[doc.id] ? 'uploaded' as const : 'required' as const,
        uploadedFile: jobData.documents?.[doc.id] ? {
          filename: jobData.documents[doc.id].filename,
          originalName: jobData.documents[doc.id].originalName,
          type: jobData.documents[doc.id].type,
          uploadedAt: jobData.documents[doc.id].uploadedAt,
          size: jobData.documents[doc.id].size
        } : undefined
      }))
      
      setDocuments(updatedDocuments)
      setDocumentError(null)

      // Also update purchase state if initial assessment is paid
      if (jobData.initialAssessment?.status === 'paid') {
        setPurchasedAssessments((prev: Record<string, boolean>) => ({
          ...prev,
          [selectedJobId]: true
        }))
      }
    } catch (err) {
      console.error('Error fetching documents:', err)
      setDocumentError('Failed to load documents')
      setDocuments([])
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
        {[...DEFAULT_ASSESSMENT_TYPES.map(assessment => ({
          ...assessment,
          ticket: undefined
        } as AdminAssessment)), ...workTickets
          .filter(ticket => ticket.prePreparedAssessment?.assessmentType && ticket.prePreparedAssessment.assessmentType !== 'Unknown Assessment')
          .map(ticket => ({
            id: ticket.id,
            value: `/initial-assessment/pre-prepared/${ticket.id}`,
            label: ticket.prePreparedAssessment?.assessmentType || 'Unknown Assessment',
            description: `Complying Development Certificate for ${ticket.prePreparedAssessment?.assessmentType?.toLowerCase() || 'unknown type'}`,
            documentId: ticket.prePreparedAssessment?.documentId || '',
            version: 1,
            file: '',
            ticket
          } as AdminAssessment))].map((assessment) => (
            <Card key={assessment.id}>
              <CardHeader>
                <CardTitle>{assessment.label}</CardTitle>
                <CardDescription>{assessment.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-3">
                  {(assessment.ticket?.completedDocument || assessment.file || documents.find(d => d.id === assessment.documentId)?.uploadedFile) ? (
                    <>
                      <div className="flex items-center text-sm text-green-600">
                        <FileText className="h-4 w-4 mr-2" />
                        <span>Document Available</span>
                      </div>
                      <div className="text-xs space-y-1 text-gray-600">
                        <div className="flex items-center justify-between mb-1">
                          <span>Document:</span>
                          <span className="font-medium">
                            {assessment.ticket?.completedDocument?.fileName || 
                             assessment.file || 
                             documents.find(d => d.id === assessment.documentId)?.uploadedFile?.filename}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Uploaded:</span>
                          <span>
                            {assessment.ticket?.completedDocument?.uploadedAt 
                              ? new Date(assessment.ticket.completedDocument.uploadedAt).toLocaleDateString()
                              : documents.find(d => d.id === assessment.documentId)?.uploadedFile?.uploadedAt
                                ? new Date(documents.find(d => d.id === assessment.documentId)!.uploadedFile!.uploadedAt).toLocaleDateString()
                                : new Date().toLocaleDateString()}
                          </span>
                        </div>
                        {assessment.ticket?.completedDocument?.returnedAt && (
                          <div className="flex items-center justify-between">
                            <span>Returned:</span>
                            <span>{new Date(assessment.ticket.completedDocument.returnedAt).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewVersions(assessment)}
                        >
                          <History className="h-4 w-4 mr-1" />
                          History
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Assessment Type</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this assessment type? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteAssessment(assessment.ticket!)}
                                className="bg-red-500 hover:bg-red-600"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </>
                  ) : (
                    <div>
                      <label htmlFor={`file-upload-${assessment.id}`} className="cursor-pointer">
                        <div className="flex items-center justify-center space-x-2 text-sm text-blue-600 hover:text-blue-800 border-2 border-dashed border-gray-300 rounded-md p-4">
                          <Upload className="h-4 w-4" />
                          <span>Upload Assessment Document</span>
                        </div>
                      </label>
                      <input
                        id={`file-upload-${assessment.id}`}
                        type="file"
                        className="hidden"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file && assessment.ticket) {
                            const document: Document = {
                              id: assessment.documentId,
                              title: assessment.label,
                              type: 'pre-prepared-assessment',
                              category: 'ASSESSMENT',
                              path: assessment.value || '',
                              size: 0,
                              versions: [],
                              currentVersion: 1,
                              createdAt: new Date().toISOString(),
                              updatedAt: new Date().toISOString(),
                              isActive: true
                            }
                            handleUpdateDocument(document, file)
                          }
                        }}
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  )
} 