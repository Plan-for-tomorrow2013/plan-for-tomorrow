import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "@shared/styles/globals.css"
import { Toaster } from "@shared/components/ui/toaster"
import { Providers } from "@shared/components/providers"
import QueryProvider from "./QueryProvider"
import { existsSync, mkdirSync } from 'fs'
import path from 'path'

const inter = Inter({ subsets: ["latin"] })

// Ensure required directories exist
const dataDir = path.join(process.cwd(), 'urban-planning-portal', 'data')
const jobsDir = path.join(dataDir, 'jobs')

try {
  if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true })
  }
  if (!existsSync(jobsDir)) {
    mkdirSync(jobsDir, { recursive: true })
  }
} catch (error) {
  console.error('Error creating data directories:', error)
}

export const metadata: Metadata = {
  title: "Urban Planning Portal",
  description: "Urban Planning Professionals Portal",
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <QueryProvider>
          <Providers>
            {children}
            <Toaster />
          </Providers>
        </QueryProvider>
      </body>
    </html>
  )
}
