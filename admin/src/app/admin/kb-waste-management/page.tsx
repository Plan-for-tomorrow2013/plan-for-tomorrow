"use client"

import { PrePreparedAssessmentsManager } from "@/lib/PrePreparedAssessmentsManager"

export default function KBWasteManagementPage() {
  return (
    <PrePreparedAssessmentsManager
      title="Knowledge Base - Waste Management"
      description="Create and manage Knowledge Base - Waste Management"
      apiEndpoint="/api/kb-waste-management"
      downloadEndpoint="/api/kb-waste-management"
      sectionEndpoint="/api/kb-waste-management/sections"
      assessmentType="waste-management"
    />
  )
}
