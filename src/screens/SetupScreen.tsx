import { useEffect, useId, useRef, useState, type FocusEvent, type FormEvent } from 'react'
import { Plus, X } from 'lucide-react'
import {
  cleanBatchNames,
  DEFAULT_SETTINGS,
  makeId,
  normalizePhone,
  saveAppData,
  validateBatches,
  validateName,
  validatePhone,
  validateUpiId,
  type AppData,
} from '../lib/appData'
import ChapterBand from '../components/ChapterBand'
import { FieldError, TextField } from '../components/Field'
import { describedBy, joinList } from '../lib/text'
import './SetupScreen.css'

type BatchRow = {
  id: string
  value: string
  /** Set while the row's unroll animation plays. */
  entering?: boolean
  /** Set while the row rolls shut; it is removed when the animation ends. */
  leaving?: boolean
}

type Touched = { name: boolean; phone: boolean; upi: boolean; batches: boolean }

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

type Props = {
  onComplete: (data: AppData) => void
}

export default function SetupScreen({ onComplete }: Props) {
  const uid = useId()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [upiId, setUpiId] = useState('')
  const [rows, setRows] = useState<BatchRow[]>(() => [{ id: makeId(), value: '' }])
  const [touched, setTouched] = useState<Touched>({ name: false, phone: false, upi: false, batches: false })
  const [saveFailed, setSaveFailed] = useState(false)

  const inputRefs = useRef(new Map<string, HTMLInputElement>())
  const addButtonRef = useRef<HTMLButtonElement>(null)
  /** Row to focus once it has rendered (set by "Add another batch"). */
  const pendingFocusId = useRef<string | null>(null)

  const liveRows = rows.filter((row) => !row.leaving)
  const batchNames = liveRows.map((row) => row.value)

  const errors = {
    name: validateName(name),
    phone: validatePhone(phone),
    upi: validateUpiId(upiId),
    batches: validateBatches(batchNames),
  }
  const isValid = !errors.name && !errors.phone && !errors.upi && !errors.batches

  // "Add" what is empty, "fix" what was entered but is invalid.
  const toAdd = [
    errors.name && 'your name',
    errors.phone && !phone.trim() && 'your phone number',
    errors.batches && 'one batch',
  ].filter((item): item is string => Boolean(item))
  const toFix = [
    errors.phone && phone.trim() && 'the phone number (10 digits)',
    errors.upi && 'the UPI ID (or leave it empty)',
  ].filter((item): item is string => Boolean(item))

  const hintParts = []
  if (toAdd.length) hintParts.push(`To continue, add ${joinList(toAdd)}.`)
  if (toFix.length) hintParts.push(`${toAdd.length ? 'Fix' : 'To continue, fix'} ${joinList(toFix)}.`)
  const hint = hintParts.join(' ') || 'Ready when you are.'

  const touch = (field: keyof Touched) => setTouched((t) => (t[field] ? t : { ...t, [field]: true }))

  useEffect(() => {
    if (!pendingFocusId.current) return
    inputRefs.current.get(pendingFocusId.current)?.focus()
    pendingFocusId.current = null
  }, [rows])

  function addRow() {
    const id = makeId()
    setRows((current) => [...current, { id, value: '', entering: !prefersReducedMotion() }])
    pendingFocusId.current = id
  }

  function removeRow(id: string) {
    const index = liveRows.findIndex((row) => row.id === id)
    const neighbour = liveRows[index - 1] ?? liveRows[index + 1]
    if (neighbour) inputRefs.current.get(neighbour.id)?.focus()
    else addButtonRef.current?.focus()

    if (prefersReducedMotion()) {
      setRows((current) => current.filter((row) => row.id !== id))
    } else {
      setRows((current) => current.map((row) => (row.id === id ? { ...row, leaving: true } : row)))
    }
  }

  function onRowAnimationEnd(row: BatchRow) {
    if (row.leaving) setRows((current) => current.filter((r) => r.id !== row.id))
    else if (row.entering) setRows((current) => current.map((r) => (r.id === row.id ? { ...r, entering: false } : r)))
  }

  function updateRow(id: string, value: string) {
    setRows((current) => current.map((row) => (row.id === id ? { ...row, value } : row)))
  }

  // Only judge the batch list once focus leaves the whole group, not between rows.
  function onBatchesBlur(e: FocusEvent<HTMLFieldSetElement>) {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) touch('batches')
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!isValid) return

    const trimmedUpi = upiId.trim()
    const data: AppData = {
      version: 6,
      tutor: {
        name: name.trim(),
        phone: normalizePhone(phone),
        upiId: trimmedUpi || null,
      },
      batches: cleanBatchNames(batchNames).map((batchName) => ({ id: makeId(), name: batchName })),
      students: [],
      payments: [],
      settings: DEFAULT_SETTINGS,
      setupCompletedAt: new Date().toISOString(),
    }

    if (!saveAppData(data)) {
      setSaveFailed(true)
      return
    }
    onComplete(data)
  }

  const show = (field: keyof Touched) => (touched[field] ? errors[field] : null)
  const batchesErrorId = `${uid}-batches-error`
  const batchesHelpId = `${uid}-batches-help`
  const hintId = `${uid}-hint`
  const saveErrorId = `${uid}-save-error`

  return (
    <div className="screen">
      <ChapterBand
        mark
        title="Welcome! Let's set up your tuition app."
        subtitle="Four quick sections. It takes about a minute."
        opening
      />

      <form className="screen-form" onSubmit={handleSubmit} noValidate>
        <div className="screen-body column">
          <TextField
            number="1.1"
            id={`${uid}-name`}
            label="Your name"
            value={name}
            onChange={setName}
            onBlur={() => touch('name')}
            error={show('name')}
            help={<p className="help">Used to sign your reminders.</p>}
            inputProps={{ autoComplete: 'name', autoCapitalize: 'words', enterKeyHint: 'next', maxLength: 60 }}
          />

          <TextField
            number="1.2"
            id={`${uid}-phone`}
            label="Phone number"
            value={phone}
            onChange={setPhone}
            onBlur={() => touch('phone')}
            error={show('phone')}
            help={<p className="help">Parents see this in reminders so they can call you back.</p>}
            inputProps={{
              type: 'tel',
              inputMode: 'tel',
              autoComplete: 'tel-national',
              placeholder: '98765 43210',
              enterKeyHint: 'next',
              maxLength: 16,
            }}
          />

          <TextField
            number="1.3"
            id={`${uid}-upi`}
            label="UPI ID"
            optional
            value={upiId}
            onChange={setUpiId}
            onBlur={() => touch('upi')}
            error={show('upi')}
            help={
              <p className="note-box">
                <strong>Note</strong> You can add this later in Settings. It adds a payment link to reminders.
              </p>
            }
            inputProps={{
              inputMode: 'email',
              autoComplete: 'off',
              autoCapitalize: 'none',
              autoCorrect: 'off',
              spellCheck: false,
              placeholder: 'e.g. ritu@okaxis',
              enterKeyHint: 'next',
              maxLength: 60,
            }}
          />

          <fieldset
            className="section batches"
            onBlur={onBatchesBlur}
            aria-describedby={describedBy(show('batches') && batchesErrorId)}
          >
            <legend className="section-label">
              <span className="section-num" aria-hidden="true">1.4</span>
              Batches
            </legend>
            <p className="help batches-help" id={batchesHelpId}>Name each group you teach. Empty rows are skipped.</p>

            <div className="batch-list">
              {rows.map((row) => {
                const position = liveRows.indexOf(row) + 1
                const inputId = `${uid}-batch-${row.id}`
                const state = row.leaving ? ' is-leaving' : row.entering ? ' is-entering' : ''
                return (
                  <div
                    key={row.id}
                    className={`batch-row${state}`}
                    inert={row.leaving || undefined}
                    onAnimationEnd={(e) => e.target === e.currentTarget && onRowAnimationEnd(row)}
                  >
                    <div className="batch-row-inner">
                      <label className="batch-label" htmlFor={inputId}>
                        Batch {position || ''}
                      </label>
                      <div className="batch-field">
                        <input
                          id={inputId}
                          ref={(el) => {
                            if (el) inputRefs.current.set(row.id, el)
                            else inputRefs.current.delete(row.id)
                          }}
                          className="text-input"
                          value={row.value}
                          onChange={(e) => updateRow(row.id, e.target.value)}
                          placeholder="e.g. Evening – Class 8"
                          autoCapitalize="sentences"
                          enterKeyHint="done"
                          maxLength={60}
                          aria-invalid={show('batches') ? true : undefined}
                          aria-describedby={describedBy(batchesHelpId, show('batches') && batchesErrorId)}
                        />
                        {liveRows.length > 1 && (
                          <button
                            type="button"
                            className="icon-button"
                            onClick={() => removeRow(row.id)}
                            aria-label={`Remove batch ${position}`}
                          >
                            <X aria-hidden="true" size={22} strokeWidth={2} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <button type="button" className="add-button" onClick={addRow} ref={addButtonRef}>
              <Plus aria-hidden="true" size={20} strokeWidth={2.5} />
              Add another batch
            </button>
            {show('batches') && <FieldError id={batchesErrorId} message={errors.batches!} />}
          </fieldset>
        </div>

        <div className="dock">
          <div className="column">
            {saveFailed && (
              <div className="save-error">
                <FieldError
                  id={saveErrorId}
                  alert
                  message="Couldn't save on this device. Check that site storage isn't blocked, then try again."
                />
              </div>
            )}
            <button
              type="submit"
              className="cta"
              disabled={!isValid}
              aria-describedby={describedBy(hintId, saveFailed && saveErrorId)}
            >
              Get started
            </button>
            <p className="cta-hint" id={hintId} aria-live="polite">
              {hint}
            </p>
          </div>
        </div>
      </form>
    </div>
  )
}
