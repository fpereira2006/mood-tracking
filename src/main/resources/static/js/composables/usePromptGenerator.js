import { ref } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js'
import { DAY_LABELS, SLOTS, emojiName } from '../constants.js'

export function usePromptGenerator({ todayStr, weekDays, weekEntries, weekNote, weekScore, weekDayNotes, weekHabitLogs, habits }) {
  const showPromptModal = ref(false)
  const generatedPrompt = ref('')
  const promptCopied = ref(false)

  function generatePrompt() {
    const days = weekDays.value
    const inProgress = days[0] <= todayStr && todayStr <= days[6]

    const [sy, sm, sd] = days[0].split('-')
    const [ey, em, ed] = days[6].split('-')
    const rangeLabel = `${sd}/${sm} \u2013 ${ed}/${em}/${ey}`

    const todayParts = todayStr.split('-')
    const todayFmt = `${todayParts[2]}/${todayParts[1]}`

    const slotLabels = SLOTS.map(s => s.label)

    const tableRows = []
    for (const date of days) {
      if (inProgress && date > todayStr) continue
      const dayMap = weekEntries.value[date] || {}
      if (!Object.keys(dayMap).length) continue

      const [dy, dm, dd] = date.split('-')
      const dayOfWeek = new Date(date + 'T12:00:00').getDay()
      const dayName = `${DAY_LABELS[dayOfWeek]} ${dd}/${dm}`
      const cells = SLOTS.map(s => {
        const codes = dayMap[s.key] || []
        return codes.length > 0 ? codes.map(c => emojiName(c)).join(', ') : '\u2013'
      })
      tableRows.push(`| ${dayName.padEnd(9)} | ${cells.join(' | ')} |`)
    }

    const scoreLabel = inProgress ? 'Nota parcial até agora' : 'Nota geral da semana'
    const scoreDisplay = weekScore.value !== null ? `${weekScore.value.toFixed(1)} / 5` : 'sem registros'

    const noteLabel = inProgress ? 'Minhas observações até agora' : 'Minhas observações'
    const noteText = weekNote.value ? `"${weekNote.value}"` : '(sem observações)'

    const headerPart = inProgress
      ? `Você é um assistente de bem-estar pessoal. Analise APENAS os dados fornecidos nesta mensagem — ignore qualquer histórico de conversas anteriores.\n\nEstou no meio de uma semana e quero uma análise parcial do meu humor até agora, com sugestões para os dias que ainda faltam.\n\nAtenção: a semana ainda não terminou — os dados abaixo cobrem apenas os dias registrados até hoje (${todayFmt}).\n\n## Dados parciais da semana (${rangeLabel})`
      : `Você é um assistente de bem-estar pessoal. Analise APENAS os dados fornecidos nesta mensagem — ignore qualquer histórico de conversas anteriores.\n\nAnalise os dados de humor da minha semana encerrada e me dê recomendações práticas.\n\n## Dados da semana (${rangeLabel})`

    const separator = `|-----------|${slotLabels.map(() => '----------').join('|')}|`
    const tableHeader = `| Dia       | ${slotLabels.join(' | ')} |\n${separator}`
    const tableBody = tableRows.length > 0 ? tableRows.join('\n') : '| (sem registros) | \u2013 | \u2013 | \u2013 | \u2013 |'

    const instruction = '\nResponda na sequência exata das perguntas acima, uma por uma, sem criar seções extras ou tópicos adicionais. Ao responder cada pergunta, repita o enunciado da pergunta antes da resposta. Use bullets nas respostas.'
    const questionsPart = inProgress
      ? `## O que quero saber:\n1. Com base nos dias registrados, quais padrões já são visíveis?\n2. Existem horários ou situações que merecem atenção especial?\n3. O que eu deveria observar ou medir nos dias restantes da semana?\n4. Que ajustes concretos posso fazer ainda esta semana?${instruction}`
      : `## O que quero saber:\n1. Quais padrões você identifica nos meus humores ao longo dos dias e horários?\n2. Existem horários críticos que merecem atenção? (ex: sempre ansioso de manhã)\n3. O que eu deveria medir ou observar na próxima semana para entender melhor minha rotina?\n4. Que mudanças concretas você sugere experimentar?${instruction}`

    const dayNoteLines = []
    for (const date of days) {
      if (inProgress && date > todayStr) continue
      const note = weekDayNotes.value[date]
      if (!note) continue
      const [dy, dm, dd] = date.split('-')
      const dayOfWeek = new Date(date + 'T12:00:00').getDay()
      dayNoteLines.push(`- ${DAY_LABELS[dayOfWeek]} ${dd}/${dm}: "${note}"`)
    }
    const dayNotesPart = dayNoteLines.length > 0
      ? `## Observações por dia:\n${dayNoteLines.join('\n')}`
      : ''

    const hlMap = weekHabitLogs.value || {}
    const visibleHabits = (habits.value || []).filter(h =>
      h.active !== false || hlMap[h.id]
    )

    let habitsPart = ''
    if (visibleHabits.length > 0) {
      const activeDays = days.filter(d => !inProgress || d <= todayStr)
      const dayHeaders = activeDays.map(d => {
        const dow = new Date(d + 'T12:00:00').getDay()
        return DAY_LABELS[dow].substring(0, 3)
      })
      const colWidth = Math.max(14, ...visibleHabits.map(h => `${h.icon || ''} ${h.name}`.length))
      const rows = visibleHabits.map(h => {
        const logs = hlMap[h.id] || {}
        const cells = activeDays.map(d => {
          const st = logs[d]
          if (st === 'DONE')     return '✅'
          if (st === 'NOT_DONE') return '❌'
          if (st === 'IGNORE')   return '➖'
          return '–'
        })
        const done = activeDays.filter(d => logs[d] === 'DONE').length
        const recorded = activeDays.filter(d => logs[d] && logs[d] !== 'IGNORE').length
        const name = `${h.icon || ''} ${h.name}`.padEnd(colWidth)
        return `| ${name} | ${cells.join(' | ')} | ${done}/${recorded} |`
      })
      const sep = `|${'-'.repeat(colWidth + 2)}|${activeDays.map(() => '-----').join('|')}|--------|`
      habitsPart = `## Hábitos da semana:\n| ${'Hábito'.padEnd(colWidth)} | ${dayHeaders.join(' | ')} | Feitos |\n${sep}\n${rows.join('\n')}`
    }

    generatedPrompt.value = [
      headerPart,
      '',
      tableHeader,
      tableBody,
      '',
      `${scoreLabel}: ${scoreDisplay}`,
      '',
      `${noteLabel}: ${noteText}`,
      ...(dayNotesPart ? ['', dayNotesPart] : []),
      ...(habitsPart ? ['', habitsPart] : []),
      '',
      questionsPart,
    ].join('\n')

    showPromptModal.value = true
  }

  function copyPrompt() {
    navigator.clipboard.writeText(generatedPrompt.value)
    promptCopied.value = true
    setTimeout(() => { promptCopied.value = false }, 2000)
  }

  return {
    showPromptModal,
    generatedPrompt,
    promptCopied,
    generatePrompt,
    copyPrompt,
  }
}
