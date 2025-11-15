<script setup lang="ts">
import type { Vote, VoteValue } from '~/types/poker'

interface StoryRow {
  id: string
  story: string
  votes?: Vote[]
  average?: number
  timestamp: Date
  isCurrent: boolean
}

interface Props {
  currentStory?: string
  votes?: Vote[]
  isRevealed?: boolean
}

interface Emits {
  (e: 'update-story', story: string): void
  (e: 'clear-history'): void
  (e: 'reset-votes'): void
}

const props = withDefaults(defineProps<Props>(), {
  currentStory: undefined,
  votes: () => [],
  isRevealed: false
})

const emit = defineEmits<Emits>()
const storyInput = ref('')

// Internal story management
const storyRows = ref<StoryRow[]>([])

// Computed property for template access
const storyRowsList = computed(() => storyRows.value)

// Watch for story changes to create new rows
watch(() => props.currentStory, (newStory, oldStory) => {
  if (newStory && newStory !== oldStory) {
    // Mark previous story as not current
    storyRows.value.forEach(row => {
      row.isCurrent = false
    })
    
    // Add new story row
    const newRow: StoryRow = {
      id: Date.now().toString(),
      story: newStory,
      votes: [],
      average: undefined,
      timestamp: new Date(),
      isCurrent: true
    }
    storyRows.value.push(newRow)
    
    // Reset votes when a new story is added
    emit('reset-votes')
  }
}, { immediate: true })

// Watch for vote reveals to update current story
watch(() => props.isRevealed, (isRevealed) => {
  if (isRevealed && props.votes.length > 0) {
    const currentRow = storyRows.value.find(row => row.isCurrent)
    if (currentRow) {
      currentRow.votes = [...props.votes]
      const avg = calculateAverage(props.votes)
      currentRow.average = typeof avg === 'number' ? avg : undefined
    }
  }
})

// Watch for vote changes to update current story
watch(() => props.votes, (newVotes) => {
  if (props.isRevealed && newVotes.length > 0) {
    const currentRow = storyRows.value.find(row => row.isCurrent)
    if (currentRow) {
      currentRow.votes = [...newVotes]
      const avg = calculateAverage(newVotes)
      currentRow.average = typeof avg === 'number' ? avg : undefined
    }
  }
}, { deep: true })

function handleUpdateStory() {
  if (storyInput.value.trim()) {
    emit('update-story', storyInput.value.trim())
    storyInput.value = ''
  }
}

function handleClearHistory() {
  storyRows.value = []
  emit('clear-history')
  emit('reset-votes')
}

function calculateAverage(votes: Vote[]): number | string {
  const numericVotes = votes
    .filter(v => typeof v.value === 'number')
    .map(v => v.value as number)
  
  if (numericVotes.length === 0) return 'N/A'
  
  const sum = numericVotes.reduce((acc, vote) => acc + vote, 0)
  const average = sum / numericVotes.length
  
  return Math.round(average * 100) / 100
}

function getVoteDisplay(vote: VoteValue) {
  return vote.toString()
}
</script>

<template>
  <section class="story-section card">
    <h2>Stories</h2>
    
    <!-- Story Rows Display -->
    <div class="story-rows">
      <div 
        v-for="row in storyRowsList" 
        :key="row.id" 
        class="story-row"
        :class="{ 'current': row.isCurrent }"
      >
        <div class="story-name">
          {{ row.story }}
          <span v-if="row.isCurrent" class="current-badge">Current</span>
        </div>
        <div class="story-votes">
          <div v-if="row.votes && row.votes.length > 0" class="vote-display">
            <div class="vote-values">
              <span 
                v-for="vote in row.votes" 
                :key="vote.userId" 
                class="vote-value"
              >
                <Icon 
                  v-if="vote.value === 'ski'" 
                  name="ic:baseline-downhill-skiing" 
                  class="ski-icon-small"
                />
                <span v-else>{{ getVoteDisplay(vote.value || '?') }}</span>
              </span>
            </div>
            <div class="vote-average">
              <span class="average-value">{{ row.average || calculateAverage(row.votes) }}</span>
            </div>
          </div>
          <div v-else class="no-votes">
            <span v-if="row.isCurrent && !props.isRevealed">Voting in progress...</span>
            <span v-else-if="row.isCurrent && props.isRevealed && (!props.votes || props.votes.length === 0)">No votes</span>
            <span v-else>No votes</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Add New Story Form -->
    <form @submit.prevent="handleUpdateStory" class="story-form">
      <input
        v-model="storyInput"
        type="text"
        class="form-input"
        placeholder="Enter new story or task..."
      />
      <button type="submit" class="btn btn-primary" :disabled="!storyInput.trim()">
        <Icon name="mdi:plus" />
        Add Story
      </button>
    </form>

    <!-- Clear History Button -->
    <div v-if="storyRowsList.length > 0" class="clear-section">
      <button @click="handleClearHistory" class="btn btn-outline btn-small">
        <Icon name="mdi:trash-can" />
        Clear All Stories
      </button>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.story-section {
  margin-top: 2rem;

  h2 {
    margin-bottom: 1.5rem;
  }
}

