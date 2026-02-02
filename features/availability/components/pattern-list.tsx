// features/availability/components/pattern-list.tsx

'use client'

import { useState } from 'react'
import { deletePattern, togglePattern } from '../actions'
import { Button } from '../../../components/ui/button'
import { Card, CardContent } from '../../../components/ui/card'
import { Switch } from '../../../components/ui/switch'
import { Trash2, Clock } from 'lucide-react'
import type { AvailabilityPattern } from '../types'
import { DAYS_OF_WEEK } from '../types'

interface PatternListProps {
  patterns: AvailabilityPattern[]
  onUpdate?: () => void
}

export function PatternList({ patterns, onUpdate }: PatternListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  async function handleDelete(patternId: string) {
    if (!confirm('Are you sure you want to delete this availability pattern?')) {
      return
    }

    setDeletingId(patternId)
    const result = await deletePattern(patternId)

    if (result.success) {
      onUpdate?.()
    } else {
      alert(result.error)
    }

    setDeletingId(null)
  }

  async function handleToggle(patternId: string, currentStatus: boolean) {
    setTogglingId(patternId)
    const result = await togglePattern(patternId, !currentStatus)

    if (result.success) {
      onUpdate?.()
    } else {
      alert(result.error)
    }

    setTogglingId(null)
  }

  // Group patterns by day
  const grouped = patterns.reduce((acc, pattern) => {
    if (!acc[pattern.day_of_week]) {
      acc[pattern.day_of_week] = []
    }
    acc[pattern.day_of_week].push(pattern)
    return acc
  }, {} as Record<number, AvailabilityPattern[]>)

  return (
    <div className="space-y-4">
      {DAYS_OF_WEEK.map((day, dayIndex) => {
        const dayPatterns = grouped[dayIndex] || []

        if (dayPatterns.length === 0) {
          return null
        }

        return (
          <div key={dayIndex}>
            <h3 className="mb-2 font-semibold text-gray-900">{day}</h3>
            <div className="space-y-2">
              {dayPatterns.map((pattern) => (
                <Card key={pattern.id}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">
                        {pattern.start_time.slice(0, 5)} - {pattern.end_time.slice(0, 5)}
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={pattern.is_active}
                          onCheckedChange={() => handleToggle(pattern.id, pattern.is_active)}
                          disabled={togglingId === pattern.id}
                        />
                        <span className="text-sm text-gray-600">
                          {pattern.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(pattern.id)}
                        disabled={deletingId === pattern.id}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )
      })}

      {patterns.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No availability patterns yet. Add your first one above!
        </div>
      )}
    </div>
  )
}