import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '커뮤니티',
  description: '수입무역 Q&A, 수강후기, 취업정보까지. 셀러노트 수강생들과 무역 정보를 나누고 함께 성장하세요.',
  openGraph: {
    title: '커뮤니티 | 셀러노트',
    description: '수입무역 Q&A, 수강후기, 취업정보까지. 셀러노트 수강생들과 무역 정보를 나누고 함께 성장하세요.',
  },
}

export default function CommunityLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
