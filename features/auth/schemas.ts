import { z } from "zod";
import { emailSchema, passwordSchema } from "@/lib/validations/common";


export const signUpSchema = z.object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

export const loginSchema = z.object({
    email: emailSchema,
    password: passwordSchema,
})

export type SignUpInput = z.infer<typeof signUpSchema>
export type LoginInput = z.infer<typeof loginSchema>