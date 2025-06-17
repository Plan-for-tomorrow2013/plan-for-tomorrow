import React, { useState } from 'react';

interface FSRInputs {
  siteArea: number;
  streetFrontage: number;
  zone: 'E1' | 'E2' | 'E3' | 'MU1' | 'B3';
  residentialPercentage: number;
}

const WollongongFSR: React.FC = () => {
  const [inputs, setInputs] = useState<FSRInputs>({
    siteArea: 0,
    streetFrontage: 0,
    zone: 'E2',
    residentialPercentage: 0,
  });

  const calculateFSR = (inputs: FSRInputs): number => {
    const { siteArea, streetFrontage, zone, residentialPercentage } = inputs;
    const nonResidentialPercentage = 100 - residentialPercentage;

    // Calculate X for E2 zone with site area between 800 and 2000 sqm
    if (zone === 'E2' && siteArea >= 800 && siteArea < 2000 && streetFrontage >= 20) {
      const X = (siteArea - 800) / 1200;

      if (residentialPercentage === 100) {
        return 2 + 1.5 * X;
      } else if (residentialPercentage === 0) {
        return 3.5 + 2.5 * X;
      }
    }

    // Calculate mixed use FSR
    let RFSR = 0; // Residential FSR
    let NRFSR = 0; // Non-residential FSR

    // Set base FSR values based on zone
    switch (zone) {
      case 'B3':
        RFSR = 3.5;
        NRFSR = 6;
        break;
      case 'E2':
        RFSR = 2;
        NRFSR = 3.5;
        break;
      case 'E1':
      case 'E3':
      case 'MU1':
        RFSR = 1.5;
        NRFSR = 2;
        break;
    }

    // Calculate mixed use FSR
    return (NRFSR * nonResidentialPercentage / 100) + (RFSR * residentialPercentage / 100);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setInputs(prev => ({
      ...prev,
      [name]: name === 'zone' ? value : Number(value)
    }));
  };

  const fsr = calculateFSR(inputs);

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Wollongong FSR Calculator</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Site Area (m²)</label>
          <input
            type="number"
            name="siteArea"
            value={inputs.siteArea}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Street Frontage (m)</label>
          <input
            type="number"
            name="streetFrontage"
            value={inputs.streetFrontage}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Zone</label>
          <select
            name="zone"
            value={inputs.zone}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="E1">E1 Local Centre</option>
            <option value="E2">E2 Commercial Centre</option>
            <option value="E3">E3 Productivity Support</option>
            <option value="MU1">MU1 Mixed Use</option>
            <option value="B3">B3 Commercial Core</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Residential Percentage (%)</label>
          <input
            type="number"
            name="residentialPercentage"
            value={inputs.residentialPercentage}
            onChange={handleInputChange}
            min="0"
            max="100"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-md">
          <h3 className="text-lg font-medium text-gray-900">Calculated FSR</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">{fsr.toFixed(2)}:1</p>
        </div>
      </div>
    </div>
  );
};

export default WollongongFSR;
