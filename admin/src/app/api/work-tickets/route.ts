import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import { getWorkTicketsPath } from '@shared/utils/paths';

export async function GET() {
  try {
    const filePath = getWorkTicketsPath();
    console.log('Resolved work tickets path:', filePath);
    const data = await fs.readFile(filePath, 'utf8');
    const tickets = JSON.parse(data);
    return NextResponse.json(tickets);
  } catch (error: any) {
    console.error('Error fetching work tickets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch work tickets', details: error?.message || String(error) },
      { status: 500 }
    );
  }
}
