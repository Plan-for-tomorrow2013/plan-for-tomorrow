"use client"

import React from "react"
import { ClipboardCheck, FileText, BarChart3, DollarSign, CheckCircle, LucideIcon } from "lucide-react"
import { cn } from "@shared/lib/utils"

export type JobStage = "initial-assessment" | "design-check" | "report-writer" | "quotes" | "complete"
export type StageStatus = 'completed' | 'pending'

interface JobDetailsTilesProps {
  currentStage: JobStage
  address: string
  council: string
  className?: string
  customAssessment?: {
    status?: 'paid' | 'completed'
  }
  statementOfEnvironmentalEffects?: {
    status?: 'paid' | 'completed'
  }
  complyingDevelopmentCertificate?: {
    status?: 'paid' | 'completed'
  }
  showPrePreparedAssessments?: boolean
  showComplete?: boolean
}

export function JobDetailsTiles({
  currentStage,
  address,
  council,
  className,
  customAssessment,
  statementOfEnvironmentalEffects,
  complyingDevelopmentCertificate,
  showPrePreparedAssessments = false,
  showComplete = false
}: JobDetailsTilesProps) {
  const stages: { id: JobStage; label: string; icon: LucideIcon; href: string; status: StageStatus }[] = [
    ...(showPrePreparedAssessments ? [{
      id: "initial-assessment" as JobStage,
      label: "Initial Assessment",
      icon: ClipboardCheck,
      href: "/initial-assessment",
      status: customAssessment?.status === 'completed' ? 'completed' as StageStatus : 'pending' as StageStatus
    }] : []),
    {
      id: "design-check" as JobStage,
      label: "Design Check",
      icon: BarChart3,
      href: "/design-check",
      status: 'pending' as StageStatus
    },
    {
      id: "report-writer" as JobStage,
      label: "Report Writer",
      icon: FileText,
      href: "/report-writer",
      status: (statementOfEnvironmentalEffects?.status === 'completed' ||
              complyingDevelopmentCertificate?.status === 'completed') ? 'completed' as StageStatus : 'pending' as StageStatus
    },
    {
      id: "quotes" as JobStage,
      label: "Quotes",
      icon: DollarSign,
      href: "/quotes",
      status: 'pending' as StageStatus
    },
    ...(showComplete ? [{
      id: "complete" as JobStage,
      label: "Complete",
      icon: CheckCircle,
      href: "/complete",
      status: currentStage === 'complete' ? 'completed' as StageStatus : 'pending' as StageStatus
    }] : [])
  ]

  return (
    <div className={cn("space-y-4", className)}>
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
          const isCompleted = stage.status === 'completed'
          return (
            <a
              key={stage.id}
              href={stage.href}
              className={cn(
                "flex flex-col items-center justify-center p-6 rounded-lg transition-colors",
                isActive
                  ? "bg-yellow-400 text-yellow-950 hover:bg-yellow-500"
                  : isCompleted
                  ? "bg-green-100 text-green-900 hover:bg-green-200"
                  : "bg-muted hover:bg-muted/80"
              )}
            >
              <Icon className={cn(
                "h-6 w-6 mb-2",
                isActive ? "text-yellow-950" : isCompleted ? "text-green-900" : "text-muted-foreground"
              )} />
              <span className={cn(
                "text-sm font-medium",
                isActive ? "text-yellow-950" : isCompleted ? "text-green-900" : "text-muted-foreground"
              )}>
                {stage.label}
              </span>
              {isCompleted && (
                <span className="text-xs mt-1 text-green-900">
                  Completed
                </span>
              )}
            </a>
          )
        })}
      </div>
    </div>
  )
}

export const jobStages: { id: JobStage; label: string; icon: LucideIcon; href: string }[] = [
  { id: "initial-assessment" as JobStage, label: "Initial Assessment", icon: ClipboardCheck, href: "/initial-assessment" },
  { id: "design-check" as JobStage, label: "Design Check", icon: BarChart3, href: "/design-check" },
  { id: "report-writer" as JobStage, label: "Report Writer", icon: FileText, href: "/report-writer" },
  { id: "quotes" as JobStage, label: "Quotes", icon: DollarSign, href: "/quotes" }
]
