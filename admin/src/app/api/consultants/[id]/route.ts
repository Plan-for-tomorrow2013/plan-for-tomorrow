import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';

// Path to the consultants data file
const consultantsPath =
  '/home/tania/urban-planning-professionals-portal/admin/admin/data/consultants.json';

// GET /api/consultants/[id]
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const data = await fs.readFile(consultantsPath, 'utf8');
    const consultants = JSON.parse(data);
    const consultant = consultants.find((c: { id: string }) => c.id === params.id);

    if (!consultant) {
      return NextResponse.json({ error: 'Consultant not found' }, { status: 404 });
    }

    return NextResponse.json(consultant);
  } catch (error) {
    console.error('Error reading consultant:', error);
    return NextResponse.json({ error: 'Failed to fetch consultant' }, { status: 500 });
  }
}

// PUT /api/consultants/[id]
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const updatedConsultant = await request.json();

    // Validate required fields
    const requiredFields = ['name', 'email', 'phone', 'company', 'category'];
    const missingFields = requiredFields.filter(field => !updatedConsultant[field]);

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    const data = await fs.readFile(consultantsPath, 'utf8');
    const consultants = JSON.parse(data);
    const index = consultants.findIndex((c: { id: string }) => c.id === params.id);

    if (index === -1) {
      return NextResponse.json({ error: 'Consultant not found' }, { status: 404 });
    }

    // Update consultant
    consultants[index] = {
      ...consultants[index],
      ...updatedConsultant,
      id: params.id, // Ensure ID doesn't change
    };

    // Write back to file
    await fs.writeFile(consultantsPath, JSON.stringify(consultants, null, 2));

    return NextResponse.json(consultants[index]);
  } catch (error) {
    console.error('Error updating consultant:', error);
    return NextResponse.json({ error: 'Failed to update consultant' }, { status: 500 });
  }
}

// DELETE /api/consultants/[id]
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const data = await fs.readFile(consultantsPath, 'utf8');
    const consultants = JSON.parse(data);
    const index = consultants.findIndex((c: { id: string }) => c.id === params.id);

    if (index === -1) {
      return NextResponse.json({ error: 'Consultant not found' }, { status: 404 });
    }

    // Remove consultant
    consultants.splice(index, 1);

    // Write back to file
    await fs.writeFile(consultantsPath, JSON.stringify(consultants, null, 2));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting consultant:', error);
    return NextResponse.json({ error: 'Failed to delete consultant' }, { status: 500 });
  }
}
