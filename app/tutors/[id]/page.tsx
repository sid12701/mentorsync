// app/tutors/[id]/page.tsx

import { notFound } from 'next/navigation'
import { getTutorById } from '@/features/profile/queries'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar'
import { Badge } from '../../../components/ui/badge'
import { BookingCalendar } from '@/features/booking/components/booking-calendar'
import { MapPin, DollarSign, GraduationCap } from 'lucide-react'

interface TutorProfilePageProps {
  params: Promise< {
    id: string
  }>
}

export default async function TutorProfilePage({ params }: TutorProfilePageProps) {
  const {id} = await params;
  const tutor = await getTutorById(id)

  if (!tutor) {
    notFound()
  }

  const initials = tutor.full_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column - Tutor Info */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <div className="flex flex-col items-center text-center">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={tutor.avatar_url || undefined} />
                    <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
                  </Avatar>
                  <CardTitle className="mt-4 text-2xl">{tutor.full_name}</CardTitle>
                  <CardDescription className="mt-2 flex items-center gap-1 text-xl font-semibold text-green-600">
                    <DollarSign className="h-5 w-5" />
                    {tutor.hourly_rate}/hour
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="mb-2 flex items-center gap-2 font-semibold">
                    <GraduationCap className="h-4 w-4" />
                    Subjects
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {tutor.subjects?.map((subject) => (
                      <Badge key={subject} variant="secondary">
                        {subject}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="mb-2 flex items-center gap-2 font-semibold">
                    <MapPin className="h-4 w-4" />
                    Timezone
                  </h3>
                  <p className="text-sm text-muted-foreground">{tutor.timezone}</p>
                </div>

                <div>
                  <h3 className="mb-2 font-semibold">About</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {tutor.bio}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Booking Calendar */}
          <div className="lg:col-span-2">
            <BookingCalendar
              tutorId={tutor.id}
              tutorName={tutor.full_name}
              hourlyRate={Number(tutor.hourly_rate)}
              tutorTimezone={tutor.timezone}
            />
          </div>
        </div>
      </div>
    </div>
  )
}