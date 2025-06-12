'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@shared/components/ui/dialog"
import Link from 'next/link'
import camelcaseKeys from 'camelcase-keys'
import { PageHeader } from '@shared/components/ui/page-header'
import { Button } from '@shared/components/ui/button'

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
    const response = await fetch('/api/kb-complying-development-assessments');
    if (!response.ok) {
        const errorBody = await response.text();
        console.error("Failed to fetch kb complying development assessments:", response.status, errorBody);
        throw new Error(`Failed to fetch kb complying development assessments. Status: ${response.status}`);
    }
    const data = await response.json();
    if (!Array.isArray(data)) {
        console.error("Invalid kb complying development data received:", data);
        throw new Error('Invalid kb complying development data received');
    }
    return camelcaseKeys(data, { deep: true });
};

export default function ComplyingDevelopmentPage() {
  const router = useRouter();
  const [isOverlayVisible, setIsOverlayVisible] = useState(true);

  const {
    data: prePreparedAssessmentsData = [],
    isLoading: isPrePreparedLoading,
    error: prePreparedError,
    isError: isPrePreparedError,
  } = useQuery<PrePreparedAssessmentSection[], Error>({
    queryKey: ['prePreparedAssessments', 'complyingDevelopment'],
    queryFn: fetchPrePreparedAssessments,
    staleTime: 1000 * 60 * 10,
  });

  const [selectedAssessment, setSelectedAssessment] = useState<PrePreparedAssessment | null>(null);

  const renderPrePreparedAssessmentCard = (assessment: PrePreparedAssessment) => {
    return (
      <div className="mb-4">
        <Link
          href={`/professionals/knowledge-base/complying-development/document?path=${encodeURIComponent(
            `/api/kb-complying-development-assessments/${assessment.file?.id}/download`
          )}&title=${encodeURIComponent(assessment.title)}`}
          className="text-blue-600 underline block mb-2"
        >
          {assessment.title}
        </Link>
        <p className="text-sm text-gray-600 mb-2">{assessment.content}</p>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Complying Development"
        backHref="/professionals/knowledge-base"
      />

      {/* Development Application Resources Section */}
      <div className="border rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-4">Complying Development Resources</h2>
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

      {/* Do It Yourself Section */}
      <div className="border rounded-lg p-4 relative min-h-[200px] flex items-center justify-center">
        {/* The actual content that will be revealed */}
        <div className={`transition-opacity duration-300 ${isOverlayVisible ? 'opacity-0' : 'opacity-100'}`}>
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Complying Development Calculator</h2>
            <p className="text-gray-600">Use our calculator to determine if your development qualifies as complying development.</p>
            {/* Add your calculator form elements here */}
            <Button
              variant="outline"
              onClick={() => setIsOverlayVisible(true)}
            >
              Hide Calculator
            </Button>
          </div>
        </div>
        {/* The overlay that covers the content */}
        <div
          className={`absolute inset-0 bg-[#EEDA54]/20 border-[#EEDA54] transition-all duration-300 cursor-pointer flex items-center justify-center
            ${isOverlayVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          onClick={() => setIsOverlayVisible(false)}
        >
          <div className="flex flex-col items-center justify-center w-full p-8">
            <p className="text-[#532200] font-semibold text-lg mb-2">Do It Yourself</p>
            <p>Use our calculator to determine if your development qualifies as complying development.</p>
            <p className="text-[#532200] text-sm mt-2">Click to preview</p>
          </div>
        </div>
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
