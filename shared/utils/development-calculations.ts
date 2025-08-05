import { DevelopmentDetails } from '../types/development-details';

export interface DevelopmentCalculationInputs {
  existingGFA: string;
  proposedGFA: string;
  proposedLandscapedArea: string;
  proposedDeepSoilArea: string;
  siteArea: string;
}

export interface DevelopmentCalculations {
  totalGFA: string;
  floorSpaceRatio: string;
  landscapedAreaPercentage: string;
  deepSoilAreaPercentage: string;
}

/**
 * Calculate development metrics based on input values
 */
export function calculateDevelopmentMetrics(inputs: DevelopmentCalculationInputs): DevelopmentCalculations {
  const existingGFA = parseFloat(inputs.existingGFA || '0');
  const proposedGFA = parseFloat(inputs.proposedGFA || '0');
  const siteArea = parseFloat(inputs.siteArea || '0');
  const proposedLandscapedArea = parseFloat(inputs.proposedLandscapedArea || '0');
  const proposedDeepSoilArea = parseFloat(inputs.proposedDeepSoilArea || '0');
  
  // Calculate total GFA (existing + proposed)
  const totalGFA = existingGFA + proposedGFA;
  
  // Calculate floor space ratio (total GFA / site area)
  const floorSpaceRatio = siteArea > 0 ? (totalGFA / siteArea).toFixed(2) : '0.00';
  
  // Calculate landscaped area percentage (proposed landscaped area / site area * 100)
  const landscapedAreaPercentage = siteArea > 0 ? ((proposedLandscapedArea / siteArea) * 100).toFixed(1) : '0.0';
  
  // Calculate deep soil area percentage (proposed deep soil area / site area * 100)
  const deepSoilAreaPercentage = siteArea > 0 ? ((proposedDeepSoilArea / siteArea) * 100).toFixed(1) : '0.0';
  
  return {
    totalGFA: totalGFA.toFixed(2),
    floorSpaceRatio,
    landscapedAreaPercentage,
    deepSoilAreaPercentage
  };
}

/**
 * Check if development calculations need to be updated
 */
export function shouldUpdateCalculations(
  current: DevelopmentDetails,
  inputs: DevelopmentCalculationInputs
): boolean {
  const calculations = calculateDevelopmentMetrics(inputs);
  
  const currentTotalGFA = parseFloat(current.totalGFA || '0');
  const currentFloorSpaceRatio = parseFloat(current.floorSpaceRatio || '0');
  const currentLandscapedAreaPercentage = parseFloat(current.landscapedAreaPercentage || '0');
  const currentDeepSoilAreaPercentage = parseFloat(current.deepSoilAreaPercentage || '0');
  
  return (
    Math.abs(parseFloat(calculations.totalGFA) - currentTotalGFA) > 0.01 ||
    Math.abs(parseFloat(calculations.floorSpaceRatio) - currentFloorSpaceRatio) > 0.01 ||
    Math.abs(parseFloat(calculations.landscapedAreaPercentage) - currentLandscapedAreaPercentage) > 0.01 ||
    Math.abs(parseFloat(calculations.deepSoilAreaPercentage) - currentDeepSoilAreaPercentage) > 0.01
  );
}

/**
 * Update development details with calculated values
 */
export function updateDevelopmentDetailsWithCalculations(
  current: DevelopmentDetails,
  inputs: DevelopmentCalculationInputs
): DevelopmentDetails {
  const calculations = calculateDevelopmentMetrics(inputs);
  
  return {
    ...current,
    totalGFA: calculations.totalGFA,
    floorSpaceRatio: calculations.floorSpaceRatio,
    landscapedAreaPercentage: calculations.landscapedAreaPercentage,
    deepSoilAreaPercentage: calculations.deepSoilAreaPercentage
  };
}
