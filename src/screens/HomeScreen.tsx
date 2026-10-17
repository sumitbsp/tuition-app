import { useCallback, useEffect, useRef, useState } from 'react'
import {
  CalendarClock,
  Check,
  ChevronDown,
  ChevronRight,
  CircleCheck,
  Clock,
  MessageCircle,
  MessagesSquare,
  Plus,
} from 'lucide-react'
import { formatClass, formatRupees, parseDateKey, studentsInBatch, type AppData, type Student } from '../lib/appData'
import {
  byDueDate,
  dueDate,
  feeStatus,
  formatDueShort,
  formatMonth,
  isEnrolled,
  paymentFor,
  summarizeMonth,
  whatsappReminderLink,
  type FeeStatus,
} from '../lib/fees'
import ChapterBand from '../components/ChapterBand'
import MonthSwitcher from '../components/MonthSwitcher'
import FilterTabs, { type FeeFilter } from '../components/FilterTabs'
import Toast, { type ToastData } from '../components/Toast'
import '../components/form.css'
import './HomeScreen.css'

type Props = {
  data: AppData
  month: string
  monthBounds: { first: string; last: string }
  onMonthChange: (month: string) => void
  filter: FeeFilter
  onFilterChange: (filter: FeeFilter) => void
  /** One-line confirmation of the last change ("Added Aarav Mehta."), announced politely. */
  flash: string | null
  /** data-focus-key of the element to focus on arrival: "title", "add", or "student:<id>". */
  focusKey: string | null
  /** Ids of batches whose student list is open. */
  expanded: string[]
  onToggleBatch: (batchId: string) => void
  onAdd: (options: { batchId?: string; returnFocus: string }) => void
  onEdit: (student: Student) => void
  /** Opens the compose screen for one message to every guardian in the batch. */
  onMessageBatch: (batchId: string) => void
  /** Marks a month paid or unpaid (saved synchronously, list reflow animated). False when it couldn't be saved. */
  onSetPaid: (student: Student, month: string, paid: boolean) => boolean
}

const BADGE: Record<FeeStatus, { label: string; icon: typeof Check }> = {
  paid: { label: 'Paid', icon: Check },
  due: { label: 'Due', icon: Clock },
  upcoming: { label: 'Upcoming', icon: CalendarClock },
}

const COUNT_NOUN: Record<FeeFilter, [string, string]> = {
  due: ['due', 'due'],
  paid: ['paid', 'paid'],
  all: ['student', 'students'],
}

