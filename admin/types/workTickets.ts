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
  customAssessment?: {
    developmentType: string
    additionalInfo: string
    documents: {
      certificateOfTitle?: { originalName?: string; filename?: string };
      surveyPlan?: { originalName?: string; filename?: string };
      certificate107?: { originalName?: string; filename?: string };
    }
  }
  statementOfEnvironmentalEffects?: {
    developmentType: string
    additionalInfo: string
    documents: {
      certificateOfTitle?: { originalName?: string; filename?: string };
      surveyPlan?: { originalName?: string; filename?: string };
      certificate107?: { originalName?: string; filename?: string };
    }
  }
  complyingDevelopmentCertificate?: {
    developmentType: string
    additionalInfo: string
    documents: {
      certificateOfTitle?: { originalName?: string; filename?: string };
      surveyPlan?: { originalName?: string; filename?: string };
      certificate107?: { originalName?: string; filename?: string };
    }
  }
}
