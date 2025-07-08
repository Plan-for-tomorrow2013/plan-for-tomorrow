import { Assessment, ConsultantCategory } from '@shared/types/jobs'

export type { ConsultantCategory }
export interface ConsultantTicket {
  id: string
  jobId: string
  jobAddress: string
  category: ConsultantCategory
  status: 'pending' | 'in-progress' | 'paid' | 'completed'
  createdAt: string
  completedDocument?: {
    fileName: string
    originalName?: string
    uploadedAt: string
    returnedAt?: string
  }
  assessment?: Assessment
  documents?: Array<{ id: string; name: string }>
  consultantId: string
  consultantName: string
}
