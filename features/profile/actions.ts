'use server'


import {createClient} from '@/lib/supabase/server'
import {revalidatePath} from 'next/cache'
import {redirect} from 'next/navigation'
import {profileSchema, type ProfileInput} from './schemas'
import type {AuthResponse} from '@/features/auth/types'


export async function createProfile(input: ProfileInput):Promise<AuthResponse>{
    const supabase = await createClient();
    const { data: {user} ,error: authError} = await supabase.auth.getUser();
    if(authError || !user){
        return{
            success: false,
            error: 'Not authenticated'
        }
    }

    const parsed = profileSchema.safeParse(input);

    if(!parsed.success){
        return{
            success: false,
            error: parsed.error.issues[0].message
        }
    }

    const data = parsed.data

    const {data: existingProfile} = await supabase.from('profiles').select('id').eq('id', user.id).single()

    if(existingProfile) {
        return {
            success: false,
            error: "Profile already exists"

        }
    }

    const profileData = {
        id: user?.id,
        role: data?.role,
        full_name: data.fullname,
        timezone: data.timezone,
        avatar_url: data.avatarUrl || null,
        ...(data.role === "tutor" && { 
            bio: data.bio,
            subjects: data.subjects, 
            hourly_rate: data.hourlyRate
        }) 
    }

    const {error: insertError} = await supabase.from('profiles').insert(profileData)

    if(insertError){
        console.error('Error in creating Profile: ', insertError)
        return{
            success: false,
            error:'Error in creating Profile , please try again'
        }
    }

    revalidatePath('/', 'layout')
    redirect('/dashboard')
}


export async function updateProfile(userId: string, input: Partial<ProfileInput>): Promise<AuthResponse> { 
    const supabase = await createClient();

    const {data: {user}, error: authError } = await  supabase.auth.getUser();

    if(authError || !user || user.id !== userId){
        return{ 
            success: false,
            error: 'Unauthorized'
        }
    }

    const { data: currentProfile } = await supabase.from('profiles').select('role').eq('id', userId).single();

    if(!currentProfile){
        return{
            success: false,
            error: 'Profile not found'
        }
    }


    const updateData : any = {}

    if (input.fullname) updateData.full_name = input.fullname
    if (input.timezone) updateData.timezone = input.timezone
    if (input.avatarUrl !== undefined) updateData.avatar_url = input.avatarUrl || null
    
    if (currentProfile.role === 'tutor' && 'bio' in input) {
        if (input.bio) updateData.bio = input.bio
        if ('subjects' in input && input.subjects) updateData.subjects = input.subjects
        if ('hourlyRate' in input && input.hourlyRate) updateData.hourly_rate = input.hourlyRate
      }


      const {error: updateError} = await supabase.from('profiles').update(updateData).eq('id', userId)

      if(updateError){
        console.error('Profile update Error: ', updateError)
        return{
            success: false,
            error: 'Failed to update profile'
        }
      }

      revalidatePath('/dashboard')

      return{
        success: true,
        data: undefined
      }    
    
}