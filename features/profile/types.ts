import type { Database } from '@/types/database'

export type Profile = Database['public']['Tables']['profiles']['Row']
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export type UserRole = 'student' | 'tutor'

export interface TutorProfile extends Profile {
  role: 'tutor'
  bio: string
  subjects: string[]
  hourly_rate: number
}

export interface StudentProfile extends Profile {
  role: 'student'
}