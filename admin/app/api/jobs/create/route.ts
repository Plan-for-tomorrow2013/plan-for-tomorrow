import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { saveJob } from '../../../../lib/jobStorage'

export async function POST(request: Request) {
  try {
    const data = await request.json()
    console.log('Creating job with data:', data)
    
    // Generate a unique ID for the job
    const jobId = uuidv4()
    console.log('Generated job ID:', jobId)
    
    // Extract council from the first EPI layer if available
    const localEnvPlan = data.planningLayers.epiLayers.find(
      (layer: any) => layer.layer === "Local Environmental Plan"
    )
    const council = localEnvPlan?.attributes?.["EPI Name"]?.split(" Local Environmental Plan")?.[0] || "Unknown Council"
    
    // Filter the planning layers data
    const filteredPlanningLayers = {
      ...data.planningLayers,
      epiLayers: data.planningLayers.epiLayers.map((layer: any) => {
        // Special handling for Floor Space Ratio (n:1)
        if (layer.layer === "Floor Space Ratio (n:1)") {
          return {
            layer: layer.layer,
            attributes: {
              "Floor Space Ratio": layer.attributes["Floor Space Ratio"]
            }
          }
        }
        // Special handling for Floor Space Ratio Additional Controls
        if (layer.layer === "Floor Space Ratio Additional Controls") {
          // Filter out the Floor Space Ratio field, only keep Legislative info
          const { "Floor Space Ratio": _, ...otherAttributes } = layer.attributes
          return {
            layer: layer.layer,
            attributes: {
              "Legislative Area": otherAttributes["Legislative Area"],
              "Legislative Clause": otherAttributes["Legislative Clause"]
            }
          }
        }
        // Special handling for Height of Building
        if (layer.layer === "Height of Building") {
          return {
            layer: layer.layer,
            attributes: {
              "Maximum Building Height": layer.attributes["Maximum Building Height"],
              "Units": layer.attributes["Units"]
            }
          }
        }
        // Special handling for Building Height Additional Controls
        if (layer.layer === "Building Height Additional Controls") {
          // Filter out any height-related fields, only keep Legislative info
          const { "Maximum Building Height": _, "Units": __, ...otherAttributes } = layer.attributes
          return {
            layer: layer.layer,
            attributes: {
              "Legislative Area": otherAttributes["Legislative Area"],
              "Legislative Clause": otherAttributes["Legislative Clause"]
            }
          }
        }
        return layer
      })
    }

    // Create a new job with the property search data
    const job = {
      id: jobId,
      address: data.address,
      council: council,
      currentStage: 'initial-assessment',
      createdAt: new Date().toISOString(),
      propertyData: {
        coordinates: data.coordinates,
        planningLayers: filteredPlanningLayers
      }
    }

    // Store the job
    console.log('Attempting to save job:', job)
    saveJob(jobId, job)
    console.log('Job saved successfully')

    // Return the created job
    return NextResponse.json(job)
  } catch (error) {
    console.error('Detailed error creating job:', error)
    return NextResponse.json(
      { error: 'Failed to create job', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 