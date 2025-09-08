<script setup lang="ts">
import type { User, Vote, VoteValue } from '~/types/poker'

interface Props {
  users?: User[]
  votes?: Vote[]
  isRevealed?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  users: () => [],
  votes: () => [],
  isRevealed: false
})

function getVoteDisplay(vote: VoteValue) {
  return vote.toString()
}

function getUserVote(userId: string): Vote | undefined {
  return props.votes.find(v => v.userId === userId)
}

function hasUserVoted(userId: string): boolean {
  return props.votes.some(v => v.userId === userId)
}
</script>

<template>
  <section class="users-section">
    <div class="card">
      <h2>Team Members ({{ props.users.length }})</h2>
      <div class="users-list">
        <div
          v-for="user in props.users"
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
                  'voted': hasUserVoted(user.id),
                  'revealed': props.isRevealed
                }
              ]"
            >
              <template v-if="props.isRevealed">
                <Icon 
                  v-if="getUserVote(user.id)?.value === 'ski'" 
                  name="ic:baseline-downhill-skiing" 
                  class="ski-icon-small"
                />
                <span v-else>
                  {{ getVoteDisplay(getUserVote(user.id)?.value || '?') }}
                </span>
              </template>
              <template v-else>
                <Icon name="mdi:check" v-if="hasUserVoted(user.id)" />
                <Icon name="mdi:clock-outline" v-else />
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
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
  color: #1e293b;

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

.ski-icon-small {
  font-size: 1em;
  transform: rotate(-90deg);
  display: block;
}

// Dark mode styles
:global(.dark) {
  .team-member {
    background: #1e293b;
    border-color: #334155;
  }

  .spectator {
    color: #94a3b8;
  }

  .spectator-badge {
    background: #64748b;
    color: white;
  }

  .vote-indicator {
    &:not(.voted):not(.revealed) {
      background: #334155;
      color: #94a3b8;
    }
  }
}
</style>
