import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { Job } from '@shared/types/jobs';
import { SiteDetails } from '@shared/types/site-details';
import { getJobPath, getJobsPath, getDocumentsPath } from '@shared/utils/paths'; // Import path utilities

// Ensure directories exist using path utilities
async function ensureDirectoriesExist() {
  const jobsDir = getJobsPath();
  const documentsDir = getDocumentsPath();
  if (!existsSync(jobsDir)) {
    await mkdir(jobsDir, { recursive: true });
  }
  if (!existsSync(documentsDir)) {
    await mkdir(documentsDir, { recursive: true });
  }
}

// Default site details structure
const defaultSiteDetails: SiteDetails = {
  // Site Characteristics
  lotType: '',
  siteArea: '',
  frontage: '',
  depth: '',
  slope: '',
  orientation: '',
  soilType: '',
  vegetation: '',
  primaryStreetWidth: '',
  siteDepth: '',
  secondaryStreetWidth: '',
  gradient: '',
  highestRL: '',
  lowestRL: '',
  fallAmount: '',

  // Existing Development
  currentLandUse: '',
  existingDevelopmentDetails: '',

  // Surrounding Development
  northDevelopment: '',
  southDevelopment: '',
  eastDevelopment: '',
  westDevelopment: '',

  // Site Constraints
  bushfireProne: false,
  floodProne: false,
  acidSulfateSoils: false,
  biodiversity: false,
  salinity: false,
  landslip: false,
  heritage: '',
  contamination: '',
  otherConstraints: '',
};

export async function POST(request: Request) {
  try {
    await ensureDirectoriesExist();
    const data = await request.json();
    const jobId = uuidv4();

    // Create a new job with the property search data and proper document structure
    const job: Job = {
      id: jobId,
      address: data.address,
      council: data.council,
      currentStage: 'design-check',
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      propertyData: {
        coordinates: data.coordinates,
        planningLayers: {
          epiLayers: data.planningLayers?.epiLayers || [],
          protectionLayers: data.planningLayers?.protectionLayers || [],
          localProvisionsLayers: data.planningLayers?.localProvisionsLayers || [],
        },
      },
      // Initialize site details with default values
      siteDetails: defaultSiteDetails,
      // Initialize form data with default values
      formData: {
        lotIdentifications: [],
        addressDetails: {
          streetNumber: '',
          streetName: '',
          secondaryStreetName: '',
          suburb: '',
          postcode: '',
        },
      },
      // Initialize empty documents object - documents will be added when uploaded
      documents: {},
      // Initialize empty assessment objects
      customAssessment: {
        uploadedDocuments: {},
      },
      statementOfEnvironmentalEffects: {
        uploadedDocuments: {},
      },
      complyingDevelopmentCertificate: {
        uploadedDocuments: {},
      },
      wasteManagementAssessment: {
        uploadedDocuments: {},
      },
      nathersAssessment: {
        uploadedDocuments: {},
      },
    };

    // Store the job using the correct path utility
    const jobPath = getJobPath(jobId); // Use the utility function
    await writeFile(jobPath, JSON.stringify(job, null, 2));

    // Construct the redirect URL
    const redirectUrl = `/professionals/jobs/${jobId}`;

    // Return the redirect URL instead of the full job object
    return NextResponse.json({ redirectUrl });
  } catch (error) {
    console.error('Error creating job:', error);
    return NextResponse.json({ error: 'Failed to create job' }, { status: 500 });
  }
}
