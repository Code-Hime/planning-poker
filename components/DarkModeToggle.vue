<template>
  <button @click="toggleDarkMode" class="dark-mode-toggle" :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'">
    <Icon :name="isDark ? 'mdi:weather-sunny' : 'mdi:weather-night'" />
  </button>
</template>

<script setup lang="ts">
const { isDark, toggleDarkMode } = useDarkMode()
</script>

<style lang="scss" scoped>
.dark-mode-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border: 1px solid var(--border-color, #e2e8f0);
  border-radius: 0.5rem;
  background: var(--surface-color, #ffffff);
  color: var(--text-primary, #1e293b);
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  &:hover {
    background: var(--hover-color, #f8fafc);
    transform: translateY(-1px);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: translateY(0);
  }

  .icon {
    font-size: 1.25rem;
    transition: transform 0.3s ease;
  }

  &:hover .icon {
    transform: rotate(15deg);
  }
}

// Dark mode styles
:global(.dark) .dark-mode-toggle {
  --border-color: #334155;
  --surface-color: #1e293b;
  --text-primary: #f1f5f9;
  --hover-color: #334155;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}
</style>
