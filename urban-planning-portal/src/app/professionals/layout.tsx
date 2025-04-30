"use client"

import { Inter } from "next/font/google"
import "@/app/globals.css"
import { Toaster } from "@/components/ui/toaster"
import { Navigation } from "@/components/Navigation"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useEffect } from "react"

const inter = Inter({ subsets: ["latin"] })

export default function ClientPortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      router.push('/professionals/dashboard');
    }
  }, [isLoggedIn, router]);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  return (
    <div className={inter.className}>
      <div className="flex min-h-screen">
        <aside className="w-64 border-r">
          <div className="mb-8 p-4">
            <h1 className="text-xl font-bold">Urban Planning Portal</h1>
          </div>
          <Navigation />
        </aside>
        <main className="flex-1">
          {children}
        </main>
      </div>
      <Toaster />
    </div>
  )
}
