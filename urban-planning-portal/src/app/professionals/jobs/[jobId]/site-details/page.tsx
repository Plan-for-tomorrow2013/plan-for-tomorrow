'use client';

import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Check, Loader2, Upload, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '@shared/components/ui/button';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from '@shared/components/ui/alert';
import { DetailedSiteDetails } from '@shared/components/DetailedSiteDetails';
import { SiteDetails } from '@shared/types/site-details';
import { toast } from '@shared/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@shared/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@shared/components/ui/select';

// Add normalization helper
function normalizeSiteDetails(data: any): SiteDetails {
  return {
    // Site Characteristics
    lotType: data?.lotType || '',
    siteArea: data?.siteArea || '',
    frontage: data?.frontage || '',
    depth: data?.depth || '',
    slope: data?.slope || '',
    orientation: data?.orientation || '',
    soilType: data?.soilType || '',
    vegetation: data?.vegetation || '',
    primaryStreetWidth: data?.primaryStreetWidth || '',
    siteDepth: data?.siteDepth || '',
    secondaryStreetWidth: data?.secondaryStreetWidth || '',
    gradient: data?.gradient || '',
    highestRL: data?.highestRL || '',
    lowestRL: data?.lowestRL || '',
    fallAmount: data?.fallAmount || '',

    // Existing Development
    currentLandUse: data?.currentLandUse || '',
    existingDevelopmentDetails: data?.existingDevelopmentDetails || '',

    // Surrounding Development
    northDevelopment: data?.northDevelopment || '',
    southDevelopment: data?.southDevelopment || '',
    eastDevelopment: data?.eastDevelopment || '',
    westDevelopment: data?.westDevelopment || '',

    // Site Constraints
    bushfireProne: data?.bushfireProne ?? false,
    floodProne: data?.floodProne ?? false,
    acidSulfateSoils: data?.acidSulfateSoils ?? false,
    biodiversity: data?.biodiversity ?? false,
    salinity: data?.salinity ?? false,
    landslip: data?.landslip ?? false,
    heritage: data?.heritage || '',
    contamination: data?.contamination || '',
    otherConstraints: data?.otherConstraints || '',
  };
}

interface SiteImage {
  id: string;
  fileName: string;
  originalName: string;
  uploadedAt: string;
  size: number;
  type: string;
  category: string;
}

const SITE_IMAGE_CATEGORIES = [
  { value: 'front-of-site', label: 'Front of Site', description: 'View from the street showing the front of the property' },
  { value: 'rear-of-site', label: 'Rear of Site', description: 'View from the back of the property' },
  { value: 'left-adjoining', label: 'Left Adjoining Property', description: 'View of the property to the left' },
  { value: 'right-adjoining', label: 'Right Adjoining Property', description: 'View of the property to the right' },
  { value: 'across-street', label: 'Development Across Street', description: 'View of development directly across the street' },
  { value: 'street-scene', label: 'Street Scene', description: 'General street view showing the neighborhood context' },
  { value: 'site-overview', label: 'Site Overview', description: 'Aerial or elevated view of the entire site' },
  { value: 'existing-development', label: 'Existing Development', description: 'Current buildings or structures on site' },
  { value: 'site-constraints', label: 'Site Constraints', description: 'Photos showing site constraints (trees, slopes, etc.)' },
  { value: 'other', label: 'Other', description: 'Other relevant site images' },
];

