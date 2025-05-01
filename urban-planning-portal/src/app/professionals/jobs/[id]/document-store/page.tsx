'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader } from '../../../../../components/ui/card'
import { ArrowLeft, Upload, FileText, X, Check } from 'lucide-react'
import { Button } from '../../../../../components/ui/button'
import { useRouter } from 'next/navigation'
import { Alert, AlertDescription, AlertTitle } from "@shared/components/ui/alert"
import { Document, DOCUMENT_TYPES, DocumentWithStatus } from '@shared/types/documents'
import { toast } from "@shared/components/ui/use-toast"
import { useJobs } from '../../../../../../hooks/useJobs'
import type { Job } from '@/types/jobs'
import { getReportStatus, isReportType, getReportTitle } from '@/utils/report-utils'

interface UploadedFile {
  filename: string
  originalName: string
  type: string
  uploadedAt: string
  size: number
}

// Update the PrePreparedAssessmentsDetails interface to match our simplified type
interface PrePreparedAssessmentsDetails {
  id: string;
  section: string;
  title: string;
  content: string;
  author: string;
  file?: {
    originalName: string;
    id: string;
  };
}

// Create a new DocumentRenderer component
function DocumentRenderer({ doc, job, onDownload, onRemove, onUpload }: { doc: DocumentWithStatus, job: Job | null, onDownload: (docId: string) => void, onRemove: (docId: string) => void, onUpload: (docId: string, file: File) => void }) {
  // Add null check at the start of the component
  if (!job) return null;

  // Special handling for pre-prepared assessments
  if (doc.id.startsWith('pre-prepared-')) {
    const assessmentId = doc.id.replace('pre-prepared-', '');
    const assessmentDetails = job?.purchasedPrePreparedAssessments?.[assessmentId];
    const documentDetails = doc.uploadedFile;

    if (!documentDetails) return null;

    return (
      <Card key={doc.id} className="shadow-md">
        <CardHeader className="bg-[#323A40] text-white">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold">{assessmentDetails?.title || 'Pre-prepared Assessment'}</h3>
              <p className="text-sm text-gray-300">{assessmentDetails?.section || 'Assessment'}</p>
            </div>
            <Check className="h-5 w-5 text-green-400" />
          </div>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          {assessmentDetails && (
            <div>
              <p className="text-sm text-gray-600 mb-2">{assessmentDetails.content}</p>
              <p className="text-xs text-gray-500">
                Posted by {assessmentDetails.author}
              </p>
            </div>
          )}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-[#323A40]">
              <FileText className="h-4 w-4" />
              <span>{documentDetails.originalName}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Uploaded: {new Date(documentDetails.uploadedAt).toLocaleDateString()}
            </p>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => onDownload(doc.id)}
            >
              <FileText className="h-4 w-4 mr-2" />
              Download Assessment
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Handle report documents using the new utilities
  if (isReportType(doc.id)) {
    const { isPaid, isCompleted, isUploaded, hasFile } = getReportStatus(doc, job)
    const reportTitle = getReportTitle(doc.id)

    // Show "In Progress" if the report is paid but not completed and no file is uploaded
    if (isPaid && !isCompleted && !hasFile) {
      return (
        <Card key={doc.id} className="shadow-md">
          <CardHeader className="bg-[#323A40] text-white">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">{reportTitle}</h3>
                <p className="text-sm text-gray-300">{doc.category}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 text-center">
            <div className="flex flex-col items-center justify-center space-y-2 py-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="font-semibold text-lg">Report In Progress</p>
              <p className="text-sm text-gray-600 px-4">
                Our team is working on your {reportTitle}. You will be notified once it's ready.
              </p>
            </div>
          </CardContent>
        </Card>
      )
    }

    // Show completed report if available
    if (isCompleted && hasFile) {
      return (
        <Card key={doc.id} className="shadow-md">
          <CardHeader className="bg-[#323A40] text-white">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">{reportTitle}</h3>
                <p className="text-sm text-gray-300">{doc.category}</p>
              </div>
              <Check className="h-5 w-5 text-green-400" />
            </div>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-[#323A40]">
                <FileText className="h-4 w-4" />
                <span>{doc.uploadedFile?.originalName}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Uploaded: {new Date(doc.uploadedFile?.uploadedAt || '').toLocaleDateString()}
              </p>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => onDownload(doc.id)}
              >
                <FileText className="h-4 w-4 mr-2" />
                Download Report
              </Button>
            </div>
          </CardContent>
        </Card>
      )
    }
  }

  // Regular document handling (includes completed reports and standard docs)
  return (
    <Card key={doc.id} className="shadow-md">
      <CardHeader className="bg-[#323A40] text-white">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold">{doc.title}</h3>
            <p className="text-sm text-gray-300">{doc.category}</p>
          </div>
          {doc.status === 'uploaded' && (
            <Check className="h-5 w-5 text-green-400" />
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {doc.status === 'uploaded' && doc.uploadedFile ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-[#323A40]">
              <FileText className="h-4 w-4" />
              <span>{doc.uploadedFile.originalName}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Uploaded: {new Date(doc.uploadedFile.uploadedAt).toLocaleDateString()}
            </p>
            <div className="flex justify-between gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-red-500 hover:text-red-600"
                onClick={() => onRemove(doc.id)}
                // Disable remove for report types
                disabled={isReportType(doc.id)}
              >
                <X className="h-4 w-4 mr-2" />
                Remove
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDownload(doc.id)}
              >
                <FileText className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        ) : (
          // Render upload button only for non-report documents that are required
          doc.status === 'required' && !isReportType(doc.id) && (
            <div className="flex items-center gap-2">
              <input
                type="file"
                id={doc.id}
                className="hidden"
                accept=".pdf,.doc,.docx"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onUpload(doc.id, file);
                }}
              />
              <Button
                variant="outline"
                className="w-full"
                onClick={() => document.getElementById(doc.id)?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Document
              </Button>
            </div>
          )
        )}
      </CardContent>
    </Card>
  );
}

export default function DocumentStorePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { jobs } = useJobs(); // Use useJobs hook, remove setJobs
  const [documents, setDocuments] = useState<DocumentWithStatus[]>([]); // Initialize empty
  const [job, setJob] = useState<Job | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)  // Add loading state
  // const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false) // Removed as saves are instant

  // Combine all data logging into a single useEffect
  useEffect(() => {
    if (job) {
      // Log general job data
      console.log('Job Data:', {
        customAssessment: job.customAssessment,
        statementOfEnvironmentalEffects: job.statementOfEnvironmentalEffects,
        complyingDevelopmentCertificate: job.complyingDevelopmentCertificate,
        documents: job.documents,
        purchasedPrePreparedAssessments: job.purchasedPrePreparedAssessments
      });
    }
  }, [job]);

  useEffect(() => {
    let isMounted = true;  // Add mounted check

    const fetchJobAndDocuments = async () => {
      try {
        setIsLoading(true);
        console.log('Starting fetch for job:', params.id);

        const response = await fetch(`/api/jobs/${params.id}`, {
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch job details: ${response.status} ${response.statusText}`);
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error(`Expected JSON response but got ${contentType}`);
        }

        const text = await response.text();
        console.log('Raw API Response:', text);

        let jobData: Job; // Define type for jobData
        try {
          jobData = JSON.parse(text);
        } catch (e) {
          console.error('Failed to parse JSON:', e);
          throw new Error('Invalid JSON response from server');
        }

        console.log('Parsed Job Data:', {
          id: jobData?.id,
          hasCustomAssessment: Boolean(jobData?.customAssessment),
          hasStatementOfEnvironmentalEffects: Boolean(jobData?.statementOfEnvironmentalEffects),
          hasComplyingDevelopmentCertificate: Boolean(jobData?.complyingDevelopmentCertificate),
          hasDocuments: Boolean(jobData?.documents),
          hasPurchasedAssessments: Boolean(jobData?.purchasedPrePreparedAssessments),
        });

        if (isMounted) {
          setJob(jobData); // Set the fetched job data to state

          // Update the job in the global state as well - REMOVE THIS
          // setJobs(prevJobs => prevJobs.map(j => j.id === jobData.id ? jobData : j));


          // Initialize documents map based on DOCUMENT_TYPES
          const updatedDocsMap = new Map<string, DocumentWithStatus>();
          DOCUMENT_TYPES.forEach(docType => {
            // Only add standard required docs initially
            if (['certificate-of-title', '10-7-certificate', 'survey-plan'].includes(docType.id)) {
              updatedDocsMap.set(docType.id, {
                ...docType,
                status: 'required', // Default to required
                uploadedFile: undefined
              });
            }
          });

          // Merge uploaded documents from jobData.documents
          if (jobData.documents) {
            for (const [docId, uploadedFile] of Object.entries(jobData.documents as Record<string, UploadedFile>)) {
              if (uploadedFile) {
                if (updatedDocsMap.has(docId)) {
                  // Update status for standard required docs if uploaded
                  const existingDoc = updatedDocsMap.get(docId)!;
                  updatedDocsMap.set(docId, {
                    ...existingDoc,
                    status: 'uploaded',
                    uploadedFile: uploadedFile,
                  });
                } else if (docId.startsWith('pre-prepared-')) {
                  // Add uploaded pre-prepared assessments
                   const assessmentId = docId.replace('pre-prepared-', '');
                   const assessmentDetails = jobData.purchasedPrePreparedAssessments?.[assessmentId];
                   if (assessmentDetails) { // Ensure details exist
                     updatedDocsMap.set(docId, {
                       id: docId,
                       title: assessmentDetails?.title || 'Pre-prepared Assessment',
                       path: 'document-store',
                       type: 'document',
                       category: 'Pre-prepared Assessments',
                       versions: [{
                         version: 1,
                         uploadedAt: uploadedFile.uploadedAt,
                         filename: uploadedFile.filename,
                         originalName: uploadedFile.originalName,
                         size: uploadedFile.size,
                         uploadedBy: 'system'
                       }],
                       currentVersion: 1,
                       createdAt: assessmentDetails?.purchaseDate || new Date().toISOString(),
                       updatedAt: uploadedFile.uploadedAt,
                       isActive: true,
                       status: 'uploaded',
                       uploadedFile: uploadedFile,
                     });
                   }
                }
                // If a report document exists in jobData.documents, add it here with 'uploaded' status
                else if (DOCUMENT_TYPES.some(dt => dt.id === docId)) {
                   const baseDoc = DOCUMENT_TYPES.find(d => d.id === docId)!;
                   updatedDocsMap.set(docId, {
                      ...baseDoc,
                      status: 'uploaded',
                      uploadedFile: uploadedFile,
                   });
                }
              }
            }
          }

          // --- Add/Update Report Documents based on job status ---
          const addOrUpdateReportDoc = (docId: string, reportData: any, defaultTitle: string) => {
            const baseDoc = DOCUMENT_TYPES.find(d => d.id === docId);
            const uploadedFileData = jobData.documents?.[docId]; // Check if file exists in documents

            // Determine payment and completion status using only direct properties
            const isPaid = reportData?.status === 'paid';
            const isCompleted = reportData?.status === 'completed';
            const reportCreatedAt = reportData?.createdAt; // Use direct createdAt if available
            const reportUpdatedAt = reportData?.updatedAt; // Use direct updatedAt if available

            // Add/Update if the report is paid or completed
            if (isPaid || isCompleted) {
              const currentDocData = updatedDocsMap.get(docId);
              updatedDocsMap.set(docId, {
                id: docId,
                title: baseDoc?.title || defaultTitle,
                path: baseDoc?.path || '/document-store',
                type: baseDoc?.type || 'document',
                category: baseDoc?.category || 'Report',
                versions: currentDocData?.versions || (uploadedFileData ? [{ version: 1, uploadedAt: uploadedFileData.uploadedAt, filename: uploadedFileData.filename, originalName: uploadedFileData.originalName, size: uploadedFileData.size, uploadedBy: 'system' }] : []),
                currentVersion: currentDocData?.currentVersion || 1,
                createdAt: reportCreatedAt || currentDocData?.createdAt || new Date().toISOString(),
                updatedAt: reportUpdatedAt || currentDocData?.updatedAt || new Date().toISOString(),
                isActive: true,
                // Set status based on report completion and file upload
                status: isCompleted ? 'uploaded' : (isPaid ? 'pending' : 'required'),
                uploadedFile: uploadedFileData || undefined,
              });
            } else if (!updatedDocsMap.has(docId) && baseDoc) {
              // Ensure standard reports from DOCUMENT_TYPES are present as 'required' if not paid/completed
              updatedDocsMap.set(docId, {
                ...baseDoc,
                status: 'required',
                uploadedFile: undefined,
                versions: [],
                currentVersion: 0,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                isActive: true
              });
            }
          };

          addOrUpdateReportDoc('custom-assessment', jobData.customAssessment, 'Custom Assessment');
          addOrUpdateReportDoc('statement-of-environmental-effects', jobData.statementOfEnvironmentalEffects, 'Statement of Environmental Effects');
          addOrUpdateReportDoc('complying-development-certificate', jobData.complyingDevelopmentCertificate, 'Complying Development Certificate');

          // Add purchased pre-prepared assessments (ensure they are added even if not in DOCUMENT_TYPES)
          if (jobData.purchasedPrePreparedAssessments) {
             for (const [assessmentId, assessmentDetails] of Object.entries(jobData.purchasedPrePreparedAssessments as Record<string, any>)) {
                const docId = `pre-prepared-${assessmentId}`;
                const uploadedFile = jobData.documents?.[docId];
                if (uploadedFile && !updatedDocsMap.has(docId)) { // Add only if uploaded and not already present
                   updatedDocsMap.set(docId, {
                     id: docId,
                     title: assessmentDetails?.title || 'Pre-prepared Assessment',
                     path: 'document-store',
                     type: 'document',
                     category: 'Pre-prepared Assessments',
                     versions: [{
                       version: 1,
                       uploadedAt: uploadedFile.uploadedAt,
                       filename: uploadedFile.filename,
                       originalName: uploadedFile.originalName,
                       size: uploadedFile.size,
                       uploadedBy: 'system'
                     }],
                     currentVersion: 1,
                     createdAt: assessmentDetails?.purchaseDate || new Date().toISOString(),
                     updatedAt: uploadedFile.uploadedAt,
                     isActive: true,
                     status: 'uploaded',
                     uploadedFile: uploadedFile,
                   });
                }
             }
          }


          // Filter out any documents that shouldn't be shown (e.g., reports that are neither paid nor completed)
          const finalDocs = Array.from(updatedDocsMap.values()).filter(doc => {
             const reportTypes = ['custom-assessment', 'statement-of-environmental-effects', 'complying-development-certificate'];
             if (reportTypes.includes(doc.id)) {
                // Keep if status is 'uploaded' or 'pending' (which we set for paid/completed)
                return doc.status === 'uploaded' || doc.status === 'pending';
             }
             // Keep pre-prepared (already filtered by purchase) and standard required docs
             return true;
          });


          setDocuments(finalDocs);
        }
      } catch (err) {
        console.error('Error in fetchDocuments:', err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load documents');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchJobAndDocuments(); // Renamed function

    return () => {
      isMounted = false;  // Cleanup
    };
  }, [params.id]); // Removed setJobs dependency


  // Add loading state to UI
  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#323A40] mb-4"></div>
            <p className="text-[#323A40]">Loading documents...</p>
          </div>
        </div>
      </div>
    );
  }

  const handleFileUpload = async (docId: string, file: File) => {
    try {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload a file smaller than 10MB",
          variant: "destructive"
        })
        return
      }

      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF or Word document",
          variant: "destructive"
        })
        return
      }

      const formData = new FormData()
      formData.append('file', file)
      formData.append('docId', docId)
      formData.append('jobId', params.id)

      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Failed to upload document')
      }

      const updatedDoc = await response.json()

      // Update document status
      setDocuments(docs =>
        docs.map(doc =>
          doc.id === docId
            ? { ...doc, status: 'uploaded', uploadedFile: updatedDoc }
            : doc
        )
      )

      // Update job document status
      if (job) {
        const updatedJob = { ...job }
        if (!updatedJob.documents) {
          updatedJob.documents = {}
        }
        updatedJob.documents[docId] = updatedDoc
        setJob(updatedJob)
      }

      toast({
        title: "Success",
        description: "Document uploaded successfully"
      })
    } catch (error) {
      console.error('Error uploading document:', error)
      toast({
        title: "Error",
        description: "Failed to upload document",
        variant: "destructive"
      })
    }
  }

  const handleRemoveDocument = async (docId: string) => {
    // Prevent removing reports managed by status
     const reportTypes = ['custom-assessment', 'statement-of-environmental-effects', 'complying-development-certificate'];
     if (reportTypes.includes(docId)) {
        toast({ title: "Action Not Allowed", description: "Generated reports cannot be removed directly.", variant: "destructive" });
        return;
     }
     // Prevent removing pre-prepared assessments
      if (docId.startsWith('pre-prepared-')) {
         toast({ title: "Action Not Allowed", description: "Purchased pre-prepared assessments cannot be removed.", variant: "destructive" });
         return;
      }

    try {
      const response = await fetch(`/api/jobs/${params.id}/documents/${docId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete document')
      }

      // Update state to reflect removal
      setDocuments(prev => prev.map(doc =>
        doc.id === docId
          ? { ...doc, status: 'required', uploadedFile: undefined }
          : doc
      ));
      // No need for hasUnsavedChanges here as delete is immediate
       toast({ title: "Success", description: "Document removed." });
    } catch (err) {
      console.error('Error removing document:', err)
      setError(err instanceof Error ? err.message : 'Failed to remove document')
       toast({ title: "Error", description: err instanceof Error ? err.message : 'Failed to remove document.', variant: "destructive" });
    }
  }

  const handleDownload = async (docId: string) => {
    try {
      const doc = documents.find(d => d.id === docId)
      if (!doc?.uploadedFile) {
        throw new Error('Document not found')
      }

      const response = await fetch(`/api/documents/download?jobId=${params.id}&docId=${docId}`)
      if (!response.ok) {
        throw new Error('Failed to download document')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = doc.uploadedFile.originalName
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error downloading document:', error)
      toast({
        title: "Error",
        description: "Failed to download document",
        variant: "destructive"
      })
    }
  }

  // Auto-save when leaving the page - Removed as saves are instant now
  // useEffect(() => {
  //   const handleBeforeUnload = (e: BeforeUnloadEvent) => {
  //     if (hasUnsavedChanges) {
  //       e.preventDefault()
  //       e.returnValue = ''
  //     }
  //   }
  //   window.addEventListener('beforeunload', handleBeforeUnload)
  //   return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  // }, [hasUnsavedChanges])

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            className="p-2"
            onClick={() => {
              // No need to check hasUnsavedChanges if saves are instant
              router.back()
            }}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-semibold text-[#323A40]">Document Store</h1>
        </div>
         {/* Removed Save Changes button as saves are instant */}
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {documents.map((doc) => (
          <DocumentRenderer
            key={doc.id}
            doc={doc}
            job={job}
            onDownload={handleDownload}
            onRemove={handleRemoveDocument}
            onUpload={handleFileUpload}
          />
        ))}
      </div>
    </div>
  )
}
