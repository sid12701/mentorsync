// features/profile/schemas.ts

import { z } from 'zod'
import { timezoneSchema } from '@/lib/validations/common'

const baseProfileSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  timezone: z
    .string()
    .min(1, 'Timezone is required')
    .refine(
      (tz) => !tz.includes(' '),
      'Invalid timezone format. Use underscores, not spaces (e.g., America/New_York)'
    ),
  avatarUrl: z.string().url().optional().or(z.literal('')),
})

export const studentProfileSchema = baseProfileSchema.extend({
  role: z.literal('student'),
})

export const tutorProfileSchema = baseProfileSchema.extend({
  role: z.literal('tutor'),
  bio: z
    .string()
    .min(10, 'Bio must be at least 10 characters')
    .max(500, 'Bio must be less than 500 characters'),
  subjects: z
    .array(z.string())
    .min(1, 'Select at least one subject')
    .max(10, 'Maximum 10 subjects'),
  hourlyRate: z
    .number()
    .min(10, 'Rate must be at least $10/hour')
    .max(500, 'Rate must be less than $500/hour'),
})

export const profileSchema = z.discriminatedUnion('role', [
  studentProfileSchema,
  tutorProfileSchema,
])

export type StudentProfileInput = z.infer<typeof studentProfileSchema>
export type TutorProfileInput = z.infer<typeof tutorProfileSchema>
export type ProfileInput = z.infer<typeof profileSchema>