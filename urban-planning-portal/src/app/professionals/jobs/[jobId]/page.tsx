'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader } from '@shared/components/ui/card';
import {
  Loader2,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Check,
  FileText,
  ClipboardCheck,
  DollarSign,
  FileCheck,
  Building2,
  FolderOpen,
  Undo2,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@shared/components/ui/alert';
import { Button } from '@shared/components/ui/button';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import type { Job } from '@shared/types/jobs';

interface Props {
  params: {
    jobId: string;
  };
}

async function getJob(jobId: string): Promise<Job> {
  const response = await fetch(`/api/jobs/${jobId}`);
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch job details');
  }
  return response.json();
}

export default function JobPage({ params }: Props) {
  const router = useRouter();
  const {
    data: job,
    isLoading,
    error,
  } = useQuery<Job>({
    queryKey: ['job', params.jobId],
    queryFn: () => getJob(params.jobId),
  });

  // Only these tiles should have tick/untick feature
  const tickableTileIds = [
    'initial-assessment',
    'design-check',
    'report-writer',
    'consultant-store',
    'certifying-authority',
    'complete',
  ];

  // Persistent tick state for all tickable tiles per job
  const tickedTilesKey = `tickedTiles-${params.jobId}`;
  const [tickedTiles, setTickedTiles] = useState<{ [tileId: string]: boolean }>({});

  useEffect(() => {
    const stored = localStorage.getItem(tickedTilesKey);
    setTickedTiles(stored ? JSON.parse(stored) : {});
  }, [tickedTilesKey]);

  const handleTickTile = (tileId: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    const updated = { ...tickedTiles, [tileId]: true };
    setTickedTiles(updated);
    localStorage.setItem(tickedTilesKey, JSON.stringify(updated));
  };

  const handleUntickTile = (tileId: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    const updated = { ...tickedTiles, [tileId]: false };
    setTickedTiles(updated);
    localStorage.setItem(tickedTilesKey, JSON.stringify(updated));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : 'An error occurred'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="container mx-auto p-4">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Job not found</AlertDescription>
        </Alert>
      </div>
    );
  }

  const tiles = [
    {
      name: 'Planning Layers',
      id: 'planning-layers',
      description: 'View planning layer details and attributes',
      icon: Building2,
      href: `/professionals/jobs/${params.jobId}/property-info`,
      color: '#EA6B3D',
    },
    {
      name: 'Site Details',
      id: 'site-details',
      description: 'Site specifications and requirements',
      icon: FileCheck,
      href: `/professionals/jobs/${params.jobId}/site-details`,
      color: '#CDC532',
    },
    {
      name: 'Document Store',
      id: 'document-store',
      description: 'Access and manage documents',
      icon: FolderOpen,
      href: `/professionals/jobs/${params.jobId}/document-store`,
      color: '#EEDA54',
    },
    {
      name: 'Initial Assessment',
      id: 'initial-assessment',
      description: 'Initial assessment of the development',
      icon: ClipboardCheck,
      href: `/professionals/jobs/${params.jobId}/initial-assessment`,
      color: '#CDC532',
    },
    {
      name: 'Design Check',
      id: 'design-check',
      description: 'Review design compliance',
      icon: ClipboardCheck,
      href: `/professionals/jobs/${params.jobId}/design-check`,
      color: '#CDC532',
    },
    {
      name: 'Report Writer',
      id: 'report-writer',
      description: 'Generate assessment reports',
      icon: FileText,
      href: `/professionals/jobs/${params.jobId}/report-writer`,
      color: '#532200',
    },
    {
      name: 'Consultants',
      id: 'consultant-store',
      description: 'View and manage consultants',
      icon: DollarSign,
      href: `/professionals/jobs/${params.jobId}/consultant-store`,
      color: '#727E86',
    },
    {
      name: 'Certifying Authority',
      id: 'certifying-authority',
      description: 'View and manage your approval',
      icon: DollarSign,
      href: `/professionals/jobs/${params.jobId}/certifying-authority`,
      color: '#727E86',
    },
    {
      name: 'Complete',
      id: 'complete',
      description: 'View completed tasks',
      icon: CheckCircle2,
      href: `/professionals/jobs/${params.jobId}/complete`,
      color: '#323A40',
    },
  ];

  const handleNavigateToPropertyInfo = () => {
    window.location.href = `/professionals/jobs/${job.id}/property-info`;
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <Alert className="mb-6 bg-[#EEDA54]/20 border-[#EEDA54]">
        <AlertTitle className="text-[#532200] font-semibold">Job Details</AlertTitle>
        <AlertDescription className="text-[#532200]">{job.address}</AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tiles.map(tile => {
          const isTickable = tickableTileIds.includes(tile.id);
          const isTicked = isTickable ? tickedTiles[tile.id] : false;
          return (
            <div key={tile.id} className="relative">
              <a href={tile.href}>
                <Card
                  className={`hover:bg-gray-50 transition-colors cursor-pointer border-l-4 ${isTickable && isTicked ? 'bg-green-100 border-green-500' : ''}`}
                  style={{ borderLeftColor: tile.color }}
                >
                  {/* Tick/Undo icon in top right for tickable tiles only */}
                  {isTickable && (
                    <div className="absolute top-2 right-2 z-10">
                      {isTicked ? (
                        <button
                          onClick={handleUntickTile(tile.id)}
                          className="bg-white rounded-full p-1 shadow hover:bg-gray-100"
                          title="Undo tick"
                        >
                          <Undo2 className="h-5 w-5 text-green-600" />
                        </button>
                      ) : (
                        <button
                          onClick={handleTickTile(tile.id)}
                          className="bg-white rounded-full p-1 shadow hover:bg-gray-100"
                          title="Mark as complete"
                        >
                          <Check className="h-5 w-5 text-green-600" />
                        </button>
                      )}
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-center space-x-2">
                      <tile.icon className="h-6 w-6" style={{ color: tile.color }} />
                      <div>
                        <h3 className="font-semibold">{tile.name}</h3>
                        <p className="text-sm text-gray-500">{tile.description}</p>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
}
