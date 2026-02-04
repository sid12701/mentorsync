import { createClient } from "@/lib/supabase/server";
import { localTimeToUTC, getDayOfWeekInTimezone, generateTimeSlots, timeRangesOverlap, getDayBoundariesInUTC, parseTimeString } from "@/lib/utils/timezone";
import type {TimeSlot} from './types';


export async function getAvailableSlots (tutorId: string, date:string, durationMinutes: number= 60): Promise<TimeSlot[]> { 
    const supabase = await createClient();
    const {data: tutor , error: tutorError} = await supabase.from('profiles').select('timezone, role').eq('id',tutorId).single()
    if(tutorError || !tutor ){
        console.error('Tutor not found', tutorError)
        return []
    }

    if(tutor.role !== 'tutor'){
        console.error('User is not a tutor')
        return []
    }

    const tutorTimeZone = tutor.timezone
    
    const dateObj = new Date(`${date}T12:00:00Z`)
    const dayOfWeek = getDayOfWeekInTimezone(dateObj, tutorTimeZone)

    const{data: patterns , error: patternsError} = await supabase.from('availability_patterns').select('*').eq('tutor_id',tutorId).eq('day_of_week', dayOfWeek).eq('is_active', true)

    if(patternsError){
        console.error('Error in fetching patterns: ', patternsError)
        return []
    }

    if(!patterns || patterns.length===0 ){
        console.warn('No active patterns found for tutor')
        return []
    }

    const candidateSlots : TimeSlot[] = []

    for(const pattern of patterns ){
        const startTime = parseTimeString(pattern.start_time)
        const endTime = parseTimeString(pattern.end_time)
        
        const startUTC = localTimeToUTC(date,startTime, tutorTimeZone)
        const endUTC = localTimeToUTC( date, endTime, tutorTimeZone)
        
        const slots = generateTimeSlots(startUTC, endUTC, durationMinutes)

        for(const slot of slots){
            candidateSlots.push({
                start: slot.start.toISOString(),
                end: slot.end.toISOString()
            })
        }
    }

    const {start: dayStartUTC , end: dayEndUTC} = getDayBoundariesInUTC(date,tutorTimeZone)

    const {data: bookings, error: bookingsError}= await supabase.from('bookings').select('start_time,end_time').eq('tutor_id',tutorId).neq('status', 'cancelled').gte('start_time',dayStartUTC.toISOString()).lt('start_time', dayEndUTC.toISOString())

    if(bookingsError){
        console.error('Error fetching bookings:', bookingsError)
        return[]
    }

    const availableSlots = candidateSlots.filter((slot)=>{
        const slotStart = new Date(slot.start)
        const slotEnd = new Date(slot.end)

        const hasConflict = bookings?.some((booking)=>{
            const bookingStart = new Date(booking.start_time)
            const bookingEnd = new Date(booking.end_time)
            return timeRangesOverlap(slotStart, slotEnd, bookingStart, bookingEnd)
        })

        return !hasConflict
    })

    const now = new Date()

    const futureSlots = availableSlots.filter((slot)=>{
        return new Date(slot.start) > now
    })

    return futureSlots
}



export async function isSlotAvailable(tutorId: string, startTime: string, endTime: string): Promise<boolean>{
    const supabase = await createClient();

    const start = new Date(startTime)
    const end = new Date(endTime)
    
    const {data: conflicts, error} = await supabase.from('bookings').select('id').eq('tutor_id', tutorId).neq('status', 'cancelled').or(`and(start_time.lt.${end.toISOString()}, end_time.gt.${startTime})`)

    if(error){
        console.error('Error checking slot availability:', error)
        return false
    }

    return !conflicts || conflicts.length === 0

}