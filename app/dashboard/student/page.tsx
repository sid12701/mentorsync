// app/dashboard/student/page.tsx

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from "../../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card'
import { Calendar } from 'lucide-react'

export default async function StudentDashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch upcoming bookings
  const { data: bookings } = await supabase
    .from('bookings')
    .select(`
      *,
      tutor:profiles!bookings_tutor_id_fkey(full_name, avatar_url)
    `)
    .eq('student_id', user.id)
    .gte('start_time', new Date().toISOString())
    .order('start_time', { ascending: true })
    .limit(5)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Dashboard</h1>
        <p className="mt-2 text-gray-600">
          View your upcoming sessions and find new tutors
        </p>
      </div>

      {/* Upcoming Sessions */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Sessions</CardTitle>
          <CardDescription>
            Your scheduled tutoring sessions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {bookings && bookings.length > 0 ? (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-4">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium">
                        {booking.tutor?.full_name || 'Tutor'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(booking.start_time).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={booking.meeting_url} target="_blank">
                      Join Meeting
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">No upcoming sessions</p>
              <Button asChild>
                <Link href="/tutors">Find a Tutor</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}