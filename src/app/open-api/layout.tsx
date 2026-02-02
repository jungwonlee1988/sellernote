import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Open API | SellerNote',
  description: '무역서류 파서, 워크플로우 자동화 API. 토큰 기반 합리적인 가격으로 무역업무를 자동화하세요.',
}

export default function OpenAPILayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
