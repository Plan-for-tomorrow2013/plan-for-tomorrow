import { NextResponse, NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';

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

// Define the path to the JSON data file - correcting the path relative to the likely CWD
const dataFilePath = path.resolve(
  process.cwd(),
  'admin/data/kb-development-application-assessments.json'
);
// Define the base path for the public documents in the client portal project
const documentsBasePath = path.resolve(process.cwd(), '../urban-planning-portal/public');

export async function DELETE(
  request: NextRequest,
  { params }: { params: { assessmentId: string } }
) {
  const assessmentIdToDelete = params.assessmentId;

  if (!assessmentIdToDelete) {
    return NextResponse.json({ error: 'Assessment ID is required' }, { status: 400 });
  }

  console.log(`Attempting to delete assessment with ID: ${assessmentIdToDelete}`);

  try {
    // Check if the data file exists
    if (!fs.existsSync(dataFilePath)) {
      console.error(`Data file not found at: ${dataFilePath}`);
      return NextResponse.json({ error: 'Assessment data file not found' }, { status: 500 });
    }

    // Read and parse the JSON data
    const jsonData = fs.readFileSync(dataFilePath, 'utf-8');
    const sections: Section[] = JSON.parse(jsonData);

    let assessmentFound = false;
    let savedPathToDelete: string | undefined = undefined;
    let sectionIndex = -1;
    let assessmentIndex = -1;

    // Find the assessment and its location
    for (let i = 0; i < sections.length; i++) {
      const assessments = sections[i].assessments;
      for (let j = 0; j < assessments.length; j++) {
        if (assessments[j].id === assessmentIdToDelete) {
          assessmentFound = true;
          savedPathToDelete = assessments[j].file?.savedPath;
          sectionIndex = i;
          assessmentIndex = j;
          break;
        }
      }
      if (assessmentFound) break;
    }

    if (!assessmentFound) {
      console.log(`Assessment with ID ${assessmentIdToDelete} not found in data file.`);
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
    }

    // Remove the assessment from the section
    sections[sectionIndex].assessments.splice(assessmentIndex, 1);

    // Write the updated data back to the JSON file
    fs.writeFileSync(dataFilePath, JSON.stringify(sections, null, 2), 'utf-8');
    console.log(`Assessment ${assessmentIdToDelete} removed from ${dataFilePath}`);

    // Delete the associated file if it exists
    if (savedPathToDelete) {
      // Ensure savedPath doesn't start with a slash if documentsBasePath already handles the root
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
        // Decide if this should be a critical error or just a warning
        // For now, we'll log it but still return success for the data deletion
      }
    } else {
      console.log(`No associated file path found for assessment ${assessmentIdToDelete}.`);
    }

    return NextResponse.json({ message: 'Assessment deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error during assessment deletion process:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json(
      { error: 'Internal Server Error', details: errorMessage },
      { status: 500 }
    );
  }
}
