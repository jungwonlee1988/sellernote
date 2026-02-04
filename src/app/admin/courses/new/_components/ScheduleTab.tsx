'use client'

import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react'

const weekDays = ['일', '월', '화', '수', '목', '금', '토']

interface ScheduleTabProps {
  startDate: string
  setStartDate: (value: string) => void
  endDate: string
  setEndDate: (value: string) => void
  selectedDays: number[]
  setSelectedDays: (value: number[]) => void
  selectedDates: string[]
  setSelectedDates: (value: string[]) => void
  calendarMonth: Date
  setCalendarMonth: (value: Date) => void
}

export function ScheduleTab({
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  selectedDays,
  setSelectedDays,
  selectedDates,
  setSelectedDates,
  calendarMonth,
  setCalendarMonth,
}: ScheduleTabProps) {
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days: (number | null)[] = []
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i)
    }
    return days
  }

  const formatDateString = (date: Date) => {
    return date.toISOString().split('T')[0]
  }

  const isInRange = (dateStr: string) => {
    if (!startDate || !endDate) return false
    return dateStr >= startDate && dateStr <= endDate
  }

  const toggleDate = (day: number) => {
    const year = calendarMonth.getFullYear()
    const month = calendarMonth.getMonth()
    const dateStr = formatDateString(new Date(year, month, day))

    if (!isInRange(dateStr)) return

    if (selectedDates.includes(dateStr)) {
      setSelectedDates(selectedDates.filter((d) => d !== dateStr))
    } else {
      setSelectedDates([...selectedDates, dateStr].sort())
    }
  }

  const addWeeklyDays = () => {
    if (!startDate || !endDate || selectedDays.length === 0) return

    const start = new Date(startDate)
    const end = new Date(endDate)
    const newDates: string[] = [...selectedDates]

    const current = new Date(start)
    while (current <= end) {
      if (selectedDays.includes(current.getDay())) {
        const dateStr = formatDateString(current)
        if (!newDates.includes(dateStr)) {
          newDates.push(dateStr)
        }
      }
      current.setDate(current.getDate() + 1)
    }

    setSelectedDates(newDates.sort())
  }

  const removeDate = (dateStr: string) => {
    setSelectedDates(selectedDates.filter((d) => d !== dateStr))
  }

  const formatDisplayDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return `${date.getMonth() + 1}/${date.getDate()}(${weekDays[date.getDay()]})`
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
      <div className="flex items-center space-x-2 mb-4">
        <Calendar className="h-5 w-5 text-[#6AAF50]" />
        <h2 className="text-lg font-semibold text-gray-900">교육 일정 설정</h2>
      </div>

      {/* Step 1: 교육 기간 설정 */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-medium text-gray-700 mb-3">
          1단계: 교육 기간 설정
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">시작일</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value)
                setSelectedDates([])
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6AAF50]"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">종료일</label>
            <input
              type="date"
              value={endDate}
              min={startDate}
              onChange={(e) => {
                setEndDate(e.target.value)
                setSelectedDates([])
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6AAF50]"
            />
          </div>
        </div>
      </div>

      {/* Step 2: 반복 요일 선택 */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-medium text-gray-700 mb-3">
          2단계: 반복 요일 선택 (선택사항)
        </h3>
        <p className="text-sm text-gray-500 mb-3">
          매주 반복되는 요일을 선택하면 해당 요일을 자동으로 추가합니다.
        </p>
        <div className="flex flex-wrap gap-2 mb-3">
          {weekDays.map((day, index) => (
            <button
              key={day}
              type="button"
              onClick={() => {
                if (selectedDays.includes(index)) {
                  setSelectedDays(selectedDays.filter((d) => d !== index))
                } else {
                  setSelectedDays([...selectedDays, index])
                }
              }}
              className={`w-10 h-10 rounded-full font-medium transition-colors ${
                selectedDays.includes(index)
                  ? 'bg-[#6AAF50] text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:border-[#6AAF50]'
              }`}
            >
              {day}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={addWeeklyDays}
          disabled={!startDate || !endDate || selectedDays.length === 0}
          className="px-4 py-2 bg-[#6AAF50] text-white rounded-lg hover:bg-[#5A9A44] disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          선택한 요일 일괄 추가
        </button>
      </div>

      {/* Step 3: 개별 날짜 선택 (달력) */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-medium text-gray-700 mb-3">
          3단계: 개별 날짜 선택
        </h3>
        <p className="text-sm text-gray-500 mb-3">
          달력에서 개별 날짜를 클릭하여 추가하거나 제거합니다.
        </p>

        {startDate && endDate ? (
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            {/* 달력 헤더 */}
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={() =>
                  setCalendarMonth(
                    new Date(
                      calendarMonth.getFullYear(),
                      calendarMonth.getMonth() - 1
                    )
                  )
                }
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <h4 className="text-lg font-medium">
                {calendarMonth.getFullYear()}년 {calendarMonth.getMonth() + 1}월
              </h4>
              <button
                type="button"
                onClick={() =>
                  setCalendarMonth(
                    new Date(
                      calendarMonth.getFullYear(),
                      calendarMonth.getMonth() + 1
                    )
                  )
                }
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            {/* 요일 헤더 */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekDays.map((day) => (
                <div
                  key={day}
                  className="text-center text-sm font-medium text-gray-500 py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* 달력 그리드 */}
            <div className="grid grid-cols-7 gap-1">
              {getDaysInMonth(calendarMonth).map((day, index) => {
                if (day === null) {
                  return <div key={`empty-${index}`} className="h-10" />
                }

                const dateStr = formatDateString(
                  new Date(
                    calendarMonth.getFullYear(),
                    calendarMonth.getMonth(),
                    day
                  )
                )
                const inRange = isInRange(dateStr)
                const isSelected = selectedDates.includes(dateStr)

                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDate(day)}
                    disabled={!inRange}
                    className={`h-10 rounded-lg text-sm font-medium transition-colors ${
                      isSelected
                        ? 'bg-[#6AAF50] text-white'
                        : inRange
                        ? 'bg-[#F5FAF3] text-[#5A9A44] hover:bg-[#E8F5E3]'
                        : 'text-gray-300 cursor-not-allowed'
                    }`}
                  >
                    {day}
                  </button>
                )
              })}
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-400">먼저 교육 기간을 설정해주세요.</p>
        )}
      </div>

      {/* 선택된 날짜 목록 */}
      <div className="p-4 bg-[#F5FAF3] rounded-lg">
        <h3 className="text-sm font-medium text-gray-700 mb-3">
          선택된 교육 일정 ({selectedDates.length}일)
        </h3>
        {selectedDates.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {selectedDates.map((dateStr) => (
              <span
                key={dateStr}
                className="inline-flex items-center px-3 py-1 bg-white rounded-full text-sm border border-[#D0EBCA]"
              >
                {formatDisplayDate(dateStr)}
                <button
                  type="button"
                  onClick={() => removeDate(dateStr)}
                  className="ml-2 text-gray-400 hover:text-red-500"
                >
                  <X className="h-4 w-4" />
                </button>
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">선택된 일정이 없습니다.</p>
        )}
        {selectedDates.length > 0 && (
          <button
            type="button"
            onClick={() => setSelectedDates([])}
            className="mt-3 text-sm text-red-600 hover:text-red-700"
          >
            전체 삭제
          </button>
        )}
      </div>
    </div>
  )
}
