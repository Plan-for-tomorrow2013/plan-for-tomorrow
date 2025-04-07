"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  BookOpen,
  Briefcase,
  ClipboardCheck,
  BarChart,
  FileText,
  DollarSign,
  User,
  LogOut,
  HelpCircle,
  Database,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Knowledge Base", href: "/knowledge-base", icon: BookOpen },
  { name: "Jobs", href: "/jobs", icon: Briefcase },
  { name: "Initial Assessment", href: "/initial-assessment", icon: ClipboardCheck },
  { name: "Design Check", href: "/design-check", icon: BarChart },
  { name: "Report Writer", href: "/report-writer", icon: FileText },
  { name: "Quotes", href: "/quotes", icon: DollarSign },
  { name: "Account", href: "/account", icon: User },
  { name: "Log Out", href: "/logout", icon: LogOut },
  { name: "Help", href: "/help", icon: HelpCircle },
  // Add this line for testing
  { name: "Test AWS", href: "/test-aws", icon: Database },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="h-full flex flex-col bg-primary py-6 w-64">
      <div className="px-6 mb-8">
        <Link href="/dashboard" className="flex items-center">
          <span className="text-2xl font-semibold text-foreground">
            Plan For <br />
            Tomorrow
          </span>
        </Link>
      </div>
      <nav className="space-y-1 px-3 flex-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center px-3 py-3 text-base font-medium rounded-md",
                isActive
                  ? "bg-primary-foreground text-primary"
                  : "text-primary-foreground hover:bg-primary-foreground/10",
              )}
            >
              <item.icon className="mr-3 h-6 w-6" />
              {item.name}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
