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
      for (const code of Object.values(dayMap)) {
        if (EMOJI_SCORE[code] !== undefined) {
          total += EMOJI_SCORE[code]
          count++
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
    const days = weekDays.value
    try {
      const [entriesRes, dayNotesRes] = await Promise.all([
        fetch(`/mood/week?start=${days[0]}&end=${days[6]}`),
        fetch(`/mood/day-notes?start=${days[0]}&end=${days[6]}`),
        loadWeekSummary()
      ])
      const entries = await entriesRes.json()
      const map = {}
      entries.forEach(e => {
        if (!map[e.date]) map[e.date] = {}
        map[e.date][e.slot] = e.emojiCode
      })
      weekEntries.value = map

      const dayNotes = await dayNotesRes.json()
      const notesMap = {}
      dayNotes.forEach(n => { notesMap[n.date] = n.note })
      weekDayNotes.value = notesMap
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

  return {
    weekStart,
    weekEntries,
    weekNote,
    weekNoteSaved,
    weekDayNotes,
    weekDays,
    weekScore,
    weekLabel,
    loadWeek,
    loadWeekSummary,
    saveWeekSummary,
    prevWeek,
    nextWeek,
    starsDisplay,
  }
}
