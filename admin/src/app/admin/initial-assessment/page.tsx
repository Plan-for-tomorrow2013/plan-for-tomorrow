"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Textarea } from "../../../components/ui/textarea"
import { useToast } from "../../../components/ui/use-toast"
import { Loader2, Plus, FileText } from "lucide-react"
import { PageHeader } from "../../../components/ui/page-header"

interface PrePreparedAssessment {
  id: string
  title: string
  content: string
  date: string
  author: string
  file?: {
    originalName: string
    id: string
  }
}

export default function InitialAssessmentPage() {
  const { toast } = useToast()
  const [prePreparedAssessments, setPrePreparedAssessments] = useState<PrePreparedAssessment[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    author: '',
    file: null as File | null,
  })
  useEffect(() => {
    fetchPrePreparedAssessments()
  }, [])

  const fetchPrePreparedAssessments = async () => {
    try {
      const response = await fetch('/api/pre-prepared-assessments')
      if (!response.ok) throw new Error('Failed to fetch pre-prepared assessments')
      const data = await response.json()
      setPrePreparedAssessments(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load Pre-Prepared Assessments",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      file: e.target.files?.[0] || null,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    const formDataToSubmit = new FormData()
    formDataToSubmit.append('title', formData.title)
    formDataToSubmit.append('content', formData.content)
    formDataToSubmit.append('author', formData.author)
    if (formData.file) {
      formDataToSubmit.append('file', formData.file)
    }

    try {
      const response = await fetch('/api/pre-prepared-assessments', {
        method: 'POST',
        body: formDataToSubmit,
      })

      if (!response.ok) throw new Error('Failed to create Pre-Prepared Assessment')

      const newPrePreparedAssessment = await response.json()
      setPrePreparedAssessments(prev => [newPrePreparedAssessment, ...prev])
      setFormData({ title: '', content: '', author: '', file: null })

      toast({
        title: "Success",
        description: "Pre-Prepared Assessment created successfully"
      })
    } catch (error) {
      console.error('Error:', error)
      toast({
        title: "Error",
        description: "Failed to create Pre-Prepared Assessment: " + (error as Error).message,
        variant: "destructive"
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDownload = async (fileId: string) => {
    try {
      const response = await fetch(`/api/pre-prepared-assessments/${fileId}/download`)
      if (!response.ok) throw new Error('Failed to download file')
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = formData.file?.name || 'document'
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error:', error)
      toast({
        title: "Error",
        description: "Failed to download file: " + (error as Error).message,
        variant: "destructive"
      })
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <PageHeader
          title="Pre-Prepared Assessments"
          description="Create and manage Pre-Prepared Assessments"
          backHref="/admin"
        />
        <div className="flex justify-center items-center min-h-[calc(100vh-4rem)]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <PageHeader
        title="Pre-Prepared Assessments"
        description="Create and manage Pre-Prepared Assessments"
        backHref="/admin"
      />

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Create New Pre-Prepared Assessment</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Title</label>
                <Input
                  value={formData.title}
                  onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Pre-Prepared Assessment title"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Content</label>
                <Textarea
                  value={formData.content}
                  onChange={e => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Pre-Prepared Assessment content"
                  required
                  className="min-h-[100px]"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Upload Document</label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  required
                />
              </div>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Pre-Prepared Assessment
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Current Pre-Prepared Assessments</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Changed class here for grid layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {prePreparedAssessments.map((assessment) => (
                <Card key={assessment.id} className="border p-4 rounded-md shadow-sm flex flex-col"> {/* Added flex flex-col for consistent height if needed */}
                  <div className="flex items-start justify-between">
                    <h3 className="font-medium text-lg">{assessment.title}</h3>
                    <span className="text-sm text-muted-foreground">
                      {new Date(assessment.date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{assessment.content}</p>
                  <p className="mt-2 text-xs text-muted-foreground">Posted by {assessment.author}</p>
                  {assessment.file && (
                    <div className="mt-2 flex items-center">
                      <FileText className="h-4 w-4 mr-2" />
                      <span className="text-sm">{assessment.file?.originalName}</span>
                      <Button
                        onClick={() => assessment.file?.id && handleDownload(assessment.file.id)}
                        className="ml-2"
                      >
                        Download
                      </Button>
                    </div>
                  )}
                </Card>
              ))}
              {prePreparedAssessments.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No Pre-Prepared Assessments yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
