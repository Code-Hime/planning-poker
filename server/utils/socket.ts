import { Server } from 'socket.io'
import type { Room } from '~/types/poker'

// In-memory storage (update this)
export const rooms = new Map<string, Room>()
export const userRooms = new Map<string, string>() // userId -> roomId

let io: Server | null = null

export function initializeSocketIO(server: any) {
  if (io) {
    return io
  }

  io = new Server(server, {
    path: '/socket.io',
    cors: {
      origin: process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : true,
      methods: ['GET', 'POST'],
      credentials: true
    }
  })

  setupSocketHandlers(io)
  console.log('Socket.IO server initialized and attached to Nitro server')
  
  return io
}

export function setupSocketHandlers(io: Server) {
  io.on('connection', (socket) => {
    // console.log('User connected:', socket.id)

    // Join room
    socket.on('join-room', ({ roomId, userName, isSpectator = false }) => {
      try {
        // Leave previous room if any
        const previousRoomId = userRooms.get(socket.id)
        if (previousRoomId) {
          socket.leave(previousRoomId)
          handleUserLeave(socket.id, previousRoomId, io)
        }

        // Create room if it doesn't exist
        if (!rooms.has(roomId)) {
          rooms.set(roomId, {
            id: roomId,
            name: `Room ${roomId}`,
            users: [],
            votes: [],
            isVotingOpen: true,
            isRevealed: false
          })
        }

        const room = rooms.get(roomId)!
        
        // Check if user already exists (reconnection)
        let user = room.users.find(u => u.name === userName)
        if (!user) {
          user = {
            id: socket.id,
            name: userName,
            isSpectator
          }
          room.users.push(user)
        } else {
          // Update existing user's socket id (reconnection)
          user.id = socket.id
        }

        // Join socket room
        socket.join(roomId)
        userRooms.set(socket.id, roomId)

        // Send room state to new user
        socket.emit('room-joined', { room, user })

        // Notify other users
        socket.to(roomId).emit('user-joined', { user })

        // console.log(`User ${userName} joined room ${roomId}`)
      } catch (error) {
        socket.emit('error', { message: 'Failed to join room' })
      }
    })

    // Leave room
    socket.on('leave-room', ({ roomId }) => {
      handleUserLeave(socket.id, roomId, io)
    })

    // Cast vote
    socket.on('cast-vote', ({ roomId, vote }) => {
      try {
        const room = rooms.get(roomId)
        if (!room) {
          socket.emit('error', { message: 'Room not found' })
          return
        }

        const user = room.users.find(u => u.id === socket.id)
        if (!user || user.isSpectator) {
          socket.emit('error', { message: 'Cannot vote as spectator' })
          return
        }

        // Update or create vote
        const existingVoteIndex = room.votes.findIndex(v => v.userId === socket.id)
        if (existingVoteIndex >= 0) {
          room.votes[existingVoteIndex].value = vote
        } else {
          room.votes.push({
            userId: socket.id,
            value: vote,
            isRevealed: false
          })
        }

        // Notify all users that someone voted (but don't reveal the vote)
        io.to(roomId).emit('vote-cast', { userId: socket.id, hasVoted: true })

        // console.log(`User ${user.name} voted ${vote} in room ${roomId}`)
      } catch (error) {
        socket.emit('error', { message: 'Failed to cast vote' })
      }
    })

    // Reveal votes
    socket.on('reveal-votes', ({ roomId }) => {
      try {
        const room = rooms.get(roomId)
        if (!room) {
          socket.emit('error', { message: 'Room not found' })
          return
        }

        // Mark all votes as revealed
        room.votes = room.votes.map(vote => ({ ...vote, isRevealed: true }))
        room.isRevealed = true

        // Send revealed votes to all users
        io.to(roomId).emit('votes-revealed', { votes: room.votes })

        // console.log(`Votes revealed in room ${roomId}`)
      } catch (error) {
        socket.emit('error', { message: 'Failed to reveal votes' })
      }
    })

    // Reset votes
    socket.on('reset-votes', ({ roomId }) => {
      try {
        const room = rooms.get(roomId)
        if (!room) {
          socket.emit('error', { message: 'Room not found' })
          return
        }

        // Clear all votes
        room.votes = []
        room.isRevealed = false
        room.currentStory = undefined

        // Notify all users
        io.to(roomId).emit('votes-reset', room)

        // console.log(`Votes reset in room ${roomId}`)
      } catch (error) {
        socket.emit('error', { message: 'Failed to reset votes' })
      }
    })

    // Set story
    socket.on('set-story', ({ roomId, story }) => {
      try {
        const room = rooms.get(roomId)
        if (!room) {
          socket.emit('error', { message: 'Room not found' })
          return
        }

        room.currentStory = story
        io.to(roomId).emit('story-updated', { story })

        // console.log(`Story updated in room ${roomId}: ${story}`)
      } catch (error) {
        socket.emit('error', { message: 'Failed to update story' })
      }
    })

    // Handle disconnect
    socket.on('disconnect', () => {
      const roomId = userRooms.get(socket.id)
      if (roomId) {
        handleUserLeave(socket.id, roomId, io)
      }
      // console.log('User disconnected:', socket.id)
    })
  })
}

function handleUserLeave(socketId: string, roomId: string, io: Server) {
  const room = rooms.get(roomId)
  if (!room) return

  // Remove user from room
  room.users = room.users.filter(u => u.id !== socketId)
  room.votes = room.votes.filter(v => v.userId !== socketId)

  // Clean up tracking
  userRooms.delete(socketId)

  // Notify other users
  io.to(roomId).emit('user-left', { userId: socketId })

  // Clean up empty rooms
  if (room.users.length === 0) {
    rooms.delete(roomId)
    // console.log(`Room ${roomId} deleted (empty)`)
  }
}

