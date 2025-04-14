import { ReactNode } from "react"

export interface DocumentVersion {
  version: number
  uploadedAt: string
  updatedAt?: string // Added for version history
  filename: string
  originalName: string
  size: number
  uploadedBy: string
}

export interface Document {
  description: ReactNode
  id: string
  title: string
  path: string // Where the document should appear in the app (e.g., '/initial-assessment/pre-prepared')
  value?: string // Added for compatibility with assessment types
  type: string
  category: string
  versions: DocumentVersion[]
  currentVersion: number
  createdAt: string
  updatedAt: string
  isActive: boolean
  required?: boolean
  adminOnly?: boolean
  uploadedAt?: string
  fileName?: string
  size?: number
}

export interface PrePreparedAssessment {
  id: string
  title: string
  description: string
  file: string
  documentId: string // Reference to the document in the document store
  version: number // Current version of the document
  path: string // Path where the assessment should appear
}

export interface InitialAssessment {
  jobId: string
  uploadedDocuments: Record<string, boolean>
  selectedTab: string
  createdAt: string
  updatedAt: string
  status?: 'pending' | 'completed' | 'paid'
  purchasedAssessment?: {
    id: string
    documentId: string
    version: number
  }
}

export const DOCUMENT_TYPES: Document[] = [
  {
    id: 'certificate-of-title',
    title: 'Certificate of Title',
    category: 'LEGAL',
    path: '/initial-assessment/required-documents',
    required: false,
    type: 'document',
    versions: [],
    currentVersion: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true,
    description: undefined
  },
  {
    id: '10-7-certificate',
    title: '10.7 Certificate',
    category: 'PLANNING',
    path: '/initial-assessment/required-documents',
    required: true,
    type: 'document',
    versions: [],
    currentVersion: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true,
    description: undefined
  },
  {
    id: 'survey-plan',
    title: 'Survey Plan',
    category: 'TECHNICAL',
    path: '/initial-assessment/required-documents',
    required: false,
    type: 'document',
    versions: [],
    currentVersion: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true,
    description: undefined
  },
  {
    id: 'initial-assessment-report',
    title: 'Initial Assessment Report',
    category: 'REPORTS',
    path: '/initial-assessment/pre-prepared',
    adminOnly: true,
    type: 'document',
    versions: [],
    currentVersion: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true,
    description: undefined
  }
]
