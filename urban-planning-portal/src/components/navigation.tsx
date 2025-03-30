"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, BookOpen, Briefcase, FileCheck, Ruler, FileText, DollarSign, User, HelpCircle, LogOut } from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Knowledge Base", href: "/knowledge-base", icon: BookOpen },
  { name: "Jobs", href: "/jobs", icon: Briefcase },
  { name: "Initial Assessment", href: "/initial-assessment", icon: FileCheck },
  { name: "Design Check", href: "/design-check", icon: Ruler },
  { name: "Report Writer", href: "/report-writer", icon: FileText },
  { name: "Quotes", href: "/quotes", icon: DollarSign },
  { name: "Account", href: "/account", icon: User },
  { name: "Help", href: "/help", icon: HelpCircle },
  { name: "Log Out", href: "/logout", icon: LogOut },
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col space-y-2 w-[200px] p-4 bg-yellow-100">
      {navigation.map((item) => {
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-yellow-200",
              pathname === item.href
                ? "bg-yellow-200 text-yellow-900"
                : "text-yellow-900/80"
            )}
          >
            <Icon className="h-5 w-5" />
            <span>{item.name}</span>
          </Link>
        )
      })}
    </nav>
  )
} 