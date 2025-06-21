'use client';

import { PrePreparedAssessmentsManager } from '@/lib/PrePreparedAssessmentsManager';

export default function PrePreparedInitialAssessmentsPage() {
  return (
    <PrePreparedAssessmentsManager
      title="Pre-Prepared Initial Assessments"
      description="Create and manage Pre-Prepared Initial Assessments"
      apiEndpoint="/api/pre-prepared-initial-assessments"
      downloadEndpoint="/api/pre-prepared-initial-assessments"
      sectionEndpoint="/api/pre-prepared-initial-assessments/sections"
      assessmentType="initial"
    />
  );
}
