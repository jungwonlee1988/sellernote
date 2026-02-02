'use client'

import Link from 'next/link'
import { FileText, Workflow, Zap, Shield, Code, ArrowRight, Check, Copy } from 'lucide-react'
import { useState } from 'react'

export default function OpenAPIPage() {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const features = [
    {
      icon: FileText,
      title: '무역서류 파서',
      description: 'Invoice, Packing List, B/L, 원산지증명서 등 무역서류를 자동으로 파싱하여 구조화된 데이터로 변환합니다.',
      details: [
        'PDF, 이미지 파일 지원',
        'OCR + AI 기반 정확한 추출',
        '다국어 서류 지원 (한/영/중)',
        'JSON 형식 데이터 반환',
      ],
    },
    {
      icon: Workflow,
      title: '워크플로우 자동화',
      description: '무역업무 전용 워크플로우 자동화 API로 반복 업무를 줄이고 효율을 높입니다.',
      details: [
        '통관 진행상황 자동 조회',
        '환율 계산 및 견적 자동화',
        'HS Code 자동 분류',
        '서류 유효성 검증',
      ],
    },
    {
      icon: Zap,
      title: '실시간 처리',
      description: '빠른 응답 속도와 안정적인 서비스로 실시간 업무 처리를 지원합니다.',
      details: [
        '평균 응답 시간 < 2초',
        '99.9% 업타임 보장',
        'Rate Limiting 지원',
        'Webhook 연동 가능',
      ],
    },
  ]

  const pricingTiers = [
    {
      name: 'Starter',
      price: '50,000',
      tokens: '100,000',
      pricePerToken: '0.5원',
      features: [
        '100,000 토큰 제공',
        '기본 API 액세스',
        '이메일 지원',
        '기본 문서 파싱',
      ],
      recommended: false,
    },
    {
      name: 'Business',
      price: '200,000',
      tokens: '500,000',
      pricePerToken: '0.4원',
      features: [
        '500,000 토큰 제공',
        '모든 API 액세스',
        '우선 기술 지원',
        '고급 워크플로우',
        '전용 대시보드',
      ],
      recommended: true,
    },
    {
      name: 'Enterprise',
      price: '문의',
      tokens: '무제한',
      pricePerToken: '협의',
      features: [
        '무제한 토큰',
        '전용 인프라',
        '24/7 전담 지원',
        '커스텀 모델 학습',
        'SLA 보장',
        'On-premise 설치',
      ],
      recommended: false,
    },
  ]

  const codeExamples = [
    {
      title: '서류 파싱 요청',
      code: `curl -X POST https://api.sellernote.com/v1/parse \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: multipart/form-data" \\
  -F "file=@invoice.pdf" \\
  -F "document_type=invoice"`,
    },
    {
      title: '응답 예시',
      code: `{
  "status": "success",
  "tokens_used": 150,
  "data": {
    "document_type": "invoice",
    "invoice_number": "INV-2024-001",
    "seller": "ABC Trading Co., Ltd",
    "buyer": "셀러노트 주식회사",
    "items": [...],
    "total_amount": {
      "currency": "USD",
      "value": 15000.00
    }
  }
}`,
    },
  ]

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#6AAF50]/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#6AAF50]/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-[#6AAF50]/10 border border-[#6AAF50]/20 rounded-full px-4 py-2 mb-6">
              <Code className="h-4 w-4 text-[#6AAF50]" />
              <span className="text-[#6AAF50] text-sm font-medium">Developer API</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              무역업무를 위한
              <br />
              <span className="text-[#6AAF50]">Open API</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
              무역서류 파싱부터 워크플로우 자동화까지,
              <br />
              토큰 기반의 합리적인 가격으로 제공합니다.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="inline-flex items-center justify-center px-8 py-4 bg-[#6AAF50] text-white font-semibold rounded-xl hover:bg-[#5A9A44] transition-colors"
              >
                API 키 발급받기
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <a
                href="#docs"
                className="inline-flex items-center justify-center px-8 py-4 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors border border-white/20"
              >
                문서 보기
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-[#6AAF50] font-semibold text-lg mb-4">FEATURES</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              무역 전문 API 서비스
            </h2>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:border-[#6AAF50]/30 transition-all duration-300"
              >
                <div className="w-14 h-14 bg-[#6AAF50]/20 rounded-xl flex items-center justify-center mb-6">
                  <feature.icon className="h-7 w-7 text-[#6AAF50]" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-400 mb-6">{feature.description}</p>
                <ul className="space-y-3">
                  {feature.details.map((detail, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-gray-300">
                      <Check className="h-4 w-4 text-[#6AAF50] flex-shrink-0" />
                      <span className="text-sm">{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Code Example Section */}
      <section id="docs" className="py-24 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-[#6AAF50] font-semibold text-lg mb-4">QUICK START</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              간단한 API 연동
            </h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {codeExamples.map((example, index) => (
              <div key={example.title} className="relative">
                <div className="flex items-center justify-between bg-gray-900 rounded-t-xl px-4 py-3 border border-white/10 border-b-0">
                  <span className="text-sm text-gray-400">{example.title}</span>
                  <button
                    onClick={() => copyToClipboard(example.code, index)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {copiedIndex === index ? (
                      <Check className="h-4 w-4 text-[#6AAF50]" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <pre className="bg-gray-950 rounded-b-xl p-4 overflow-x-auto border border-white/10 border-t-0">
                  <code className="text-sm text-gray-300 whitespace-pre">{example.code}</code>
                </pre>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-[#6AAF50] font-semibold text-lg mb-4">PRICING</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              토큰 기반 합리적인 요금제
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              사용한 만큼만 지불하세요. API 호출 시 토큰이 차감되며,
              <br />
              서류 종류와 복잡도에 따라 토큰 사용량이 달라집니다.
            </p>
          </div>

          {/* Token Usage Info */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-12 max-w-3xl mx-auto">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5 text-[#6AAF50]" />
              토큰 사용량 안내
            </h3>
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between text-gray-300">
                <span>Invoice 파싱</span>
                <span className="text-[#6AAF50]">~150 토큰</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>B/L 파싱</span>
                <span className="text-[#6AAF50]">~200 토큰</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Packing List 파싱</span>
                <span className="text-[#6AAF50]">~180 토큰</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>HS Code 분류</span>
                <span className="text-[#6AAF50]">~50 토큰</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>환율 조회</span>
                <span className="text-[#6AAF50]">~10 토큰</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>워크플로우 실행</span>
                <span className="text-[#6AAF50]">~100 토큰~</span>
              </div>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid lg:grid-cols-3 gap-8">
            {pricingTiers.map((tier) => (
              <div
                key={tier.name}
                className={`relative rounded-2xl p-8 ${
                  tier.recommended
                    ? 'bg-gradient-to-b from-[#6AAF50]/20 to-transparent border-2 border-[#6AAF50]'
                    : 'bg-white/5 border border-white/10'
                }`}
              >
                {tier.recommended && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#6AAF50] text-white text-sm font-semibold px-4 py-1 rounded-full">
                    추천
                  </div>
                )}
                <div className="text-center mb-8">
                  <h3 className="text-xl font-bold text-white mb-2">{tier.name}</h3>
                  <div className="mb-2">
                    <span className="text-4xl font-bold text-white">
                      {tier.price === '문의' ? '' : '₩'}
                      {tier.price}
                    </span>
                    {tier.price !== '문의' && (
                      <span className="text-gray-400">/월</span>
                    )}
                  </div>
                  <p className="text-[#6AAF50] text-sm">
                    {tier.tokens} 토큰 · 토큰당 {tier.pricePerToken}
                  </p>
                </div>
                <ul className="space-y-4 mb-8">
                  {tier.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-gray-300">
                      <Check className="h-4 w-4 text-[#6AAF50] flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  className={`w-full py-3 rounded-xl font-semibold transition-colors ${
                    tier.recommended
                      ? 'bg-[#6AAF50] text-white hover:bg-[#5A9A44]'
                      : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                  }`}
                >
                  {tier.price === '문의' ? '문의하기' : '시작하기'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            지금 바로 시작하세요
          </h2>
          <p className="text-xl text-gray-400 mb-10">
            회원가입 후 무료 10,000 토큰을 받고 API를 테스트해보세요.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center justify-center px-8 py-4 bg-[#6AAF50] text-white font-semibold rounded-xl hover:bg-[#5A9A44] transition-colors"
          >
            무료로 시작하기
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  )
}
