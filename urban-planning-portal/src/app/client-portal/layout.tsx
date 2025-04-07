import type { ReactNode } from "react"
import { Navigation } from "@/components/Navigation"
import { JobProvider } from "@/app/contexts/job-context"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <JobProvider>
      <div className="flex min-h-screen">
        <Navigation />
        <div className="flex-1">{children}</div>
      </div>
    </JobProvider>
  )
}
