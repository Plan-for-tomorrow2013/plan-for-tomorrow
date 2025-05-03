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

  async getDocuments(jobId?: string): Promise<Document[]> {
    try {
      const response = await fetch('/api/documents')
      if (!response.ok) throw new Error('Failed to fetch documents')
      const documents = await response.json()

      if (jobId) {
        return documents.filter((doc: Document) => doc.metadata?.jobId === jobId)
      }

      return documents
    } catch (error) {
      console.error('Error getting documents:', error)
      throw error
    }
  }

  async getDocumentById(id: string): Promise<Document | null> {
    try {
      const response = await fetch(`/api/documents/${id}`)
      if (!response.ok) throw new Error('Failed to fetch document')
      return await response.json()
    } catch (error) {
      console.error('Error fetching document:', error)
      return null
    }
  }

  async uploadDocument(upload: DocumentUpload): Promise<Document> {
    try {
      const formData = new FormData()
      formData.append('file', upload.file)
      formData.append('metadata', JSON.stringify({
        type: upload.type,
        jobId: upload.jobId,
        title: upload.metadata?.title || upload.file.name,
        category: upload.metadata?.category || 'general',
        path: upload.metadata?.path || '',
        uploadedBy: upload.metadata?.uploadedBy || 'system'
      }))

      const response = await fetch('/api/documents', {
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

  async removeDocument(documentId: string, jobId: string): Promise<void> {
    try {
      const response = await fetch(`/api/documents?documentId=${documentId}&jobId=${jobId}`, {
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

  async downloadDocument(documentId: string, jobId: string): Promise<Blob> {
    try {
      const response = await fetch(`/api/documents/${documentId}/download?jobId=${jobId}`)
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to download document')
      }
      return response.blob()
    } catch (error) {
      console.error('Error downloading document:', error)
      throw error
    }
  }

  async getDocumentVersion(id: string, version: number): Promise<DocumentVersion | null> {
    try {
      const response = await fetch(`/api/documents/${id}/versions/${version}`)
      if (!response.ok) throw new Error('Failed to fetch document version')
      return await response.json()
    } catch (error) {
      console.error('Error fetching document version:', error)
      return null
    }
  }

  async getDocumentVersions(id: string): Promise<DocumentVersion[]> {
    try {
      const response = await fetch(`/api/documents/${id}/versions`)
      if (!response.ok) throw new Error('Failed to fetch document versions')
      return await response.json()
    } catch (error) {
      console.error('Error fetching document versions:', error)
      return []
    }
  }
}

export const documentService = DocumentService.getInstance()

export type { Document }