export default function HomeScreen({
  data,
  month,
  monthBounds,
  onMonthChange,
  filter,
  onFilterChange,
  flash,
  focusKey,
  expanded,
  onToggleBatch,
  onAdd,
  onEdit,
  onMessageBatch,
  onSetPaid,
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null)
  const [toast, setToast] = useState<ToastData | null>(null)
  /** Focus target to apply after a fee change re-renders the list. */
  const pendingFocus = useRef<string | null>(null)

  const firstName = data.tutor.name.split(/\s+/)[0]
  const hasStudents = data.students.length > 0
  const summary = summarizeMonth(data, month)
  const counts: Record<FeeFilter, number> = {
    due: summary.dueCount,
    paid: summary.paidCount,
    all: summary.dueCount + summary.upcomingCount + summary.paidCount,
  }

  const focusByKey = useCallback((key: string) => {
    const target = rootRef.current?.querySelector<HTMLElement>(`[data-focus-key="${key}"]`)
    if (!target) return false
    target.focus({ preventScroll: true })
    // Keep the target clear of what floats over the page bottom (toast, "+" button).
    const floating = rootRef.current?.querySelectorAll<HTMLElement>('.toast, .fab') ?? []
    const floor = Math.min(window.innerHeight, ...Array.from(floating, (el) => el.getBoundingClientRect().top)) - 12
    const rect = target.getBoundingClientRect()
    if (rect.top < 0) target.scrollIntoView({ block: 'center' })
    else if (rect.bottom > floor) window.scrollBy({ top: rect.bottom - floor })
    return true
  }, [])

  // Return focus to where the tutor was (the row they edited, the button they used).
  useEffect(() => {
    if (!focusKey) return
    const frame = requestAnimationFrame(() => focusByKey(focusKey))
    return () => cancelAnimationFrame(frame)
  }, [focusKey, focusByKey])

  // After a fee change, move focus to its planned target (rows can leave the list).
  useEffect(() => {
    if (!pendingFocus.current) return
    if (!focusByKey(pendingFocus.current)) focusByKey('tabs')
    pendingFocus.current = null
  }, [data, focusByKey])

  const dismissToast = useCallback(() => setToast(null), [])

  function setPaid(student: Student, paid: boolean, announce = true) {
    // A row that will leave the current tab hands focus to the next visible row.
    if (filter === 'all') {
      pendingFocus.current = `action:${student.id}`
    } else {
      // Only rows in open batches can take focus (closed panels are inert).
      const ids = Array.from(
        rootRef.current?.querySelectorAll<HTMLElement>('.batch-panel:not([inert]) [data-row-id]') ?? [],
      ).map(
        (el) => el.dataset.rowId!,
      )
      const i = ids.indexOf(student.id)
      const neighbour = i === -1 ? undefined : (ids[i + 1] ?? ids[i - 1])
      pendingFocus.current = neighbour ? `action:${neighbour}` : 'tabs'
    }

    // Saves synchronously; App animates the list reflow.
    if (!onSetPaid(student, month, paid)) {
      pendingFocus.current = null
      setToast({ id: Date.now(), message: "Couldn't save on this device. Check that site storage isn't blocked." })
      return
    }
    if (!announce) return
    setToast({
      id: Date.now(),
      message: `${student.name} marked ${paid ? 'paid' : 'unpaid'} for ${formatMonth(month)}.`,
      action: { label: 'Undo', onAction: () => setPaid(student, !paid, false) },
    })
  }

  /** `batchName` labels rows listed outside their batch group ("Due later this month"). */
  function renderRow(student: Student, batchName?: string) {
    const payment = paymentFor(data.payments, student.id, month)
    const status = feeStatus(data, student, month)
    const paid = status === 'paid'
    const classLabel = formatClass(student.className)
    const amount = payment?.amount ?? student.monthlyFee
    const badge = BADGE[status]
    const BadgeIcon = badge.icon
    return (
      <li
        key={student.id}
        className={`student-item${paid ? ' is-paid' : ''}`}
        data-row-id={student.id}
        style={{ viewTransitionName: `row-${student.id}` }}
      >
        <button
          type="button"
          className="student-open"
          onClick={() => onEdit(student)}
          data-focus-key={`student:${student.id}`}
        >
          <span className="student-name">
            <span className="sr-only">Edit </span>
            {student.name}
            <ChevronRight className="student-open-cue" aria-hidden="true" size={18} strokeWidth={2.25} />
          </span>
          <span className="student-meta">
            {batchName && <>{batchName} · </>}
            {classLabel && <>{classLabel} · </>}
            <span className="student-fee">{formatRupees(amount)}</span>
            <span className="sr-only"> per month</span>
            {' · '}
            <span className="student-due">Due {formatDueShort(dueDate(student, month))}</span>
            {student.leftOn && (
              <>
                {' · '}
                <span className="student-due">Left {formatDueShort(parseDateKey(student.leftOn)!)}</span>
              </>
            )}
          </span>
        </button>

        <span className={`status-badge is-${status}`}>
          <BadgeIcon aria-hidden="true" size={16} strokeWidth={paid ? 2.5 : 2.25} />
          {badge.label}
        </span>

        <div className="student-actions">
          {paid ? (
            <button
              type="button"
              className="row-action row-action-quiet"
              onClick={() => setPaid(student, false)}
              data-focus-key={`action:${student.id}`}
            >
              Mark unpaid<span className="sr-only"> for {student.name}</span>
            </button>
          ) : (
            <>
              {/* Students who left get no reminders (their last month can still be marked paid). */}
              {!student.leftOn && (
                <a
                  className="row-action row-action-secondary"
                  href={whatsappReminderLink(data, student, month)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle aria-hidden="true" size={18} strokeWidth={2.25} />
                  Remind<span className="sr-only"> {student.name}'s guardian on WhatsApp</span>
                </a>
              )}
              <button
                type="button"
                className="row-action row-action-primary"
                onClick={() => setPaid(student, true)}
                data-focus-key={`action:${student.id}`}
              >
                Mark paid<span className="sr-only"> for {student.name}</span>
              </button>
            </>
          )}
        </div>
      </li>
    )
  }

  function renderBatches() {
    const status = new Map(data.students.map((s) => [s.id, feeStatus(data, s, month)]))
    const groups = data.batches.map((batch) => {
      const all = studentsInBatch(data.students, batch.id)
      const enrolled = all.filter((s) => isEnrolled(s, month))
      // All lists upcoming fees in their own section below the batches.
      const rows =
        filter === 'all'
          ? enrolled.filter((s) => status.get(s.id) !== 'upcoming')
          : enrolled.filter((s) => status.get(s.id) === filter)
      if (filter === 'due') rows.sort(byDueDate(month))
      return { batch, all, enrolled, rows }
    })
    const upcoming =
      filter === 'all'
        ? data.students.filter((s) => isEnrolled(s, month) && status.get(s.id) === 'upcoming').sort(byDueDate(month))
        : []
    const batchNames = new Map(data.batches.map((b) => [b.id, b.name]))

    // Pending and Paid show batches with matching rows. Batches with no students at
    // all show on every tab, so a new batch (and its add button) is never hidden.
    const shown = filter === 'all' ? groups : groups.filter((g) => g.rows.length > 0 || g.all.length === 0)
    const anyMatches = groups.some((g) => g.rows.length > 0)

    const nothingToShow =
      filter !== 'all' && !anyMatches ? (
        <p className="fee-empty" key="nothing-to-show">
          <CircleCheck aria-hidden="true" size={20} strokeWidth={2.25} />
          {filter === 'paid'
            ? `No fees marked paid for ${formatMonth(month)} yet.`
            : summary.upcomingCount > 0
              ? `Nothing due yet. ${summary.upcomingCount} ${summary.upcomingCount === 1 ? 'fee is' : 'fees are'} due later this month.`
              : `Everyone has paid for ${formatMonth(month)}.`}
        </p>
      ) : null

    const upcomingSection =
      upcoming.length > 0 ? (
        <section className="upcoming-group" aria-labelledby="upcoming-title" key="upcoming">
          <h2 className="upcoming-heading" id="upcoming-title">
            Due later this month
            <span className="batch-count">
              {upcoming.length} {upcoming.length === 1 ? 'student' : 'students'}
            </span>
          </h2>
          <ul className="student-list">{upcoming.map((s) => renderRow(s, batchNames.get(s.batchId)))}</ul>
        </section>
      ) : null

    return [nothingToShow, ...shown.map(({ batch, all, enrolled, rows }) => {
      const isOpen = expanded.includes(batch.id)
      const groupPanelId = `batch-panel-${batch.id}`
      const [one, many] = COUNT_NOUN[filter]
      const countLabel = all.length === 0 ? 'No students' : `${rows.length} ${rows.length === 1 ? one : many}`
      return (
        <section className={`batch-group${isOpen ? ' is-open' : ''}`} key={batch.id}>
          <h2 className="batch-heading">
            <button
              type="button"
              className="batch-toggle"
              aria-expanded={isOpen}
              aria-controls={groupPanelId}
              onClick={() => onToggleBatch(batch.id)}
              data-focus-key={`batch:${batch.id}`}
            >
              <span className="batch-name">{batch.name}</span>
              <span className="batch-count">{countLabel}</span>
              <ChevronDown className="batch-chevron" aria-hidden="true" size={22} strokeWidth={2} />
            </button>
          </h2>

          {/* Unrolls open and rolls shut; closed panels are inert so nothing inside takes focus. */}
          <div className="batch-panel" id={groupPanelId} inert={!isOpen || undefined}>
            <div className="batch-panel-inner">
              {rows.length > 0 ? (
                <ul className="student-list">{rows.map((s) => renderRow(s))}</ul>
              ) : (
                <div className="batch-empty">
                  <p>
                    {!all.length
                      ? 'No students yet.'
                      : !enrolled.length
                        ? `No students yet in ${formatMonth(month)}.`
                        : 'Everyone here is due later this month.'}
                  </p>
                  <button
                    type="button"
                    className="add-button"
                    onClick={() => onAdd({ batchId: batch.id, returnFocus: `batch-add:${batch.id}` })}
                    data-focus-key={`batch-add:${batch.id}`}
                  >
                    <Plus aria-hidden="true" size={20} strokeWidth={2.5} />
                    Add to this batch
                  </button>
                </div>
              )}
              {all.some((s) => !s.leftOn) && (
                <button
                  type="button"
                  className="add-button batch-message"
                  onClick={() => onMessageBatch(batch.id)}
                  data-focus-key={`batch-message:${batch.id}`}
                >
                  <MessagesSquare aria-hidden="true" size={20} strokeWidth={2.25} />
                  Message batch<span className="sr-only">: {batch.name}</span>
                </button>
              )}
            </div>
          </div>
        </section>
      )
    }), upcomingSection]
  }

  const panelId = 'fee-panel'


  return (
    <div className="home" ref={rootRef}>
      <ChapterBand
        title={`Hello, ${firstName}`}
        titleRef={(el) => {
          if (el) el.dataset.focusKey = 'title'
        }}
      >
        {hasStudents && (
          <MonthSwitcher month={month} first={monthBounds.first} last={monthBounds.last} onChange={onMonthChange} />
        )}
      </ChapterBand>

      <main className={`home-body column${hasStudents ? '' : ' is-empty'}`}>
        <p className="home-flash" role="status">
          {flash && (
            <>
              <CircleCheck aria-hidden="true" size={18} strokeWidth={2.25} />
              {flash}
            </>
          )}
        </p>

        {hasStudents ? (
          <>
            <section className="summary" aria-label={`Fees for ${formatMonth(month)}`}>
              <dl className="summary-grid">
                <div className="summary-cell">
                  <dt>Collected</dt>
                  <dd>{formatRupees(summary.collected)}</dd>
                </div>
                <div className="summary-cell">
                  <dt>Due now</dt>
                  <dd>{formatRupees(summary.due)}</dd>
                </div>
                <div className="summary-cell">
                  <dt>Upcoming</dt>
                  <dd>{formatRupees(summary.upcoming)}</dd>
                </div>
              </dl>
            </section>

            <div data-focus-key="tabs" tabIndex={-1} className="tabs-anchor">
              <FilterTabs value={filter} counts={counts} panelId={panelId} onChange={onFilterChange} />
            </div>

            <div role="tabpanel" id={panelId} aria-labelledby={`tab-${filter}`} className="fee-panel">
              {renderBatches()}
            </div>

          </>
        ) : (
          <div className="home-empty">
            <h2 className="home-empty-title">Add your first student</h2>
            <p className="note-box home-empty-note">
              <strong>Note</strong> Students appear here grouped by batch, with their class and monthly fee. Tap a
              student any time to edit them.
            </p>
            <button
              type="button"
              className="cta home-empty-button"
              onClick={() => onAdd({ returnFocus: 'add' })}
              data-focus-key="add"
            >
              <Plus aria-hidden="true" size={22} strokeWidth={2.5} />
              Add student
            </button>
          </div>
        )}
      </main>

      <Toast toast={toast} onDismiss={dismissToast} />

      {hasStudents && (
        <button
          type="button"
          className="fab"
          onClick={() => onAdd({ returnFocus: 'add' })}
          aria-label="Add student"
          data-focus-key="add"
        >
          <Plus aria-hidden="true" size={28} strokeWidth={2.5} />
        </button>
      )}
    </div>
  )
}
