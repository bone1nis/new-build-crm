import { z } from 'zod'

export const taskSchema = z.object({
  title: z.string().trim().min(1, 'Введите название'),
  description: z.string().trim(),
  objectId: z.guid('Не выбран объект'),
  assigneeId: z.guid('Выберите исполнителя'),
})

export type TaskValues = z.infer<typeof taskSchema>
