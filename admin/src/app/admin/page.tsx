"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function AdminPage() {
  // The <title> and <meta> tags should be handled by Next.js metadata API
  // See: https://nextjs.org/docs/app/building-your-application/optimizing/metadata
  return (
    <>
      {/* Removed redundant html, head, and body tags */}
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold mb-4">Welcome to Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage work tickets, assessments, reports and knowledge base</p>
            </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-2">Work Tickets</h2>
          <p className="text-sm text-muted-foreground mb-4">
            View and manage work tickets.
          </p>
          <a
            href="/admin/work-tickets"
            className="text-sm text-blue-500 hover:text-blue-700"
          >
            Go to Work Tickets →
          </a>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-2">Pre-prepared Assessments</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Review and manage pre-prepared assessments from users.
          </p>
          <Link href="/admin/pre-prepared-assessments" className="text-sm text-blue-500 hover:text-blue-700">
            Go to Pre-prepared Assessments →
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-2">Knowledge Base</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Review and manage the knowledge base for Development Applications.
          </p>
          <a
            href="/admin/kb-development-application"
            className="text-sm text-blue-500 hover:text-blue-700"
          >
            Go to KB - Development Application →
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
    </div> {/* Added missing closing div tag */}
    </>
  )
}
