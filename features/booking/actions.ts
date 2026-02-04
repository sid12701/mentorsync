'use server'

import {createClient} from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { isSlotAvailable } from '../availability/getSlots';
import { generateMeetingUrl , calculateDurationHours } from './utils';
import { createBookingSchema, cancelBookingSchema, type CreateBookingInput, type CancelBookingInput } from './schemas';
import type { AuthResponse } from '@/features/auth/types';
import type {Booking} from './types';
import { fa } from 'zod/v4/locales';

export async function bookSlot(input: CreateBookingInput): Promise<AuthResponse<{booking:Booking}>>{
    const supabase = await createClient();
    const {data: {user}, error: authError} = await supabase.auth.getUser()

    if(authError||!user){
        return{ 
            success: false,
            error: 'Not authenticated'
        }
    }

    const {data: profile} = await supabase.from('profiles').select('role').eq('id', user.id).single()

    if(!profile || profile.role !== 'student'){
        return{ 
            success: false,
            error: 'Only students can book sessions'
        }
    }

    const parsed = createBookingSchema.safeParse(input)
    if(!parsed.success){
        return{
            success: false, 
            error: parsed.error.issues[0].message
        }
    }

    const data = parsed.data

    const{data: tutor, error: tutorError} = await supabase.from('profiles').select('hourly_rate, role').eq('id', data.tutorId).single()

    if(!tutor|| tutorError|| tutor.role!=='tutor'){
        return{
            success: false,
            error: 'Tutor not found'
        }
    }

    const durationHours = calculateDurationHours(data.startTime, data.endTime)
    const actualPrice = Number(tutor.hourly_rate) * durationHours

    if(Math.abs(actualPrice - data.expectedPrice)> 0.01){
        return{ 
            success: false,
            error: `Price has changed. New price is: $${actualPrice.toFixed(2)}. Please refresh and try again`
        }
    }

    const slotAvailable = await isSlotAvailable(data.tutorId, data.startTime, data.endTime)
    
        if(!slotAvailable){
            return{
                success: false,
                error: 'Slot no longer available'
            }
        }

        const meetingUrl = generateMeetingUrl()

        const { data: booking, error: insertError} = await supabase.from('bookings').insert({
            tutor_id: data.tutorId,
            student_id: user.id,
            start_time: data.startTime,
            end_time: data.endTime,
            status: 'pending',
            price: actualPrice,
            meeting_url: meetingUrl,
            student_note: data.note || null
        }).select().single()

        if(insertError){
            console.error('Booking insert error: ', insertError)
            if(insertError.code==='23P01'){
                return{
                    success:false,
                    error: 'Slot no longer available'
                }
            }

            return{
                success: false,
                error: 'Failed to create booking. Please try again'
            }
        }
        revalidatePath('/dashboard')
        revalidatePath(`/tutors/${data.tutorId}`)

        return{
            success: true,
            data:{ booking}
        }
 }

 export async function cancelBooking(input: CancelBookingInput): Promise<AuthResponse>{
    const supabase = await createClient()
    const{data: {user}, error: authError} = await supabase.auth.getUser();

    if(authError||!user){
        return{
            success: false, error: 'Not authenticated'
        }
    }

    const parsed = cancelBookingSchema.safeParse(input)
    if(!parsed.success){
        return{
            success:false,
            error: parsed.error.issues[0].message
        }
    }

    const data = parsed.data

    const {data: booking, error: fetchError} = await supabase.from('bookings').select('*').eq('id', data.bookingId).single()

    if(fetchError||!booking){
        return{
            success:false,
            error: 'Booking not founds'
        }
    }

    if(booking.tutor_id!==user.id && booking.student_id!==user.id){
        return{ 
            success: false,
            error: 'Unauthorized'
        }   
    }

    if(booking.status==='cancelled'){
        return{
            success: false,
            error: 'Booking is already cancelled'
        }
    }

    const {error: updateError} = await supabase.from('bookings').update({
        status:'cancelled',
        cancelled_at: new Date().toISOString(),
        cancelled_by: user.id,
        cancellation_reason: data.reason||null
    }).eq('id', data.bookingId)

    if(updateError){
        console.error('Cancelleation error: ', updateError)
        return{
            success: false,
            error: 'Failed to cancel booking'
        }
    }  

    revalidatePath('/dashboard')

    return{
        success: true, 
        data:undefined
    }

    }


