"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@shared/components/ui/card"
import { Button } from "@shared/components/ui/button"
import { Input } from "@shared/components/ui/input"
import { Textarea } from "@shared/components/ui/textarea"
import { useToast } from "@shared/components/ui/use-toast"
import { Loader2, Plus, FileText } from "lucide-react"
import { PageHeader } from "@shared/components/ui/page-header"

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
  lepName?: string
}

export default function PrePreparedAssessmentsPage() {
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
    fileName: '',
    lepName: '',
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
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({
      ...prev,
      file: file,
      fileName: file ? file.name : '',
    }));
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
    formDataToSubmit.append('lepName', formData.lepName);
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

      // Include the file name in the new assessment
      newAssessment.fileName = formData.fileName;

      // Find the section and add the new assessment to it
      setSections(prev => {
        const updatedSections = [...prev];
        const sectionIndex = updatedSections.findIndex(section => section.title === formData.section);
        if (sectionIndex !== -1) {
          const assessmentExists = updatedSections[sectionIndex].assessments.some(assessment => assessment.id === newAssessment.id);
          if (!assessmentExists) {
            updatedSections[sectionIndex].assessments.push(newAssessment);
          }
        }
        return updatedSections;
      });

      setFormData({ section: '', title: '', content: '', author: '', file: null, fileName: '', lepName: '' });
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
      console.log(`Attempting to download file with ID: ${fileId}`); // Log the file ID
      const response = await fetch(`/api/pre-prepared-assessments/${fileId}/download`);
      console.log(`Download response status: ${response.status}`); // Log the response status
      if (!response.ok) throw new Error('Failed to download file');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = formData.fileName || 'document';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error during file download:', error); // Log the error
      toast({
        title: "Error",
        description: "Failed to download file: " + (error as Error).message,
        variant: "destructive"
      });
    }
  }

  const handleDeleteAssessment = async (assessmentId: string) => {
    try {
      const response = await fetch(`/api/pre-prepared-assessments/${assessmentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete assessment');

      // Update the state to remove the deleted assessment
      setSections(prev => {
        return prev.map(section => {
          return {
            ...section,
            assessments: section.assessments.filter(assessment => assessment.id !== assessmentId),
          };
        });
      });

      toast({ title: "Success", description: "Assessment deleted successfully" });
    } catch (error) {
      console.error('Error:', error);
      toast({ title: "Error", description: "Failed to delete assessment: " + (error as Error).message, variant: "destructive" });
    }
  };

  const handleDeleteSection = async (sectionId: string) => {
    if (!window.confirm("Are you sure you want to delete this entire section and all its assessments? This action cannot be undone.")) {
      return; // Stop if the user cancels
    }

    try {
      const response = await fetch(`/api/pre-prepared-sections/${sectionId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete section');
      }

      // Update the state to remove the deleted section
      setSections(prev => prev.filter(section => section.id !== sectionId));

      toast({ title: "Success", description: "Section deleted successfully" });
    } catch (error) {
      console.error('Error deleting section:', error);
      toast({ title: "Error", description: "Failed to delete section: " + (error as Error).message, variant: "destructive" });
    }
  };


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
            <CardTitle>Create New Pre-Prepared Assessments</CardTitle>
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
                  placeholder="Pre-Prepared Assessments title"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Content</label>
                <Textarea
                  value={formData.content}
                  onChange={e => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Pre-Prepared Assessments content"
                  required
                  className="min-h-[100px]"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">LEP Name (Optional)</label>
                <Input
                  value={formData.lepName}
                  onChange={e => setFormData(prev => ({ ...prev, lepName: e.target.value }))}
                  placeholder="e.g. Wollondilly Local Environmental Plan 2011"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty for sections that apply to all LEPs
                </p>
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
                    Create Pre-Prepared Assessments
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
              <div key={section.id} className="mb-6 border-b pb-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-xl">{section.title}</h3>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteSection(section.id)}
                  >
                    Delete Section
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.isArray(section.assessments) && section.assessments.map(assessment => (
                    <div key={assessment.id} className="bg-white p-4 rounded-lg shadow"> {/* Adjusted padding and shadow */}
                      <h4 className="text-lg font-semibold mb-2">{assessment.title}</h4>
                      <p className="text-sm text-gray-600">{assessment.content}</p>
                      <p className="text-sm text-gray-500">{new Date(assessment.date).toLocaleDateString()}</p>
                      <p className="text-xs text-gray-500">Posted by {assessment.author}</p> {/* Adjusted text size */}
                      {/* Removed assessment.fileName display as it might be redundant if originalName is available via file object */}
                      {assessment.file && (
                         <div className="mt-2 flex justify-between items-center"> {/* Use flex for button layout */}
                           <Button
                             variant="outline"
                             size="sm"
                             onClick={() => handleDownload(assessment.file?.id || '')}
                           >
                             Download ({assessment.file.originalName}) {/* Show original name */}
                           </Button>
                           <Button
                             variant="ghost" // Less prominent delete button for individual items
                             size="sm"
                             className="text-red-600 hover:text-red-800"
                             onClick={() => handleDeleteAssessment(assessment.id)}
                           >
                             Delete Item
                           </Button>
                         </div>
                       )}
                       {!assessment.file && ( // Handle case where there might not be a file
                         <div className="mt-2 flex justify-end items-center">
                            <Button
                             variant="ghost"
                             size="sm"
                             className="text-red-600 hover:text-red-800"
                             onClick={() => handleDeleteAssessment(assessment.id)}
                           >
                             Delete Item
                           </Button>
                         </div>
                       )}
                    </div>
                  ))}
                  {Array.isArray(section.assessments) && section.assessments.length === 0 && (
                     <p className="text-sm text-muted-foreground col-span-full text-center py-4">No assessments in this section.</p>
                  )}
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
