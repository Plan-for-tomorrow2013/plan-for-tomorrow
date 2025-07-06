import { Assessment, ConsultantCategory } from '@shared/types/jobs'

export type { ConsultantCategory }
export interface ConsultantWorkOrder {
  id: string
  jobId: string
  jobAddress: string
  category: ConsultantCategory
  status: 'pending' | 'in-progress' | 'completed'
  createdAt: string
  acceptedAt?: string
  quoteTicketId?: string // Reference to the original quote ticket
  completedDocument?: {
    fileName: string
    originalName?: string
    uploadedAt: string
    returnedAt?: string
  }
  invoice?: {
    fileName: string
    originalName?: string
    uploadedAt: string
    returnedAt?: string
  }
  assessment?: Assessment
  documents?: Array<{ id: string; name: string }>
  consultantId: string
  consultantName: string
  quoteAmount?: number // Amount from the accepted quote
}
