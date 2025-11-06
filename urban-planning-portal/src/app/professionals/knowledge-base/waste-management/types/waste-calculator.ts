export type BinType = {
    capacity: number
    unitsPerBin: number
    weeklyCapacityPerHousehold: number
    isMetricCube?: boolean
  }
  
  export type BinCalculation = {
    binType: string
    numberOfBins: number
    totalCapacity: number
    unitsServed: number
  }
  
  