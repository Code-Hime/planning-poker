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

// Initialize socket connection and join room
onMounted(() => {
  if (!userName || !roomId) {
    router.push('/')
    return
  }

  connect()
  joinRoom(roomId, userName, isSpectator)
})

// Cleanup on unmount
onUnmounted(() => {
  if (roomStore.currentRoom?.id) {
    leaveRoom(roomStore.currentRoom.id)
  }
})

// Methods
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
    await navigator.clipboard.writeText(roomId)
    // Could add toast notification here
  } catch (err) {
    console.error('Failed to copy room ID')
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
      <!-- Header -->
      <header class="room-header">
        <div class="room-info">
          <h1 class="room-title">
            <Icon name="mdi:poker-chip" />
            Room {{ roomId }}
          </h1>
          <button @click="copyRoomId" class="copy-button" title="Copy room ID">
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
            :users="roomStore.currentRoom?.users || []"
            :votes="roomStore.currentRoom?.votes || []"
            :is-revealed="roomStore.currentRoom?.isRevealed || false"
          />

          <VotingSummary
            :votes="roomStore.currentRoom?.votes || []"
            :is-revealed="roomStore.currentRoom?.isRevealed || false"
          />
        </div>
      </div>

      <!-- Story Section -->
      <CurrentStory
        :current-story="roomStore.currentRoom?.currentStory"
        :votes="roomStore.currentRoom?.votes || []"
        :is-revealed="roomStore.currentRoom?.isRevealed || false"
        @update-story="handleUpdateStory"
        @clear-history="() => {}"
        @reset-votes="handleResetVotes"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.room-page {
  min-height: 100vh;
  padding: 2rem 0;
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