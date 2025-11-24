<script setup lang="ts">
import type { VoteValue } from '~/types/poker'

const route = useRoute()
const router = useRouter()
const roomStore = useRoomStore()
const { connect, joinRoom, leaveRoom, castVote, revealVotes, resetVotes, setStory } = useSocket()

// Route params
const roomId = route.params.id as string
const userName = route.query.name as string
const isSpectator = route.query.spectator === 'true'
const customVoteOptions = route.query.voteOptions as string

// Component state
const selectedVote = ref<VoteValue | null>(null)
const showJoinScreen = ref(false)
const joinUserName = ref('')
const joinIsSpectator = ref(false)

// Check if we need to show join screen
onMounted(() => {
  if (!roomId) {
    router.push('/')
    return
  }

  if (!userName) {
    showJoinScreen.value = true
    return
  }

  // User has name, proceed with joining
  connect()
  joinRoom(roomId, userName, isSpectator)
})

// Watch for route changes (when user joins)
watch(() => route.query.name, (newName) => {
  if (newName && showJoinScreen.value) {
    showJoinScreen.value = false
    connect()
    joinRoom(roomId, newName as string, route.query.spectator === 'true')
  }
})

// Voting options
const voteOptions = computed(() => {
  if (customVoteOptions) {
    try {
      return JSON.parse(decodeURIComponent(customVoteOptions)) as VoteValue[]
    } catch {
      // Fallback to default if parsing fails
    }
  }
  return [0, 1, 2, 3, 5, 8, 13, '?', '☕', 'ski'] as VoteValue[]
})

// Cleanup on unmount
onUnmounted(() => {
  if (roomStore.currentRoom?.id) {
    leaveRoom(roomStore.currentRoom.id)
  }
})

// Methods
function handleJoinRoom() {
  if (!joinUserName.value.trim()) return
  
  const query: Record<string, string> = {
    name: joinUserName.value.trim()
  }
  
  if (joinIsSpectator.value) {
    query.spectator = 'true'
  }
  
  if (customVoteOptions) {
    query.voteOptions = customVoteOptions
  }
  
  router.push({
    path: `/room/${roomId}`,
    query
  })
}

function handleVote(vote: VoteValue) {
  selectedVote.value = vote
  castVote(roomId, vote)
}

function handleRevealVotes() {
  revealVotes(roomId)
}

function handleResetVotes() {
  resetVotes(roomId)
  selectedVote.value = null
}

function handleUpdateStory(story: string) {
  setStory(roomId, story)
}

async function copyRoomId() {
  try {
    const baseUrl = `${window.location.origin}/room/${roomId}`
    await navigator.clipboard.writeText(baseUrl)
    // Could add toast notification here
  } catch (err) {
    console.error('Failed to copy room URL')
  }
}

// SEO
useHead({
  title: `Room ${roomId} - Planning Poker`,
  meta: [
    { name: 'description', content: `Planning poker room ${roomId}` }
  ]
})
</script>

