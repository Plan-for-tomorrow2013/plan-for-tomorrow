import { z } from 'zod';

export const FeedbackFormSchema = z.object({
  jobId: z.string().refine((val) => val === 'none' || val.length > 0, {
    message: 'Please select a job or choose "No specific job"',
  }),
  feedbackType: z.enum(['bug', 'feature', 'general', 'other'], {
    required_error: 'Please select a feedback type',
  }),
  rating: z.number().min(1, 'Please provide a rating').max(5, 'Rating must be between 1 and 5'),
  title: z.string().min(1, 'Please provide a title').max(100, 'Title must be less than 100 characters'),
  description: z.string().min(10, 'Please provide a detailed description (minimum 10 characters)').max(1000, 'Description must be less than 1000 characters'),
  email: z.string().email('Please provide a valid email address').optional(),
  allowContact: z.boolean().default(false),
});

export type FeedbackFormData = z.infer<typeof FeedbackFormSchema>;

export interface FeedbackSubmission {
  jobId: string;
  feedbackType: 'bug' | 'feature' | 'general' | 'other';
  rating: number;
  title: string;
  description: string;
  email?: string;
  allowContact: boolean;
  submittedAt: string;
} 