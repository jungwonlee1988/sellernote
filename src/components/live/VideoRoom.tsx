'use client'

import { useEffect, useState } from 'react'
import {
  LiveKitRoom,
  VideoConference,
  RoomAudioRenderer,
  ControlBar,
  useTracks,
  useParticipants,
  useRoomContext,
} from '@livekit/components-react'
import '@livekit/components-styles'
import { Track } from 'livekit-client'
import { MessageSquare, HelpCircle, Users } from 'lucide-react'
import ChatPanel from './ChatPanel'
import QuestionPanel from './QuestionPanel'

interface VideoRoomProps {
  sessionId: string
  token: string
  wsUrl: string
  isHost: boolean
  onLeave?: () => void
}

export default function VideoRoom({
  sessionId,
  token,
  wsUrl,
  isHost,
  onLeave,
}: VideoRoomProps) {
  const [activePanel, setActivePanel] = useState<'chat' | 'questions' | null>(null)

  return (
    <LiveKitRoom
      token={token}
      serverUrl={wsUrl}
      connect={true}
      video={true}
      audio={true}
      onDisconnected={onLeave}
      data-lk-theme="default"
      style={{ height: '100vh' }}
    >
      <div className="flex h-full">
        <div className="flex-1 flex flex-col">
          <VideoConference />
          <RoomAudioRenderer />

          <div className="bg-gray-900 p-2 flex items-center justify-center gap-2">
            <button
              onClick={() => setActivePanel(activePanel === 'chat' ? null : 'chat')}
              className={`p-2 rounded-lg transition-colors ${
                activePanel === 'chat'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <MessageSquare className="w-5 h-5" />
            </button>
            <button
              onClick={() => setActivePanel(activePanel === 'questions' ? null : 'questions')}
              className={`p-2 rounded-lg transition-colors ${
                activePanel === 'questions'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <HelpCircle className="w-5 h-5" />
            </button>
            <ParticipantCount />
          </div>
        </div>

        {activePanel && (
          <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
            {activePanel === 'chat' && (
              <ChatPanel sessionId={sessionId} />
            )}
            {activePanel === 'questions' && (
              <QuestionPanel sessionId={sessionId} isHost={isHost} />
            )}
          </div>
        )}
      </div>
    </LiveKitRoom>
  )
}

function ParticipantCount() {
  const participants = useParticipants()

  return (
    <div className="flex items-center gap-1 px-3 py-2 bg-gray-700 rounded-lg text-gray-300">
      <Users className="w-4 h-4" />
      <span className="text-sm">{participants.length}</span>
    </div>
  )
}
