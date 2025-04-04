'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '../../lib/utils'
import { Button } from '../../components/ui/button'
import { FileText, Menu, FileCheck, BellRing, ClipboardCheck, BookOpen } from 'lucide-react'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const navItems = [
    {
      title: 'Work Tickets',
      href: '/admin/work-tickets',
      icon: FileCheck
    },
    {
      title: 'Initial Assessment',
      href: '/admin/initial-assessment',
      icon: ClipboardCheck
    },
    {
      title: 'Announcements',
      href: '/admin/announcements',
      icon: BellRing
    },
    {
      title: 'Report Writer',
      href: '/admin/report-writer',
      icon: FileText
    },
    {
      title: 'Knowledge Base',
      href: '/admin/knowledge-base',
      icon: BookOpen
    }, // Add more nav items here as we expand the admin section
  ]
  
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Bar */}
      <div className="bg-white border-b h-16 fixed top-0 left-0 right-0 z-30 flex items-center px-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="mr-4"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-semibold">Admin Dashboard</h1>
      </div>

      {/* Sidebar */}
      <div className={cn(
        "fixed left-0 top-16 bottom-0 w-64 bg-white border-r transition-transform duration-200 ease-in-out z-20",
        !sidebarOpen && "-translate-x-full"
      )}>
        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  pathname === item.href
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{item.title}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className={cn(
        "pt-16 transition-all duration-200 ease-in-out",
        sidebarOpen ? "pl-64" : "pl-0"
      )}>
        <main className="min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </div>
    </div>
  )
} 