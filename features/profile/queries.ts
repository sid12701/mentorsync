import {createClient} from '@/lib/supabase/server';
import type { Profile } from './types'
import { getUserProfile } from '../auth/queries';


export async function getAllTutors(): Promise<Profile[]>{
    const supabase = await createClient();

    const{data, error} = await supabase.from('profiles').select('*').eq('role', 'tutor').is('deleted_at', null).order('created_at', {ascending: false})

    if(error){
        console.error('Error fetching tutors: ', error)
        return[]
    }

    return data||[]
}

export async function getTutorById(tutorId: string): Promise<Profile|null>{
    const supabase = await createClient();

    const{ data, error} = await supabase.from('profiles').select('*').eq('id',tutorId).eq('role','tutor').single()
    if(error){
        console.error('Error fetching tutor: ' , error)
        return null
    }

    return data 
}


export async function getProfileById (userId: string): Promise<Profile|null>{
    const supabase = await createClient();
    const {data,error} = await supabase.from('profiles').select('*').eq('id', userId).is('deleted_at', null).single()

    if(error){
        console.error('Error fetching profile: ', error)
        return null
    }

    return data
}


export async function searchTutorsBySubject(subject: string): Promise<Profile[]>{
    const supabase = await createClient()

    const {data, error } = await supabase.from('profiles').select('*').eq('role','tutor').contains('subjects',[subject]).is('deleted_at', null).order('crated_at', {ascending: false})

    if(error){
        console.error('Error seraching tutors: ', error)
        return[]
    }

    return data || []
}

export async function getCurrentUserProfile(): Promise<Profile |null> {
    const supabase = await createClient()

    const { data: {user} } = await supabase.auth.getUser()

    if(!user){
        return null
    }

    return getProfileById(user.id)
}

export async function hasCompletedProfile( userId: string) {
    const profile = await getUserProfile(userId)
    return !!profile
}



