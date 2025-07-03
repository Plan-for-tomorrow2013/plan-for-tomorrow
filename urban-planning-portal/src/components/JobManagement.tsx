'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@shared/components/ui/card';
import { Input } from '@shared/components/ui/input';
import { Button } from '@shared/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@shared/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@shared/components/ui/alert';
import { AlertCircle, Building, Loader2 } from 'lucide-react';
import { Separator } from '@shared/components/ui/separator';
import { renderLayerAttributes } from '@shared/utils/layerAttributeRenderer';

interface LayerInfo {
  layerId: number;
  layerName: string;
  source: string;
  attributes: Record<string, string | number | null>;
}

interface GeocodingResult {
  longitude: number | null;
  latitude: number | null;
}

interface LayerQuery {
  id: number;
  name: string;
}

// Function to format attribute names for display
function formatAttributeName(name: string): string {
  return name
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export function JobManagement() {
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [coordinates, setCoordinates] = useState<GeocodingResult | null>(null);
  const [layersInfo, setLayersInfo] = useState<LayerInfo[]>([]);
  const [protectionLayersInfo, setProtectionLayersInfo] = useState<LayerInfo[]>([]);
  const [localProvisionsInfo, setLocalProvisionsInfo] = useState<LayerInfo[]>([]);

  const handleCreateJob = async () => {
    if (!coordinates) {
      setError('Cannot create a job without coordinates.');
      return;
    }

    setLoading(true);
    setError(null);

    const jobData = {
      address: address,
      council: 'Test Council', // Placeholder, you might want to get this from somewhere
      coordinates: coordinates,
      planningLayers: {
        epiLayers: layersInfo.map(l => ({
          layer: l.layerName,
          attributes: l.attributes,
        })),
        protectionLayers: protectionLayersInfo.map(l => ({
          layer: l.layerName,
          attributes: l.attributes,
        })),
        localProvisionsLayers: localProvisionsInfo.map(l => ({
          layer: l.layerName,
          attributes: l.attributes,
        })),
      },
    };

    try {
      const response = await fetch('/api/jobs/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jobData),
      });

      if (!response.ok) {
        throw new Error('Failed to create job');
      }

      const result = await response.json();
      if (result.redirectUrl) {
        window.location.href = result.redirectUrl;
      } else {
        throw new Error('Did not receive a redirect URL.');
      }
    } catch (error) {
      console.error('Error creating job:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!address.trim()) {
      setError('Please enter an address');
      return;
    }

    setLoading(true);
    setError(null);
    setCoordinates(null);
    setLayersInfo([]);
    setProtectionLayersInfo([]);
    setLocalProvisionsInfo([]);

    try {
      // Use the same API endpoint as the dashboard
      const response = await fetch(`/api/geocode?address=${encodeURIComponent(address)}`);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      setCoordinates(data.coordinates);

      // Transform the data to match JobManagement's expected format
      const transformedEpiLayers = data.planningLayers.epiLayers.map((layer: any) => ({
        layerId: 0, // We don't have layer IDs from identify endpoint
        layerName: layer.layer,
        source: 'Principal Planning Layers',
        attributes: layer.attributes,
      }));

      const transformedProtectionLayers = data.planningLayers.protectionLayers.map((layer: any) => ({
        layerId: 0,
        layerName: layer.layer,
        source: 'Protection',
        attributes: layer.attributes,
      }));

      const transformedLocalProvisionsLayers = data.planningLayers.localProvisionsLayers.map((layer: any) => ({
        layerId: 0,
        layerName: layer.layer,
        source: 'Local Provisions',
        attributes: layer.attributes,
      }));

      setLayersInfo(transformedEpiLayers);
      setProtectionLayersInfo(transformedProtectionLayers);
      setLocalProvisionsInfo(transformedLocalProvisionsLayers);

    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch property information');
    } finally {
      setLoading(false);
    }
  };

  const fetchLayerInfo = async (
    coords: GeocodingResult,
    mapServerUrl: string,
    source: string,
    isProtection = false
  ) => {

    // Define layers based on the source
    let layersToQuery: LayerQuery[] = [];
    if (source === 'Principal Planning Layers') {
      layersToQuery = [
        { id: 1, name: 'Local Environmental Plan' },
        { id: 2, name: 'Floor Space Ratio and Additional Controls' },
        { id: 3, name: 'Floor Space Ratio Additional Controls' },
        { id: 4, name: 'Floor Space Ratio (n:1)' },
        { id: 5, name: 'Height of Building and Additional Controls' },
        { id: 6, name: 'Height of Building Additional Controls' },
        { id: 7, name: 'Height of Building' },
        { id: 8, name: 'Heritage' },
        { id: 9, name: 'Land Zoning and Additional Controls' },
        { id: 10, name: 'Land Zoning Additional Controls' },
        { id: 11, name: 'Land Zoning' },
        { id: 12, name: 'Minimum Lot Size and Additional Controls' },
        { id: 13, name: 'Minimum Lot Size Additional Controls' },
        { id: 14, name: 'Minimum Lot Size' },
        { id: 15, name: 'Land Reclassification' },
        { id: 16, name: 'Land Reservation Acquisition' },
        { id: 17, name: 'Minimum Dwelling Density Area' },
        { id: 18, name: 'Foreshore Building Line' },
      ];

    } else if (source === 'Protection') {
      layersToQuery = [
        { id: 1, name: 'Acid Sulfate Soils' },
        { id: 2, name: 'Airport Noise' },
        { id: 3, name: 'Drinking Water Catchment' },
        { id: 4, name: 'Groundwater Vulnerability' },
        { id: 5, name: 'Mineral and Resource Land' },
        { id: 6, name: 'Obstacle Limitation Surface' },
        { id: 7, name: 'Riparian Lands and Watercourses' },
        { id: 8, name: 'Salinity' },
        { id: 9, name: 'Scenic Protection Land' },
        { id: 10, name: 'Terrestrial Biodiversity' },
        { id: 11, name: 'Wetlands' },
        { id: 12, name: 'Environmentally Sensitive Land' },
      ];

    } else if (source === 'Local Provisions') {
      layersToQuery = [
        { id: 2, name: 'Greenfield Housing Code Area' },
        { id: 3, name: 'Local Provisions' },
        { id: 4, name: 'Active Street Frontages' },
        { id: 5, name: 'Additional Permitted Uses' },
        { id: 6, name: 'Key Sites' },
        { id: 7, name: 'Urban Release Area' },
      ];
    }

    const results: LayerInfo[] = [];

    for (const layer of layersToQuery) {
      const queryUrl = `${mapServerUrl}/${layer.id}/query`;
      const params = new URLSearchParams({
        where: '',
        text: '',
        objectIds: '',
        time: '',
        timeRelation: 'esriTimeRelationOverlaps',
        geometry: `${coords.longitude},${coords.latitude}`,
        geometryType: 'esriGeometryPoint',
        outFields: '*',
        inSR: '4326',
        spatialRel: 'esriSpatialRelIntersects',
        distance: '',
        units: 'esriSRUnit_Meter',
        f: 'json',
      });

      try {
        const response = await fetch(`${queryUrl}?${params}`);
        if (!response.ok) {
          console.error(`Error querying layer ${layer.name}: ${response.status}`);
          continue;
        }

        const data = await response.json();
        if (data.features && data.features.length > 0) {
          const attributes = data.features[0].attributes;
          let filteredAttributes: Record<string, string | number | null> = {};

          switch (layer.name) {
            case 'Local Environmental Plan':
              if (attributes.EPI_NAME || attributes.LGA_NAME) {
                filteredAttributes = {
                  EPI_NAME: attributes.EPI_NAME || 'N/A',
                  LGA_NAME: attributes.LGA_NAME || 'N/A',
                };
              }
              break;
            case 'Floor Space Ratio and Additional Controls':
              if (attributes.FSR || attributes.UNITS) {
                filteredAttributes = {
                  FSR: attributes.FSR || 'N/A',
                  UNITS: attributes.UNITS || 'N/A',
                };
              }
              break;
            case 'Floor Space Ratio Additional Controls':
              if (attributes.LEGISLATIVE_AREA || attributes.LEGISLATIVE_CLAUSE) {
                filteredAttributes = {
                  LEGISLATIVE_AREA: attributes.LEGISLATIVE_AREA || 'N/A',
                  LEGISLATIVE_CLAUSE: attributes.LEGISLATIVE_CLAUSE || 'N/A',
                };
              }
              break;
            case 'Floor Space Ratio (n:1)':
              if (attributes.FSR || attributes.UNITS) {
                filteredAttributes = {
                  FSR: attributes.FSR || 'N/A',
                  UNITS: attributes.UNITS || 'N/A',
                };
              }
              break;
            case 'Height of Building and Additional Controls':
              if (attributes.MAX_B_H || attributes.UNITS) {
                filteredAttributes = {
                  MAX_B_H: attributes.MAX_B_H || 'N/A',
                  UNITS: attributes.UNITS || 'N/A',
                };
              }
              break;
            case 'Height of Building Additional Controls':
              if (attributes.LEGISLATIVE_AREA || attributes.LEGISLATIVE_CLAUSE) {
                filteredAttributes = {
                  LEGISLATIVE_AREA: attributes.LEGISLATIVE_AREA || 'N/A',
                  LEGISLATIVE_CLAUSE: attributes.LEGISLATIVE_CLAUSE || 'N/A',
                };
              }
              break;
            case 'Height of Building':
              if (attributes.MAX_B_H) {
                filteredAttributes = {
                  LAY_NAME: 'Maximum Building Height (m)',
                  MAX_B_H: attributes.MAX_B_H || 'N/A',
                  UNITS: attributes.UNITS || 'm',
                };
              }
              break;
            case 'Heritage':
              if (attributes.LAY_CLASS || attributes.HID || attributes.HNAME || attributes.SIG) {
                filteredAttributes = {
                  LAY_CLASS: attributes.LAY_CLASS || 'N/A',
                  HID: attributes.HID || 'N/A',
                  HNAME: attributes.HNAME || 'N/A',
                  SIG: attributes.SIG || 'N/A',
                };
              }
              break;
            case 'Land Zoning and Additional Controls':
              if (attributes.LAY_CLASS || attributes.SYM_CODE) {
                filteredAttributes = {
                  LAY_CLASS: attributes.LAY_CLASS || 'N/A',
                  SYM_CODE: attributes.SYM_CODE || 'N/A',
                };
              }
              break;
            case 'Land Zoning Additional Controls':
              if (attributes.LEGISLATIVE_AREA || attributes.LEGISLATIVE_CLAUSE) {
                filteredAttributes = {
                  LEGISLATIVE_AREA: attributes.LEGISLATIVE_AREA || 'N/A',
                  LEGISLATIVE_CLAUSE: attributes.LEGISLATIVE_CLAUSE || 'N/A',
                };
              }
              break;
            case 'Land Zoning':
              if (attributes.LAY_CLASS || attributes.SYM_CODE) {
                filteredAttributes = {
                  LAY_CLASS: attributes.LAY_CLASS || 'N/A',
                  SYM_CODE: attributes.SYM_CODE || 'N/A',
                };
              }
              break;
            case 'Minimum Lot Size and Additional Controls':
              if (attributes.LOT_SIZE || attributes.UNITS) {
                filteredAttributes = {
                  LOT_SIZE: attributes.LOT_SIZE || 'N/A',
                  UNITS: attributes.UNITS || 'm²',
                };
              }
              break;
            case 'Minimum Lot Size Additional Controls':
              if (attributes.LEGISLATIVE_AREA || attributes.LEGISLATIVE_CLAUSE) {
                filteredAttributes = {
                  LEGISLATIVE_AREA: attributes.LEGISLATIVE_AREA || 'N/A',
                  LEGISLATIVE_CLAUSE: attributes.LEGISLATIVE_CLAUSE || 'N/A',
                };
              }
              break;
            case 'Minimum Lot Size':
              if (attributes.LOT_SIZE) {
                filteredAttributes = {
                  LOT_SIZE: attributes.LOT_SIZE || 'N/A',
                  UNITS: attributes.UNITS || 'm²',
                };
              }
              break;
            case 'Land Reclassification':
              if (attributes.LAY_CLASS || attributes.SYM_CODE) {
                filteredAttributes = {
                  LAY_CLASS: attributes.LAY_CLASS || 'N/A',
                  SYM_CODE: attributes.SYM_CODE || 'N/A',
                };
              }
              break;
            case 'Land Reservation Acquisition':
              if (attributes.LAY_CLASS || attributes.SYM_CODE) {
                filteredAttributes = {
                  LAY_CLASS: attributes.LAY_CLASS || 'N/A',
                  SYM_CODE: attributes.SYM_CODE || 'N/A',
                };
              }
              break;
            case 'Minimum Dwelling Density Area':
              if (attributes.TYPE) {
                filteredAttributes = {
                  TYPE: attributes.TYPE || 'N/A',
                };
              }
              break;
            case 'Foreshore Building Line':
              if (attributes.LAY_CLASS || attributes.SYM_CODE) {
                filteredAttributes = {
                  LAY_CLASS: attributes.LAY_CLASS || 'N/A',
                  SYM_CODE: attributes.SYM_CODE || 'N/A',
                };
              }
              break;
            // Protection Layers
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
              if (attributes.LAY_CLASS || attributes.CLASS) {
                filteredAttributes = {
                  CLASS: attributes.LAY_CLASS || attributes.CLASS || 'N/A',
                };
              }
              break;
            // Local Provisions Layers
            case 'Greenfield Housing Code Area':
            case 'Local Provisions':
            case 'Active Street Frontages':
            case 'Key Sites':
            case 'Urban Release Area':
              if (attributes.TYPE || attributes.CLASS) {
                filteredAttributes = {
                  TYPE: attributes.TYPE || 'N/A',
                  CLASS: attributes.CLASS || 'N/A',
                };
              }
              break;
            case 'Additional Permitted Uses':
              if (attributes.CODE) {
                filteredAttributes = {
                  CODE: attributes.CODE || 'N/A',
                };
              }
              break;
            default:
              // For any layer not specifically handled, show all available attributes
              if (attributes && Object.keys(attributes).length > 0) {
                filteredAttributes = attributes;
              }
              break;
          }

          if (Object.keys(filteredAttributes).length > 0) {
            results.push({
              layerId: layer.id,
              layerName: layer.name,
              source: source,
              attributes: filteredAttributes,
            });
          } else {
            // Add layer with no data for transparency
            results.push({
              layerId: layer.id,
              layerName: layer.name,
              source: source,
              attributes: {},
            });
          }
        }
      } catch (error) {
        console.error(`Error querying layer ${layer.name}:`, error);
      }
    }

    return results;
  };

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Property Search</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              placeholder="Enter address (e.g., 63 Elgin St Gunnedah)"
              value={address}
              onChange={e => setAddress(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleSearch} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                'Search'
              )}
            </Button>
          </div>

          {error && <div className="text-sm text-red-500 mt-2">{error}</div>}

          {coordinates && coordinates.longitude && coordinates.latitude && (
            <div className="mt-4">
              <h3 className="text-sm font-medium mb-2">Coordinates</h3>
              <p className="text-sm text-muted-foreground">
                Longitude: {coordinates.longitude.toFixed(6)}, Latitude:{' '}
                {coordinates.latitude.toFixed(6)}
              </p>
            </div>
          )}

          {/* Layers Information */}
          {layersInfo.length > 0 && (
            <LayersTable title="Principal Planning Layers" layers={layersInfo} />
          )}

          {/* Protection Layers Information */}
          {protectionLayersInfo.length > 0 && (
            <LayersTable title="Protection Layers" layers={protectionLayersInfo} />
          )}

          {/* Local Provisions Information */}
          {localProvisionsInfo.length > 0 && (
            <LayersTable title="Local Provisions" layers={localProvisionsInfo} />
          )}

          {/* Create Job Button */}
          {(layersInfo.length > 0 || protectionLayersInfo.length > 0 || localProvisionsInfo.length > 0) && (
            <div className="flex justify-end mt-6">
              <Button onClick={handleCreateJob} disabled={loading}>
                Create Job
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Reusable component to render a table of layers
function LayersTable({ title, layers }: { title: string; layers: LayerInfo[] }) {
  const renderRow = (label: string, value: any) => (
    <TableRow key={label}>
      <TableCell className="font-medium">{label}</TableCell>
      <TableCell>{value !== null ? String(value) : 'N/A'}</TableCell>
    </TableRow>
  );

  return (
    <div className="mt-6 space-y-8">
      <h3 className="text-lg font-medium">{title}</h3>
      {layers.map((layerInfo, index) => (
        <div key={`${layerInfo.source}-${layerInfo.layerId}-${index}`} className="space-y-2">
          <div className="flex justify-between items-center">
            <h4 className="text-md font-medium">{layerInfo.layerName}</h4>
            <span className="text-xs text-muted-foreground">{layerInfo.source}</span>
          </div>
          <Separator />
          {Object.keys(layerInfo.attributes).length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Property</TableHead>
                    <TableHead>Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {renderLayerAttributes({
                    attributes: layerInfo.attributes,
                    layerName: layerInfo.layerName,
                    renderRow,
                    className: ""
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No information available for this layer at this location.
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
