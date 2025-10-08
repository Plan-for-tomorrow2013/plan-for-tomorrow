import React from "react"
import Link from "next/link"
import Image from "next/image"
import { LucideIcon } from "lucide-react"

interface CategoryCardProps {
  title: string
  icon: string | LucideIcon
  href: string
  description?: string
  quoteRequested?: boolean
}

export function CategoryCard({ title, icon, href, description, quoteRequested = false }: CategoryCardProps) {
  return (
    <Link href={href} className="block h-48">
      <div className={`h-full flex flex-col items-center p-6 border rounded-lg hover:shadow-md transition-shadow ${
        quoteRequested 
          ? 'bg-blue-50 border-blue-200 shadow-sm' 
          : 'bg-white'
      }`}>
        <div className="mb-4 w-24 h-24 relative flex items-center justify-center flex-shrink-0">
          {typeof icon === 'string' ? (
            <Image src={icon || "/placeholder.svg"} alt={title} width={96} height={96} className="object-contain" />
          ) : (
            React.createElement(icon, { className: "w-16 h-16 text-gray-600" })
          )}
        </div>
        <h3 className="text-lg font-semibold text-center mb-2 flex-shrink-0">{title}</h3>
        <div className="flex-1 flex flex-col justify-center min-h-0">
          {description && (
            <p className="text-sm text-gray-600 text-center leading-relaxed">{description}</p>
          )}
        </div>
        {quoteRequested && (
          <div className="mt-2 px-3 py-1 bg-blue-100 rounded-full flex-shrink-0">
          </div>
        )}
      </div>
    </Link>
  )
}
