import { z } from 'zod'

const lessonSchema = z.object({
  title: z.string().min(1, '레슨 제목을 입력해주세요.'),
  content: z.string().nullable().optional(),
  videoUrl: z.string().nullable().optional(),
  duration: z.number().nullable().optional(),
  order: z.number().optional(),
  isPublic: z.boolean().default(false),
})

const scheduleSchema = z.object({
  date: z.string().min(1, '날짜를 선택해주세요.'),
  title: z.string().nullable().optional(),
})

export const createCourseSchema = z.object({
  title: z.string().min(1, '강의 제목을 입력해주세요.'),
  description: z.string().min(1, '강의 설명을 입력해주세요.'),
  category: z.string().min(1, '카테고리를 선택해주세요.'),
  level: z.string().min(1, '난이도를 선택해주세요.'),
  price: z.number().int().min(0, '가격은 0 이상이어야 합니다.'),
  instructor: z.string().min(1, '강사명을 입력해주세요.'),
  thumbnail: z.string().nullable().optional(),
  courseType: z.enum(['LIVE_ONLINE', 'LIVE_OFFLINE', 'RECORDED']).default('LIVE_OFFLINE'),
  capacity: z.number().int().positive().nullable().optional(),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  vodEnabled: z.boolean().default(false),
  vodFreeDays: z.number().int().nullable().optional(),
  vodPrice: z.number().int().nullable().optional(),
  vodExpiryDays: z.number().int().nullable().optional(),
  lessons: z.array(lessonSchema).optional(),
  schedules: z.array(scheduleSchema).optional(),
  tagIds: z.array(z.string()).optional(),
})

export const updateCourseSchema = createCourseSchema.partial().extend({
  isPublished: z.boolean().optional(),
})

export const courseFilterSchema = z.object({
  category: z.string().optional(),
  level: z.string().optional(),
  courseType: z.enum(['LIVE_ONLINE', 'LIVE_OFFLINE', 'RECORDED']).optional(),
  isPublished: z.coerce.boolean().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
})

export const createReviewSchema = z.object({
  rating: z.number().int().min(1, '평점은 1 이상이어야 합니다.').max(5, '평점은 5 이하여야 합니다.'),
  content: z.string().min(10, '리뷰는 10자 이상 작성해주세요.').max(1000, '리뷰는 1000자 이하로 작성해주세요.'),
})

export const reservationSchema = z.object({
  courseId: z.string().min(1, '강의 ID가 필요합니다.'),
})

export type CreateCourseInput = z.infer<typeof createCourseSchema>
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>
export type CourseFilterParams = z.infer<typeof courseFilterSchema>
export type CreateReviewInput = z.infer<typeof createReviewSchema>
export type ReservationInput = z.infer<typeof reservationSchema>
