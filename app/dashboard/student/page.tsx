// app/dashboard/student/page.tsx (UPDATE the existing file)

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getUpcomingBookings } from '@/features/booking/queries'
import { Button } from '../../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar'
import { BookingCard } from '../../../features/booking/components/booking-card';
import { Calendar, Search } from 'lucide-react'

export default async function StudentDashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch upcoming bookings
  const bookings = await getUpcomingBookings(user.id, 'student')

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
                <BookingCard key={booking.id} booking={booking} userRole="student" />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-gray-300" />
              <p className="mt-4 text-gray-600">No upcoming sessions</p>
              <p className="mt-1 text-sm text-gray-500 mb-4">
                Book a session with a tutor to get started
              </p>
              <Button asChild>
                <Link href="/tutors">
                  <Search className="mr-2 h-4 w-4" />
                  Find a Tutor
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}