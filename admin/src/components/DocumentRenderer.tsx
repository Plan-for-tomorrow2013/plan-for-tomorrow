import { FileText } from 'lucide-react';
import { Button } from '@shared/components/ui/button';
import { DocumentWithStatus } from '@shared/types/documents';

interface DocumentRendererProps {
  doc: DocumentWithStatus;
  jobId: string;
}

export function DocumentRenderer({ doc, jobId }: DocumentRendererProps) {
  const uploadedFile = doc.uploadedFile;
  if (!uploadedFile?.fileName || !uploadedFile?.originalName) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm">
        <FileText className="h-4 w-4" />
        <span>{uploadedFile.originalName}</span>
      </div>
      <div className="text-sm text-gray-500">
        Uploaded: {new Date(uploadedFile.uploadedAt).toLocaleDateString()}
      </div>
      <Button
        variant="outline"
        className="w-full"
        onClick={() =>
          window.open(
            `/api/download-document?jobId=${jobId}&fileName=${encodeURIComponent(uploadedFile.fileName)}&originalName=${encodeURIComponent(uploadedFile.originalName)}`,
            '_blank'
          )
        }
      >
        <FileText className="h-4 w-4 mr-2" />
        Download Document
      </Button>
    </div>
  );
}
