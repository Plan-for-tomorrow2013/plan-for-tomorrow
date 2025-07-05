import Link from "next/link"
import Image from "next/image"

interface CategoryCardProps {
  title: string
  icon: string
  href: string
  description?: string
  quoteRequested?: boolean
}

export function CategoryCard({ title, icon, href, description, quoteRequested = false }: CategoryCardProps) {
  return (
    <Link href={href}>
      <div className={`flex flex-col items-center p-6 border rounded-lg hover:shadow-md transition-shadow ${
        quoteRequested 
          ? 'bg-blue-50 border-blue-200 shadow-sm' 
          : 'bg-white'
      }`}>
        <div className="mb-4 w-24 h-24 relative">
          <Image src={icon || "/placeholder.svg"} alt={title} width={96} height={96} className="object-contain" />
        </div>
        <h3 className="text-lg font-semibold text-center mb-2">{title}</h3>
        {description && (
          <p className="text-sm text-gray-600 text-center mb-4">{description}</p>
        )}
        {quoteRequested && (
          <div className="mt-2 px-3 py-1 bg-blue-100 rounded-full">
          </div>
        )}
      </div>
    </Link>
  )
}
