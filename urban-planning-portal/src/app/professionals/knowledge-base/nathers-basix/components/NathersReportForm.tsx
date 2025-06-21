'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@shared/components/ui/button';
import { Input } from '@shared/components/ui/input';
import { Textarea } from '@shared/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@shared/components/ui/select';
import { Alert, AlertDescription } from '@shared/components/ui/alert';
import { toast } from '@shared/components/ui/use-toast';
import { Job } from '@shared/types/jobs';
import { Loader2, Upload, X } from 'lucide-react';

interface NathersReportForm {
  jobId: string;
  developmentType: string;
  additionalInfo: string;
  documents: File[];
}

interface NathersReportFormProps {
  jobs: Job[];
  isLoadingJobs: boolean;
  jobsError: Error | null;
}

export function NathersReportForm({ jobs, isLoadingJobs, jobsError }: NathersReportFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<NathersReportForm>({
    jobId: '',
    developmentType: '',
    additionalInfo: '',
    documents: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mutation for creating work ticket with document uploads
  const createWorkTicketMutation = useMutation({
    mutationFn: async (data: NathersReportForm) => {
      const formData = new FormData();
      formData.append('jobId', data.jobId);
      formData.append('developmentType', data.developmentType);
      formData.append('additionalInfo', data.additionalInfo);
      data.documents.forEach(file => {
        formData.append('documents', file);
      });

      const response = await fetch('/api/work-tickets', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to create work ticket');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Nathers report request submitted successfully.',
      });
      router.refresh();
    },
    onError: error => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit nathers report request.',
        variant: 'destructive',
      });
    },
  });

  // Mutation for updating job status
  const updateJobStatusMutation = useMutation({
    mutationFn: async (jobId: string) => {
      const response = await fetch(`/api/jobs/${jobId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'pending',
          currentStep: 'nathers_assessment',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update job status');
      }

      return response.json();
    },
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => {
      const isValidType = ['application/pdf', 'image/jpeg', 'image/png'].includes(file.type);
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB limit

      if (!isValidType) {
        toast({
          title: 'Invalid file type',
          description: 'Please upload PDF, JPEG, or PNG files only.',
          variant: 'destructive',
        });
      }

      if (!isValidSize) {
        toast({
          title: 'File too large',
          description: 'Please upload files smaller than 10MB.',
          variant: 'destructive',
        });
      }

      return isValidType && isValidSize;
    });

    setFormData(prev => ({
      ...prev,
      documents: [...prev.documents, ...validFiles],
    }));
  };

  const handleRemoveFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Create work ticket with document uploads
      await createWorkTicketMutation.mutateAsync(formData);

      // Update job status
      await updateJobStatusMutation.mutateAsync(formData.jobId);

      // Reset form
      setFormData({
        jobId: '',
        developmentType: '',
        additionalInfo: '',
        documents: [],
      });
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (jobsError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{jobsError.message}</AlertDescription>
      </Alert>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Job Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Select Job</label>
        <Select
          value={formData.jobId}
          onValueChange={value => setFormData(prev => ({ ...prev, jobId: value }))}
          disabled={isLoadingJobs || isSubmitting}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a job" />
          </SelectTrigger>
          <SelectContent>
            {jobs.map(job => (
              <SelectItem key={job.id} value={job.id}>
                {job.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Development Type */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Development Type</label>
        <Input
          value={formData.developmentType}
          onChange={e => setFormData(prev => ({ ...prev, developmentType: e.target.value }))}
          placeholder="Enter development type"
          disabled={isSubmitting}
        />
      </div>

      {/* Additional Information */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Additional Information</label>
        <Textarea
          value={formData.additionalInfo}
          onChange={e => setFormData(prev => ({ ...prev, additionalInfo: e.target.value }))}
          placeholder="Enter any additional information"
          disabled={isSubmitting}
        />
      </div>

      {/* Document Upload */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Upload Documents</label>
        <div className="border-2 border-dashed rounded-lg p-4">
          <input
            type="file"
            multiple
            onChange={handleFileUpload}
            accept=".pdf,.jpg,.jpeg,.png"
            className="hidden"
            id="file-upload"
            disabled={isSubmitting}
          />
          <label
            htmlFor="file-upload"
            className="flex flex-col items-center justify-center cursor-pointer"
          >
            <Upload className="h-8 w-8 text-gray-400" />
            <span className="mt-2 text-sm text-gray-600">Click to upload or drag and drop</span>
            <span className="text-xs text-gray-500">PDF, JPEG, or PNG up to 10MB</span>
          </label>
        </div>

        {/* Uploaded Files List */}
        {formData.documents.length > 0 && (
          <div className="mt-4 space-y-2">
            {formData.documents.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm truncate">{file.name}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveFile(index)}
                  disabled={isSubmitting}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submit Button */}
      <Button type="submit" className="w-full" disabled={isSubmitting || !formData.jobId}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : (
          'Submit Request'
        )}
      </Button>
    </form>
  );
}
