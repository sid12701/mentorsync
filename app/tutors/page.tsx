// app/tutors/page.tsx

import React from 'react'
import { getAllTutors } from "../../features/profile/queries"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar'
import { Badge } from '../../components/ui/badge'
import Link from 'next/link'
import { GraduationCap, DollarSign } from 'lucide-react'

export default async function TutorsPage() {
  const tutors = await getAllTutors()

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            Find Your Perfect Tutor
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Browse expert tutors and book sessions in your timezone
          </p>
        </div>

        {tutors.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <GraduationCap className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-4 text-gray-600">No tutors available yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {tutors.map((tutor) => {
              const initials = tutor.full_name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2)

              return (
                <Card key={tutor.id} className="transition-shadow hover:shadow-lg">
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={tutor.avatar_url || undefined} />
                        <AvatarFallback className="text-lg">{initials}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <CardTitle className="text-xl">{tutor.full_name}</CardTitle>
                        <CardDescription className="mt-1">
                          <span className="flex items-center gap-1 text-lg font-semibold text-green-600">
                            <DollarSign className="h-4 w-4" />
                            {tutor.hourly_rate}/hour
                          </span>
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="line-clamp-3 text-sm text-gray-600">
                      {tutor.bio}
                    </p>

                    {tutor.subjects && tutor.subjects.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {tutor.subjects.slice(0, 4).map((subject) => (
                          <Badge key={subject} variant="secondary">
                            {subject}
                          </Badge>
                        ))}
                        {tutor.subjects.length > 4 && (
                          <Badge variant="outline">
                            +{tutor.subjects.length - 4} more
                          </Badge>
                        )}
                      </div>
                    )}

                    <Button asChild className="w-full">
                      <Link href={`/tutors/${tutor.id}`}>
                        View Profile & Book
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}