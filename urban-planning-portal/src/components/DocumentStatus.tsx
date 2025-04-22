import { Check } from 'lucide-react';

interface Document {
  id?: string;
  status?: string;
  uploadedFile?: {
    originalName?: string;
  };
}

const DocumentStatus = ({ document }: { document: Document }) => {
  const documentName = document?.uploadedFile?.originalName || '10.7 Certificate Check.pdf';

  return (
    <div className={`flex items-center text-sm ${document?.status === 'uploaded' ? 'text-green-600' : 'text-gray-500'}`}>
      <Check className={`h-4 w-4 mr-2 ${document?.status === 'uploaded' ? '' : 'opacity-0'}`} />
      <span>
        {document?.status === 'uploaded'
          ? `10.7 Certificate: ${documentName}`
          : '10.7 Certificate: (Required)'}
      </span>
    </div>
  );
};

export default DocumentStatus;
