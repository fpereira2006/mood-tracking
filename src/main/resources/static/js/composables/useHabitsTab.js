import { ref } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js'

export function useHabitsTab() {
  const habits = ref([])
  const newHabitName = ref('')
  const editingId = ref(null)
  const editingName = ref('')
  const error = ref('')
  const dragSrcIndex = ref(null)

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

  function onDragStart(e, index) {
    dragSrcIndex.value = index
    e.dataTransfer.effectAllowed = 'move'
  }

  function onDragOver(e) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  function onDrop(e, targetIndex) {
    e.preventDefault()
    const src = dragSrcIndex.value
    if (src === null || src === targetIndex) return
    const list = [...habits.value]
    const [moved] = list.splice(src, 1)
    list.splice(targetIndex, 0, moved)
    habits.value = list
    dragSrcIndex.value = null
    saveOrder()
  }

  function onDragEnd() {
    dragSrcIndex.value = null
  }

  async function saveOrder() {
    await fetch('/habits/reorder', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(habits.value.map(h => h.id)),
    })
  }

  return { habits, newHabitName, editingId, editingName, error, dragSrcIndex, loadHabits, addHabit, startEdit, saveEdit, cancelEdit, onNewHabitKeyup, onEditKeyup, deleteHabit, onDragStart, onDragOver, onDrop, onDragEnd }
}
