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
export const DEFAULT_ASSESSMENT_TYPES: PrePreparedAssessment[] = [] 