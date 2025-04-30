import { ReactNode } from "react"
import { Assessment, CustomAssessment, StatementOfEnvironmentalEffects, ComplyingDevelopmentCertificate, DocumentWithStatus, PrePreparedAssessment } from '@shared/types/documents'

export interface DocumentVersion {
  version: number
  uploadedAt: string
  updatedAt?: string
  filename: string
  originalName: string
  size: number
  uploadedBy: string
}

export interface Document {
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
  required?: boolean
  adminOnly?: boolean
  uploadedAt?: string
  fileName?: string
  size?: number
  description?: ReactNode
  requiredStatus?: 'uploaded' | 'pending' | 'required'
  uploadedFile?: {
    filename: string
    originalName: string
    type: string
    uploadedAt: string
    size: number
    returnedAt?: string
    savedPath?: string
  }
}

export type { Assessment, CustomAssessment, StatementOfEnvironmentalEffects, ComplyingDevelopmentCertificate, DocumentWithStatus, PrePreparedAssessment }

export interface AssessmentDocument {
  id: string
  name: string
  description: string
  path: string
  required: boolean
  type: 'document' | 'custom-assessment' | 'statement-of-environmental-effects' | 'complying-development-certificate'
  category: string
}

export const DOCUMENT_TYPES: Document[] = [
  {
    id: 'certificate-of-title',
    title: 'Certificate of Title',
    path: '/certificate-of-title',
    type: 'document',
    category: 'LEGAL',
    versions: [],
    currentVersion: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true,
    required: false
  },
  {
    id: '10-7-certificate',
    title: '10.7 Certificate',
    path: '/10-7-certificate',
    type: 'document',
    category: 'PLANNING',
    versions: [],
    currentVersion: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true,
    required: true
  },
  {
    id: 'survey-plan',
    title: 'Survey Plan',
    path: '/survey-plan',
    type: 'document',
    category: 'TECHNICAL',
    versions: [],
    currentVersion: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true,
    required: false
  },
  {
    id: 'custom-assessment',
    title: 'Custom Assessment Report',
    path: '/custom-assessment',
    type: 'document',
    category: 'REPORTS',
    versions: [],
    currentVersion: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true,
    required: false
  },
  {
    id: 'statement-of-environmental-effects',
    title: 'Statement of Environmental Effects',
    path: '/statement-of-environmental-effects',
    type: 'document',
    category: 'REPORTS',
    versions: [],
    currentVersion: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true,
    required: false
  },
  {
    id: 'complying-development-certificate',
    title: 'Complying Development Certificate',
    path: '/complying-development-certificate',
    type: 'document',
    category: 'REPORTS',
    versions: [],
    currentVersion: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true,
    required: false
  }
]
