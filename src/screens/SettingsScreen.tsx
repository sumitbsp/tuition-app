import { useCallback, useEffect, useId, useRef, useState, type ChangeEvent, type FormEvent, type KeyboardEvent } from 'react'
import { CircleCheck, Download, ExternalLink, RotateCcw, Trash2, Upload } from 'lucide-react'
import {
  dateKey,
  formatDateLong,
  formatRupees,
  normalizePhone,
  parseAppData,
  parseDueDay,
  parseFee,
  validateDueDay,
  validateFee,
  validateName,
  validatePhone,
  validateUpiId,
  type AppData,
} from '../lib/appData'
import {
  DEFAULT_REMINDER,
  REMINDER_PLACEHOLDERS,
  currentMonth,
  fillReminder,
  formatDueLong,
  formatMonth,
  formatMonthShort,
  unknownPlaceholders,
  upiPayLink,
} from '../lib/fees'
import { formatPhone } from '../lib/messages'
import { describedBy, joinList } from '../lib/text'
import ChapterBand from '../components/ChapterBand'
import { FieldError, TextField } from '../components/Field'
import '../components/form.css'
import './SettingsScreen.css'

type Props = {
  data: AppData
  /** Saves new data; false when the device refused the write. */
  onPersist: (next: AppData) => boolean
  /** Replaces everything with a backup's data and remounts this screen; false when it couldn't be saved. */
  onRestore: (next: AppData, message: string) => boolean
  /** Wipes the app record and returns to first-launch setup. */
  onDeleteAll: () => boolean
  /** Names of sections with unsaved changes, so App can warn before switching tabs. */
  onUnsavedChange: (sections: string[]) => void
  /** One-line confirmation after a restore, announced politely. */
  flash: string | null
  /** data-focus-key to focus on arrival, e.g. "backup" after a restore. */
  focusKey: string | null
}

const SAVE_FAILED = "Couldn't save on this device. Check that site storage isn't blocked."
const MAX_BACKUP_BYTES = 5 * 1024 * 1024
const DAY_MS = 24 * 60 * 60 * 1000

type PendingRestore = { data: AppData; fileName: string; exportedAt: string | null }

function count(n: number, one: string, many: string) {
  return `${n} ${n === 1 ? one : many}`
}

function contents(data: AppData) {
  return `${count(data.students.length, 'student', 'students')}, ${count(data.batches.length, 'batch', 'batches')} and ${count(data.payments.length, 'fee record', 'fee records')}`
}

/** A status line under a section's actions: the last result, or a reminder that changes aren't saved. */
function SectionStatus({ message, error, unsaved }: { message: string; error?: boolean; unsaved?: boolean }) {
  return (
    <p className={`inline-status settings-status${error ? ' is-error' : ''}`} role="status">
      {message ? (
        <>
          {!error && <CircleCheck aria-hidden="true" size={16} strokeWidth={2.25} />}
          {message}
        </>
      ) : unsaved ? (
        <span className="settings-unsaved">Not saved yet.</span>
      ) : null}
    </p>
  )
}

