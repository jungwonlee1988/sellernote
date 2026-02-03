'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { Send } from 'lucide-react'

interface ChatMessage {
  id: string
  content: string
  messageType: 'CHAT' | 'SYSTEM' | 'NOTICE'
  createdAt: string
  user: {
    id: string
    name: string
    profileImage: string | null
  }
}

interface ChatPanelProps {
  sessionId: string
}

export default function ChatPanel({ sessionId }: ChatPanelProps) {
  const { data: session } = useSession()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchMessages()
    const interval = setInterval(fetchMessages, 3000)
    return () => clearInterval(interval)
  }, [sessionId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/live-sessions/${sessionId}/chat`)
      if (res.ok) {
        const data = await res.json()
        setMessages(data.messages)
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error)
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    try {
      const res = await fetch(`/api/live-sessions/${sessionId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newMessage }),
      })

      if (res.ok) {
        const message = await res.json()
        setMessages((prev) => [...prev, message])
        setNewMessage('')
      }
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900">채팅</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {loading ? (
          <div className="text-center text-gray-500 py-4">로딩 중...</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-500 py-4">
            아직 메시지가 없습니다.
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`${
                msg.messageType === 'NOTICE'
                  ? 'bg-yellow-50 border border-yellow-200 rounded-lg p-2'
                  : msg.messageType === 'SYSTEM'
                  ? 'text-center text-gray-500 text-sm'
                  : ''
              }`}
            >
              {msg.messageType === 'CHAT' && (
                <div className={`flex gap-2 ${msg.user.id === session?.user?.id ? 'flex-row-reverse' : ''}`}>
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
                    {msg.user.profileImage ? (
                      <img
                        src={msg.user.profileImage}
                        alt={msg.user.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">
                        {msg.user.name?.[0]}
                      </div>
                    )}
                  </div>
                  <div className={`max-w-[70%] ${msg.user.id === session?.user?.id ? 'text-right' : ''}`}>
                    <div className="text-xs text-gray-500 mb-1">{msg.user.name}</div>
                    <div
                      className={`inline-block px-3 py-2 rounded-lg ${
                        msg.user.id === session?.user?.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                </div>
              )}
              {msg.messageType === 'NOTICE' && (
                <div>
                  <div className="text-xs text-yellow-600 font-medium mb-1">공지</div>
                  <div className="text-sm text-gray-900">{msg.content}</div>
                </div>
              )}
              {msg.messageType === 'SYSTEM' && (
                <div>{msg.content}</div>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="p-3 border-t border-gray-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="메시지를 입력하세요..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  )
}
