'use client';

import { PrePreparedAssessmentsManager } from '@/lib/PrePreparedAssessmentsManager';

export default function KBDevelopmentApplicationPage() {
  return (
    <PrePreparedAssessmentsManager
      title="Knowledge Base - Development Application"
      description="Create and manage Knowledge Base - Development Application"
      apiEndpoint="/api/kb-development-application-assessments"
      downloadEndpoint="/api/kb-development-application-assessments"
      sectionEndpoint="/api/kb-development-application-sections"
      assessmentType="development-application"
    />
  );
}
