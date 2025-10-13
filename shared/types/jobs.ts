import { SiteDetails } from "./site-details";
import { DevelopmentData } from "../../urban-planning-portal/src/app/professionals/SoEE/lib/types";
import { InitialAssessment } from "../components/DetailedInitialAssessment";

export type ConsultantCategory =
  | "NatHERS & BASIX"
  | "Waste Management"
  | "Cost Estimate"
  | "Stormwater"
  | "Traffic"
  | "Surveyor"
  | "Bushfire"
  | "Flooding"
  | "Acoustic"
  | "Landscaping"
  | "Heritage"
  | "Biodiversity"
  | "Lawyer"
  | "Certifiers"
  | "Arborist"
  | "Geotechnical";

export interface Assessment {
  status?: 'paid' | 'completed';
  returnedAt?: string;
  fileName?: string;
  originalName?: string;
  type?: string;
  uploadedAt?: string;
  size?: number;
  developmentType?: string;
  additionalInfo?: string;
  createdAt?: string;
  updatedAt?: string;
  category?: ConsultantCategory;
  consultant?: {
    name: string;
    notes: string;
  };
  documents?: {
    certificateOfTitle?: { originalName?: string; fileName?: string };
    surveyPlan?: { originalName?: string; fileName?: string };
    certificate107?: { originalName?: string; fileName?: string };
    architecturalPlan?: { originalName?: string; fileName?: string };
  };
  completedDocument?: {
    documentId?: string;
    originalName: string;
    fileName: string;
    uploadedAt: string;
    size: number;
    type: string;
    returnedAt?: string;
  };
  uploadedDocuments?: {
    [key: string]: {
      fileName: string;
      originalName: string;
      type: string;
      uploadedAt: string;
      size: number;
    };
  };
}

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
  nathersAssessment?: Assessment;
  wasteManagementAssessment?: Assessment;
  certifyingAuthority?: {
    webAddress?: string;
  };
  consultants?: {
    [key in ConsultantCategory]?: Array<{
      name: string;
      notes: string;
      consultantId: string;
      assessment?: Assessment;
    }>;
  };
  purchasedPrePreparedAssessments?: Record<string, PurchasedPrePreparedAssessments>;
  purchasedPrePreparedInitialAssessments?: Record<string, PurchasedPrePreparedAssessments>;
  purchasedKbWasteManagementAssessments?: Record<string, PurchasedPrePreparedAssessments>;
  purchasedKbNathersAssessments?: Record<string, PurchasedPrePreparedAssessments>;
  purchasedKbDevelopmentApplicationAssessments?: Record<string, PurchasedPrePreparedAssessments>;
  documents?: {
    [key: string]: {
      fileName: string;
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
  siteDetails?: SiteDetails | null;
  initialAssessment?: InitialAssessment | null;
  formData?: {
    lotIdentifications?: Array<{
      lotNumber: string;
      sectionNumber?: string;
      dpNumber: string;
    }>;
    addressDetails?: {
      streetNumber: string;
      streetName: string;
      secondaryStreetName?: string;
      suburb: string;
      postcode: string;
    };
    development?: DevelopmentData;
  } | null;
  manualSubmission?: (Record<string, any> & { updatedAt: string }) | null;
  clientDetails?: {
    name?: string;
    email?: string;
    phone?: string;
    company?: string;
    address?: string;
    notes?: string;
    updatedAt?: string;
  } | null;
  messages?: Array<{
    id: string;
    content: string;
    sender: string;
    senderType: 'professional' | 'client' | 'system';
    timestamp: string;
    read?: boolean;
  }>;
  designBrief?: {
    description?: string;
    requirements?: string;
    notes?: string;
    documents?: {
      [key: string]: {
        fileName: string;
        originalName: string;
        type: string;
        uploadedAt: string;
        size: number;
      };
    };
    updatedAt?: string;
  } | null;
}

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

export interface PaginationParams {
  page: number;
  limit: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}
