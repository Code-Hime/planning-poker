<script setup lang="ts">
const userName = ref('')
const roomId = ref('')
const isSpectator = ref(false)
const error = ref('')
const showJoinForm = ref(false)
const showRoomSettings = ref(false)

// Room settings
const customVoteOptions = ref({
  includeHigherNumbers: false,
  includeCoffeeBreak: true,
  includeInfinity: true,
  includeQuestionMark: true
})

function generateRoomId() {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

function generateVoteOptions() {
  const baseOptions: (number | string)[] = [0, 1, 2, 3, 5, 8, 13]
  const options = [...baseOptions]
  
  if (customVoteOptions.value.includeHigherNumbers) {
    options.push(21, 34, 55, 89)
  }
  
  if (customVoteOptions.value.includeQuestionMark) {
    options.push('?')
  }
  
  if (customVoteOptions.value.includeCoffeeBreak) {
    options.push('☕')
  }
  
  if (customVoteOptions.value.includeInfinity) {
    options.push('∞')
  }
  
  return options
}

async function joinRoom() {
  if (!userName.value || !roomId.value) return
  
  try {
    error.value = ''
    await navigateTo(`/room/${roomId.value}?name=${encodeURIComponent(userName.value)}&spectator=${isSpectator.value}`)
  } catch (err) {
    error.value = 'Failed to join room'
  }
}

async function createRoom() {
  if (!userName.value) return
  
  try {
    error.value = ''
    const newRoomId = generateRoomId()
    const voteOptions = generateVoteOptions()
    const voteOptionsParam = encodeURIComponent(JSON.stringify(voteOptions))
    await navigateTo(`/room/${newRoomId}?name=${encodeURIComponent(userName.value)}&spectator=false&voteOptions=${voteOptionsParam}`)
  } catch (err) {
    error.value = 'Failed to create room'
  }
}

function toggleJoinForm() {
  showJoinForm.value = !showJoinForm.value
  if (!showJoinForm.value) {
    roomId.value = ''
    error.value = ''
  }
}

function toggleRoomSettings() {
  showRoomSettings.value = !showRoomSettings.value
}

// SEO
useHead({
  title: 'Planning Poker - Simple Sprint Planning',
  meta: [
    { name: 'description', content: 'Join or create a planning poker room for your agile team. Simple, fast, and effective sprint planning.' }
  ]
})
</script>

<template>
  <div class="home-page">
    <div class="container">
      <div class="hero">
        <h1 class="hero-title">
          <Icon name="mdi:poker-chip" class="hero-icon" />
          Planning Poker
        </h1>
        <p class="hero-subtitle">
          Simple sprint planning for agile teams
        </p>
      </div>

      <div class="actions">
        <div class="card main-card">
          <h2>Get Started</h2>
          
          <!-- Name Input (Always Visible) -->
          <div class="form-group">
            <label for="userName" class="form-label">Your Name</label>
            <input
              id="userName"
              v-model="userName"
              type="text"
              class="form-input"
              placeholder="Enter your name"
              required
            />
          </div>

          <!-- Action Buttons -->
          <div class="action-buttons">
            <button 
              @click="toggleJoinForm" 
              class="btn btn-primary"
              :disabled="!userName"
            >
              <Icon name="mdi:login" />
              {{ showJoinForm ? 'Cancel Join' : 'Join Room' }}
            </button>

            <button 
              @click="createRoom" 
              class="btn btn-secondary" 
              :disabled="!userName"
            >
              <Icon name="mdi:plus" />
              Create Room
            </button>
          </div>

          <!-- Room Settings Toggle -->
          <div class="settings-toggle">
            <button 
              @click="toggleRoomSettings" 
              class="btn btn-outline"
              :disabled="!userName"
            >
              <Icon name="mdi:cog" />
              {{ showRoomSettings ? 'Hide Settings' : 'Room Settings' }}
            </button>
          </div>

          <!-- Join Form (Conditional) -->
          <div v-if="showJoinForm" class="join-form">
            <div class="form-group">
              <label for="roomId" class="form-label">Room Code</label>
              <input
                id="roomId"
                v-model="roomId"
                type="text"
                class="form-input"
                placeholder="Enter room code"
                required
              />
            </div>

            <div class="form-group">
              <label class="checkbox-label">
                <input
                  v-model="isSpectator"
                  type="checkbox"
                  class="checkbox"
                />
                Join as spectator (won't vote)
              </label>
            </div>

            <button 
              @click="joinRoom" 
              class="btn btn-primary full-width" 
              :disabled="!userName || !roomId"
            >
              <Icon name="mdi:arrow-right" />
              Join Room
            </button>
          </div>

          <!-- Room Settings (Conditional) -->
          <div v-if="showRoomSettings" class="room-settings">
            <h3>Voting Options</h3>
            <p class="settings-description">Customize the voting cards available in your room</p>
            
            <div class="settings-options">
              <div class="setting-item">
                <label class="checkbox-label">
                  <input
                    v-model="customVoteOptions.includeHigherNumbers"
                    type="checkbox"
                    class="checkbox"
                  />
                  Include higher numbers (21, 34, 55, 89)
                </label>
              </div>
              
              <div class="setting-item">
                <label class="checkbox-label">
                  <input
                    v-model="customVoteOptions.includeQuestionMark"
                    type="checkbox"
                    class="checkbox"
                  />
                  Include question mark (?)
                </label>
              </div>
              
              <div class="setting-item">
                <label class="checkbox-label">
                  <input
                    v-model="customVoteOptions.includeCoffeeBreak"
                    type="checkbox"
                    class="checkbox"
                  />
                  Include coffee break (☕)
                </label>
              </div>
              
              <div class="setting-item">
                <label class="checkbox-label">
                  <input
                    v-model="customVoteOptions.includeInfinity"
                    type="checkbox"
                    class="checkbox"
                  />
                  Include infinity (∞)
                </label>
              </div>
            </div>
            
            <div class="vote-preview">
              <h4>Preview:</h4>
              <div class="vote-options-preview">
                <span 
                  v-for="option in generateVoteOptions()" 
                  :key="option" 
                  class="vote-option-preview"
                >
                  {{ option }}
                </span>
              </div>
            </div>
          </div>

          <!-- Create Room Hint -->
          <div v-if="!showJoinForm && !showRoomSettings" class="create-hint">
            <Icon name="mdi:information" />
            <span>Create a room to get a random room code, or join an existing room</span>
          </div>
        </div>
      </div>

      <div v-if="error" class="error-message">
        <Icon name="mdi:alert-triangle" />
        {{ error }}
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.home-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 0;
}

.hero {
  text-align: center;
  margin-bottom: 3rem;
}

.hero-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 2.5rem;
  font-weight: 700;
  color: #2563eb;
  margin-bottom: 0.5rem;
}

