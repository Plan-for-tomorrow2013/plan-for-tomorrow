import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

interface KBSection {
  id: string;
  title: string;
  assessments: Array<{
    id: string;
    title: string;
    content: string;
    author: string;
    date: string;
    lepName: string;
    file: {
      id: string;
      originalName: string;
      savedPath: string;
    } | null;
  }>;
}

// Admin data directory (for the JSON file)
const adminDataDir = path.join(process.cwd(), 'admin', 'data');
const kbComplyingDevelopmentAssessmentsPath = path.join(
  adminDataDir,
  'kb-complying-development-assessments.json'
);
// Client portal public directory (for the actual files)
const clientPublicDocumentsDir = path.join(
  process.cwd(),
  '..',
  'urban-planning-portal',
  'public',
  'documents',
  'kb-complying-development-assessments'
);

// Ensure necessary directories and files exist
async function ensureInfrastructure() {
  try {
    await fs.mkdir(adminDataDir, { recursive: true }); // Ensure admin data dir exists
    await fs.mkdir(clientPublicDocumentsDir, { recursive: true }); // Ensure client public dir exists
    // Try to access the JSON file to see if it exists
    await fs.access(kbComplyingDevelopmentAssessmentsPath);
  } catch (error) {
    // Check if the error is because the file doesn't exist
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      // If the file doesn't exist, create it with an empty array
      await fs.writeFile(kbComplyingDevelopmentAssessmentsPath, '[]');
    } else {
      // If it's another error, rethrow it
      throw error; // Rethrow unexpected errors
    }
  }
}

// GET /api/kb-complying-development-assessments
export async function GET() {
  try {
    await ensureInfrastructure(); // Ensure file and dirs exist
    const data = await fs.readFile(kbComplyingDevelopmentAssessmentsPath, 'utf8');
    const kbComplyingDevelopmentAssessments: KBSection[] = JSON.parse(data);
    return NextResponse.json(kbComplyingDevelopmentAssessments);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch kb complying development assessments' },
      { status: 500 }
    );
  }
}

// POST /api/kb-complying-development-assessments
export async function POST(request: NextRequest) {
  try {
    await ensureInfrastructure();
    const formData = await request.formData();
    const sectionTitle = formData.get('section') as string; // Get the section title
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const author = formData.get('author') as string; // Assuming author comes from session or elsewhere
    const file = formData.get('file') as File | null;
    const lepName = formData.get('lepName') as string | null;

    if (!sectionTitle || !title || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: section, title, or content' },
        { status: 400 }
      );
    }

    // Read existing assessments
    const data = await fs.readFile(kbComplyingDevelopmentAssessmentsPath, 'utf8');
    const kbComplyingDevelopmentAssessments: KBSection[] = JSON.parse(data);

    // Check if the section already exists
    let sectionIndex = kbComplyingDevelopmentAssessments.findIndex(
      section => section.title === sectionTitle
    );
    if (sectionIndex === -1) {
      // Create a new section if it doesn't exist
      const newSection: KBSection = {
        id: uuidv4(), // Generate a unique ID for the section
        title: sectionTitle,
        assessments: [],
      };
      kbComplyingDevelopmentAssessments.push(newSection);
      // Set sectionIndex to the index of the newly added section
      sectionIndex = kbComplyingDevelopmentAssessments.length - 1; // Update sectionIndex to the new section's index
    }

    // Create the new assessment
    const newAssessment = {
      id: uuidv4(),
      title,
      content,
      author: author || 'Admin User', // Use provided author or default
      date: new Date().toISOString(),
      lepName: lepName || '', // Add lepName to the assessment
      file: file
        ? {
            id: uuidv4(), // Generate a unique ID for the file
            originalName: file.name,
            savedPath: `/documents/kb-complying-development-assessments/${file.name}`,
          }
        : null,
    };

    // --- BEGIN FILE SAVING LOGIC ---
    if (file) {
      try {
        // Construct the full path to save the file in the CLIENT PORTAL's public directory
        const saveFilePath = path.join(clientPublicDocumentsDir, file.name);

        // Read the file content as ArrayBuffer
        const fileBuffer = await file.arrayBuffer();

        // Write the file to the public directory
        await fs.writeFile(saveFilePath, Buffer.from(fileBuffer));
      } catch (fileError) {
        // Decide if you want to stop the whole process or just log the error
        // For now, we'll return an error response if file saving fails
        return NextResponse.json({ error: 'Failed to save uploaded file' }, { status: 500 });
      }
    }
    // --- END FILE SAVING LOGIC ---

    // Add the new assessment to the corresponding section
    kbComplyingDevelopmentAssessments[sectionIndex].assessments.push(newAssessment);

    // Write the updated sections back to the JSON file
    await fs.writeFile(
      kbComplyingDevelopmentAssessmentsPath,
      JSON.stringify(kbComplyingDevelopmentAssessments, null, 2)
    );

    return NextResponse.json(newAssessment, { status: 201 }); // Return 201 Created status
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create kb complying development assessments' },
      { status: 500 }
    );
  }
}
