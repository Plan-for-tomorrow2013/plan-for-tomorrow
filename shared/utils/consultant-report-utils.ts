import { Job, ConsultantCategory } from '@shared/types/jobs'
import { DOCUMENT_TYPES, DocumentWithStatus } from '@shared/types/consultants' 
import { Assessment } from '@shared/types/jobs'

// Dynamically create the list of consultant report IDs
const consultantReportIds = DOCUMENT_TYPES.map(doc => doc.id);

// Dynamically create the ReportType union from the IDs
export type ReportType = typeof consultantReportIds[number];

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
  const completedDoc = reportData?.completedDocument as any;
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

// This version ONLY looks for data inside the job.consultants object.
export const getReportData = (doc: DocumentWithStatus, job: Job): Assessment | null => {
  if (job.consultants && doc.category) {
    const category = doc.category as ConsultantCategory;
    if (job.consultants[category]) {
      // Since the context already gets the first consultant, we'll assume that for now.
      // A more robust solution might pass the specific consultantId.
      const consultant = job.consultants[category][0];
      return consultant?.assessment || null;
    }
  }
  return null;
};

// This function now correctly checks against the dynamic list of consultant report IDs.
export function isReportType(docId: string): docId is ReportType {
  return consultantReportIds.includes(docId);
}

// The getReportTitle function can be removed if titles are derived directly from the doc object
// in the component, or it can be kept if needed for other purposes. For now, we keep it
// but acknowledge it might be redundant.
export function getReportTitle(docId: string): string {
  const doc = DOCUMENT_TYPES.find(d => d.id === docId);
  return doc ? doc.title : 'Unknown Report';
}

// This logic remains the same, but it will use the consultant-specific getReportData.
export function getDocumentDisplayStatus(doc: DocumentWithStatus, job: Job): 'uploaded' | 'pending_user_upload' | 'pending_admin_delivery' {
  if (doc.uploadedFile) {
    return 'uploaded';
  }

  if (isReportType(doc.id)) {
    const reportData = getReportData(doc, job);
    if (reportData && (reportData.status === 'paid' || reportData.status === 'completed')) {
      return 'pending_admin_delivery';
    }
  }

  // A consultant doc is never pending user upload, it's pending admin delivery (or 'in progress')
  return 'pending_admin_delivery';
} 