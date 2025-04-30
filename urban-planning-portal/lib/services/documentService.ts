import { Document, DocumentVersion, DocumentMetadata, DocumentUpload, DocumentDownload, DocumentRemove } from '../../../shared/types/documents'

class DocumentService {
  private static instance: DocumentService
  private documents: Map<string, DocumentMetadata> = new Map()

  private constructor() {}

  static getInstance(): DocumentService {
    if (!DocumentService.instance) {
      DocumentService.instance = new DocumentService()
    }
    return DocumentService.instance
  }

  async getDocuments(): Promise<Document[]> {
    try {
      const response = await fetch('/api/documents')
      if (!response.ok) throw new Error('Failed to fetch documents')
      return await response.json()
    } catch (error) {
      console.error('Error fetching documents:', error)
      return []
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
        ...upload.metadata
      }))

      const response = await fetch('/api/documents', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) throw new Error('Failed to upload document')
      return await response.json()
    } catch (error) {
      console.error('Error uploading document:', error)
      throw error
    }
  }

  async downloadDocument(download: DocumentDownload): Promise<Blob> {
    try {
      const response = await fetch(`/api/documents/${download.documentId}/download?jobId=${download.jobId}&version=${download.version || 'latest'}`)
      if (!response.ok) throw new Error('Failed to download document')
      return await response.blob()
    } catch (error) {
      console.error('Error downloading document:', error)
      throw error
    }
  }

  async removeDocument(remove: DocumentRemove): Promise<void> {
    try {
      const response = await fetch(`/api/documents/${remove.documentId}?jobId=${remove.jobId}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to remove document')
    } catch (error) {
      console.error('Error removing document:', error)
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
