import { useCallback, useEffect, useId, useRef } from 'react'
import { ChevronRight, CircleCheck, Plus, Settings2 } from 'lucide-react'
import { formatClass, formatDateLong, formatRupees, type AppData, type Student } from '../lib/appData'
import ChapterBand from '../components/ChapterBand'
import { SelectField, TextField } from '../components/Field'
import '../components/form.css'
import './StudentsScreen.css'

/** "all", or a batch id. */
export type BatchFilter = string

type Props = {
  data: AppData
  query: string
  onQueryChange: (query: string) => void
  batchFilter: BatchFilter
  onBatchFilterChange: (batchFilter: BatchFilter) => void
  showLeft: boolean
  onShowLeftChange: (showLeft: boolean) => void
  /** One-line confirmation of the last change, announced politely. */
  flash: string | null
  /** data-focus-key to focus on arrival: "add", "manage-batches" or "student:<id>". */
  focusKey: string | null
  onAdd: (options: { batchId?: string; returnFocus: string }) => void
  onEdit: (student: Student) => void
  onManageBatches: () => void
}

/** 1 → "1st", 22 → "22nd", 13 → "13th" */
function ordinal(n: number): string {
  const tens = n % 100
  if (tens >= 11 && tens <= 13) return `${n}th`
  return `${n}${['th', 'st', 'nd', 'rd'][n % 10] ?? 'th'}`
}

function students(n: number) {
  return `${n} ${n === 1 ? 'student' : 'students'}`
}

const byName = (a: Student, b: Student) => a.name.localeCompare(b.name, 'en-IN', { sensitivity: 'base' })

export default function StudentsScreen({
  data,
  query,
  onQueryChange,
  batchFilter,
  onBatchFilterChange,
  showLeft,
  onShowLeftChange,
  flash,
  focusKey,
  onAdd,
  onEdit,
  onManageBatches,
}: Props) {
  const uid = useId()
  const rootRef = useRef<HTMLDivElement>(null)

  // Return focus to where the tutor was (the row they edited, the button they used).
  const focusByKey = useCallback((key: string) => {
    const target = rootRef.current?.querySelector<HTMLElement>(`[data-focus-key="${key}"]`)
    if (!target) return
    target.focus({ preventScroll: true })
    const rect = target.getBoundingClientRect()
    if (rect.top < 0 || rect.bottom > window.innerHeight - 80) target.scrollIntoView({ block: 'center' })
  }, [])

  useEffect(() => {
    if (!focusKey) return
    const frame = requestAnimationFrame(() => focusByKey(focusKey))
    return () => cancelAnimationFrame(frame)
  }, [focusKey, focusByKey])

  const batchNames = new Map(data.batches.map((b) => [b.id, b.name]))
  // A filter for a batch deleted since it was chosen falls back to All.
  const batchId = batchFilter !== 'all' && batchNames.has(batchFilter) ? batchFilter : 'all'
  const needle = query.trim().toLowerCase()

  const matching = data.students
    .filter((s) => batchId === 'all' || s.batchId === batchId)
    .filter(
      (s) => !needle || s.name.toLowerCase().includes(needle) || s.guardianName?.toLowerCase().includes(needle),
    )
    .sort(byName)
  const rows = showLeft ? matching : matching.filter((s) => !s.leftOn)
  const hiddenLeft = matching.length - rows.length
  const leftTotal = data.students.filter((s) => s.leftOn).length
  const filtered = Boolean(needle) || batchId !== 'all'

  let countText = rows.length
    ? filtered
      ? `${students(rows.length)} match.`
      : `${students(rows.length)}.`
    : filtered
      ? 'No students match.'
      : 'No active students.'
  if (hiddenLeft > 0) countText += ` ${hiddenLeft} who left ${hiddenLeft === 1 ? 'is' : 'are'} hidden.`

  const addButton = (
    <button
      type="button"
      className="add-button"
      onClick={() => onAdd({ batchId: batchId === 'all' ? undefined : batchId, returnFocus: 'add' })}
      data-focus-key="add"
    >
      <Plus aria-hidden="true" size={20} strokeWidth={2.5} />
      Add student
    </button>
  )

  const manageButton = (
    <button type="button" className="add-button roster-manage" onClick={onManageBatches} data-focus-key="manage-batches">
      <Settings2 aria-hidden="true" size={20} strokeWidth={2.25} />
      Manage batches
    </button>
  )

  return (
    <div className="roster" ref={rootRef}>
      <ChapterBand
        title="Students"
        titleRef={(el) => {
          if (el) el.dataset.focusKey = 'title'
        }}
      />

      <main className="roster-body column">
        <p className="home-flash" role="status">
          {flash && (
            <>
              <CircleCheck aria-hidden="true" size={18} strokeWidth={2.25} />
              {flash}
            </>
          )}
        </p>

        {data.students.length === 0 ? (
          <div className="roster-empty">
            <p>No students yet. Add one to start tracking their fees.</p>
            {addButton}
          </div>
        ) : (
          <>
            <div className="roster-filters" role="search" aria-label="Find students">
              <TextField
                id={`${uid}-search`}
                label="Search"
                value={query}
                onChange={onQueryChange}
                onBlur={() => {}}
                error={null}
                help={<p className="help">By student or guardian name.</p>}
                inputProps={{ type: 'search', autoComplete: 'off', enterKeyHint: 'search', maxLength: 60 }}
              />
              <SelectField
                id={`${uid}-batch`}
                label="Batch"
                value={batchId}
                onChange={onBatchFilterChange}
                onBlur={() => {}}
                error={null}
                options={[
                  { value: 'all', label: 'All batches' },
                  ...data.batches.map((b) => ({ value: b.id, label: b.name })),
                ]}
                selectProps={{ required: false }}
              />
              {leftTotal > 0 && (
                <label className="roster-toggle">
                  <input type="checkbox" checked={showLeft} onChange={(e) => onShowLeftChange(e.target.checked)} />
                  Show students who left ({leftTotal})
                </label>
              )}
            </div>

            <div className="roster-count-row">
              <p className="roster-count" role="status">
                {countText}
              </p>
              {addButton}
            </div>

            {rows.length > 0 && (
              <ul className="roster-list">
                {rows.map((student) => {
                  const classLabel = formatClass(student.className)
                  return (
                    <li key={student.id}>
                      <button
                        type="button"
                        className={`roster-item${student.leftOn ? ' is-left' : ''}`}
                        onClick={() => onEdit(student)}
                        data-focus-key={`student:${student.id}`}
                      >
                        <span className="roster-name">
                          <span className="sr-only">Edit </span>
                          {student.name}
                          {student.leftOn && <span className="roster-left-badge">Left</span>}
                        </span>
                        <span className="roster-meta">
                          {classLabel && <>{classLabel} · </>}
                          {batchNames.get(student.batchId)}
                        </span>
                        <span className="roster-meta">
                          <span className="roster-fee">{formatRupees(student.monthlyFee)}</span> a month · Due on the{' '}
                          {ordinal(student.feeDueDay)}
                        </span>
                        {student.leftOn && (
                          <span className="roster-meta">Left on {formatDateLong(student.leftOn)}</span>
                        )}
                        <ChevronRight className="roster-cue" aria-hidden="true" size={20} strokeWidth={2.25} />
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </>
        )}

        {manageButton}
      </main>
    </div>
  )
}
