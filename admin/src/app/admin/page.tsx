'use client';

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@shared/components/ui/card';
import Link from 'next/link';
import {
  FileText,
  Building2,
  Lightbulb,
  Recycle,
  Hammer,
  Megaphone,
  Users,
  ClipboardList,
} from 'lucide-react';

export default function AdminPage() {
  // The <title> and <meta> tags should be handled by Next.js metadata API
  // See: https://nextjs.org/docs/app/building-your-application/optimizing/metadata
  return (
    <>
      {/* Removed redundant html, head, and body tags */}
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="mb-8">
        <h1 className="text-3xl font-bold mb-8">Welcome to Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage work tickets, assessments, reports and knowledge base
          </p>
        </div>

        {/* Dashboard */}
        <h2 className="text-xl font-semibold mb-4">Dashboard</h2>
        <div className="h-1 bg-yellow-400 w-full my-2"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        
        <Link href="/admin/announcements">
            <Card className="hover:bg-gray-50 transition-colors cursor-pointer h-full">
              <CardHeader className="flex flex-col space-y-2">
                <div className="flex items-center gap-2">
                  <Megaphone className="h-6 w-6 text-yellow-500" />
                  <CardTitle className="text-lg">Dashboard Announcements</CardTitle>
                </div>
                <CardDescription>Create and manage announcements on the dashboard.</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        
          <Link href="/admin/work-tickets">
            <Card className="hover:bg-gray-50 transition-colors cursor-pointer h-full">
              <CardHeader className="flex flex-col space-y-2">
                <div className="flex items-center gap-2">
                  <ClipboardList className="h-6 w-6 text-blue-500" />
                  <CardTitle className="text-lg">Work Tickets</CardTitle>
                </div>
                <CardDescription>View and manage work tickets.</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/admin/pre-prepared-initial-assessments">
            <Card className="hover:bg-gray-50 transition-colors cursor-pointer h-full">
              <CardHeader className="flex flex-col space-y-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-6 w-6 text-blue-500" />
                  <CardTitle className="text-lg">Pre-prepared Initial Assessments</CardTitle>
                </div>
                <CardDescription>
                  Review and manage pre-prepared initial assessments from users.
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/admin/pre-prepared-assessments">
            <Card className="hover:bg-gray-50 transition-colors cursor-pointer h-full">
              <CardHeader className="flex flex-col space-y-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-6 w-6 text-green-500" />
                  <CardTitle className="text-lg">Pre-prepared Report Writer Assessments</CardTitle>
                </div>
                <CardDescription>
                  Review and manage pre-prepared report writer assessments from users.
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>

        {/* Knowledge Base */}
        <h2 className="text-xl font-semibold mb-4">Knowledge Base</h2>
        <div className="h-1 bg-yellow-400 w-full my-2"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">

          <Link href="/admin/kb-development-application">
            <Card className="hover:bg-gray-50 transition-colors cursor-pointer h-full">
              <CardHeader className="p-6 flex flex-col space-y-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-6 w-6 text-blue-500" />
                  <CardTitle className="text-lg">Development Application</CardTitle>
                </div>
                <CardDescription>
                  Review and manage the knowledge base for Development Applications.
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/admin/kb-complying-development">
            <Card className="hover:bg-gray-50 transition-colors cursor-pointer h-full">
              <CardHeader className="p-6 flex flex-col space-y-2">
                <div className="flex items-center gap-2">
                  <Building2 className="h-6 w-6 text-green-500" />
                  <CardTitle className="text-lg">Complying Development</CardTitle>
                </div>
                <CardDescription>
                  Review and manage the knowledge base for Complying Development.
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/admin/kb-nathers">
            <Card className="hover:bg-gray-50 transition-colors cursor-pointer h-full">
              <CardHeader className="p-6 flex flex-col space-y-2">
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-6 w-6 text-yellow-500" />
                  <CardTitle className="text-lg">NatHERS & BASIX</CardTitle>
                </div>
                <CardDescription>
                  Review and manage the knowledge base for NatHERS & BASIX.
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/admin/kb-waste-management">
            <Card className="hover:bg-gray-50 transition-colors cursor-pointer h-full">
              <CardHeader className="p-6 flex flex-col space-y-2">
                <div className="flex items-center gap-2">
                  <Recycle className="h-6 w-6 text-purple-500" />
                  <CardTitle className="text-lg">Waste Management</CardTitle>
                </div>
                <CardDescription>
                  Review and manage the knowledge base for Waste Management.
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>

        {/* Consultants */}
        <h2 className="text-xl font-semibold mb-4">Consultants</h2>
        <div className="h-1 bg-yellow-400 w-full my-2"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link href="/admin/consultants">
            <Card className="hover:bg-gray-50 transition-colors cursor-pointer h-full">
              <CardHeader className="flex flex-col space-y-2">
                <div className="flex items-center gap-2">
                  <Users className="h-6 w-6 text-blue-500" />
                  <CardTitle className="text-lg">Consultants</CardTitle>
                </div>
                <CardDescription>Review and manage the consultants.</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/admin/consultants-tickets">
            <Card className="hover:bg-gray-50 transition-colors cursor-pointer h-full">
              <CardHeader className="flex flex-col space-y-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-6 w-6 text-green-500" />
                  <CardTitle className="text-lg">Consultant Quotes</CardTitle>
                </div>
                <CardDescription>Review and manage the consultant quotes.</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/admin/consultants-work-orders">
            <Card className="hover:bg-gray-50 transition-colors cursor-pointer h-full">
              <CardHeader className="flex flex-col space-y-2">
                <div className="flex items-center gap-2">
                  <Hammer className="h-6 w-6 text-green-500" />
                  <CardTitle className="text-lg">Consultant Work Orders</CardTitle>
                </div>
                <CardDescription>Review and manage the consultant work orders.</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>
      </div>{' '}
      {/* Added missing closing div tag */}
    </>
  );
}
