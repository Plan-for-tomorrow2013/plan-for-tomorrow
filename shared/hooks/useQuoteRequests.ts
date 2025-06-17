import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

interface QuoteRequestState {
  [consultantId: string]: {
    status: 'pending' | 'in_progress' | 'completed'
    timestamp: number
  }
}

interface QuoteRequests {
  [jobId: string]: QuoteRequestState
}

// Fetch quote requests from localStorage
const fetchQuoteRequests = (): QuoteRequests => {
  if (typeof window === 'undefined') return {}
  const stored = localStorage.getItem('quoteRequests')
  return stored ? JSON.parse(stored) : {}
}

// Save quote requests to localStorage
const saveQuoteRequests = (data: QuoteRequests) => {
  if (typeof window === 'undefined') return
  localStorage.setItem('quoteRequests', JSON.stringify(data))
}

export function useQuoteRequests(jobId: string) {
  const queryClient = useQueryClient()
  const queryKey = ['quoteRequests', jobId]

  // Query to get quote requests
  const { data: quoteRequests = {} } = useQuery({
    queryKey,
    queryFn: () => {
      const allRequests = fetchQuoteRequests()
      return allRequests[jobId] || {}
    },
    staleTime: Infinity, // Never consider the data stale
  })

  // Mutation to update quote request status
  const { mutate: updateQuoteRequestStatus } = useMutation({
    mutationFn: async ({ consultantId, status }: { consultantId: string; status: 'pending' | 'in_progress' | 'completed' }) => {
      const allRequests = fetchQuoteRequests()
      const updatedRequests = {
        ...allRequests,
        [jobId]: {
          ...allRequests[jobId],
          [consultantId]: {
            status,
            timestamp: Date.now()
          }
        }
      }
      saveQuoteRequests(updatedRequests)
      return Promise.resolve(updatedRequests[jobId])
    },
    onSuccess: (data) => {
      queryClient.setQueryData(queryKey, data)
    }
  })

  return {
    quoteRequests,
    updateQuoteRequestStatus
  }
}
