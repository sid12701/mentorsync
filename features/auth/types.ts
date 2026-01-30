import {z} from 'zod';
import {emailSchema , passwordSchema} from '@/lib/validations/common';

export type AuthResponse<T = void> = { success: true; data: T } | { success: false; error: string }

export type UserRole = 'student'|'tutor'

export interface  AuthUser {
    id: string
    email: string
    role?: UserRole
}

