<script setup lang="ts">
import type { VoteValue } from '~/types/poker'

const route = useRoute()
const router = useRouter()
const { connect, joinRoom, leaveRoom, castVote, revealVotes, resetVotes, setStory } = useSocket()
const roomStore = useRoomStore()

// Route params
const roomId = route.params.id as string
const userName = route.query.name as string
const isSpectator = route.query.spectator === 'true'
const customVoteOptions = route.query.voteOptions as string

// Component state
const storyInput = ref('')
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
  return [0, 1, 2, 3, 5, 8, 13, '?', '☕', '∞'] as VoteValue[]
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

function handleUpdateStory() {
  if (storyInput.value.trim()) {
    setStory(roomId, storyInput.value.trim())
    storyInput.value = ''
  }
}

function getVoteDisplay(vote: VoteValue) {
  if (typeof vote === 'string') return vote
  return vote.toString()
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
        <button @click="router.push('/')" class="btn btn-secondary">
          <Icon name="mdi:arrow-left" />
          Leave Room
        </button>
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
        <section class="voting-section">
          <div class="card">
            <h2>Cast Your Vote</h2>
            <div v-if="!isSpectator" class="vote-options">
              <button
                v-for="option in voteOptions"
                :key="option"
                @click="handleVote(option)"
                :class="[
                  'vote-card',
                  { 'selected': selectedVote === option }
                ]"
                :disabled="roomStore.currentRoom?.isRevealed"
              >
                {{ getVoteDisplay(option) }}
              </button>
            </div>
            <div v-else class="spectator-message">
              <Icon name="mdi:eye" />
              You are observing as a spectator
            </div>
          </div>

          <!-- Vote Controls -->
          <div class="vote-controls">
            <button
              @click="handleRevealVotes"
              class="btn btn-primary"
              :disabled="!roomStore.allUsersVoted || roomStore.currentRoom?.isRevealed"
            >
              <Icon name="mdi:eye" />
              Reveal Votes
            </button>
            <button
              @click="handleResetVotes"
              class="btn btn-secondary"
              :disabled="!roomStore.currentRoom?.votes.length"
            >
              <Icon name="mdi:refresh" />
              Reset Votes
            </button>
          </div>
        </section>

        <!-- Users and Votes -->
        <section class="users-section">
          <div class="card">
            <h2>Team Members ({{ roomStore.currentRoom?.users.length || 0 }})</h2>
            <div class="users-list">
              <div
                v-for="user in roomStore.currentRoom?.users"
                :key="user.id"
                class="user-card"
              >
                <div class="user-info">
                  <Icon
                    :name="user.isSpectator ? 'mdi:eye' : 'mdi:account'"
                    :class="{ 'spectator': user.isSpectator }"
                  />
                  <span class="user-name">{{ user.name }}</span>
                  <span v-if="user.isSpectator" class="spectator-badge">Spectator</span>
                </div>
                <div class="vote-status">
                  <div
                    v-if="!user.isSpectator"
                    :class="[
                      'vote-indicator',
                      {
                        'voted': roomStore.currentRoom?.votes.some(v => v.userId === user.id),
                        'revealed': roomStore.currentRoom?.isRevealed
                      }
                    ]"
                  >
                    <template v-if="roomStore.currentRoom?.isRevealed">
                      {{
                        getVoteDisplay(
                          roomStore.currentRoom?.votes.find(v => v.userId === user.id)?.value || '?'
                        )
                      }}
                    </template>
                    <template v-else>
                      <Icon name="mdi:check" v-if="roomStore.currentRoom?.votes.some(v => v.userId === user.id)" />
                      <Icon name="mdi:clock-outline" v-else />
                    </template>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Voting Summary -->
          <div v-if="roomStore.currentRoom?.isRevealed && roomStore.currentRoom.votes.length" class="card voting-summary">
            <h3>Voting Summary</h3>
            <div class="vote-stats">
              <div class="stat">
                <span class="stat-label">Average:</span>
                <span class="stat-value">
                  {{
                    Math.round(
                      roomStore.currentRoom.votes
                        .filter(v => typeof v.value === 'number')
                        .reduce((sum, v) => sum + (v.value as number), 0) /
                      roomStore.currentRoom.votes.filter(v => typeof v.value === 'number').length * 100
                    ) / 100 || 'N/A'
                  }}
                </span>
              </div>
              <div class="stat">
                <span class="stat-label">Consensus:</span>
                <span class="stat-value">
                  {{
                    new Set(roomStore.currentRoom.votes.map(v => v.value)).size === 1 ? 'Yes' : 'No'
                  }}
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>

      <!-- Story Section -->
      <section class="story-section card">
        <h2>Current Story</h2>
        <div v-if="roomStore.currentRoom?.currentStory" class="current-story">
          {{ roomStore.currentRoom.currentStory }}
        </div>
        <div v-else class="no-story">
          No story set yet
        </div>
        <form @submit.prevent="handleUpdateStory" class="story-form">
          <input
            v-model="storyInput"
            type="text"
            class="form-input"
            placeholder="Enter new story or task..."
          />
          <button type="submit" class="btn btn-primary" :disabled="!storyInput.trim()">
            <Icon name="mdi:plus" />
            Update
          </button>
        </form>
      </section>
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

