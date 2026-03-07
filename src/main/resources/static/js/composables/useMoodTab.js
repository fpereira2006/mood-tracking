import { ref, computed } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js'
import { MONTH_NAMES, toDateStr } from '../constants.js'

export function useMoodTab() {
  const today = new Date()
  const todayStr = toDateStr(today.getFullYear(), today.getMonth() + 1, today.getDate())

  const currentYear  = ref(today.getFullYear())
  const currentMonth = ref(today.getMonth() + 1)
  const selectedDate = ref(todayStr)
  const monthEntries = ref({})
  const dayEntries   = ref({})
  const error        = ref('')
  const dayNote      = ref('')
  const dayNoteSaved = ref(false)
  const activeTab    = ref('mood')

  const monthLabel = computed(() =>
    `${MONTH_NAMES[currentMonth.value - 1]} ${currentYear.value}`
  )

  const formattedSelectedDate = computed(() => {
    const [y, m, d] = selectedDate.value.split('-')
    return `${d}/${m}/${y}`
  })

  const calendarDays = computed(() => {
    const firstDay = new Date(currentYear.value, currentMonth.value - 1, 1).getDay()
    const daysInMonth = new Date(currentYear.value, currentMonth.value, 0).getDate()
    const cells = []
    for (let i = 0; i < firstDay; i++) cells.push(null)
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push(toDateStr(currentYear.value, currentMonth.value, d))
    }
    return cells
  })

  async function loadMonth() {
    try {
      const res = await fetch(`/mood/month?year=${currentYear.value}&month=${currentMonth.value}`)
      const entries = await res.json()
      const map = {}
      entries.forEach(e => { map[e.date] = true })
      monthEntries.value = map
    } catch (e) {
      error.value = 'Erro ao carregar mes.'
    }
  }

  async function loadDay(date) {
    try {
      const res = await fetch(`/mood?date=${date}`)
      const entries = await res.json()
      const map = {}
      entries.forEach(e => { map[e.slot] = e.emojiCode ? e.emojiCode.split(',') : [] })
      dayEntries.value = map
    } catch (e) {
      error.value = 'Erro ao carregar dia.'
    }
    try {
      const res = await fetch(`/mood/day-note?date=${date}`)
      dayNote.value = res.status === 204 ? '' : (await res.json()).note || ''
    } catch (e) {
      dayNote.value = ''
    }
    dayNoteSaved.value = false
  }

  async function saveDayNote() {
    try {
      await fetch('/mood/day-note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: selectedDate.value, note: dayNote.value })
      })
      dayNoteSaved.value = true
      setTimeout(() => { dayNoteSaved.value = false }, 2000)
    } catch (e) {
      error.value = 'Erro ao salvar observação.'
    }
  }

  function prevMonth() {
    if (currentMonth.value === 1) {
      currentMonth.value = 12
      currentYear.value--
    } else {
      currentMonth.value--
    }
    loadMonth()
  }

  function nextMonth() {
    if (currentMonth.value === 12) {
      currentMonth.value = 1
      currentYear.value++
    } else {
      currentMonth.value++
    }
    loadMonth()
  }

  function selectDay(date) {
    selectedDate.value = date
    error.value = ''
    loadDay(date)
  }

  async function saveEmoji(slot, emojiCode) {
    error.value = ''
    const current = dayEntries.value[slot] || []
    const isSelected = current.includes(emojiCode)
    const updated = isSelected ? current.filter(c => c !== emojiCode) : [...current, emojiCode]
    try {
      if (updated.length === 0) {
        const res = await fetch(`/mood?date=${selectedDate.value}&slot=${slot}`, { method: 'DELETE' })
        if (!res.ok) throw new Error()
        const newEntries = { ...dayEntries.value }
        delete newEntries[slot]
        dayEntries.value = newEntries
        const hasAny = Object.values(dayEntries.value).some(arr => arr.length > 0)
        if (!hasAny) {
          const map = { ...monthEntries.value }
          delete map[selectedDate.value]
          monthEntries.value = map
        }
      } else {
        const res = await fetch('/mood', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ date: selectedDate.value, slot, emojiCode: updated.join(',') })
        })
        if (!res.ok) throw new Error()
        dayEntries.value = { ...dayEntries.value, [slot]: updated }
        monthEntries.value = { ...monthEntries.value, [selectedDate.value]: true }
      }
    } catch (e) {
      error.value = 'Erro ao salvar. Tente novamente.'
    }
  }

  return {
    todayStr,
    currentYear,
    currentMonth,
    selectedDate,
    monthEntries,
    dayEntries,
    error,
    dayNote,
    dayNoteSaved,
    activeTab,
    monthLabel,
    formattedSelectedDate,
    calendarDays,
    loadMonth,
    loadDay,
    saveDayNote,
    prevMonth,
    nextMonth,
    selectDay,
    saveEmoji,
  }
}
