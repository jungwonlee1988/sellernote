'use client'

import { PlayCircle } from 'lucide-react'
import type { CourseType } from './types'

interface VodSettingsTabProps {
  courseType: CourseType
  vodEnabled: boolean
  setVodEnabled: (value: boolean) => void
  vodFreeDays: string
  setVodFreeDays: (value: string) => void
  vodPrice: string
  setVodPrice: (value: string) => void
  vodExpiryDays: string
  setVodExpiryDays: (value: string) => void
}

export function VodSettingsTab({
  courseType,
  vodEnabled,
  setVodEnabled,
  vodFreeDays,
  setVodFreeDays,
  vodPrice,
  setVodPrice,
  vodExpiryDays,
  setVodExpiryDays,
}: VodSettingsTabProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
      <div className="flex items-center space-x-2 mb-4">
        <PlayCircle className="h-5 w-5 text-[#6AAF50]" />
        <h2 className="text-lg font-semibold text-gray-900">VOD 설정</h2>
      </div>

      {/* VOD 제공 여부 */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <label className="flex items-center justify-between cursor-pointer">
          <div>
            <p className="font-medium text-gray-900">VOD(다시보기) 제공</p>
            <p className="text-sm text-gray-500">
              {courseType === 'RECORDED'
                ? '녹화 강의는 VOD로 제공됩니다'
                : '라이브 강의 종료 후 녹화본을 제공합니다'}
            </p>
          </div>
          <div className="relative">
            <input
              type="checkbox"
              checked={vodEnabled || courseType === 'RECORDED'}
              onChange={(e) => setVodEnabled(e.target.checked)}
              disabled={courseType === 'RECORDED'}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#6AAF50]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#6AAF50]"></div>
          </div>
        </label>
      </div>

      {(vodEnabled || courseType === 'RECORDED') && (
        <>
          {/* 라이브 강의: 무료 제공 기간 */}
          {courseType !== 'RECORDED' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                무료 제공 기간 (종료일 기준)
              </label>
              <div className="flex items-center gap-2">
                <span className="text-gray-500">종료일 +</span>
                <input
                  type="number"
                  value={vodFreeDays}
                  onChange={(e) => setVodFreeDays(e.target.value)}
                  min={0}
                  className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6AAF50]"
                />
                <span className="text-gray-500">일</span>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                0으로 설정하면 무료 제공 없이 바로 추가 결제가 필요합니다
              </p>
            </div>
          )}

          {/* 녹화 강의: 시청 기간 */}
          {courseType === 'RECORDED' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                시청 가능 기간 (결제일 기준)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={vodExpiryDays}
                  onChange={(e) => setVodExpiryDays(e.target.value)}
                  min={1}
                  className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6AAF50]"
                />
                <span className="text-gray-500">일</span>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                결제일로부터 설정한 기간 동안 시청 가능합니다
              </p>
            </div>
          )}

          {/* 추가 결제 금액 (라이브 강의) */}
          {courseType !== 'RECORDED' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                추가 결제 금액 (무료 기간 종료 후)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={vodPrice}
                  onChange={(e) => setVodPrice(e.target.value)}
                  min={0}
                  placeholder="0"
                  className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6AAF50]"
                />
                <span className="text-gray-500">원</span>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                0으로 설정하면 무료 기간 종료 후 VOD를 제공하지 않습니다
              </p>
            </div>
          )}
        </>
      )}

      {/* 안내 */}
      <div className="p-4 bg-blue-50 rounded-lg">
        <h3 className="font-medium text-blue-900 mb-2">VOD 안내</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          {courseType === 'RECORDED' ? (
            <>
              <li>• 녹화 강의는 커리큘럼에 영상을 직접 업로드합니다</li>
              <li>• 결제일로부터 설정한 기간 동안 시청 가능합니다</li>
            </>
          ) : courseType === 'LIVE_ONLINE' ? (
            <>
              <li>• 화상 수업 진행 시 자동으로 녹화됩니다</li>
              <li>• 녹화본은 관리자가 공개 여부를 선택할 수 있습니다</li>
              <li>• 무료 기간 종료 후 추가 결제로 연장 가능합니다</li>
            </>
          ) : (
            <>
              <li>• 오프라인 강의는 자동 녹화가 되지 않습니다</li>
              <li>
                • 커리큘럼에서 영상을 직접 업로드하여 VOD를 제공할 수 있습니다
              </li>
              <li>• 무료 기간 종료 후 추가 결제로 연장 가능합니다</li>
            </>
          )}
        </ul>
      </div>
    </div>
  )
}
