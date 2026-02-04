// features/booking/components/booking-calendar.tsx

'use client'

import { useState, useEffect } from 'react'
import { Calendar } from '../../../components/ui/calendar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'
import { Skeleton } from '../../../components/ui/skeleton'
import { Badge } from '../../../components/ui/badge'
import { BookingDialog } from './booking-dialog'
import { format } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'
import { Calendar as CalendarIcon, Clock } from 'lucide-react'
import type { TimeSlot } from '@/features/availability/types'

interface BookingCalendarProps {
  tutorId: string
  tutorName: string
  hourlyRate: number
  tutorTimezone: string
}

export function BookingCalendar({ tutorId, tutorName, hourlyRate, tutorTimezone }: BookingCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [slots, setSlots] = useState<TimeSlot[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone

  // Fetch available slots when date changes
  useEffect(() => {
    if (!selectedDate) return

    async function fetchSlots() {
      setIsLoading(true)
      
      const dateStr = format(selectedDate!, 'yyyy-MM-dd')
      
      try {
        const response = await fetch(
          `/api/availability?tutorId=${tutorId}&date=${dateStr}&duration=60`
        )
        
        if (response.ok) {
          const data = await response.json()
          setSlots(data.slots || [])
        } else {
          setSlots([])
        }
      } catch (error) {
        console.error('Error fetching slots:', error)
        setSlots([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchSlots()
  }, [selectedDate, tutorId])

  function handleSlotClick(slot: TimeSlot) {
    setSelectedSlot(slot)
    setIsDialogOpen(true)
  }

  function handleBookingComplete() {
    setIsDialogOpen(false)
    setSelectedSlot(null)
    // Refresh slots
    if (selectedDate) {
      const dateStr = format(selectedDate, 'yyyy-MM-dd')
      fetch(`/api/availability?tutorId=${tutorId}&date=${dateStr}&duration=60`)
        .then(res => res.json())
        .then(data => setSlots(data.slots || []))
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Select a Date</CardTitle>
          <CardDescription>
            Choose a date to see available time slots
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            disabled={(date) => {
              // Disable past dates
              const today = new Date()
              today.setHours(0, 0, 0, 0)
              return date < today
            }}
            className="rounded-md border"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Available Time Slots
          </CardTitle>
          <CardDescription>
            {selectedDate ? (
              <>
                {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                <br />
                <span className="text-xs">
                  Times shown in your timezone: {userTimezone}
                </span>
              </>
            ) : (
              'Select a date to view available slots'
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : slots.length > 0 ? (
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {slots.map((slot, index) => {
                const startTime = new Date(slot.start)
                const endTime = new Date(slot.end)
                
                // Convert to user's timezone for display
                const startLocal = toZonedTime(startTime, userTimezone)
                const endLocal = toZonedTime(endTime, userTimezone)
                
                const timeLabel = `${format(startLocal, 'h:mm a')} - ${format(endLocal, 'h:mm a')}`
                
                return (
                  <Button
                    key={index}
                    variant="outline"
                    className="h-auto flex-col items-start gap-1 py-3"
                    onClick={() => handleSlotClick(slot)}
                  >
                    <span className="font-semibold">{timeLabel}</span>
                    <span className="text-xs text-muted-foreground">
                      ${hourlyRate} / hour
                    </span>
                  </Button>
                )
              })}
            </div>
          ) : (
            <div className="py-12 text-center text-gray-500">
              <CalendarIcon className="mx-auto h-12 w-12 text-gray-300" />
              <p className="mt-4">No available slots for this date</p>
              <p className="mt-1 text-sm">
                Try selecting a different date
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedSlot && (
        <BookingDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          tutorId={tutorId}
          tutorName={tutorName}
          slot={selectedSlot}
          hourlyRate={hourlyRate}
          onSuccess={handleBookingComplete}
        />
      )}
    </div>
  )
}