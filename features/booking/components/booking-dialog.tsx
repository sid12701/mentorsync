// features/booking/components/booking-dialog.tsx

'use client'

import { useState } from 'react'
import { bookSlot } from '../actions'
import { calculateDurationHours } from '../utils'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog'
import { Button } from '../../../components/ui/button'
import { Textarea } from '../../../components/ui/textarea'
import { Label } from '../../../components/ui/label'
import { Alert, AlertDescription } from '../../../components/ui/alert'
import { format } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'
import { Calendar, Clock, DollarSign, Video } from 'lucide-react'
import type { TimeSlot } from '@/features/availability/types'

interface BookingDialogProps {
  isOpen: boolean
  onClose: () => void
  tutorId: string
  tutorName: string
  slot: TimeSlot
  hourlyRate: number
  onSuccess: () => void
}

export function BookingDialog({
  isOpen,
  onClose,
  tutorId,
  tutorName,
  slot,
  hourlyRate,
  onSuccess,
}: BookingDialogProps) {
  const [note, setNote] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone

  // Convert slot times to user's timezone for display
  const startTime = new Date(slot.start)
  const endTime = new Date(slot.end)
  const startLocal = toZonedTime(startTime, userTimezone)
  const endLocal = toZonedTime(endTime, userTimezone)

  // Calculate price
  const durationHours = calculateDurationHours(slot.start, slot.end)
  const totalPrice = hourlyRate * durationHours

  async function handleBooking() {
    setIsLoading(true)
    setError(null)

    const result = await bookSlot({
      tutorId,
      startTime: slot.start,
      endTime: slot.end,
      note: note.trim() || undefined,
      expectedPrice: totalPrice,
    })

    if (!result.success) {
      if (result.error === 'SLOT_NO_LONGER_AVAILABLE') {
        setError('This slot is no longer available. Please select another time.')
      } else if (result.error.includes('Price has changed')) {
        setError(result.error)
      } else {
        setError(result.error)
      }
      setIsLoading(false)
    } else {
      // Success!
      setIsLoading(false)
      onSuccess()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Confirm Booking</DialogTitle>
          <DialogDescription>
            Review the details and confirm your session with {tutorName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Calendar className="mt-0.5 h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Date</p>
                <p className="text-sm text-muted-foreground">
                  {format(startLocal, 'EEEE, MMMM d, yyyy')}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="mt-0.5 h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Time</p>
                <p className="text-sm text-muted-foreground">
                  {format(startLocal, 'h:mm a')} - {format(endLocal, 'h:mm a')}
                </p>
                <p className="text-xs text-muted-foreground">
                  ({userTimezone})
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <DollarSign className="mt-0.5 h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Total Price</p>
                <p className="text-sm text-muted-foreground">
                  ${totalPrice.toFixed(2)} ({durationHours} hour
                  {durationHours !== 1 ? 's' : ''} × ${hourlyRate}/hour)
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Video className="mt-0.5 h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Video Meeting</p>
                <p className="text-sm text-muted-foreground">
                  A meeting link will be provided after booking
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Note to Tutor (Optional)</Label>
            <Textarea
              id="note"
              placeholder="Let the tutor know what you'd like to focus on..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={500}
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              {note.length}/500 characters
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleBooking} disabled={isLoading}>
            {isLoading ? 'Booking...' : `Confirm & Pay $${totalPrice.toFixed(2)}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}