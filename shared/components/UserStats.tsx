"use client"

import React from "react"
import { Card, CardContent } from "@shared/components/ui/card"
import { ClipboardCheck, FileCheck, FileSpreadsheet, CheckCircle, LucideIcon } from "lucide-react"

export type UserRole = 'admin' | 'professional'

interface UserStatsProps {
  username: string
  role: UserRole
  designChecks: number
  reportsWritten: number
  completedJobs: number
  designChecksDiff: number
  reportsWrittenDiff: number
  initialAssessments?: number
  initialAssessmentsDiff?: number
  quotesSent?: number
  quotesSentDiff?: number
  underAssessment?: number
  underAssessmentDiff?: number
  completedJobsDiff?: number
}

interface StatCardProps {
  title: string
  value: number
  diff?: number
  icon: LucideIcon
  showDiff?: boolean
  completionRate?: number
}

function StatCard({ title, value, diff, icon: Icon, showDiff = true, completionRate }: StatCardProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">{title}</p>
            <h2 className="text-3xl font-bold">{value}</h2>
            {showDiff && diff !== undefined && (
              <p className="text-xs text-muted-foreground">
                {diff > 0 ? "+" : ""}{diff} from last month
              </p>
            )}
            {completionRate !== undefined && (
              <p className="text-xs text-muted-foreground">
                Completion rate: {completionRate}%
              </p>
            )}
          </div>
          <Icon className="h-8 w-8 text-yellow-500" />
        </div>
      </CardContent>
    </Card>
  )
}

export function UserStats({
  username,
  role,
  designChecks,
  reportsWritten,
  completedJobs,
  designChecksDiff,
  reportsWrittenDiff,
  initialAssessments,
  initialAssessmentsDiff,
  quotesSent,
  quotesSentDiff,
  underAssessment,
  underAssessmentDiff,
  completedJobsDiff
}: UserStatsProps) {
  const totalJobs = role === 'admin'
    ? (initialAssessments || 0) + designChecks + reportsWritten
    : designChecks + reportsWritten

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        Welcome, {username}
      </h1>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        <StatCard
            title="Initial Assessments"
            value={initialAssessments || 0}
            diff={initialAssessmentsDiff}
            icon={ClipboardCheck}
          />
        <StatCard
          title="Design Checks"
          value={designChecks || 0}
          diff={designChecksDiff}
          icon={FileCheck}
        />
        <StatCard
          title="Reports Written"
          value={reportsWritten || 0}
          diff={reportsWrittenDiff}
          icon={FileSpreadsheet}
        />
        <StatCard
          title="Quotes Sent"
          value={quotesSent || 0}
          diff={quotesSentDiff}
          icon={CheckCircle}
        />
        <StatCard
          title="Under Assessment"
          value={underAssessment || 0}
          diff={underAssessmentDiff}
          icon={CheckCircle}
        />
        <StatCard
          title="Completed Jobs"
          value={completedJobs || 0}
          diff={completedJobsDiff}
          icon={CheckCircle}
          completionRate={totalJobs > 0 ? Math.round((completedJobs / totalJobs) * 100) : undefined}
        />
      </div>
    </div>
  )
}
