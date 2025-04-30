"use client"

import { cn } from "../../lib/utils"
import { Button } from "./ui/button"
import { ScrollArea } from "./ui/scroll-area"
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
  Recycle
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle } from "./ui/navigation-menu"

const mainNav = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Home
  },
  {
    title: "Pre-prepared Assessments",
    href: "/pre-prepared-assessments",
    icon: ClipboardCheck
  },
  {
    title: "Report Writer",
    href: "/report-writer",
    icon: FileText
  },
  {
    title: "Knowledge Base",
    href: "/knowledge-base",
    icon: BookOpen
  },
]

const routes = [
  {
    label: "Jobs",
    icon: Briefcase,
    href: "/jobs",
  },
  {
    label: "Design Check",
    icon: FileCheck,
    href: "/design-check",
  },
  {
    label: "Quotes",
    icon: Calculator,
    href: "/quotes",
  },
  {
    label: "Account",
    icon: Settings,
    href: "/account",
  },
  {
    label: "Log Out",
    icon: LogOut,
    href: "/logout",
  },
  {
    label: "Help",
    icon: HelpCircle,
    href: "/help",
  },
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <ScrollArea className="h-full py-6">
      <div className="space-y-4">
        <div className="px-3 py-2">
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
              {routes.map((route) => (
                <div key={route.href}>
                  <Button
                    asChild
                    variant={pathname === route.href ? "secondary" : "ghost"}
                    className="w-full justify-start"
                  >
                    <Link href={route.href}>
                      <route.icon className="mr-2 h-4 w-4" />
                      {route.label}
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
