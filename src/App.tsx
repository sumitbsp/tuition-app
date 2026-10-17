import { useCallback, useEffect, useRef, useState } from 'react'
import { clearAppData, loadAppData, makeId, saveAppData, type AppData, type Batch, type Student } from './lib/appData'
import { currentMonth, monthRange } from './lib/fees'
import { transition } from './lib/viewTransition'
import type { FeeFilter } from './components/FilterTabs'
import SetupScreen from './screens/SetupScreen'
import HomeScreen from './screens/HomeScreen'
import StudentScreen from './screens/StudentScreen'
import BatchesScreen from './screens/BatchesScreen'
import MessageScreen from './screens/MessageScreen'
import StudentsScreen, { type BatchFilter } from './screens/StudentsScreen'
import SettingsScreen from './screens/SettingsScreen'
import BottomNav, { type Tab } from './components/BottomNav'

// Screens live in history.state rather than the URL (D-016): the phone's back
// button closes the student form, a reload restores the open screen, and no
// server rewrite rules are needed. Revisit a router when deep links matter.
// The tabs (Fees = "home", Students, Settings) replace the base entry instead of pushing,
// so back closes forms rather than walking through tab switches.
type Screen =
  | { name: 'home' }
  | { name: 'students' }
  | { name: 'settings' }
  | { name: 'batches' }
  | { name: 'student'; studentId?: string; batchId?: string }
  | { name: 'message'; batchId: string }

const HOME: Screen = { name: 'home' }

const SCREEN_NAMES: Screen['name'][] = ['home', 'students', 'settings', 'student', 'batches', 'message']

function screenFromHistory(state: unknown): Screen {
  const screen = (state as { screen?: Screen } | null)?.screen
  return screen && SCREEN_NAMES.includes(screen.name) ? screen : HOME
}

function isTab(screen: Screen): screen is { name: Tab } {
  return screen.name === 'home' || screen.name === 'students' || screen.name === 'settings'
}

/** The last Home tab is a per-device convenience, so it lives outside the app record (D-024). */
const FILTER_KEY = 'tuition-app:home-filter'

function loadFilter(): FeeFilter {
  try {
    const saved = localStorage.getItem(FILTER_KEY)
    // "pending" was the Due tab's name before fee due days.
    return saved === 'all' || saved === 'paid' ? saved : 'due'
  } catch {
    return 'due'
  }
}

function saveFilter(value: FeeFilter) {
  try {
    localStorage.setItem(FILTER_KEY, value)
  } catch {
    // Storage blocked: the tab still works, it just won't be remembered.
  }
}

