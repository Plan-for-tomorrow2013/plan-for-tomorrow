import { WorkTicket } from '../../../../types/workTickets'

export interface PrePreparedAssessmentProps {
  selectedJobId: string
  jobAddress: string
}

export interface PrePreparedAssessment {
  id: string
  label: string
  description: string
  documentId: string
  ticket?: WorkTicket
}
