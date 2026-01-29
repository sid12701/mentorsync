import {z} from 'zod';

export const emailSchema = z.email({ error: 'Invalid email' }).min(1, { error: "Email is required" })

export const passwordSchema = z.string().min(8, { error: 'Password must be at least 8 characters' }).max(100, { error: 'Password must be less than 64 characters' })

export const uuidSchema = z.uuid("Invalid UUID format")

export const timezoneSchema = z.string().min(1,'Timezone is required')

export const urlSchema = z.url('Invalid URL format');
