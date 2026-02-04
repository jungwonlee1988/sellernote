import { AccessToken, RoomServiceClient, EgressClient } from 'livekit-server-sdk'

const livekitHost = process.env.LIVEKIT_URL || ''
const apiKey = process.env.LIVEKIT_API_KEY || ''
const apiSecret = process.env.LIVEKIT_API_SECRET || ''

export async function createToken(
  roomName: string,
  participantName: string,
  participantId: string,
  isHost: boolean = false
): Promise<string> {
  const at = new AccessToken(apiKey, apiSecret, {
    identity: participantId,
    name: participantName,
    ttl: '6h',
  })

  at.addGrant({
    roomJoin: true,
    room: roomName,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
    roomAdmin: isHost,
    roomRecord: isHost,
  })

  return await at.toJwt()
}

export function getRoomServiceClient(): RoomServiceClient {
  return new RoomServiceClient(livekitHost, apiKey, apiSecret)
}

export function getEgressClient(): EgressClient {
  return new EgressClient(livekitHost, apiKey, apiSecret)
}

export async function createRoom(roomName: string, maxParticipants: number = 100) {
  const roomService = getRoomServiceClient()
  try {
    const room = await roomService.createRoom({
      name: roomName,
      emptyTimeout: 60 * 10, // 10분 후 빈 방 삭제
      maxParticipants,
    })
    return room
  } catch (error) {
    console.error('Failed to create room:', error)
    throw error
  }
}

export async function deleteRoom(roomName: string) {
  const roomService = getRoomServiceClient()
  try {
    await roomService.deleteRoom(roomName)
  } catch (error) {
    console.error('Failed to delete room:', error)
    throw error
  }
}

export async function listParticipants(roomName: string) {
  const roomService = getRoomServiceClient()
  try {
    const participants = await roomService.listParticipants(roomName)
    return participants
  } catch (error) {
    console.error('Failed to list participants:', error)
    throw error
  }
}

export async function startRecording(
  roomName: string,
  _egressId: string,
  storagePath: string
) {
  const egressClient = getEgressClient()

  try {
    // Supabase Storage에 직접 업로드하는 경우
    // 실제 구현에서는 S3 호환 스토리지 설정 필요
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const egress = await (egressClient as any).startRoomCompositeEgress(
      roomName,
      {
        file: {
          filepath: storagePath,
          fileType: 0, // MP4
        },
      },
      {
        layout: 'grid',
        audioOnly: false,
      }
    )
    return egress
  } catch (error) {
    console.error('Failed to start recording:', error)
    throw error
  }
}

export async function stopRecording(egressId: string) {
  const egressClient = getEgressClient()
  try {
    const egress = await egressClient.stopEgress(egressId)
    return egress
  } catch (error) {
    console.error('Failed to stop recording:', error)
    throw error
  }
}

export function generateRoomId(): string {
  return `room_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}
