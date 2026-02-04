import {z} from 'zod';

export const createBookingSchema = z.object({
    tutorId: z.uuid("Invalid tutor ID"),
    startTime: z.string().datetime({ 
        message: "Invalid start time format" 
      }),
      
      endTime: z.string().datetime({ 
        message: "Invalid end time format" 
      }),     
      note: z.string().max(500,' note must be less than 500 characters').optional(),
      expectedPrice: z.number().positive('Price must be positive')
})



export type CreateBookingInput = z.infer<typeof createBookingSchema>;


export const cancelBookingSchema = z.object({
    bookingId: z.uuid("Invalid booking ID"),
    reason: z.string().max(500, 'Reason must be less than 500 characters').optional(),
})

export type CancelBookingInput = z.infer<typeof cancelBookingSchema >


