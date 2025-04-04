"use client"

import { useState, useRef } from "react"
import { DollarSign, ChevronLeft, ChevronRight } from "lucide-react"
import { PageHeader } from "@/components/layout/page-header"
import { CategoryCard } from "@/components/quotes/category-card" // Updated import path
import { SearchBar } from "@/components/quotes/search-bar" // Updated import path
import { Button } from "@/components/ui/button"

export default function QuotesPage() {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(true)

  const categories = [
    {
      id: "nathers-basix",
      title: "NatHERS & BASIX",
      icon: "/placeholder.svg?height=100&width=100",
      href: "/quotes/nathers-basix",
      description: "Energy efficiency and sustainability consultants",
    },
    {
      id: "waste-management",
      title: "Waste Management",
      icon: "/placeholder.svg?height=100&width=100",
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
    <div className="p-6">
      <PageHeader
        title="Quotes"
        icon={<DollarSign className="h-6 w-6" />}
        subtitle="Request quotes from our trusted consultants"
      />

      <div className="max-w-6xl mx-auto mb-10">
        <SearchBar placeholder="Search consultants..." />
      </div>

      <div className="max-w-6xl mx-auto">
        {/* Fixed grid for first 6 items */}
        <div className="grid grid-cols-3 gap-6 mb-6">
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
          <div className="relative">
            <div
              className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-16 z-10"
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
              className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-16 z-10"
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
                  <CategoryCard
                    title={category.title}
                    icon={category.icon}
                    href={category.href}
                    description={category.description}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

