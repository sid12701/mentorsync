import {createClient} from '@/lib/supabase/server';
import type { Booking, BookingWithParticipants} from './types';

export async function getBookingsByUser(userId: string, role: 'student'|'tutor'): Promise<BookingWithParticipants[]>{
    const supabase = await createClient();
    
    const query = supabase.from('bookings').select(`*, tutor:profiles!bookings_tutor_id_fkey(full_name, avatar_url), student:profiles!bookings_student_id_fkey(full_name, avatar_url)`).order('start_time',{ascending:true})

    if(role==='student'){
        query.eq('student_id', userId)
    }
    else{
        query.eq('tutor_id', userId)
    }

    const {data, error}= await query;

    if(error){
            console.error('Error fetching bookings: ', error)
            return []
    }

    return data || []
}


export async function getUpcomingBookings(userId: string, role: 'student'|'tutor'): Promise<BookingWithParticipants[]>{
    const supabase = await createClient();
    const now = new Date().toISOString()

    const query = supabase.from('bookings').select(`*,      tutor:profiles!bookings_tutor_id_fkey(full_name, avatar_url),
      student:profiles!bookings_student_id_fkey(full_name, avatar_url)
 `).gte('start_time', now).neq('status', 'cancelled').order('start_time', {ascending:true}).limit(10)

 if(role==='student'){
    query.eq('student_id', userId)
 }
 else{
    query.eq('tutor_id', userId)
 }

 const {data , error} = await query

 if(error){
    console.error('Error Fetching upcoming bookings')
    return []
 }

 return data||[]

}


export async function getBookingById(bookingId: string):Promise<BookingWithParticipants|null>{
    const supabase = await createClient();
    
    const {data, error} = await supabase.from('bookings').select(`*,       tutor:profiles!bookings_tutor_id_fkey(full_name, avatar_url),
      student:profiles!bookings_student_id_fkey(full_name, avatar_url)
`).eq('id', bookingId).single()

if(error){
    console.error("Error fetching booking: ", error)
    return null
    }
    return data
}




