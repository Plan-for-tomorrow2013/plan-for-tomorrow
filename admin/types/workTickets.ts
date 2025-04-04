export interface WorkTicket {
  id: string
  jobId: string
  jobAddress: string
  ticketType: 'custom-assessment' | 'pre-prepared-assessment'
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
      certificateOfTitle?: string
      surveyPlan?: string
      certificate107?: string
    }
  }
  prePreparedAssessment?: {
    assessmentType: string
    documentId: string
  }
} 