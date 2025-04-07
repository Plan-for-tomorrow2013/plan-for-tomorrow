"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function AdminPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold mb-4">Welcome to Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Use the sidebar navigation to manage various aspects of the application.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-2">Work Tickets</h2>
          <p className="text-sm text-muted-foreground mb-4">
            View and manage work tickets for initial assessments & reports and other tasks.
          </p>
          <a
            href="/admin/work-tickets"
            className="text-sm text-blue-500 hover:text-blue-700"
          >
            Go to Work Tickets →
          </a>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-2">Initial Assessment</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Review and manage initial assessment submissions from users.
          </p>
          <a
            href="/admin/initial-assessment"
            className="text-sm text-blue-500 hover:text-blue-700"
          >
            Go to Initial Assessment →
          </a>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-2">Report Writer</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Review and manage report writer submissions from users.
          </p>
          <a
            href="/admin/report-writer"
            className="text-sm text-blue-500 hover:text-blue-700"
          >
            Go to Report Writer →
          </a>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-2">Knowledge Base</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Review and manage the knowledge base.
          </p>
          <a
            href="/admin/knowledge-base"
            className="text-sm text-blue-500 hover:text-blue-700"
          >
            Go to Knowledge Base →
          </a>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-2">Announcements</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Create and manage announcements for users and staff.
          </p>
          <a
            href="/admin/announcements"
            className="text-sm text-blue-500 hover:text-blue-700"
          >
            Go to Announcements →
          </a>
        </div>
      </div>
    </div>
  )
}