export default function SettingsScreen({ data, onPersist, onRestore, onDeleteAll, onUnsavedChange, flash, focusKey }: Props) {
  const uid = useId()
  /** Fixed when the screen opens, so the "days since backup" count is stable while it's open. */
  const [openedAt] = useState(() => Date.now())
  const rootRef = useRef<HTMLDivElement>(null)
  const { tutor, settings } = data

  // --- 1 Your details ---------------------------------------------------------
  const [name, setName] = useState(tutor.name)
  const [phone, setPhone] = useState(tutor.phone)
  const [upiId, setUpiId] = useState(tutor.upiId ?? '')
  const [detailsTouched, setDetailsTouched] = useState({ name: false, phone: false, upi: false })
  const [detailsStatus, setDetailsStatus] = useState({ message: '', error: false })
  const detailErrors = { name: validateName(name), phone: validatePhone(phone), upi: validateUpiId(upiId) }
  const detailsDirty =
    name.trim() !== tutor.name || normalizePhone(phone) !== tutor.phone || (upiId.trim() || null) !== tutor.upiId
  const testUpi = upiId.trim() && !detailErrors.upi ? upiId.trim() : null

  // --- 2 Reminder message -----------------------------------------------------
  const savedTemplate = settings.reminderTemplate ?? DEFAULT_REMINDER
  const [template, setTemplate] = useState(savedTemplate)
  const [templateTouched, setTemplateTouched] = useState(false)
  const [templateStatus, setTemplateStatus] = useState({ message: '', error: false })
  const templateRef = useRef<HTMLTextAreaElement>(null)
  const templateError = template.trim() ? null : 'Write a reminder message, or reset to the default.'
  const unknown = unknownPlaceholders(template)
  const templateDirty = template !== savedTemplate

  // --- 3 Defaults for new students --------------------------------------------
  const savedFee = settings.defaultFee === null ? '' : String(settings.defaultFee)
  const [defaultFee, setDefaultFee] = useState(savedFee)
  const [defaultDueDay, setDefaultDueDay] = useState(String(settings.defaultDueDay))
  const [defaultsTouched, setDefaultsTouched] = useState({ fee: false, dueDay: false })
  const [defaultsStatus, setDefaultsStatus] = useState({ message: '', error: false })
  const defaultErrors = {
    fee: defaultFee.trim() ? validateFee(defaultFee) : null,
    dueDay: validateDueDay(defaultDueDay),
  }
  const defaultsDirty = defaultFee.trim() !== savedFee || defaultDueDay.trim() !== String(settings.defaultDueDay)

  // --- 4 Backup ---------------------------------------------------------------
  const [backupStatus, setBackupStatus] = useState({ message: '', error: false })
  /** The export inside the Delete all data confirmation reports here, so it isn't announced twice. */
  const [wipeExportStatus, setWipeExportStatus] = useState({ message: '', error: false })
  const [restoreError, setRestoreError] = useState<string | null>(null)
  const [pendingRestore, setPendingRestore] = useState<PendingRestore | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const restoreButtonRef = useRef<HTMLButtonElement>(null)
  const restoreCancelRef = useRef<HTMLButtonElement>(null)

  // --- 5 Danger zone ----------------------------------------------------------
  const [confirmingWipe, setConfirmingWipe] = useState(false)
  const [wipeText, setWipeText] = useState('')
  const [wipeTouched, setWipeTouched] = useState(false)
  const [wipeFailed, setWipeFailed] = useState(false)
  const wipeButtonRef = useRef<HTMLButtonElement>(null)
  const wipeReady = wipeText.trim() === 'DELETE'

  // --- Unsaved changes ----------------------------------------------------------
  const unsaved = [
    detailsDirty && 'Your details',
    templateDirty && 'Reminder message',
    defaultsDirty && 'Defaults for new students',
  ].filter((s): s is string => Boolean(s))
  const unsavedKey = unsaved.join('|')

  useEffect(() => {
    onUnsavedChange(unsavedKey ? unsavedKey.split('|') : [])
  }, [unsavedKey, onUnsavedChange])

  useEffect(() => () => onUnsavedChange([]), [onUnsavedChange])

  // Reload, close or leave the site: the browser's own "Leave site?" prompt.
  useEffect(() => {
    if (!unsavedKey) return
    const onBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [unsavedKey])

  // --- Focus --------------------------------------------------------------------
  const focusByKey = useCallback((key: string) => {
    const target = rootRef.current?.querySelector<HTMLElement>(`[data-focus-key="${key}"]`)
    if (!target) return
    target.focus({ preventScroll: true })
    target.scrollIntoView({ block: 'start' })
  }, [])

  useEffect(() => {
    if (!focusKey) return
    const frame = requestAnimationFrame(() => focusByKey(focusKey))
    return () => cancelAnimationFrame(frame)
  }, [focusKey, focusByKey])

  useEffect(() => {
    if (pendingRestore) restoreCancelRef.current?.focus()
  }, [pendingRestore])

  useEffect(() => {
    if (confirmingWipe) document.getElementById(`${uid}-wipe`)?.focus()
  }, [confirmingWipe, uid])

  /** Shows the first invalid field's error and moves focus to it. */
  function focusFirst(ids: (string | false)[]) {
    const id = ids.find(Boolean)
    if (id) document.getElementById(id)?.focus()
  }

  // --- Actions --------------------------------------------------------------------
  function saveDetails(e: FormEvent) {
    e.preventDefault()
    if (detailErrors.name || detailErrors.phone || detailErrors.upi) {
      setDetailsTouched({ name: true, phone: true, upi: true })
      focusFirst([
        Boolean(detailErrors.name) && `${uid}-name`,
        Boolean(detailErrors.phone) && `${uid}-phone`,
        Boolean(detailErrors.upi) && `${uid}-upi`,
      ])
      return
    }
    const next = { ...data, tutor: { name: name.trim(), phone: normalizePhone(phone), upiId: upiId.trim() || null } }
    const ok = onPersist(next)
    if (ok) {
      setName(next.tutor.name)
      setPhone(next.tutor.phone)
      setUpiId(next.tutor.upiId ?? '')
    }
    setDetailsStatus(ok ? { message: 'Details saved.', error: false } : { message: SAVE_FAILED, error: true })
  }

  function insertPlaceholder(key: string) {
    const field = templateRef.current
    const token = `{${key}}`
    const start = field?.selectionStart ?? template.length
    const end = field?.selectionEnd ?? template.length
    setTemplate(template.slice(0, start) + token + template.slice(end))
    setTemplateStatus({ message: '', error: false })
    // Put the cursor back just after the inserted placeholder.
    requestAnimationFrame(() => {
      field?.focus()
      field?.setSelectionRange(start + token.length, start + token.length)
    })
  }

  function resetTemplate() {
    setTemplate(DEFAULT_REMINDER)
    setTemplateTouched(false)
    setTemplateStatus({
      message: templateDirty || savedTemplate !== DEFAULT_REMINDER ? 'Reset to the default message. Save to keep it.' : 'This is already the default message.',
      error: false,
    })
  }

  function saveTemplate(e: FormEvent) {
    e.preventDefault()
    if (templateError) {
      setTemplateTouched(true)
      templateRef.current?.focus()
      return
    }
    const reminderTemplate = template === DEFAULT_REMINDER ? null : template
    const ok = onPersist({ ...data, settings: { ...settings, reminderTemplate } })
    setTemplateStatus(ok ? { message: 'Reminder message saved.', error: false } : { message: SAVE_FAILED, error: true })
  }

  function saveDefaults(e: FormEvent) {
    e.preventDefault()
    if (defaultErrors.fee || defaultErrors.dueDay) {
      setDefaultsTouched({ fee: true, dueDay: true })
      focusFirst([Boolean(defaultErrors.fee) && `${uid}-default-fee`, Boolean(defaultErrors.dueDay) && `${uid}-default-due`])
      return
    }
    const next = {
      ...settings,
      defaultFee: defaultFee.trim() ? parseFee(defaultFee) : null,
      defaultDueDay: parseDueDay(defaultDueDay)!,
    }
    const ok = onPersist({ ...data, settings: next })
    if (ok) {
      setDefaultFee(next.defaultFee === null ? '' : String(next.defaultFee))
      setDefaultDueDay(String(next.defaultDueDay))
    }
    setDefaultsStatus(ok ? { message: 'Defaults saved.', error: false } : { message: SAVE_FAILED, error: true })
  }

  function exportBackup(report: typeof setBackupStatus) {
    const now = new Date()
    const exportedAt = now.toISOString()
    const fileName = `tuition-backup-${dateKey(now)}.json`
    const snapshot: AppData = { ...data, settings: { ...settings, lastExportAt: exportedAt } }
    const blob = new Blob([JSON.stringify({ app: 'tuition-app', exportedAt, data: snapshot }, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    document.body.append(link)
    link.click()
    link.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    // The download already happened; a failed save only means the date isn't remembered.
    onPersist(snapshot)
    report({ message: `Backup downloaded: ${fileName}`, error: false })
  }

  async function onFileChosen(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    // Clear the input so choosing the same file again still fires a change.
    e.target.value = ''
    if (!file) return
    setBackupStatus({ message: '', error: false })
    setRestoreError(null)
    if (file.size > MAX_BACKUP_BYTES) {
      setRestoreError("That file is too large to be a backup from this app.")
      return
    }
    let json: unknown = null
    try {
      json = JSON.parse(await file.text())
    } catch {
      // Not JSON: reported below as not a backup.
    }
    // Exports wrap the record as { app, exportedAt, data }; a bare record is accepted too.
    const wrapper =
      typeof json === 'object' && json !== null && 'data' in json
        ? (json as { data: unknown; exportedAt?: unknown })
        : null
    const parsed = parseAppData(wrapper ? wrapper.data : json)
    const exportedAt = wrapper && typeof wrapper.exportedAt === 'string' ? wrapper.exportedAt : null
    if (!parsed) {
      setRestoreError("This file isn't a backup from this app, or it's damaged. Nothing was changed.")
      return
    }
    setPendingRestore({ data: parsed, fileName: file.name, exportedAt })
  }

  function cancelRestore() {
    setPendingRestore(null)
    requestAnimationFrame(() => restoreButtonRef.current?.focus())
  }

  function confirmRestore() {
    if (!pendingRestore) return
    const message = `Backup restored: ${contents(pendingRestore.data)}.`
    if (!onRestore(pendingRestore.data, message)) setRestoreError(SAVE_FAILED)
  }

  function cancelWipe() {
    setConfirmingWipe(false)
    setWipeExportStatus({ message: '', error: false })
    setWipeText('')
    setWipeTouched(false)
    setWipeFailed(false)
    requestAnimationFrame(() => wipeButtonRef.current?.focus())
  }

  function confirmWipe() {
    if (!wipeReady) {
      setWipeTouched(true)
      document.getElementById(`${uid}-wipe`)?.focus()
      return
    }
    if (!onDeleteAll()) setWipeFailed(true)
  }

  function onEscape(e: KeyboardEvent<HTMLDivElement>, cancel: () => void) {
    if (e.key !== 'Escape') return
    e.stopPropagation()
    cancel()
  }

  // --- Backup reminder ------------------------------------------------------------
  const lastExport = settings.lastExportAt ? new Date(settings.lastExportAt) : null
  const daysSinceExport = lastExport ? Math.floor((openedAt - lastExport.getTime()) / DAY_MS) : null
  const hasRecords = data.students.length > 0

  // --- Preview ----------------------------------------------------------------------
  const month = currentMonth()
  const [year, m] = month.split('-').map(Number)
  const sampleAmount = settings.defaultFee ?? 1500
  const sampleDue = new Date(year, m - 1, Math.min(settings.defaultDueDay, new Date(year, m, 0).getDate()))
  const preview = fillReminder(
    template,
    {
      guardianName: 'Mrs Sharma',
      studentName: 'Aarav',
      month: formatMonth(month),
      amount: formatRupees(sampleAmount),
      dueDate: formatDueLong(sampleDue),
      tutorName: tutor.name,
      tutorPhone: formatPhone(tutor.phone),
    },
    tutor.upiId
      ? { upiId: tutor.upiId, payeeName: tutor.name, amount: sampleAmount, note: `Aarav ${formatMonthShort(month)} fee` }
      : null,
  )

  const templateErrorShown = templateTouched && templateError
  const wipeErrorShown = wipeTouched && !wipeReady

  return (
    <div className="settings" ref={rootRef}>
      <ChapterBand
        title="Settings"
        titleRef={(el) => {
          if (el) el.dataset.focusKey = 'title'
        }}
      />

      <main className="settings-body column">
        <p className="home-flash" role="status">
          {flash && (
            <>
              <CircleCheck aria-hidden="true" size={18} strokeWidth={2.25} />
              {flash}
            </>
          )}
        </p>

        {/* 1 Your details */}
        <form className="section settings-section" onSubmit={saveDetails} noValidate aria-labelledby={`${uid}-details`}>
          <h2 className="group-title" id={`${uid}-details`}>
            <span className="section-num" aria-hidden="true">1</span>
            Your details
          </h2>
          <TextField
            id={`${uid}-name`}
            label="Your name"
            value={name}
            onChange={(v) => {
              setName(v)
              setDetailsStatus({ message: '', error: false })
            }}
            onBlur={() => setDetailsTouched((t) => ({ ...t, name: true }))}
            error={detailsTouched.name ? detailErrors.name : null}
            help={<p className="help">Used to sign your reminders.</p>}
            inputProps={{ autoComplete: 'name', autoCapitalize: 'words', maxLength: 60 }}
          />
          <TextField
            id={`${uid}-phone`}
            label="Phone number"
            value={phone}
            onChange={(v) => {
              setPhone(v)
              setDetailsStatus({ message: '', error: false })
            }}
            onBlur={() => setDetailsTouched((t) => ({ ...t, phone: true }))}
            error={detailsTouched.phone ? detailErrors.phone : null}
            help={<p className="help">Parents see this in reminders so they can call you back.</p>}
            inputProps={{ type: 'tel', inputMode: 'tel', autoComplete: 'tel', placeholder: '98765 43210', maxLength: 16 }}
          />
          <TextField
            id={`${uid}-upi`}
            label="UPI ID"
            optional
            value={upiId}
            onChange={(v) => {
              setUpiId(v)
              setDetailsStatus({ message: '', error: false })
            }}
            onBlur={() => setDetailsTouched((t) => ({ ...t, upi: true }))}
            error={detailsTouched.upi ? detailErrors.upi : null}
            help={<p className="help">Adds a payment link to your reminders.</p>}
            inputProps={{ autoComplete: 'off', autoCapitalize: 'none', spellCheck: false, placeholder: 'e.g. ritu@okaxis', maxLength: 60 }}
          />
          {testUpi && (
            <div className="settings-test-pay">
              <a
                className="add-button"
                href={upiPayLink(testUpi, name.trim() || tutor.name, 1, 'Test payment')}
                aria-describedby={`${uid}-test-pay-help`}
              >
                <ExternalLink aria-hidden="true" size={20} strokeWidth={2.25} />
                Test payment link
              </a>
              <p className="help" id={`${uid}-test-pay-help`}>
                Opens your UPI app with a ₹1 payment to {testUpi}. Check the name and ID, then cancel. You don't need to
                pay.
              </p>
            </div>
          )}
          <div className="settings-actions">
            <button type="submit" className="cta">
              Save details
            </button>
            <SectionStatus {...detailsStatus} unsaved={detailsDirty} />
          </div>
        </form>

        {/* 2 Reminder message */}
        <form className="section settings-section" onSubmit={saveTemplate} noValidate aria-labelledby={`${uid}-reminder`}>
          <h2 className="group-title" id={`${uid}-reminder`}>
            <span className="section-num" aria-hidden="true">2</span>
            Reminder message
          </h2>
          <p className="help settings-intro">
            Sent when you tap Remind on Fees. Tap a placeholder to insert it where the cursor is.
          </p>
          <ul className="template-list placeholder-list" aria-label="Placeholders">
            {REMINDER_PLACEHOLDERS.map((key) => (
              <li key={key}>
                <button type="button" className="template-chip placeholder-chip" onClick={() => insertPlaceholder(key)}>
                  <span className="sr-only">Insert </span>
                  {`{${key}}`}
                </button>
              </li>
            ))}
          </ul>

          <div className="field">
            <label className="section-label" htmlFor={`${uid}-template`}>
              Message
            </label>
            <textarea
              id={`${uid}-template`}
              ref={templateRef}
              className="text-input text-area"
              value={template}
              onChange={(e) => {
                setTemplate(e.target.value)
                setTemplateStatus({ message: '', error: false })
              }}
              onBlur={() => setTemplateTouched(true)}
              rows={9}
              maxLength={1000}
              aria-invalid={templateErrorShown ? true : undefined}
              aria-describedby={describedBy(templateErrorShown && `${uid}-template-error`, `${uid}-template-help`)}
            />
            {templateErrorShown && <FieldError id={`${uid}-template-error`} message={templateError} />}
            <div className="note" id={`${uid}-template-help`}>
              <p className="help">
                {tutor.upiId
                  ? 'Your UPI payment link is added at the end automatically.'
                  : 'Add a UPI ID above and a payment link is added at the end automatically.'}
                {unknown.length > 0 && (
                  <>
                    {' '}
                    <strong className="settings-warn">
                      {joinList(unknown)} {unknown.length === 1 ? "isn't a placeholder" : "aren't placeholders"}, so{' '}
                      {unknown.length === 1 ? 'it' : 'they'} will be sent as typed.
                    </strong>
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="field">
            <h3 className="section-label" id={`${uid}-preview`}>
              Preview <span className="optional">(sample student)</span>
            </h3>
            <div className="reminder-preview" role="region" aria-labelledby={`${uid}-preview`}>
              {preview}
            </div>
          </div>

          <div className="settings-actions">
            <button type="button" className="add-button settings-reset" onClick={resetTemplate}>
              <RotateCcw aria-hidden="true" size={20} strokeWidth={2.25} />
              Reset to default
            </button>
            <button type="submit" className="cta">
              Save message
            </button>
            <SectionStatus {...templateStatus} unsaved={templateDirty} />
          </div>
        </form>

        {/* 3 Defaults for new students */}
        <form className="section settings-section" onSubmit={saveDefaults} noValidate aria-labelledby={`${uid}-defaults`}>
          <h2 className="group-title" id={`${uid}-defaults`}>
            <span className="section-num" aria-hidden="true">3</span>
            Defaults for new students
          </h2>
          <p className="help settings-intro">Filled in when you add a student. You can still change them there.</p>
          <TextField
            id={`${uid}-default-fee`}
            label="Monthly fee"
            optional
            prefix="₹"
            value={defaultFee}
            onChange={(v) => {
              setDefaultFee(v)
              setDefaultsStatus({ message: '', error: false })
            }}
            onBlur={() => setDefaultsTouched((t) => ({ ...t, fee: true }))}
            error={defaultsTouched.fee ? defaultErrors.fee : null}
            inputProps={{ inputMode: 'numeric', autoComplete: 'off', placeholder: 'e.g. 1500', maxLength: 9 }}
          />
          <TextField
            id={`${uid}-default-due`}
            label="Fee due on"
            value={defaultDueDay}
            onChange={(v) => {
              setDefaultDueDay(v)
              setDefaultsStatus({ message: '', error: false })
            }}
            onBlur={() => setDefaultsTouched((t) => ({ ...t, dueDay: true }))}
            error={defaultsTouched.dueDay ? defaultErrors.dueDay : null}
            help={<p className="help">Day of the month, 1 to 31.</p>}
            inputProps={{ inputMode: 'numeric', autoComplete: 'off', placeholder: '1 to 31', maxLength: 2 }}
          />
          <div className="settings-actions">
            <button type="submit" className="cta">
              Save defaults
            </button>
            <SectionStatus {...defaultsStatus} unsaved={defaultsDirty} />
          </div>
        </form>

        {/* 4 Backup */}
        <section className="section settings-section" aria-labelledby={`${uid}-backup`}>
          <h2 className="group-title settings-focus-title" id={`${uid}-backup`} tabIndex={-1} data-focus-key="backup">
            <span className="section-num" aria-hidden="true">4</span>
            Backup
          </h2>
          <p className="help settings-intro">
            Everything lives only on this phone. A backup file keeps your details, batches, students and fee records safe
            if the phone is lost or reset.
          </p>
          <p className="settings-last-export">
            {lastExport ? <>Last backup: {formatDateLong(dateKey(lastExport))}.</> : "You haven't exported a backup yet."}
          </p>
          {hasRecords && (daysSinceExport === null || daysSinceExport > 30) && (
            <p className="note-box settings-backup-note">
              <strong>Note</strong>
              {daysSinceExport === null
                ? 'Export a backup now so your records are safe.'
                : `It's been ${daysSinceExport} days since your last backup. Export a new one to keep your records safe.`}
            </p>
          )}

          <div className="settings-backup-actions">
            <button type="button" className="button-secondary settings-icon-button" onClick={() => exportBackup(setBackupStatus)}>
              <Download aria-hidden="true" size={20} strokeWidth={2.25} />
              Export backup
            </button>
            <button
              type="button"
              className="button-secondary settings-icon-button"
              ref={restoreButtonRef}
              onClick={() => fileInputRef.current?.click()}
              aria-describedby={restoreError ? `${uid}-restore-error` : undefined}
            >
              <Upload aria-hidden="true" size={20} strokeWidth={2.25} />
              Restore from backup
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json"
              className="sr-only"
              tabIndex={-1}
              aria-hidden="true"
              onChange={onFileChosen}
            />
          </div>
          {restoreError && <FieldError id={`${uid}-restore-error`} message={restoreError} />}
          <SectionStatus {...backupStatus} />

          {pendingRestore && (
            <div
              className="delete-confirm settings-confirm"
              role="group"
              aria-labelledby={`${uid}-restore-title`}
              aria-describedby={`${uid}-restore-detail`}
              onKeyDown={(e) => onEscape(e, cancelRestore)}
            >
              <p className="delete-confirm-text" id={`${uid}-restore-title`}>
                Restore {pendingRestore.fileName}?
              </p>
              <div id={`${uid}-restore-detail`}>
                <p className="settings-confirm-detail">
                  {pendingRestore.exportedAt
                    ? `Backup from ${formatDateLong(dateKey(new Date(pendingRestore.exportedAt)))}`
                    : 'This backup has'}
                  {pendingRestore.exportedAt ? ': ' : ' '}
                  {contents(pendingRestore.data)}, for {pendingRestore.data.tutor.name}.
                </p>
                <p className="settings-confirm-detail">
                  It replaces everything on this phone, including your details and settings. This can't be undone, so
                  export a backup of your current data first if you might need it.
                </p>
              </div>
              <div className="delete-confirm-actions">
                <button type="button" className="button-secondary button-small" onClick={cancelRestore} ref={restoreCancelRef}>
                  Cancel
                </button>
                <button type="button" className="button-danger" onClick={confirmRestore}>
                  Replace my data
                </button>
              </div>
            </div>
          )}
        </section>

        {/* 5 Danger zone */}
        <section className="section settings-section settings-danger" aria-labelledby={`${uid}-danger`}>
          <h2 className="group-title" id={`${uid}-danger`}>
            <span className="section-num" aria-hidden="true">5</span>
            Danger zone
          </h2>
          {confirmingWipe ? (
            <div
              className="delete-confirm"
              role="group"
              aria-labelledby={`${uid}-wipe-title`}
              onKeyDown={(e) => onEscape(e, cancelWipe)}
            >
              <p className="delete-confirm-text" id={`${uid}-wipe-title`}>
                Delete all data on this phone?
              </p>
              <p className="settings-confirm-detail">
                This deletes your details, {contents(data)}. It can't be undone. Export a backup first so you can restore
                it later.
              </p>
              <button type="button" className="add-button" onClick={() => exportBackup(setWipeExportStatus)}>
                <Download aria-hidden="true" size={20} strokeWidth={2.25} />
                Export backup first
              </button>
              <SectionStatus {...wipeExportStatus} />
              <TextField
                id={`${uid}-wipe`}
                label="Type DELETE to confirm"
                value={wipeText}
                onChange={setWipeText}
                onBlur={() => setWipeTouched(Boolean(wipeText))}
                error={wipeErrorShown ? 'Type DELETE in capital letters to confirm.' : null}
                inputProps={{ autoComplete: 'off', autoCapitalize: 'characters', spellCheck: false, maxLength: 10 }}
              />
              {wipeFailed && (
                <FieldError id={`${uid}-wipe-failed`} alert message="Couldn't delete on this device. Check that site storage isn't blocked." />
              )}
              <div className="delete-confirm-actions">
                <button type="button" className="button-secondary button-small" onClick={cancelWipe}>
                  Keep my data
                </button>
                <button type="button" className="button-danger" aria-disabled={!wipeReady} onClick={confirmWipe}>
                  Delete everything
                </button>
              </div>
            </div>
          ) : (
            <>
              <p className="help settings-intro">
                Removes everything from this phone and starts again from setup.
              </p>
              <button
                type="button"
                className="danger-text-button"
                ref={wipeButtonRef}
                onClick={() => setConfirmingWipe(true)}
              >
                <Trash2 aria-hidden="true" size={20} strokeWidth={2} />
                Delete all data
              </button>
            </>
          )}
        </section>
      </main>
    </div>
  )
}
