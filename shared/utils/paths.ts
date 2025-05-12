import path from 'path'
import fs from 'fs/promises'

// Base paths
// Use absolute path from environment variable for consistency, fallback to cwd
const absoluteBasePath = process.env.PROJECT_ROOT || process.cwd();
export const getBasePath = () => absoluteBasePath;

// Define the single, unambiguous data location relative to the project root
export const getDataPath = () => path.join(getBasePath(), 'urban-planning-portal', 'data');

// Document paths (derive from the unambiguous getDataPath)
export const getDocumentsPath = () => path.join(getDataPath(), 'documents');
export const getDocumentPath = (documentId: string, version: number, extension: string) =>
  path.join(getDocumentsPath(), `${documentId}-v${version}${extension}`);
export const getDocumentsMetadataPath = () => path.join(getDocumentsPath(), 'metadata.json');

// Job paths (derive from the unambiguous getDataPath)
export const getJobsPath = () => path.join(getDataPath(), 'jobs');
export const getJobPath = (jobId: string) => path.join(getJobsPath(), `${jobId}.json`);
export const getJobDocumentsPath = (jobId: string) => path.join(getJobsPath(), jobId, 'documents');

// Work ticket paths (derive from the unambiguous getDataPath)
export const getWorkTicketsPath = () => path.join(getDataPath(), 'work-tickets.json');
export const getWorkTicketPath = (ticketId: string) => path.join(getDataPath(), 'work-tickets', `${ticketId}.json`);

// Constants
export const MAX_FILE_SIZE = 20 * 1024 * 1024 // 20MB

// Ensure all paths exist (validatePaths might need review depending on usage context)
// For now, keeping it simple, assuming it's called where getBasePath() is meaningful
export const validatePaths = () => {
  const paths = [
    getDataPath(),
    getJobsPath(),
    getDocumentsPath(),
    path.join(getDataPath(), 'work-tickets') // Add work-tickets directory to validation
  ];
  // Validate against the absolute base path
  return paths.every(p => p.startsWith(getBasePath()));
}

// Helper function to ensure directory exists
export const ensureDirectoryExists = async (dirPath: string) => {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
      throw error;
    }
  }
};
