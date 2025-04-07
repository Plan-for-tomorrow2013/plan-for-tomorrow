"use client"

import { ClipboardCheck, FileText, BarChart3, DollarSign } from "lucide-react"
import { cn } from "../../lib/utils"

export type JobStage = "initial-assessment" | "design-check" | "report-writer" | "quotes"

interface JobDetailsTilesProps {
  currentStage: JobStage
  address: string
  council: string
}

export function JobDetailsTiles({ currentStage, address, council }: JobDetailsTilesProps) {
  const stages: { id: JobStage; label: string; icon: React.ComponentType; href: string }[] = [
    { id: "initial-assessment", label: "Initial Assessment", icon: ClipboardCheck, href: "/initial-assessment" },
    { id: "design-check", label: "Design Check", icon: BarChart3, href: "/design-check" },
    { id: "report-writer", label: "Report Writer", icon: FileText, href: "/report-writer" },
    { id: "quotes", label: "Quotes", icon: DollarSign, href: "/quotes" }
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <h3 className="text-lg font-semibold">{address}</h3>
          <p className="text-sm text-muted-foreground">{council}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {stages.map((stage) => {
          const Icon = stage.icon
          const isActive = currentStage === stage.id
          return (
            <a
              key={stage.id}
              href={stage.href}
              className={cn(
                "flex flex-col items-center justify-center p-6 rounded-lg transition-colors",
                isActive
                  ? "bg-yellow-400 text-yellow-950 hover:bg-yellow-500"
                  : "bg-muted hover:bg-muted/80"
              )}
            >
              <Icon className={cn(
                "h-6 w-6 mb-2",
                isActive ? "text-yellow-950" : "text-muted-foreground"
              )} />
              <span className={cn(
                "text-sm font-medium",
                isActive ? "text-yellow-950" : "text-muted-foreground"
              )}>
                {stage.label}
              </span>
            </a>
          )
        })}
      </div>
    </div>
  )
}
