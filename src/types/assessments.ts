export interface AssessmentType {
  id: string
  value: string  // The path where this assessment appears
  label: string  // Display name
  description?: string
  file?: string
  documentId?: string
  version?: number
}

export interface PrePreparedAssessment extends AssessmentType {
  description: string
  file: string
  documentId: string
  version: number
}

// Constants for default assessment types
export const DEFAULT_ASSESSMENT_TYPES: PrePreparedAssessment[] = [
  { 
    id: 'cdc-dwelling',
    value: '/initial-assessment/pre-prepared/cdc-dwelling',
    label: 'CDC Dwelling Assessment',
    description: 'Complying Development Certificate for a new dwelling',
    file: '/documents/cdc-dwelling.pdf',
    documentId: 'cdc-dwelling',
    version: 1
  },
  { 
    id: 'cdc-dual-occupancy',
    value: '/initial-assessment/pre-prepared/cdc-dual-occupancy',
    label: 'CDC Dual Occupancy Assessment',
    description: 'Complying Development Certificate for dual occupancy',
    file: '/documents/cdc-dual-occupancy.pdf',
    documentId: 'cdc-dual-occupancy',
    version: 1
  },
  { 
    id: 'cdc-secondary-dwelling',
    value: '/initial-assessment/pre-prepared/cdc-secondary-dwelling',
    label: 'CDC Secondary Dwelling Assessment',
    description: 'Complying Development Certificate for a secondary dwelling',
    file: '/documents/cdc-secondary-dwelling.pdf',
    documentId: 'cdc-secondary-dwelling',
    version: 1
  }
] 