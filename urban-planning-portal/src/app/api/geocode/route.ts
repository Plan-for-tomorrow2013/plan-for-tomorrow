import { NextResponse } from 'next/server';
import { geocodeAddress } from '@shared/services/geocodingService';

interface ProtectionResult {
  layerName: string;
  attributes: Record<string, unknown>;
}

interface ArcGISResult {
  layerName: string;
  attributes: Record<string, unknown>;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');

  if (!address) {
    return NextResponse.json({ error: 'Address is required' }, { status: 400 });
  }

  try {
    // Step 1: Get coordinates using our geocoding service
    const { longitude, latitude } = await geocodeAddress(address);

    if (!longitude || !latitude) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 });
    }

    // Step 2: Query all layers in parallel using the actual ArcGIS URLs
    const [epiResponse, protectionResponse, localProvisionsResponse] = await Promise.all([
      // Principal Planning Layers
      fetch(
        `https://mapprod3.environment.nsw.gov.au/arcgis/rest/services/Planning/Principal_Planning_Layers/MapServer/identify?${new URLSearchParams(
          {
            geometry: `${longitude},${latitude}`,
            geometryType: 'esriGeometryPoint',
            layers: 'all',
            tolerance: '1',
            mapExtent: `${longitude - 0.005},${latitude - 0.005},${longitude + 0.005},${latitude + 0.005}`,
            imageDisplay: '400,400,96',
            returnGeometry: 'false',
            f: 'json',
          },
        )}`,
      ),

      // Protection Layers
      fetch(
        `https://mapprod3.environment.nsw.gov.au/arcgis/rest/services/Planning/Protection/MapServer/identify?${new URLSearchParams(
          {
            geometry: `${longitude},${latitude}`,
            geometryType: 'esriGeometryPoint',
            layers: 'all',
            tolerance: '1',
            mapExtent: `${longitude - 0.005},${latitude - 0.005},${longitude + 0.005},${latitude + 0.005}`,
            imageDisplay: '400,400,96',
            returnGeometry: 'false',
            f: 'json',
          },
        )}`,
      ),

      // Local Provisions Layers
      fetch(
        `https://mapprod3.environment.nsw.gov.au/arcgis/rest/services/Planning/Development_Control/MapServer/identify?${new URLSearchParams(
          {
            geometry: `${longitude},${latitude}`,
            geometryType: 'esriGeometryPoint',
            layers: 'all',
            tolerance: '1',
            mapExtent: `${longitude - 0.005},${latitude - 0.005},${longitude + 0.005},${latitude + 0.005}`,
            imageDisplay: '400,400,96',
            returnGeometry: 'false',
            f: 'json',
          },
        )}`,
      ),
    ]);
    
    if (!epiResponse.ok) {
      const errorText = await epiResponse.text();
      throw new Error(`EPI Service Error: ${epiResponse.status} - ${errorText}`);
    }
    if (!protectionResponse.ok) {
      const errorText = await protectionResponse.text();
      throw new Error(`Protection Service Error: ${protectionResponse.status} - ${errorText}`);
    }
    if (!localProvisionsResponse.ok) {
      const errorText = await localProvisionsResponse.text();
      throw new Error(
        `Local Provisions Service Error: ${localProvisionsResponse.status} - ${errorText}`
      );
    }

    // Process responses in parallel
    const [epiData, protectionData, localProvisionsData] = await Promise.all([
      epiResponse.json(),
      protectionResponse.json(),
      localProvisionsResponse.json(),
    ]);

    // Process EPI results
    const processedResults =
      epiData.results?.map((result: ArcGISResult) => ({
        layer: result.layerName,
        attributes: result.attributes || {},
      })) || [];

    // Process Protection results
    const processedProtectionResults =
      protectionData.results?.map((result: ProtectionResult) => ({
        layer: result.layerName,
        attributes: result.attributes || {},
      })) || [];

    // Process Local Provisions results
    const processedLocalProvisionsResults =
      localProvisionsData.results?.map((result: ProtectionResult) => ({
        layer: result.layerName,
        attributes: result.attributes || {},
      })) || [];

    return NextResponse.json({
      address,
      coordinates: { longitude, latitude },
      planningLayers: {
        epiLayers: processedResults,
        protectionLayers: processedProtectionResults,
        localProvisionsLayers: processedLocalProvisionsResults,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch property information' }, { status: 500 });
  }
}
