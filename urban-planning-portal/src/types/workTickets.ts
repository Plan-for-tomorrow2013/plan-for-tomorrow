export interface WorkTicket {
  id: string
  jobId: string
  jobAddress: string
  ticketType: 'custom-assessment' | 'statement-of-environmental-effects' | 'complying-development-certificate'
  status: 'pending' | 'in-progress' | 'completed'
  createdAt: string
  completedDocument?: {
    fileName: string
    uploadedAt: string
    returnedAt?: string
  }
  customAssessment?: {
    developmentType: string
    additionalInfo: string
    documents: {
      savedPath?: string
    }
  }
  statementOfEnvironmentalEffects?: {
    developmentType: string
    additionalInfo: string
    documents: {
      savedPath?: string
    }
  }
  complyingDevelopmentCertificate?: {
    developmentType: string
    additionalInfo: string
    documents: {
      savedPath?: string
    }
  }
}
