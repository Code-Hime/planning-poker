export type VoteValue = 0 | 1 | 2 | 3 | 5 | 8 | 13 | 21 | 34 | 55 | 89 | '?' | '☕' | '∞'

export type User = {
  id: string
  name: string
  isSpectator: boolean
}

export type Vote = {
  userId: string
  value: VoteValue | null
  isRevealed: boolean
}

export type Room = {
  id: string
  name: string
  users: User[]
  votes: Vote[]
  isVotingOpen: boolean
  isRevealed: boolean
  currentStory?: string
}

export type SocketEvents = {
  // Client to Server
  'join-room': { roomId: string; userName: string; isSpectator?: boolean }
  'leave-room': { roomId: string }
  'cast-vote': { roomId: string; vote: VoteValue }
  'reveal-votes': { roomId: string }
  'reset-votes': { roomId: string }
  'set-story': { roomId: string; story: string }
  
  // Server to Client
  'room-joined': { room: Room; user: User }
  'user-joined': { user: User }
  'user-left': { userId: string }
  'vote-cast': { userId: string; hasVoted: boolean }
  'votes-revealed': { votes: Vote[] }
  'votes-reset': Room
  'story-updated': { story: string }
  'error': { message: string }
}
