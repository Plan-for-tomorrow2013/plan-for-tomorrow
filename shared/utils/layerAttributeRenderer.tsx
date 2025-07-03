import React from 'react';

export interface LayerAttributeRendererProps {
  attributes: Record<string, any>;
  layerName: string;
  renderRow: (label: string, value: any) => React.ReactNode;
  className?: string;
}

export function renderLayerAttributes({
  attributes,
  layerName,
  renderRow,
  className = "space-y-2"
}: LayerAttributeRendererProps): React.ReactNode {
  if (!attributes) return null;

  // Helper function to get attribute value with fallback
  const getAttribute = (key: string, fallbackKey?: string) => {
    return attributes[key] || (fallbackKey ? attributes[fallbackKey] : undefined) || 'N/A';
  };

  // Principal Planning Layers (EPI Layers)
  switch (layerName) {
    case 'Local Environmental Plan':
      return (
        <div className={className}>
          {renderRow('EPI Name', getAttribute('EPI_NAME', 'EPI Name'))}
          {renderRow('LGA Name', getAttribute('LGA_NAME', 'LGA Name'))}
        </div>
      );

    case 'Floor Space Ratio (n:1)':
    case 'Floor Space Ratio':
      return (
        <div className={className}>
          {renderRow('Floor Space Ratio', getAttribute('FSR', 'Floor Space Ratio'))}
          {renderRow('Units', getAttribute('UNITS', 'Units'))}
        </div>
      );

    case 'Floor Space Ratio Additional Controls':
      return (
        <div className={className}>
          {renderRow('Legislative Area', getAttribute('LEGISLATIVE_AREA', 'Legislative Area'))}
          {renderRow('Legislative Clause', getAttribute('LEGISLATIVE_CLAUSE', 'Legislative Clause'))}
        </div>
      );

    case 'Height of Building':
    case 'Height of Building Additional Controls':
      return (
        <div className={className}>
          {renderRow('Maximum Building Height', getAttribute('MAX_B_H_M', 'Maximum Building Height'))}
          {renderRow('Units', getAttribute('UNITS', 'Units'))}
        </div>
      );

    case 'Land Zoning':
      return (
        <div className={className}>
          {renderRow('Land Use', getAttribute('LAND_USE', 'Land Use'))}
          {renderRow('Zone', getAttribute('ZONE', 'Zone'))}
        </div>
      );

    case 'Minimum Lot Size':
    case 'Lot Size':
      return (
        <div className={className}>
          {renderRow('Lot Size', getAttribute('LOT_SIZE', 'Lot Size'))}
          {renderRow('Units', getAttribute('UNITS', 'Units'))}
        </div>
      );

    case 'Heritage':
      return (
        <div className={className}>
          {renderRow('Heritage Type', getAttribute('HERITAGE_TYPE', 'Heritage Type'))}
          {renderRow('Item Number', getAttribute('ITEM_NUMBER', 'Item Number'))}
          {renderRow('Item Name', getAttribute('ITEM_NAME', 'Item Name'))}
          {renderRow('Significance', getAttribute('SIGNIFICANCE', 'Significance'))}
        </div>
      );

    case 'Minimum Dwelling Density Area':
      return renderRow('Type', getAttribute('TYPE', 'Type'));

    case 'Additional Permitted Uses':
      return renderRow('Code', getAttribute('CODE', 'Code'));

    // Additional EPI Layers from JobManagement
    case 'Floor Space Ratio and Additional Controls':
      return (
        <div className={className}>
          {renderRow('Floor Space Ratio', getAttribute('FSR', 'Floor Space Ratio'))}
          {renderRow('Additional Controls', getAttribute('ADDITIONAL_CONTROLS', 'Additional Controls'))}
        </div>
      );

    case 'Height of Building and Additional Controls':
      return (
        <div className={className}>
          {renderRow('Maximum Building Height', getAttribute('MAX_B_H_M', 'Maximum Building Height'))}
          {renderRow('Additional Controls', getAttribute('ADDITIONAL_CONTROLS', 'Additional Controls'))}
        </div>
      );

    case 'Land Zoning and Additional Controls':
      return (
        <div className={className}>
          {renderRow('Land Use', getAttribute('LAND_USE', 'Land Use'))}
          {renderRow('Zone', getAttribute('ZONE', 'Zone'))}
          {renderRow('Additional Controls', getAttribute('ADDITIONAL_CONTROLS', 'Additional Controls'))}
        </div>
      );

    case 'Land Zoning Additional Controls':
      return (
        <div className={className}>
          {renderRow('Additional Controls', getAttribute('ADDITIONAL_CONTROLS', 'Additional Controls'))}
          {renderRow('Legislative Clause', getAttribute('LEGISLATIVE_CLAUSE', 'Legislative Clause'))}
        </div>
      );

    case 'Minimum Lot Size and Additional Controls':
      return (
        <div className={className}>
          {renderRow('Lot Size', getAttribute('LOT_SIZE', 'Lot Size'))}
          {renderRow('Additional Controls', getAttribute('ADDITIONAL_CONTROLS', 'Additional Controls'))}
        </div>
      );

    case 'Minimum Lot Size Additional Controls':
      return (
        <div className={className}>
          {renderRow('Additional Controls', getAttribute('ADDITIONAL_CONTROLS', 'Additional Controls'))}
          {renderRow('Legislative Clause', getAttribute('LEGISLATIVE_CLAUSE', 'Legislative Clause'))}
        </div>
      );

    case 'Land Reclassification':
      return (
        <div className={className}>
          {renderRow('Reclassification Type', getAttribute('RECLASSIFICATION_TYPE', 'Reclassification Type'))}
          {renderRow('Status', getAttribute('STATUS', 'Status'))}
        </div>
      );

    case 'Land Reservation Acquisition':
      return (
        <div className={className}>
          {renderRow('Reservation Type', getAttribute('RESERVATION_TYPE', 'Reservation Type'))}
          {renderRow('Purpose', getAttribute('PURPOSE', 'Purpose'))}
        </div>
      );

    case 'Foreshore Building Line':
      return (
        <div className={className}>
          {renderRow('Building Line Distance', getAttribute('BUILDING_LINE_DISTANCE', 'Building Line Distance'))}
          {renderRow('Units', getAttribute('UNITS', 'Units'))}
        </div>
      );


    // Protection Layers (based on actual layers in JobManagement)
    case 'Acid Sulfate Soils':
    case 'Airport Noise':
    case 'Drinking Water Catchment':
    case 'Groundwater Vulnerability':
    case 'Mineral and Resource Land':
    case 'Obstacle Limitation Surface':
    case 'Riparian Lands and Watercourses':
    case 'Salinity':
    case 'Scenic Protection Land':
    case 'Terrestrial Biodiversity':
    case 'Wetlands':
    case 'Environmentally Sensitive Land':
      return (
        <div className={className}>
          {renderRow('Class', getAttribute('CLASS', 'Class'))}
          {renderRow('Type', getAttribute('TYPE', 'Type'))}
        </div>
      );

    // Local Provisions Layers (based on actual layers in JobManagement)
    case 'Greenfield Housing Code Area':
    case 'Local Provisions':
    case 'Active Street Frontages':
    case 'Additional Permitted Uses':
    case 'Key Sites':
    case 'Urban Release Area':
      return (
        <div className={className}>
          {renderRow('Type', getAttribute('TYPE', 'Type'))}
          {renderRow('Class', getAttribute('CLASS', 'Class'))}
          {renderRow('Code', getAttribute('CODE', 'Code'))}
        </div>
      );

    default:
      // Default rendering for any unhandled layers - show all attributes
      return (
        <div className={className}>
          {Object.entries(attributes).map(([key, value]) => renderRow(key, value))}
        </div>
      );
  }
} 