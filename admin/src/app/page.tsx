"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function DashboardPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="grid gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Welcome Back to Admin Dashboard</h1>
            <p className="text-gray-500">Here's an overview of your urban planning projects</p>
          </div>
          <Button asChild>
            <Link href="/initial-assessment">Start New Assessment</Link>
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Pending Assessments</CardTitle>
              <CardDescription>Initial assessments waiting for review</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5</div>
              <Button variant="outline" className="mt-4" asChild>
                <Link href="/initial-assessment">View All</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Reports in Progress</CardTitle>
              <CardDescription>Reports currently being written</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <Button variant="outline" className="mt-4" asChild>
                <Link href="/report-writer">View All</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Active Projects</CardTitle>
              <CardDescription>Currently ongoing projects</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <Button variant="outline" className="mt-4" asChild>
                <Link href="/project-management">View All</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  )
}