.story-rows {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.story-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  transition: all 0.2s ease;

  &.current {
    background: #eff6ff;
    border-color: #3b82f6;
    box-shadow: 0 1px 3px 0 rgba(59, 130, 246, 0.1);
  }

  &:hover {
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.1);
  }
}

.story-name {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 500;
  color: #1e293b;
  flex: 1;
  min-width: 0;
}

.current-badge {
  background: #3b82f6;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.story-votes {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-shrink: 0;
}

.vote-display {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.no-votes {
  color: #64748b;
  font-style: italic;
  font-size: 0.875rem;
}

.clear-section {
  display: flex;
  justify-content: flex-end;
  padding-top: 1rem;
  margin-top: 1rem;
  border-top: 1px solid #e2e8f0;
}

.current-story {
  background: #f8fafc;
  padding: 1rem;
  border-radius: 0.375rem;
  border: 1px solid #e2e8f0;
  margin-bottom: 1rem;
  font-weight: 500;
}

.story-content {
  margin-bottom: 0.75rem;
}

.story-votes {
  border-top: 1px solid #e2e8f0;
  padding-top: 0.75rem;
  margin-top: 0.75rem;
}

.votes-display {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.votes-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #64748b;
}

.vote-values {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.vote-value {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 2rem;
  height: 2rem;
  padding: 0 0.5rem;
  background: #e2e8f0;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}

.ski-icon-small {
  font-size: 1em;
  transform: rotate(-90deg);
  display: block;
}

.vote-average {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.average-label {
  color: #64748b;
  font-weight: 500;
}

.average-value {
  font-weight: 600;
  color: #2563eb;
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

.story-history {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e2e8f0;

  h3 {
    margin-bottom: 1rem;
    color: #1e293b;
    font-size: 1.125rem;
  }
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.btn-small {
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
}

.btn-outline {
  background: transparent;
  border: 1px solid #d1d5db;
  color: #6b7280;

  &:hover {
    background: #f9fafb;
    border-color: #9ca3af;
  }
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 300px;
  overflow-y: auto;
}

.history-item {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  padding: 1rem;
}

.history-story {
  font-weight: 500;
  margin-bottom: 0.75rem;
  color: #1e293b;
}

.history-meta {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.history-votes {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.history-stats {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.875rem;
}

.timestamp {
  color: #64748b;
  font-size: 0.75rem;
}

// Dark mode styles
:global(.dark) {
  .story-row {
    background: #1e293b;
    border-color: #334155;

    &.current {
      background: #1e40af;
      border-color: #3b82f6;
    }
  }

  .story-name {
    color: #f1f5f9;
  }

  .current-badge {
    background: #3b82f6;
    color: white;
  }

  .vote-value {
    background: #334155;
    color: #f1f5f9;
  }

  .average-value {
    background: #1e40af;
    color: #f1f5f9;
  }

  .no-votes {
    color: #94a3b8;
  }

  .history-item {
    background: #1e293b;
    border-color: #334155;
  }

  .history-story {
    color: #f1f5f9;
  }

  .timestamp {
    color: #94a3b8;
  }
}

// Responsive
@media (max-width: 768px) {
  .story-section {
    margin-top: 1.5rem;
  }

  .story-form {
    flex-direction: column;
  }

  .history-header {
    flex-direction: column;
    gap: 0.5rem;
    align-items: stretch;
  }

  .story-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .story-name {
    width: 100%;
  }

  .story-votes {
    width: 100%;
    justify-content: flex-end;
  }

  .clear-section {
    justify-content: center;
  }
}

</style>
