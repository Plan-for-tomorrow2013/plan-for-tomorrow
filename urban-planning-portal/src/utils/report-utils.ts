import { Job } from '@shared/types/jobs'
import { DocumentWithStatus } from '@shared/types/documents'
import { Assessment } from '@shared/types/jobs'

export type ReportType = 'custom-assessment' | 'statement-of-environmental-effects' | 'complying-development-certificate' | 'waste-management-assessment' | 'nathers-assessment'

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
  const hasFile = Boolean(reportData?.fileName || reportData?.originalName);

  return {
    isPaid: status === 'paid' || status === 'completed',
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
               doc.id === 'waste-management-assessment' ? job.wasteManagementAssessment :
               doc.id === 'nathers-assessment' ? job.nathersAssessment :
               null;
  return data || null;
};

export function isReportType(docId: string): boolean {
  return ['custom-assessment', 'statement-of-environmental-effects', 'complying-development-certificate', 'waste-management-assessment', 'nathers-assessment'].includes(docId)
}

export function getReportTitle(docId: string): string {
  switch (docId) {
    case 'statement-of-environmental-effects':
      return 'Statement of Environmental Effects'
    case 'complying-development-certificate':
      return 'Complying Development Certificate'
    case 'custom-assessment':
      return 'Custom Assessment'
    case 'waste-management-assessment':
      return 'Waste Management Assessment'
    case 'nathers-assessment':
      return 'Nathers Assessment'
    default:
      return ''
  }
}

/**
 * Returns the display status for a document, unifying logic for standard and paid (report) documents.
 * - 'uploaded': The document has an uploaded file.
 * - 'pending_user_upload': The user needs to upload the document (standard docs only).
 * - 'pending_admin_delivery': The report is paid for but not yet delivered (paid reports only).
 */
export function getDocumentDisplayStatus(doc: DocumentWithStatus, job: Job): 'uploaded' | 'pending_user_upload' | 'pending_admin_delivery' {
  // 1. If the document has an uploaded file, it's uploaded
  if (doc.uploadedFile) return 'uploaded';

  // 2. Paid reports: check if paid but not delivered
  if (isReportType(doc.id)) {
    const reportData = getReportData(doc, job);
    if (reportData && (reportData.status === 'paid' || reportData.status === 'completed')) {
      // If no uploaded file, it's pending admin delivery
      return 'pending_admin_delivery';
    }
  }

  // 3. Standard documents: user needs to upload
  return 'pending_user_upload';
}
