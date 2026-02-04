// features/booking/components/booking-card.tsx

'use client'

import { useState } from 'react'
import { cancelBooking } from '../actions'
import { Card, CardContent } from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar'
import { Badge } from '../../../components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../../../components/ui/alert-dialog'
import { format } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'
import { Calendar, Clock, Video, XCircle, DollarSign } from 'lucide-react'
import type { BookingWithParticipants } from '../types'

interface BookingCardProps {
  booking: BookingWithParticipants
  userRole: 'student' | 'tutor'
}

export function BookingCard({ booking, userRole }: BookingCardProps) {
  const [isCancelling, setIsCancelling] = useState(false)

  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone

  const startTime = new Date(booking.start_time)
  const endTime = new Date(booking.end_time)
  const startLocal = toZonedTime(startTime, userTimezone)
  const endLocal = toZonedTime(endTime, userTimezone)

  const otherParty = userRole === 'student' ? booking.tutor : booking.student
  const otherPartyName = otherParty?.full_name || 'Unknown'
  const otherPartyAvatar = otherParty?.avatar_url

  const initials = otherPartyName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  async function handleCancel() {
    setIsCancelling(true)
    const result = await cancelBooking({ bookingId: booking.id })

    if (!result.success) {
      alert(result.error)
      setIsCancelling(false)
    } else {
      window.location.reload()
    }
  }

  const isPast = endTime < new Date()
  const isCancelled = booking.status === 'cancelled'

  return (
    <Card className={isCancelled ? 'opacity-60' : ''}>
      <CardContent className="flex items-center justify-between p-6">
        <div className="flex items-center gap-4 flex-1">
          <Avatar className="h-12 w-12">
            <AvatarImage src={otherPartyAvatar || undefined} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <p className="font-semibold">{otherPartyName}</p>
              {isCancelled && (
                <Badge variant="destructive">Cancelled</Badge>
              )}
              {isPast && !isCancelled && (
                <Badge variant="secondary">Completed</Badge>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {format(startLocal, 'MMM d, yyyy')}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {format(startLocal, 'h:mm a')} - {format(endLocal, 'h:mm a')}
              </span>
              <span className="flex items-center gap-1">
                <DollarSign className="h-3 w-3" />
                ${Number(booking.price).toFixed(2)}
              </span>
            </div>

            {booking.student_note && userRole === 'tutor' && (
              <p className="text-sm text-muted-foreground italic">
                Note: {booking.student_note}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isCancelled && !isPast && (
            <>
              <Button variant="outline" size="sm" asChild>
                <a href={booking.meeting_url} target="_blank" rel="noopener noreferrer">
                  <Video className="mr-2 h-4 w-4" />
                  Join Meeting
                </a>
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm" disabled={isCancelling}>
                    <XCircle className="h-4 w-4 text-red-600" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Cancel Booking?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to cancel this session? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Keep Booking</AlertDialogCancel>
                    <AlertDialogAction onClick={handleCancel} className="bg-red-600 hover:bg-red-700">
                      {isCancelling ? 'Cancelling...' : 'Yes, Cancel'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}

          {isCancelled && (
            <p className="text-sm text-muted-foreground">
              Cancelled
            </p>
          )}

          {isPast && !isCancelled && (
            <Badge variant="outline">Completed</Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}