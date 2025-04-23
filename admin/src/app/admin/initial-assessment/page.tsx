"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Textarea } from "../../../components/ui/textarea"
import { useToast } from "../../../components/ui/use-toast"
import { Loader2, Plus, FileText } from "lucide-react"
import { PageHeader } from "../../../components/ui/page-header"

interface PrePreparedAssessments {
  id: string
  section: string
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
  const [sections, setSections] = useState<{ id: string; title: string; assessments: PrePreparedAssessments[] }[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    section: '',
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
      setSections(data)
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

  const handleSectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Logic to create a new section
    const newSection = {
      id: Date.now().toString(), // Generate a unique ID
      title: formData.section,
      assessments: [],
    };
    setSections(prev => [...prev, newSection]);
    setFormData(prev => ({ ...prev, section: '' })); // Reset section input
  };

  const handleAssessmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const formDataToSubmit = new FormData();
    formDataToSubmit.append('section', formData.section);
    formDataToSubmit.append('title', formData.title);
    formDataToSubmit.append('content', formData.content);
    formDataToSubmit.append('author', formData.author);
    if (formData.file) {
      formDataToSubmit.append('file', formData.file);
    }

    try {
      const response = await fetch('/api/pre-prepared-assessments', {
        method: 'POST',
        body: formDataToSubmit,
      });

      if (!response.ok) throw new Error('Failed to create Pre-Prepared Assessments');

      const newAssessment = await response.json();

      // Find the section and add the new assessment to it
      setSections(prev => {
        const updatedSections = [...prev];
        const sectionIndex = updatedSections.findIndex(section => section.title === formData.section);
        if (sectionIndex !== -1) {
          // Check if the assessment already exists in the section
          const assessmentExists = updatedSections[sectionIndex].assessments.some(assessment => assessment.id === newAssessment.id);
          if (!assessmentExists) {
            updatedSections[sectionIndex].assessments.push(newAssessment);
          }
        }
        return updatedSections;
      });

      setFormData({ section: '', title: '', content: '', author: '', file: null });
      toast({ title: "Success", description: "Pre-Prepared Assessments created successfully" });
    } catch (error) {
      console.error('Error:', error);
      toast({ title: "Error", description: "Failed to create Pre-Prepared Assessments: " + (error as Error).message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

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
            <CardTitle>Create New Section</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSectionSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Section</label>
                <Input
                  value={formData.section}
                  onChange={e => setFormData(prev => ({ ...prev, section: e.target.value }))}
                  placeholder="Pre-Prepared Section"
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
                    Create Section
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6">
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Create New Pre-Prepared Assessment</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAssessmentSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Select Section</label>
                <select
                  value={formData.section}
                  onChange={e => setFormData(prev => ({ ...prev, section: e.target.value }))}
                  required
                  className="border rounded-md p-2 w-full"
                >
                  <option value="" disabled>Select a section</option>
                  {sections.map(section => (
                    <option key={section.id} value={section.title}>{section.title}</option>
                  ))}
                </select>
              </div>
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
              <Button type="submit" disabled={submitting || !formData.section}>
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
            {sections.map(section => (
              <div key={section.id}>
                <h3 className="font-semibold">{section.title}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.isArray(section.assessments) && section.assessments.map(assessment => (
                    <div key={assessment.id} className="bg-white p-6 rounded-lg shadow-md">
                      <h4 className="text-lg font-semibold mb-2">{assessment.title}</h4>
                      <p className="text-sm text-gray-600">{assessment.content}</p>
                      <p className="text-sm text-gray-500">{new Date(assessment.date).toLocaleDateString()}</p>
                      <p className="text-sm text-gray-500">Posted by {assessment.author}</p>
                      {assessment.file && (
                        <div className="mt-2">
                          <a href={assessment.file.id} className="text-blue-500 hover:underline">Download</a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {sections.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No pre-prepared assessments available.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
