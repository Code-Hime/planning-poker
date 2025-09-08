import { defineStore } from 'pinia'
import type { Room, User, Vote, VoteValue } from '~/types/poker'

export const useRoomStore = defineStore('room', () => {
  const currentRoom = ref<Room | null>(null)
  const currentUser = ref<User | null>(null)
  const isConnected = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const hasVoted = computed(() => {
    if (!currentUser.value || !currentRoom.value) return false
    return currentRoom.value.votes.some(vote => 
      vote.userId === currentUser.value!.id && vote.value !== null
    )
  })

  const myVote = computed(() => {
    if (!currentUser.value || !currentRoom.value) return null
    return currentRoom.value.votes.find(vote => vote.userId === currentUser.value!.id)
  })

  const allUsersVoted = computed(() => {
    if (!currentRoom.value) return false
    const votingUsers = currentRoom.value.users.filter(user => !user.isSpectator)
    return votingUsers.length > 0 && votingUsers.every(user => 
      currentRoom.value!.votes.some(vote => vote.userId === user.id)
    )
  })

  // Actions
  function setRoom(room: Room) {
    currentRoom.value = room
  }

  function setUser(user: User) {
    currentUser.value = user
  }

  function updateVote(userId: string, hasVoted: boolean) {
    if (!currentRoom.value) return
    
    const existingVoteIndex = currentRoom.value.votes.findIndex(v => v.userId === userId)
    if (hasVoted) {
      if (existingVoteIndex < 0) {
        // Add new vote entry - value will be null until revealed
        currentRoom.value.votes.push({
          userId,
          value: null,
          isRevealed: false
        })
      }
      // If vote already exists, don't modify it (server will handle the actual value)
    } else {
      // Remove vote if exists
      if (existingVoteIndex >= 0) {
        currentRoom.value.votes.splice(existingVoteIndex, 1)
      }
    }
  }

  function revealVotes(votes: Vote[]) {
    if (!currentRoom.value) return
    currentRoom.value.votes = votes
    currentRoom.value.isRevealed = true
  }

  function resetVotes() {
    if (!currentRoom.value) return
    currentRoom.value.votes = []
    currentRoom.value.isRevealed = false
  }

  function addUser(user: User) {
    if (!currentRoom.value) return
    if (!currentRoom.value.users.find(u => u.id === user.id)) {
      currentRoom.value.users.push(user)
    }
  }

  function removeUser(userId: string) {
    if (!currentRoom.value) return
    currentRoom.value.users = currentRoom.value.users.filter(u => u.id !== userId)
    currentRoom.value.votes = currentRoom.value.votes.filter(v => v.userId !== userId)
  }

  function setError(message: string | null) {
    error.value = message
  }

  function clearError() {
    error.value = null
  }

  function updateStory(story: string) {
    if (!currentRoom.value) return
    currentRoom.value.currentStory = story
  }

  return {
    // State
    currentRoom: readonly(currentRoom),
    currentUser: readonly(currentUser),
    isConnected: readonly(isConnected),
    error: readonly(error),
    
    // Getters
    hasVoted,
    myVote,
    allUsersVoted,
    
    // Actions
    setRoom,
    setUser,
    updateVote,
    revealVotes,
    resetVotes,
    addUser,
    removeUser,
    setError,
    clearError,
    updateStory
  }
})

