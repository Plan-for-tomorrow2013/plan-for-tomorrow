import { Document } from '../../src/types/documents'

interface DocumentVersion {
  version: number
  uploadedAt: string
  filename: string
  originalName: string
  size: number
  uploadedBy: string
}

interface DocumentMetadata {
  id: string
  title: string
  path: string
  type: string
  category: string
  versions: DocumentVersion[]
  currentVersion: number
  createdAt: string
  updatedAt: string
  isActive: boolean
  uploadedBy?: string
}

class DocumentService {
  uploadFile(file: File): Promise<Document> {
    throw new Error("Method not implemented.")
  }
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

  async uploadDocument(file: File, metadata: Partial<DocumentMetadata>): Promise<Document> {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('metadata', JSON.stringify(metadata))

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

  async updateDocument(id: string, file: File, metadata: Partial<DocumentMetadata>): Promise<Document> {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('metadata', JSON.stringify(metadata))

      const response = await fetch(`/api/documents/${id}`, {
        method: 'PUT',
        body: formData,
      })

      if (!response.ok) throw new Error('Failed to update document')
      return await response.json()
    } catch (error) {
      console.error('Error updating document:', error)
      throw error
    }
  }

  async deleteDocument(id: string): Promise<void> {
    try {
      const response = await fetch(`/api/documents/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete document')
    } catch (error) {
      console.error('Error deleting document:', error)
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
