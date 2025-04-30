"use client"

import { useState, useRef } from "react"
import { DollarSign, ChevronLeft, ChevronRight, Trash, FileText, CheckCircle } from "lucide-react"
import { CategoryCard } from "@/components/quotes/category-card"
import { SearchBar } from "@/components/quotes/search-bar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card" // Added Card imports
import Link from "next/link"

interface CategoryCardProps {
  title: string;
  icon: string;
  href: string;
  description: string;
}

export default function QuotesPage() {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(true)

  const categories = [
    {
      id: "nathers-basix",
      title: "NatHERS & BASIX",
      icon: "/icons/nathers-basix.svg",
      href: "/quotes/nathers-basix",
      description: "Energy efficiency and sustainability consultants",
    },
    {
      id: "waste-management",
      title: "Waste Management",
      icon: "/icons/waste-management.svg",
      href: "/quotes/waste-management",
      description: "Waste management consultants and services",
    },
    {
      id: "cost-estimate",
      title: "Cost Estimate",
      icon: "/placeholder.svg?height=100&width=100",
      href: "/quotes/cost-estimate",
      description: "Cost estimation and quantity surveying",
    },
    {
      id: "stormwater",
      title: "Stormwater",
      icon: "/placeholder.svg?height=100&width=100",
      href: "/quotes/stormwater",
      description: "Stormwater management consultants",
    },
    {
      id: "traffic",
      title: "Traffic",
      icon: "/placeholder.svg?height=100&width=100",
      href: "/quotes/traffic",
      description: "Traffic impact assessment consultants",
    },
    {
      id: "surveyor",
      title: "Surveyor",
      icon: "/placeholder.svg?height=100&width=100",
      href: "/quotes/surveyor",
      description: "Land and construction surveyors",
    },
    {
      id: "bushfire",
      title: "Bushfire",
      icon: "/placeholder.svg?height=100&width=100",
      href: "/quotes/bushfire",
      description: "Bushfire assessment consultants",
    },
    {
      id: "flooding",
      title: "Flooding",
      icon: "/placeholder.svg?height=100&width=100",
      href: "/quotes/flooding",
      description: "Flood assessment consultants",
    },
    {
      id: "acoustic",
      title: "Acoustic",
      icon: "/placeholder.svg?height=100&width=100",
      href: "/quotes/acoustic",
      description: "Acoustic assessment consultants",
    },
    {
      id: "landscaping",
      title: "Landscaping",
      icon: "/placeholder.svg?height=100&width=100",
      href: "/quotes/landscaping",
      description: "Landscape architects and consultants",
    },
    {
      id: "heritage",
      title: "Heritage",
      icon: "/placeholder.svg?height=100&width=100",
      href: "/quotes/heritage",
      description: "Heritage impact consultants",
    },
    {
      id: "biodiversity",
      title: "Biodiversity",
      icon: "/placeholder.svg?height=100&width=100",
      href: "/quotes/biodiversity",
      description: "Biodiversity assessment consultants",
    },
    {
      id: "lawyer",
      title: "Lawyer",
      icon: "/placeholder.svg?height=100&width=100",
      href: "/quotes/lawyer",
      description: "Planning and property lawyers",
    },
    {
      id: "certifiers",
      title: "Certifiers",
      icon: "/placeholder.svg?height=100&width=100",
      href: "/quotes/certifiers",
      description: "Building certifiers and inspectors",
    },
    {
      id: "arborist",
      title: "Arborist",
      icon: "/placeholder.svg?height=100&width=100",
      href: "/quotes/arborist",
      description: "Tree assessment and arborist services",
    },
  ]

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
      setShowLeftArrow(scrollLeft > 0)
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 600
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      })
    }
  }

  // Split categories into visible and scrollable sections
  const visibleCategories = categories.slice(0, 6)
  const scrollableCategories = categories.slice(6)

  return (
    // Added container div with dashboard styling
    <div className="container mx-auto p-6 space-y-6">
      {/* Adjusted header section */}
      <div className="space-y-1"> {/* Added space-y-1 for title/description */}
        <h1 className="text-2xl font-bold flex items-center gap-2"> {/* Changed font-semibold to font-bold, added flex/gap */}
          <DollarSign className="h-6 w-6" />
          Quotes
        </h1>
        <p className="text-muted-foreground">Request quotes from our trusted consultants</p>
      </div>

      {/* Wrapped SearchBar in a Card for consistency */}
      <Card>
        <CardContent className="p-6">
          <SearchBar placeholder="Search consultants..." />
        </CardContent>
      </Card>

      {/* Main content area for categories */}
      <div className="space-y-6"> {/* Added space-y-6 */}
        {/* Fixed grid for first 6 items */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"> {/* Added responsive grid classes */}
          {visibleCategories.map((category) => (
            <CategoryCard
              key={category.id}
              title={category.title}
              icon={category.icon}
              href={category.href}
              description={category.description}
            />
          ))}
        </div>

        {/* Scrollable section for remaining items */}
        {scrollableCategories.length > 0 && (
          <div className="space-y-4"> {/* Added space-y-4 */}
            <h2 className="text-xl font-semibold">Other Categories</h2> {/* Added title for scrollable section */}
            <div className="relative">
              <div
                className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 z-10" // Adjusted horizontal translation
              style={{ display: showLeftArrow ? "block" : "none" }}
            >
              <Button
                variant="outline"
                size="icon"
                className="h-12 w-12 rounded-full bg-background shadow-lg border-primary"
                onClick={() => scroll("left")}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              </div>

              <div
                className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 z-10" // Adjusted horizontal translation
              style={{ display: showRightArrow ? "block" : "none" }}
            >
              <Button
                variant="outline"
                size="icon"
                className="h-12 w-12 rounded-full bg-background shadow-lg border-primary"
                onClick={() => scroll("right")}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </div>

            <div
              ref={scrollContainerRef}
              className="flex overflow-x-auto gap-6 pb-6 scroll-smooth hide-scrollbar"
              onScroll={handleScroll}
            >
              {scrollableCategories.map((category) => (
                <div key={category.id} className="flex-none w-[300px]">
                  <LocalCategoryCard
                    title={category.title}
                    icon={category.icon}
                    href={category.href}
                    description={category.description}
                  />
                </div>
              ))}
            </div>
          </div> {/* Closes div.relative */}
        </div> // Closes the added div.space-y-4
        )} {/* Correctly placed closing parenthesis for the conditional block */}
      </div>
    </div>
  )
}

const LocalCategoryCard: React.FC<CategoryCardProps> = ({ title, icon, href, description }) => {
  return (
    <Link href={href}>
      <div className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
        <div className="flex items-center">
          {icon && <img src={icon} alt={title} className="h-10 w-10 mr-2" />}
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </Link>
  );
};
