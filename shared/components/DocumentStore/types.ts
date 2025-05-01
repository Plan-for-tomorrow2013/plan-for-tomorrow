import { Document } from '../../types/documents'

export interface DocumentStoreBaseProps {
  title?: string
  description?: string
  className?: string
}

export interface ManagedDocumentStoreProps extends DocumentStoreBaseProps {
  onDocumentSelect?: (document: Document) => void
}

export interface ControlledDocumentStoreProps extends DocumentStoreBaseProps {
  documents: Document[]
  onUpload?: (document: Document) => void
  onDelete?: (documentId: string) => void
  jobId: string
}
