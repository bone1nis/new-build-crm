import { z } from 'zod'

export const objectSchema = z.object({
  name: z.string().trim().min(1, 'Введите название').max(200, 'Не более 200 символов'),
  address: z.string().trim().min(1, 'Введите адрес').max(300, 'Не более 300 символов'),
})

export type ObjectValues = z.infer<typeof objectSchema>
