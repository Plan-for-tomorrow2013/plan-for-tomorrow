"use client"

import { createContext, useContext, type ReactNode } from "react"
import { DocumentWithStatus, DOCUMENT_TYPES } from "../types/consultants"
import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from "../components/ui/use-toast"
import { Job, Assessment, ConsultantCategory } from "../types/jobs"
import { jobService } from "../services/jobService"
import { getDocumentDisplayStatus } from "@shared/utils/consultant-report-utils"
import { consultantService } from "../services/consultantService"

interface ConsultantContextType {
  consultantDocuments: DocumentWithStatus[]
  isLoading: boolean
  error: string | null
  downloadDocument: (jobId: string, docId: string) => Promise<void>
}

const ConsultantContext = createContext<ConsultantContextType | undefined>(undefined)

interface ConsultantProviderProps {
  children: ReactNode
  jobId: string
}

export function ConsultantProvider({ children, jobId }: ConsultantProviderProps) {

  // Use React Query for consultant document data
  const { data: consultantDocuments = [], isLoading, error } = useQuery<DocumentWithStatus[], Error>({
    queryKey: ['consultantDocuments', jobId],
    queryFn: async () => {
      try {
        console.log('Fetching job data for consultant document status, job:', jobId)
        const job = await jobService.getJob(jobId)
        if (!job) {
          console.error('Job not found for consultant context:', jobId)
          return []
        }

        // --- Consultant Store Logic: Filter and Process Consultant Documents ---
        const displayableConsultantDocuments: DocumentWithStatus[] = []

        DOCUMENT_TYPES.forEach(docType => {
          let shouldDisplay = false
          let assessmentData: Assessment | undefined | null = null

          // Check for consultant documents
          if (job.consultants && docType.category) {
            const consultantInfo = job.consultants[docType.category as ConsultantCategory]?.[0];
            if (consultantInfo?.assessment?.completedDocument) {
              shouldDisplay = true;
              assessmentData = consultantInfo.assessment;
            }
          }

          if (shouldDisplay) {
            let displayStatus: DocumentWithStatus['displayStatus'] = 'pending_user_upload'
            let uploadedFile: DocumentWithStatus['uploadedFile'] = undefined

            // Check for consultant completed documents
            if (job.consultants && docType.category) {
              const consultantInfo = job.consultants[docType.category as ConsultantCategory]?.[0];
              if (consultantInfo?.assessment?.completedDocument?.returnedAt) {
                displayStatus = 'uploaded';
                uploadedFile = {
                  fileName: consultantInfo.assessment.completedDocument.fileName,
                  originalName: consultantInfo.assessment.completedDocument.originalName,
                  type: consultantInfo.assessment.completedDocument.type,
                  uploadedAt: consultantInfo.assessment.completedDocument.uploadedAt,
                  size: consultantInfo.assessment.completedDocument.size,
                  returnedAt: consultantInfo.assessment.completedDocument.returnedAt
                };

                // Update the quote request status in localStorage with consultant ID
                const consultantId = consultantInfo.consultantId;
                if (consultantId) {
                  const quoteRequestKey = `quoteRequest_${jobId}_${docType.category}_${consultantId}`;
                  localStorage.setItem(quoteRequestKey, 'completed');
                }
              }
            }

            // Construct the document object
            const currentProcessedDoc: DocumentWithStatus = {
              ...docType,
              uploadedFile: uploadedFile,
              displayStatus: displayStatus,
              description: docType.description || '',
              versions: docType.versions || [],
              currentVersion: docType.currentVersion || 1,
              createdAt: docType.createdAt || new Date().toISOString(),
              updatedAt: docType.updatedAt || new Date().toISOString(),
              isActive: docType.isActive !== undefined ? docType.isActive : true,
            };

            // Get the final display status
            const finalDisplayStatus = getDocumentDisplayStatus(currentProcessedDoc, job);

            displayableConsultantDocuments.push({
              ...currentProcessedDoc,
              displayStatus: finalDisplayStatus,
            });
          }
        })

        console.log('Processed consultant documents for display:', displayableConsultantDocuments)

        return displayableConsultantDocuments
      } catch (error) {
        console.error('Error processing job data for consultant documents:', error)
        throw new Error(`Failed to process consultant documents: ${error instanceof Error ? error.message : String(error)}`)
      }
    },
    refetchInterval: 5000, // Poll every 5 seconds
    refetchIntervalInBackground: true, // Continue polling even when tab is not active
  })

  // Download document mutation
  const downloadMutation = useMutation({
    mutationFn: async ({ jobId, docId }: { jobId: string; docId: string }) => {
      const docToDownload = consultantDocuments.find(doc => doc.id === docId && doc.displayStatus === 'uploaded');
      const fileName = docToDownload?.uploadedFile?.originalName || docToDownload?.uploadedFile?.fileName || docId;

      if (!docToDownload) {
        throw new Error("Document not found or not available for download.");
      }

      return consultantService.downloadDocument(docId, jobId, fileName);
    },
    onSuccess: (blob, { docId }) => {
      const docToDownload = consultantDocuments.find(doc => doc.id === docId && doc.displayStatus === 'uploaded');
      const fileName = docToDownload?.uploadedFile?.originalName || docToDownload?.uploadedFile?.fileName || docId;

      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to download document",
        variant: "destructive",
      })
    },
  })

  const downloadDocument = async (jobId: string, docId: string) => {
    await downloadMutation.mutateAsync({ jobId, docId })
  }

  const value: ConsultantContextType = {
    consultantDocuments,
    isLoading,
    error: error?.message || null,
    downloadDocument,
  }

  return (
    <ConsultantContext.Provider value={value}>
      {children}
    </ConsultantContext.Provider>
  )
}

export function useConsultants() {
  const context = useContext(ConsultantContext)
  if (context === undefined) {
    throw new Error('useConsultants must be used within a ConsultantProvider')
  }
  return context
}
