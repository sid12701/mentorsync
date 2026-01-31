// app/onboarding/onboarding-flow.tsx

'use client'

import { useState } from 'react'
import { RoleSelection } from './role-selection'
import { ProfileForm } from './profile-form'
import type { UserRole } from '@/features/profile/types'

interface OnboardingFlowProps {
  userEmail: string
}

export function OnboardingFlow({ userEmail }: OnboardingFlowProps) {
  const [step, setStep] = useState<'role' | 'profile'>('role')
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)

  function handleRoleSelect(role: UserRole) {
    setSelectedRole(role)
    setStep('profile')
  }

  function handleBack() {
    setStep('role')
    setSelectedRole(null)
  }

  return (
    <div>
      {step === 'role' && (
        <RoleSelection onSelectRole={handleRoleSelect} />
      )}

      {step === 'profile' && selectedRole && (
        <ProfileForm role={selectedRole} userEmail={userEmail} onBack={handleBack} />
      )}
    </div>
  )
}