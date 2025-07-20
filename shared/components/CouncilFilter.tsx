"use client"

import React, { useEffect, useState } from "react"
import { Input } from "@shared/components/ui/input"
import { Label } from "@shared/components/ui/label"
import { PropertyDataShape } from "./PropertyInfo"

interface CouncilFilterProps {
  propertyData?: PropertyDataShape | null
  showDCP?: boolean
  showCouncil?: boolean
}

// Define the mapping between LEP, DCP, and Council
interface PlanningMapping {
  lep: string
  dcp: string
  council: string
}

const PLANNING_MAPPINGS: PlanningMapping[] = [
  {
    lep: "Cumberland Local Environmental Plan 2021",
    dcp: "Cumberland Development Control Plan 2023",
    council: "Cumberland Council"
  },
  {
    lep: "Parramatta Local Environmental Plan 2011",
    dcp: "Parramatta Development Control Plan 2011",
    council: "City of Parramatta"
  },
  {
    lep: "Blacktown Local Environmental Plan 2015",
    dcp: "Blacktown Development Control Plan 2015",
    council: "Blacktown City Council"
  },
  {
    lep: "Liverpool Local Environmental Plan 2008",
    dcp: "Liverpool Development Control Plan 2008",
    council: "Liverpool City Council"
  },
  {
    lep: "Fairfield Local Environmental Plan 2013",
    dcp: "Fairfield Development Control Plan 2013",
    council: "Fairfield City Council"
  },
  {
    lep: "Campbelltown Local Environmental Plan 2015",
    dcp: "Campbelltown Development Control Plan 2015",
    council: "Campbelltown City Council"
  },
  {
    lep: "Penrith Local Environmental Plan 2010",
    dcp: "Penrith Development Control Plan 2014",
    council: "Penrith City Council"
  },
  {
    lep: "The Hills Local Environmental Plan 2019",
    dcp: "The Hills Development Control Plan 2012",
    council: "The Hills Shire Council"
  },
  {
    lep: "Canterbury-Bankstown Local Environmental Plan 2021",
    dcp: "Canterbury-Bankstown Development Control Plan 2021",
    council: "Canterbury-Bankstown Council"
  },
  {
    lep: "Sydney Local Environmental Plan 2012",
    dcp: "Sydney Development Control Plan 2012",
    council: "City of Sydney"
  }
]

export default function CouncilFilter({ propertyData, showDCP = true, showCouncil = true }: CouncilFilterProps) {
  const [dcpName, setDcpName] = useState<string>("")
  const [councilName, setCouncilName] = useState<string>("")

  // Extract LEP from property data and determine DCP and Council
  useEffect(() => {
    if (propertyData) {
      const lepLayer = propertyData.planningLayers.epiLayers.find(
        layer => layer.layer === "Local Environmental Plan"
      )
      const lepFromData = lepLayer?.attributes["EPI Name"]
      
      if (lepFromData) {
        const mapping = PLANNING_MAPPINGS.find(m => m.lep === lepFromData)
        if (mapping) {
          setDcpName(mapping.dcp)
          setCouncilName(mapping.council)
        } else {
          setDcpName("")
          setCouncilName("")
        }
      } else {
        setDcpName("")
        setCouncilName("")
      }
    }
  }, [propertyData])

  return (
    <div className="space-y-4">
      {/* DCP Display */}
      {showDCP && (
        <div className="space-y-2">
          <Label htmlFor="dcp">Development Control Plan (DCP)</Label>
          <Input 
            id="dcp" 
            value={dcpName} 
            disabled 
            className="bg-gray-50" 
            placeholder="DCP will be determined by LEP"
          />
        </div>
      )}

      {/* Council Display */}
      {showCouncil && (
        <div className="space-y-2">
          <Label htmlFor="council">Council</Label>
          <Input 
            id="council" 
            value={councilName} 
            disabled 
            className="bg-gray-50" 
            placeholder="Council will be determined by LEP"
          />
        </div>
      )}
    </div>
  )
}