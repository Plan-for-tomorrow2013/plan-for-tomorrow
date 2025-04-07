'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../ui/card'
import { Button } from '../../ui/button'
import { FileText, Download } from 'lucide-react'
import { useToast } from '../../ui/use-toast'
import { PrePreparedAssessmentProps } from './types'
import { WorkTicket } from '../../../../types/workTickets'

export function PrePreparedSection({ selectedJobId, jobAddress }: PrePreparedAssessmentProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [workTickets, setWorkTickets] = useState<WorkTicket[]>([])
  const { toast } = useToast()

  useEffect(() => {
    const loadWorkTickets = async () => {
      if (!selectedJobId) return

      try {
        setLoading(true)
        const response = await fetch('/api/work-tickets')
        if (!response.ok) throw new Error('Failed to load work tickets')

        const tickets: WorkTicket[] = await response.json()
        // Only show completed tickets for this specific job
        const relevantTickets = tickets.filter(t =>
          t.ticketType === 'pre-prepared-assessment' &&
          t.jobId === selectedJobId &&
          t.status === 'completed'
        )

        setWorkTickets(relevantTickets)
      } catch (error) {
        console.error('Error loading work tickets:', error)
        setError('Failed to load work tickets')
      } finally {
        setLoading(false)
      }
    }

    loadWorkTickets()
  }, [selectedJobId])

  const handleDownload = async (documentId: string) => {
    try {
      const response = await fetch(`/api/documents/${documentId}/download`)
      if (!response.ok) throw new Error('Failed to download document')

      // Get the filename from the Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition')
      const filename = contentDisposition?.split('filename="')[1]?.split('"')[0] || 'assessment.pdf'

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: 'Success',
        description: 'Document downloaded successfully'
      })
    } catch (error) {
      console.error('Error downloading document:', error)
      toast({
        title: 'Error',
        description: 'Failed to download document. Please try again.',
        variant: 'destructive'
      })
    }
  }

  if (loading) {
    return (
      <div className="text-center py-8 text-gray-500">Loading assessments...</div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">{error}</div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {workTickets.map((ticket) => (
        <Card key={ticket.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>{ticket.prePreparedAssessment?.assessmentType}</CardTitle>
            <CardDescription>
              Complying Development Certificate for {ticket.prePreparedAssessment?.assessmentType?.toLowerCase()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {ticket.completedDocument && (
                <div className="text-xs space-y-1 text-gray-600">
                  <div className="flex items-center justify-between mb-1">
                    <span>Document:</span>
                    <span className="font-medium">{ticket.completedDocument.fileName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Uploaded:</span>
                    <span>{new Date(ticket.completedDocument.uploadedAt).toLocaleDateString()}</span>
                  </div>
                  {ticket.completedDocument.returnedAt && (
                    <div className="flex items-center justify-between">
                      <span>Returned:</span>
                      <span>{new Date(ticket.completedDocument.returnedAt).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              )}
              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleDownload(ticket.prePreparedAssessment?.documentId || '')}
              >
                <Download className="h-4 w-4 mr-2" />
                Download Assessment
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
      {workTickets.length === 0 && (
        <div className="col-span-full text-center py-8 text-gray-500">
          <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium mb-2">No Pre-prepared Assessments</h3>
          <p className="text-sm">
            No pre-prepared assessments are available at this time.
          </p>
        </div>
      )}
    </div>
  )
}
