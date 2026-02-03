import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '회원가입',
  description: '셀러노트 회원가입 페이지입니다. 무료로 가입하고 수입무역 교육을 시작하세요.',
  openGraph: {
    title: '회원가입 | 셀러노트',
    description: '셀러노트 회원가입 페이지입니다. 무료로 가입하고 수입무역 교육을 시작하세요.',
  },
  robots: {
    index: false,
    follow: true,
  },
}

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
