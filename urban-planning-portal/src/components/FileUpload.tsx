import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: string;
}

export default function FileUpload({ onFileSelect, accept }: FileUploadProps) {
  const handleClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept || '.pdf,.doc,.docx';
    input.onchange = (event: Event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) onFileSelect(file);
    };
    input.click();
  };

  return (
    <Button
      variant="outline"
      onClick={handleClick}
    >
      <Upload className="h-4 w-4 mr-2" />
      Upload Document
    </Button>
  );
}
