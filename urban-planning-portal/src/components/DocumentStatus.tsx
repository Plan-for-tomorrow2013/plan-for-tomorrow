import { Check } from 'lucide-react';

interface Document {
  id: string;
  title: string;
  status: 'uploaded' | 'required' | 'optional';
  uploadedFile?: {
    originalName: string;
  };
}

const DocumentStatus = ({ document }: { document: Document }) => {
  const documentName = document.uploadedFile?.originalName || document.title;

  return (
    <div className={`flex items-center text-sm ${
      document.status === 'uploaded' ? 'text-green-600' :
      document.status === 'required' ? 'text-gray-500' :
      'text-gray-400'
    }`}>
      <Check className={`h-4 w-4 mr-2 ${document.status === 'uploaded' ? '' : 'opacity-0'}`} />
      <span>
        {document.status === 'uploaded'
          ? `${document.title}: ${documentName}`
          : document.status === 'required'
          ? `${document.title}: (Required)`
          : `${document.title}: (Optional)`}
      </span>
    </div>
  );
};

export default DocumentStatus;
