import { Job } from '@shared/types/jobs'
import { DocumentWithStatus } from '@shared/types/documents'
import { Assessment } from '@shared/types/jobs'

export type ReportType = 'custom-assessment' | 'statement-of-environmental-effects' | 'complying-development-certificate'

export interface ReportStatus {
  isPaid: boolean
  isCompleted: boolean
  isUploaded: boolean
  hasFile: boolean
  reportData: Assessment | null
}

export const getReportStatus = (doc: DocumentWithStatus, job: Job): ReportStatus => {
  const reportData = getReportData(doc, job);
  const status = reportData?.status;
  const hasFile = Boolean(reportData?.filename || reportData?.originalName);

  return {
    isPaid: status === 'paid',
    isCompleted: status === 'completed',
    isUploaded: hasFile,
    hasFile,
    reportData: reportData || null
  };
};

export const getReportData = (doc: DocumentWithStatus, job: Job): Assessment | null => {
  const data = doc.id === 'statement-of-environmental-effects' ? job.statementOfEnvironmentalEffects :
               doc.id === 'complying-development-certificate' ? job.complyingDevelopmentCertificate :
               doc.id === 'custom-assessment' ? job.customAssessment :
               null;
  return data || null;
};

export function isReportType(docId: string): boolean {
  return ['custom-assessment', 'statement-of-environmental-effects', 'complying-development-certificate'].includes(docId)
}

export function getReportTitle(docId: string): string {
  switch (docId) {
    case 'statement-of-environmental-effects':
      return 'Statement of Environmental Effects'
    case 'complying-development-certificate':
      return 'Complying Development Certificate'
    case 'custom-assessment':
      return 'Custom Assessment'
    default:
      return ''
  }
}
