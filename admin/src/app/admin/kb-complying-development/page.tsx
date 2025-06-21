'use client';

import { PrePreparedAssessmentsManager } from '@/lib/PrePreparedAssessmentsManager';

export default function KBComplyingDevelopmentPage() {
  return (
    <PrePreparedAssessmentsManager
      title="Knowledge Base - Complying Development"
      description="Create and manage Knowledge Base - Complying Development"
      apiEndpoint="/api/kb-complying-development-assessments"
      downloadEndpoint="/api/kb-complying-development-assessments"
      sectionEndpoint="/api/kb-complying-development-sections"
      assessmentType="complying-development"
    />
  );
}
