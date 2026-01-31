// app/page.tsx

import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-linear-to-b from-blue-50 to-white p-8">
      <div className="max-w-4xl text-center">
        <h1 className="mb-6 text-5xl font-bold tracking-tight text-gray-900">
          MentorSync
        </h1>
        <p className="mb-8 text-xl text-gray-600">
          Connect with expert tutors across the globe. 
          Schedule sessions effortlessly with automatic timezone conversion.
        </p>
        
        <div className="flex gap-4 justify-center">
          <Link href="/signup">
            <Button size="lg" className="text-lg px-8">
              Get Started
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline" className="text-lg px-8">
              Sign In
            </Button>
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard 
            title="Timezone Smart"
            description="See availability in your local time, book in theirs"
          />
          <FeatureCard 
            title="No Double-Bookings"
            description="Database-level conflict prevention"
          />
          <FeatureCard 
            title="Instant Meetings"
            description="Every booking comes with a ready-to-use video link"
          />
        </div>
      </div>
    </div>
  )
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm">
      <h3 className="mb-2 text-lg font-semibold">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}