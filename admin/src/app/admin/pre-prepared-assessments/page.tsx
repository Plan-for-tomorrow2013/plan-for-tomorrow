'use client';

import { PrePreparedAssessmentsManager } from '@/lib/PrePreparedAssessmentsManager';

export default function PrePreparedAssessmentsPage() {
  return (
    <PrePreparedAssessmentsManager
      title="Pre-Prepared Assessments"
      description="Create and manage Pre-Prepared Assessments"
      apiEndpoint="/api/pre-prepared-assessments"
      downloadEndpoint="/api/pre-prepared-assessments"
      sectionEndpoint="/api/pre-prepared-sections"
      assessmentType="regular"
    />
  );
}
