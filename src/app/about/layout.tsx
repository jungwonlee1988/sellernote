import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '회사소개 | 셀러노트',
  description: '셀러노트는 무역을 쉽게 만듭니다. 현재 수입무역에 특화된 교육, 운송, 소싱 서비스로 1인 무역 셀러의 성장을 지원합니다.',
}

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
