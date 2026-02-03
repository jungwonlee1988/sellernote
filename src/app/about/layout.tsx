import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '셀러노트 소개',
  description: '무역을 쉽게 만드는 사람들, 셀러노트. 수입무역 교육, 디지털 포워딩, 발주관리 SaaS까지 원스톱 무역 솔루션을 제공합니다.',
  openGraph: {
    title: '셀러노트 소개 | 셀러노트',
    description: '무역을 쉽게 만드는 사람들, 셀러노트. 수입무역 교육, 디지털 포워딩, 발주관리 SaaS까지 원스톱 무역 솔루션을 제공합니다.',
  },
}

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
