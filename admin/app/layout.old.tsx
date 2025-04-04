import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "../components/ui/toaster"
import { Navigation } from "../components/Navigation"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Urban Planning Portal",
  description: "Professional urban planning tools and resources",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex min-h-screen">
          <aside className="w-64 border-r p-4">
            <div className="mb-8">
              <h1 className="text-xl font-bold">Urban Planning Portal</h1>
            </div>
            <Navigation />
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
