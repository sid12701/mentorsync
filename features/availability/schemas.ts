import {z} from 'zod';


export const availabilityPatternSchema = z.object({
    dayOfWeek: z.number().int().min(0,'Day must be between 0-6').max(6,'Day must be between 0-6'),startTime:z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be in HH:mm format (e.g., 09:00)'),   endTime: z
    .string()
    .regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be in HH:mm format (e.g., 17:00)'),
}).refine((data) => {
    const [startHour , startMin] = data.startTime.split(':').map(Number)
    const [endHour, endMin] = data.endTime.split(':').map(Number)
    const startMinutes = startHour * 60 + startMin
    const endMinutes = endHour* 60 + endMin
    return endMinutes > startMinutes
}, {
    message: 'End time must be after start time',
    path: ['endTime']
})

export type AvailabilityPatternInput = z.infer<typeof availabilityPatternSchema>


export const getAvailableSlotsSchema = z.object({
    tutorId: z.uuid('Invalid Tutor ID'),
    date: z.regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
    duration: z.number().int().min(15).max(240).optional().default(60)
})


export type GetAvailableSlotsInput = z.infer<typeof getAvailableSlotsSchema>

