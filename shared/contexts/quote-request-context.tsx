"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'

interface QuoteRequestState {
  [consultantId: string]: {
    status: 'pending' | 'in_progress' | 'completed'
    timestamp: number
  }
}

interface QuoteRequestContextType {
  quoteRequests: QuoteRequestState
  updateQuoteRequestStatus: (jobId: string, consultantId: string, status: 'pending' | 'in_progress' | 'completed') => void
}

const QuoteRequestContext = createContext<QuoteRequestContextType | undefined>(undefined)

export function QuoteRequestProvider({ children }: { children: React.ReactNode }) {
  const [quoteRequests, setQuoteRequests] = useState<{ [jobId: string]: QuoteRequestState }>({})

  // Load quote request state from localStorage on mount
  useEffect(() => {
    const storedQuoteRequests = localStorage.getItem('quoteRequests')
    if (storedQuoteRequests) {
      setQuoteRequests(JSON.parse(storedQuoteRequests))
    }
  }, [])

  // Save quote request state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('quoteRequests', JSON.stringify(quoteRequests))
  }, [quoteRequests])

  const updateQuoteRequestStatus = (jobId: string, consultantId: string, status: 'pending' | 'in_progress' | 'completed') => {
    setQuoteRequests(prev => ({
      ...prev,
      [jobId]: {
        ...prev[jobId],
        [consultantId]: {
          status,
          timestamp: Date.now()
        }
      }
    }))
  }

  return (
    <QuoteRequestContext.Provider value={{
      quoteRequests: quoteRequests[Object.keys(quoteRequests)[0]] || {},
      updateQuoteRequestStatus
    }}>
      {children}
    </QuoteRequestContext.Provider>
  )
}

export function useQuoteRequests() {
  const context = useContext(QuoteRequestContext)
  if (context === undefined) {
    throw new Error('useQuoteRequests must be used within a QuoteRequestProvider')
  }
  return context
}
