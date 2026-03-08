import { ref, computed, watch } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js'

const STORAGE_KEY = 'app-theme'
const LABELS = { 'theme-light': '☀️', 'theme-dark': '🌙' }

export function useTheme() {
  const saved = localStorage.getItem(STORAGE_KEY) || 'theme-light'
  const theme = ref(['theme-light', 'theme-dark'].includes(saved) ? saved : 'theme-light')

  function applyTheme(t) {
    document.body.classList.toggle('theme-dark', t === 'theme-dark')
  }

  applyTheme(theme.value)

  watch(theme, t => {
    applyTheme(t)
    localStorage.setItem(STORAGE_KEY, t)
  })

  function cycleTheme() {
    theme.value = theme.value === 'theme-light' ? 'theme-dark' : 'theme-light'
  }

  const themeLabel = computed(() => LABELS[theme.value])

  return { theme, themeLabel, cycleTheme }
}
