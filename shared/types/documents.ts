import { ReactNode } from "react"

export interface DocumentVersion {
  version: number
  uploadedAt: string
  updatedAt?: string
  fileName: string
  originalName: string
  size: number
  type: string
  uploadedBy?: string
}

export interface Document {
  id: string
  title: string
  path: string
  value?: string
  type: string
  category: string
  versions: DocumentVersion[]
  currentVersion: number
  createdAt: string
  updatedAt: string
  isActive: boolean
  adminOnly?: boolean
  purchasable?: boolean // Added purchasable flag
  uploadedAt?: string
  fileName?: string
  size?: number
  description?: ReactNode
  url?: string
  metadata?: {
    jobId?: string
    uploadedBy?: string
    title?: string
    description?: string
    category?: string
    path?: string
  }
  uploadedFile?: {
    fileName: string
    originalName: string
    type: string
    uploadedAt: string
    size: number
    returnedAt?: string
    savedPath?: string
  }
}

export interface Assessment {
  status?: 'paid' | 'completed';
  returnedAt?: string;
  fileName?: string;
  originalName?: string;
  type?: string;
  uploadedAt?: string;
  size?: number;
  developmentType?: string;
  additionalInfo?: string;
  createdAt?: string;
  updatedAt?: string;
  documents?: {
    certificateOfTitle?: { originalName?: string; fileName?: string };
    surveyPlan?: { originalName?: string; fileName?: string };
    certificate107?: { originalName?: string; fileName?: string };
    architecturalPlan?: { originalName?: string; fileName?: string };
  };
  purchasedAssessment?: {
    id: string;
    documentId: string;
    version: number;
  };
}

export interface CustomAssessment extends Assessment {
  jobId: string;
  uploadedDocuments: Record<string, boolean>;
  selectedTab: string;
}

export interface StatementOfEnvironmentalEffects extends Assessment {
  jobId: string;
  uploadedDocuments: Record<string, boolean>;
  selectedTab: string;
}

export interface ComplyingDevelopmentCertificate extends Assessment {
  jobId: string;
  uploadedDocuments: Record<string, boolean>;
  selectedTab: string;
}

export interface NathersAssessment extends Assessment {
  jobId: string;
  uploadedDocuments: Record<string, boolean>;
  selectedTab: string;
}

export interface WasteManagementAssessment extends Assessment {
  jobId: string;
  uploadedDocuments: Record<string, boolean>;
  selectedTab: string;
}

export interface PrePreparedAssessment {
  id: string;
  section: string;
  title: string;
  content: string;
  author: string;
  file?: {
    originalName: string;
    id: string;
  };
}

export interface DocumentUpload {
  file: File
  type: string
  jobId: string
  docId?: string // Add optional docId for updating existing placeholders
  metadata?: {
    title?: string
    description?: string
    category?: string
    path?: string
    uploadedBy?: string
  }
}

export interface DocumentDownload {
  documentId: string
  jobId: string
  version?: number
}

export interface DocumentRemove {
  documentId: string
  jobId: string
}

export interface DocumentWithStatus extends Document {
  // Renamed 'status' to 'displayStatus' and added new states
  displayStatus: 'uploaded' | 'pending_user_upload' | 'pending_admin_delivery'
  originalAssessmentId?: string; // Added to store the original assessment ID for pre-prepared items
  consultantId?: string; // Added to store the consultant ID for consultant-generated documents
  uploadedFile?: {
    fileName: string
    originalName: string
    type: string
    uploadedAt: string
    size: number
    returnedAt?: string
    savedPath?: string
  }
}

export interface DocumentMetadata {
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

export const DOCUMENT_TYPES: Document[] = [
  {
    id: 'certificateOfTitle',
    title: 'Certificate of Title',
    category: 'LEGAL',
    path: '/certificate-of-title',
    type: 'document',
    versions: [],
    currentVersion: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true,
    purchasable: false
  },
  {
    id: 'tenSevenCertificate',
    title: '10.7 Certificate',
    category: 'PLANNING',
    path: '/10-7-certificate',
    type: 'document',
    versions: [],
    currentVersion: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true,
    purchasable: false
  },
  {
    id: 'surveyPlan',
    title: 'Survey Plan',
    category: 'TECHNICAL',
    path: '/survey-plan',
    type: 'document',
    versions: [],
    currentVersion: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true,
    purchasable: false
  },
  {
    id: 'architecturalPlan',
    title: 'Architectural Plan',
    category: 'PLANNING',
    path: '/architectural-plan',
    type: 'document',
    versions: [],
    currentVersion: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true,
    purchasable: false
  },
  {
    id: 'customAssessment',
    title: 'Custom Assessment Report',
    category: 'REPORTS',
    path: '/custom-assessment',
    adminOnly: true,
    purchasable: true,
    type: 'document',
    versions: [],
    currentVersion: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true
  },
  {
    id: 'statementOfEnvironmentalEffects',
    title: 'Statement of Environmental Effects',
    category: 'REPORTS',
    path: '/statement-of-environmental-effects',
    adminOnly: true,
    purchasable: true,
    type: 'document',
    versions: [],
    currentVersion: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true
  },
  {
    id: 'complyingDevelopmentCertificate',
    title: 'Complying Development Certificate',
    category: 'REPORTS',
    path: '/complying-development-certificate',
    adminOnly: true,
    purchasable: true,
    type: 'document',
    versions: [],
    currentVersion: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true
  },
  {
    id: 'wasteManagementAssessment',
    title: 'Waste Management Assessment',
    category: 'REPORTS',
    path: '/waste-management-assessment',
    adminOnly: true,
    purchasable: true,
    type: 'document',
    versions: [],
    currentVersion: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true
  },
  {
    id: 'nathersAssessment',
    title: 'Nathers Assessment',
    category: 'REPORTS',
    path: '/nathers-assessment',
    adminOnly: true,
    purchasable: true,
    type: 'document',
    versions: [],
    currentVersion: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true
  },
  {
    id: 'soee',
    title: 'Statement of Environmental Effects',
    category: 'PLANNING',
    path: '/soee',
    type: 'document',
    versions: [],
    currentVersion: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true,
    purchasable: false
  }
]

export interface DocumentRouteParams {
  id: string
  documentId?: string
  jobId?: string
  version?: number
}

export interface DocumentUploadResponse {
  success: boolean
  document?: Document
  error?: string
}

export interface DocumentDownloadResponse {
  success: boolean
  file?: Blob
  error?: string
}

export interface DocumentRemoveResponse {
  success: boolean
  error?: string
}
