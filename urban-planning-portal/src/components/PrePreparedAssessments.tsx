"use client"

"use client"

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Plus, FileText, Download } from "lucide-react" // Added FileText and Download icons
import { toast } from "./ui/use-toast" // Added toast for feedback
import { useState } from "react"

interface PrePreparedAssessments {
  id: string
  title: string
  content: string
  date: string
  author: string
  file?: { // Made file optional initially, but we expect it based on data
    id: string
    originalName: string
    savedPath: string // We'll use this to construct the download path/ID
  }
}

interface PrePreparedAssessmentsProps {
  prePreparedAssessments: PrePreparedAssessments[]
  isAdmin?: boolean
  onAddPrePreparedAssessments?: () => void
}

export function PrePreparedAssessments({ prePreparedAssessments, isAdmin = false, onAddPrePreparedAssessments }: PrePreparedAssessmentsProps) {
  const [prePreparedAssessmentsState, setPrePreparedAssessmentsState] = useState<PrePreparedAssessments[]>(prePreparedAssessments || []);

  const handleDownload = async (assessment: PrePreparedAssessments) => {
    if (!assessment.file) {
      toast({
        title: "Error",
        description: "No file associated with this assessment.",
        variant: "destructive",
      });
      return;
    }

    // We need the file ID to construct the download URL
    const fileId = assessment.file.id; // Assuming file.id is the unique identifier used in the saved path

    try {
      // Construct the API endpoint URL
      const downloadUrl = `/api/download-pre-prepared/${fileId}`;
      console.log(`Attempting to download from: ${downloadUrl}`); // Log the URL

      const response = await fetch(downloadUrl);

      if (!response.ok) {
        // Try to get more specific error from response body if possible
        let errorMsg = 'Failed to download file.';
        try {
          const errorData = await response.json();
          if (errorData.error) {
            errorMsg = errorData.error;
          }
        } catch (e) {
          // Ignore if response is not JSON
        }
         console.error(`Download failed with status: ${response.status}, message: ${errorMsg}`);
        throw new Error(errorMsg);
      }

      // Get filename from header if available, otherwise use originalName
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = assessment.file.originalName; // Default to original name
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }
      console.log(`Downloading file as: ${filename}`); // Log the final filename

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Success",
        description: "File downloaded successfully.",
      });

    } catch (error: any) {
      console.error('Error downloading pre-prepared assessment:', error);
      toast({
        title: "Download Error",
        description: error.message || "An unexpected error occurred during download.",
        variant: "destructive",
      });
    }
  };


  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (e) {
      return dateString; // Return original if parsing fails
    }
  };

  return (
    <Card>
      <CardHeader className="pt-4 pb-2"> {/* Adjusted padding */}
        <div className="flex items-center justify-between">
          {isAdmin && (
            <Button variant="outline" size="sm" onClick={onAddPrePreparedAssessments}>
              <Plus className="h-4 w-4 mr-2" />
              New
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6"> {/* Increased spacing */}
          {prePreparedAssessmentsState.map((assessment) => (
            <div key={assessment.id} className="border rounded-lg p-4 shadow-sm"> {/* Added border, padding, shadow */}
              <div className="flex items-start justify-between mb-2"> {/* Added margin bottom */}
                <h3 className="font-semibold text-lg">{assessment.title}</h3> {/* Increased font weight/size */}
                <span className="text-sm text-muted-foreground">{formatDate(assessment.date)}</span> {/* Formatted date */}
              </div>
              <p className="mt-1 text-sm text-gray-700 mb-3">{assessment.content}</p> {/* Adjusted color/margin */}
              <p className="mt-2 text-xs text-gray-500 mb-4">Posted by {assessment.author}</p> {/* Adjusted color/margin */}

              {/* File display and download button */}
              {assessment.file && (
                <div className="flex items-center justify-between bg-gray-50 p-3 rounded-md"> {/* Added background, padding, rounded corners */}
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="h-4 w-4 text-gray-600" />
                    <span>{assessment.file.originalName}</span>
                  </div>
                  <Button
                    variant="default" // Changed variant for better visibility
                    size="sm"
                    onClick={() => handleDownload(assessment)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              )}
            </div>
          ))}
          {prePreparedAssessmentsState.length === 0 && !isAdmin && ( // Hide "No assessments" if admin can add
            <p className="text-sm text-muted-foreground text-center py-4">
              No pre-prepared assessments at this time
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
