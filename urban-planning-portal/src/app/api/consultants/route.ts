import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// Path to the consultants data file
const consultantsPath =
  '/home/tania/urban-planning-professionals-portal/admin/admin/data/consultants.json';

interface Consultant {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  category: string;
  [key: string]: unknown;
}

// GET /api/consultants
export async function GET(request: Request) {
  try {
    // Check if the consultants file exists
    try {
      await fs.access(consultantsPath);
    } catch (accessError) {
      // Return empty array if the file doesn't exist
      return NextResponse.json([]);
    }

    const data = await fs.readFile(consultantsPath, 'utf8');
    const consultants: Consultant[] = JSON.parse(data);

    // Get the category from the query parameters
    const url = new URL(request.url);
    const category = decodeURIComponent(url.searchParams.get('category') || '');

    if (category) {
      // Normalize the category by replacing hyphens with spaces
      const normalizedCategory = category.replace(/-/g, ' ');

      // Filter consultants by category (case-insensitive)
      const filteredConsultants = consultants.filter(
        (consultant: Consultant) =>
          consultant.category.toLowerCase() === normalizedCategory.toLowerCase()
      );
      return NextResponse.json(filteredConsultants);
    }

    // If no category is provided, return all consultants
    return NextResponse.json(consultants);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch consultants' }, { status: 500 });
  }
}

// POST /api/consultants
export async function POST(request: Request) {
  try {
    const consultant = await request.json();

    // Validate required fields
    const requiredFields = ['name', 'email', 'phone', 'company', 'category'];
    const missingFields = requiredFields.filter(field => !consultant[field]);

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Read existing consultants
    let consultants: Consultant[] = [];
    try {
      const data = await fs.readFile(consultantsPath, 'utf8');
      consultants = JSON.parse(data);
    } catch (error) {
      // If file doesn't exist, start with empty array
      consultants = [];
    }

    // Generate a unique ID
    const newConsultant: Consultant = {
      id: Date.now().toString(),
      ...consultant,
    };

    // Add new consultant
    consultants.push(newConsultant);

    // Write back to file
    await fs.writeFile(consultantsPath, JSON.stringify(consultants, null, 2));

    return NextResponse.json(newConsultant);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create consultant' }, { status: 500 });
  }
}
