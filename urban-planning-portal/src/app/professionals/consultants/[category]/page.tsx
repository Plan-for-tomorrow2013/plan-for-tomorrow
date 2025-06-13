"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Search, Loader2 } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { ConsultantCard } from "../components/consultant-card"
import { Input } from "@shared/components/ui/input"

const categoryTitles: { [key: string]: string } = {
  "Cost Estimate": "Cost Estimate",
  "Stormwater": "Stormwater",
  "NatHERS & BASIX": "NatHERS & BASIX",
  "Waste Management": "Waste Management",
  "Certifiers": "Certifiers",
  "Arborist": "Arborist",
}

export default function QuoteCategoryPage({ params }: { params: { category: string } }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const jobParam = searchParams.get('job')
  const [jobId, categoryFromParam] = jobParam?.split('/') || [null, null]
  const currentCategory = categoryFromParam || params.category
  const [searchQuery, setSearchQuery] = useState("")
  const [consultants, setConsultants] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    fetch(`/api/consultants?category=${encodeURIComponent(currentCategory)}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch consultants')
        return res.json()
      })
      .then(data => setConsultants(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [currentCategory])

  const filteredConsultants = consultants.filter(
    (consultant) =>
      consultant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      consultant.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      consultant.notes.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleUpdateNotes = (id: string, notes: string) => {
    setConsultants(consultants.map((c) => (c.id === id ? { ...c, notes } : c)))
  }

  const handleBack = () => {
    if (jobId) {
      router.push(`/professionals/consultants?job=${jobId}`)
    } else {
      router.push('/professionals/consultants')
    }
  }

  const categoryTitle = categoryTitles[currentCategory as keyof typeof categoryTitles] || currentCategory

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <button
            onClick={handleBack}
            className="flex items-center text-primary hover:underline"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to categories
          </button>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">{categoryTitle} Consultants</h1>
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

        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="mx-auto h-8 w-8 animate-spin mb-4" />
            <p>Loading consultants...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-500">
            <h3 className="text-lg font-medium mb-2">Error loading consultants</h3>
            <p>{error}</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredConsultants.map((consultant) => (
                <ConsultantCard
                  key={consultant.id}
                  consultant={consultant}
                  onUpdateNotes={handleUpdateNotes}
                  jobs={[]}
                />
              ))}
            </div>
            {filteredConsultants.length === 0 && (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No consultants found</h3>
                <p className="text-gray-500">
                  {searchQuery
                    ? "Try adjusting your search terms."
                    : "No consultants available for this category yet."}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
