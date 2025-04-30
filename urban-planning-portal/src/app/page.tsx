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
            <h1 className="text-3xl font-bold">Welcome Back</h1>
            <p className="text-gray-500">Here's an overview of your urban planning projects</p>
          </div>
          <Button asChild>
            <Link href="/initial-assessment">Start New Assessment</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Design Check</CardTitle>
              <CardDescription>Start a new design compliance check</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/design-check">Start New Check</Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Report Writer</CardTitle>
              <CardDescription>Generate assessment reports</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/report-writer">Write Report</Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quotes</CardTitle>
              <CardDescription>View and manage quotes</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/quotes">View Quotes</Link>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest updates and actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">New Assessment Submitted</h3>
                  <p className="text-sm text-gray-500">Downtown Redevelopment Project</p>
                </div>
                <span className="text-sm text-gray-500">2 hours ago</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Report Updated</h3>
                  <p className="text-sm text-gray-500">Green Space Initiative</p>
                </div>
                <span className="text-sm text-gray-500">5 hours ago</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Project Status Changed</h3>
                  <p className="text-sm text-gray-500">Transit Hub Expansion</p>
                </div>
                <span className="text-sm text-gray-500">1 day ago</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
