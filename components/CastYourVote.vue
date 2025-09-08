<script setup lang="ts">
import type { VoteValue } from '~/types/poker'

interface Props {
  voteOptions?: VoteValue[]
  selectedVote?: VoteValue | null
  isSpectator?: boolean
  isRevealed?: boolean
  allUsersVoted?: boolean
}

interface Emits {
  (e: 'vote', vote: VoteValue): void
  (e: 'reveal'): void
  (e: 'reset'): void
}

const props = withDefaults(defineProps<Props>(), {
  voteOptions: () => [],
  selectedVote: null,
  isSpectator: false,
  isRevealed: false,
  allUsersVoted: false
})
const emit = defineEmits<Emits>()

function getVoteDisplay(vote: VoteValue) {
  return vote.toString()
}

function handleVote(vote: VoteValue) {
  emit('vote', vote)
}

function handleReveal() {
  emit('reveal')
}

function handleReset() {
  emit('reset')
}
</script>

<template>
  <section class="voting-section">
    <div class="card">
      <h2>Cast Your Vote</h2>
      <div v-if="!props.isSpectator" class="vote-options">
        <button
          v-for="option in props.voteOptions"
          :key="option"
          @click="handleVote(option)"
          :class="[
            'vote-card',
            { 'selected': props.selectedVote === option }
          ]"
          :disabled="props.isRevealed"
        >
          <Icon 
            v-if="option === 'ski'" 
            name="ic:baseline-downhill-skiing" 
            class="ski-icon"
          />
          <span v-else>{{ getVoteDisplay(option) }}</span>
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
        @click="handleReveal"
        class="btn btn-primary"
        :disabled="!props.allUsersVoted || props.isRevealed"
      >
        <Icon name="mdi:eye" />
        Reveal Votes
      </button>
      <button
        @click="handleReset"
        class="btn btn-secondary"
        :disabled="!props.isRevealed"
      >
        <Icon name="mdi:refresh" />
        Reset Votes
      </button>
    </div>
  </section>
</template>

<style lang="scss" scoped>
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

.ski-icon {
  font-size: 1.5em;
  transform: rotate(-90deg);
  display: block;
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

// Dark mode styles
:global(.dark) {
  .vote-card {
    background: #1e293b;
    border-color: #334155;
    color: #f1f5f9;

    &:hover:not(:disabled) {
      background: #334155;
      border-color: #60a5fa;
    }

    &.selected {
      background: #2563eb;
      color: white;
    }
  }

  .spectator-message {
    background: #1e293b;
    border-color: #334155;
    color: #94a3b8;
  }
}

// Responsive
@media (max-width: 768px) {
  .vote-options {
    grid-template-columns: repeat(auto-fit, minmax(50px, 1fr));
  }

  .vote-controls {
    flex-direction: column;
  }
}
</style>
