"use client"

import { Card, CardContent } from "@/components/ui/card"
import { ClipboardCheck, FileCheck, FileSpreadsheet, CheckCircle } from "lucide-react"

interface UserStatsProps {
  username: string
  initialAssessments: number
  designChecks: number
  reportsWritten: number
  completedJobs: number
  initialAssessmentsDiff: number
  designChecksDiff: number
  reportsWrittenDiff: number
}

export function UserStats({
  username,
  initialAssessments,
  designChecks,
  reportsWritten,
  completedJobs,
  initialAssessmentsDiff,
  designChecksDiff,
  reportsWrittenDiff
}: UserStatsProps) {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        Welcome, {username}
      </h1>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Initial Assessments</p>
                <h2 className="text-3xl font-bold">{initialAssessments}</h2>
                <p className="text-xs text-muted-foreground">
                  {initialAssessmentsDiff > 0 ? "+" : ""}{initialAssessmentsDiff} from last month
                </p>
              </div>
              <ClipboardCheck className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Design Checks</p>
                <h2 className="text-3xl font-bold">{designChecks}</h2>
                <p className="text-xs text-muted-foreground">
                  {designChecksDiff > 0 ? "+" : ""}{designChecksDiff} from last month
                </p>
              </div>
              <FileCheck className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Reports Written</p>
                <h2 className="text-3xl font-bold">{reportsWritten}</h2>
                <p className="text-xs text-muted-foreground">
                  {reportsWrittenDiff > 0 ? "+" : ""}{reportsWrittenDiff} from last month
                </p>
              </div>
              <FileSpreadsheet className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Completed Jobs</p>
                <h2 className="text-3xl font-bold">{completedJobs}</h2>
                <p className="text-xs text-muted-foreground">
                  {Math.round((completedJobs / (initialAssessments + designChecks + reportsWritten)) * 100)}% completion rate
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 