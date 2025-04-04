"use client"

import { useState } from "react"
import { ArrowLeft, Search } from "lucide-react"
import Link from "next/link"
import { ConsultantCard } from "@/components/quotes/consultant-card"
import { ConsultantForm } from "@/components/quotes/consultant-form"
import { Input } from "@/components/ui/input"

// This would typically come from your API
const mockJobs = [
  {
    id: "job1",
    address: "123 Main St, Sydney",
    documents: [
      { id: "doc1", name: "Site Plans" },
      { id: "doc2", name: "Elevations" },
    ],
  },
  {
    id: "job2",
    address: "456 Park Ave, Melbourne",
    documents: [
      { id: "doc3", name: "Floor Plans" },
      { id: "doc4", name: "Section Drawings" },
    ],
  },
]

// This would typically come from your API
const mockConsultants = {
  "nathers-basix": [
    {
      id: "1",
      name: "John Smith",
      email: "john@example.com",
      phone: "0400 000 000",
      company: "EcoRate Solutions",
      notes: "Preferred consultant for residential projects",
      category: "NatHERS & BASIX",
    },
    {
      id: "2",
      name: "Sarah Johnson",
      email: "sarah@example.com",
      phone: "0400 000 001",
      company: "Sustainable Designs",
      notes: "Specializes in commercial projects",
      category: "NatHERS & BASIX",
    },
  ],
  "waste-management": [
    {
      id: "3",
      name: "Michael Brown",
      email: "michael@example.com",
      phone: "0400 000 002",
      company: "Waste Solutions",
      notes: "Experienced in large-scale projects",
      category: "Waste Management",
    },
  ],
  // Add more categories as needed
}

const categoryTitles: { [key: string]: string } = {
  "nathers-basix": "NatHERS & BASIX",
  "waste-management": "Waste Management",
  "cost-estimate": "Cost Estimate",
  stormwater: "Stormwater",
  certifiers: "Certifiers",
  arborist: "Arborist",
}

export default function QuoteCategoryPage({ params }: { params: { category: string } }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [consultants, setConsultants] = useState(mockConsultants[params.category as keyof typeof mockConsultants] || [])

  const filteredConsultants = consultants.filter(
    (consultant) =>
      consultant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      consultant.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      consultant.notes.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleUpdateNotes = (id: string, notes: string) => {
    setConsultants(consultants.map((c) => (c.id === id ? { ...c, notes } : c)))
  }

  const handleAddConsultant = (newConsultant: any) => {
    setConsultants([...consultants, newConsultant])
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Link href="/quotes" className="flex items-center text-primary hover:underline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Quotes
          </Link>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">{categoryTitles[params.category]} Consultants</h1>
          <ConsultantForm category={categoryTitles[params.category]} onAdd={handleAddConsultant} />
        </div>

        <div className="mb-6">
          <div className="relative max-w-xl">
            <Input
              type="text"
              placeholder="Search consultants..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredConsultants.map((consultant) => (
            <ConsultantCard
              key={consultant.id}
              consultant={consultant}
              onUpdateNotes={handleUpdateNotes}
              jobs={mockJobs}
            />
          ))}
        </div>

        {filteredConsultants.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No consultants found</h3>
            <p className="text-gray-500">
              {searchQuery
                ? "Try adjusting your search terms or add a new consultant."
                : "No consultants available for this category yet. Add your first consultant!"}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

