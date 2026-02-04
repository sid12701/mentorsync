'use server';

import {createClient} from '@/lib/supabase/server';
import {revalidatePath} from 'next/cache';
import {availabilityPatternSchema, type AvailabilityPatternInput} from './schemas';
import type {AuthResponse} from "../auth/types";




export async function createPattern(input: AvailabilityPatternInput): Promise<AuthResponse<{id:string}>>{
    const supabase = await createClient();

    const {data: {user}, error: authError} = await supabase.auth.getUser();

    if(authError || !user){
        return{
            success:false,
            error: "Not authenticated"
        }
    }

    const {data : profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();

    if(!profile|| profile.role !== 'tutor'){
        return{ success: false, error: "Only tutors can create availalbility patterns"}
    }

    const parsed = availabilityPatternSchema.safeParse(input);

    if(!parsed.success){
        return{
            success:false,
            error: parsed.error.issues[0].message
        }
    }

    const data = parsed.data;

    const {data: pattern , error: insertError} = await supabase.from('availability_patterns').insert({
        tutor_id: user.id,
        day_of_week: data.dayOfWeek,
        start_time: data.startTime,
        end_time: data.endTime,
        is_active: true
    }).select().single()

    if(insertError){
        console.error('Error creating availability pattern: ', insertError)
        return{
            success:false,
            error: 'Failed to create availability pattern'
        }
    }

    revalidatePath('/dashboard/tutor/availability')

    return{
        success:true,
        data: {id:pattern.id}
    }
}


export async function deletePattern(patternId: string): Promise<AuthResponse>{
    const supabase = await createClient();

    const { data: {user}, error:authError} = await supabase.auth.getUser();
    
    if(authError || !user){
        return{
        success: false,
        error: "Not authenticated"
        }
    }   

    const { data: pattern } = await supabase.from('availability_patterns').select('tutor_id').eq('id', patternId).single()    

    if(!pattern || pattern.tutor_id !== user.id){
        return{ 
            success: false, 
            error: "Pattern not found or unauthorized"
        }
    }

    const { error: deleteError} = await supabase.from('availability_patterns').delete().eq('id', patternId);

    if(deleteError){
        console.error('Error deleting availability pattern: ', deleteError)
            return{
                success: false,
                error: 'Failed to delete availability pattern'
            }
    }

    revalidatePath('/dashboard/tutor/availability')

    return { success: true, data: undefined}
}


export async function togglePattern(patternId: string, isActive: boolean): Promise<AuthResponse>{
    const supabase = await createClient();

    const { data: {user}, error: authError} = await supabase.auth.getUser();

    if(authError || !user){
        return{
            success: false,
            error: "Not authenticated"
        }
    }

    const {data: pattern} = await supabase.from('availability_patterns').select('tutor_id').eq('id', patternId).single()

    if(!pattern || pattern.tutor_id !== user.id){
        return{ 
            success: false,
            error: "Pattern not found or unauthorized"
        }
    }

    const { error: updateError } = await supabase
    .from('availability_patterns')
    .update({ is_active: isActive })
    .eq('id', patternId)

  if (updateError) {
    console.error('Error updating pattern:', updateError)
    return {
      success: false,
      error: 'Failed to update pattern',
    }
  }

  revalidatePath('/dashboard/tutor/availability')

  return { success: true, data: undefined }

} 


