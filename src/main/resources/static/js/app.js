import { createApp, onMounted } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js'
import { DAY_LABELS, EMOJIS, SLOTS, emojiChar, emojiName } from './constants.js'
import { useMoodTab } from './composables/useMoodTab.js'
import { useWeekView } from './composables/useWeekView.js'
import { usePromptGenerator } from './composables/usePromptGenerator.js'
import { useHabitsTab } from './composables/useHabitsTab.js'

createApp({
  setup() {
    const mood = useMoodTab()
    const week = useWeekView({ todayStr: mood.todayStr })
    const prompt = usePromptGenerator({
      todayStr: mood.todayStr,
      weekDays: week.weekDays,
      weekEntries: week.weekEntries,
      weekNote: week.weekNote,
      weekScore: week.weekScore,
      weekDayNotes: week.weekDayNotes,
    })
    const habitsTab = useHabitsTab()

    function switchTab(tab) {
      mood.activeTab.value = tab
      if (tab === 'week') week.loadWeek()
      if (tab === 'habits') habitsTab.loadHabits()
    }

    onMounted(() => {
      mood.loadMonth()
      mood.loadDay(mood.todayStr)
      habitsTab.loadHabits()
    })

    return {
      ...mood,
      ...week,
      ...prompt,
      ...habitsTab,
      switchTab,
      dayLabels: DAY_LABELS,
      emojis: EMOJIS,
      slots: SLOTS,
      emojiChar,
      emojiName,
    }
  }
}).mount('#app')
