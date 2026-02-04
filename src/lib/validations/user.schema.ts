import { z } from 'zod'

export const updateUserSchema = z.object({
  name: z.string().min(2, '이름은 2자 이상이어야 합니다.').optional(),
  phone: z.string().optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8, '비밀번호는 8자 이상이어야 합니다.').optional(),
}).refine((data) => {
  if (data.newPassword && !data.currentPassword) {
    return false
  }
  return true
}, {
  message: '비밀번호 변경 시 현재 비밀번호를 입력해주세요.',
  path: ['currentPassword'],
})

export const userFilterSchema = z.object({
  role: z.enum(['USER', 'ADMIN', 'INSTRUCTOR']).optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
})

export const updateUserRoleSchema = z.object({
  role: z.enum(['USER', 'ADMIN', 'INSTRUCTOR']),
})

export type UpdateUserInput = z.infer<typeof updateUserSchema>
export type UserFilterParams = z.infer<typeof userFilterSchema>
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>
