import { createClient } from "@/lib/supabase/server";


export async function getCurrentUser(){
    const supabase = await createClient();
    const {data: {user}, error } = await supabase.auth.getUser();
    if(error||!user){
        return null
    }

    return user;
}

export async function getUserProfile(userId: string){
    const supabase = await createClient();

    const { data, error} = await supabase.from('profiles').select('*').eq('id', userId).single()

    if(error){
        return null
    }

    return data 
}

export async function hasCompletedProfile (userId:string){
    const  userProfile = await getUserProfile(userId);

    if(!userProfile){
        return false
    }
}