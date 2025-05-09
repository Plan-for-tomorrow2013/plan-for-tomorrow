export interface Assessment {
  status?: 'paid' | 'completed';
  returnedAt?: string;
  filename?: string;
  originalName?: string;
  type?: string;
  uploadedAt?: string;
  size?: number;
  developmentType?: string;
  additionalInfo?: string;
  createdAt?: string;
  updatedAt?: string;
  documents?: {
    certificateOfTitle?: { originalName?: string; filename?: string };
    surveyPlan?: { originalName?: string; filename?: string };
    certificate107?: { originalName?: string; filename?: string };
  };
  uploadedDocuments?: {
    [key: string]: {
      filename: string;
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
  manualSubmission?: (Record<string, any> & { updatedAt: string }) | null;
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
