"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"
import { Input } from "@shared/components/ui/input"
import { Button } from "@shared/components/ui/button"

interface SearchBarProps {
  placeholder?: string
  category?: string
}

export function SearchBar({ placeholder = "Search knowledge base...", category }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    const queryParams = new URLSearchParams()
    queryParams.set("q", searchQuery)
    if (category) {
      queryParams.set("category", category)
    }

    router.push(`/knowledge-base/search?${queryParams.toString()}`)
  }

  return (
    <form onSubmit={handleSearch} className="w-full max-w-xl mx-auto">
      <div className="relative">
        <Input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pr-10"
        />
        <Button type="submit" variant="ghost" size="icon" className="absolute right-0 top-0 h-full">
          <Search className="h-4 w-4" />
          <span className="sr-only">Search</span>
        </Button>
      </div>
    </form>
  )
}
