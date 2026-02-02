'use client'

import Link from 'next/link'
import { BookOpen, Ship, ShoppingCart, ArrowRight, ArrowDown } from 'lucide-react'

export default function AboutPage() {
  const scrollToMission = () => {
    document.getElementById('mission')?.scrollIntoView({ behavior: 'smooth' })
  }
  const services = [
    {
      icon: BookOpen,
      name: '셀러노트',
      description: '수입무역 & 운송에 대한 실무 중심 강의',
      details: '현직 실무자가 전하는 생생한 노하우로 수입 통관, 물류, 정산까지 A to Z를 배웁니다.',
      link: '/courses',
      external: false,
    },
    {
      icon: Ship,
      name: '쉽다 (ShipDa)',
      description: '디지털 포워딩 서비스',
      details: '수출입 운송, 외환 송금, 풀필먼트까지 물류의 모든 것을 디지털로 해결합니다.',
      link: 'https://www.ship-da.com',
      external: true,
    },
    {
      icon: ShoppingCart,
      name: '위딜라이즈 (WeDealize)',
      description: '발주 & 주문 관리 Vertical SaaS',
      details: '해외 소싱, 발주 관리, 주문 통합, 재고 및 정산 자동화를 하나의 플랫폼에서.',
      link: 'https://www.wedealize.com',
      external: true,
    },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section - Full Screen with Background Image */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?q=80&w=2070&auto=format&fit=crop')`,
          }}
        />

        {/* Dark overlay with gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black" />

        {/* Green accent overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[#6AAF50]/10 via-transparent to-[#6AAF50]/5" />

        <div className="relative z-10 text-center px-4">
          <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-8 leading-tight drop-shadow-2xl">
            <span className="sm:hidden">무역을 쉽게<br />만들고 있습니다</span>
            <span className="hidden sm:inline">무역을 쉽게 만들고 있습니다</span>
          </h1>
          <p className="text-base sm:text-xl md:text-2xl text-gray-200 max-w-2xl mx-auto drop-shadow-lg leading-relaxed">
            <span className="sm:hidden">
              복잡하고, 어렵고,<br />멀게 느껴지던 무역의 장벽을 허물어<br />
              누구나 무역에 도전할 수 있는<br />세상을 만듭니다.
            </span>
            <span className="hidden sm:inline">
              복잡하고, 어렵고, 멀게 느껴지던 무역의 장벽을 허물어<br />
              누구나 무역에 도전할 수 있는 세상을 만듭니다.
            </span>
          </p>
        </div>

        {/* Scroll indicator */}
        <button
          onClick={scrollToMission}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce cursor-pointer hover:scale-110 transition-transform"
          aria-label="다음 섹션으로 스크롤"
        >
          <ArrowDown className="h-8 w-8 text-white/70 hover:text-[#6AAF50] transition-colors drop-shadow-lg" />
        </button>
      </section>

      {/* Impact Section - Who We Are */}
      <section id="mission" className="py-32 bg-black relative overflow-hidden">
        {/* Background Infographic - Growth Chart */}
        <div className="absolute inset-0 overflow-hidden opacity-20">
          {/* Animated Grid Lines */}
          <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
            {/* Horizontal grid lines */}
            {[...Array(10)].map((_, i) => (
              <line
                key={`h-${i}`}
                x1="0"
                y1={`${(i + 1) * 10}%`}
                x2="100%"
                y2={`${(i + 1) * 10}%`}
                stroke="#6AAF50"
                strokeWidth="0.5"
                strokeOpacity="0.3"
              />
            ))}
            {/* Vertical grid lines */}
            {[...Array(20)].map((_, i) => (
              <line
                key={`v-${i}`}
                x1={`${(i + 1) * 5}%`}
                y1="0"
                x2={`${(i + 1) * 5}%`}
                y2="100%"
                stroke="#6AAF50"
                strokeWidth="0.5"
                strokeOpacity="0.2"
              />
            ))}
          </svg>

          {/* Growth Line Chart */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1000 600" preserveAspectRatio="none">
            {/* Main growth curve */}
            <path
              d="M0,550 Q100,540 150,520 T300,450 T450,380 T600,280 T750,150 T900,80 L1000,50"
              fill="none"
              stroke="#6AAF50"
              strokeWidth="3"
              className="animate-pulse"
            />
            {/* Area fill under curve */}
            <path
              d="M0,550 Q100,540 150,520 T300,450 T450,380 T600,280 T750,150 T900,80 L1000,50 L1000,600 L0,600 Z"
              fill="url(#growthGradient)"
            />
            <defs>
              <linearGradient id="growthGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#6AAF50" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#6AAF50" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>

          {/* Bar Chart on the right */}
          <div className="absolute right-10 bottom-20 flex items-end gap-3 h-64">
            {[40, 55, 45, 70, 60, 85, 75, 95].map((height, i) => (
              <div
                key={i}
                className="w-6 bg-gradient-to-t from-[#6AAF50]/60 to-[#6AAF50]/20 rounded-t"
                style={{ height: `${height}%` }}
              />
            ))}
          </div>

          {/* Circular progress indicators */}
          <div className="absolute left-10 top-20">
            <svg width="120" height="120" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="50" fill="none" stroke="#6AAF50" strokeWidth="2" strokeOpacity="0.2" />
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke="#6AAF50"
                strokeWidth="4"
                strokeDasharray="251.2"
                strokeDashoffset="50"
                strokeLinecap="round"
                transform="rotate(-90 60 60)"
              />
            </svg>
          </div>

          {/* Floating data points */}
          <div className="absolute top-1/4 right-1/4 w-3 h-3 bg-[#6AAF50] rounded-full animate-ping" />
          <div className="absolute top-1/3 left-1/3 w-2 h-2 bg-[#6AAF50] rounded-full animate-pulse" />
          <div className="absolute bottom-1/3 right-1/3 w-4 h-4 bg-[#6AAF50]/50 rounded-full animate-pulse" />
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Section Header */}
          <div className="text-center mb-12">
            <p className="text-[#6AAF50] font-semibold text-base sm:text-lg mb-4">WHO WE ARE</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
              <span className="sm:hidden">
                우리는 <span className="text-[#6AAF50]">무역</span>의<br />문턱을 낮추는 사람들입니다
              </span>
              <span className="hidden sm:inline">
                우리는 <span className="text-[#6AAF50]">무역</span>의 문턱을 낮추는<br />사람들입니다
              </span>
            </h2>
          </div>

          {/* Why Import Trade Focus - Rich Explanation */}
          <div className="mb-20">
            <div className="bg-gradient-to-br from-[#6AAF50]/10 to-transparent backdrop-blur-sm border border-[#6AAF50]/20 rounded-3xl p-8 md:p-12">
              <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-center">
                {/* Left: Main Statement */}
                <div className="flex-1 text-center lg:text-left">
                  <div className="inline-flex items-center gap-2 bg-[#6AAF50]/20 rounded-full px-4 py-2 mb-6">
                    <div className="w-2 h-2 bg-[#6AAF50] rounded-full animate-pulse" />
                    <span className="text-[#6AAF50] font-medium text-sm">현재 집중 영역</span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                    왜 <span className="text-[#6AAF50]">수입무역</span>에 집중할까요?
                  </h3>
                  <p className="text-gray-300 text-lg leading-relaxed">
                    수출 시장은 대기업 중심입니다. 삼성, LG, 현대 같은 대기업들이
                    이미 탄탄한 인프라와 전문 인력을 갖추고 있죠.
                  </p>
                </div>

                {/* Right: Comparison Cards */}
                <div className="flex-1 w-full space-y-4">
                  {/* Export Card */}
                  <div className="bg-white/5 border border-white/10 rounded-xl p-5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gray-500/10 rounded-bl-full" />
                    <div className="relative">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">🏢</span>
                        <span className="text-white font-bold">수출 시장</span>
                        <span className="text-xs bg-gray-600/50 text-gray-300 px-2 py-1 rounded-full">대기업 중심</span>
                      </div>
                      <p className="text-gray-400 text-sm">
                        체계화된 프로세스, 전문 물류팀, 풍부한 자본력으로 이미 효율적인 시스템 구축
                      </p>
                    </div>
                  </div>

                  {/* Import Card - Highlighted */}
                  <div className="bg-[#6AAF50]/10 border border-[#6AAF50]/30 rounded-xl p-5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-[#6AAF50]/10 rounded-bl-full" />
                    <div className="relative">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">🏪</span>
                        <span className="text-white font-bold">수입 시장</span>
                        <span className="text-xs bg-[#6AAF50]/30 text-[#6AAF50] px-2 py-1 rounded-full">소규모 사업체 다수</span>
                      </div>
                      <p className="text-gray-300 text-sm">
                        1인 셀러, 스타트업, 소상공인 — 정보도 인프라도 부족한 상태에서 홀로 분투
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pain Points */}
              <div className="mt-10 pt-8 border-t border-white/10">
                <h4 className="text-white font-bold text-lg mb-6 text-center">
                  수입무역 사업자들이 겪는 <span className="text-[#6AAF50]">진짜 페인 포인트</span>
                </h4>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="flex items-start gap-3 bg-white/5 rounded-xl p-4">
                    <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-red-400">❓</span>
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">정보의 부재</p>
                      <p className="text-gray-500 text-xs">어디서부터 어떻게 시작해야 할지 막막함</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 bg-white/5 rounded-xl p-4">
                    <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-orange-400">📦</span>
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">물류의 복잡함</p>
                      <p className="text-gray-500 text-xs">소량 수입, 불투명한 비용, 복잡한 절차</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 bg-white/5 rounded-xl p-4">
                    <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-yellow-400">⚙️</span>
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">운영의 비효율</p>
                      <p className="text-gray-500 text-xs">엑셀로 발주, 수기로 재고, 계속되는 실수</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Conclusion */}
              <div className="mt-8 text-center">
                <p className="text-gray-300 text-lg">
                  그래서 우리는 <span className="text-[#6AAF50] font-bold">수입무역</span>에 집중합니다.
                  <br className="hidden md:block" />
                  <span className="text-gray-400">더 많은 사람들에게, 더 큰 도움이 필요한 곳에.</span>
                </p>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 text-center hover:bg-white/10 transition-all duration-300 hover:scale-105">
              <div className="text-4xl md:text-5xl font-bold text-[#6AAF50] mb-2">15,000+</div>
              <div className="text-gray-400">누적 수강생</div>
              <div className="mt-3 h-1 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full w-4/5 bg-gradient-to-r from-[#6AAF50] to-[#8BC34A] rounded-full" />
              </div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 text-center hover:bg-white/10 transition-all duration-300 hover:scale-105">
              <div className="text-4xl md:text-5xl font-bold text-[#6AAF50] mb-2">2,300+</div>
              <div className="text-gray-400">무역 창업 성공</div>
              <div className="mt-3 h-1 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full w-3/5 bg-gradient-to-r from-[#6AAF50] to-[#8BC34A] rounded-full" />
              </div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 text-center hover:bg-white/10 transition-all duration-300 hover:scale-105">
              <div className="text-4xl md:text-5xl font-bold text-[#6AAF50] mb-2">98%</div>
              <div className="text-gray-400">수강생 만족도</div>
              <div className="mt-3 h-1 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full w-[98%] bg-gradient-to-r from-[#6AAF50] to-[#8BC34A] rounded-full" />
              </div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 text-center hover:bg-white/10 transition-all duration-300 hover:scale-105">
              <div className="text-4xl md:text-5xl font-bold text-[#6AAF50] mb-2">50+</div>
              <div className="text-gray-400">실무 강의 콘텐츠</div>
              <div className="mt-3 h-1 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full w-2/3 bg-gradient-to-r from-[#6AAF50] to-[#8BC34A] rounded-full" />
              </div>
            </div>
          </div>

          {/* Impact Statements */}
          <div className="space-y-16">
            <div className="flex flex-col md:flex-row items-start gap-8">
              <div className="text-6xl md:text-8xl font-bold text-white/10">01</div>
              <div className="flex-1">
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                  처음 무역을 시작하는 사람도<br />
                  <span className="text-[#6AAF50]">3개월 안에 첫 수입</span>을 경험합니다
                </h3>
                <p className="text-gray-400 text-lg">
                  복잡한 수입 서류, 어려운 관세 용어, 막막한 통관 절차.
                  우리는 이 모든 것을 체계적인 수입무역 커리큘럼으로 정리했습니다.
                  수강생의 87%가 교육 수료 후 3개월 내 첫 수입을 시작합니다.
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-start gap-8">
              <div className="text-6xl md:text-8xl font-bold text-white/10">02</div>
              <div className="flex-1">
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                  물류비를 평균<br />
                  <span className="text-[#6AAF50]">23% 절감</span>시켜드립니다
                </h3>
                <p className="text-gray-400 text-lg">
                  쉽다(ShipDa)를 통해 복잡한 수입 포워딩을 디지털화했습니다.
                  견적 비교부터 실시간 화물 추적까지, 투명한 프로세스로
                  불필요한 비용을 줄이고 시간을 절약합니다.
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-start gap-8">
              <div className="text-6xl md:text-8xl font-bold text-white/10">03</div>
              <div className="flex-1">
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                  발주 관리 시간을<br />
                  <span className="text-[#6AAF50]">1/5로 단축</span>합니다
                </h3>
                <p className="text-gray-400 text-lg">
                  위딜라이즈(WeDealize)는 해외 소싱부터 수입 발주, 재고 관리까지
                  모든 과정을 하나의 플랫폼에서 해결합니다.
                  엑셀과 수작업에서 벗어나 본업에 집중하세요.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* History Timeline Section */}
      <section className="py-32 bg-gradient-to-b from-black to-gray-950 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[#6AAF50]/30 to-transparent" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-20">
            <p className="text-[#6AAF50] font-semibold text-lg mb-4">OUR JOURNEY</p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
              셀러노트의 <span className="text-[#6AAF50]">발자취</span>
            </h2>
          </div>

          {/* Timeline */}
          <div className="relative">
            {/* Timeline items */}
            {[
              {
                year: '2018',
                month: '03',
                title: '셀러노트 시작',
                description: '1인 수입무역 창업자를 위한 교육 콘텐츠 제작 시작',
                highlight: true,
              },
              {
                year: '2019',
                month: '06',
                title: '첫 오프라인 강의 개설',
                description: '수입무역 입문 과정 첫 기수 모집, 30명 수료',
              },
              {
                year: '2020',
                month: '01',
                title: '법인 설립',
                description: '주식회사 셀러노트 공식 법인 설립',
                highlight: true,
              },
              {
                year: '2020',
                month: '08',
                title: '온라인 플랫폼 런칭',
                description: '코로나19 대응, 수입무역 교육 온라인 플랫폼 오픈',
              },
              {
                year: '2021',
                month: '04',
                title: '누적 수강생 1,000명 돌파',
                description: '수입무역 교육 수요 급증, 커리큘럼 확대',
              },
              {
                year: '2022',
                month: '02',
                title: '쉽다(ShipDa) 서비스 런칭',
                description: '수입무역 물류 디지털 포워딩 서비스 출시',
                highlight: true,
              },
              {
                year: '2022',
                month: '11',
                title: '시드 투자 유치',
                description: '시드 라운드 투자 유치, 서비스 고도화 착수',
              },
              {
                year: '2023',
                month: '05',
                title: '위딜라이즈(WeDealize) 출시',
                description: '수입무역 발주/주문 관리 SaaS, 생태계 완성',
                highlight: true,
              },
              {
                year: '2024',
                month: '03',
                title: '누적 수강생 10,000명 돌파',
                description: '수입무역 교육 분야 국내 1위 달성',
              },
              {
                year: '2024',
                month: '12',
                title: 'Open API 서비스 출시',
                description: '수입무역 서류 파서, 워크플로우 자동화 API 공개',
                highlight: true,
              },
            ].map((item, index) => (
              <div
                key={index}
                className={`relative flex items-center gap-8 mb-12 ${
                  index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}
              >
                {/* Content */}
                <div className={`flex-1 flex ${index % 2 === 0 ? 'md:justify-end' : 'md:justify-start'}`}>
                  <div
                    className={`w-full md:w-80 h-36 flex flex-col justify-center ${
                      item.highlight
                        ? 'bg-[#6AAF50]/20 border-[#6AAF50]/50'
                        : 'bg-white/5 border-white/10'
                    } backdrop-blur-sm border rounded-2xl p-6 hover:scale-105 transition-transform duration-300`}
                  >
                    <div className={`flex items-center gap-3 mb-2 ${index % 2 === 0 ? 'md:justify-end' : 'md:justify-start'}`}>
                      <span className="text-[#6AAF50] font-bold text-lg">{item.year}</span>
                      <span className="text-gray-500 text-sm">{item.month}월</span>
                    </div>
                    <h3 className={`text-xl font-bold text-white mb-2 ${index % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>{item.title}</h3>
                    <p className={`text-gray-400 text-sm line-clamp-2 ${index % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>{item.description}</p>
                  </div>
                </div>

                {/* Center dot */}
                <div className="hidden md:flex items-center justify-center relative z-10">
                  <div
                    className={`w-4 h-4 rounded-full ${
                      item.highlight ? 'bg-[#6AAF50]' : 'bg-gray-600'
                    } ring-4 ${
                      item.highlight ? 'ring-[#6AAF50]/30' : 'ring-gray-800'
                    }`}
                  />
                </div>

                {/* Empty space for alternating layout */}
                <div className="flex-1 hidden md:block" />
              </div>
            ))}

            {/* Timeline line (vertical on desktop) */}
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#6AAF50]/50 via-gray-700 to-gray-800 -translate-x-1/2 hidden md:block" />
          </div>

          {/* Powerful Closing Statement */}
          <div className="text-center mt-24 md:mt-32">
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-[#6AAF50]/10 blur-3xl rounded-full" />

              <h2 className="relative text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-8">
                <span className="sm:hidden">
                  셀러노트는 오늘도<br />
                  <span className="text-[#6AAF50]">무역을 더 쉽게</span><br />만들기 위해<br />
                  한 걸음씩 나아갑니다
                </span>
                <span className="hidden sm:inline">
                  셀러노트는 오늘도<br />
                  <span className="text-[#6AAF50]">무역을 더 쉽게</span> 만들기 위해<br />
                  한 걸음씩 나아갑니다
                </span>
              </h2>

              <p className="text-base sm:text-xl text-gray-400 max-w-2xl mx-auto mb-8">
                어제보다 오늘, 오늘보다 내일 더 쉬운 무역을 위해.
              </p>

              <div className="inline-flex items-center gap-3 bg-[#6AAF50]/10 border border-[#6AAF50]/30 rounded-full px-6 py-3">
                <div className="w-2 h-2 bg-[#6AAF50] rounded-full animate-pulse" />
                <span className="text-[#6AAF50] font-medium">그 발자취는 계속됩니다</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Statement Section - Enhanced */}
      <section className="py-32 bg-gradient-to-b from-black via-gray-900 to-black relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#6AAF50]/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#6AAF50]/5 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-[#6AAF50]/5 to-transparent rounded-full" />
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Problem Statement */}
          <div className="text-center mb-20">
            <p className="text-[#6AAF50] font-semibold text-lg mb-4">THE PROBLEM</p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-8">
              무역은 왜 어려웠을까요?
            </h2>
          </div>

          {/* Problem Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-24">
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-transparent rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500" />
              <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:border-red-500/30 transition-all duration-300">
                <div className="text-5xl mb-4">📋</div>
                <h3 className="text-xl font-bold text-white mb-3">복잡한 무역 서류</h3>
                <p className="text-gray-400">
                  인보이스, 패킹리스트, B/L, 원산지증명서...
                  수십 가지 서류가 머리를 아프게 합니다.
                </p>
              </div>
            </div>

            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-transparent rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500" />
              <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:border-orange-500/30 transition-all duration-300">
                <div className="text-5xl mb-4">🌐</div>
                <h3 className="text-xl font-bold text-white mb-3">무역 용어의 장벽</h3>
                <p className="text-gray-400">
                  FOB, CIF, HS Code, 관세율...
                  전문 용어의 벽이 무역 진입을 막습니다.
                </p>
              </div>
            </div>

            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 to-transparent rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500" />
              <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:border-yellow-500/30 transition-all duration-300">
                <div className="text-5xl mb-4">💸</div>
                <h3 className="text-xl font-bold text-white mb-3">불투명한 무역 비용</h3>
                <p className="text-gray-400">
                  운송비, 관세, 부가세, 창고비...
                  비용이 어디서 얼마나 나가는지 알 수 없습니다.
                </p>
              </div>
            </div>
          </div>

          {/* Transformation Arrow */}
          <div className="flex justify-center mb-24">
            <div className="relative">
              <div className="absolute inset-0 bg-[#6AAF50] blur-2xl opacity-30" />
              <div className="relative bg-[#6AAF50] rounded-full p-6">
                <ArrowDown className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>

          {/* Solution - Big Mission Statement */}
          <div className="relative">
            {/* Glow effect behind */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#6AAF50]/20 via-[#6AAF50]/10 to-[#6AAF50]/20 blur-3xl" />

            {/* Main card */}
            <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-10 md:p-16">
              <div className="text-center">
                <p className="text-gray-400 text-lg md:text-xl mb-6">
                  그래서 우리는 시작했습니다
                </p>

                {/* Big Mission Text */}
                <div className="relative inline-block mb-8">
                  <div className="absolute -inset-4 bg-[#6AAF50]/20 blur-2xl rounded-full" />
                  <h3 className="relative text-4xl md:text-6xl lg:text-7xl font-black">
                    <span className="text-white">"</span>
                    <span className="bg-gradient-to-r from-[#6AAF50] via-[#8BC34A] to-[#6AAF50] bg-clip-text text-transparent">
                      무역을 쉽게 만든다
                    </span>
                    <span className="text-white">"</span>
                  </h3>
                </div>

                <p className="text-xl md:text-2xl text-gray-300 mb-10 max-w-2xl mx-auto">
                  이것이 셀러노트의 미션입니다
                </p>

                {/* Three pillars */}
                <div className="grid md:grid-cols-3 gap-6 mt-12">
                  <div className="bg-white/5 rounded-xl p-6 border border-[#6AAF50]/20">
                    <div className="w-12 h-12 bg-[#6AAF50]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <BookOpen className="h-6 w-6 text-[#6AAF50]" />
                    </div>
                    <h4 className="text-white font-bold mb-2">쉽게 배우고</h4>
                    <p className="text-gray-500 text-sm">체계적인 교육으로 누구나</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-6 border border-[#6AAF50]/20">
                    <div className="w-12 h-12 bg-[#6AAF50]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Ship className="h-6 w-6 text-[#6AAF50]" />
                    </div>
                    <h4 className="text-white font-bold mb-2">쉽게 들여오고</h4>
                    <p className="text-gray-500 text-sm">디지털 포워딩으로 간편하게</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-6 border border-[#6AAF50]/20">
                    <div className="w-12 h-12 bg-[#6AAF50]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ShoppingCart className="h-6 w-6 text-[#6AAF50]" />
                    </div>
                    <h4 className="text-white font-bold mb-2">쉽게 관리한다</h4>
                    <p className="text-gray-500 text-sm">올인원 플랫폼으로 효율적으로</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <p className="text-[#6AAF50] font-semibold text-base sm:text-lg mb-4">OUR VISION</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-black leading-tight">
              <span className="sm:hidden">
                셀러노트가<br />만들어갈<br />
                <span className="text-[#6AAF50]">새로운 무역</span>
              </span>
              <span className="hidden sm:inline">
                셀러노트가 만들어갈<br />
                <span className="text-[#6AAF50]">새로운 무역</span>
              </span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            <div className="text-center">
              <div className="text-6xl md:text-7xl font-bold text-black mb-4">01</div>
              <h3 className="text-xl font-bold text-black mb-3">무역 진입 장벽 제로</h3>
              <p className="text-gray-600">
                누구나 무역을 시작할 수 있도록
                <br />
                체계적인 교육과 도구를 제공합니다.
              </p>
            </div>
            <div className="text-center">
              <div className="text-6xl md:text-7xl font-bold text-black mb-4">02</div>
              <h3 className="text-xl font-bold text-black mb-3">수입 원스톱 솔루션</h3>
              <p className="text-gray-600">
                교육, 운송, 관리까지
                <br />
                하나의 생태계에서 해결합니다.
              </p>
            </div>
            <div className="text-center">
              <div className="text-6xl md:text-7xl font-bold text-black mb-4">03</div>
              <h3 className="text-xl font-bold text-black mb-3">1인 무역 셀러의 성장</h3>
              <p className="text-gray-600">
                개인 셀러도 해외 직수입으로
                <br />
                경쟁력을 가질 수 있도록 지원합니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-[#6AAF50] font-semibold text-lg mb-4">OUR SERVICES</p>
            <h2 className="text-3xl md:text-4xl font-bold text-black">
              셀러노트 생태계
            </h2>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <div
                key={service.name}
                className="group relative bg-black rounded-2xl overflow-hidden aspect-[4/5] flex flex-col justify-end p-8 hover:scale-[1.02] transition-transform duration-300"
              >
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />

                {/* Icon */}
                <div className="absolute top-8 left-8">
                  <service.icon className="h-10 w-10 text-[#6AAF50]" />
                </div>

                {/* Content */}
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold text-white mb-2">{service.name}</h3>
                  <p className="text-[#6AAF50] font-medium mb-3">{service.description}</p>
                  <p className="text-gray-400 text-sm mb-6">{service.details}</p>

                  {service.external ? (
                    <a
                      href={service.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-white font-semibold group-hover:text-[#6AAF50] transition-colors"
                    >
                      바로가기
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </a>
                  ) : (
                    <Link
                      href={service.link}
                      className="inline-flex items-center text-white font-semibold group-hover:text-[#6AAF50] transition-colors"
                    >
                      바로가기
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-white mb-6">
            <span className="sm:hidden">무역, 이제<br />쉽게 시작하세요</span>
            <span className="hidden sm:inline">무역, 이제 쉽게 시작하세요</span>
          </h2>
          <p className="text-base sm:text-xl text-gray-400 mb-10 leading-relaxed">
            <span className="sm:hidden">
              셀러노트와 함께라면<br />1인 무역도 충분히 가능합니다.<br />
              현재 수입무역에 특화된<br />서비스를 제공합니다.
            </span>
            <span className="hidden sm:inline">
              셀러노트와 함께라면 1인 무역도 충분히 가능합니다.<br />현재 수입무역에 특화된 서비스를 제공합니다.
            </span>
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center px-8 py-4 bg-[#6AAF50] text-white font-semibold rounded-xl hover:bg-[#5A9A44] transition-colors"
            >
              무료로 시작하기
            </Link>
            <Link
              href="/courses"
              className="inline-flex items-center justify-center px-8 py-4 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors border border-white/20"
            >
              강의 둘러보기
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
