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

interface Consultant {
  id: string
  name: string
  email: string
  phone: string
  company: string
  notes: string
  category: string
}

interface ConsultantCardProps {
  consultant: Consultant
  onUpdateNotes: (id: string, notes: string) => void
  jobs: Array<{ id: string; address: string; documents: Array<{ id: string; name: string }> }>
}

export function ConsultantCard({ consultant, onUpdateNotes, jobs }: ConsultantCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [notes, setNotes] = useState(consultant.notes)
  const [selectedJob, setSelectedJob] = useState("")
  const [selectedDocs, setSelectedDocs] = useState<string[]>([])
  const [timeframe, setTimeframe] = useState("")
  const [specialDetails, setSpecialDetails] = useState("")
  const { toast } = useToast()

  const handleSaveNotes = () => {
    onUpdateNotes(consultant.id, notes)
    setIsEditing(false)
    toast({
      title: "Notes Updated",
      description: "Consultant notes have been saved successfully.",
    })
  }

  const handleRequestQuote = async () => {
    const job = jobs.find((j) => j.id === selectedJob)
    if (!job) return

    const emailSubject = `New quote request from ${localStorage.getItem("userName")} for ${consultant.category} at ${job.address}`
    const emailBody = `
      Job Description: ${job.address}
      Timeframe: ${timeframe}
      Special Details: ${specialDetails}

      Selected Documents:
      ${selectedDocs
        .map((docId) => {
          const doc = job.documents.find((d) => d.id === docId)
          return doc ? `- ${doc.name}` : ""
        })
        .join("\n")}
    `

    // This would typically be handled by your email service
    try {
      await fetch("/api/quotes/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          consultantId: consultant.id,
          jobId: selectedJob,
          subject: emailSubject,
          body: emailBody,
          documents: selectedDocs,
          timeframe,
          specialDetails,
        }),
      })

      toast({
        title: "Quote Requested",
        description: "Your quote request has been sent successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send quote request. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <Card>
      <CardHeader>
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

          <Dialog>
            <DialogTrigger asChild>
              <Button className="w-full">Request Quote</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Request Quote</DialogTitle>
                <DialogDescription>Request a quote from {consultant.name} for your project.</DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Select Job</Label>
                  <select
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                    value={selectedJob}
                    onChange={(e) => setSelectedJob(e.target.value)}
                  >
                    <option value="">Select a job...</option>
                    {jobs.map((job) => (
                      <option key={job.id} value={job.id}>
                        {job.address}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedJob && (
                  <div className="space-y-2">
                    <Label>Select Documents</Label>
                    <div className="space-y-2">
                      {jobs
                        .find((j) => j.id === selectedJob)
                        ?.documents.map((doc) => (
                          <label key={doc.id} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={selectedDocs.includes(doc.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedDocs([...selectedDocs, doc.id])
                                } else {
                                  setSelectedDocs(selectedDocs.filter((id) => id !== doc.id))
                                }
                              }}
                              className="rounded border-gray-300"
                            />
                            <span className="text-sm">{doc.name}</span>
                          </label>
                        ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Timeframe</Label>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="e.g., 'By end of next week'"
                      value={timeframe}
                      onChange={(e) => setTimeframe(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Special Details</Label>
                  <Textarea
                    placeholder="Any special requirements or details..."
                    value={specialDetails}
                    onChange={(e) => setSpecialDetails(e.target.value)}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedJob("")
                    setSelectedDocs([])
                    setTimeframe("")
                    setSpecialDetails("")
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleRequestQuote} disabled={!selectedJob || selectedDocs.length === 0 || !timeframe}>
                  Send Request
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  )
}
