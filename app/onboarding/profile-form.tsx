// app/onboarding/profile-form.tsx

'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createProfile } from '@/features/profile/actions'
import { profileSchema, type ProfileInput } from '@/features/profile/schemas'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { UserRole } from '@/features/profile/types'
import { ChevronLeft } from 'lucide-react'

interface ProfileFormProps {
  role: UserRole
  userEmail: string
  onBack: () => void
}

// Common subjects for tutors to choose from
const SUBJECT_OPTIONS = [
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'Computer Science',
  'English',
  'History',
  'Geography',
  'Economics',
  'Business',
  'Art',
  'Music',
  'Languages',
  'Test Prep (SAT/ACT)',
  'Programming',
]

export function ProfileForm({ role, userEmail, onBack }: ProfileFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([])

  // Auto-detect user's timezone
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone

  const form = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      role,
      fullname: '',
      timezone: userTimezone,
      avatarUrl: '',
      ...(role === 'tutor' && {
        bio: '',
        subjects: [],
        hourlyRate: 25,
      }),
    },
  })

  async function onSubmit(data: ProfileInput) {
    setIsLoading(true)
    setError(null)

    const result = await createProfile(data)

    if (!result.success) {
      setError(result.error)
      setIsLoading(false)
    }
    // If success, createProfile() will redirect to /dashboard
  }

  function toggleSubject(subject: string) {
    const newSubjects = selectedSubjects.includes(subject)
      ? selectedSubjects.filter(s => s !== subject)
      : [...selectedSubjects, subject]
    
    setSelectedSubjects(newSubjects)
    form.setValue('subjects' as any, newSubjects)
  }

  return (
    <div className="space-y-6">
      <Button
        type="button"
        variant="ghost"
        onClick={onBack}
        className="mb-4"
      >
        <ChevronLeft className="mr-2 h-4 w-4" />
        Back to role selection
      </Button>

      <div>
        <h2 className="text-2xl font-semibold">
          {role === 'student' ? 'Student Profile' : 'Tutor Profile'}
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Complete your profile to get started
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit((data) => onSubmit(data))} className="space-y-6">
          {error && (
            <div className="rounded-md bg-red-50 p-4 text-sm text-red-800">
              {error}
            </div>
          )}

          {/* Full Name */}
          <FormField
            control={form.control}
            name="fullname"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="John Doe"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Email (read-only) */}
          <FormItem>
            <FormLabel>Email</FormLabel>
            <Input value={userEmail} disabled />
            <FormDescription>
              This is your account email and cannot be changed.
            </FormDescription>
          </FormItem>

          {/* Timezone (auto-detected) */}
          <FormField
            control={form.control}
            name="timezone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Timezone</FormLabel>
                <FormControl>
                  <Input
                    placeholder="America/New_York"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Auto-detected from your browser. You can change this later.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Tutor-specific fields */}
          {role === 'tutor' && (
            <>
              {/* Bio */}
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell students about your expertise and teaching style..."
                        className="min-h-[100px] resize-none"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      {field.value?.length || 0}/500 characters
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Subjects */}
              <FormItem>
                <FormLabel>Subjects You Teach</FormLabel>
                <FormDescription className="mb-3">
                  Select all that apply (minimum 1, maximum 10)
                </FormDescription>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {SUBJECT_OPTIONS.map((subject) => (
                    <button
                      key={subject}
                      type="button"
                      onClick={() => toggleSubject(subject)}
                      disabled={isLoading}
                      className={`rounded-md border px-3 py-2 text-sm transition-colors ${
                        selectedSubjects.includes(subject)
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                      } ${isLoading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                    >
                      {subject}
                    </button>
                  ))}
                </div>
                {'subjects' in form.formState.errors && form.formState.errors.subjects && (
                  <p className="mt-2 text-sm text-red-600">
                    {form.formState.errors.subjects.message}
                  </p>
                )}
              </FormItem>

              {/* Hourly Rate */}
              <FormField
                control={form.control}
                name="hourlyRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hourly Rate (USD)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                          $
                        </span>
                        <Input
                          type="number"
                          min={10}
                          max={500}
                          step={5}
                          placeholder="25"
                          className="pl-8"
                          disabled={isLoading}
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Your rate per hour ($10 - $500). You can change this later.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}

          <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
            {isLoading ? 'Creating profile...' : 'Complete Setup'}
          </Button>
        </form>
      </Form>
    </div>
  )
}