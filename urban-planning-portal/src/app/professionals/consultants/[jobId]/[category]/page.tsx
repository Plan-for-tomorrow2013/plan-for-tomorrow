"use client"

import { useState, useMemo } from "react"
import { ArrowLeft, Search, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { ConsultantCard } from "../../components/consultant-card"
import { Input } from "@shared/components/ui/input"
import { Button } from "@shared/components/ui/button"
import { DocumentProvider } from '@shared/contexts/document-context'
import { useQuoteRequests } from '@shared/hooks/useQuoteRequests'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from "react"

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
  const queryClient = useQueryClient();
  const {
    data: job,
    isLoading: isJobLoading,
    error: jobError,
    refetch: refetchJob,
  } = useQuery({
    queryKey: ['job', params.jobId],
    queryFn: async () => {
      const res = await fetch(`/api/jobs/${params.jobId}`);
      if (!res.ok) throw new Error('Failed to fetch job details');
      return res.json();
    },
    enabled: !!params.jobId,
    staleTime: 0,
  });
  const { quoteRequests, updateQuoteRequestStatus } = useQuoteRequests(params.jobId)
  // Fetch consultant tickets for this job
  const { data: consultantTickets, isLoading: isTicketsLoading } = useQuery({
    queryKey: ['consultant-tickets', params.jobId],
    queryFn: async () => {
      const res = await fetch('/api/consultant-tickets');
      if (!res.ok) throw new Error('Failed to fetch consultant tickets');
      return res.json();
    },
    enabled: !!params.jobId,
    staleTime: 0,
  });

  // Filter tickets for this job and category
  const ticketsForCategory = useMemo(() => {
    if (!consultantTickets) return [];
    return consultantTickets.filter((t: any) => t.jobId === params.jobId && t.category === params.category);
  }, [consultantTickets, params.jobId, params.category]);

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
  const jobsData = job ? [job] : []

  // Debug: Log tickets and consultants before mapping
  console.log('ticketsForCategory', ticketsForCategory);
  console.log('filteredConsultants', filteredConsultants.map(c => c.id));

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
                  refetchJob={refetchJob}
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
