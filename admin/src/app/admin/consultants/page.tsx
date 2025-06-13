"use client"

import { ConsultantsManager } from "@/lib/ConsultantsManager"

export default function ConsultantsPage() {
  return (
    <ConsultantsManager
      title="Consultants"
      description="Manage consultants for different categories"
      apiEndpoint="/api/consultants"
    />
  )
}
