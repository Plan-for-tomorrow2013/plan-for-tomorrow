export interface DevelopmentDetails {
  // Development Description
  developmentDescription: string;
  
  // Demolition
  demolitionRequired: boolean;
  demolitionDetails?: string;
  
  // Construction
  storeys: string;
  buildingHeight: string;
  wallHeight: string;
  
  // Setbacks
  frontSetback: string;
  secondaryFrontSetback?: string;
  rearSetbackGround: string;
  rearSetbackUpper?: string;
  sideSetbackGroundOne: string;
  sideSetbackGroundTwo: string;
  sideSetbackUpperOne: string;
  sideSetbackUpperTwo: string;
  garageSetback: string;
  
  // Floor Area
  existingGFA?: string;
  proposedGFA: string;
  totalGFA: string;
  floorSpaceRatio: string;
  
  // Site Coverage
  existingSiteCoverage?: string;
  proposedSiteCoverage: string;
  
  // Landscaping
  existingLandscapedArea?: string;
  proposedLandscapedArea: string;
  landscapedAreaPercentage: string;
  
  // Deep soil
  existingDeepSoilArea?: string;
  proposedDeepSoilArea: string;
  deepSoilAreaPercentage: string;
  
  // Private open space
  existingPrivateOpenSpaceArea?: string;
  proposedPrivateOpenSpaceArea: string;
  
  // Excavation and Fill
  maxCut: string;
  maxFill: string;
  
  // Materials and Finishes
  externalWalls: string;
  roof: string;
  windows: string;
  otherMaterials?: string;
  
  // Access and Parking
  vehicleAccess: string;
  carParkingSpaces: string;
  pedestrianAccess: string;
  
  // Stormwater
  stormwaterDisposal: string;
  
  // Waste Management
  wasteManagement: string;
} 