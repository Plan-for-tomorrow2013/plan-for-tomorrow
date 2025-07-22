import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { FormProvider } from "@/app/professionals/SoEE/lib/form-context"
import { Toaster } from "@shared/components/ui/toaster"
import { JobAwareFormProvider } from "@/app/professionals/SoEE/components/job-aware-form-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Statement of Environmental Effects Generator",
  description: "Generate a basic Statement of Environmental Effects for your development application",
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <JobAwareFormProvider>
      {children}
      <Toaster />
    </JobAwareFormProvider>
  )
}
