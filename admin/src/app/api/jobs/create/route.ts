import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { Job } from '@shared/types/jobs';
import { saveJob } from '@shared/lib/jobStorage';

interface EpiLayer {
  layer: string;
  attributes: { [key: string]: string | number };
}

interface CreateJobData {
  address: string;
  coordinates: {
    longitude: number;
    latitude: number;
  };
  planningLayers: {
    epiLayers: EpiLayer[];
    protectionLayers?: any[];
    localProvisionsLayers?: any[];
  };
}

export async function POST(request: NextRequest) {
  try {
    const data: CreateJobData = await request.json();

    // Generate a unique ID for the job
    const jobId = uuidv4();

    // Extract council from the first EPI layer if available
    const localEnvPlan = data.planningLayers.epiLayers.find(
      layer => layer.layer === 'Local Environmental Plan'
    );
    const council =
      localEnvPlan?.attributes?.['EPI Name']?.toString().split(' Local Environmental Plan')?.[0] ||
      'Unknown Council';

    // Filter the planning layers data
    const filteredPlanningLayers = {
      ...data.planningLayers,
      epiLayers: data.planningLayers.epiLayers.map(layer => {
        // Special handling for Floor Space Ratio
        if (layer.layer === 'Floor Space Ratio') {
          return {
            layer: layer.layer,
            attributes: {
              'Floor Space Ratio': layer.attributes['Floor Space Ratio'],
              Units: layer.attributes['Units'],
            },
          };
        }
        // Special handling for Floor Space Ratio (n:1)
        if (layer.layer === 'Floor Space Ratio (n:1)') {
          return {
            layer: layer.layer,
            attributes: {
              'Floor Space Ratio': layer.attributes['Floor Space Ratio'],
              Units: layer.attributes['Units'],
            },
          };
        }
        // Special handling for Floor Space Ratio Additional Controls
        if (layer.layer === 'Floor Space Ratio Additional Controls') {
          // Filter out the Floor Space Ratio field, only keep Legislative info
          const { 'Floor Space Ratio': _, ...otherAttributes } = layer.attributes;
          return {
            layer: layer.layer,
            attributes: {
              'Legislative Area': otherAttributes['Legislative Area'],
              'Legislative Clause': otherAttributes['Legislative Clause'],
            },
          };
        }
        // Special handling for Height of Building
        if (layer.layer === 'Height of Building') {
          return {
            layer: layer.layer,
            attributes: {
              'Maximum Building Height': layer.attributes['Maximum Building Height'],
              Units: layer.attributes['Units'],
            },
          };
        }
        // Special handling for Building Height Additional Controls
        if (layer.layer === 'Height of Building Additional Controls') {
          // Filter out any height-related fields, only keep Legislative info
          const { 'Maximum Building Height': _, Units: __, ...otherAttributes } = layer.attributes;
          return {
            layer: layer.layer,
            attributes: {
              'Legislative Area': otherAttributes['Legislative Area'],
              'Legislative Clause': otherAttributes['Legislative Clause'],
            },
          };
        }
        return layer;
      }),
      protectionLayers: data.planningLayers.protectionLayers || [],
      localProvisionsLayers: data.planningLayers.localProvisionsLayers || [],
    };

    // Create a new job with the property search data
    const job: Job = {
      id: jobId,
      address: data.address,
      council: council,
      currentStage: 'pre-prepared-assessments',
      status: 'pending',
      createdAt: new Date().toISOString(),
      documents: {},
      purchasedPrePreparedAssessments: {},
      propertyData: {
        coordinates: data.coordinates,
        planningLayers: filteredPlanningLayers,
      },
      siteDetails: {
        siteAddressDetails: '',
        siteArea: '',
        currentLandUse: '',
        zoningInfo: '',
        siteConstraints: '',
      },
    };

    // Store the job
    saveJob(jobId, job);

    // Return the created job
    return NextResponse.json(job);
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to create job',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
