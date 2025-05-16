"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { DocumentWithStatus, DOCUMENT_TYPES, Document } from "../types/documents"
import { useQueryClient, useMutation, useQuery } from '@tanstack/react-query'
import { toast } from "../components/ui/use-toast"
import { Job, Assessment } from "../types/jobs"
import { documentService } from "../services/documentService"
import { jobService } from "../services/jobService"
import { getDocumentDisplayStatus } from "@shared/utils/report-utils"

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
    queryKey: ['jobDocuments', jobId], // Changed queryKey to reflect source
    queryFn: async () => {
      try {
        console.log('Fetching job data for document status, job:', jobId)
        // Fetch ONLY the job data
        const job = await jobService.getJob(jobId)
        if (!job) {
          console.error('Job not found for document context:', jobId)
          return [] // Return empty array if job doesn't exist
        }

        // --- New Logic: Filter and Process Documents ---
        const displayableDocuments: DocumentWithStatus[] = []

        DOCUMENT_TYPES.forEach(docType => {
          let shouldDisplay = false
          let assessmentData: Assessment | undefined | null = null

          if (docType.purchasable) {
            // For purchasable documents, check job assessment status
            const assessmentKey = docType.id.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase()) as keyof Job;
            assessmentData = job[assessmentKey] as Assessment | undefined;

            if (assessmentData && (assessmentData.status === 'paid' || assessmentData.status === 'completed')) {
              shouldDisplay = true
            }
          } else {
            // Standard documents always display
            shouldDisplay = true
          }

          if (shouldDisplay) {
            let displayStatus: DocumentWithStatus['displayStatus'] = 'pending_user_upload' // Default for standard
            let uploadedFile: DocumentWithStatus['uploadedFile'] = undefined

            // Check job.documents first (primary source for uploaded files)
            const jobDocData = job.documents?.[docType.id];
            // Try to get fileName from assessmentData.fileName OR assessmentData.completedDocument.fileName
            let assessmentFileName = assessmentData?.fileName;
            if (!assessmentFileName && assessmentData?.completedDocument) {
              assessmentFileName = (assessmentData.completedDocument as any)?.fileName;
            }

            if (jobDocData && jobDocData.fileName) {
              displayStatus = 'uploaded'
              uploadedFile = {
                fileName: jobDocData.fileName,
                originalName: jobDocData.originalName,
                type: jobDocData.type,
                uploadedAt: jobDocData.uploadedAt,
                size: jobDocData.size
              }
            } else if (assessmentFileName && docType.purchasable) {
              // Check assessment data for fileName if purchasable and not in job.documents
              displayStatus = 'uploaded'
              uploadedFile = {
                fileName: assessmentFileName,
                originalName: assessmentData?.originalName || assessmentFileName,
                type: assessmentData?.type || 'application/pdf',
                uploadedAt: assessmentData?.uploadedAt || new Date().toISOString(),
                size: assessmentData?.size || 0
              }
            } else if (docType.purchasable) {
              // Purchasable, paid/completed, but no file yet
              displayStatus = 'pending_admin_delivery'
            }
            // Otherwise, it remains 'pending_user_upload' for standard docs

            // Now, determine the displayStatus based on whether an uploadedFile was found
            if (uploadedFile) {
              displayStatus = 'uploaded';
            } else if (docType.purchasable && assessmentData && (assessmentData.status === 'paid' || assessmentData.status === 'completed')) {
              displayStatus = 'pending_admin_delivery';
            }
            // else it remains 'pending_user_upload'

            // Construct the document object that will be passed to getDocumentDisplayStatus
            // AND will be part of the final displayableDocuments array.
            const currentProcessedDoc: DocumentWithStatus = {
              ...docType,
              uploadedFile: uploadedFile, // uploadedFile is now part of this object
              displayStatus: displayStatus, // This is the status *before* getDocumentDisplayStatus potentially refines it
              // Ensure all other required fields for DocumentWithStatus are present
              description: docType.description || '',
              versions: docType.versions || [],
              currentVersion: docType.currentVersion || 1,
              createdAt: docType.createdAt || new Date().toISOString(),
              updatedAt: docType.updatedAt || new Date().toISOString(),
              isActive: docType.isActive !== undefined ? docType.isActive : true,
            };

            // Get the final display status
            const finalDisplayStatus = getDocumentDisplayStatus(currentProcessedDoc, job);

            displayableDocuments.push({
              ...currentProcessedDoc, // Use the object that already has uploadedFile
              displayStatus: finalDisplayStatus, // Override with the result from getDocumentDisplayStatus
            });
          }
        })
        // --- End New Logic ---

        console.log('Processed documents for display:', displayableDocuments)

        return displayableDocuments
      } catch (error) {
        console.error('Error processing job data for documents:', error)
        // If jobService.getJob throws, it will be caught here
        throw new Error(`Failed to process job documents: ${error instanceof Error ? error.message : String(error)}`)
      }
    },
    refetchInterval: 5000, // Poll every 5 seconds
    refetchIntervalInBackground: true, // Continue polling even when tab is not active
  })

  // Upload document mutation
  const uploadDocumentMutation = useMutation({
    mutationFn: async ({ jobId, docId, file }: { jobId: string; docId: string; file: File }) => {
      // Call the refactored service method
      // No need to pass extensive metadata anymore, just what the service needs
      return documentService.uploadDocument({
        file,
        jobId,
        docId,
        type: 'document', // Add default type to satisfy DocumentUpload type
        // metadata is no longer needed by the refactored service method
      })
    },
    onSuccess: () => {
      // Invalidate the query using the new key
      queryClient.invalidateQueries({ queryKey: ['jobDocuments', jobId] })
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
      // Call the refactored service method
      return documentService.removeDocument(docId, jobId)
    },
    onSuccess: () => {
      // Invalidate the query using the new key
      queryClient.invalidateQueries({ queryKey: ['jobDocuments', jobId] })
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
    // Find the document in the current state to get the fileName
    // Updated to check displayStatus
    const docToDownload = documents.find(doc => doc.id === docId && doc.displayStatus === 'uploaded');
    const fileName = docToDownload?.uploadedFile?.originalName || docToDownload?.uploadedFile?.fileName || docId; // Use original name, fallback to stored fileName or docId

    if (!docToDownload) {
       toast({
         title: "Error",
         description: "Document not found or not available for download.",
         variant: "destructive",
       })
       return;
    }

    try {
      // Call the refactored service method, passing the fileName
      const blob = await documentService.downloadDocument(docId, jobId, fileName)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName // Use the determined fileName
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
