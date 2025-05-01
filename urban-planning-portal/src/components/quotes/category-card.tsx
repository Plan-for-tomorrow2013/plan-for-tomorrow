import Link from "next/link"
import { Card, CardHeader, CardTitle, CardDescription } from "@shared/components/ui/card"
import Image from "next/image"

interface CategoryCardProps {
  title: string
  icon: string
  href: string
  description: string
}

export function CategoryCard({ title, icon, href, description }: CategoryCardProps) {
  return (
    <Link href={href}>
      <Card className="hover:bg-gray-50 transition-colors cursor-pointer h-full">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="relative w-6 h-6">
              <Image
                src={icon}
                alt={title}
                fill
                className="object-contain"
              />
            </div>
            <CardTitle className="text-lg">{title}</CardTitle>
          </div>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
      </Card>
    </Link>
  )
}