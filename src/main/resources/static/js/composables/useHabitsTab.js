import { ref } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js'

export function useHabitsTab() {
  const habits = ref([])
  const newHabitName = ref('')
  const editingId = ref(null)
  const editingName = ref('')
  const error = ref('')

  async function loadHabits() {
    try {
      const res = await fetch('/habits')
      if (!res.ok) return
      const data = await res.json()
      habits.value = Array.isArray(data) ? data : []
    } catch (e) {
      // keep existing state on network/parse error
    }
  }

  async function addHabit() {
    const name = newHabitName.value.trim()
    if (!name) return
    error.value = ''
    const res = await fetch('/habits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    })
    if (res.ok) {
      newHabitName.value = ''
      await loadHabits()
    } else {
      error.value = 'Erro ao adicionar hábito.'
    }
  }

  function startEdit(habit) {
    editingId.value = habit.id
    editingName.value = habit.name
  }

  async function saveEdit() {
    const name = editingName.value.trim()
    if (!name) return
    const res = await fetch('/habits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: editingId.value, name }),
    })
    if (res.ok) {
      editingId.value = null
      editingName.value = ''
      await loadHabits()
    }
  }

  function cancelEdit() {
    editingId.value = null
    editingName.value = ''
  }

  function onNewHabitKeyup(e) {
    if (e.key === 'Enter') addHabit()
  }

  function onEditKeyup(e) {
    if (e.key === 'Enter') saveEdit()
    else if (e.key === 'Escape') cancelEdit()
  }

  async function deleteHabit(id) {
    await fetch(`/habits/${id}`, { method: 'DELETE' })
    await loadHabits()
  }

  return { habits, newHabitName, editingId, editingName, error, loadHabits, addHabit, startEdit, saveEdit, cancelEdit, onNewHabitKeyup, onEditKeyup, deleteHabit }
}
