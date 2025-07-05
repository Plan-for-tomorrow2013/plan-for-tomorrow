"use client"

import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "./button"

interface PageHeaderProps {
  title: string
  description?: string
  backHref?: string
  icon?: React.ReactNode
}

export function PageHeader({ title, description, backHref, icon }: PageHeaderProps) {
  return (
    <div className="flex items-center gap-4 mb-8">
      {backHref && (
        <Button variant="ghost" size="icon" asChild className="h-8 w-8">
          <Link href={backHref}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
      )}
      <div className="flex items-center gap-3">
        {icon && <div className="text-gray-600">{icon}</div>}
        <div>
          <h1 className="text-3xl font-bold">{title}</h1>
          {description && <p className="text-gray-500 mt-2">{description}</p>}
        </div>
      </div>
    </div>
  )
} 