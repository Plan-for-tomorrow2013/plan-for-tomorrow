import { Document, DocumentVersion, DocumentMetadata, DocumentUpload, DocumentDownload, DocumentRemove } from '../types/documents'
import path from 'path'
import { mkdir, readFile, writeFile, unlink } from 'fs/promises'
import { v4 as uuidv4 } from 'uuid'

class ConsultantService {
  private static instance: ConsultantService
  private constructor() {}

  static getInstance(): ConsultantService {
    if (!ConsultantService.instance) {
      ConsultantService.instance = new ConsultantService()
    }
    return ConsultantService.instance
  }

  // Downloads a document provided by a consultant.
  async downloadDocument(documentId: string, jobId: string, fileName: string): Promise<Blob> {
    try {
      // This endpoint is generic for now and can fetch any document by its ID within a job.
      const response = await fetch(`/api/jobs/${jobId}/documents/${documentId}/download`)
      if (!response.ok) {
        let errorMessage = `Failed to download document (status: ${response.status})`
        try {
          const errorBody = await response.json()
          errorMessage = errorBody.error || errorMessage
        } catch (e) {
          // Ignore JSON parsing error if response body isn't valid JSON
        }
        throw new Error(errorMessage)
      }
      return response.blob()
    } catch (error) {
      console.error('Error downloading document:', error)
      throw error
    }
  }
}

export const consultantService = ConsultantService.getInstance()

export type { Document }
