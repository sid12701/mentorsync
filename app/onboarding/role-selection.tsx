// app/onboarding/role-selection.tsx

'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { UserRole } from '@/features/profile/types'
import { GraduationCap, BookOpen } from 'lucide-react'

interface RoleSelectionProps {
  onSelectRole: (role: UserRole) => void
}

export function RoleSelection({ onSelectRole }: RoleSelectionProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold">Choose your role</h2>
        <p className="mt-2 text-sm text-gray-600">
          This cannot be changed later, so choose carefully!
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="cursor-pointer border-2 p-6 transition-all hover:border-blue-500 hover:shadow-md"
          onClick={() => onSelectRole('student')}
        >
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="rounded-full bg-blue-100 p-4">
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold">I'm a Student</h3>
            <p className="text-sm text-gray-600">
              I want to learn from expert tutors and book sessions
            </p>
            <Button className="w-full">
              Continue as Student
            </Button>
          </div>
        </Card>

        <Card className="cursor-pointer border-2 p-6 transition-all hover:border-green-500 hover:shadow-md"
          onClick={() => onSelectRole('tutor')}
        >
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="rounded-full bg-green-100 p-4">
              <GraduationCap className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold">I'm a Tutor</h3>
            <p className="text-sm text-gray-600">
              I want to share my expertise and offer tutoring sessions
            </p>
            <Button className="w-full" variant="outline">
              Continue as Tutor
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}