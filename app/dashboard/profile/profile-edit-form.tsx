// app/dashboard/profile/profile-edit-form.tsx

"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateProfile } from "@/features/profile/actions";
import { profileSchema, type ProfileInput } from "@/features/profile/schemas";
import { Button } from "../../../components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "../../../components/ui/form";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import { Alert, AlertDescription } from "../../../components/ui/alert";
import { CheckCircle2 } from "lucide-react";
import type { Profile } from "@/features/profile/types";

interface ProfileEditFormProps {
  profile: Profile;
  userEmail: string;
}

const SUBJECT_OPTIONS = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "Computer Science",
  "English",
  "History",
  "Geography",
  "Economics",
  "Business",
  "Art",
  "Music",
  "Languages",
  "Test Prep (SAT/ACT)",
  "Programming",
];

export function ProfileEditForm({ profile, userEmail }: ProfileEditFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(
    profile.subjects || [],
  );

  const form = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      role: profile.role as "student" | "tutor",
      fullName: profile.full_name,
      timezone: profile.timezone,
      avatarUrl: profile.avatar_url || "",
      ...(profile.role === "tutor" && {
        bio: profile.bio || "",
        subjects: profile.subjects || [],
        hourlyRate: Number(profile.hourly_rate) || 25,
      }),
    },
  });

  async function onSubmit(data: ProfileInput) {
    setIsLoading(true)
    setError(null)
    setSuccess(false)
  
    // ADDED: Auto-fix timezone format
    if (data.timezone) {
      data.timezone = data.timezone.replace(/\s+/g, '_')
    }
  
    const result = await updateProfile(profile.id, data)
  
    if (!result.success) {
      setError(result.error)
      setIsLoading(false)
    } else {
      setSuccess(true)
      setIsLoading(false)
      setTimeout(() => setSuccess(false), 3000)
    }
  }
    function toggleSubject(subject: string) {
    const newSubjects = selectedSubjects.includes(subject)
      ? selectedSubjects.filter((s) => s !== subject)
      : [...selectedSubjects, subject];

    setSelectedSubjects(newSubjects);
    // Using 'as any' tells TS we know this key exists for the current user role
    form.setValue("subjects" as any, newSubjects, { shouldValidate: true });
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-200 bg-green-50 text-green-800">
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>Profile updated successfully!</AlertDescription>
          </Alert>
        )}

        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" disabled={isLoading} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormItem>
          <FormLabel>Email</FormLabel>
          <Input value={userEmail} disabled />
          <FormDescription>
            Email cannot be changed. Contact support if you need to update it.
          </FormDescription>
        </FormItem>

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
                Your timezone affects how booking times are displayed
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {profile.role === "tutor" && (
          <>
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell students about your expertise..."
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

            <FormItem>
              <FormLabel>Subjects You Teach</FormLabel>
              <FormDescription className="mb-3">
                Select all that apply
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
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                    } ${isLoading ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
                  >
                    {subject}
                  </button>
                ))}
              </div>
              {/* SAFE ERROR ACCESS */}
              {(form.formState.errors as any).subjects?.message && (
                <p className="mt-2 text-sm text-red-600">
                  {String((form.formState.errors as any).subjects.message)}
                </p>
              )}{" "}
            </FormItem>
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
                        className="pl-8"
                        disabled={isLoading}
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value))
                        }
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Your rate per hour ($10 - $500)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Changes"}
        </Button>
      </form>
    </Form>
  );
}
