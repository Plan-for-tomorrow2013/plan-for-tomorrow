'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@shared/components/ui/card';
import { Button } from '@shared/components/ui/button';
import { Input } from '@shared/components/ui/input';
import { Textarea } from '@shared/components/ui/textarea';
import { useToast } from '@shared/components/ui/use-toast';
import { Loader2, Plus } from 'lucide-react';
import { PageHeader } from '@shared/components/ui/page-header';

interface Assessment {
  id: string;
  section: string;
  title: string;
  content: string;
  date: string;
  author: string;
  file?: {
    originalName: string;
    id: string;
  };
  lepName?: string;
}

interface Section {
  id: string;
  title: string;
  assessments: Assessment[];
}

interface PrePreparedAssessmentsManagerProps {
  title: string;
  description: string;
  apiEndpoint: string;
  downloadEndpoint: string;
  sectionEndpoint: string;
  assessmentType:
    | 'initial'
    | 'regular'
    | 'waste-management'
    | 'complying-development'
    | 'nathers'
    | 'development-application';
}

export function PrePreparedAssessmentsManager({
  title,
  description,
  apiEndpoint,
  downloadEndpoint,
  sectionEndpoint,
  assessmentType,
}: PrePreparedAssessmentsManagerProps) {
  const { toast } = useToast();
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    section: '',
    title: '',
    content: '',
    author: '',
    file: null as File | null,
    fileName: '',
    lepName: '',
  });

  const fetchAssessments = useCallback(async () => {
    try {
      const response = await fetch(apiEndpoint);
      if (!response.ok) throw new Error(`Failed to fetch ${title}`);
      const data = await response.json();
      setSections(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to load ${title}`,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [apiEndpoint, title, toast]);

  useEffect(() => {
    fetchAssessments();
  }, [fetchAssessments]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({
      ...prev,
      file: file,
      fileName: file ? file.name : '',
    }));
  };

  const handleSectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newSection = {
      id: Date.now().toString(),
      title: formData.section,
      assessments: [],
    };
    setSections(prev => [...prev, newSection]);
    setFormData(prev => ({ ...prev, section: '' }));
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
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        body: formDataToSubmit,
      });

      if (!response.ok) throw new Error(`Failed to create ${title}`);

      const newAssessment = await response.json();
      newAssessment.fileName = formData.fileName;

      setSections(prev => {
        const updatedSections = [...prev];
        const sectionIndex = updatedSections.findIndex(
          section => section.title === formData.section
        );
        if (sectionIndex !== -1) {
          const assessmentExists = updatedSections[sectionIndex].assessments.some(
            assessment => assessment.id === newAssessment.id
          );
          if (!assessmentExists) {
            updatedSections[sectionIndex].assessments.push(newAssessment);
          }
        }
        return updatedSections;
      });

      setFormData({
        section: '',
        title: '',
        content: '',
        author: '',
        file: null,
        fileName: '',
        lepName: '',
      });
      toast({ title: 'Success', description: `${title} created successfully` });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: `Failed to create ${title}: ${(error as Error).message}`,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownload = async (fileId: string) => {
    try {
      const response = await fetch(`${downloadEndpoint}/${fileId}/download`);
      if (!response.ok) throw new Error('Failed to download file');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = formData.fileName || 'document';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to download file: ' + (error as Error).message,
        variant: 'destructive',
      });
    }
  };

  const handleDeleteAssessment = async (assessmentId: string) => {
    try {
      const response = await fetch(`${apiEndpoint}/${assessmentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete assessment');

      setSections(prev => {
        return prev.map(section => ({
          ...section,
          assessments: section.assessments.filter(assessment => assessment.id !== assessmentId),
        }));
      });

      toast({ title: 'Success', description: 'Assessment deleted successfully' });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete assessment: ' + (error as Error).message,
        variant: 'destructive',
      });
    }
  };

  const handleDeleteSection = async (sectionId: string) => {
    if (
      !window.confirm(
        'Are you sure you want to delete this entire section and all its assessments? This action cannot be undone.'
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`${sectionEndpoint}/${sectionId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete section');
      }

      setSections(prev => prev.filter(section => section.id !== sectionId));
      toast({ title: 'Success', description: 'Section deleted successfully' });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete section: ' + (error as Error).message,
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <PageHeader title={title} description={description} backHref="/admin" />
        <div className="flex justify-center items-center min-h-[calc(100vh-4rem)]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <PageHeader title={title} description={description} backHref="/admin" />

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
                  placeholder={`${title} Section`}
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
            <CardTitle>Create New {title}</CardTitle>
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
                  <option value="" disabled>
                    Select a section
                  </option>
                  {sections.map(section => (
                    <option key={section.id} value={section.title}>
                      {section.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Title</label>
                <Input
                  value={formData.title}
                  onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder={`${title} title`}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Content</label>
                <Textarea
                  value={formData.content}
                  onChange={e => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder={`${title} content`}
                  required
                  className="min-h-[100px]"
                />
              </div>
              {assessmentType !== 'waste-management' &&
                assessmentType !== 'nathers' &&
                assessmentType !== 'development-application' &&
                assessmentType !== 'complying-development' && (
                  <div>
                    <label className="text-sm font-medium mb-1 block">LEP Name (Optional)</label>
                    <Input
                      value={formData.lepName}
                      onChange={e => setFormData(prev => ({ ...prev, lepName: e.target.value }))}
                      placeholder="e.g. Cumberland Local Environmental Plan 2020"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Leave empty for sections that apply to all LEPs
                    </p>
                  </div>
                )}
              <div>
                <label className="text-sm font-medium mb-1 block">Upload Document</label>
                <input type="file" onChange={handleFileChange} required />
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
                    Create {title}
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Current {title}</CardTitle>
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
                  {Array.isArray(section.assessments) &&
                    section.assessments.map(assessment => (
                      <div
                        key={assessment.id}
                        className="bg-white p-4 rounded-lg outline outline-1 outline-gray-200"
                      >
                        <h4 className="text-lg font-semibold mb-2">{assessment.title}</h4>
                        <p className="text-sm text-gray-600">{assessment.content}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(assessment.date).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-500">Posted by {assessment.author}</p>
                        {assessment.file && (
                          <div className="mt-2 flex justify-between items-center">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownload(assessment.file?.id || '')}
                            >
                              Download ({assessment.file.originalName})
                            </Button>
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
                        {!assessment.file && (
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
                    <p className="text-sm text-muted-foreground col-span-full text-center py-4">
                      No assessments in this section.
                    </p>
                  )}
                </div>
              </div>
            ))}
            {sections.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No {title.toLowerCase()} available.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
