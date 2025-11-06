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
  MessageCircle,
  User,
  Eye,
  EyeOff,
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

  // Stage completion state from job data
  const [completedStages, setCompletedStages] = useState<string[]>(job?.completedStages || []);
  const [currentActiveStage, setCurrentActiveStage] = useState<string>(job?.currentActiveStage || 'initial-assessment');
  const [migrationStatus, setMigrationStatus] = useState<'pending' | 'migrating' | 'completed' | 'none'>('pending');

  // Migration logic: check localStorage and migrate to job file
  useEffect(() => {
    if (!job) return;
    
    const tickedTilesKey = `tickedTiles-${params.jobId}`;
    const storedTickedTiles = localStorage.getItem(tickedTilesKey);
    
    if (storedTickedTiles && (!job.completedStages || job.completedStages.length === 0)) {
      setMigrationStatus('migrating');
      
      try {
        const tickedTiles = JSON.parse(storedTickedTiles);
        const migratedStages = Object.keys(tickedTiles).filter(tileId => tickedTiles[tileId]);
        const lastTickedStage = migratedStages[migratedStages.length - 1] || 'initial-assessment';
        
        // Update job via API
        updateJobStages(migratedStages, lastTickedStage)
          .then(() => {
            setCompletedStages(migratedStages);
            setCurrentActiveStage(lastTickedStage);
            localStorage.removeItem(tickedTilesKey);
            setMigrationStatus('completed');
          })
          .catch(error => {
            console.error('Migration failed:', error);
            setMigrationStatus('none');
          });
      } catch (error) {
        console.error('Error parsing localStorage data:', error);
        setMigrationStatus('none');
      }
    } else {
      // Use existing job data
      setCompletedStages(job.completedStages || []);
      setCurrentActiveStage(job.currentActiveStage || 'initial-assessment');
      setMigrationStatus('none');
    }
  }, [job, params.jobId]);

  // Update job stages via API
  const updateJobStages = async (stages: string[], activeStage: string) => {
    const response = await fetch(`/api/jobs/${params.jobId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        completedStages: stages,
        currentActiveStage: activeStage,
        updatedAt: new Date().toISOString()
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to update job stages');
    }
    
    return response.json();
  };

  // Tiles that should have eye icon 
  const eyeIconTileIds = [
    'client-details',
    'messages',
    'design-brief',
    'document-store',
    'planning-layers',
    'site-details',
    'initial-assessment',
    'design-check',
    'report-writer',
    'consultant-store',
    'certifying-authority',
    'complete',
  ];

  // Persistent viewed state for tiles with eye icon
  const viewedTilesKey = `viewedTiles-${params.jobId}`;
  const [viewedTiles, setViewedTiles] = useState<{ [tileId: string]: boolean }>({});

  useEffect(() => {
    const stored = localStorage.getItem(viewedTilesKey);
    setViewedTiles(stored ? JSON.parse(stored) : {});
  }, [viewedTilesKey]);

  const handleTickTile = (tileId: string) => async (e: React.MouseEvent) => {
    e.preventDefault();
    
    const newCompletedStages = [...completedStages, tileId];
    setCompletedStages(newCompletedStages);
    setCurrentActiveStage(tileId);
    
    try {
      await updateJobStages(newCompletedStages, tileId);
    } catch (error) {
      console.error('Failed to update stage:', error);
      // Revert on error
      setCompletedStages(completedStages);
      setCurrentActiveStage(currentActiveStage);
    }
  };

  const handleUntickTile = (tileId: string) => async (e: React.MouseEvent) => {
    e.preventDefault();
    
    const newCompletedStages = completedStages.filter(stage => stage !== tileId);
    const newActiveStage = newCompletedStages.length > 0 ? newCompletedStages[newCompletedStages.length - 1] : 'initial-assessment';
    
    setCompletedStages(newCompletedStages);
    setCurrentActiveStage(newActiveStage);
    
    try {
      await updateJobStages(newCompletedStages, newActiveStage);
    } catch (error) {
      console.error('Failed to update stage:', error);
      // Revert on error
      setCompletedStages(completedStages);
      setCurrentActiveStage(currentActiveStage);
    }
  };

  const handleToggleEye = (tileId: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    const updated = { ...viewedTiles, [tileId]: !viewedTiles[tileId] };
    setViewedTiles(updated);
    localStorage.setItem(viewedTilesKey, JSON.stringify(updated));
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
      name: 'Client Details',
      id: 'client-details',
      description: 'View client details',
      icon: User,
      href: `/professionals/jobs/${params.jobId}/client-details`,
      color: '#EA6B3D',
    },
    {
      name: 'Messages',
      id: 'messages',
      description: 'View messages',
      icon: MessageCircle,
      href: `/professionals/jobs/${params.jobId}/messages`,
      color: '#EA6B3D',
    },
    {
      name: 'Design Brief',
      id: 'design-brief',
      description: 'View design brief',
      icon: FileText,
      href: `/professionals/jobs/${params.jobId}/design-brief`,
      color: '#EA6B3D',
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
      {migrationStatus === 'migrating' && (
        <Alert className="mb-6 bg-blue-50 border-blue-200">
          <AlertTitle className="text-blue-800">Migrating Data</AlertTitle>
          <AlertDescription className="text-blue-700">
            Migrating your stage progress to the new system...
          </AlertDescription>
        </Alert>
      )}
      
      {migrationStatus === 'completed' && (
        <Alert className="mb-6 bg-green-50 border-green-200">
          <AlertTitle className="text-green-800">Migration Complete</AlertTitle>
          <AlertDescription className="text-green-700">
            Your stage progress has been successfully migrated!
          </AlertDescription>
        </Alert>
      )}

      <Alert className="mb-6 bg-[#EEDA54]/20 border-[#EEDA54]">
        <AlertTitle className="text-[#532200] font-semibold">Job Details</AlertTitle>
        <AlertDescription className="text-[#532200]">{job.address}</AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tiles.map(tile => {
          const isTickable = tickableTileIds.includes(tile.id);
          const isTicked = isTickable ? completedStages.includes(tile.id) : false;
          const hasEyeIcon = eyeIconTileIds.includes(tile.id);
          const isViewed = hasEyeIcon ? viewedTiles[tile.id] : false;
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
                  {/* Eye icon below tick icon on right side */}
                  {hasEyeIcon && (
                    <div className="absolute top-12 right-2 z-10">
                      <button
                        onClick={handleToggleEye(tile.id)}
                        className="bg-white rounded-full p-1 shadow hover:bg-gray-100"
                        title={isViewed ? 'Mark as not viewable' : 'Mark as viewable'}
                      >
                        {isViewed ? (
                          <Eye className="h-5 w-5 text-blue-600" />
                        ) : (
                          <EyeOff className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
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
