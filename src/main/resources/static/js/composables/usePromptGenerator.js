import { ref } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js'
import { DAY_LABELS, SLOTS, emojiName } from '../constants.js'

export function usePromptGenerator({ todayStr, weekDays, weekEntries, weekNote, weekScore, weekDayNotes }) {
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
      const cells = SLOTS.map(s => dayMap[s.key] ? emojiName(dayMap[s.key]) : '\u2013')
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
