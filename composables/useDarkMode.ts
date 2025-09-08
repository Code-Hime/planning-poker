export function useDarkMode() {
  const isDark = ref(false)

  // Initialize dark mode from localStorage or system preference
  function initDarkMode() {
    if (process.client) {
      const saved = localStorage.getItem('dark-mode')
      if (saved !== null) {
        isDark.value = saved === 'true'
      } else {
        // Check system preference
        isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
      }
      applyDarkMode()
    }
  }

  // Apply dark mode to document
  function applyDarkMode() {
    if (process.client) {
      if (isDark.value) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
  }

  // Toggle dark mode
  function toggleDarkMode() {
    isDark.value = !isDark.value
    if (process.client) {
      localStorage.setItem('dark-mode', isDark.value.toString())
    }
    applyDarkMode()
  }

  // Initialize on mount
  onMounted(() => {
    initDarkMode()
  })

  return {
    isDark: readonly(isDark),
    toggleDarkMode
  }
}
