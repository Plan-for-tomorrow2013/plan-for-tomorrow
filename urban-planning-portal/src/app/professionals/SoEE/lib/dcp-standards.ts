export interface DCPStandards {
  frontSetbackControl: string
  secondaryFrontSetbackControl: string
  rearSetbackGroundControl: string
  rearSetbackUpperControl: string
  sideSetbackNorthGroundControl: string
  sideSetbackNorthUpperControl: string
  sideSetbackSouthGroundControl: string
  sideSetbackSouthUpperControl: string
  siteCoverageControl: string
  landscapedAreaControl: string
  parkingControl: string
}

export interface DCPStandardsLookup {
  [councilName: string]: DCPStandards
}

// DCP Standards lookup table by council
const dcpStandardsLookup: DCPStandardsLookup = {
  "Cumberland Council": {
    frontSetbackControl: "Average of adjoining dwellings or 6m minimum",
    secondaryFrontSetbackControl: "3m minimum (if corner lot)",
    rearSetbackGroundControl: "6m minimum",
    rearSetbackUpperControl: "8m minimum",
    sideSetbackNorthGroundControl: "0.9m minimum",
    sideSetbackNorthUpperControl: "1.2m minimum",
    sideSetbackSouthGroundControl: "0.9m minimum",
    sideSetbackSouthUpperControl: "1.2m minimum",
    siteCoverageControl: "50% maximum",
    landscapedAreaControl: "35% minimum",
    parkingControl: "2 spaces minimum",
  },
  "City of Parramatta": {
    frontSetbackControl: "6m minimum or average of adjoining buildings",
    secondaryFrontSetbackControl: "3m minimum (if corner lot)",
    rearSetbackGroundControl: "6m minimum",
    rearSetbackUpperControl: "8m minimum",
    sideSetbackNorthGroundControl: "0.9m minimum",
    sideSetbackNorthUpperControl: "1.2m minimum",
    sideSetbackSouthGroundControl: "0.9m minimum",
    sideSetbackSouthUpperControl: "1.2m minimum",
    siteCoverageControl: "50% maximum",
    landscapedAreaControl: "40% minimum",
    parkingControl: "2 spaces minimum",
  },
  "Blacktown City Council": {
    frontSetbackControl: "6m minimum",
    secondaryFrontSetbackControl: "3m minimum (if corner lot)",
    rearSetbackGroundControl: "6m minimum",
    rearSetbackUpperControl: "8m minimum",
    sideSetbackNorthGroundControl: "0.9m minimum",
    sideSetbackNorthUpperControl: "1.2m minimum",
    sideSetbackSouthGroundControl: "0.9m minimum",
    sideSetbackSouthUpperControl: "1.2m minimum",
    siteCoverageControl: "50% maximum",
    landscapedAreaControl: "35% minimum",
    parkingControl: "2 spaces minimum",
  },
  "Liverpool City Council": {
    frontSetbackControl: "6m minimum",
    secondaryFrontSetbackControl: "3m minimum (if corner lot)",
    rearSetbackGroundControl: "6m minimum",
    rearSetbackUpperControl: "8m minimum",
    sideSetbackNorthGroundControl: "0.9m minimum",
    sideSetbackNorthUpperControl: "1.2m minimum",
    sideSetbackSouthGroundControl: "0.9m minimum",
    sideSetbackSouthUpperControl: "1.2m minimum",
    siteCoverageControl: "50% maximum",
    landscapedAreaControl: "35% minimum",
    parkingControl: "2 spaces minimum",
  },
  "Fairfield City Council": {
    frontSetbackControl: "6m minimum",
    secondaryFrontSetbackControl: "3m minimum (if corner lot)",
    rearSetbackGroundControl: "6m minimum",
    rearSetbackUpperControl: "8m minimum",
    sideSetbackNorthGroundControl: "0.9m minimum",
    sideSetbackNorthUpperControl: "1.2m minimum",
    sideSetbackSouthGroundControl: "0.9m minimum",
    sideSetbackSouthUpperControl: "1.2m minimum",
    siteCoverageControl: "50% maximum",
    landscapedAreaControl: "35% minimum",
    parkingControl: "2 spaces minimum",
  },
  "Campbelltown City Council": {
    frontSetbackControl: "6m minimum",
    secondaryFrontSetbackControl: "3m minimum (if corner lot)",
    rearSetbackGroundControl: "6m minimum",
    rearSetbackUpperControl: "8m minimum",
    sideSetbackNorthGroundControl: "0.9m minimum",
    sideSetbackNorthUpperControl: "1.2m minimum",
    sideSetbackSouthGroundControl: "0.9m minimum",
    sideSetbackSouthUpperControl: "1.2m minimum",
    siteCoverageControl: "50% maximum",
    landscapedAreaControl: "35% minimum",
    parkingControl: "2 spaces minimum",
  },
  "Penrith City Council": {
    frontSetbackControl: "6m minimum",
    secondaryFrontSetbackControl: "3m minimum (if corner lot)",
    rearSetbackGroundControl: "6m minimum",
    rearSetbackUpperControl: "8m minimum",
    sideSetbackNorthGroundControl: "0.9m minimum",
    sideSetbackNorthUpperControl: "1.2m minimum",
    sideSetbackSouthGroundControl: "0.9m minimum",
    sideSetbackSouthUpperControl: "1.2m minimum",
    siteCoverageControl: "50% maximum",
    landscapedAreaControl: "35% minimum",
    parkingControl: "2 spaces minimum",
  },
  "The Hills Shire Council": {
    frontSetbackControl: "6m minimum",
    secondaryFrontSetbackControl: "3m minimum (if corner lot)",
    rearSetbackGroundControl: "6m minimum",
    rearSetbackUpperControl: "8m minimum",
    sideSetbackNorthGroundControl: "0.9m minimum",
    sideSetbackNorthUpperControl: "1.2m minimum",
    sideSetbackSouthGroundControl: "0.9m minimum",
    sideSetbackSouthUpperControl: "1.2m minimum",
    siteCoverageControl: "50% maximum",
    landscapedAreaControl: "35% minimum",
    parkingControl: "2 spaces minimum",
  },
  "Canterbury-Bankstown Council": {
    frontSetbackControl: "6m minimum",
    secondaryFrontSetbackControl: "3m minimum (if corner lot)",
    rearSetbackGroundControl: "6m minimum",
    rearSetbackUpperControl: "8m minimum",
    sideSetbackNorthGroundControl: "0.9m minimum",
    sideSetbackNorthUpperControl: "1.2m minimum",
    sideSetbackSouthGroundControl: "0.9m minimum",
    sideSetbackSouthUpperControl: "1.2m minimum",
    siteCoverageControl: "50% maximum",
    landscapedAreaControl: "35% minimum",
    parkingControl: "2 spaces minimum",
  },
  "City of Sydney": {
    frontSetbackControl: "3m minimum",
    secondaryFrontSetbackControl: "3m minimum (if corner lot)",
    rearSetbackGroundControl: "6m minimum",
    rearSetbackUpperControl: "8m minimum",
    sideSetbackNorthGroundControl: "0.9m minimum",
    sideSetbackNorthUpperControl: "1.2m minimum",
    sideSetbackSouthGroundControl: "0.9m minimum",
    sideSetbackSouthUpperControl: "1.2m minimum",
    siteCoverageControl: "60% maximum",
    landscapedAreaControl: "25% minimum",
    parkingControl: "1 space minimum",
  },
}

// Default standards for councils not in the lookup
const defaultStandards: DCPStandards = {
  frontSetbackControl: "6m minimum",
  secondaryFrontSetbackControl: "3m minimum (if corner lot)",
  rearSetbackGroundControl: "6m minimum",
  rearSetbackUpperControl: "8m minimum",
  sideSetbackNorthGroundControl: "0.9m minimum",
  sideSetbackNorthUpperControl: "1.2m minimum",
  sideSetbackSouthGroundControl: "0.9m minimum",
  sideSetbackSouthUpperControl: "1.2m minimum",
  siteCoverageControl: "50% maximum",
  landscapedAreaControl: "35% minimum",
  parkingControl: "2 spaces minimum",
}

export function getDcpStandards(councilName: string): DCPStandards {
  return dcpStandardsLookup[councilName] || defaultStandards
}
