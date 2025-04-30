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

const navigationItems = [
  {
    title: "Dashboard",
    href: "/professionals/dashboard",
    icon: <Home className="h-6 w-6" />,
  },
  {
    title: "Jobs",
    href: "/professionals/jobs",
    icon: <Briefcase className="h-6 w-6" />,
  },
  {
    title: "Initial Assessment",
    href: "/professionals/initial-assessment",
    icon: <ClipboardCheck className="h-6 w-6" />,
  },
  {
    title: "Design Check",
    href: "/professionals/design-check",
    icon: <ClipboardCheck className="h-6 w-6" />,
  },
  {
    title: "Report Writer",
    href: "/professionals/report-writer",
    icon: <FileText className="h-6 w-6" />,
  },
  {
    title: "Knowledge Base",
    href: "/professionals/knowledge-base",
    icon: <BookOpen className="h-6 w-6" />,
  },
  {
    title: "Quotes",
    href: "/professionals/quotes",
    icon: <Calculator className="h-6 w-6" />,
  },
    {
      title: "Help",
      href: "/professionals/help",
      icon: <HelpCircle className="h-6 w-6" />,
    },
  {
    title: "Account",
    href: "/professionals/account",
    icon: <Settings className="h-6 w-6" />,
  }
]

const routes = [
  {
    label: "Log Out",
    icon: LogOut,
    href: "/professionals/logout",
  }
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <ScrollArea className="h-full py-6">
      <div className="space-y-6">
        <div className="px-4 py-2">
          <div className="space-y-2">
            <div className="flex flex-col space-y-2">
              {navigationItems.map((route) => (
                <div key={route.href}>
                  <Button
                    asChild
                    variant={pathname === route.href ? "secondary" : "ghost"}
                    className="w-full justify-start px-4 py-3"
                  >
                    <Link href={route.href}>
                      {route.icon}
                      <span className="ml-3">{route.title}</span>
                    </Link>
                  </Button>
                </div>
              ))}
              {routes.map((route) => (
                <div key={route.href}>
                  <Button
                    asChild
                    variant={pathname === route.href ? "secondary" : "ghost"}
                    className="w-full justify-start px-4 py-3"
                  >
                    <Link href={route.href}>
                      <route.icon className="mr-3 h-4 w-4" />
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
