// features/availability/get-slots.ts

import { createClient } from '@/lib/supabase/server'
import {
  localTimeToUTC,
  getDayOfWeekInTimezone,
  generateTimeSlots,
  timeRangesOverlap,
  getDayBoundariesInUTC,
  parseTimeString,
} from '@/lib/utils/timezone'
import type { TimeSlot } from './types'

export async function getAvailableSlots(
  tutorId: string,
  date: string,
  durationMinutes: number = 60
): Promise<TimeSlot[]> {
  const supabase = await createClient()

  // Validate date format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    console.error('Invalid date format:', date)
    return []
  }

  // Step 1: Fetch tutor profile to get timezone
  const { data: tutor, error: tutorError } = await supabase
    .from('profiles')
    .select('timezone, role')
    .eq('id', tutorId)
    .single()

  if (tutorError || !tutor) {
    console.error('Tutor not found:', tutorError)
    return []
  }

  if (tutor.role !== 'tutor') {
    console.error('User is not a tutor')
    return []
  }

  const tutorTimezone = tutor.timezone

  // Validate timezone
  if (!tutorTimezone) {
    console.error('Tutor has no timezone set')
    return []
  }

  // Step 2: Determine day of week in tutor's timezone
  // Create a reliable UTC date at noon to avoid timezone edge cases
  const dateObj = new Date(`${date}T12:00:00.000Z`)
  
  // Validate the date object
  if (isNaN(dateObj.getTime())) {
    console.error('Invalid date created from:', date)
    return []
  }

  console.log('Getting day of week for:', {
    date,
    dateObj: dateObj.toISOString(),
    timezone: tutorTimezone,
  })

  const dayOfWeek = getDayOfWeekInTimezone(dateObj, tutorTimezone)
  
  // Validate day of week
  if (isNaN(dayOfWeek)) {
    console.error('Day of week calculation failed for date:', date)
    return []
  }

  console.log('Day of week:', dayOfWeek)

  // Step 3: Fetch availability patterns for this day of week
  const { data: patterns, error: patternsError } = await supabase
    .from('availability_patterns')
    .select('*')
    .eq('tutor_id', tutorId)
    .eq('day_of_week', dayOfWeek)
    .eq('is_active', true)

  if (patternsError) {
    console.error('Error fetching patterns:', patternsError)
    return []
  }

  if (!patterns || patterns.length === 0) {
    console.log('No active patterns found for tutor on day:', dayOfWeek)
    return []
  }

  console.log(`Found ${patterns.length} patterns for day ${dayOfWeek}`)

  // Step 4: Generate candidate slots from all patterns
  const candidateSlots: TimeSlot[] = []

  for (const pattern of patterns) {
    const startTime = parseTimeString(pattern.start_time)
    const endTime = parseTimeString(pattern.end_time)

    const startUTC = localTimeToUTC(date, startTime, tutorTimezone)
    const endUTC = localTimeToUTC(date, endTime, tutorTimezone)

    const slots = generateTimeSlots(startUTC, endUTC, durationMinutes)

    for (const slot of slots) {
      candidateSlots.push({
        start: slot.start.toISOString(),
        end: slot.end.toISOString(),
      })
    }
  }

  console.log(`Generated ${candidateSlots.length} candidate slots`)

  // Step 5: Fetch existing bookings for this date range
  const { start: dayStartUTC, end: dayEndUTC } = getDayBoundariesInUTC(date, tutorTimezone)

  const { data: bookings, error: bookingsError } = await supabase
    .from('bookings')
    .select('start_time, end_time')
    .eq('tutor_id', tutorId)
    .neq('status', 'cancelled')
    .gte('start_time', dayStartUTC.toISOString())
    .lte('start_time', dayEndUTC.toISOString())

  if (bookingsError) {
    console.error('Error fetching bookings:', bookingsError)
    return []
  }

  // Step 6: Filter out slots that overlap with existing bookings
  const availableSlots = candidateSlots.filter((slot) => {
    const slotStart = new Date(slot.start)
    const slotEnd = new Date(slot.end)

    const hasConflict = bookings?.some((booking) => {
      const bookingStart = new Date(booking.start_time)
      const bookingEnd = new Date(booking.end_time)
      return timeRangesOverlap(slotStart, slotEnd, bookingStart, bookingEnd)
    })

    return !hasConflict
  })

  // Step 7: Filter out past slots
  const now = new Date()
  const futureSlots = availableSlots.filter((slot) => {
    return new Date(slot.start) > now
  })

  console.log(`Returning ${futureSlots.length} available slots`)

  return futureSlots
}

export async function isSlotAvailable(
  tutorId: string,
  startTime: string,
  endTime: string
): Promise<boolean> {
  const supabase = await createClient()

  const start = new Date(startTime)
  const end = new Date(endTime)

  const { data: conflicts, error } = await supabase
    .from('bookings')
    .select('id')
    .eq('tutor_id', tutorId)
    .neq('status', 'cancelled')
    .or(`and(start_time.lt.${end.toISOString()},end_time.gt.${startTime})`)

  if (error) {
    console.error('Error checking slot availability:', error)
    return false
  }

  return !conflicts || conflicts.length === 0
}