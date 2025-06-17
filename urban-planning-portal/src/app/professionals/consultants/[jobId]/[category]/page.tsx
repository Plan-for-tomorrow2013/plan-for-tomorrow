"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Search, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { ConsultantCard } from "../../components/consultant-card"
import { Input } from "@shared/components/ui/input"
import { Button } from "@shared/components/ui/button"
import { DocumentProvider } from '@shared/contexts/document-context'
import { useQuoteRequests } from '@shared/hooks/useQuoteRequests'

// Add interface for quote request state
interface QuoteRequestState {
  [consultantId: string]: {
    status: 'pending' | 'in_progress' | 'completed'
    timestamp: number
  }
}

const categoryTitles: { [key: string]: string } = {
  "NatHERS & BASIX": "NatHERS & BASIX",
  "Waste Management": "Waste Management",
  "Cost Estimate": "Cost Estimate",
  "Stormwater": "Stormwater",
  "Traffic": "Traffic",
  "Surveyor": "Surveyor",
  "Bushfire": "Bushfire",
  "Flooding": "Flooding",
  "Acoustic": "Acoustic",
  "Landscaping": "Landscaping",
  "Heritage": "Heritage",
  "Biodiversity": "Biodiversity",
  "Lawyer": "Lawyer",
  "Certifiers": "Certifiers",
  "Arborist": "Arborist",
  "Geotechnical": "Geotechnical"
}

export default function QuoteCategoryPage({ params }: { params: { jobId: string; category: string } }) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [consultants, setConsultants] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [job, setJob] = useState<any>(null)
  const { quoteRequests, updateQuoteRequestStatus } = useQuoteRequests(params.jobId)

  useEffect(() => {
    // Fetch job details
    console.log('Fetching job:', params.jobId)
    fetch(`/api/jobs/${params.jobId}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch job details')
        return res.json()
      })
      .then(data => {
        console.log('Job data:', data)
        if (data.redirectUrl) {
          // If we got a redirect URL, navigate to it
          console.log('Redirecting to:', data.redirectUrl)
          router.push(data.redirectUrl)
          return
        }
        setJob(data)
      })
      .catch(err => {
        console.error('Error with job:', err)
        setError(err.message)
      })
  }, [params.jobId, router])

  useEffect(() => {
    setLoading(true)
    setError(null)
    fetch(`/api/consultants?category=${encodeURIComponent(params.category)}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch consultants')
        return res.json()
      })
      .then(data => setConsultants(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [params.category])

  const filteredConsultants = consultants.filter(
    (consultant) =>
      consultant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      consultant.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      consultant.notes.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Transform job data into the format expected by ConsultantCard
  const jobsData = job ? [{
    id: job.id,
    address: job.address,
    documents: Object.entries(job.documents || {}).map(([id, doc]: [string, any]) => ({
      id,
      name: doc.originalName
    }))
  }] : []

  return (
    <DocumentProvider jobId={params.jobId}>
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">{categoryTitles[params.category] || params.category}</h1>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search consultants..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
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
                  jobs={jobsData}
                  initialReportStatus={quoteRequests[consultant.id]?.status || null}
                  onReportStatusChange={(status) => updateQuoteRequestStatus({ consultantId: consultant.id, status })}
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
    </DocumentProvider>
  )
}
