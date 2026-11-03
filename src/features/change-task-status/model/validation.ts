import { z } from 'zod'

export const reworkSchema = z.object({
  comment: z.string().trim().min(1, 'Укажите, что нужно исправить'),
})

export type ReworkValues = z.infer<typeof reworkSchema>
