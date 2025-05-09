import { Document, DocumentVersion, DocumentMetadata, DocumentUpload, DocumentDownload, DocumentRemove } from '../types/documents'
import path from 'path'
import { mkdir, readFile, writeFile, unlink } from 'fs/promises'
import { v4 as uuidv4 } from 'uuid'

class DocumentService {
  private static instance: DocumentService
  private constructor() {}

  static getInstance(): DocumentService {
    if (!DocumentService.instance) {
      DocumentService.instance = new DocumentService()
    }
    return DocumentService.instance
  }

  // Removed getDocuments - will be derived from job data in context
  // Removed getDocumentById - will be derived from job data in context

  async uploadDocument(upload: DocumentUpload): Promise<any> { // Return type might need adjustment based on actual API response
    if (!upload.jobId || !upload.docId) {
      throw new Error('Job ID and Document ID are required for upload.');
    }
    try {
      const formData = new FormData()
      formData.append('file', upload.file)
      formData.append('docId', upload.docId) // Send docId directly

      // Metadata is no longer sent in the body for this endpoint
      // const metadata: any = { ... }
      // formData.append('metadata', JSON.stringify(metadata))

      const response = await fetch(`/api/jobs/${upload.jobId}/documents/upload`, { // Use job-specific endpoint
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to upload document')
      }

      return response.json()
    } catch (error) {
      console.error('Error uploading document:', error)
      throw error
    }
  }

  // TODO: Implement corresponding API endpoint: DELETE /api/jobs/[jobId]/documents/[documentId]
  async removeDocument(documentId: string, jobId: string): Promise<void> {
    try {
      // Use job-specific endpoint structure
      const response = await fetch(`/api/jobs/${jobId}/documents/${documentId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to remove document')
      }
    } catch (error) {
      console.error('Error removing document:', error)
      throw error
    }
  }

  // TODO: Implement corresponding API endpoint: GET /api/jobs/[jobId]/documents/[documentId]/download
  async downloadDocument(documentId: string, jobId: string, filename: string): Promise<Blob> { // Added filename for potential use
    try {
      // Use job-specific endpoint structure (filename might be needed for Content-Disposition)
      const response = await fetch(`/api/jobs/${jobId}/documents/${documentId}/download`)
      if (!response.ok) {
        // Attempt to read error message, but handle cases where it might not be JSON
        let errorMessage = `Failed to download document (status: ${response.status})`;
        try {
            const errorBody = await response.json();
            errorMessage = errorBody.error || errorMessage;
        } catch (e) {
            // Ignore JSON parsing error if response body isn't valid JSON
        }
        throw new Error(errorMessage);
      }
      return response.blob()
    } catch (error) {
      console.error('Error downloading document:', error)
      throw error
    }
  }

  // Removed getDocumentVersion - Versioning is handled differently now (or removed)
  // Removed getDocumentVersions - Versioning is handled differently now (or removed)
}

export const documentService = DocumentService.getInstance()

export type { Document }