export default function SiteDetailsPage({ params }: { params: { jobId: string } }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [siteDetailsData, setSiteDetailsData] = useState<SiteDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Image upload states
  const [siteImages, setSiteImages] = useState<SiteImage[]>([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [jobData, setJobData] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  // Fetch initial data
  useEffect(() => {
    const fetchSiteDetails = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch the whole job data first
        const response = await fetch(`/api/jobs/${params.jobId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch job data');
        }
        const jobData = await response.json();
        setJobData(jobData);
        
        // Set the site details state from the job data
        setSiteDetailsData(normalizeSiteDetails(jobData.siteDetails));
        
        // Extract site images from job documents
        const images: SiteImage[] = [];
        if (jobData.documents) {
          Object.entries(jobData.documents).forEach(([id, doc]: [string, any]) => {
            if (doc.type?.startsWith('image/')) {
              images.push({
                id,
                fileName: doc.fileName,
                originalName: doc.originalName,
                uploadedAt: doc.uploadedAt,
                size: doc.size,
                type: doc.type,
                category: doc.category || 'other',
              });
            }
          });
        }
        setSiteImages(images);
      } catch (err) {
        console.error('Error fetching site details:', err);
        setError(err instanceof Error ? err.message : 'Failed to load site details');
        setSiteDetailsData(normalizeSiteDetails({}));
      } finally {
        setIsLoading(false);
      }
    };

    fetchSiteDetails();
  }, [params.jobId]);

  // Handler for when data changes in the child component
  const handleDataChange = (newData: SiteDetails) => {
    setSiteDetailsData(newData);
    setHasUnsavedChanges(true);
    // Clear save status if user makes changes after a save
    if (saveStatus === 'success' || saveStatus === 'error') {
      setSaveStatus('idle');
    }
  };

  // Save handler using the correct API endpoint and method
  const handleSave = async () => {
    if (!siteDetailsData) return;

    setSaveStatus('saving');
    setError(null);
    try {
      const response = await fetch(`/api/jobs/${params.jobId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ siteDetails: siteDetailsData }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to save site details');
      }

      setSaveStatus('success');
      setHasUnsavedChanges(false);
      toast({ title: 'Success', description: 'Site details saved successfully.' });

      setTimeout(() => {
        setSaveStatus(currentStatus => (currentStatus === 'success' ? 'idle' : currentStatus));
      }, 3000);
    } catch (error) {
      console.error('Error saving site details:', error);
      setSaveStatus('error');
      const errorMessage = error instanceof Error ? error.message : 'Failed to save site details';
      setError(errorMessage);
      toast({ title: 'Error', description: errorMessage, variant: 'destructive' });
    }
  };

  // Image upload handlers
  const handleImageUpload = async (file: File) => {
    if (!selectedCategory) {
      toast({ title: 'Error', description: 'Please select an image category first', variant: 'destructive' });
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast({ title: 'Error', description: 'Please select a valid image file (JPG or PNG)', variant: 'destructive' });
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast({ title: 'Error', description: 'Image size must be less than 10MB', variant: 'destructive' });
      return;
    }

    setIsUploadingImage(true);
    try {
      const imageId = `site-image-${selectedCategory}-${Date.now()}`;
      const formData = new FormData();
      formData.append('file', file);
      formData.append('docId', imageId);

      const response = await fetch(`/api/jobs/${params.jobId}/documents/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to upload image');
      }

      const result = await response.json();
      
      // Add the new image to the list
      const newImage: SiteImage = {
        id: imageId,
        fileName: result.document.fileName,
        originalName: result.document.originalName,
        uploadedAt: result.document.uploadedAt,
        size: result.document.size,
        type: result.document.type,
        category: selectedCategory,
      };
      
      setSiteImages(prev => [...prev, newImage]);
      toast({ title: 'Success', description: 'Image uploaded successfully' });
      
      // Reset category selection
      setSelectedCategory('');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({ 
        title: 'Error', 
        description: error instanceof Error ? error.message : 'Failed to upload image', 
        variant: 'destructive' 
      });
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    try {
      const response = await fetch(`/api/jobs/${params.jobId}/documents/${imageId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete image');
      }

      setSiteImages(prev => prev.filter(img => img.id !== imageId));
      toast({ title: 'Success', description: 'Image deleted successfully' });
    } catch (error) {
      console.error('Error deleting image:', error);
      toast({ 
        title: 'Error', 
        description: error instanceof Error ? error.message : 'Failed to delete image', 
        variant: 'destructive' 
      });
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    if (!selectedCategory) {
      toast({ title: 'Error', description: 'Please select an image category first', variant: 'destructive' });
      return;
    }
    fileInputRef.current?.click();
  };

  const getCategoryLabel = (category: string) => {
    return SITE_IMAGE_CATEGORIES.find(cat => cat.value === category)?.label || 'Other';
  };

  const getCategoryDescription = (category: string) => {
    return SITE_IMAGE_CATEGORIES.find(cat => cat.value === category)?.description || '';
  };

  const groupedImages = siteImages.reduce((groups, image) => {
    const category = image.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(image);
    return groups;
  }, {} as Record<string, SiteImage[]>);

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            className="p-2"
            onClick={() => {
              if (hasUnsavedChanges) {
                const shouldLeave = window.confirm(
                  'You have unsaved changes. Do you want to leave without saving?'
                );
                if (!shouldLeave) return;
              }
              router.back();
            }}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-semibold text-[#323A40]">Site Details</h1>
        </div>
        {hasUnsavedChanges && (
          <Button onClick={handleSave} disabled={saveStatus === 'saving'}>
            {saveStatus === 'saving' ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        )}
      </div>

      {error && saveStatus === 'error' && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error Saving</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {saveStatus === 'success' && (
        <Alert className="mb-6 bg-green-50 border-green-200">
          <Check className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Success</AlertTitle>
          <AlertDescription className="text-green-700">
            Site details saved successfully.
          </AlertDescription>
        </Alert>
      )}

      {/* Render the DetailedSiteDetails component */}
      {isLoading ? (
        <div className="flex justify-center items-center p-10">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        </div>
      ) : siteDetailsData ? (
        <>
          <DetailedSiteDetails
            siteDetails={siteDetailsData as SiteDetails}
            onSiteDetailsChange={handleDataChange}
          />
          
          {/* Site Images Section */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Site Images
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Upload Area */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <div className="space-y-4">
                    <div className="text-center">
                      <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600 mb-4">
                        Upload site images by category (JPG or PNG, max 10MB)
                      </p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                      <div className="w-full sm:w-64">
                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select image category" />
                          </SelectTrigger>
                          <SelectContent>
                            {SITE_IMAGE_CATEGORIES.map((category) => (
                              <SelectItem key={category.value} value={category.value}>
                                <div>
                                  <div className="font-medium">{category.label}</div>
                                  <div className="text-xs text-gray-500">{category.description}</div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      
                      <Button 
                        variant="outline" 
                        onClick={triggerFileInput}
                        disabled={isUploadingImage || !selectedCategory}
                      >
                        {isUploadingImage ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          'Choose Image'
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Images by Category */}
                {Object.keys(groupedImages).length > 0 && (
                  <div className="space-y-6">
                    {Object.entries(groupedImages).map(([category, images]) => (
                      <div key={category} className="space-y-3">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-medium">
                            {getCategoryLabel(category)}
                          </h3>
                          <span className="text-sm text-gray-500">
                            ({images.length} image{images.length !== 1 ? 's' : ''})
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {getCategoryDescription(category)}
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {images.map((image) => (
                            <div key={image.id} className="relative group">
                              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                                <img
                                  src={`/api/jobs/${params.jobId}/documents/${image.id}/download`}
                                  alt={image.originalName}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleDeleteImage(image.id)}
                                  className="h-8 w-8 p-0"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                              <div className="mt-2">
                                <p className="text-sm font-medium truncate">{image.originalName}</p>
                                <p className="text-xs text-gray-500">
                                  {(image.size / 1024 / 1024).toFixed(1)} MB
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {siteImages.length === 0 && !isUploadingImage && (
                  <div className="text-center py-8 text-gray-500">
                    <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No site images uploaded yet</p>
                    <p className="text-sm">Upload images by category to document the site conditions</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error Loading</AlertTitle>
          <AlertDescription>{error || 'Could not load site details.'}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
