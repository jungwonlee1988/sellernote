'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { ThumbsUp, Check, X, Send } from 'lucide-react'

interface Question {
  id: string
  content: string
  isAnonymous: boolean
  status: 'PENDING' | 'ANSWERED' | 'DISMISSED'
  upvotes: number
  answer: string | null
  answeredAt: string | null
  createdAt: string
  hasUpvoted: boolean
  user: {
    id: string
    name: string
    profileImage: string | null
  }
  answeredBy: {
    id: string
    name: string
  } | null
}

interface QuestionPanelProps {
  sessionId: string
  isHost: boolean
}

export default function QuestionPanel({ sessionId, isHost }: QuestionPanelProps) {
  const { data: session } = useSession()
  const [questions, setQuestions] = useState<Question[]>([])
  const [newQuestion, setNewQuestion] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'answered'>('all')

  useEffect(() => {
    fetchQuestions()
    const interval = setInterval(fetchQuestions, 5000)
    return () => clearInterval(interval)
  }, [sessionId])

  const fetchQuestions = async () => {
    try {
      const res = await fetch(`/api/live-sessions/${sessionId}/questions`)
      if (res.ok) {
        const data = await res.json()
        setQuestions(data)
      }
    } catch (error) {
      console.error('Failed to fetch questions:', error)
    } finally {
      setLoading(false)
    }
  }

  const submitQuestion = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newQuestion.trim()) return

    try {
      const res = await fetch(`/api/live-sessions/${sessionId}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newQuestion, isAnonymous }),
      })

      if (res.ok) {
        const question = await res.json()
        setQuestions((prev) => [question, ...prev])
        setNewQuestion('')
      }
    } catch (error) {
      console.error('Failed to submit question:', error)
    }
  }

  const toggleUpvote = async (questionId: string) => {
    try {
      const res = await fetch(
        `/api/live-sessions/${sessionId}/questions/${questionId}`,
        { method: 'POST' }
      )

      if (res.ok) {
        const { upvoted } = await res.json()
        setQuestions((prev) =>
          prev.map((q) =>
            q.id === questionId
              ? {
                  ...q,
                  hasUpvoted: upvoted,
                  upvotes: upvoted ? q.upvotes + 1 : q.upvotes - 1,
                }
              : q
          )
        )
      }
    } catch (error) {
      console.error('Failed to toggle upvote:', error)
    }
  }

  const answerQuestion = async (questionId: string, answer: string) => {
    try {
      const res = await fetch(
        `/api/live-sessions/${sessionId}/questions/${questionId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ answer, status: 'ANSWERED' }),
        }
      )

      if (res.ok) {
        fetchQuestions()
      }
    } catch (error) {
      console.error('Failed to answer question:', error)
    }
  }

  const filteredQuestions = questions.filter((q) => {
    if (filter === 'pending') return q.status === 'PENDING'
    if (filter === 'answered') return q.status === 'ANSWERED'
    return true
  })

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-2">Q&A</h3>
        <div className="flex gap-1">
          {(['all', 'pending', 'answered'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2 py-1 text-xs rounded ${
                filter === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f === 'all' ? '전체' : f === 'pending' ? '대기중' : '답변됨'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {loading ? (
          <div className="text-center text-gray-500 py-4">로딩 중...</div>
        ) : filteredQuestions.length === 0 ? (
          <div className="text-center text-gray-500 py-4">
            질문이 없습니다.
          </div>
        ) : (
          filteredQuestions.map((q) => (
            <QuestionCard
              key={q.id}
              question={q}
              isHost={isHost}
              onUpvote={() => toggleUpvote(q.id)}
              onAnswer={(answer) => answerQuestion(q.id, answer)}
            />
          ))
        )}
      </div>

      <form onSubmit={submitQuestion} className="p-3 border-t border-gray-200 space-y-2">
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="rounded"
            />
            익명
          </label>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            placeholder="질문을 입력하세요..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          <button
            type="submit"
            disabled={!newQuestion.trim()}
            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  )
}

function QuestionCard({
  question,
  isHost,
  onUpvote,
  onAnswer,
}: {
  question: Question
  isHost: boolean
  onUpvote: () => void
  onAnswer: (answer: string) => void
}) {
  const [showAnswerForm, setShowAnswerForm] = useState(false)
  const [answer, setAnswer] = useState('')

  const handleSubmitAnswer = () => {
    if (answer.trim()) {
      onAnswer(answer)
      setShowAnswerForm(false)
      setAnswer('')
    }
  }

  return (
    <div className="bg-gray-50 rounded-lg p-3">
      <div className="flex items-start gap-2">
        <button
          onClick={onUpvote}
          className={`flex flex-col items-center p-1 rounded ${
            question.hasUpvoted ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <ThumbsUp className="w-4 h-4" />
          <span className="text-xs">{question.upvotes}</span>
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-gray-900">
              {question.user.name}
            </span>
            {question.status === 'ANSWERED' && (
              <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                답변됨
              </span>
            )}
          </div>
          <p className="text-sm text-gray-700">{question.content}</p>

          {question.answer && (
            <div className="mt-2 pl-3 border-l-2 border-blue-500">
              <p className="text-sm text-gray-600">{question.answer}</p>
              <p className="text-xs text-gray-500 mt-1">
                - {question.answeredBy?.name}
              </p>
            </div>
          )}

          {isHost && question.status === 'PENDING' && (
            <div className="mt-2">
              {showAnswerForm ? (
                <div className="space-y-2">
                  <textarea
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="답변을 입력하세요..."
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    rows={2}
                  />
                  <div className="flex gap-1">
                    <button
                      onClick={handleSubmitAnswer}
                      className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      답변
                    </button>
                    <button
                      onClick={() => setShowAnswerForm(false)}
                      className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                    >
                      취소
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowAnswerForm(true)}
                  className="text-xs text-blue-600 hover:underline"
                >
                  답변하기
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
