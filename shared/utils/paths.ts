import path from 'path'

// Base paths
export const getBasePath = () => process.cwd()
export const getPortalPath = () => path.join(getBasePath(), 'urban-planning-portal')
export const getDataPath = () => path.join(getPortalPath(), 'data')

// Document paths
export const getDocumentsPath = () => path.join(getDataPath(), 'documents')
export const getDocumentPath = (documentId: string, version: number, extension: string) =>
  path.join(getDocumentsPath(), `${documentId}-v${version}${extension}`)
export const getDocumentsMetadataPath = () => path.join(getDocumentsPath(), 'metadata.json')

// Job paths
export const getJobsPath = () => path.join(getDataPath(), 'jobs')
export const getJobPath = (jobId: string) => path.join(getJobsPath(), `${jobId}.json`)
export const getJobDocumentsPath = (jobId: string) => path.join(getJobsPath(), jobId, 'documents')

// Work ticket paths
export const getWorkTicketsPath = () => path.join(getDataPath(), 'work-tickets.json')
export const getWorkTicketPath = (ticketId: string) => path.join(getDataPath(), 'work-tickets', `${ticketId}.json`)

// Constants
export const MAX_FILE_SIZE = 20 * 1024 * 1024 // 20MB

// Ensure all paths exist
export const validatePaths = () => {
  const paths = [
    getPortalPath(),
    getDataPath(),
    getJobsPath()
  ]
  return paths.every(p => p.startsWith(getBasePath()))
}
