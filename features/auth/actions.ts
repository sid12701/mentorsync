'use server'

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { loginSchema, signUpSchema, type LoginInput, type SignUpInput } from './schemas';
import type { AuthResponse } from './types'
import { redirect } from 'next/navigation';

export async function signUp(input: SignUpInput): Promise<AuthResponse> {
    const supabase = await createClient();
    const parsed = signUpSchema.safeParse(input)
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0].message
      }
    }


    const {data, error} = await supabase.auth.signUp({
        email: parsed.data.email,
        password: parsed.data.password,
        options: {
            emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/onboarding`
        }
    })

    if(error){
        return{
            success: false,
            error:error.message 
        }
    }

    if(!data.user){
        return{ 
            success: false,
            error: 'Failed to create'
        }
    }

    revalidatePath('/', 'layout')
    redirect('/onboarding')
}


export async function signIn(input: LoginInput): Promise<AuthResponse>{
    const supabase = await createClient();
    const parsed = loginSchema.safeParse(input)

    if(!parsed.success){
        return{
            success:false,
            error: parsed.error.issues[0].message
        }
    }
    const {error} = await supabase.auth.signInWithPassword({
        email: parsed.data.email,
        password: parsed.data.password,
    })

    if(error){
        return{
            success: false,
            error: 'Invalid email or password'
        }
    }

    const { data: {user}} = await supabase.auth.getUser();

    if(!user){
        return{
            success: false,
            error: 'Authentication failed'
        }
    }

    const {data: profile } = await supabase.from('profiles').select('id').eq('id',user.id).single()
    
    revalidatePath('/', 'layout')

    if(!profile){
        redirect('/onboarding')
    }else{
        redirect('/dashboard')
    }
}


export async function signOut(): Promise<void>{
    const supabase = await createClient()
  
    await supabase.auth.signOut()
    
    revalidatePath('/', 'layout')
    redirect('/')
  
}