import React from 'react';

interface PropertySearchResultsProps {
  planningLayers: {
    epiLayers: Array<{
      layer: string;
      attributes: Record<string, string | number>;
    }>;
    protectionLayers: Array<{
      layer: string;
      attributes: Record<string, string | number>;
    }>;
  };
}

export function PropertySearchResults({ planningLayers }: PropertySearchResultsProps) {
  const { epiLayers, protectionLayers } = planningLayers;

  // Helper function to render a property row
  const renderPropertyRow = (property: string, value: string | number) => (
    <tr key={property} className="border-t border-gray-200">
      <td className="py-2 px-4 text-sm uppercase tracking-wider text-gray-600">{property}</td>
      <td className="py-2 px-4">{value}</td>
    </tr>
  );

  // Helper function to render a section
  const renderSection = (title: string, data: Record<string, string | number>, source?: string) => {
    if (!data || Object.keys(data).length === 0) return null;

    return (
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-medium">{title}</h3>
          {source && <span className="text-xs text-gray-500 italic">{source}</span>}
        </div>
        <table className="w-full">
          <tbody>{Object.entries(data).map(([key, value]) => renderPropertyRow(key, value))}</tbody>
        </table>
      </div>
    );
  };

  // Find specific layers
  const localEnvPlan =
    epiLayers.find(layer => layer.layer === 'Local Environmental Plan')?.attributes || {};
  const heightOfBuilding =
    epiLayers.find(layer => layer.layer === 'Height of Building')?.attributes || {};
  const landZoning = epiLayers.find(layer => layer.layer === 'Land Zoning')?.attributes || {};
  const minLotSize = epiLayers.find(layer => layer.layer === 'Minimum Lot Size')?.attributes || {};
  const salinity =
    protectionLayers.find(layer => layer.layer.includes('Salinity'))?.attributes || {};

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-4">Principal Planning Layers</h2>

      {renderSection(
        'Local Environmental Plan',
        {
          EPI_NAME: localEnvPlan.EPI_NAME || 'N/A',
          LGA_NAME: localEnvPlan.LGA_NAME || 'N/A',
        },
        'Principal Planning Layers'
      )}

      {renderSection(
        'Height of Building',
        {
          LAY_NAME: heightOfBuilding.LAY_NAME || 'N/A',
          MAX_B_H: heightOfBuilding.MAX_B_H || 'N/A',
          UNITS: heightOfBuilding.UNITS || 'N/A',
        },
        'Principal Planning Layers'
      )}

      {renderSection(
        'Land Zoning',
        {
          LAY_CLASS: landZoning.LAY_CLASS || 'N/A',
          SYM_CODE: landZoning.SYM_CODE || 'N/A',
        },
        'Principal Planning Layers'
      )}

      {renderSection(
        'Minimum Lot Size',
        {
          LOT_SIZE: minLotSize.LOT_SIZE || 'N/A',
          UNITS: minLotSize.UNITS || 'N/A',
        },
        'Principal Planning Layers'
      )}

      <h2 className="text-xl font-bold mb-4 mt-8">Protection Layers</h2>

      {renderSection(
        'Salinity',
        {
          LAY_CLASS: salinity.LAY_CLASS || 'N/A',
        },
        'Protection'
      )}

      <div className="mt-4 text-xs text-gray-500">
        Data provided by NSW Planning Services and ArcGIS REST API
      </div>
    </div>
  );
}
