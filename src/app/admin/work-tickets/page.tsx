"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FileText, Clock, Upload, Bell } from 'lucide-react'
import { WorkTicket } from '@/types/workTickets'
import { useToast } from '@/components/ui/use-toast'
import { PageHeader } from "@/components/ui/page-header"

export default function WorkTicketsPage() {
  const [tickets, setTickets] = useState<WorkTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await fetch('/api/work-tickets')
        if (!response.ok) {
          throw new Error('Failed to fetch work tickets')
        }
        const data = await response.json()
        setTickets(data)
      } catch (error) {
        console.error('Error fetching work tickets:', error)
        setError('Failed to load work tickets')
      } finally {
        setLoading(false)
      }
    }

    fetchTickets()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'in-progress':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleUploadDocument = async (ticketId: string, file: File) => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('ticketId', ticketId)

      const response = await fetch('/api/work-tickets/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to upload document')
      }

      const updatedTicket = await response.json()
      setTickets(tickets.map(ticket => 
        ticket.id === ticketId ? updatedTicket : ticket
      ))

      toast({
        title: 'Document uploaded successfully',
        description: 'The completed assessment has been uploaded.',
      })
    } catch (error) {
      console.error('Error uploading document:', error)
      toast({
        title: 'Error uploading document',
        description: 'Failed to upload the document. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleReturnDocument = async (ticketId: string) => {
    try {
      const response = await fetch('/api/work-tickets/return', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ticketId }),
      })

      if (!response.ok) {
        throw new Error('Failed to return document')
      }

      const updatedTicket = await response.json()
      setTickets(tickets.map(ticket => 
        ticket.id === ticketId ? updatedTicket : ticket
      ))

      toast({
        title: 'Document processed successfully',
        description: 'The assessment document has been added to the document store.',
      })
    } catch (error) {
      console.error('Error returning document:', error)
      toast({
        title: 'Error processing document',
        description: 'Failed to process the document. Please try again.',
        variant: 'destructive',
      })
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <PageHeader
          title="Work Tickets"
          description="View and manage work tickets"
          backHref="/admin"
        />
        <div className="p-6">Loading work tickets...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <PageHeader
          title="Work Tickets"
          description="View and manage work tickets"
          backHref="/admin"
        />
        <div className="p-6 text-red-500">{error}</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <PageHeader
        title="Work Tickets"
        description="View and manage work tickets"
        backHref="/admin"
      />
      
      <div className="grid gap-6">
        {tickets.map((ticket) => (
          <Card key={ticket.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">
                    {ticket.ticketType === 'custom-assessment' ? 'Custom Assessment' : 'Pre-Prepared Assessment'}
                  </CardTitle>
                  <p className="text-sm text-gray-500">{ticket.jobAddress}</p>
                </div>
                <Badge className={getStatusColor(ticket.status)}>
                  {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {ticket.customAssessment && (
                  <>
                    <div>
                      <h3 className="font-medium mb-2">Development Details</h3>
                      <p className="text-sm mb-1">
                        <strong>Type:</strong> {ticket.customAssessment.developmentType}
                      </p>
                      <p className="text-sm">
                        <strong>Additional Info:</strong> {ticket.customAssessment.additionalInfo}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-medium mb-2">Attached Documents</h3>
                      <div className="space-y-2">
                        {ticket.customAssessment.documents.certificateOfTitle && (
                          <div className="flex items-center text-sm">
                            <FileText className="h-4 w-4 mr-2" />
                            <span>Certificate of Title: {ticket.customAssessment.documents.certificateOfTitle}</span>
                          </div>
                        )}
                        {ticket.customAssessment.documents.surveyPlan && (
                          <div className="flex items-center text-sm">
                            <FileText className="h-4 w-4 mr-2" />
                            <span>Survey Plan: {ticket.customAssessment.documents.surveyPlan}</span>
                          </div>
                        )}
                        {ticket.customAssessment.documents.certificate107 && (
                          <div className="flex items-center text-sm">
                            <FileText className="h-4 w-4 mr-2" />
                            <span>10.7 Certificate: {ticket.customAssessment.documents.certificate107}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
                <div className="border-t pt-4 mt-4">
                  <h3 className="font-medium mb-2">Completed Assessment</h3>
                  {ticket.completedDocument ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm">
                          <FileText className="h-4 w-4 mr-2" />
                          <span>{ticket.completedDocument.fileName}</span>
                        </div>
                        {!ticket.completedDocument.returnedAt && (
                          <Button
                            size="sm"
                            onClick={() => handleReturnDocument(ticket.id)}
                            className="flex items-center"
                          >
                            <Bell className="h-4 w-4 mr-2" />
                            Add to Document Store
                          </Button>
                        )}
                      </div>
                      {ticket.completedDocument.returnedAt && (
                        <div className="text-sm text-gray-500">
                          <p>Document added to:</p>
                          <ul className="list-disc list-inside mt-1">
                            <li>Initial Assessment Document Store</li>
                            <li>Job Document Store</li>
                          </ul>
                          <p className="mt-2">
                            Added: {new Date(ticket.completedDocument.returnedAt).toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <label htmlFor={`file-upload-${ticket.id}`} className="cursor-pointer">
                        <div className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800">
                          <Upload className="h-4 w-4" />
                          <span>Upload Completed Assessment</span>
                        </div>
                      </label>
                      <input
                        id={`file-upload-${ticket.id}`}
                        type="file"
                        className="hidden"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            handleUploadDocument(ticket.id, file)
                          }
                        }}
                      />
                    </div>
                  )}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>Created: {new Date(ticket.createdAt).toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {tickets.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No work tickets found
          </div>
        )}
      </div>
    </div>
  )
} 