import { Assessment } from '@shared/types/jobs'

export interface WorkTicket {
  id: string
  jobId: string
  jobAddress: string
  ticketType: 'custom-assessment' | 'statement-of-environmental-effects' | 'complying-development-certificate' // Added statement-of-environmental-effects
  status: 'pending' | 'in-progress' | 'completed'
  createdAt: string
  completedDocument?: {
    fileName: string
    originalName: string; // Added original filename
    uploadedAt: string
    returnedAt?: string
  }
  customAssessment?: Assessment
  statementOfEnvironmentalEffects?: Assessment
  complyingDevelopmentCertificate?: Assessment
}
