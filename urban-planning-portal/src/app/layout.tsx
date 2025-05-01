import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "@shared/styles/globals.css"
import { Toaster } from "@shared/components/ui/toaster"
import { Providers } from "@shared/components/providers"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Urban Planning Portal",
  description: "Urban Planning Professionals Portal",
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
