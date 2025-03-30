"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"

export default function ProjectManagementPage() {
  const [projectDetails, setProjectDetails] = useState({
    name: "",
    location: "",
    description: "",
    requirements: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log(projectDetails)
  }

  return (
    <div className="container mx-auto py-8">
      <div className="grid gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Project Management</h1>
            <p className="text-gray-500">Manage your urban planning projects</p>
          </div>
          <Button>New Project</Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Active Projects</CardTitle>
              <CardDescription>Currently ongoing projects</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Completed Projects</CardTitle>
              <CardDescription>Successfully completed projects</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">45</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Total Budget</CardTitle>
              <CardDescription>Combined budget for all projects</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$2.4M</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Projects</CardTitle>
            <CardDescription>Your latest project updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Downtown Redevelopment</h3>
                  <p className="text-sm text-gray-500">In Progress</p>
                </div>
                <Button variant="outline">View Details</Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Green Space Initiative</h3>
                  <p className="text-sm text-gray-500">Planning Phase</p>
                </div>
                <Button variant="outline">View Details</Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Transit Hub Expansion</h3>
                  <p className="text-sm text-gray-500">Completed</p>
                </div>
                <Button variant="outline">View Details</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 