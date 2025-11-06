import type { BinType, BinCalculation } from "../types/waste-calculator"

export const binTypes: Record<string, BinType> = {
  "240L": {
    capacity: 240,
    unitsPerBin: 2,
    weeklyCapacityPerHousehold: 120,
  },
  "660L": {
    capacity: 660,
    unitsPerBin: 6,
    weeklyCapacityPerHousehold: 110,
  },
  "1100L": {
    capacity: 1100,
    unitsPerBin: 9,
    weeklyCapacityPerHousehold: 122,
  },
  "1m3": {
    capacity: 1000,
    unitsPerBin: 8,
    weeklyCapacityPerHousehold: 125,
    isMetricCube: true,
  },
  "1.5m3": {
    capacity: 1500,
    unitsPerBin: 13,
    weeklyCapacityPerHousehold: 115,
    isMetricCube: true,
  },
  "3m3": {
    capacity: 3000,
    unitsPerBin: 25,
    weeklyCapacityPerHousehold: 120,
    isMetricCube: true,
  },
  "4.5m3": {
    capacity: 4500,
    unitsPerBin: 38,
    weeklyCapacityPerHousehold: 118,
    isMetricCube: true,
  },
}

export function calculateRequiredBins(totalUnits: number): BinCalculation[] {
  const calculations: BinCalculation[] = []

  // Calculate required bins for each bin type
  Object.entries(binTypes).forEach(([binTypeName, binType]) => {
    const numberOfBins = Math.ceil(totalUnits / binType.unitsPerBin)
    const unitsServed = numberOfBins * binType.unitsPerBin
    const totalCapacity = binType.capacity * numberOfBins

    calculations.push({
      binType: binTypeName,
      numberOfBins,
      totalCapacity,
      unitsServed,
    })
  })

  return calculations
}

export function formatCapacity(binType: string, capacity: number): string {
  if (binTypes[binType]?.isMetricCube) {
    return `${(capacity / 1000).toFixed(1)}m³`
  }
  return `${capacity}L`
}

