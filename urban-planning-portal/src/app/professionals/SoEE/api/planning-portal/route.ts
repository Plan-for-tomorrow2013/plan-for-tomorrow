import { type NextRequest, NextResponse } from 'next/server';

interface PlanningPortalData {
  lepName: string;
  zoning: string;
  heightOfBuildings: string;
  floorSpaceRatio: string;
  dcpName: string;
}

interface PlanningPortalResponse {
  success: boolean;
  data?: PlanningPortalData;
  error?: string;
  source: 'nsw-planning-portal' | 'mock';
}

export async function GET(request: NextRequest): Promise<NextResponse<PlanningPortalResponse>> {
  const searchParams = request.nextUrl.searchParams;
  const address = searchParams.get('address');
  const councilArea = searchParams.get('councilArea');

  if (!address || !councilArea) {
    return NextResponse.json({
      success: false,
      error: 'Address and council area are required',
      source: 'mock' as const,
    });
  }

  try {
    // In a real implementation, this would call the NSW Planning Portal API
    // For now, we'll return mock data based on the council area

    let mockData: PlanningPortalData;

    if (councilArea.toLowerCase().includes('cumberland')) {
      mockData = {
        lepName: 'Cumberland Local Environmental Plan 2021',
        zoning: 'R2 Low Density Residential',
        heightOfBuildings: '8.5m',
        floorSpaceRatio: '0.5:1',
        dcpName: 'Cumberland Development Control Plan 2021',
      };
    } else if (councilArea.toLowerCase().includes('parramatta')) {
      mockData = {
        lepName: 'Parramatta Local Environmental Plan 2011',
        zoning: 'R2 Low Density Residential',
        heightOfBuildings: '9m',
        floorSpaceRatio: '0.5:1',
        dcpName: 'Parramatta Development Control Plan 2011',
      };
    } else if (councilArea.toLowerCase().includes('blacktown')) {
      mockData = {
        lepName: 'Blacktown Local Environmental Plan 2015',
        zoning: 'R2 Low Density Residential',
        heightOfBuildings: '8.5m',
        floorSpaceRatio: '0.5:1',
        dcpName: 'Blacktown Development Control Plan 2015',
      };
    } else {
      // Default data for other councils
      mockData = {
        lepName: `${councilArea} Local Environmental Plan`,
        zoning: 'R2 Low Density Residential',
        heightOfBuildings: '8.5m',
        floorSpaceRatio: '0.5:1',
        dcpName: `${councilArea} Development Control Plan`,
      };
    }

    return NextResponse.json({
      success: true,
      data: mockData,
      source: 'mock' as const,
    });
  } catch (error) {
    console.error('Error fetching planning portal data:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch planning data',
      source: 'mock' as const,
    });
  }
}
