export interface SiteDetails {
  // Site Characteristics
  lotType: string;
  siteArea: string;
  primaryStreetWidth: string;
  siteDepth: string;
  secondaryStreetWidth?: string;
  gradient: string;
  highestRL?: string;
  lowestRL?: string;
  fallAmount?: string;

  // Existing Development
  currentLandUse: string;
  existingDevelopmentDetails?: string;

  // Surrounding Development
  northDevelopment?: string;
  southDevelopment?: string;
  eastDevelopment?: string;
  westDevelopment?: string;

  // Site Constraints
  bushfireProne?: boolean;
  floodProne?: boolean;
  acidSulfateSoils?: boolean;
  biodiversity?: boolean;
  salinity?: boolean;
  landslip?: boolean;
  heritage?: string;
  otherConstraints?: string;
}
