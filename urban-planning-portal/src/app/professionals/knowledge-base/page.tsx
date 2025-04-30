"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Building2, Lightbulb, Recycle } from "lucide-react"

const navItems = [
  {
    title: 'development-application',
    href: '/professionals/knowledge-base/development-application',
  },
  {
    title: 'complying-development',
    href: '/professionals/knowledge-base/complying-development',
  },
  {
    title: 'nathers-basix',
    href: '/professionals/knowledge-base/nathers-basix',
  },
  {
    title: 'waste-management',
    href: '/professionals/knowledge-base/waste-management',
  },
  // Add more nav items here as needed
];
export default function KnowledgeBasePage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Knowledge Base</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link href="/professionals/knowledge-base/development-application">
          <Card className="hover:bg-gray-50 transition-colors cursor-pointer h-full">
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className="h-6 w-6 text-blue-500" />
                <CardTitle className="text-lg">Development Application</CardTitle>
              </div>
              <CardDescription>Guidelines and requirements for development applications</CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/professionals/knowledge-base/complying-development">
          <Card className="hover:bg-gray-50 transition-colors cursor-pointer h-full">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Building2 className="h-6 w-6 text-green-500" />
                <CardTitle className="text-lg">Complying Development</CardTitle>
              </div>
              <CardDescription>SEPP codes and complying development regulations</CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/professionals/knowledge-base/nathers-basix">
          <Card className="hover:bg-gray-50 transition-colors cursor-pointer h-full">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Lightbulb className="h-6 w-6 text-yellow-500" />
                <CardTitle className="text-lg">NatHERS & BASIX</CardTitle>
              </div>
              <CardDescription>Energy efficiency and sustainability requirements</CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/professionals/knowledge-base/waste-management">
          <Card className="hover:bg-gray-50 transition-colors cursor-pointer h-full">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Recycle className="h-6 w-6 text-purple-500" />
                <CardTitle className="text-lg">Waste Management</CardTitle>
              </div>
              <CardDescription>Waste management guidelines and calculators</CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  )
}
