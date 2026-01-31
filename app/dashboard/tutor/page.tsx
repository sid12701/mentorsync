// app/dashboard/tutor/page.tsx

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '../../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card'
import { Calendar, Clock, DollarSign } from 'lucide-react'

export default async function TutorDashboardPage() {
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
      student:profiles!bookings_student_id_fkey(full_name, avatar_url)
    `)
    .eq('tutor_id', user.id)
    .gte('start_time', new Date().toISOString())
    .order('start_time', { ascending: true })
    .limit(5)

  // Calculate total earnings (for completed sessions)
  const { data: completedBookings } = await supabase
    .from('bookings')
    .select('price')
    .eq('tutor_id', user.id)
    .eq('status', 'completed')

  const totalEarnings = completedBookings?.reduce((sum, b) => sum + parseFloat(b.price.toString()), 0) || 0

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tutor Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Manage your availability and upcoming sessions
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/tutor/availability">
            <Clock className="mr-2 h-4 w-4" />
            Manage Availability
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Upcoming Sessions
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bookings?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Earnings
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalEarnings.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completed Sessions
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedBookings?.length || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Sessions */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Sessions</CardTitle>
          <CardDescription>
            Students who have booked time with you
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
                        {booking.student?.full_name || 'Student'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(booking.start_time).toLocaleString()}
                      </p>
                      {booking.student_note && (
                        <p className="text-sm text-gray-500 mt-1">
                          Note: {booking.student_note}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-green-600">
                      ${booking.price}
                    </span>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={booking.meeting_url} target="_blank">
                        Join Meeting
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">No upcoming sessions</p>
              <p className="text-sm text-gray-500">
                Students will appear here after they book time with you
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}