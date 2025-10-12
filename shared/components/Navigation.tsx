"use client"

import React from "react"
import { cn } from "@shared/lib/utils"
import { Button } from "@shared/components/ui/button"
import { ScrollArea } from "@shared/components/ui/scroll-area"
import {
  BarChart,
  FileText,
  Home,
  BookOpen,
  Briefcase,
  ClipboardCheck,
  Settings,
  LogOut,
  HelpCircle,
  Calculator,
  FileCheck,
  Building2,
  Recycle,
  LucideIcon,
  DollarSign
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export type UserRole = 'admin' | 'professional'

interface NavigationProps {
  role: UserRole
  className?: string
}

export function Navigation({ role, className }: NavigationProps) {
  const pathname = usePathname()
  const prefix = role === 'admin' ? '/admin' : '/professionals'

  const mainNav: { title: string; href: string; icon: LucideIcon }[] = [
    {
      title: "Dashboard",
      href: `${prefix}/dashboard`,
      icon: Home
    },

    {
      title: "Knowledge Base",
      href: `${prefix}/knowledge-base`,
      icon: BookOpen
    },
    {
      title: "Jobs",
      icon: Briefcase,
      href: `${prefix}/jobs`,
    },
    {
      title: "Initial Assessment",
      href: `${prefix}/initial-assessment`,
      icon: ClipboardCheck
    },
    {
      title: "Design Check",
      icon: FileCheck,
      href: `${prefix}/design-check`,
    },
    {
      title: "Report Writer",
      href: `${prefix}/report-writer`,
      icon: FileText
    },

    {
      title: "Consultants",
      icon: Calculator,
      href: `${prefix}/consultants`,
    },
    {
      title: "Certifying Authority",
      icon: DollarSign,
      href: `${prefix}/certifying-authority`,
    },
  ]

  const secondaryNav: { title: string; icon: LucideIcon; href: string }[] = [
    {
      title: "Account",
      icon: Settings,
      href: `${prefix}/account`,
    },
    {
      title: "Help",
      icon: HelpCircle,
      href: `${prefix}/help`,
    },
    {
      title: "Log Out",
      icon: LogOut,
      href: `${prefix}/logout`,
    },
  ]

  return (
    <ScrollArea className={cn("h-full py-6", className)}>
      <div className="space-y-4">
        <div className="px-3 py-2">
          <div className="mb-4 flex items-center">
            <img src="/logo.png" alt="Logo" className="h-8 mr-2" />
            <span className="text-lg font-bold tracking-tight">Urban Planning Portal</span>
          </div>
          <div className="space-y-1">
            <div className="flex flex-col space-y-1">
              {mainNav.map((route) => (
                <div key={route.href}>
                  <Button
                    asChild
                    variant={pathname === route.href ? "secondary" : "ghost"}
                    className="w-full justify-start"
                  >
                    <Link href={route.href}>
                      <route.icon className="mr-2 h-4 w-4" />
                      {route.title}
                    </Link>
                  </Button>
                </div>
              ))}
              {secondaryNav.map((route) => (
                <div key={route.href}>
                  <Button
                    asChild
                    variant={pathname === route.href ? "secondary" : "ghost"}
                    className="w-full justify-start"
                  >
                    <Link href={route.href}>
                      <route.icon className="mr-2 h-4 w-4" />
                      {route.title}
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ScrollArea>
  )
}
