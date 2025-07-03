'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader } from '@shared/components/ui/card';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@shared/components/ui/alert';
import { Button } from '@shared/components/ui/button';
import { useRouter } from 'next/navigation';
import { renderLayerAttributes } from '@shared/utils/layerAttributeRenderer';

interface JobData {
  jobId: string;
  address: string;
  council: string;
  currentStage: string;
  createdAt: string;
  propertyData: {
    coordinates: {
      longitude: number;
      latitude: number;
    };
    planningLayers: {
      epiLayers: Array<{
        layer: string;
        attributes: Record<string, any>;
      }>;
      protectionLayers: Array<{
        layer: string;
        attributes: Record<string, any>;
      }>;
      localProvisionsLayers: Array<{
        layer: string;
        attributes: Record<string, any>;
      }>;
    };
  };
}

export default function PropertyInfoPage({ params }: { params: { jobId: string } }) {
  const router = useRouter();
  const [job, setJob] = useState<JobData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await fetch(`/api/jobs/${params.jobId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch job details');
        }
        const data = await response.json();
        setJob(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [params.jobId]);

  const renderAttributes = (attributes: Record<string, any>, layerName: string) => {
    const renderRow = (label: string, value: any) => (
      <div
        key={label}
        className="grid grid-cols-2 gap-4 py-2 border-b border-gray-100 last:border-0"
      >
        <div className="text-[#727E86] font-medium">{label}</div>
        <div className="text-[#323A40]">{value?.toString() || 'N/A'}</div>
      </div>
    );

    return renderLayerAttributes({
      attributes,
      layerName,
      renderRow,
      className: "space-y-2"
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="container mx-auto p-4">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error || 'Job not found'}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" className="p-2" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-semibold text-[#323A40]">{job.address}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Principal Planning Layers */}
        <Card className="shadow-md">
          <CardHeader className="bg-[#323A40] text-white">
            <h2 className="text-lg font-semibold">Principal Planning Layers</h2>
          </CardHeader>
          <CardContent className="p-4 space-y-6">
            {job.propertyData?.planningLayers?.epiLayers?.map((layer, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-[#532200] mb-3">{layer.layer}</h3>
                {renderAttributes(layer.attributes, layer.layer)}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Protection Layers */}
        <Card className="shadow-md">
          <CardHeader className="bg-[#323A40] text-white">
            <h2 className="text-lg font-semibold">Protection Layers</h2>
          </CardHeader>
          <CardContent className="p-4 space-y-6">
            {job.propertyData?.planningLayers?.protectionLayers?.map((layer, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-[#532200] mb-3">{layer.layer}</h3>
                {renderAttributes(layer.attributes, layer.layer)}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Local Provisions */}
        <Card className="shadow-md">
          <CardHeader className="bg-[#323A40] text-white">
            <h2 className="text-lg font-semibold">Local Provisions</h2>
          </CardHeader>
          <CardContent className="p-4 space-y-6">
            {job.propertyData?.planningLayers?.localProvisionsLayers?.map((layer, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-[#532200] mb-3">{layer.layer}</h3>
                {renderAttributes(layer.attributes, layer.layer)}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
