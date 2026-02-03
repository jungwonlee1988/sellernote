import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '전체 강의',
  description: '수입무역 입문, 통관실무, 물류, FTA 활용까지 다양한 무역 강의를 만나보세요. 현직 전문가의 실전 노하우를 배울 수 있습니다.',
  openGraph: {
    title: '전체 강의 | 셀러노트',
    description: '수입무역 입문, 통관실무, 물류, FTA 활용까지 다양한 무역 강의를 만나보세요. 현직 전문가의 실전 노하우를 배울 수 있습니다.',
  },
}

export default function CoursesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
