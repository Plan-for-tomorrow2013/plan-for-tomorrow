'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@shared/components/ui/dialog"
import Link from 'next/link'
import camelcaseKeys from 'camelcase-keys'

interface PrePreparedAssessmentSection {
  title: string;
  assessments: PrePreparedAssessment[];
}

interface PrePreparedAssessment {
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
  purchaseDate?: string;
  isPurchased?: boolean;
  lepName?: string;
}

// Define fetch function for pre-prepared assessments
const fetchPrePreparedAssessments = async (): Promise<PrePreparedAssessmentSection[]> => {
    const response = await fetch('/api/kb-development-application-assessments');
    if (!response.ok) {
        const errorBody = await response.text();
        console.error("Failed to fetch kb development applications:", response.status, errorBody);
        throw new Error(`Failed to fetch kb development applications. Status: ${response.status}`);
    }
    const data = await response.json();
    if (!Array.isArray(data)) {
        console.error("Invalid kb development applications data received:", data);
        throw new Error('Invalid kb development applications data received');
    }
    return camelcaseKeys(data, { deep: true });
};

export default function DevelopmentApplicationPage() {
  const router = useRouter();

  const {
    data: prePreparedAssessmentsData = [],
    isLoading: isPrePreparedLoading,
    error: prePreparedError,
    isError: isPrePreparedError,
  } = useQuery<PrePreparedAssessmentSection[], Error>({
    queryKey: ['prePreparedAssessments', 'developmentApplication'],
    queryFn: fetchPrePreparedAssessments,
    staleTime: 1000 * 60 * 10,
  });

  const [selectedAssessment, setSelectedAssessment] = useState<PrePreparedAssessment | null>(null);

  const renderPrePreparedAssessmentCard = (assessment: PrePreparedAssessment) => {
    return (
      <Link
        href={`/professionals/knowledge-base/development-application/document?path=${encodeURIComponent(
          `/api/kb-development-application-assessments/${assessment.file?.id}/download`
        )}&title=${encodeURIComponent(assessment.title)}`}
        className="text-blue-600 underline block mb-2"
      >
        {assessment.title}
      </Link>
    );
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Development Application</h1>

      {/* Development Application Resources Section */}
      <div className="border rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-4">Development Application Resources</h2>
        {isPrePreparedLoading ? (
          <div>Loading Resources...</div>
        ) : (
          prePreparedAssessmentsData.map((section) => (
            <div key={section.title} className="space-y-4 mb-6">
              <h3 className="text-lg font-medium">{section.title}</h3>
              <div>
                {section.assessments.map((assessment) => renderPrePreparedAssessmentCard(assessment))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Assessment View Dialog for Text Content */}
      <Dialog open={!!selectedAssessment} onOpenChange={() => setSelectedAssessment(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedAssessment?.title}</DialogTitle>
            <DialogDescription>
              {selectedAssessment?.section} • Posted by {selectedAssessment?.author} on {selectedAssessment?.date && new Date(selectedAssessment.date).toLocaleDateString()}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <div className="prose max-w-none">
              <p className="text-gray-700">{selectedAssessment?.content}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
