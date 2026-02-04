export interface Lesson {
  title: string
  content: string | null
  videoUrl: string | null
  duration: number | null
  order: number
  isPublic: boolean
}

export interface TagItem {
  id: string
  name: string
  color: string
}

export interface CategoryItem {
  id: string
  name: string
  color: string
  isActive: boolean
}

export interface LevelItem {
  id: string
  name: string
  description: string | null
  isActive: boolean
}

export type CourseType = 'LIVE_ONLINE' | 'LIVE_OFFLINE' | 'RECORDED'

export type TabType = 'info' | 'lessons' | 'description' | 'schedule' | 'vod'