<template>
  <div class="room-page">
    <div class="container">
      <!-- Join Screen -->
      <div v-if="showJoinScreen" class="join-screen">
        <div class="join-card card">
          <div class="join-header">
            <Icon name="mdi:poker-chip" class="join-icon" />
            <h1 class="join-title">Join Room {{ roomId }}</h1>
            <p class="join-subtitle">Enter your name to join this planning poker room</p>
          </div>

          <form @submit.prevent="handleJoinRoom" class="join-form">
            <div class="form-group">
              <label for="joinUserName" class="form-label">Your Name</label>
              <input
                id="joinUserName"
                v-model="joinUserName"
                type="text"
                class="form-input"
                placeholder="Enter your name"
                required
                autofocus
              />
            </div>

            <div class="form-group">
              <label class="checkbox-label">
                <input
                  v-model="joinIsSpectator"
                  type="checkbox"
                  class="checkbox"
                />
                Join as spectator (won't vote)
              </label>
            </div>

            <button 
              type="submit"
              class="btn btn-primary full-width" 
              :disabled="!joinUserName.trim()"
            >
              <Icon name="mdi:arrow-right" />
              Join Room
            </button>

            <button 
              type="button"
              @click="router.push('/')" 
              class="btn btn-secondary full-width mt-2"
            >
              <Icon name="mdi:arrow-left" />
              Back to Home
            </button>
          </form>
        </div>
      </div>

      <!-- Room Content (shown when user has joined) -->
      <template v-else>
        <!-- Header -->
        <header class="room-header">
          <div class="room-info">
            <h1 class="room-title">
              <Icon name="mdi:poker-chip" />
              Room {{ roomId }}
            </h1>
            <button @click="copyRoomId" class="copy-button" title="Copy room URL">
              <Icon name="mdi:content-copy" />
            </button>
          </div>
          <div class="header-actions">
            <DarkModeToggle />
            <button @click="router.push('/')" class="btn btn-secondary">
              <Icon name="mdi:arrow-left" />
              Leave Room
            </button>
          </div>
        </header>

      <!-- Error Message -->
      <div v-if="roomStore.error" class="error-message">
        <Icon name="mdi:alert-triangle" />
        {{ roomStore.error }}
        <button @click="roomStore.clearError()" class="close-btn">
          <Icon name="mdi:close" />
        </button>
      </div>

      <!-- Main Content Grid -->
      <div class="content-grid">
        <!-- Voting Section -->
        <CastYourVote
          :vote-options="voteOptions"
          :selected-vote="selectedVote"
          :is-spectator="isSpectator"
          :is-revealed="roomStore.currentRoom?.isRevealed || false"
          :all-users-voted="roomStore.allUsersVoted"
          @vote="handleVote"
          @reveal="handleRevealVotes"
          @reset="handleResetVotes"
        />

        <!-- Users and Votes -->
        <div class="users-column">
          <TeamMembers
            :users="roomStore.currentRoom ? [...roomStore.currentRoom.users] : []"
            :votes="roomStore.currentRoom ? [...roomStore.currentRoom.votes] : []"
            :is-revealed="roomStore.currentRoom?.isRevealed || false"
          />

          <VotingSummary
            :votes="roomStore.currentRoom ? [...roomStore.currentRoom.votes] : []"
            :is-revealed="roomStore.currentRoom?.isRevealed || false"
          />
        </div>
      </div>

        <!-- Story Section -->
        <CurrentStory
          :current-story="roomStore.currentRoom?.currentStory"
          :votes="roomStore.currentRoom ? [...roomStore.currentRoom.votes] : []"
          :is-revealed="roomStore.currentRoom?.isRevealed || false"
          @update-story="handleUpdateStory"
          @clear-history="() => {}"
          @reset-votes="handleResetVotes"
        />
      </template>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.room-page {
  min-height: 100vh;
  padding: 2rem 0;
}

.join-screen {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 4rem);
}

.join-card {
  max-width: 450px;
  width: 100%;
}

.join-header {
  text-align: center;
  margin-bottom: 2rem;
}

.join-icon {
  font-size: 3rem;
  color: #2563eb;
  margin-bottom: 1rem;
}

.join-title {
  font-size: 1.75rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.join-subtitle {
  font-size: 0.875rem;
  color: #64748b;
}

.join-form {
  .form-group {
    margin-bottom: 1.5rem;
  }

  .checkbox-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    cursor: pointer;
    color: #6b7280;
  }

  .checkbox {
    margin: 0;
  }

  .full-width {
    width: 100%;
  }

  .mt-2 {
    margin-top: 0.5rem;
  }
}

// Dark mode styles for join screen
:global(.dark) {
  .join-title {
    color: #f1f5f9;
  }

  .join-subtitle {
    color: #94a3b8;
  }

  .checkbox-label {
    color: #94a3b8;
  }
}

.room-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e2e8f0;
  transition: border-color 0.3s ease;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.room-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.room-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.5rem;
  font-weight: 600;
  color: #2563eb;
  margin: 0;
}

.copy-button {
  background: none;
  border: none;
  padding: 0.5rem;
  border-radius: 0.375rem;
  cursor: pointer;
  color: #64748b;
  transition: all 0.2s;

  &:hover {
    background: #f1f5f9;
    color: #2563eb;
  }
}

// Dark mode styles
:global(.dark) {
  .room-header {
    border-bottom-color: #334155;
  }

  .copy-button {
    color: #94a3b8;

    &:hover {
      background: #334155;
      color: #60a5fa;
    }
  }
}

.error-message {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fee2e2;
  color: #dc2626;
  padding: 1rem;
  border-radius: 0.5rem;
  margin-bottom: 2rem;

  .close-btn {
    background: none;
    border: none;
    color: inherit;
    cursor: pointer;
    padding: 0.25rem;
  }
}

.content-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
}

.users-column {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

// Responsive
@media (max-width: 768px) {
  .room-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .content-grid {
    grid-template-columns: 1fr;
  }

  .users-column {
    gap: 1rem;
  }
}
</style>