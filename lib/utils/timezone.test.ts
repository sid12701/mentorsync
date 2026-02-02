// lib/utils/timezone.test.ts

import { describe, it, expect } from '@jest/globals'
import {
  localTimeToUTC,
  utcToLocalTime,
  getDayOfWeekInTimezone,
  generateTimeSlots,
  timeRangesOverlap,
  getDayBoundariesInUTC,
  parseTimeString,
} from './timezone'

describe('Timezone Utilities', () => {
  describe('localTimeToUTC', () => {
    it('converts New York time to UTC correctly in winter (EST)', () => {
      // January 15, 2024 9:00 AM EST = 2:00 PM UTC
      const result = localTimeToUTC('2024-01-15', '09:00', 'America/New_York')
      expect(result.toISOString()).toBe('2024-01-15T14:00:00.000Z')
    })

    it('converts New York time to UTC correctly in summer (EDT)', () => {
      // June 15, 2024 9:00 AM EDT = 1:00 PM UTC (DST active)
      const result = localTimeToUTC('2024-06-15', '09:00', 'America/New_York')
      expect(result.toISOString()).toBe('2024-06-15T13:00:00.000Z')
    })

    it('handles timezone crossing midnight', () => {
      // 11:00 PM in New York
      const result = localTimeToUTC('2024-01-15', '23:00', 'America/New_York')
      // Should be 4:00 AM UTC the next day
      expect(result.toISOString()).toBe('2024-01-16T04:00:00.000Z')
    })
  })

  describe('getDayOfWeekInTimezone', () => {
    it('returns correct day of week in timezone', () => {
      // 2024-01-15 is a Monday
      const date = new Date('2024-01-15T12:00:00.000Z')
      const day = getDayOfWeekInTimezone(date, 'America/New_York')
      expect(day).toBe(1) // Monday
    })

    it('handles day boundary crossing', () => {
      // 2024-01-16 4:00 AM UTC is still 2024-01-15 11:00 PM EST (Monday)
      const date = new Date('2024-01-16T04:00:00.000Z')
      const day = getDayOfWeekInTimezone(date, 'America/New_York')
      expect(day).toBe(1) // Still Monday in EST
    })
  })

  describe('generateTimeSlots', () => {
    it('generates correct 60-minute slots', () => {
      const start = new Date('2024-01-15T14:00:00.000Z') // 9 AM EST
      const end = new Date('2024-01-15T17:00:00.000Z')   // 12 PM EST
      
      const slots = generateTimeSlots(start, end, 60)
      
      expect(slots).toHaveLength(3)
      expect(slots[0].start.toISOString()).toBe('2024-01-15T14:00:00.000Z')
      expect(slots[0].end.toISOString()).toBe('2024-01-15T15:00:00.000Z')
      expect(slots[2].end.toISOString()).toBe('2024-01-15T17:00:00.000Z')
    })

    it('does not create partial slots', () => {
      const start = new Date('2024-01-15T14:00:00.000Z')
      const end = new Date('2024-01-15T15:30:00.000Z') // Only 1.5 hours
      
      const slots = generateTimeSlots(start, end, 60)
      
      // Should only create 1 slot (9-10 AM), not a partial 10-10:30 slot
      expect(slots).toHaveLength(1)
    })
  })

  describe('timeRangesOverlap', () => {
    it('detects overlap correctly', () => {
      const start1 = new Date('2024-01-15T14:00:00.000Z')
      const end1 = new Date('2024-01-15T15:00:00.000Z')
      const start2 = new Date('2024-01-15T14:30:00.000Z')
      const end2 = new Date('2024-01-15T15:30:00.000Z')
      
      expect(timeRangesOverlap(start1, end1, start2, end2)).toBe(true)
    })

    it('detects no overlap when ranges are adjacent', () => {
      const start1 = new Date('2024-01-15T14:00:00.000Z')
      const end1 = new Date('2024-01-15T15:00:00.000Z')
      const start2 = new Date('2024-01-15T15:00:00.000Z')
      const end2 = new Date('2024-01-15T16:00:00.000Z')
      
      expect(timeRangesOverlap(start1, end1, start2, end2)).toBe(false)
    })

    it('detects no overlap when ranges are separate', () => {
      const start1 = new Date('2024-01-15T14:00:00.000Z')
      const end1 = new Date('2024-01-15T15:00:00.000Z')
      const start2 = new Date('2024-01-15T16:00:00.000Z')
      const end2 = new Date('2024-01-15T17:00:00.000Z')
      
      expect(timeRangesOverlap(start1, end1, start2, end2)).toBe(false)
    })
  })

  describe('getDayBoundariesInUTC', () => {
    it('returns correct day boundaries in UTC for EST timezone', () => {
      const { start, end } = getDayBoundariesInUTC('2024-01-15', 'America/New_York')
      
      // Midnight EST = 5 AM UTC
      expect(start.toISOString()).toBe('2024-01-15T05:00:00.000Z')
      // 11:59:59.999 PM EST = 4:59:59.999 AM UTC next day
      expect(end.toISOString()).toBe('2024-01-16T04:59:59.999Z')
    })
  })

  describe('parseTimeString', () => {
    it('parses HH:mm:ss format', () => {
      expect(parseTimeString('09:00:00')).toBe('09:00')
    })

    it('parses HH:mm format', () => {
      expect(parseTimeString('09:00')).toBe('09:00')
    })
  })
})