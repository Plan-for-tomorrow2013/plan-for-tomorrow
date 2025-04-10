"use client"

import { Inter } from "next/font/google"
import "@/app/globals.css"
import { Toaster } from "@/components/ui/toaster"
import { Navigation } from "@/components/Navigation"
import { FileText, Menu, FileCheck, BellRing, ClipboardCheck, BookOpen, HomeIcon } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useEffect } from "react"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      router.push('/client-portal/dashboard');
    }
  }, [isLoggedIn, router]);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  return (
    <html lang="en">
      <head>
        {/* Add any head elements here, like title, meta tags, etc. */}
      </head>
      <body>
        <div className="flex min-h-screen">
          <aside className="w-64 border-r p-4">
            <div className="mb-8">
              <h1 className="text-xl font-bold">Urban Planning Portal</h1>
            </div>
            <nav>
              <ul>
                <li>
                  <Link href="/client-portal/dashboard">Dashboard</Link>
                </li>
                <li>
                  <Link href="/client-portal/initial-assessment">Initial Assessment</Link>
                </li>
                <li>
                  <Link href="/client-portal/report-writer">Report Writer</Link>
                </li>
                <li>
                  <Link href="/client-portal/knowledge-base">Knowledge Base</Link>
                </li>
                <li>
                  <Link href="/client-portal/jobs">Jobs</Link>
                </li>
                <li>
                  <Link href="/client-portal/design-check">Design Check</Link>
                </li>
                <li>
                  <Link href="/client-portal/quotes">Quotes</Link>
                </li>
                <li>
                  <Link href="/client-portal/account">Account</Link>
                </li>
                <li>
                  <Link href="/client-portal/logout">Log Out</Link>
                </li>
                <li>
                  <Link href="/client-portal/help">Help</Link>
                </li>
              </ul>
            </nav>
          </aside>
          <main className="flex-1">
            {children}
          </main>
        </div>
        <Toaster />
      </body>
    </html>
  )
}
