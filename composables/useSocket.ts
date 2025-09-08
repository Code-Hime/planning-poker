import { io, type Socket } from 'socket.io-client'
import type { SocketEvents, VoteValue } from '~/types/poker'

export const useSocket = () => {
  const socket = ref<Socket | null>(null)
  const roomStore = useRoomStore()

  function connect() {
    if (socket.value?.connected) return socket.value

    socket.value = io('http://localhost:3001', {
      transports: ['websocket', 'polling']
    })

    // Connection events
    socket.value.on('connect', () => {
      console.log('Connected to server')
    })

    socket.value.on('disconnect', () => {
      console.log('Disconnected from server')
    })

    // Room events
    socket.value.on('room-joined', ({ room, user }) => {
      roomStore.setRoom(room)
      roomStore.setUser(user)
    })

    socket.value.on('user-joined', ({ user }) => {
      roomStore.addUser(user)
    })

    socket.value.on('user-left', ({ userId }) => {
      roomStore.removeUser(userId)
    })

    socket.value.on('vote-cast', ({ userId, hasVoted }) => {
      roomStore.updateVote(userId, hasVoted)
    })

    socket.value.on('votes-revealed', ({ votes }) => {
      roomStore.revealVotes(votes)
    })

    socket.value.on('votes-reset', (room) => {
      roomStore.setRoom(room)
    })

    socket.value.on('story-updated', ({ story }) => {
      roomStore.updateStory(story)
    })

    socket.value.on('error', ({ message }) => {
      roomStore.setError(message)
    })

    return socket.value
  }

  function disconnect() {
    socket.value?.disconnect()
    socket.value = null
  }

  function joinRoom(roomId: string, userName: string, isSpectator = false) {
    socket.value?.emit('join-room', { roomId, userName, isSpectator })
  }

  function leaveRoom(roomId: string) {
    socket.value?.emit('leave-room', { roomId })
  }

  function castVote(roomId: string, vote: VoteValue) {
    socket.value?.emit('cast-vote', { roomId, vote })
  }

  function revealVotes(roomId: string) {
    socket.value?.emit('reveal-votes', { roomId })
  }

  function resetVotes(roomId: string) {
    socket.value?.emit('reset-votes', { roomId })
  }

  function setStory(roomId: string, story: string) {
    socket.value?.emit('set-story', { roomId, story })
  }

  // Cleanup on unmount
  onUnmounted(() => {
    disconnect()
  })

  return {
    socket: readonly(socket),
    connect,
    disconnect,
    joinRoom,
    leaveRoom,
    castVote,
    revealVotes,
    resetVotes,
    setStory
  }
}
