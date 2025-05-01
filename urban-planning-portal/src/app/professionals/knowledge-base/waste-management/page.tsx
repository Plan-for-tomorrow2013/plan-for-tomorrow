"use client"

import { Card, CardHeader, CardTitle } from "@shared/components/ui/card"
import { Clock } from "lucide-react"
import { PageHeader } from "@shared/components/ui/page-header"

export default function WasteManagementPage() {
  return (
    <div className="container mx-auto p-6">
      <PageHeader
        title="Waste Management"
        description="Waste management guidelines and calculators"
        backHref="/professionals/knowledge-base"
      />

      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-lg text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <Clock className="h-12 w-12 text-gray-400" />
            </div>
            <CardTitle className="text-2xl">Coming Soon</CardTitle>
          </CardHeader>
        </Card>
      </div>
    </div>
  )
}
