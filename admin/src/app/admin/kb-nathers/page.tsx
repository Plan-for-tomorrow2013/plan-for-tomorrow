'use client';

import { PrePreparedAssessmentsManager } from '@/lib/PrePreparedAssessmentsManager';

export default function KBNathersPage() {
  return (
    <PrePreparedAssessmentsManager
      title="Knowledge Base - Nathers"
      description="Create and manage Knowledge Base - Nathers"
      apiEndpoint="/api/kb-nathers-assessments"
      downloadEndpoint="/api/kb-nathers-assessments"
      sectionEndpoint="/api/kb-nathers-sections"
      assessmentType="nathers"
    />
  );
}
