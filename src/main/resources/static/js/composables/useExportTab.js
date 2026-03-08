import { ref } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js'
import { SLOTS, emojiName, toDateStr } from '../constants.js'

export function useExportTab() {
  const exportStart = ref('')
  const exportEnd = ref('')
  const exportLoading = ref(false)
  const exportPreset = ref('')

  function setPreset(type) {
    const today = new Date()
    const y = today.getFullYear()
    const m = today.getMonth()
    const d = today.getDate()
    const dow = today.getDay()

    exportPreset.value = type

    if (type === 'today') {
      exportStart.value = toDateStr(y, m + 1, d)
      exportEnd.value = toDateStr(y, m + 1, d)
    } else if (type === 'week') {
      const sun = new Date(today); sun.setDate(d - dow)
      const sat = new Date(sun);  sat.setDate(sun.getDate() + 6)
      exportStart.value = toDateStr(sun.getFullYear(), sun.getMonth() + 1, sun.getDate())
      exportEnd.value   = toDateStr(sat.getFullYear(), sat.getMonth() + 1, sat.getDate())
    } else if (type === '2weeks') {
      const sun = new Date(today); sun.setDate(d - dow - 7)
      const sat = new Date(today); sat.setDate(d + (6 - dow))
      exportStart.value = toDateStr(sun.getFullYear(), sun.getMonth() + 1, sun.getDate())
      exportEnd.value   = toDateStr(sat.getFullYear(), sat.getMonth() + 1, sat.getDate())
    } else if (type === 'month') {
      const lastDay = new Date(y, m + 1, 0).getDate()
      exportStart.value = toDateStr(y, m + 1, 1)
      exportEnd.value   = toDateStr(y, m + 1, lastDay)
    }
  }

  function calcDuration(bedtime, wakeTime) {
    if (!bedtime || !wakeTime) return ''
    const [bh, bm] = bedtime.split(':').map(Number)
    const [wh, wm] = wakeTime.split(':').map(Number)
    let mins = (wh * 60 + wm) - (bh * 60 + bm)
    if (mins < 0) mins += 24 * 60
    const h = Math.floor(mins / 60)
    const min = mins % 60
    return min > 0 ? `${h}h${min}m` : `${h}h`
  }

  function buildDateRange(start, end) {
    const days = []
    for (const d = new Date(start + 'T12:00:00'); d <= new Date(end + 'T12:00:00'); d.setDate(d.getDate() + 1)) {
      days.push(toDateStr(d.getFullYear(), d.getMonth() + 1, d.getDate()))
    }
    return days
  }

  function downloadText(text, filename) {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  async function generateExport() {
    if (!exportStart.value || !exportEnd.value) return
    exportLoading.value = true
    try {
      const s = exportStart.value
      const e = exportEnd.value
      const [moodRes, habitLogsRes, sleepRes, dayNotesRes, habitsRes] = await Promise.all([
        fetch(`/mood/week?start=${s}&end=${e}`),
        fetch(`/habit-logs/week?start=${s}&end=${e}`),
        fetch(`/sleep-log/range?start=${s}&end=${e}`),
        fetch(`/mood/day-notes?start=${s}&end=${e}`),
        fetch('/habits'),
      ])

      const moodEntries = await moodRes.json()
      const habitLogs   = await habitLogsRes.json()
      const sleepLogs   = await sleepRes.json()
      const dayNotes    = await dayNotesRes.json()
      const habits      = await habitsRes.json()

      const days = buildDateRange(s, e)
      const [sy, sm, sd] = s.split('-')
      const [ey, em, ed] = e.split('-')
      const rangeLabel = `${sd}/${sm}/${sy} \u2013 ${ed}/${em}/${ey}`

      const lines = []
      lines.push(`Exporta\u00e7\u00e3o: ${rangeLabel}`)
      lines.push('')

      // HUMOR
      const moodMap = {}
      moodEntries.forEach(entry => {
        if (!moodMap[entry.date]) moodMap[entry.date] = {}
        moodMap[entry.date][entry.slot] = entry.emojiCode ? entry.emojiCode.split(',') : []
      })
      const moodDays = days.filter(d => moodMap[d] && Object.keys(moodMap[d]).length > 0)
      if (moodDays.length > 0) {
        lines.push('\u2500\u2500 HUMOR \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500')
        const slotLabels = SLOTS.map(s => s.label)
        lines.push(`Data   | ${slotLabels.join(' | ')}`)
        lines.push(`-------|-${slotLabels.map(() => '----------').join('-|-')}`)
        for (const date of moodDays) {
          const [, dm, dd] = date.split('-')
          const dayMap = moodMap[date] || {}
          const cells = SLOTS.map(slot => {
            const codes = dayMap[slot.key] || []
            return codes.map(c => emojiName(c)).join(', ') || '-'
          })
          lines.push(`${dd}/${dm}  | ${cells.join(' | ')}`)
        }
        lines.push('')
      }

      // SONO
      const sleepMap = {}
      sleepLogs.forEach(sl => { sleepMap[sl.date] = sl })
      const sleepDays = days.filter(d => sleepMap[d])
      if (sleepDays.length > 0) {
        lines.push('\u2500\u2500 SONO \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500')
        lines.push('Data   | Dormi \u00e0s | Acordei \u00e0s | Dura\u00e7\u00e3o | Qualidade')
        lines.push('-------|----------|------------|---------|----------')
        for (const date of sleepDays) {
          const sl = sleepMap[date]
          const [, dm, dd] = date.split('-')
          const dur = calcDuration(sl.bedtime, sl.wakeTime)
          lines.push(`${dd}/${dm}  | ${(sl.bedtime || '--:--').padEnd(8)} | ${(sl.wakeTime || '--:--').padEnd(10)} | ${dur.padEnd(7)} | ${sl.quality || ''}`)
        }
        lines.push('')
      }

      // HABITOS
      if (habits.length > 0) {
        const hlMap = {}
        habitLogs.forEach(l => {
          if (!hlMap[l.habitId]) hlMap[l.habitId] = {}
          hlMap[l.habitId][l.date] = l.status
        })
        const dayNums = days.map(d => d.split('-')[2])
        lines.push('\u2500\u2500 H\u00c1BITOS \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500')
        lines.push(`H\u00e1bito          | ${dayNums.join(' | ')} | Total`)
        lines.push(`----------------|${dayNums.map(() => '---').join('-|-')}-|-------`)
        for (const habit of habits) {
          const logsByDate = hlMap[habit.id] || {}
          const cells = days.map(d => {
            const st = logsByDate[d]
            if (st === 'DONE')     return '\u2705'
            if (st === 'NOT_DONE') return '\u274c'
            if (st === 'IGNORE')   return '\u2796'
            return '  '
          })
          const done = days.filter(d => logsByDate[d] === 'DONE').length
          const name = `${habit.icon || ''} ${habit.name}`.substring(0, 14).padEnd(14)
          lines.push(`${name} | ${cells.join(' | ')} | ${done}/${days.length}`)
        }
        lines.push('')
      }

      // NOTAS
      const noteMap = {}
      dayNotes.forEach(n => { noteMap[n.date] = n.note })
      const noteDays = days.filter(d => noteMap[d])
      if (noteDays.length > 0) {
        lines.push('\u2500\u2500 NOTAS POR DIA \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500')
        for (const date of noteDays) {
          const [, dm, dd] = date.split('-')
          lines.push(`${dd}/${dm}: ${noteMap[date]}`)
        }
      }

      downloadText(lines.join('\n'), `rotina-${s}-${e}.txt`)
    } catch (e) {
      // silently ignore
    } finally {
      exportLoading.value = false
    }
  }

  return {
    exportStart,
    exportEnd,
    exportLoading,
    exportPreset,
    setPreset,
    generateExport,
  }
}
