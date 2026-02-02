import Link from 'next/link'
import Image from 'next/image'
import { Mail } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <Image
              src="/logo.png"
              alt="SellerNote"
              width={100}
              height={100}
              className="h-10 w-auto brightness-0 invert"
              unoptimized
            />
            <p className="text-sm">
              무역을 쉽게 만든다.
              <br />
              교육부터 운송, 소싱까지 1인 무역인의 성장을 지원합니다.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-white font-semibold mb-4">서비스</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="hover:text-[#6AAF50] transition-colors">
                  회사소개
                </Link>
              </li>
              <li>
                <Link href="/courses" className="hover:text-[#6AAF50] transition-colors">
                  강의
                </Link>
              </li>
              <li>
                <Link href="/open-api" className="hover:text-[#6AAF50] transition-colors">
                  Open API
                </Link>
              </li>
              <li>
                <Link href="/community" className="hover:text-[#6AAF50] transition-colors">
                  커뮤니티
                </Link>
              </li>
              <li>
                <a
                  href="https://blog.example.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#6AAF50] transition-colors"
                >
                  블로그
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-semibold mb-4">고객지원</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/faq" className="hover:text-[#6AAF50] transition-colors">
                  자주 묻는 질문
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-[#6AAF50] transition-colors">
                  이용약관
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-[#6AAF50] transition-colors">
                  개인정보처리방침
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">연락처</h3>
            <ul className="space-y-2">
              <li className="flex items-center space-x-2">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <span>qna@seller-note.com</span>
              </li>
            </ul>

            {/* Related Services */}
            <h3 className="text-white font-semibold mb-4 mt-6">관련 서비스</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://www.ship-da.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#6AAF50] transition-colors"
                >
                  쉽다 (ShipDa)
                </a>
              </li>
              <li>
                <a
                  href="https://www.wedealize.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#6AAF50] transition-colors"
                >
                  위딜라이즈 (WeDealize)
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm space-y-1">
          <p className="text-gray-400">
            대표자: 이중원 | 주식회사 셀러노트
          </p>
          <p className="text-gray-400">
            서울특별시 중구 한강대로 416, 서울스퀘어 13층 5호, 25호
          </p>
          <p className="text-gray-400">
            사업자등록번호: 256-81-01498 | 통신판매업신고: 제2020-서울종로-0321호
          </p>
          <p className="mt-2">Copyright © SELLER-NOTE Co.Ltd. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
