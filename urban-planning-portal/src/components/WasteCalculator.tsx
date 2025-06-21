'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@shared/components/ui/card';
import { Label } from '@shared/components/ui/label';
import { Input } from '@shared/components/ui/input';
import { Button } from '@shared/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@shared/components/ui/select';
import { useToast } from '@shared/components/ui/use-toast';

interface WasteCalculationResult {
  totalWaste: number;
  demolitionWaste: number;
  excavationWaste: number;
  constructionWaste: number;
}

export function WasteCalculator() {
  const { toast } = useToast();
  const [buildingType, setBuildingType] = useState<string>('residential');
  const [floorArea, setFloorArea] = useState<string>('');
  const [demolitionArea, setDemolitionArea] = useState<string>('');
  const [excavationVolume, setExcavationVolume] = useState<string>('');
  const [results, setResults] = useState<WasteCalculationResult | null>(null);

  const calculateWaste = () => {
    if (!floorArea || !demolitionArea || !excavationVolume) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields to calculate waste.',
        variant: 'destructive',
      });
      return;
    }

    const floorAreaNum = parseFloat(floorArea);
    const demolitionAreaNum = parseFloat(demolitionArea);
    const excavationVolumeNum = parseFloat(excavationVolume);

    if (isNaN(floorAreaNum) || isNaN(demolitionAreaNum) || isNaN(excavationVolumeNum)) {
      toast({
        title: 'Invalid Input',
        description: 'Please enter valid numbers for all measurements.',
        variant: 'destructive',
      });
      return;
    }

    // Waste generation rates (kg/m²)
    const rates = {
      residential: { construction: 150, demolition: 1000 },
      commercial: { construction: 200, demolition: 1200 },
      industrial: { construction: 250, demolition: 1500 },
    };

    const rate = rates[buildingType as keyof typeof rates];
    const constructionWaste = floorAreaNum * rate.construction;
    const demolitionWaste = demolitionAreaNum * rate.demolition;
    const excavationWaste = excavationVolumeNum * 1500; // Assuming 1.5 tonnes/m³

    const result = {
      totalWaste: constructionWaste + demolitionWaste + excavationWaste,
      constructionWaste,
      demolitionWaste,
      excavationWaste,
    };

    setResults(result);
    toast({
      title: 'Calculation Complete',
      description: 'Waste calculation has been updated successfully.',
    });
  };

  const formatWeight = (weight: number) => {
    if (weight >= 1000) {
      return `${(weight / 1000).toFixed(2)} tonnes`;
    }
    return `${weight.toFixed(2)} kg`;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Waste Calculator</CardTitle>
        <CardDescription>
          Calculate the estimated waste for your construction project
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="buildingType">Building Type</Label>
            <Select value={buildingType} onValueChange={setBuildingType}>
              <SelectTrigger>
                <SelectValue placeholder="Select building type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="residential">Residential</SelectItem>
                <SelectItem value="commercial">Commercial</SelectItem>
                <SelectItem value="industrial">Industrial</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="floorArea">Floor Area (m²)</Label>
            <Input
              id="floorArea"
              type="number"
              value={floorArea}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFloorArea(e.target.value)}
              placeholder="Enter floor area"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="demolitionArea">Demolition Area (m²)</Label>
            <Input
              id="demolitionArea"
              type="number"
              value={demolitionArea}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setDemolitionArea(e.target.value)
              }
              placeholder="Enter demolition area"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="excavationVolume">Excavation Volume (m³)</Label>
            <Input
              id="excavationVolume"
              type="number"
              value={excavationVolume}
              onChange={e => setExcavationVolume(e.target.value)}
              placeholder="Enter excavation volume"
            />
          </div>

          <Button onClick={calculateWaste}>Calculate Waste</Button>

          {results && (
            <div className="mt-4 grid gap-2">
              <p>
                <strong>Total Waste:</strong> {formatWeight(results.totalWaste)}
              </p>
              <p>
                <strong>Construction Waste:</strong> {formatWeight(results.constructionWaste)}
              </p>
              <p>
                <strong>Demolition Waste:</strong> {formatWeight(results.demolitionWaste)}
              </p>
              <p>
                <strong>Excavation Waste:</strong> {formatWeight(results.excavationWaste)}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
