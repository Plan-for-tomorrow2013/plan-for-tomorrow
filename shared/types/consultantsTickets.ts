import { Assessment, ConsultantCategory } from './jobs'

export interface ConsultantTicket {
  id: string
  jobId: string
  jobAddress: string
  category: ConsultantCategory
  status: 'pending' | 'in-progress' | 'completed'
  createdAt: string
  completedDocument?: {
    fileName: string
    originalName?: string
    uploadedAt: string
    returnedAt?: string
  }
  assessment?: Assessment
}
