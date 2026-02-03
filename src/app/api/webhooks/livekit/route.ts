import { NextRequest, NextResponse } from 'next/server'
import { WebhookReceiver } from 'livekit-server-sdk'
import { prisma } from '@/lib/prisma'

const receiver = new WebhookReceiver(
  process.env.LIVEKIT_API_KEY || '',
  process.env.LIVEKIT_API_SECRET || ''
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      return NextResponse.json(
        { error: 'Missing authorization header' },
        { status: 401 }
      )
    }

    // 웹훅 검증
    let event
    try {
      event = await receiver.receive(body, authHeader)
    } catch (error) {
      console.error('Webhook verification failed:', error)
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 401 }
      )
    }

    console.log('LiveKit webhook event:', event.event)

    switch (event.event) {
      case 'egress_ended': {
        // 녹화 완료
        const egress = event.egressInfo
        if (!egress) break

        const recording = await prisma.sessionRecording.findUnique({
          where: { egressId: egress.egressId },
        })

        if (recording) {
          const fileInfo = egress.fileResults?.[0]

          await prisma.sessionRecording.update({
            where: { id: recording.id },
            data: {
              status: egress.error ? 'FAILED' : 'READY',
              processedAt: new Date(),
              duration: fileInfo?.duration
                ? Math.round(Number(fileInfo.duration) / 1000000000)
                : null,
              fileSize: fileInfo?.size ? BigInt(fileInfo.size) : null,
              fileUrl: fileInfo?.location || null,
            },
          })
        }
        break
      }

      case 'participant_joined': {
        // 참가자 입장
        const participant = event.participant
        const room = event.room
        if (!participant || !room) break

        const liveSession = await prisma.liveSession.findUnique({
          where: { roomId: room.name },
        })

        if (liveSession) {
          await prisma.sessionParticipant.upsert({
            where: {
              sessionId_userId: {
                sessionId: liveSession.id,
                userId: participant.identity,
              },
            },
            update: {
              joinedAt: new Date(),
              leftAt: null,
            },
            create: {
              sessionId: liveSession.id,
              userId: participant.identity,
            },
          })
        }
        break
      }

      case 'participant_left': {
        // 참가자 퇴장
        const participant = event.participant
        const room = event.room
        if (!participant || !room) break

        const liveSession = await prisma.liveSession.findUnique({
          where: { roomId: room.name },
        })

        if (liveSession) {
          const sessionParticipant = await prisma.sessionParticipant.findUnique({
            where: {
              sessionId_userId: {
                sessionId: liveSession.id,
                userId: participant.identity,
              },
            },
          })

          if (sessionParticipant) {
            const leftAt = new Date()
            const totalTime = sessionParticipant.joinedAt
              ? Math.round(
                  (leftAt.getTime() - sessionParticipant.joinedAt.getTime()) / 1000
                )
              : 0

            await prisma.sessionParticipant.update({
              where: { id: sessionParticipant.id },
              data: {
                leftAt,
                totalTime: { increment: totalTime },
              },
            })
          }
        }
        break
      }

      case 'room_finished': {
        // 룸 종료
        const room = event.room
        if (!room) break

        const liveSession = await prisma.liveSession.findUnique({
          where: { roomId: room.name },
        })

        if (liveSession && liveSession.status === 'LIVE') {
          const endedAt = new Date()
          const duration = liveSession.startedAt
            ? Math.round(
                (endedAt.getTime() - liveSession.startedAt.getTime()) / 60000
              )
            : 0

          await prisma.liveSession.update({
            where: { id: liveSession.id },
            data: {
              status: 'ENDED',
              endedAt,
              duration,
            },
          })
        }
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
