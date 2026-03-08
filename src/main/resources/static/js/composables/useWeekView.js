import { ref, computed } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js'
import { EMOJI_SCORE, DAY_LABELS, toDateStr } from '../constants.js'

export function useWeekView({ todayStr }) {
  const today = new Date()
  const weekStart = ref((() => {
    const d = new Date(today)
    d.setDate(d.getDate() - d.getDay())
    return d
  })())
  const weekEntries  = ref({})
  const weekNote     = ref('')
  const weekNoteSaved = ref(false)
  const weekDayNotes  = ref({})
  const weekHabitLogs = ref({})
  const weekSleepLogs = ref({})

  const weekDays = computed(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart.value)
      d.setDate(d.getDate() + i)
      return toDateStr(d.getFullYear(), d.getMonth() + 1, d.getDate())
    })
  })

  const weekScore = computed(() => {
    let total = 0, count = 0
    for (const dayMap of Object.values(weekEntries.value)) {
      for (const codes of Object.values(dayMap)) {
        for (const code of codes) {
          if (EMOJI_SCORE[code] !== undefined) {
            total += EMOJI_SCORE[code]
            count++
          }
        }
      }
    }
    return count > 0 ? total / count : null
  })

  const weekLabel = computed(() => {
    const days = weekDays.value
    const [sy, sm, sd] = days[0].split('-')
    const [ey, em, ed] = days[6].split('-')
    return `${sd}/${sm} - ${ed}/${em}/${ey}`
  })

  function starsDisplay(score) {
    const full = Math.round(score)
    return '★'.repeat(full) + '☆'.repeat(5 - full)
  }

  async function loadWeekSummary() {
    const ws = weekDays.value[0]
    try {
      const res = await fetch(`/mood/week-summary?weekStart=${ws}`)
      if (res.status === 204) {
        weekNote.value = ''
      } else {
        const data = await res.json()
        weekNote.value = data.note || ''
      }
    } catch (e) {
      // silently ignore
    }
    weekNoteSaved.value = false
  }

  async function saveWeekSummary() {
    const ws = weekDays.value[0]
    try {
      await fetch('/mood/week-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weekStart: ws, note: weekNote.value })
      })
      weekNoteSaved.value = true
      setTimeout(() => { weekNoteSaved.value = false }, 2000)
    } catch (e) {
      // silently ignore
    }
  }

  async function loadWeek() {
    try {
      const days = weekDays.value
      const [entriesRes, dayNotesRes] = await Promise.all([
        fetch(`/mood/week?start=${days[0]}&end=${days[6]}`),
        fetch(`/mood/day-notes?start=${days[0]}&end=${days[6]}`),
        loadWeekSummary()
      ])
      const entries = await entriesRes.json()
      const map = {}
      entries.forEach(e => {
        if (!map[e.date]) map[e.date] = {}
        map[e.date][e.slot] = e.emojiCode ? e.emojiCode.split(',') : []
      })
      weekEntries.value = map

      const dayNotes = await dayNotesRes.json()
      const notesMap = {}
      dayNotes.forEach(n => { notesMap[n.date] = n.note })
      weekDayNotes.value = notesMap
    } catch (e) {
      // silently ignore
    }

    try {
      const days = weekDays.value
      const habitLogsRes = await fetch(`/habit-logs/week?start=${days[0]}&end=${days[6]}`)
      const habitLogsData = await habitLogsRes.json()
      const hlMap = {}
      habitLogsData.forEach(l => {
        if (!hlMap[l.habitId]) hlMap[l.habitId] = {}
        hlMap[l.habitId][l.date] = l.status
      })
      weekHabitLogs.value = hlMap
    } catch (e) {
      // silently ignore
    }

    try {
      const days = weekDays.value
      const sleepRes = await fetch(`/sleep-log/range?start=${days[0]}&end=${days[6]}`)
      const sleepData = await sleepRes.json()
      const sleepMap = {}
      sleepData.forEach(s => { sleepMap[s.date] = { bedtime: s.bedtime, wakeTime: s.wakeTime, quality: s.quality } })
      weekSleepLogs.value = sleepMap
    } catch (e) {
      // silently ignore
    }
  }

  function prevWeek() {
    const d = new Date(weekStart.value)
    d.setDate(d.getDate() - 7)
    weekStart.value = d
    loadWeek()
  }

  function nextWeek() {
    const d = new Date(weekStart.value)
    d.setDate(d.getDate() + 7)
    weekStart.value = d
    loadWeek()
  }

  function weekHabitStatusIcon(status) {
    if (status === 'DONE') return '✅'
    if (status === 'NOT_DONE') return '❌'
    if (status === 'IGNORE') return '➖'
    return ''
  }

  return {
    weekStart,
    weekEntries,
    weekNote,
    weekNoteSaved,
    weekDayNotes,
    weekHabitLogs,
    weekSleepLogs,
    weekDays,
    weekScore,
    weekLabel,
    loadWeek,
    loadWeekSummary,
    saveWeekSummary,
    prevWeek,
    nextWeek,
    starsDisplay,
    weekHabitStatusIcon,
  }
}
