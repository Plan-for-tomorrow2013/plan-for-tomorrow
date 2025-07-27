import { z } from 'zod';
import {
  ProjectDataSchema,
  PropertyDataSchema,
  DevelopmentDataSchema,
  PlanningDataSchema,
  EnvironmentalDataSchema,
  FormDataSchema,
} from './schemas';

export type ProjectData = z.infer<typeof ProjectDataSchema>;
export type PropertyData = z.infer<typeof PropertyDataSchema>;
export type DevelopmentData = z.infer<typeof DevelopmentDataSchema>;
export type PlanningData = z.infer<typeof PlanningDataSchema>;
export type EnvironmentalData = z.infer<typeof EnvironmentalDataSchema>;
export type FormData = z.infer<typeof FormDataSchema>;