function App() {
  const [data, setData] = useState<AppData | null>(() => loadAppData())
  const [screen, setScreen] = useState<Screen>(() => screenFromHistory(history.state))
  const [flash, setFlash] = useState<string | null>(null)
  const [focusKey, setFocusKey] = useState<string | null>(null)
  /** Open batch groups on Home; null means "not touched yet" (default rule below). Kept across screens. */
  const [expandedBatches, setExpandedBatches] = useState<string[] | null>(null)
  /** Home's selected month ("YYYY-MM") and fee filter; kept while editing a student. */
  const [month, setMonth] = useState(currentMonth)
  const [filter, setFilter] = useState<FeeFilter>(loadFilter)
  /** Students tab search, batch filter and "show students who left"; kept while editing a student. */
  const [studentQuery, setStudentQuery] = useState('')
  const [studentBatch, setStudentBatch] = useState<BatchFilter>('all')
  const [showLeft, setShowLeft] = useState(false)
  /** Bumped after a restore so Settings re-reads every field from the restored data. */
  const [settingsKey, setSettingsKey] = useState(0)
  /** Settings sections with unsaved changes; checked before leaving the tab. */
  const settingsUnsaved = useRef<string[]>([])
  const reportUnsaved = useCallback((sections: string[]) => {
    settingsUnsaved.current = sections
  }, [])

  /** Where to return on the tab that opened a screen: scroll position and the element that opened it. */
  const tabScroll = useRef(0)
  const returnFocus = useRef<string | null>(null)

  useEffect(() => {
    function onPopState(e: PopStateEvent) {
      const next = screenFromHistory(e.state)
      transition(
        () => {
          setScreen(next)
          if (isTab(next)) setFocusKey(returnFocus.current)
        },
        // A swipe-back already played the browser's own animation; a crossfade on top reads as a jitter.
        { scrollY: isTab(next) ? tabScroll.current : 0, instant: e.hasUAVisualTransition },
      )
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  // "Turn the chapter": the band stays put while Setup gives way to Home.
  function completeSetup(saved: AppData) {
    transition(() => {
      setData(saved)
      setFocusKey('title')
    }, { scrollY: 0 })
  }

  function openScreen(next: Exclude<Screen, { name: Tab }>, focusOnReturn: string) {
    tabScroll.current = window.scrollY
    returnFocus.current = focusOnReturn
    history.pushState({ screen: next }, '')
    transition(() => {
      setFlash(null)
      setScreen(next)
    }, { scrollY: 0 })
  }

  /** Bottom nav: swaps the tab in place. Focus stays on the nav, which persists across tabs. */
  function switchTab(tab: Tab) {
    const unsaved = settingsUnsaved.current
    if (screen.name === 'settings' && unsaved.length > 0) {
      const what = unsaved.length === 1 ? `${unsaved[0]} has` : `${unsaved.join(' and ')} have`
      if (!window.confirm(`${what} unsaved changes. Leave Settings without saving them?`)) return
    }
    history.replaceState({ screen: { name: tab } }, '')
    transition(() => {
      setFlash(null)
      setFocusKey(null)
      setScreen(tab === 'home' ? HOME : tab === 'students' ? { name: 'students' } : { name: 'settings' })
    }, { scrollY: 0 })
  }

  /** Settings → Restore: replaces everything, then remounts Settings with focus on its Backup heading. */
  function restoreData(next: AppData, message: string): boolean {
    if (!saveAppData(next)) return false
    setData(next)
    setExpandedBatches(null)
    setStudentBatch('all')
    setFlash(message)
    setFocusKey('backup')
    setSettingsKey((k) => k + 1)
    return true
  }

  /** Settings → Delete all data: back to first-launch setup, with focus on its heading. */
  function deleteAllData(): boolean {
    if (!clearAppData()) return false
    history.replaceState(null, '')
    settingsUnsaved.current = []
    setExpandedBatches(null)
    setStudentQuery('')
    setStudentBatch('all')
    setShowLeft(false)
    setFlash(null)
    setFocusKey(null)
    setScreen(HOME)
    setData(null)
    requestAnimationFrame(() => {
      const heading = document.querySelector<HTMLElement>('h1')
      if (!heading) return
      heading.tabIndex = -1
      heading.focus()
    })
    return true
  }

  // Default: a single batch starts open; several batches start collapsed.
  const defaultExpanded = (d: AppData) => (d.batches.length === 1 ? [d.batches[0].id] : [])

  function toggleBatch(batchId: string) {
    setExpandedBatches((current) => {
      const open = current ?? (data ? defaultExpanded(data) : [])
      return open.includes(batchId) ? open.filter((id) => id !== batchId) : [...open, batchId]
    })
  }

  // --- Batches -------------------------------------------------------------

  /** Saves and applies new data; false when the device refused the write. */
  function persist(next: AppData): boolean {
    if (!saveAppData(next)) return false
    setData(next)
    return true
  }

  /** Adds a batch and opens its group on Home so the new, empty batch is visible. */
  function createBatch(name: string): Batch | null {
    if (!data) return null
    const batch: Batch = { id: makeId(), name }
    const next = { ...data, batches: [...data.batches, batch] }
    if (!persist(next)) return null
    setExpandedBatches((current) => [...(current ?? defaultExpanded(data)), batch.id])
    return batch
  }

  function renameBatch(batchId: string, name: string): boolean {
    if (!data) return false
    return persist({ ...data, batches: data.batches.map((b) => (b.id === batchId ? { ...b, name } : b)) })
  }

  /** Deletes a batch, moving its students to `moveToId` first when it has any. */
  function deleteBatch(batchId: string, moveToId?: string): boolean {
    if (!data || data.batches.length <= 1) return false
    const hasStudents = data.students.some((s) => s.batchId === batchId)
    if (hasStudents && !moveToId) return false
    const next = {
      ...data,
      batches: data.batches.filter((b) => b.id !== batchId),
      students: data.students.map((s) => (s.batchId === batchId ? { ...s, batchId: moveToId! } : s)),
    }
    if (!persist(next)) return false
    setExpandedBatches((current) => {
      const open = (current ?? defaultExpanded(data)).filter((id) => id !== batchId)
      return moveToId && !open.includes(moveToId) ? [...open, moveToId] : open
    })
    return true
  }

  /** Marks one month paid or unpaid. Saves synchronously; the list reflow is animated. */
  function setPaid(student: Student, forMonth: string, paid: boolean): boolean {
    if (!data) return false
    const others = data.payments.filter((p) => !(p.studentId === student.id && p.month === forMonth))
    const payments = paid
      ? [...others, { studentId: student.id, month: forMonth, amount: student.monthlyFee, paidAt: new Date().toISOString() }]
      : others
    const next = { ...data, payments }
    if (!saveAppData(next)) return false
    transition(() => setData(next), { kind: 'list' })
    return true
  }

  /** Persists, then goes back to Home (popstate restores scroll and focus). */
  function commit(next: AppData, message: string, focusOnReturn: string, revealBatchId?: string): boolean {
    if (!saveAppData(next)) return false
    setData(next)
    // Open the batch a saved student landed in, so the returning focus target is visible.
    if (revealBatchId) {
      setExpandedBatches((current) => {
        const open = current ?? defaultExpanded(next)
        return open.includes(revealBatchId) ? open : [...open, revealBatchId]
      })
    }
    setFlash(message)
    returnFocus.current = focusOnReturn
    history.back()
    return true
  }

  if (!data) return <SetupScreen onComplete={completeSetup} />

  if (screen.name === 'batches') {
    return (
      <BatchesScreen
        data={data}
        onCreate={createBatch}
        onRename={renameBatch}
        onDelete={deleteBatch}
        onDone={() => history.back()}
      />
    )
  }

  if (screen.name === 'message') {
    const batch = data.batches.find((b) => b.id === screen.batchId)
    // A stale history entry for a deleted batch falls through to Home.
    if (batch) return <MessageScreen key={batch.id} data={data} batch={batch} onDone={() => history.back()} />
  }

  if (screen.name === 'student') {
    const student = screen.studentId ? data.students.find((s) => s.id === screen.studentId) : undefined
    // A stale history entry for a deleted student falls through to Home.
    if (!screen.studentId || student) {
      return (
        <StudentScreen
          key={screen.studentId ?? 'new'}
          batches={data.batches}
          student={student}
          // A history entry can outlive its batch (deleted on Manage batches); don't preselect a dead id.
          initialBatchId={data.batches.some((b) => b.id === screen.batchId) ? screen.batchId : undefined}
          defaults={{ fee: data.settings.defaultFee, dueDay: data.settings.defaultDueDay }}
          onCancel={() => history.back()}
          onCreateBatch={createBatch}
          onSave={(saved: Student, message?: string) => {
            const exists = data.students.some((s) => s.id === saved.id)
            const students = exists
              ? data.students.map((s) => (s.id === saved.id ? saved : s))
              : [...data.students, saved]
            return commit(
              { ...data, students },
              message ?? (exists ? `Saved changes to ${saved.name}.` : `Added ${saved.name}.`),
              `student:${saved.id}`,
              saved.batchId,
            )
          }}
          onDelete={(removed: Student) =>
            commit(
              {
                ...data,
                students: data.students.filter((s) => s.id !== removed.id),
                payments: data.payments.filter((p) => p.studentId !== removed.id),
              },
              `Deleted ${removed.name}.`,
              'add',
            )
          }
        />
      )
    }
  }

  const openStudent = (student: Student) =>
    openScreen({ name: 'student', studentId: student.id }, `student:${student.id}`)
  const openAdd = ({ batchId, returnFocus: key }: { batchId?: string; returnFocus: string }) =>
    openScreen({ name: 'student', batchId }, key)

  // Keep the selected month inside the tracked range (e.g. after deleting the earliest student).
  const bounds = monthRange(data)
  const shownMonth = month < bounds.first ? bounds.first : month > bounds.last ? bounds.last : month
  const tab: Tab = isTab(screen) ? screen.name : 'home'

  // The nav sits after the screen at a fixed place in the tree, so switching tabs keeps it (and its focus).
  const tabScreen =
    tab === 'settings' ? (
      <SettingsScreen
        key={settingsKey}
        data={data}
        onPersist={persist}
        onRestore={restoreData}
        onDeleteAll={deleteAllData}
        onUnsavedChange={reportUnsaved}
        flash={flash}
        focusKey={focusKey}
      />
    ) : tab === 'students' ? (
      <StudentsScreen
        data={data}
        query={studentQuery}
        onQueryChange={setStudentQuery}
        batchFilter={studentBatch}
        onBatchFilterChange={setStudentBatch}
        showLeft={showLeft}
        onShowLeftChange={setShowLeft}
        flash={flash}
        focusKey={focusKey}
        onAdd={openAdd}
        onEdit={openStudent}
        onManageBatches={() => openScreen({ name: 'batches' }, 'manage-batches')}
      />
    ) : (
      <HomeScreen
        data={data}
        month={shownMonth}
        monthBounds={bounds}
        onMonthChange={setMonth}
        filter={filter}
        onFilterChange={(value) => {
          setFilter(value)
          saveFilter(value)
        }}
        onSetPaid={setPaid}
        flash={flash}
        focusKey={focusKey}
        expanded={expandedBatches ?? defaultExpanded(data)}
        onToggleBatch={toggleBatch}
        onAdd={openAdd}
        onEdit={openStudent}
        onMessageBatch={(batchId) => openScreen({ name: 'message', batchId }, `batch-message:${batchId}`)}
      />
    )

  return (
    <>
      {tabScreen}
      <BottomNav current={tab} onChange={switchTab} />
    </>
  )
}

export default App
