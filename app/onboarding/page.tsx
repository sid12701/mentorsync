// app/onboarding/page.tsx

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { OnboardingFlow } from './onboarding-flow'

export default async function OnboardingPage() {
  const supabase = await createClient()
  
  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // Check if profile already exists
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .single()

  if (profile) {
    // Already onboarded, redirect to dashboard
    redirect('/dashboard')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-2xl space-y-8 rounded-lg border bg-white p-8 shadow-sm">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">Welcome to MentorSync!</h1>
          <p className="mt-2 text-gray-600">
            Let's set up your profile to get started
          </p>
        </div>

        <OnboardingFlow userEmail={user.email!} />
      </div>
    </div>
  )
}