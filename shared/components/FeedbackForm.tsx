'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@shared/components/ui/card';
import { Input } from '@shared/components/ui/input';
import { Label } from '@shared/components/ui/label';
import { Textarea } from '@shared/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@shared/components/ui/select';
import { Checkbox } from '@shared/components/ui/checkbox';
import { Alert, AlertDescription } from '@shared/components/ui/alert';
import { toast } from '@shared/components/ui/use-toast';
import { Star, Send, AlertCircle } from 'lucide-react';
import { FeedbackFormSchema, type FeedbackFormData } from '@shared/types/feedback';
import { useJobs } from '@shared/hooks/useJobs';
import { Job } from '@shared/types/jobs';

interface FeedbackFormProps {
  onSubmit?: (data: FeedbackFormData) => Promise<void>;
  className?: string;
  title?: string;
  description?: string;
  showJobSelection?: boolean;
  defaultJobId?: string;
}

export function FeedbackForm({
  onSubmit,
  className = '',
  title = 'Feedback',
  description = 'Help us improve by sharing your feedback',
  showJobSelection = true,
  defaultJobId,
}: FeedbackFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const { jobs, isLoading: isLoadingJobs } = useJobs();

  const form = useForm<FeedbackFormData>({
    resolver: zodResolver(FeedbackFormSchema),
    defaultValues: {
      jobId: defaultJobId || 'none',
      feedbackType: undefined,
      rating: 0,
      title: '',
      description: '',
      email: '',
      allowContact: false,
    },
  });

  const handleSubmit = async (data: FeedbackFormData) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      // Update the form data with the current rating
      const formData = { ...data, rating };
      
      if (onSubmit) {
        await onSubmit(formData);
      } else {
        // Default submission behavior - you can customize this
        console.log('Feedback submitted:', formData);
        toast({
          title: 'Feedback Submitted',
          description: 'Thank you for your feedback! We appreciate your input.',
        });
      }

      // Reset form
      form.reset();
      setRating(0);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit feedback. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, index) => {
      const starValue = index + 1;
      const isFilled = starValue <= (hoveredRating || rating);
      
      return (
        <button
          key={starValue}
          type="button"
          className={`p-1 transition-colors ${
            isFilled ? 'text-yellow-400' : 'text-gray-300'
          } hover:text-yellow-400`}
          onClick={() => {
            setRating(starValue);
            form.setValue('rating', starValue);
          }}
          onMouseEnter={() => setHoveredRating(starValue)}
          onMouseLeave={() => setHoveredRating(0)}
        >
          <Star className="h-6 w-6 fill-current" />
        </button>
      );
    });
  };

  const getFeedbackTypeDescription = (type: string) => {
    switch (type) {
      case 'bug':
        return 'Report a bug or technical issue';
      case 'feature':
        return 'Suggest a new feature or improvement';
      case 'general':
        return 'General feedback about the application';
      case 'other':
        return 'Other feedback or comments';
      default:
        return '';
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Job Selection */}
          {showJobSelection && (
            <div className="space-y-2">
              <Label htmlFor="jobId">Select Job (Optional)</Label>
              <Select
                value={form.watch('jobId')}
                onValueChange={(value) => form.setValue('jobId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a job to provide feedback about" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No specific job</SelectItem>
                  {isLoadingJobs ? (
                    <SelectItem value="loading" disabled>
                      Loading jobs...
                    </SelectItem>
                  ) : (
                    jobs?.map((job: Job) => (
                      <SelectItem key={job.id} value={job.id}>
                        {job.address}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {form.formState.errors.jobId && (
                <p className="text-sm text-red-600">{form.formState.errors.jobId.message}</p>
              )}
            </div>
          )}

          {/* Feedback Type */}
          <div className="space-y-2">
            <Label htmlFor="feedbackType">Feedback Type *</Label>
            <Select
              value={form.watch('feedbackType')}
              onValueChange={(value) => form.setValue('feedbackType', value as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select feedback type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bug">Bug Report</SelectItem>
                <SelectItem value="feature">Feature Request</SelectItem>
                <SelectItem value="general">General Feedback</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            {form.watch('feedbackType') && (
              <p className="text-sm text-gray-600">
                {getFeedbackTypeDescription(form.watch('feedbackType')!)}
              </p>
            )}
            {form.formState.errors.feedbackType && (
              <p className="text-sm text-red-600">{form.formState.errors.feedbackType.message}</p>
            )}
          </div>

          {/* Rating */}
          <div className="space-y-2">
            <Label>Rating *</Label>
            <div className="flex items-center gap-1">
              {renderStars()}
              <span className="ml-2 text-sm text-gray-600">
                {rating > 0 ? `${rating}/5` : 'Click to rate'}
              </span>
            </div>
            {form.formState.errors.rating && (
              <p className="text-sm text-red-600">{form.formState.errors.rating.message}</p>
            )}
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="Brief summary of your feedback"
              {...form.register('title')}
            />
            {form.formState.errors.title && (
              <p className="text-sm text-red-600">{form.formState.errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Please provide detailed feedback..."
              rows={4}
              {...form.register('description')}
            />
            <div className="flex justify-between text-sm text-gray-500">
              <span>Minimum 10 characters</span>
              <span>{form.watch('description')?.length || 0}/1000</span>
            </div>
            {form.formState.errors.description && (
              <p className="text-sm text-red-600">{form.formState.errors.description.message}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email (Optional)</Label>
            <Input
              id="email"
              type="email"
              placeholder="your.email@example.com"
              {...form.register('email')}
            />
            {form.formState.errors.email && (
              <p className="text-sm text-red-600">{form.formState.errors.email.message}</p>
            )}
          </div>

          {/* Allow Contact */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="allowContact"
              checked={form.watch('allowContact')}
              onCheckedChange={(checked) => form.setValue('allowContact', checked as boolean)}
            />
            <Label htmlFor="allowContact" className="text-sm">
              Allow us to contact you for follow-up questions
            </Label>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || rating === 0}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Submit Feedback
              </>
            )}
          </Button>

          {/* Help Text */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Your feedback helps us improve the application. We appreciate your input!
            </AlertDescription>
          </Alert>
        </form>
      </CardContent>
    </Card>
  );
} 