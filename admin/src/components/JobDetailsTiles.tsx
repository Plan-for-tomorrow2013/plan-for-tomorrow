"use client"

import { ClipboardCheck, FileText, BarChart3, DollarSign, CheckCircle, LucideIcon } from "lucide-react"
import { cn } from "../../lib/utils"

export type JobStage = "pre-prepared-assessments" | "design-check" | "report-writer" | "quotes" | "complete"

interface JobDetailsTilesProps {
  currentStage: JobStage
  address: string
  council: string
  customAssessment?: {
    status?: 'paid' | 'completed'
  }
  statementOfEnvironmentalEffects?: {
    status?: 'paid' | 'completed'
  }
  complyingDevelopmentCertificate?: {
    status?: 'paid' | 'completed'
  }
}

export function JobDetailsTiles({
  currentStage,
  address,
  council,
  customAssessment,
  statementOfEnvironmentalEffects,
  complyingDevelopmentCertificate
}: JobDetailsTilesProps) {
  const stages: { id: JobStage; label: string; icon: LucideIcon; href: string; status?: 'completed' | 'pending' }[] = [
    {
      id: "pre-prepared-assessments",
      label: "Pre-prepared Assessments",
      icon: ClipboardCheck,
      href: "/pre-prepared-assessments",
      status: customAssessment?.status === 'completed' ? 'completed' : 'pending'
    },
    {
      id: "design-check",
      label: "Design Check",
      icon: BarChart3,
      href: "/design-check",
      status: 'pending'
    },
    {
      id: "report-writer",
      label: "Report Writer",
      icon: FileText,
      href: "/report-writer",
      status: statementOfEnvironmentalEffects?.status === 'completed' ||
              complyingDevelopmentCertificate?.status === 'completed' ? 'completed' : 'pending'
    },
    {
      id: "quotes",
      label: "Quotes",
      icon: DollarSign,
      href: "/quotes",
      status: 'pending'
    },
    {
      id: "complete",
      label: "Complete",
      icon: CheckCircle,
      href: "/complete",
      status: currentStage === 'complete' ? 'completed' : 'pending'
    }
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
