"use client"

import { useSearchParams } from "next/navigation"
import { FormProvider } from "@/app/professionals/SoEE/lib/form-context"

interface JobAwareFormProviderProps {
  children: React.ReactNode
}

export function JobAwareFormProvider({ children }: JobAwareFormProviderProps) {
  const searchParams = useSearchParams()
  const jobId = searchParams.get("job")

  return (
    <FormProvider jobId={jobId || undefined}>
      {children}
    </FormProvider>
  )
} 