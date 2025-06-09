import { Assessment } from './jobs'

export interface WorkTicket {
  id: string
  jobId: string
  jobAddress: string
  ticketType: 'custom-assessment' | 'statement-of-environmental-effects' | 'complying-development-certificate' | 'waste-management-assessment'
  status: 'pending' | 'in-progress' | 'completed'
  createdAt: string
  completedDocument?: {
    fileName: string
    originalName?: string
    uploadedAt: string
    returnedAt?: string
  }
  customAssessment?: Assessment
  statementOfEnvironmentalEffects?: Assessment
  complyingDevelopmentCertificate?: Assessment
  wasteManagementAssessment?: Assessment
}
