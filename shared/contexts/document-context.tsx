"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { DocumentWithStatus, DOCUMENT_TYPES, Document } from "../types/documents"
import { useQueryClient, useMutation, useQuery } from '@tanstack/react-query'
import { toast } from "../components/ui/use-toast"
import { Job, Assessment } from "../types/jobs"
import { documentService } from "../services/documentService"
import { jobService } from "../services/jobService"

interface DocumentContextType {
  documents: DocumentWithStatus[]
  isLoading: boolean
  error: string | null
  uploadDocument: (jobId: string, docId: string, file: File) => Promise<void>
  removeDocument: (jobId: string, docId: string) => Promise<void>
  downloadDocument: (jobId: string, docId: string) => Promise<void>
}

const DocumentContext = createContext<DocumentContextType | undefined>(undefined)

interface DocumentProviderProps {
  children: ReactNode
  jobId: string
}

export function DocumentProvider({ children, jobId }: DocumentProviderProps) {
  const queryClient = useQueryClient()

  // Use React Query for document data
  const { data: documents = [], isLoading, error } = useQuery<DocumentWithStatus[], Error>({
    queryKey: ['documents', jobId],
    queryFn: async () => {
      try {
        console.log('Fetching documents for job:', jobId)
        const [jobDocuments, job] = await Promise.all([
          documentService.getDocuments(jobId),
          jobService.getJob(jobId)
        ])

        // Initialize documents map
        const docsMap = new Map<string, DocumentWithStatus>()

        // 1. Initialize base documents first
        const baseDocuments = DOCUMENT_TYPES.filter(doc =>
          ['certificate-of-title', '10-7-certificate', 'survey-plan'].includes(doc.id)
        )

        baseDocuments.forEach(docType => {
          docsMap.set(docType.id, {
            ...docType,
            status: 'pending',
            uploadedFile: undefined
          })
        })

        // 2. Add all uploaded documents, regardless of type
        jobDocuments.forEach((doc: Document) => {
          const docType = DOCUMENT_TYPES.find(dt => dt.id === doc.id) || {
            id: doc.id,
            title: doc.title,
            category: 'GENERAL',
            path: `/${doc.id}`,
            type: 'document',
            versions: [],
            currentVersion: 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isActive: true
          }

          docsMap.set(doc.id, {
            ...docType,
            status: 'uploaded',
            uploadedFile: {
              filename: doc.versions[doc.currentVersion - 1].filename,
              originalName: doc.versions[doc.currentVersion - 1].originalName,
              type: doc.versions[doc.currentVersion - 1].type,
              uploadedAt: doc.versions[doc.currentVersion - 1].uploadedAt,
              size: doc.versions[doc.currentVersion - 1].size
            }
          })
        })

        // 3. Add assessment documents if they've been purchased and aren't already in the map
        const assessmentDocuments = DOCUMENT_TYPES.filter(doc =>
          ['custom-assessment', 'statement-of-environmental-effects', 'complying-development-certificate'].includes(doc.id)
        )

        assessmentDocuments.forEach(docType => {
          if (!docsMap.has(docType.id)) {
            const assessmentKey = docType.id.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
            const assessment = job[assessmentKey as keyof Job]

            if (assessment && typeof assessment === 'object' && 'status' in assessment) {
              const typedAssessment = assessment as Assessment
              if (typedAssessment.status === 'paid' || typedAssessment.status === 'completed') {
                docsMap.set(docType.id, {
                  ...docType,
                  status: typedAssessment.filename ? 'uploaded' : 'pending',
                  uploadedFile: typedAssessment.filename ? {
                    filename: typedAssessment.filename,
                    originalName: typedAssessment.originalName || typedAssessment.filename,
                    type: typedAssessment.type || 'application/pdf',
                    uploadedAt: typedAssessment.uploadedAt || new Date().toISOString(),
                    size: typedAssessment.size || 0
                  } : undefined
                })
              }
            }
          }
        })

        const finalDocuments = Array.from(docsMap.values())
        console.log('Processed documents:', {
          total: finalDocuments.length,
          uploaded: finalDocuments.filter((d: DocumentWithStatus) => d.status === 'uploaded').length,
          pending: finalDocuments.filter((d: DocumentWithStatus) => d.status === 'pending').length,
          types: finalDocuments.map(d => d.id).join(', ')
        })

        return finalDocuments
      } catch (error) {
        console.error('Error fetching documents:', error)
        throw error
      }
    }
  })

  // Upload document mutation
  const uploadDocumentMutation = useMutation({
    mutationFn: async ({ jobId, docId, file }: { jobId: string; docId: string; file: File }) => {
      return documentService.uploadDocument({
        file,
        type: 'document',
        jobId,
        metadata: {
          title: file.name,
          category: 'REPORTS'
        }
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', jobId] })
      toast({
        title: "Success",
        description: "Document uploaded successfully",
      })
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  })

  // Remove document mutation
  const removeDocumentMutation = useMutation({
    mutationFn: async ({ jobId, docId }: { jobId: string; docId: string }) => {
      return documentService.removeDocument(docId, jobId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', jobId] })
      toast({
        title: "Success",
        description: "Document removed successfully",
      })
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  })

  const uploadDocument = async (jobId: string, docId: string, file: File) => {
    await uploadDocumentMutation.mutateAsync({ jobId, docId, file })
  }

  const removeDocument = async (jobId: string, docId: string) => {
    await removeDocumentMutation.mutateAsync({ jobId, docId })
  }

  const downloadDocument = async (jobId: string, docId: string) => {
    try {
      const blob = await documentService.downloadDocument(docId, jobId)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = docId
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to download document",
        variant: "destructive",
      })
    }
  }

  return (
    <DocumentContext.Provider
      value={{
        documents,
        isLoading,
        error: error?.message || null,
        uploadDocument,
        removeDocument,
        downloadDocument
      }}
    >
      {children}
    </DocumentContext.Provider>
  )
}

export function useDocuments() {
  const context = useContext(DocumentContext)
  if (context === undefined) {
    throw new Error('useDocuments must be used within a DocumentProvider')
  }
  return context
}
