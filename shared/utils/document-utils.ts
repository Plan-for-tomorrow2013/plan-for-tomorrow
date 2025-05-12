import { toast } from "@shared/components/ui/use-toast"

/**
 * Creates and triggers a file input for document upload
 * @param onFileSelect Callback function that receives the selected file
 * @param accept Optional file types to accept (default: '.pdf,.doc,.docx')
 */
export const createFileInput = (
  onFileSelect: (file: File) => void,
  accept: string = '.pdf,.doc,.docx'
): void => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = accept
  input.onchange = (event: Event) => {
    const file = (event.target as HTMLInputElement).files?.[0]
    if (file) {
      onFileSelect(file)
    }
  }
  input.click()
}

/**
 * Handles document upload with error handling and notifications
 * @param uploadFn The upload function to call
 */
export const handleDocumentUpload = async (
  uploadFn: () => Promise<any>
): Promise<void> => {
  try {
    await uploadFn()
    toast({
      title: "Success",
      description: "Document uploaded successfully",
    })
  } catch (error) {
    console.error('Upload error:', error)
    toast({
      title: "Error",
      description: "Failed to upload document",
      variant: "destructive",
    })
  }
}

/**
 * Handles document download with error handling and notifications
 * @param downloadFn The download function to call
 */
export const handleDocumentDownload = async (
  downloadFn: () => Promise<any>
): Promise<void> => {
  try {
    await downloadFn()
  } catch (error) {
    console.error('Download error:', error)
    toast({
      title: "Error",
      description: "Failed to download document",
      variant: "destructive",
    })
  }
}

/**
 * Handles document deletion with confirmation, error handling and notifications
 * @param deleteFn The delete function to call
 */
export const handleDocumentDelete = async (
  deleteFn: () => Promise<any>
): Promise<void> => {
  if (confirm('Are you sure you want to delete this document?')) {
    try {
      await deleteFn()
      toast({
        title: "Success",
        description: "Document removed successfully",
      })
    } catch (error) {
      console.error('Delete error:', error)
      toast({
        title: "Error",
        description: "Failed to remove document",
        variant: "destructive",
      })
    }
  }
}

/**
 * Downloads a document directly from the API
 * @param document The document to download
 */
export const downloadDocumentFromApi = async (document: { id: string; title: string }): Promise<void> => {
  try {
    const response = await fetch(`/api/documents/${document.id}/download`)
    if (!response.ok) throw new Error('Failed to download document')
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = window.document.createElement('a')
    a.href = url
    a.download = document.title
    window.document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    window.document.body.removeChild(a)
  } catch (error) {
    console.error('Download error:', error)
    toast({
      title: "Error",
      description: "Failed to download document",
      variant: "destructive",
    })
  }
}
