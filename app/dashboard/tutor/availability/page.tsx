// app/dashboard/tutor/availability/page.tsx

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getPatternsByTutor } from '@/features/availability/queries'
import { PatternForm } from '@/features/availability/components/pattern-form'
import { PatternList } from '@/features/availability/components/pattern-list'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card'

export default async function TutorAvailabilityPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Verify user is a tutor
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'tutor') {
    redirect('/dashboard')
  }

  // Fetch availability patterns
  const patterns = await getPatternsByTutor(user.id)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Manage Availability</h1>
        <p className="mt-2 text-gray-600">
          Set your weekly schedule so students can book sessions with you
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Add Pattern Form */}
        <Card>
          <CardHeader>
            <CardTitle>Add Availability</CardTitle>
            <CardDescription>
              Define when you're available for tutoring sessions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PatternForm />
          </CardContent>
        </Card>

        {/* Current Patterns */}
        <Card>
          <CardHeader>
            <CardTitle>Your Weekly Schedule</CardTitle>
            <CardDescription>
              All times shown in your local timezone ({Intl.DateTimeFormat().resolvedOptions().timeZone})
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PatternList patterns={patterns} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}