import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import { CircleCheck, Pencil, Plus, Trash2 } from 'lucide-react'
import { studentsInBatch, validateBatchName, type AppData, type Batch } from '../lib/appData'
import ChapterBand from '../components/ChapterBand'
import InlineNameEditor from '../components/InlineNameEditor'
import { FieldError, SelectField } from '../components/Field'
import './BatchesScreen.css'

type Props = {
  data: AppData
  /** Each returns false / null when the change couldn't be saved on the device. */
  onCreate: (name: string) => Batch | null
  onRename: (batchId: string, name: string) => boolean
  /** Deletes a batch, first moving its students to `moveToId` when it has any. */
  onDelete: (batchId: string, moveToId?: string) => boolean
  onDone: () => void
}

const SAVE_FAILED = "Couldn't save on this device. Check that site storage isn't blocked."

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** The roll-shut lasts 200ms; past this the delete runs even if animationend never came. */
const LEAVE_FALLBACK_MS = 400

function studentCount(n: number) {
  return `${n} ${n === 1 ? 'student' : 'students'}`
}

export default function BatchesScreen({ data, onCreate, onRename, onDelete, onDone }: Props) {
  const uid = useId()
  const { batches } = data
  /** A batch id being renamed, "new" while adding, or null. */
  const [editing, setEditing] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [moveTo, setMoveTo] = useState('')
  const [moveTouched, setMoveTouched] = useState(false)
  const [deleteFailed, setDeleteFailed] = useState(false)
  const [status, setStatus] = useState('')
  /** Rows mid-animation: a new batch unrolls in, a deleted one rolls shut before it's removed. */
  const [enteringId, setEnteringId] = useState<string | null>(null)
  const [leavingId, setLeavingId] = useState<string | null>(null)

  const rootRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  /** data-focus-key to focus once the next render lands. */
  const pendingFocus = useRef<string | null>(null)
  /** Fallback timer for the row being deleted; null once its delete has run. */
  const leaveTimer = useRef<number | null>(null)

  useEffect(() => {
    titleRef.current?.focus()
    return () => {
      if (leaveTimer.current !== null) window.clearTimeout(leaveTimer.current)
    }
  }, [])

  // Apply planned focus after a change re-renders the list ("#id" targets an element id).
  useEffect(() => {
    const key = pendingFocus.current
    if (!key) return
    const target = key.startsWith('#')
      ? document.getElementById(key.slice(1))
      : rootRef.current?.querySelector<HTMLElement>(`[data-focus-key="${key}"]`)
    target?.focus()
    pendingFocus.current = null
  })

  function focusLater(key: string) {
    pendingFocus.current = key
  }

  function startDelete(batchId: string) {
    setEditing(null)
    setDeleting(batchId)
    setMoveTo('')
    setMoveTouched(false)
    setDeleteFailed(false)
    // Safe first stop: "Keep" for an empty batch, the move-to picker otherwise.
    const hasStudents = studentsInBatch(data.students, batchId).length > 0
    focusLater(hasStudents ? `#${uid}-move` : `delete-first:${batchId}`)
  }

  function cancelDelete(batchId: string) {
    setDeleting(null)
    focusLater(`delete:${batchId}`)
  }

  function confirmDelete(batch: Batch, count: number) {
    if (count > 0 && !moveTo) {
      setMoveTouched(true)
      document.getElementById(`${uid}-move`)?.focus()
      return
    }
    if (reducedMotion() || document.hidden) {
      finishDelete(batch, count)
      return
    }
    // Roll the row shut, then delete. The delete must not hinge on animationend alone: it never
    // fires when the animation is skipped or cancelled, which left the row inert and nothing deleted.
    // The row turns inert while it leaves, so hold focus on the list heading rather than the body.
    rootRef.current?.querySelector<HTMLElement>('[data-focus-key="list"]')?.focus()
    setLeavingId(batch.id)
    leaveTimer.current = window.setTimeout(() => finishLeave(batch, count), LEAVE_FALLBACK_MS)
  }

  /** Runs the delete once, from whichever comes first: animationend or the fallback timer. */
  function finishLeave(batch: Batch, count: number) {
    if (leaveTimer.current === null) return
    window.clearTimeout(leaveTimer.current)
    leaveTimer.current = null
    finishDelete(batch, count)
  }

  function finishDelete(batch: Batch, count: number) {
    if (!onDelete(batch.id, count > 0 ? moveTo : undefined)) {
      setLeavingId(null)
      setDeleteFailed(true)
      return
    }
    setLeavingId(null)
    const target = batches.find((b) => b.id === moveTo)
    setStatus(
      count > 0 && target
        ? `Moved ${studentCount(count)} to ${target.name} and deleted batch ${batch.name}.`
        : `Deleted batch ${batch.name}.`,
    )
    setDeleting(null)
    focusLater('list')
  }

  function onPanelKeyDown(e: KeyboardEvent<HTMLDivElement>, batchId: string) {
    if (e.key === 'Escape') {
      e.stopPropagation()
      cancelDelete(batchId)
    }
  }

  return (
    <div className="screen" ref={rootRef}>
      <ChapterBand title="Manage batches" subtitle="Add, rename or remove the groups you teach." titleRef={titleRef} />

      <main className="screen-body column batches-body">
        <p className="home-flash" role="status">
          {status && (
            <>
              <CircleCheck aria-hidden="true" size={18} strokeWidth={2.25} />
              {status}
            </>
          )}
        </p>

        <h2 className="manage-heading" tabIndex={-1} data-focus-key="list">
          Your batches <span className="manage-heading-count">{batches.length}</span>
        </h2>

        <ul className="manage-list">
          {batches.map((batch) => {
            const count = studentsInBatch(data.students, batch.id).length
            const others = batches.filter((b) => b.id !== batch.id)
            const isDeleting = deleting === batch.id
            const moveError = moveTouched && !moveTo ? 'Choose where to move the students.' : null
            const motion = leavingId === batch.id ? ' is-leaving' : enteringId === batch.id ? ' is-entering' : ''
            return (
              <li
                key={batch.id}
                className={`manage-item row-motion${motion}`}
                inert={leavingId === batch.id || undefined}
                onAnimationEnd={(e) => {
                  if (e.target !== e.currentTarget) return
                  if (leavingId === batch.id) finishLeave(batch, count)
                  else if (enteringId === batch.id) setEnteringId(null)
                }}
              >
                <div className="manage-item-inner">
                {editing === batch.id ? (
                  <InlineNameEditor
                    id={`${uid}-rename-${batch.id}`}
                    label={`Rename ${batch.name}`}
                    initialValue={batch.name}
                    saveLabel="Save name"
                    validate={(value) => validateBatchName(value, batches, batch.id)}
                    onSave={(name) => {
                      if (name === batch.name) {
                        setEditing(null)
                        focusLater(`batch:${batch.id}`)
                        return null
                      }
                      if (!onRename(batch.id, name)) return SAVE_FAILED
                      setStatus(`Renamed ${batch.name} to ${name}.`)
                      setEditing(null)
                      focusLater(`batch:${batch.id}`)
                      return null
                    }}
                    onCancel={() => {
                      setEditing(null)
                      focusLater(`batch:${batch.id}`)
                    }}
                  />
                ) : (
                  <div className="manage-row">
                    <button
                      type="button"
                      className="manage-open"
                      onClick={() => {
                        setDeleting(null)
                        setEditing(batch.id)
                      }}
                      data-focus-key={`batch:${batch.id}`}
                    >
                      <span className="manage-name">
                        <span className="sr-only">Rename </span>
                        {batch.name}
                      </span>
                      <span className="manage-count">{studentCount(count)}</span>
                      <Pencil className="manage-cue" aria-hidden="true" size={18} strokeWidth={2.25} />
                    </button>
                    {batches.length > 1 && (
                      <button
                        type="button"
                        className="icon-button manage-delete"
                        onClick={() => (isDeleting ? cancelDelete(batch.id) : startDelete(batch.id))}
                        aria-label={`Delete batch ${batch.name}`}
                        aria-expanded={isDeleting}
                        aria-controls={isDeleting ? `${uid}-confirm-panel-${batch.id}` : undefined}
                        data-focus-key={`delete:${batch.id}`}
                      >
                        <Trash2 aria-hidden="true" size={20} strokeWidth={2} />
                      </button>
                    )}
                  </div>
                )}

                {isDeleting && (
                  <div
                    id={`${uid}-confirm-panel-${batch.id}`}
                    className="delete-confirm manage-confirm"
                    role="group"
                    aria-labelledby={`${uid}-confirm-${batch.id}`}
                    onKeyDown={(e) => onPanelKeyDown(e, batch.id)}
                  >
                    {count === 0 ? (
                      <>
                        <p className="delete-confirm-text" id={`${uid}-confirm-${batch.id}`}>
                          Delete batch {batch.name}? This can't be undone.
                        </p>
                        <div className="delete-confirm-actions">
                          <button
                            type="button"
                            className="button-secondary button-small"
                            onClick={() => cancelDelete(batch.id)}
                            data-focus-key={`delete-first:${batch.id}`}
                          >
                            Keep
                          </button>
                          <button type="button" className="button-danger" onClick={() => confirmDelete(batch, 0)}>
                            Delete
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="delete-confirm-text" id={`${uid}-confirm-${batch.id}`}>
                          {batch.name} has {studentCount(count)}. Choose a batch to move them to, then delete.
                        </p>
                        <div className="manage-move">
                          <SelectField
                            id={`${uid}-move`}
                            label="Move students to"
                            value={moveTo}
                            onChange={(value) => setMoveTo(value)}
                            onBlur={() => setMoveTouched(true)}
                            error={moveError}
                            placeholder="Choose a batch"
                            options={others.map((b) => ({ value: b.id, label: b.name }))}
                          />
                        </div>
                        <div className="delete-confirm-actions">
                          <button
                            type="button"
                            className="button-secondary button-small"
                            onClick={() => cancelDelete(batch.id)}
                          >
                            Cancel
                          </button>
                          <button type="button" className="button-danger" onClick={() => confirmDelete(batch, count)}>
                            Move and delete
                          </button>
                        </div>
                      </>
                    )}
                    {deleteFailed && <FieldError id={`${uid}-delete-failed`} alert message={SAVE_FAILED} />}
                  </div>
                )}
                </div>
              </li>
            )
          })}
        </ul>

        {batches.length === 1 && (
          <p className="note-box manage-note">
            <strong>Note</strong> You need at least one batch, so this one can be renamed but not deleted.
          </p>
        )}

        <div className="manage-add">
          {editing === 'new' ? (
            <InlineNameEditor
              id={`${uid}-new`}
              label="New batch name"
              placeholder="e.g. Weekend – Class 6"
              saveLabel="Add batch"
              validate={(value) => validateBatchName(value, batches)}
              onSave={(name) => {
                const batch = onCreate(name)
                if (!batch) return SAVE_FAILED
                setStatus(`Added batch ${batch.name}.`)
                setEditing(null)
                if (!reducedMotion()) setEnteringId(batch.id)
                focusLater(`batch:${batch.id}`)
                return null
              }}
              onCancel={() => {
                setEditing(null)
                focusLater('add-batch')
              }}
            />
          ) : (
            <button
              type="button"
              className="add-button"
              onClick={() => {
                setDeleting(null)
                setEditing('new')
              }}
              data-focus-key="add-batch"
            >
              <Plus aria-hidden="true" size={20} strokeWidth={2.5} />
              Add batch
            </button>
          )}
        </div>
      </main>

      <div className="dock">
        <div className="column">
          <button type="button" className="cta" onClick={onDone}>
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
