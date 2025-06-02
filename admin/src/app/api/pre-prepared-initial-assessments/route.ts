import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

// Admin data directory (for the JSON file)
const adminDataDir = path.join(process.cwd(), 'admin', 'data');
const prePreparedInitialAssessmentsPath = path.join(adminDataDir, 'pre-prepared-initial-assessments.json');
// Client portal public directory (for the actual files)
const clientPublicDocumentsDir = path.join(process.cwd(), '..', 'urban-planning-portal', 'public', 'documents', 'pre-prepared');

// Ensure necessary directories and files exist
async function ensureInfrastructure() {
  try {
    await fs.mkdir(adminDataDir, { recursive: true }); // Ensure admin data dir exists
    await fs.mkdir(clientPublicDocumentsDir, { recursive: true }); // Ensure client public dir exists
    // Try to access the JSON file to see if it exists
    await fs.access(prePreparedInitialAssessmentsPath);
  } catch (error: any) {
    // Check if the error is because the file doesn't exist
    if (error.code === 'ENOENT') {
      // If the file doesn't exist, create it with an empty array
      await fs.writeFile(prePreparedInitialAssessmentsPath, '[]')
    } else {
      // If it's another error, rethrow it
      console.error("Error ensuring infrastructure:", error);
      throw error; // Rethrow unexpected errors
    }
  }
}

// GET /api/pre-prepared-initial-assessments
export async function GET() {
  try {
    await ensureInfrastructure() // Ensure file and dirs exist
    const data = await fs.readFile(prePreparedInitialAssessmentsPath, 'utf8')
    const prePreparedAssessments = JSON.parse(data)
    return NextResponse.json(prePreparedAssessments)
  } catch (error) {
    console.error('Error reading pre-prepared assessments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch pre-prepared assessments' },
      { status: 500 }
    )
  }
}

// POST /api/pre-prepared-initial-assessments
export async function POST(request: Request) {
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
    const data = await fs.readFile(prePreparedInitialAssessmentsPath, 'utf8');
    const prePreparedInitialAssessments = JSON.parse(data);

    // Check if the section already exists
    let sectionIndex = prePreparedInitialAssessments.findIndex((section: { title: string }) => section.title === sectionTitle);
    if (sectionIndex === -1) {
      // Create a new section if it doesn't exist
      const newSection = {
        id: uuidv4(), // Generate a unique ID for the section
        title: sectionTitle,
        assessments: [],
      };
      prePreparedInitialAssessments.push(newSection);
      // Set sectionIndex to the index of the newly added section
      sectionIndex = prePreparedInitialAssessments.length - 1; // Update sectionIndex to the new section's index
    }

    // Create the new assessment
    const newAssessment = {
      id: uuidv4(),
      title,
      content,
      author: author || "Admin User", // Use provided author or default
      date: new Date().toISOString(),
      lepName: lepName || '', // Add lepName to the assessment
      file: file ? {
        id: uuidv4(), // Generate a unique ID for the file
        originalName: file.name,
        savedPath: `/documents/pre-prepared/${file.name}`, // Adjust as needed
      } : null,
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

        console.log(`File saved successfully to: ${saveFilePath}`);

      } catch (fileError) {
        console.error('Error saving uploaded file:', fileError);
        // Decide if you want to stop the whole process or just log the error
        // For now, we'll return an error response if file saving fails
        return NextResponse.json(
          { error: 'Failed to save uploaded file' },
          { status: 500 }
        );
      }
    }
    // --- END FILE SAVING LOGIC ---

    // Add the new assessment to the corresponding section
    prePreparedInitialAssessments[sectionIndex].assessments.push(newAssessment);

    // Write the updated sections back to the JSON file
    await fs.writeFile(prePreparedInitialAssessmentsPath, JSON.stringify(prePreparedInitialAssessments, null, 2));

    return NextResponse.json(newAssessment, { status: 201 }); // Return 201 Created status

  } catch (error) {
    console.error('Error creating pre-prepared initial assessments:', error);
    return NextResponse.json(
      { error: 'Failed to create pre-prepared initial assessments' },
      { status: 500 }
    );
  }
}
