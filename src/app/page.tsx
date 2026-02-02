import Link from 'next/link'
import { ArrowRight, BookOpen, Users, Award, TrendingUp } from 'lucide-react'

export default function Home() {
  const features = [
    {
      icon: BookOpen,
      title: '체계적인 커리큘럼',
      description: '수입무역 입문부터 고급 실무까지 단계별로 학습할 수 있습니다.',
    },
    {
      icon: Users,
      title: '현직 전문가 강의',
      description: '10년 이상 경력의 무역 전문가들이 직접 강의합니다.',
    },
    {
      icon: Award,
      title: '수료증 발급',
      description: '과정 완료 시 공인 수료증을 발급해 드립니다.',
    },
    {
      icon: TrendingUp,
      title: '취업 연계',
      description: '수료생 대상 무역 관련 기업 취업 연계 서비스를 제공합니다.',
    },
  ]

  const popularCourses = [
    {
      id: 1,
      title: '수입무역 입문 완성',
      instructor: '김무역',
      price: 299000,
      level: '입문',
      category: '무역기초',
    },
    {
      id: 2,
      title: '관세사가 알려주는 통관실무',
      instructor: '이관세',
      price: 399000,
      level: '중급',
      category: '통관',
    },
    {
      id: 3,
      title: '중국 수입 실전 가이드',
      instructor: '박차이나',
      price: 349000,
      level: '중급',
      category: '국가별',
    },
  ]

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 leading-tight">
              <span className="sm:hidden">수입무역,<br />이제 제대로 배우세요</span>
              <span className="hidden sm:inline">수입무역, 이제 제대로 배우세요</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed px-2 sm:px-0">
              <span className="sm:hidden">
                실무 중심의 체계적인 교육으로<br />
                수입무역 전문가로 성장하세요.<br />
                현직 전문가들이 직접 가르치는<br />
                실전 노하우를 배워보세요.
              </span>
              <span className="hidden sm:inline">
                실무 중심의 체계적인 교육으로 수입무역 전문가로 성장하세요.<br />
                현직 전문가들이 직접 가르치는 실전 노하우를 배워보세요.
              </span>
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/courses"
                className="bg-[#6AAF50] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#5A9A44] transition-colors flex items-center justify-center space-x-2"
              >
                <span>강의 둘러보기</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/register"
                className="border-2 border-[#6AAF50] text-[#6AAF50] px-8 py-3 rounded-lg font-semibold hover:bg-[#6AAF50] hover:text-white transition-colors"
              >
                무료 회원가입
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-black mb-4">
              왜 셀러노트인가요?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base px-2 sm:px-0">
              <span className="sm:hidden">셀러노트만의 차별화된 교육 시스템으로<br />수입무역 전문가로 성장하세요.</span>
              <span className="hidden sm:inline">셀러노트만의 차별화된 교육 시스템으로 수입무역 전문가로 성장하세요.</span>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-gray-50 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100"
              >
                <div className="w-12 h-12 bg-[#E8F5E3] rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-[#6AAF50]" />
                </div>
                <h3 className="text-lg font-semibold text-black mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Courses Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12 gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-black mb-2">
                인기 강의
              </h2>
              <p className="text-gray-600 text-sm sm:text-base">가장 많은 수강생이 선택한 강의입니다.</p>
            </div>
            <Link
              href="/courses"
              className="text-[#6AAF50] hover:text-[#5A9A44] font-medium flex items-center space-x-1"
            >
              <span>전체 보기</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {popularCourses.map((course) => (
              <Link
                key={course.id}
                href={`/courses/${course.id}`}
                className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow overflow-hidden border border-gray-100"
              >
                <div className="aspect-video bg-gradient-to-br from-[#E8F5E3] to-[#D0EBCA] relative flex items-center justify-center">
                  <BookOpen className="h-12 w-12 text-[#6AAF50]" />
                  <div className="absolute top-3 left-3">
                    <span className="bg-[#6AAF50] text-white text-xs px-2 py-1 rounded">
                      {course.level}
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <span className="text-sm text-[#6AAF50] font-medium">
                    {course.category}
                  </span>
                  <h3 className="text-lg font-semibold text-black mt-1 mb-2">
                    {course.title}
                  </h3>
                  <p className="text-sm text-gray-500 mb-3">{course.instructor}</p>
                  <p className="text-lg font-bold text-black">
                    {course.price.toLocaleString()}원
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-black py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            지금 바로 시작하세요
          </h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed px-2 sm:px-0">
            <span className="sm:hidden">
              회원가입하고 무료 강의<br />미리보기를 체험해보세요.<br />
              수입무역 전문가로의 첫걸음을<br />셀러노트와 함께하세요.
            </span>
            <span className="hidden sm:inline">
              회원가입하고 무료 강의 미리보기를 체험해보세요.<br />
              수입무역 전문가로의 첫걸음을 셀러노트와 함께하세요.
            </span>
          </p>
          <Link
            href="/register"
            className="inline-block bg-[#6AAF50] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#5A9A44] transition-colors"
          >
            무료로 시작하기
          </Link>
        </div>
      </section>
    </div>
  )
}
