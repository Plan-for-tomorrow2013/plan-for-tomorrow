// Type definitions
export interface WasteRate {
    name: string
    litersPerPerson: number
    color: string
  }
  
  export interface WasteGenerationRates {
    general: WasteRate
    recycling: WasteRate
    organic: WasteRate
    [key: string]: WasteRate
  }
  
  export interface OccupancyRates {
    studio: number
    twoBedroom: number
    threeBedroom: number
    house: number
  }
  
  export interface BinSizes {
    general: number[]
    recycling: number[]
    organic: number[]
    [key: string]: number[]
  }
  
  export interface SingleDwellingWasteResult {
    general: {
      volume: number
      unit: string
      binSize: number
      collections: number
    }
    recycling: {
      volume: number
      unit: string
      binSize: number
      collections: number
    }
    organic: {
      volume: number
      unit: string
      binSize: number
      collections: number
    }
    [key: string]: {
      volume: number
      unit: string
      binSize: number
      collections: number
    }
  }
  
  export interface ApartmentCounts {
    studio: number
    twoBedroom: number
    threeBedroom: number
  }
  
  export interface BinRequirement {
    bins: Record<number, number>
    totalCapacity: number
    totalBins: number
  }
  
  export interface MultiUnitWasteResult {
    totalOccupants: number
    weeklyVolumes: {
      general: number
      recycling: number
      organic: number
      [key: string]: number
    }
    binRequirements: {
      general: BinRequirement
      recycling: BinRequirement
      organic: BinRequirement
      [key: string]: BinRequirement
    }
  }
  
  export interface CommercialWasteRate {
    name: string
    category: "retail" | "food" | "other"
    general: number
    recycling: number
    organic: number
  }
  
  export interface CommercialWasteRates {
    [key: string]: CommercialWasteRate
  }
  
  export interface CommercialWasteResult {
    businessType: keyof CommercialWasteRates
    floorArea: number
    operatingDays: number
    dailyVolumes: {
      general: number
      recycling: number
      organic: number
      [key: string]: number
    }
    weeklyVolumes: {
      general: number
      recycling: number
      organic: number
      [key: string]: number
    }
    binRequirements: {
      general: BinRequirement
      recycling: BinRequirement
      organic: BinRequirement
      [key: string]: BinRequirement
    }
  }
  
  export interface CommercialCategoryItem {
    id: string
    name: string
    category: string
    general: number
    recycling: number
    organic: number
  }
  
  export interface CommercialCategories {
    retail: CommercialCategoryItem[]
    food: CommercialCategoryItem[]
    other: CommercialCategoryItem[]
    [key: string]: CommercialCategoryItem[]
  }
  
  // Waste generation rates per person per week
  export const wasteGenerationRates: WasteGenerationRates = {
    general: {
      name: "General Waste",
      litersPerPerson: 60, // Liters per person per week
      color: "red",
    },
    recycling: {
      name: "Recycling",
      litersPerPerson: 40, // Liters per person per week
      color: "yellow",
    },
    organic: {
      name: "Food Organics & Garden Organics (FOGO)",
      litersPerPerson: 30, // Liters per person per week
      color: "green",
    },
  }
  
  // Average occupancy rates for different dwelling types
  export const occupancyRates: OccupancyRates = {
    studio: 1.2, // Average occupants in a studio/1 bedroom
    twoBedroom: 2.3, // Average occupants in a 2 bedroom
    threeBedroom: 3.5, // Average occupants in a 3+ bedroom
    house: 2.8, // Average occupants in a house
  }
  
  // Standard bin sizes available
  export const binSizes: BinSizes = {
    general: [80, 120, 240, 660, 1100], // Liters
    recycling: [120, 240, 660, 1100], // Liters
    organic: [120, 240], // Liters
  }
  
  // Calculate waste generation for a single dwelling
  export function calculateSingleDwellingWaste(): SingleDwellingWasteResult {
    const occupants: number = occupancyRates.house
  
    return {
      general: {
        volume: Math.round(occupants * wasteGenerationRates.general.litersPerPerson),
        unit: "Litres",
        binSize: 120,
        collections: 1,
      },
      recycling: {
        volume: Math.round(occupants * wasteGenerationRates.recycling.litersPerPerson),
        unit: "Litres",
        binSize: 240,
        collections: 1,
      },
      organic: {
        volume: Math.round(occupants * wasteGenerationRates.organic.litersPerPerson),
        unit: "Litres",
        binSize: 240,
        collections: 1,
      },
    }
  }
  
  // Calculate total occupants based on apartment counts
  export function calculateTotalOccupants(apartmentCounts: ApartmentCounts): number {
    return (
      apartmentCounts.studio * occupancyRates.studio +
      apartmentCounts.twoBedroom * occupancyRates.twoBedroom +
      apartmentCounts.threeBedroom * occupancyRates.threeBedroom
    )
  }
  
  // Calculate waste generation for multi-unit dwellings
  export function calculateMultiUnitWaste(apartmentCounts: ApartmentCounts): MultiUnitWasteResult | null {
    const totalOccupants: number = calculateTotalOccupants(apartmentCounts)
    const totalUnits: number = apartmentCounts.studio + apartmentCounts.twoBedroom + apartmentCounts.threeBedroom
  
    if (totalUnits === 0) return null
  
    // Calculate total weekly waste volumes
    const weeklyVolumes = {
      general: Math.round(totalOccupants * wasteGenerationRates.general.litersPerPerson),
      recycling: Math.round(totalOccupants * wasteGenerationRates.recycling.litersPerPerson),
      organic: Math.round(totalOccupants * wasteGenerationRates.organic.litersPerPerson),
    }
  
    // Calculate required bins
    const binRequirements = {
      general: calculateBinRequirements(weeklyVolumes.general, binSizes.general),
      recycling: calculateBinRequirements(weeklyVolumes.recycling, binSizes.recycling),
      organic: calculateBinRequirements(weeklyVolumes.organic, binSizes.organic),
    }
  
    return {
      totalOccupants,
      weeklyVolumes,
      binRequirements,
    }
  }
  
  // Helper function to calculate the most efficient bin combination
  function calculateBinRequirements(weeklyVolume: number, availableBinSizes: number[]): BinRequirement {
    // Sort bin sizes from largest to smallest
    const sortedBinSizes: number[] = [...availableBinSizes].sort((a, b) => b - a)
  
    let remainingVolume: number = weeklyVolume
    const bins: Record<number, number> = {} // binSize -> count
  
    // First try to use larger bins as much as possible
    for (const binSize of sortedBinSizes) {
      const binCount: number = Math.floor(remainingVolume / binSize)
      if (binCount > 0) {
        bins[binSize] = binCount
        remainingVolume -= binCount * binSize
      }
    }
  
    // If there's still remaining volume, add one more of the smallest bin
    if (remainingVolume > 0 && sortedBinSizes.length > 0) {
      const smallestBin: number = sortedBinSizes[sortedBinSizes.length - 1]
      bins[smallestBin] = (bins[smallestBin] || 0) + 1
    }
  
    return {
      bins,
      totalCapacity: Object.entries(bins).reduce((total, [size, count]) => total + Number(size) * Number(count), 0),
      totalBins: Object.values(bins).reduce((total, count) => total + count, 0),
    }
  }
  
  // Commercial waste generation rates per business type
  export const commercialWasteRates: CommercialWasteRates = {
    // Retail Category
    retail_small: {
      name: "Retail Shop (Less Than 100m² Floor Area)",
      category: "retail",
      general: 40, // Liters per 100m² per day
      recycling: 20, // Liters per 100m² per day
      organic: 5, // Liters per 100m² per day
    },
    retail_large: {
      name: "Retail Shop (Greater Than 100m² Floor Area)",
      category: "retail",
      general: 60, // Liters per 100m² per day
      recycling: 30, // Liters per 100m² per day
      organic: 5, // Liters per 100m² per day
    },
    showrooms: {
      name: "Showrooms",
      category: "retail",
      general: 20, // Liters per 100m² per day
      recycling: 10, // Liters per 100m² per day
      organic: 0, // Liters per 100m² per day
    },
    hairdresser: {
      name: "Hairdresser / Salon",
      category: "retail",
      general: 60, // Liters per 100m² per day
      recycling: 15, // Liters per 100m² per day
      organic: 5, // Liters per 100m² per day
    },
  
    // Commercial Food & Beverage Category
    butcher_shop: {
      name: "Butcher / Seafood (Shop Front)",
      category: "food",
      general: 80, // Liters per 100m² per day
      recycling: 20, // Liters per 100m² per day
      organic: 80, // Liters per 100m² per day
    },
    butcher_wholesale: {
      name: "Butcher / Seafood (Wholesale / Processing)",
      category: "food",
      general: 100, // Liters per 100m² per day
      recycling: 30, // Liters per 100m² per day
      organic: 100, // Liters per 100m² per day
    },
    delicatessen: {
      name: "Delicatessen",
      category: "food",
      general: 80, // Liters per 100m² per day
      recycling: 30, // Liters per 100m² per day
      organic: 40, // Liters per 100m² per day
    },
    greengrocer: {
      name: "Greengrocer",
      category: "food",
      general: 60, // Liters per 100m² per day
      recycling: 30, // Liters per 100m² per day
      organic: 120, // Liters per 100m² per day
    },
    restaurant: {
      name: "Restaurant",
      category: "food",
      general: 100, // Liters per 100m² per day
      recycling: 50, // Liters per 100m² per day
      organic: 80, // Liters per 100m² per day
    },
    supermarket: {
      name: "Supermarket",
      category: "food",
      general: 120, // Liters per 100m² per day
      recycling: 120, // Liters per 100m² per day
      organic: 80, // Liters per 100m² per day
    },
    cafe: {
      name: "Café",
      category: "food",
      general: 120, // Liters per 100m² per day
      recycling: 60, // Liters per 100m² per day
      organic: 80, // Liters per 100m² per day
    },
    fast_food: {
      name: "Fast Food Outlet (Chain)",
      category: "food",
      general: 150, // Liters per 100m² per day
      recycling: 70, // Liters per 100m² per day
      organic: 90, // Liters per 100m² per day
    },
    takeaway: {
      name: "Takeaway Shop",
      category: "food",
      general: 120, // Liters per 100m² per day
      recycling: 60, // Liters per 100m² per day
      organic: 60, // Liters per 100m² per day
    },
    convenience: {
      name: "Convenience Store",
      category: "food",
      general: 80, // Liters per 100m² per day
      recycling: 40, // Liters per 100m² per day
      organic: 20, // Liters per 100m² per day
    },
    tavern: {
      name: "Tavern / Small Bar",
      category: "food",
      general: 80, // Liters per 100m² per day
      recycling: 120, // Liters per 100m² per day
      organic: 20, // Liters per 100m² per day
    },
    hotel_bar: {
      name: "Hotel / Motel (Bar)",
      category: "food",
      general: 80, // Liters per 100m² per day
      recycling: 120, // Liters per 100m² per day
      organic: 20, // Liters per 100m² per day
    },
    hotel_dining: {
      name: "Hotel / Motel (Bar & Dining)",
      category: "food",
      general: 100, // Liters per 100m² per day
      recycling: 120, // Liters per 100m² per day
      organic: 60, // Liters per 100m² per day
    },
    club_bar: {
      name: "Licensed Entertainment / Community Club (Bar)",
      category: "food",
      general: 80, // Liters per 100m² per day
      recycling: 120, // Liters per 100m² per day
      organic: 20, // Liters per 100m² per day
    },
    club_dining: {
      name: "Licensed Entertainment / Community Club (Bar & Dining)",
      category: "food",
      general: 100, // Liters per 100m² per day
      recycling: 120, // Liters per 100m² per day
      organic: 60, // Liters per 100m² per day
    },
  
    // Other Commercial Categories
    office: {
      name: "Offices / Medical / Consulting",
      category: "other",
      general: 10, // Liters per 100m² per day
      recycling: 10, // Liters per 100m² per day
      organic: 2, // Liters per 100m² per day
    },
    licensed_club: {
      name: "Licensed Club",
      category: "other",
      general: 50, // Liters per 100m² per day
      recycling: 60, // Liters per 100m² per day
      organic: 20, // Liters per 100m² per day
    },
    education: {
      name: "Education / Training",
      category: "other",
      general: 30, // Liters per 100m² per day
      recycling: 20, // Liters per 100m² per day
      organic: 10, // Liters per 100m² per day
    },
    childcare: {
      name: "Childcare",
      category: "other",
      general: 60, // Liters per 100m² per day
      recycling: 20, // Liters per 100m² per day
      organic: 30, // Liters per 100m² per day
    },
    function_room: {
      name: "Function Room",
      category: "other",
      general: 50, // Liters per 100m² per day
      recycling: 40, // Liters per 100m² per day
      organic: 20, // Liters per 100m² per day
    },
    gym: {
      name: "Gym",
      category: "other",
      general: 40, // Liters per 100m² per day
      recycling: 20, // Liters per 100m² per day
      organic: 10, // Liters per 100m² per day
    },
    community_centre: {
      name: "Community Centre / Sports Centre / Place of Worship / Recreation",
      category: "other",
      general: 30, // Liters per 100m² per day
      recycling: 20, // Liters per 100m² per day
      organic: 10, // Liters per 100m² per day
    },
  }
  
  // Calculate waste generation for commercial properties
  export function calculateCommercialWaste(
    businessType: keyof typeof commercialWasteRates,
    floorArea: number,
    operatingDays: number,
  ): CommercialWasteResult | null {
    if (floorArea <= 0 || operatingDays <= 0) return null
  
    const rates = commercialWasteRates[businessType]
  
    // Calculate daily waste volumes per 100m²
    const dailyVolumes = {
      general: (rates.general * floorArea) / 100,
      recycling: (rates.recycling * floorArea) / 100,
      organic: (rates.organic * floorArea) / 100,
    }
  
    // Calculate weekly waste volumes
    const weeklyVolumes = {
      general: Math.round(dailyVolumes.general * operatingDays),
      recycling: Math.round(dailyVolumes.recycling * operatingDays),
      organic: Math.round(dailyVolumes.organic * operatingDays),
    }
  
    // Calculate required bins
    const binRequirements = {
      general: calculateBinRequirements(weeklyVolumes.general, binSizes.general),
      recycling: calculateBinRequirements(weeklyVolumes.recycling, binSizes.recycling),
      organic: calculateBinRequirements(weeklyVolumes.organic, binSizes.organic),
    }
  
    return {
      businessType,
      floorArea,
      operatingDays,
      dailyVolumes,
      weeklyVolumes,
      binRequirements,
    }
  }
  
  // Group commercial waste rates by category
  export function getCommercialWasteRatesByCategory(): CommercialCategories {
    const categories: CommercialCategories = {
      retail: [],
      food: [],
      other: [],
    }
  
    Object.entries(commercialWasteRates).forEach(([key, value]) => {
      categories[value.category].push({
        id: key,
        ...value,
      })
    })
  
    return categories
  }
  
  