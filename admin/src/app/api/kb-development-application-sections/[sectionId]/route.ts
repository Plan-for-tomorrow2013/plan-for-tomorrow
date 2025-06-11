import { NextResponse, NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';

// Define interfaces (can potentially be shared in a types file later)
interface FileDetails {
  id: string;
  originalName: string;
  savedPath: string;
}

interface Assessment {
  id: string;
  title: string;
  content: string;
  author: string;
  date: string;
  file?: FileDetails;
}

interface Section {
  id: string;
  title: string;
  assessments: Assessment[];
}

// Define the path to the JSON data file
const dataFilePath = path.resolve(process.cwd(), 'admin/data/kb-development-application-sections.json');
// Define the base path for the public documents in the client portal project
const documentsBasePath = path.resolve(process.cwd(), '../urban-planning-portal/public');

export async function DELETE(
  request: NextRequest,
  { params }: { params: { sectionId: string } }
) {
  const sectionIdToDelete = params.sectionId;

  if (!sectionIdToDelete) {
    return NextResponse.json({ error: 'Section ID is required' }, { status: 400 });
  }

  console.log(`Attempting to delete section with ID: ${sectionIdToDelete}`);

  try {
    // Check if the data file exists
    if (!fs.existsSync(dataFilePath)) {
      console.error(`Data file not found at: ${dataFilePath}`);
      return NextResponse.json({ error: 'Assessment data file not found' }, { status: 500 });
    }

    // Read and parse the JSON data
    let sections: Section[] = JSON.parse(fs.readFileSync(dataFilePath, 'utf-8'));

    const sectionIndex = sections.findIndex(section => section.id === sectionIdToDelete);

    if (sectionIndex === -1) {
      console.log(`Section with ID ${sectionIdToDelete} not found.`);
      return NextResponse.json({ error: 'Section not found' }, { status: 404 });
    }

    // Get the section to be deleted
    const sectionToDelete = sections[sectionIndex];

    // Delete associated files for all assessments within the section
    if (sectionToDelete.assessments && sectionToDelete.assessments.length > 0) {
      console.log(`Deleting files for assessments in section ${sectionIdToDelete}...`);
      sectionToDelete.assessments.forEach(assessment => {
        if (assessment.file && assessment.file.savedPath) {
          const savedPathToDelete = assessment.file.savedPath;
          const relativeSavedPath = savedPathToDelete.startsWith('/')
            ? savedPathToDelete.substring(1)
            : savedPathToDelete;
          const filePathToDelete = path.join(documentsBasePath, relativeSavedPath);

          try {
            if (fs.existsSync(filePathToDelete)) {
              fs.unlinkSync(filePathToDelete);
              console.log(`Deleted associated file: ${filePathToDelete}`);
            } else {
              console.log(`Associated file not found, skipping deletion: ${filePathToDelete}`);
            }
          } catch (fileError) {
            console.error(`Error deleting file ${filePathToDelete}:`, fileError);
            // Log error but continue trying to delete other files and the section data
          }
        }
      });
    } else {
        console.log(`No assessments with files found in section ${sectionIdToDelete}.`)
    }

    // Remove the section from the array
    sections.splice(sectionIndex, 1);

    // Write the updated data back to the JSON file
    fs.writeFileSync(dataFilePath, JSON.stringify(sections, null, 2), 'utf-8');
    console.log(`Section ${sectionIdToDelete} removed from ${dataFilePath}`);

    return NextResponse.json({ message: 'Section and associated files deleted successfully' }, { status: 200 });

  } catch (error) {
    console.error('Error during section deletion process:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Internal Server Error', details: errorMessage }, { status: 500 });
  }
}