.hero-icon {
  font-size: 2.5rem;
}

.hero-subtitle {
  font-size: 1.125rem;
  color: #64748b;
}

.actions {
  max-width: 500px;
  margin: 0 auto;
}

.main-card {
  h2 {
    margin-bottom: 2rem;
    color: #1e293b;
    text-align: center;
  }
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }
}

.action-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.settings-toggle {
  text-align: center;
  margin-bottom: 1.5rem;
}

.join-form {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
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
  margin-top: 1rem;
}

.room-settings {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
  animation: slideDown 0.3s ease-out;

  h3 {
    margin-bottom: 0.5rem;
    color: #1e293b;
    font-size: 1.125rem;
  }

  .settings-description {
    margin-bottom: 1.5rem;
    color: #6b7280;
    font-size: 0.875rem;
  }
}

.settings-options {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.setting-item {
  .checkbox-label {
    font-size: 0.875rem;
    color: #374151;
  }
}

.vote-preview {
  h4 {
    margin-bottom: 0.75rem;
    color: #1e293b;
    font-size: 1rem;
  }
}

.vote-options-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.vote-option-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 2rem;
  height: 2rem;
  padding: 0 0.5rem;
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.create-hint {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
  text-align: center;
  margin-top: 1rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #fee2e2;
  color: #dc2626;
  padding: 1rem;
  border-radius: 0.5rem;
  margin-top: 2rem;
}

// Responsive
@media (max-width: 768px) {
  .hero-title {
    font-size: 2rem;
  }
  
  .action-buttons {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
  
  .actions {
    max-width: 100%;
    padding: 0 1rem;
  }
}
</style>
