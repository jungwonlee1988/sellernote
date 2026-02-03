import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '로그인',
  description: '셀러노트 로그인 페이지입니다. 로그인하고 수입무역 교육을 계속하세요.',
  openGraph: {
    title: '로그인 | 셀러노트',
    description: '셀러노트 로그인 페이지입니다. 로그인하고 수입무역 교육을 계속하세요.',
  },
  robots: {
    index: false,
    follow: true,
  },
}

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
