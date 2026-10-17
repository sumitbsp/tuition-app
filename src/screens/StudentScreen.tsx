import { useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { CalendarCheck, CircleCheck, Contact, Plus, Trash2, UserCheck, UserMinus } from 'lucide-react'
import {
  dateKey,
  formatDateLong,
  makeId,
  normalizePhone,
  parseDateKey,
  parseDueDay,
  parseFee,
  validateBatchChoice,
  validateDueDay,
  validateFee,
  validateJoinedOn,
  validateLeftOn,
  validatePhone,
  validateBatchName,
  validateStudentName,
  type Batch,
  type Student,
} from '../lib/appData'
import ChapterBand from '../components/ChapterBand'
import { FieldError, SelectField, TextField } from '../components/Field'
import InlineNameEditor from '../components/InlineNameEditor'
import { contactPickerSupported, pickGuardianContact } from '../lib/contacts'
import { formatMonth } from '../lib/fees'
import { describedBy, joinList } from '../lib/text'
import './StudentScreen.css'

type Props = {
  batches: Batch[]
  /** Present when editing; absent when adding. */
  student?: Student
  /** Pre-selects a batch when adding from that batch's "Add to this batch". */
  initialBatchId?: string
  /** Settings → Defaults for new students; pre-filled when adding. */
  defaults: { fee: number | null; dueDay: number }
  /** Each returns false when the change could not be saved on the device. `message` overrides the confirmation line. */
  onSave: (student: Student, message?: string) => boolean
  onDelete: (student: Student) => boolean
  onCancel: () => void
  /** Creates a batch without leaving the form. Returns it, or null when it couldn't be saved. */
  onCreateBatch: (name: string) => Batch | null
}

type Touched = { name: boolean; batch: boolean; phone: boolean; fee: boolean; joined: boolean; dueDay: boolean }

const FIELDS = ['name', 'batch', 'phone', 'fee', 'joined', 'dueDay'] as const

export default function StudentScreen({
  batches,
  student,
  initialBatchId,
  defaults,
  onSave,
  onDelete,
  onCancel,
  onCreateBatch,
}: Props) {
  const uid = useId()
  const isEdit = Boolean(student)

  const [name, setName] = useState(student?.name ?? '')
  const [className, setClassName] = useState(student?.className ?? '')
  const [batchId, setBatchId] = useState(
    student?.batchId ?? initialBatchId ?? (batches.length === 1 ? batches[0].id : ''),
  )
  const [guardianName, setGuardianName] = useState(student?.guardianName ?? '')
  const [guardianPhone, setGuardianPhone] = useState(student?.guardianPhone ?? '')
  /** Contact Picker: Chrome on Android only; iPhone users type the number. */
  const [canPickContact] = useState(contactPickerSupported)
  const [pickingContact, setPickingContact] = useState(false)
  const [contactError, setContactError] = useState(false)
  const [contactStatus, setContactStatus] = useState('')
  const [fee, setFee] = useState(
    student ? String(student.monthlyFee) : defaults.fee !== null ? String(defaults.fee) : '',
  )
  const [joinedOn, setJoinedOn] = useState(() => student?.joinedOn ?? dateKey(new Date()))
  const [dueDay, setDueDay] = useState(String(student?.feeDueDay ?? defaults.dueDay))
  const [dueDayStatus, setDueDayStatus] = useState('')
  const [touched, setTouched] = useState<Touched>({
    name: false,
    batch: false,
    phone: false,
    fee: false,
    joined: false,
    dueDay: false,
  })
  const [failure, setFailure] = useState<'save' | 'delete' | null>(null)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [creatingBatch, setCreatingBatch] = useState(false)
  const [batchStatus, setBatchStatus] = useState('')
  const [confirmingLeft, setConfirmingLeft] = useState(false)
  const [leftOn, setLeftOn] = useState(() => dateKey(new Date()))
  const [leftTouched, setLeftTouched] = useState(false)

  const titleRef = useRef<HTMLHeadingElement>(null)
  const deleteButtonRef = useRef<HTMLButtonElement>(null)
  const newBatchButtonRef = useRef<HTMLButtonElement>(null)
  const keepButtonRef = useRef<HTMLButtonElement>(null)
  const markLeftButtonRef = useRef<HTMLButtonElement>(null)

  // Announce the new screen to screen readers without popping the keyboard.
  useEffect(() => {
    titleRef.current?.focus()
  }, [])

  useEffect(() => {
    if (confirmingDelete) keepButtonRef.current?.focus()
  }, [confirmingDelete])

  useEffect(() => {
    if (confirmingLeft) document.getElementById(`${uid}-left`)?.focus()
  }, [confirmingLeft, uid])

  const errors = {
    name: validateStudentName(name),
    batch: validateBatchChoice(batchId, batches),
    phone: validatePhone(guardianPhone, "Enter the guardian's phone number."),
    fee: validateFee(fee),
    joined: validateJoinedOn(joinedOn),
    dueDay: validateDueDay(dueDay),
  }
  const isValid = FIELDS.every((field) => !errors[field])
  const joinedDay = parseDateKey(joinedOn)?.getDate() ?? null
  const parsedDueDay = parseDueDay(dueDay)

  // "Add" what is empty, "fix" what was entered but is invalid.
  const toAdd = [
    errors.name && "the student's name",
    errors.phone && !guardianPhone.trim() && "the guardian's phone number",
    errors.fee && !fee.trim() && 'the monthly fee',
    errors.joined && !joinedOn && 'the joining date',
    errors.dueDay && !dueDay.trim() && 'the fee due day',
  ].filter((item): item is string => Boolean(item))
  const toFix = [
    errors.phone && guardianPhone.trim() && "the guardian's phone number (10 digits)",
    errors.fee && fee.trim() && 'the fee (numbers only)',
    errors.joined && joinedOn && 'the joining date',
    errors.dueDay && dueDay.trim() && 'the due day (1 to 31)',
  ].filter((item): item is string => Boolean(item))

  const hintParts = []
  if (toAdd.length) hintParts.push(`To save, add ${joinList(toAdd)}.`)
  if (errors.batch) hintParts.push(hintParts.length ? 'Choose a batch.' : 'To save, choose a batch.')
  if (toFix.length) hintParts.push(`${hintParts.length ? 'Fix' : 'To save, fix'} ${joinList(toFix)}.`)
  const hint = hintParts.join(' ') || (isEdit ? 'Changes are saved on this phone.' : 'Ready to save.')

  const touch = (field: keyof Touched) => setTouched((t) => (t[field] ? t : { ...t, [field]: true }))
  const show = (field: keyof Touched) => (touched[field] ? errors[field] : null)

  /** Reveals every error and focuses the first one; false when the form can't be saved. */
  function checkForm(): boolean {
    if (isValid) return true
    setTouched({ name: true, batch: true, phone: true, fee: true, joined: true, dueDay: true })
    const firstInvalid = FIELDS.find((field) => errors[field])
    if (firstInvalid) document.getElementById(`${uid}-${firstInvalid}`)?.focus()
    return false
  }

  // Save stays pressable (aria-disabled, not disabled) so pressing it while the
  // form is invalid can reveal every error and move focus to the first one.
  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (checkForm()) save(student?.leftOn ?? null)
  }

  /** Saves the form as it stands, with the given leaving date (null = active). */
  function save(nextLeftOn: string | null, message?: string) {
    const now = new Date().toISOString()
    const saved: Student = {
      id: student?.id ?? makeId(),
      name: name.trim(),
      className: className.trim() || null,
      batchId,
      guardianName: guardianName.trim() || null,
      guardianPhone: normalizePhone(guardianPhone),
      monthlyFee: parseFee(fee)!,
      joinedOn,
      feeDueDay: parsedDueDay!,
      leftOn: nextLeftOn,
      createdAt: student?.createdAt ?? now,
      updatedAt: now,
    }
    if (!onSave(saved, message)) setFailure('save')
  }

  const today = dateKey(new Date())
  const leftError = validateLeftOn(leftOn, joinedOn, today)

  function openMarkLeft() {
    setConfirmingDelete(false)
    setLeftOn(today < joinedOn ? joinedOn : today)
    setLeftTouched(false)
    setConfirmingLeft(true)
  }

  function cancelMarkLeft() {
    setConfirmingLeft(false)
    requestAnimationFrame(() => markLeftButtonRef.current?.focus())
  }

  function confirmMarkLeft() {
    if (leftError) {
      setLeftTouched(true)
      document.getElementById(`${uid}-left`)?.focus()
      return
    }
    // Other unsaved edits go in the same save, so nothing typed is lost.
    if (!checkForm()) return
    save(leftOn, `Marked ${name.trim()} as left.`)
  }

  function markActive() {
    if (!checkForm()) return
    save(null, `Marked ${name.trim()} as active.`)
  }

  function applyJoiningDay() {
    if (joinedDay === null) return
    setDueDay(String(joinedDay))
    setDueDayStatus(`Fees set to be due on day ${joinedDay} of each month.`)
  }

  /** Focus stays on the button throughout; cancelling or a failed picker changes nothing. */
  async function pickContact() {
    if (pickingContact) return
    setPickingContact(true)
    setContactStatus('')
    const result = await pickGuardianContact()
    setPickingContact(false)
    if (result.kind === 'cancelled') return
    if (result.kind === 'invalid') {
      setContactError(true)
      return
    }
    setContactError(false)
    setGuardianPhone(result.phone)
    touch('phone')
    const fillName = !guardianName.trim() && result.name
    if (fillName) setGuardianName(result.name!)
    setContactStatus(
      fillName ? 'Phone number and guardian name filled from contacts.' : 'Phone number filled from contacts.',
    )
  }

  function createBatch(name: string): string | null {
    const batch = onCreateBatch(name)
    if (!batch) return "Couldn't save on this device. Check that site storage isn't blocked."
    setBatchId(batch.id)
    setCreatingBatch(false)
    setBatchStatus(`Added batch ${batch.name} and selected it.`)
    // Back to the picker, now showing the new batch.
    requestAnimationFrame(() => document.getElementById(`${uid}-batch`)?.focus())
    return null
  }

  function cancelNewBatch() {
    setCreatingBatch(false)
    requestAnimationFrame(() => newBatchButtonRef.current?.focus())
  }

  function confirmDelete() {
    if (student && !onDelete(student)) setFailure('delete')
  }

  function cancelDelete() {
    setConfirmingDelete(false)
    // Wait for the button to re-render before restoring focus to it.
    requestAnimationFrame(() => deleteButtonRef.current?.focus())
  }

  function onConfirmKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Escape') {
      e.stopPropagation()
      cancelDelete()
    }
  }

  function onLeftKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Escape') {
      e.stopPropagation()
      cancelMarkLeft()
    }
  }

  const hintId = `${uid}-hint`
  const failureId = `${uid}-failure`
  const confirmTextId = `${uid}-confirm`
  const leftTextId = `${uid}-left-confirm`
  const failureMessage =
    failure === 'delete'
      ? "Couldn't delete on this device. Check that site storage isn't blocked, then try again."
      : "Couldn't save on this device. Check that site storage isn't blocked, then try again."

  return (
    <div className="screen">
      <ChapterBand
        title={isEdit ? 'Edit student' : 'Add a student'}
        subtitle={student?.name}
        titleRef={titleRef}
      />

      <form className="screen-form" onSubmit={handleSubmit} noValidate>
        <div className="screen-body column">
          <fieldset className="section">
            <legend className="group-title">
              <span className="section-num" aria-hidden="true">1</span>
              Student
            </legend>
            <TextField
              id={`${uid}-name`}
              label="Student name"
              value={name}
              onChange={setName}
              onBlur={() => touch('name')}
              error={show('name')}
              inputProps={{ autoComplete: 'off', autoCapitalize: 'words', enterKeyHint: 'next', maxLength: 60 }}
            />
            <TextField
              id={`${uid}-class`}
              label="Class"
              optional
              value={className}
              onChange={setClassName}
              onBlur={() => {}}
              error={null}
              inputProps={{ placeholder: 'e.g. 8', autoComplete: 'off', enterKeyHint: 'next', maxLength: 20 }}
            />
            <SelectField
              id={`${uid}-batch`}
              label="Batch"
              value={batchId}
              onChange={setBatchId}
              onBlur={() => touch('batch')}
              error={show('batch')}
              placeholder="Choose a batch"
              options={batches.map((batch) => ({ value: batch.id, label: batch.name }))}
            />
            <div className="new-batch">
              {creatingBatch ? (
                <InlineNameEditor
                  id={`${uid}-new-batch`}
                  label="New batch name"
                  placeholder="e.g. Weekend – Class 6"
                  saveLabel="Add batch"
                  validate={(value) => validateBatchName(value, batches)}
                  onSave={createBatch}
                  onCancel={cancelNewBatch}
                />
              ) : (
                <button
                  type="button"
                  className="add-button"
                  ref={newBatchButtonRef}
                  onClick={() => {
                    setBatchStatus('')
                    setCreatingBatch(true)
                  }}
                >
                  <Plus aria-hidden="true" size={20} strokeWidth={2.5} />
                  New batch
                </button>
              )}
              <p className="inline-status" role="status">
                {batchStatus && (
                  <>
                    <CircleCheck aria-hidden="true" size={16} strokeWidth={2.25} />
                    {batchStatus}
                  </>
                )}
              </p>
            </div>
          </fieldset>

          <fieldset className="section">
            <legend className="group-title">
              <span className="section-num" aria-hidden="true">2</span>
              Guardian
            </legend>
            <TextField
              id={`${uid}-guardian`}
              label="Guardian name"
              optional
              value={guardianName}
              onChange={setGuardianName}
              onBlur={() => {}}
              error={null}
              inputProps={{ autoComplete: 'off', autoCapitalize: 'words', enterKeyHint: 'next', maxLength: 60 }}
            />
            <TextField
              id={`${uid}-phone`}
              label="Guardian phone"
              value={guardianPhone}
              onChange={(value) => {
                setGuardianPhone(value)
                setContactError(false)
                setContactStatus('')
              }}
              onBlur={() => touch('phone')}
              error={show('phone')}
              help={<p className="help">So you can call or message the family.</p>}
              inputProps={{
                type: 'tel',
                inputMode: 'tel',
                autoComplete: 'off',
                placeholder: '98765 43210',
                enterKeyHint: 'next',
                maxLength: 16,
              }}
            />
            {canPickContact && (
              <div className="contact-pick">
                <button
                  type="button"
                  className="add-button"
                  onClick={pickContact}
                  aria-disabled={pickingContact || undefined}
                  aria-describedby={contactError ? `${uid}-contact-error` : undefined}
                >
                  <Contact aria-hidden="true" size={20} strokeWidth={2.25} />
                  Pick from contacts<span className="sr-only"> for the guardian's phone</span>
                </button>
                {contactError && (
                  <FieldError
                    id={`${uid}-contact-error`}
                    message="That contact doesn't have a valid 10-digit mobile number."
                  />
                )}
                <p className="inline-status" role="status">
                  {contactStatus && (
                    <>
                      <CircleCheck aria-hidden="true" size={16} strokeWidth={2.25} />
                      {contactStatus}
                    </>
                  )}
                </p>
              </div>
            )}
          </fieldset>

          <fieldset className="section">
            <legend className="group-title">
              <span className="section-num" aria-hidden="true">3</span>
              Fee
            </legend>
            <TextField
              id={`${uid}-fee`}
              label="Monthly fee"
              prefix="₹"
              value={fee}
              onChange={setFee}
              onBlur={() => touch('fee')}
              error={show('fee')}
              help={<p className="help">Per month, in whole rupees.</p>}
              inputProps={{
                inputMode: 'numeric',
                autoComplete: 'off',
                placeholder: 'e.g. 1500',
                enterKeyHint: 'next',
                maxLength: 9,
              }}
            />
            <TextField
              id={`${uid}-joined`}
              label="Joined on"
              value={joinedOn}
              onChange={setJoinedOn}
              onBlur={() => touch('joined')}
              error={show('joined')}
              help={<p className="help">Fees start from this month.</p>}
              inputProps={{ type: 'date', min: '2000-01-01' }}
            />
            <TextField
              id={`${uid}-dueDay`}
              label="Fee due on"
              value={dueDay}
              onChange={(value) => {
                setDueDay(value)
                setDueDayStatus('')
              }}
              onBlur={() => touch('dueDay')}
              error={show('dueDay')}
              help={
                <p className="help">
                  Fees are due on this day every month.
                  {parsedDueDay !== null && parsedDueDay > 28 && parsedDueDay <= 31 && (
                    <> In shorter months, they're due on the last day.</>
                  )}
                </p>
              }
              inputProps={{
                inputMode: 'numeric',
                autoComplete: 'off',
                placeholder: '1 to 31',
                enterKeyHint: 'done',
                maxLength: 2,
              }}
            />
            {joinedDay !== null && (
              <div className="due-shortcut">
                <button type="button" className="add-button" onClick={applyJoiningDay}>
                  <CalendarCheck aria-hidden="true" size={20} strokeWidth={2.25} />
                  Same as joining day ({joinedDay})
                </button>
              </div>
            )}
            <p className="inline-status" role="status">
              {dueDayStatus && (
                <>
                  <CircleCheck aria-hidden="true" size={16} strokeWidth={2.25} />
                  {dueDayStatus}
                </>
              )}
            </p>
          </fieldset>

          {student && (
            <div className="status-zone">
              {student.leftOn ? (
                <>
                  <p className="status-left">
                    <strong>Left on {formatDateLong(student.leftOn)}.</strong> Hidden from Fees after{' '}
                    {formatMonth(student.leftOn.slice(0, 7))}, and left out of batch messages and reminders. Their
                    fee records are kept.
                  </p>
                  <button type="button" className="button-secondary button-small status-button" onClick={markActive}>
                    <UserCheck aria-hidden="true" size={20} strokeWidth={2.25} />
                    Mark as active
                  </button>
                </>
              ) : confirmingLeft ? (
                <div className="left-confirm" role="group" aria-labelledby={leftTextId} onKeyDown={onLeftKeyDown}>
                  <p className="delete-confirm-text" id={leftTextId}>
                    Mark {student.name} as left?
                  </p>
                  <TextField
                    id={`${uid}-left`}
                    label="Left on"
                    value={leftOn}
                    onChange={setLeftOn}
                    onBlur={() => setLeftTouched(true)}
                    error={leftTouched ? leftError : null}
                    help={
                      <p className="help">
                        They won't appear on Fees after this month, or get batch messages and reminders. Their fee
                        records are kept, and you can mark them active again.
                      </p>
                    }
                    inputProps={{ type: 'date', min: joinedOn, max: today }}
                  />
                  <div className="delete-confirm-actions">
                    <button type="button" className="button-secondary button-small" onClick={cancelMarkLeft}>
                      Keep active
                    </button>
                    <button type="button" className="cta button-small" onClick={confirmMarkLeft}>
                      Mark as left
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  className="button-secondary button-small status-button"
                  onClick={openMarkLeft}
                  ref={markLeftButtonRef}
                >
                  <UserMinus aria-hidden="true" size={20} strokeWidth={2.25} />
                  Mark as left
                </button>
              )}
            </div>
          )}

          {student && (
            <div className="delete-zone">
              {confirmingDelete ? (
                <div
                  className="delete-confirm"
                  role="group"
                  aria-labelledby={confirmTextId}
                  onKeyDown={onConfirmKeyDown}
                >
                  <div id={confirmTextId}>
                    <p className="delete-confirm-text">
                      Delete {student.name}? This also deletes all their fee records, and can't be undone.
                    </p>
                    {!student.leftOn && (
                      <p className="help delete-suggest">
                        If they've stopped coming, mark them as left instead. Their fee history is kept.
                      </p>
                    )}
                  </div>
                  {!student.leftOn && (
                    <button type="button" className="add-button delete-instead" onClick={openMarkLeft}>
                      <UserMinus aria-hidden="true" size={20} strokeWidth={2.25} />
                      Mark as left instead
                    </button>
                  )}
                  <div className="delete-confirm-actions">
                    <button type="button" className="button-secondary button-small" onClick={cancelDelete} ref={keepButtonRef}>
                      Keep
                    </button>
                    <button type="button" className="button-danger" onClick={confirmDelete}>
                      Delete
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  className="danger-text-button"
                  onClick={() => setConfirmingDelete(true)}
                  ref={deleteButtonRef}
                >
                  <Trash2 aria-hidden="true" size={20} strokeWidth={2} />
                  Delete student
                </button>
              )}
            </div>
          )}
        </div>

        <div className="dock">
          <div className="column">
            {failure && (
              <div className="save-error">
                <FieldError id={failureId} alert message={failureMessage} />
              </div>
            )}
            <div className="dock-actions">
              <button type="button" className="button-secondary" onClick={onCancel}>
                Cancel
              </button>
              <button
                type="submit"
                className="cta"
                aria-disabled={!isValid}
                aria-describedby={describedBy(hintId, failure && failureId)}
              >
                {isEdit ? 'Save changes' : 'Save student'}
              </button>
            </div>
            <p className="cta-hint" id={hintId} aria-live="polite">
              {hint}
            </p>
          </div>
        </div>
      </form>
    </div>
  )
}
