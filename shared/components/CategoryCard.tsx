import Link from "next/link"
import Image from "next/image"

interface CategoryCardProps {
  title: string
  icon: string
  href: string
  description?: string
}

export function CategoryCard({ title, icon, href, description }: CategoryCardProps) {
  return (
    <Link href={href}>
      <div className="flex flex-col items-center p-6 border rounded-lg hover:shadow-md transition-shadow bg-white">
        <div className="mb-4 w-24 h-24 relative">
          <Image src={icon || "/placeholder.svg"} alt={title} width={96} height={96} className="object-contain" />
        </div>
        <h3 className="text-lg font-semibold text-center">{title}</h3>
        {description && <p className="text-sm text-gray-500 text-center mt-2">{description}</p>}
      </div>
    </Link>
  )
}
