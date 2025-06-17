"use client"

import { useState } from "react"
import { Mail, Phone, Edit2, Save, X, Clock } from "lucide-react"
import { Button } from "@shared/components/ui/button"
import { Textarea } from "@shared/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@shared/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@shared/components/ui/dialog"
import { Input } from "@shared/components/ui/input"
import { Label } from "@shared/components/ui/label"
import { useToast } from "@shared/components/ui/use-toast"
import { updateConsultantNotes } from "../actions"
import { ConsultantCategory } from "@shared/types/jobs"
import { useDocuments } from '@shared/contexts/document-context'

interface Consultant {
  id: string
  name: string
  email: string
  phone: string
  company: string
  notes: string
  category: ConsultantCategory
  logo?: string
}

interface ConsultantCardProps {
  consultant: Consultant
  jobs: Array<{ id: string; address: string; documents: Array<{ id: string; name: string }> }>
}

export function ConsultantCard({ consultant, jobs }: ConsultantCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [notes, setNotes] = useState(consultant.notes)
  const [developmentType, setDevelopmentType] = useState("")
  const [additionalInfo, setAdditionalInfo] = useState("")
  const [showDialog, setShowDialog] = useState(false)
  const { toast } = useToast()
  const { documents } = useDocuments()

  // Assume jobs always has one job (from URL context)
  const job = jobs[0]
  // Remove duplicates by document id and name
  const attachedDocs = documents
    .filter(doc => doc.uploadedFile) // Only include documents with an uploaded file
    .map(doc => ({
      id: doc.id,
      name: doc.uploadedFile?.originalName || doc.title
    }))

  const handleSaveNotes = async () => {
    try {
      await updateConsultantNotes(consultant.id, notes)
      setIsEditing(false)
      toast({
        title: "Notes Updated",
        description: "Consultant notes have been saved successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update notes. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleRequestQuote = async ({ developmentType, additionalInfo }: { developmentType: string, additionalInfo: string }) => {
    if (!job) {
      toast({ title: "Error", description: "No job found.", variant: "destructive" })
      return
    }

    try {
      console.log('Starting consultant ticket creation')

      // Get the documents from the context
      const certificateOfTitle = documents.find(doc => doc.id === 'certificateOfTitle')
      const surveyPlan = documents.find(doc => doc.id === 'surveyPlan')
      const certificate107 = documents.find(doc => doc.id === 'tenSevenCertificate')

      // Create the consultant ticket payload with the correct structure
      const consultantTicketPayload = {
        jobId: job.id,
        jobAddress: job.address,
        category: consultant.category, // Using category instead of ticketType
        status: 'pending',
        createdAt: new Date().toISOString(),
        assessment: { // Using assessment as the key (matching your working example)
          developmentType,
          additionalInfo,
          documents: {
            certificateOfTitle: {
              originalName: certificateOfTitle?.uploadedFile?.originalName,
              fileName: certificateOfTitle?.uploadedFile?.fileName
            },
            surveyPlan: {
              originalName: surveyPlan?.uploadedFile?.originalName,
              fileName: surveyPlan?.uploadedFile?.fileName
            },
            certificate107: {
              originalName: certificate107?.uploadedFile?.originalName,
              fileName: certificate107?.uploadedFile?.fileName
            }
          }
        }
      }
      console.log('Consultant ticket payload:', consultantTicketPayload)

      const formData = new FormData()
      formData.append('metadata', JSON.stringify(consultantTicketPayload))
      console.log('FormData prepared with metadata')

      console.log('Sending request to /api/consultant-tickets')
      const ticketResponse = await fetch('/api/consultant-tickets', {
        method: 'POST',
        body: formData
      })

      if (!ticketResponse.ok) {
        const errorData = await ticketResponse.json().catch(() => ({}))
        console.error('Failed to create consultant ticket:', errorData)
        throw new Error(errorData.error || 'Failed to create consultant ticket')
      }
      console.log('Consultant ticket created successfully')

      toast({
        title: "Quote Requested",
        description: "Your quote request has been sent successfully.",
      })
    } catch (error) {
      console.error('Error in handleRequestQuote:', error)
      toast({
        title: "Error",
        description: "Failed to send quote request. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-3">
        {consultant.logo ? (
          <img src={consultant.logo} alt="Logo" className="h-10 w-10 rounded-full object-cover border" />
        ) : (
          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold border">
            {consultant.name ? consultant.name[0] : '?'}
          </div>
        )}
        <CardTitle>{consultant.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center text-sm text-gray-600">
              <Mail className="h-4 w-4 mr-2" />
              <a href={`mailto:${consultant.email}`} className="hover:underline">
                {consultant.email}
              </a>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Phone className="h-4 w-4 mr-2" />
              <a href={`tel:${consultant.phone}`} className="hover:underline">
                {consultant.phone}
              </a>
            </div>
            <div className="text-sm text-gray-600">
              <strong>Company:</strong> {consultant.company}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Notes</Label>
              {isEditing ? (
                <div className="space-x-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setNotes(consultant.notes)
                      setIsEditing(false)
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={handleSaveNotes}>
                    <Save className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button size="sm" variant="ghost" onClick={() => setIsEditing(true)}>
                  <Edit2 className="h-4 w-4" />
                </Button>
              )}
            </div>
            {isEditing ? (
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about this consultant..."
                className="min-h-[100px]"
              />
            ) : (
              <div className="text-sm text-gray-600 min-h-[100px] p-2 bg-gray-50 rounded-md">
                {notes || "No notes added yet."}
              </div>
            )}
          </div>

          <Button
            className="w-full"
            onClick={() => {
              setShowDialog(true);
            }}
          >
            Request Quote
          </Button>

          {showDialog && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg max-w-md w-full">
                <h2 className="text-lg font-semibold mb-2">Request Quote</h2>
                <p className="text-sm text-gray-600 mb-4">
                  Request a quote from {consultant.name} for your project.
                </p>

                <div className="space-y-4 py-4">
                  <div>
                    <Label>Development Type</Label>
                    <Input
                      placeholder="Enter the type of development"
                      value={developmentType}
                      onChange={e => setDevelopmentType(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Additional Information</Label>
                    <Textarea
                      placeholder="Enter any additional information about your development"
                      value={additionalInfo}
                      onChange={e => setAdditionalInfo(e.target.value)}
                      rows={4}
                      className="mt-1"
                    />
                  </div>
                  {attachedDocs.length > 0 && (
                    <div className="space-y-2 border-t pt-4 mt-4">
                      <h4 className="font-medium text-gray-700">Documents to be Attached</h4>
                      <p className="text-xs text-gray-500">The following documents will be included with your submission:</p>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        {attachedDocs.map(doc => (
                          <li key={doc.id}>{doc.name}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2 mt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      handleRequestQuote({ developmentType, additionalInfo });
                      setShowDialog(false);
                    }}
                    disabled={!developmentType.trim()}
                  >
                    Send Request
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
