// lib/utils/timezone.ts

import { format, parse, addMinutes, startOfDay, endOfDay } from 'date-fns'
import { fromZonedTime, toZonedTime } from 'date-fns-tz'

export function localTimeToUTC(
  date: string,
  time: string,
  timezone: string
): Date {
  const dateTimeString = `${date}T${time}:00`
  const utcDate = fromZonedTime(dateTimeString, timezone)
  return utcDate
}

export function utcToLocalTime(utcDate: Date, timezone: string): Date {
  return toZonedTime(utcDate, timezone)
}

export function formatInTimezone(
  utcDate: Date,
  timezone: string,
  formatStr: string = 'PPpp'
): string {
  const zonedDate = toZonedTime(utcDate, timezone)
  return format(zonedDate, formatStr)
}

export function getDayOfWeekInTimezone(date: Date, timezone: string): number {
  // ADDED: Validate inputs
  if (!date || isNaN(date.getTime())) {
    console.error('getDayOfWeekInTimezone: Invalid date object', date)
    return NaN
  }
  
  if (!timezone || typeof timezone !== 'string') {
    console.error('getDayOfWeekInTimezone: Invalid timezone', timezone)
    return NaN
  }

  try {
    const zonedDate = toZonedTime(date, timezone)
    
    // ADDED: Validate the result
    if (isNaN(zonedDate.getTime())) {
      console.error('getDayOfWeekInTimezone: toZonedTime returned invalid date', {
        inputDate: date.toISOString(),
        timezone,
      })
      return NaN
    }
    
    return zonedDate.getDay()
  } catch (error) {
    console.error('getDayOfWeekInTimezone: Error during conversion', {
      date: date.toISOString(),
      timezone,
      error,
    })
    return NaN
  }
}

export function generateTimeSlots(
  startTime: Date,
  endTime: Date,
  durationMinutes: number
): Array<{ start: Date; end: Date }> {
  const slots: Array<{ start: Date; end: Date }> = []
  
  const startMs = startTime.getTime()
  const endMs = endTime.getTime()
  const durationMs = durationMinutes * 60 * 1000
  
  let currentStartMs = startMs
  
  while (currentStartMs < endMs) {
    const currentEndMs = currentStartMs + durationMs
    
    if (currentEndMs <= endMs) {
      slots.push({
        start: new Date(currentStartMs),
        end: new Date(currentEndMs),
      })
    }
    
    currentStartMs = currentEndMs
  }

  return slots
}

export function timeRangesOverlap(
  start1: Date,
  end1: Date,
  start2: Date,
  end2: Date
): boolean {
  const s1 = start1.getTime()
  const e1 = end1.getTime()
  const s2 = start2.getTime()
  const e2 = end2.getTime()
  
  return s1 < e2 && s2 < e1
}

export function getDayBoundariesInUTC(
  date: string,
  timezone: string
): { start: Date; end: Date } {
  const startOfDayStr = `${date}T00:00:00`
  const endOfDayStr = `${date}T23:59:59.999`
  
  const startUTC = fromZonedTime(startOfDayStr, timezone)
  const endUTC = fromZonedTime(endOfDayStr, timezone)
  
  return { start: startUTC, end: endUTC }
}

export function parseTimeString(timeStr: string): string {
  const parts = timeStr.split(':')
  return `${parts[0]}:${parts[1]}`
}

export function getCurrentDateInTimezone(timezone: string): string {
  const now = new Date()
  const zonedNow = toZonedTime(now, timezone)
  return format(zonedNow, 'yyyy-MM-dd')
}


export function normalizeTimezone(timezone: string): string {
    if (!timezone) return 'UTC'
    
    // Replace spaces with underscores
    let normalized = timezone.replace(/\s+/g, '_')
    
    // Common fixes
    const fixes: Record<string, string> = {
      'America/New York': 'America/New_York',
      'America/Los Angeles': 'America/Los_Angeles',
      'America/Mexico City': 'America/Mexico_City',
      'Asia/Hong Kong': 'Asia/Hong_Kong',
      'Australia/Lord Howe': 'Australia/Lord_Howe',
    }
    
    // Check if we have a known fix
    if (fixes[timezone]) {
      normalized = fixes[timezone]
    }
    
    return normalized
  }
  
  /**
   * Validate if a timezone string is valid.
   */
  export function isValidTimezone(timezone: string): boolean {
    try {
      // Try to format a date with this timezone
      Intl.DateTimeFormat('en-US', { timeZone: timezone })
      return true
    } catch (e) {
      return false
    }
  }
  