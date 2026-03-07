export const EMOJIS = [
  { code: '1F604', char: '\uD83D\uDE04', name: 'Otimo',     score: 5 },
  { code: '1F642', char: '\uD83D\uDE42', name: 'Bem',       score: 4 },
  { code: '1F610', char: '\uD83D\uDE10', name: 'Neutro',    score: 3 },
  { code: '1F614', char: '\uD83D\uDE14', name: 'Pra baixo', score: 2 },
  { code: '1F622', char: '\uD83D\uDE22', name: 'Triste',    score: 1 },
  { code: '1F624', char: '\uD83D\uDE24', name: 'Frustrado', score: 1 },
  { code: '1F630', char: '\uD83D\uDE30', name: 'Ansioso',   score: 2 },
  { code: '1F634', char: '\uD83D\uDE34', name: 'Cansado',   score: 2 },
  { code: '1F912', char: '\uD83E\uDD12', name: 'Doente',    score: 2 },
  { code: '1F525', char: '\uD83D\uDD25', name: 'Animado',   score: 5 },
  { code: '1F9D8', char: '\uD83E\uDDD8', name: 'Calmo',     score: 4 },
  { code: '1F4AA', char: '\uD83D\uDCAA', name: 'Motivado',  score: 5 },
]

export const EMOJI_SCORE = Object.fromEntries(EMOJIS.map(e => [e.code, e.score]))

export const SLOTS = [
  { key: 'WAKE_UP',        icon: '\uD83C\uDF05', label: 'Ao acordar' },
  { key: 'NOON',           icon: '\u2600\uFE0F', label: 'Meio dia' },
  { key: 'LATE_AFTERNOON', icon: '\uD83C\uDF06', label: 'Fim da tarde' },
  { key: 'SLEEP',          icon: '\uD83C\uDF19', label: 'Ao dormir' },
]

export const DAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab']

export const MONTH_NAMES = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'
]

export function padTwo(n) { return String(n).padStart(2, '0') }

export function toDateStr(year, month, day) {
  return `${year}-${padTwo(month)}-${padTwo(day)}`
}

export function emojiChar(code) {
  const e = EMOJIS.find(x => x.code === code)
  return e ? e.char : ''
}

export function emojiName(code) {
  const e = EMOJIS.find(x => x.code === code)
  return e ? e.name : ''
}
