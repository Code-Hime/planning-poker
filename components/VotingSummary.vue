<script setup lang="ts">
import type { Vote } from '~/types/poker'

interface Props {
  votes?: Vote[]
  isRevealed?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  votes: () => [],
  isRevealed: false
})

function calculateAverage(votes: Vote[]): number | string {
  const numericVotes = votes
    .filter(v => typeof v.value === 'number')
    .map(v => v.value as number)
  
  if (numericVotes.length === 0) return 'N/A'
  
  const sum = numericVotes.reduce((acc, vote) => acc + vote, 0)
  const average = sum / numericVotes.length
  
  return Math.round(average * 100) / 100
}
</script>

<template>
  <div v-if="props.isRevealed && props.votes.length" class="card voting-summary">
    <h3>Voting Summary</h3>
    <div class="vote-stats">
      <div class="stat">
        <span class="stat-label">Average:</span>
        <span class="stat-value">
          {{ calculateAverage(props.votes) }}
        </span>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
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

// Dark mode styles
:global(.dark) {
  .stat-label {
    color: #94a3b8;
  }

  .stat-value {
    color: #f1f5f9;
  }
}
</style>
