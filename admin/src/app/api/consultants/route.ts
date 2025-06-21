import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { Consultant } from '@shared/types/documents';
import { ConsultantCategory } from '@shared/types/jobs';

// Path to the consultants data file
const consultantsPath =
  '/home/tania/urban-planning-professionals-portal/admin/admin/data/consultants.json';
const logoUploadDir =
  '/home/tania/urban-planning-professionals-portal/admin/public/uploads/consultant-logos/';

// GET /api/consultants
export async function GET(request: NextRequest) {
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
    const category = url.searchParams.get('category');

    if (category) {
      // Filter consultants by category
      const filteredConsultants = consultants.filter(
        consultant => consultant.category === category
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
export async function POST(request: NextRequest) {
  try {
    // Check if the request is multipart/form-data
    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('multipart/form-data')) {
      // Parse form data
      const formData = await request.formData();
      const consultant: Partial<Consultant> = {};
      // Convert formData.entries() to an array to avoid iteration issues
      const entries = Array.from(formData.entries());
      for (const [key, value] of entries) {
        if (key === 'logo' && value instanceof File && value.size > 0) {
          // Ensure the upload directory exists
          await fs.mkdir(logoUploadDir, { recursive: true });
          // Save the logo file
          const ext = path.extname(value.name);
          const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 6)}${ext}`;
          const filePath = path.join(logoUploadDir, fileName);
          const arrayBuffer = await value.arrayBuffer();
          await fs.writeFile(filePath, Buffer.from(arrayBuffer));
          consultant.logo = `/uploads/consultant-logos/${fileName}`;
        } else if (key === 'category') {
          consultant.category = value as ConsultantCategory;
        } else if (key !== 'logo') {
          consultant[key as keyof Omit<Consultant, 'logo' | 'category'>] = value as string;
        }
      }
      // Validate required fields
      const requiredFields: (keyof Consultant)[] = [
        'name',
        'email',
        'phone',
        'company',
        'category',
      ];
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
        consultants = [];
      }
      // Generate a unique ID
      const newConsultant: Consultant = {
        id: Date.now().toString(),
        ...(consultant as Omit<Consultant, 'id'>),
        logo: consultant.logo || '',
      };
      consultants.push(newConsultant);
      await fs.writeFile(consultantsPath, JSON.stringify(consultants, null, 2));
      return NextResponse.json(newConsultant);
    } else {
      // Fallback to JSON body (no logo upload)
      const consultant = (await request.json()) as Omit<Consultant, 'id' | 'logo'>;
      const requiredFields: (keyof Omit<Consultant, 'id' | 'logo'>)[] = [
        'name',
        'email',
        'phone',
        'company',
        'category',
      ];
      const missingFields = requiredFields.filter(field => !consultant[field]);
      if (missingFields.length > 0) {
        return NextResponse.json(
          { error: `Missing required fields: ${missingFields.join(', ')}` },
          { status: 400 }
        );
      }
      let consultants: Consultant[] = [];
      try {
        const data = await fs.readFile(consultantsPath, 'utf8');
        consultants = JSON.parse(data);
      } catch (error) {
        consultants = [];
      }
      const newConsultant: Consultant = {
        id: Date.now().toString(),
        ...consultant,
        logo: '',
      };
      consultants.push(newConsultant);
      await fs.writeFile(consultantsPath, JSON.stringify(consultants, null, 2));
      return NextResponse.json(newConsultant);
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create consultant' }, { status: 500 });
  }
}
