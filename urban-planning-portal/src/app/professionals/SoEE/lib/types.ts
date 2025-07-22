// Form data types
export interface ProjectData {
    projectName: string
    address: string
    developmentType: string
    customDevelopmentType?: string
    councilArea: string
  }
  
  export interface PropertyData {
    lotNumber: string
    sectionNumber?: string
    dpNumber: string
    streetNumber: string
    streetName: string
    secondaryStreetName?: string
    suburb: string
    postcode: string
    lotType: string
    siteArea: string
    primaryStreetWidth: string
    siteDepth: string
    secondaryStreetWidth?: string
    gradient: string
    highestRL?: string
    lowestRL?: string
    fallAmount?: string
    currentLandUse: string
    existingDevelopmentDetails?: string
    northDevelopment?: string
    southDevelopment?: string
    eastDevelopment?: string
    westDevelopment?: string
    constraints: {
      bushfireProne?: boolean
      floodProne?: boolean
      acidSulfateSoils?: boolean
      biodiversity?: boolean
      heritageItem?: boolean
      heritageConservationArea?: boolean
      contaminatedLand?: boolean
    }
    otherConstraints?: string
  }
  
  export interface DevelopmentData {
    developmentDescription: string
    demolitionRequired: boolean
    demolitionDetails?: string
    storeys: string
    buildingHeight: string
    wallHeight: string
    frontSetback: string
    secondaryFrontSetback?: string
    rearSetbackGround: string
    rearSetbackUpper?: string
    sideSetbackGroundOne: string
    sideSetbackGroundTwo: string
    sideSetbackUpperOne: string
    sideSetbackUpperTwo: string
    garageSetback: string
    existingGFA?: string
    proposedGFA: string
    totalGFA: string
    floorSpaceRatio: string
    existingSiteCoverage?: string
    proposedSiteCoverage: string
    existingLandscapedArea?: string
    proposedLandscapedArea: string
    landscapedAreaPercentage: string
    existingDeepSoilArea?: string
    proposedDeepSoilArea: string
    deepSoilAreaPercentage: string
    existingPrivateOpenSpaceArea?: string
    proposedPrivateOpenSpaceArea: string
    maxCut: string
    maxFill: string
    externalWalls: string
    roof: string
    windows: string
    otherMaterials?: string
    vehicleAccess: string
    carParkingSpaces: string
    pedestrianAccess: string
    stormwaterDisposal: string
    wasteManagement: string
  }
  
  export interface PlanningData {
    zoning: string
    landUsePermissibility: string
    lepName: string
    lepCompliance: string
    heightControl: string
    heightProposed: string
    heightCompliance: boolean
    fsrControl: string
    fsrProposed: string
    fsrCompliance: boolean
    dcpName: string
    dcpCompliance: string
    frontSetbackControl: string
    frontSetbackProposed: string
    frontSetbackCompliance: boolean
    secondaryFrontSetbackControl?: string
    secondaryFrontSetbackProposed?: string
    secondaryFrontSetbackCompliance: boolean
    rearSetbackGroundControl: string
    rearSetbackGroundProposed: string
    rearSetbackGroundCompliance: boolean
    rearSetbackUpperControl?: string
    rearSetbackUpperProposed?: string
    rearSetbackUpperCompliance: boolean
    sideSetbackNorthGroundControl: string
    sideSetbackNorthGroundProposed: string
    sideSetbackNorthGroundCompliance: boolean
    sideSetbackNorthUpperControl?: string
    sideSetbackNorthUpperProposed: string
    sideSetbackNorthUpperCompliance: boolean
    sideSetbackSouthGroundControl: string
    sideSetbackSouthGroundProposed: string
    sideSetbackSouthGroundCompliance: boolean
    sideSetbackSouthUpperControl?: string
    sideSetbackSouthUpperProposed?: string
    sideSetbackSouthUpperCompliance: boolean
    siteCoverageControl: string
    siteCoverageProposed: string
    siteCoverageCompliance: boolean
    landscapedAreaControl: string
    landscapedAreaProposed: string
    landscapedAreaCompliance: boolean
    parkingControl: string
    parkingProposed: string
    parkingCompliance: boolean
    seppBiodiversity: boolean
    seppBiodiversityTreeRemoval: boolean
    seppResilience: boolean
    seppBasix: boolean
    seppTransport: boolean
    seppTransportClassifiedRoad: boolean
    seppHousing: boolean
    seppHousingSecondaryDwelling: boolean
    secondaryDwellingFloorArea?: string
    maxFloorAreaByLEP?: string
    additionalPlanning?: string
    variationsRequired?: boolean
    variationDetails?: string
    variationJustification?: string
  }
  
  export interface EnvironmentalData {
    contextAndSetting: {
      noise: string
      overlooking: string
      overshadowing: string
      buildingHeight: string
      setbacksAndLandscaping: string
      architecturalStyle: string
    }
    accessTransportTraffic: string
    publicDomain: string
    utilities: string
    heritage: string
    otherLandResources: string
    water: string
    soils: string
    airAndMicroclimate: string
    floraAndFauna: string
    treeRemoval: boolean
    treeRemovalCount?: string
    waste: string
    energy: string
    noiseAndVibration: string
    naturalHazards: string
    bushfireProne: boolean
    floodProne: boolean
    technologicalHazards: string
    safetySecurity: string
    socialEconomicImpact: string
    siteDesign: string
    construction: string
    constructionHours: string
    erosionControl: string
    dustControl: string
    cumulativeImpacts: string
    additionalInformation?: string
  }
  
  export interface FormData {
    project: ProjectData
    property: PropertyData
    development: DevelopmentData
    planning: PlanningData
    environmental: EnvironmentalData
  }
  