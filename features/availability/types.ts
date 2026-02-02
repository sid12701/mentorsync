import type {Database} from '@/types/database';

export type AvailabilityPattern = Database['public']['Tables']['availability_patterns']['Row'] 
export type AvailabilityPatternInsert = Database['public']['Tables']['availability_patterns']['Insert']
export type AvailabilityPatternUpdate = Database['public']['Tables']['availability_patterns']['Update']

export interface TimeSlot { 
    start: string
    end: string
}

export interface AvailabilityPatternWithId extends AvailabilityPattern { 
    id: string
}


export const DAYS_OF_WEEK = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ] as const
  


  export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6