.story-section {
  margin-top: 2rem;

  h2 {
    margin-bottom: 1rem;
  }
}

.current-story {
  background: #f8fafc;
  padding: 1rem;
  border-radius: 0.375rem;
  border: 1px solid #e2e8f0;
  margin-bottom: 1rem;
  font-weight: 500;
}

.no-story {
  color: #64748b;
  font-style: italic;
  margin-bottom: 1rem;
}

.story-form {
  display: flex;
  gap: 0.5rem;

  .form-input {
    flex: 1;
  }
}

.content-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
}

.voting-section {
  .card {
    margin-bottom: 1.5rem;
  }

  h2 {
    margin-bottom: 1.5rem;
  }
}

.vote-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(60px, 1fr));
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.vote-card {
  aspect-ratio: 3/4;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 0.5rem;
  font-size: 1.125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover:not(:disabled) {
    border-color: #2563eb;
    background: #eff6ff;
  }

  &.selected {
    border-color: #2563eb;
    background: #2563eb;
    color: white;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.spectator-message {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 2rem;
  color: #64748b;
  background: #f8fafc;
  border-radius: 0.5rem;
  border: 1px solid #e2e8f0;
}

.vote-controls {
  display: flex;
  gap: 1rem;

  .btn {
    flex: 1;
  }
}

.users-section {
  .card {
    margin-bottom: 1.5rem;
  }

  h2 {
    margin-bottom: 1rem;
  }
}

.users-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.user-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: #f8fafc;
  border-radius: 0.375rem;
  border: 1px solid #e2e8f0;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;

  .spectator {
    color: #64748b;
  }
}

.user-name {
  font-weight: 500;
}

.spectator-badge {
  font-size: 0.75rem;
  background: #64748b;
  color: white;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
}

.vote-indicator {
  width: 2rem;
  height: 2rem;
  border-radius: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  font-weight: 600;

  &.voted:not(.revealed) {
    background: #10b981;
    color: white;
  }

  &:not(.voted):not(.revealed) {
    background: #e2e8f0;
    color: #64748b;
  }

  &.revealed {
    background: #2563eb;
    color: white;
  }
}

.voting-summary {
  h3 {
    margin-bottom: 1rem;
  }
}

.vote-stats {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.stat {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .stat-label {
    color: #64748b;
  }

  .stat-value {
    font-weight: 600;
  }
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

  .vote-options {
    grid-template-columns: repeat(auto-fit, minmax(50px, 1fr));
  }

  .vote-controls {
    flex-direction: column;
  }

  .story-form {
    flex-direction: column;
  }

  .story-section {
    margin-top: 1.5rem;
  }
}
</style>