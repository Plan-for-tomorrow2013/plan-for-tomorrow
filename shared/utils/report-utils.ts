import { Job } from '@shared/types/jobs'
import { DocumentWithStatus } from '@shared/types/documents'
import { Assessment } from '@shared/types/jobs'

export type ReportType = 'customAssessment' | 'statementOfEnvironmentalEffects' | 'complyingDevelopmentCertificate' | 'wasteManagementAssessment'

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
  // Check for file details within a nested 'completedDocument' object,
  // or fall back to top-level properties for backward compatibility or other structures.
  const completedDoc = reportData?.completedDocument as any; // Cast to any to access potential properties
  const hasFile = Boolean(
    (completedDoc?.fileName || completedDoc?.originalName) ||
    (reportData?.fileName || reportData?.originalName)
  );

  return {
    isPaid: status === 'paid' || status === 'completed',
    isCompleted: status === 'completed',
    isUploaded: hasFile,
    hasFile,
    reportData: reportData || null
  };
};

export const getReportData = (doc: DocumentWithStatus, job: Job): Assessment | null => {
  const data = doc.id === 'statementOfEnvironmentalEffects' ? job.statementOfEnvironmentalEffects :
               doc.id === 'complyingDevelopmentCertificate' ? job.complyingDevelopmentCertificate :
               doc.id === 'customAssessment' ? job.customAssessment :
               doc.id === 'wasteManagementAssessment' ? job.wasteManagementAssessment :
               null;
  return data || null;
};

export function isReportType(docId: string): boolean {
  return ['customAssessment', 'statementOfEnvironmentalEffects', 'complyingDevelopmentCertificate', 'wasteManagementAssessment'].includes(docId)
}

export function getReportTitle(docId: string): string {
  switch (docId) {
    case 'customAssessment':
    case 'custom-assessment':
      return 'Custom Assessment';
    case 'statementOfEnvironmentalEffects':
    case 'statement-of-environmental-effects':
      return 'Statement of Environmental Effects';
    case 'complyingDevelopmentCertificate':
    case 'complying-development-certificate':
      return 'Complying Development Certificate';
    case 'wasteManagementAssessment':
    case 'waste-management-assessment':
      return 'Waste Management Assessment';
    default:
      return 'Unknown Report';
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
  if (doc.uploadedFile) {
    return 'uploaded';
  }

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
