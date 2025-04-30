import type { Assessment } from '../../../shared/types/jobs'

export interface PurchasedPrePreparedAssessments {
  id: string;
  section: string;
  title: string;
  content: string;
  date: string;
  author: string;
  file?: {
    originalName: string;
    id: string;
  };
  purchaseDate?: string;
  status?: 'paid' | 'completed';
}

// Define structure for document references within assessments/reports
interface DocumentReference {
    originalName?: string;
    filename?: string;
}

export type ReportType = 'custom-assessment' | 'statement-of-environmental-effects' | 'complying-development-certificate';

export interface Job {
  id: string;
  address: string;
  council: string;
  currentStage: string;
  status: 'pending' | 'in-progress' | 'completed';
  createdAt: string;
  updatedAt?: string;
  customAssessment?: Assessment;
  statementOfEnvironmentalEffects?: Assessment;
  complyingDevelopmentCertificate?: Assessment;
  purchasedPrePreparedAssessments?: Record<string, PurchasedPrePreparedAssessments>;
  documents?: {
    [key: string]: {
      filename: string;
      originalName: string;
      type: string;
      uploadedAt: string;
      size: number;
    };
  };
  propertyData?: {
    coordinates?: {
      longitude: number;
      latitude: number;
    };
    planningLayers: {
      epiLayers: Array<{ layer: string; attributes: Record<string, any> }>;
      protectionLayers: Array<{ layer: string; attributes: Record<string, any> }>;
      localProvisionsLayers: Array<{ layer: string; attributes: Record<string, any> }>;
    };
  } | null;
  siteDetails?: {
    siteAddressDetails?: string;
    siteArea?: string;
    currentLandUse?: string;
    zoningInfo?: string;
    siteConstraints?: string;
  } | null;
}
