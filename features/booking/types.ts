import type {Database} from '@/types/database';


export type Booking = Database['public']['Tables']['bookings']['Row']
export type InsertBooking = Database['public']['Tables']['bookings']['Insert']
export type UpdateBooking = Database['public']['Tables']['bookings']['Update']


export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed'

export interface BookingWithParticipants extends Booking { 
    tutor?: {
        full_name: string
        avatar_url: string| null
    }

    student?:{ 
        full_name: string
        avatar_url: string| null
    }
}

