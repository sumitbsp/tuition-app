import { useEffect, useId, useRef, useState, type CSSProperties } from 'react'
import { Check, CircleCheck, Copy, MessageCircle, Square } from 'lucide-react'
import { studentsInBatch, type AppData, type Batch } from '../lib/appData'
import {
  PLACEHOLDER,
  batchRecipients,
  formatPhone,
  guardianLabel,
  messageTemplates,
  whatsappLink,
} from '../lib/messages'
import { describedBy, joinList } from '../lib/text'
import ChapterBand from '../components/ChapterBand'
import { FieldError } from '../components/Field'
import '../components/form.css'
import './MessageScreen.css'

type Props = {
  data: AppData
  batch: Batch
  onDone: () => void
}

type Phase = 'compose' | 'sending' | 'summary'
type Outcome = 'sent' | 'skipped'

const OUTCOME_LABEL: Record<Outcome | 'current' | 'waiting' | 'not-sent', string> = {
  sent: 'Sent',
  skipped: 'Skipped',
  current: 'Now',
  waiting: 'Waiting',
  'not-sent': 'Not sent',
}

function guardians(n: number) {
  return `${n} ${n === 1 ? 'guardian' : 'guardians'}`
}

/** The Clipboard API needs a secure origin; plain-http LAN testing falls back to a hidden textarea. */
async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    // Fall through to the selection fallback.
  }
  const field = document.createElement('textarea')
  field.value = text
  field.setAttribute('readonly', '')
  field.style.position = 'fixed'
  field.style.opacity = '0'
  document.body.append(field)
  const active = document.activeElement as HTMLElement | null
  field.select()
  try {
    return document.execCommand('copy')
  } catch {
    return false
  } finally {
    field.remove()
    active?.focus()
  }
}

export default function MessageScreen({ data, batch, onDone }: Props) {
  const uid = useId()
  const { recipients, skipped } = batchRecipients(studentsInBatch(data.students, batch.id))
  const templates = messageTemplates(batch.name, data.tutor.name)

  const [phase, setPhase] = useState<Phase>('compose')
  const [message, setMessage] = useState('')
  const [messageTouched, setMessageTouched] = useState(false)
  const [templateStatus, setTemplateStatus] = useState('')
  const [copyStatus, setCopyStatus] = useState('')
  /** Position in `recipients` while sending. */
  const [index, setIndex] = useState(0)
  /** WhatsApp has been opened for the current guardian, so Next and Skip take over. */
  const [opened, setOpened] = useState(false)
  const [outcomes, setOutcomes] = useState<Outcome[]>([])
  const [progressStatus, setProgressStatus] = useState('')
  const [stoppedEarly, setStoppedEarly] = useState(false)

  const titleRef = useRef<HTMLHeadingElement>(null)
  const summaryRef = useRef<HTMLHeadingElement>(null)
  const messageRef = useRef<HTMLTextAreaElement>(null)
  /** The step's main action: "Send on WhatsApp" (a link), then "Next" (a button). */
  const mainActionRef = useRef<HTMLElement | null>(null)
  const focusMainAction = useRef(false)

  useEffect(() => {
    titleRef.current?.focus()
  }, [])

  // After every sending step, focus stays on the main action so the tutor can keep going.
  useEffect(() => {
    if (!focusMainAction.current) return
    focusMainAction.current = false
    mainActionRef.current?.focus()
  }, [phase, index, opened])

  useEffect(() => {
    if (phase === 'summary') summaryRef.current?.focus()
  }, [phase])

  const messageError = message.trim() ? null : 'Write a message first.'
  const hasPlaceholder = PLACEHOLDER.test(message)
  const canSend = !messageError && recipients.length > 0

  /** Shows the message error and moves focus to the field; false when the message is empty. */
  function requireMessage(): boolean {
    if (!messageError) return true
    setMessageTouched(true)
    messageRef.current?.focus()
    return false
  }

  function applyTemplate(label: string, text: string) {
    setMessage(text)
    setMessageTouched(false)
    setCopyStatus('')
    setTemplateStatus(
      `Filled in "${label}".${PLACEHOLDER.test(text) ? ' Replace the parts in [brackets].' : ''} You can edit the message below.`,
    )
  }

  async function copyMessage() {
    if (!requireMessage()) return
    const copied = await copyText(message)
    setCopyStatus(
      copied
        ? 'Message copied. Paste it into your WhatsApp group or broadcast list.'
        : "Couldn't copy on this device. Select the message and copy it yourself.",
    )
  }

  function stepLabel(i: number) {
    return `Guardian ${i + 1} of ${recipients.length}: ${guardianLabel(recipients[i])}.`
  }

  function startSending() {
    if (!requireMessage() || recipients.length === 0) return
    setIndex(0)
    setOutcomes([])
    setOpened(false)
    setStoppedEarly(false)
    setProgressStatus(stepLabel(0))
    focusMainAction.current = true
    setPhase('sending')
  }

  function onOpenWhatsApp() {
    // Swap to Next / Skip after the link has done its job; removing it mid-click could cancel it.
    window.setTimeout(() => {
      setOpened(true)
      setProgressStatus(`Opened WhatsApp for ${guardianLabel(recipients[index])}. Sent it? Choose Next. If not, choose Skip.`)
      focusMainAction.current = true
    }, 0)
  }

  function record(outcome: Outcome) {
    const next = [...outcomes]
    next[index] = outcome
    setOutcomes(next)
    const done = outcome === 'sent' ? 'Marked as sent' : 'Skipped'
    if (index + 1 >= recipients.length) {
      setProgressStatus('')
      setPhase('summary')
      return
    }
    setIndex(index + 1)
    setOpened(false)
    setProgressStatus(`${done}: ${guardianLabel(recipients[index])}. ${stepLabel(index + 1)}`)
    focusMainAction.current = true
  }

  function stop() {
    setStoppedEarly(true)
    setProgressStatus('')
    setPhase('summary')
  }

  function stateOf(i: number): keyof typeof OUTCOME_LABEL {
    if (outcomes[i]) return outcomes[i]
    if (phase === 'summary') return 'not-sent'
    return i === index ? 'current' : 'waiting'
  }

  function renderRecipientList() {
    return (
      <ol className="send-list">
        {recipients.map((r, i) => {
          const state = stateOf(i)
          return (
            <li key={r.phone} className={`send-item is-${state}`} aria-current={state === 'current' ? 'step' : undefined}>
              <span className="send-who">
                <span className="send-name">{guardianLabel(r)}</span>
                {r.guardianName && <span className="send-students">{joinList(r.studentNames)}</span>}
              </span>
              <span className={`send-badge is-${state}`}>
                {state === 'sent' && <Check aria-hidden="true" size={16} strokeWidth={2.5} />}
                {OUTCOME_LABEL[state]}
              </span>
            </li>
          )
        })}
      </ol>
    )
  }

  const messageId = `${uid}-message`
  const errorId = `${messageId}-error`
  const helpId = `${messageId}-help`
  const showError = messageTouched && messageError

  const copyStatusLine = (
    <p className="inline-status message-copy-status" role="status">
      {copyStatus && (
        <>
          <CircleCheck aria-hidden="true" size={16} strokeWidth={2.25} />
          {copyStatus}
        </>
      )}
    </p>
  )

  const band = <ChapterBand title="Message batch" subtitle={batch.name} titleRef={titleRef} />

  if (phase === 'compose') {
    return (
      <div className="screen">
        {band}
        <main className="screen-body column message-body">
          {recipients.length > 0 ? (
            <p className="message-reach">
              Goes to <strong>{guardians(recipients.length)}</strong> in {batch.name}.
            </p>
          ) : (
            <p className="note-box">
              <strong>Note</strong> No one in this batch has a guardian phone number yet. Add one from a student's
              details to message them here.
            </p>
          )}

          <section className="message-group" aria-labelledby={`${uid}-templates`}>
            <h2 className="message-heading" id={`${uid}-templates`}>
              Quick templates
            </h2>
            <ul className="template-list">
              {templates.map((t) => (
                <li key={t.id}>
                  <button type="button" className="template-chip" onClick={() => applyTemplate(t.label, t.text)}>
                    {t.label}
                  </button>
                </li>
              ))}
            </ul>
            <p className="inline-status" role="status">
              {templateStatus && (
                <>
                  <CircleCheck aria-hidden="true" size={16} strokeWidth={2.25} />
                  {templateStatus}
                </>
              )}
            </p>
          </section>

          <div className="message-group">
            <label className="section-label" htmlFor={messageId}>
              Message
            </label>
            <textarea
              id={messageId}
              ref={messageRef}
              className="text-input text-area"
              value={message}
              onChange={(e) => {
                setMessage(e.target.value)
                setCopyStatus('')
              }}
              onBlur={() => setMessageTouched(true)}
              rows={8}
              maxLength={1000}
              aria-invalid={showError ? true : undefined}
              aria-describedby={describedBy(showError && errorId, helpId)}
            />
            {showError && <FieldError id={errorId} message={messageError} />}
            <div className="note" id={helpId}>
              <p className="help">
                {hasPlaceholder
                  ? 'Replace the parts in [brackets] before sending.'
                  : 'Each guardian gets this exact message on WhatsApp.'}
              </p>
            </div>
          </div>

          {skipped.length > 0 && (
            <section className="message-group" aria-labelledby={`${uid}-skipped`}>
              <h2 className="message-heading" id={`${uid}-skipped`}>
                Will be skipped
              </h2>
              <p className="help">No guardian phone number for:</p>
              <ul className="skip-list">
                {skipped.map((s) => (
                  <li key={s.id}>{s.name}</li>
                ))}
              </ul>
            </section>
          )}
        </main>

        <div className="dock">
          <div className="column">
            <div className="dock-actions message-actions">
              <button type="button" className="button-secondary" onClick={copyMessage}>
                <Copy aria-hidden="true" size={20} strokeWidth={2.25} />
                Copy message
              </button>
              <button type="button" className="cta" aria-disabled={!canSend} onClick={startSending}>
                Send one by one
              </button>
            </div>
            {copyStatusLine}
            <button type="button" className="add-button message-cancel" onClick={onDone}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (phase === 'sending') {
    const current = recipients[index]
    return (
      <div className="screen">
        {band}
        <main className="screen-body column message-body">
          <p className="sr-only" role="status">
            {progressStatus}
          </p>

          <section className="send-card" aria-labelledby={`${uid}-current`}>
            <p className="send-progress">
              {index + 1} of {recipients.length}
            </p>
            <div
              className="send-meter"
              aria-hidden="true"
              style={{ '--done': index / recipients.length } as CSSProperties}
            />
            <h2 className="send-current" id={`${uid}-current`}>
              {guardianLabel(current)}
            </h2>
            <p className="send-detail">
              {current.guardianName && <>{joinList(current.studentNames)} · </>}
              {formatPhone(current.phone)}
            </p>
            {opened && (
              <p className="help send-hint">
                Sent it? Choose <strong>Next</strong>. If not, choose <strong>Skip</strong>.{' '}
                <a
                  className="send-again"
                  href={whatsappLink(current.phone, message)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open WhatsApp again
                </a>
              </p>
            )}
          </section>

          {renderRecipientList()}

          <button type="button" className="add-button send-stop" onClick={stop}>
            <Square aria-hidden="true" size={18} strokeWidth={2.25} />
            Stop sending
          </button>
        </main>

        <div className="dock">
          <div className="column">
            <div className="dock-actions">
              <button type="button" className="button-secondary" onClick={() => record('skipped')}>
                Skip
              </button>
              {opened ? (
                <button
                  type="button"
                  className="cta"
                  ref={(el) => {
                    mainActionRef.current = el
                  }}
                  onClick={() => record('sent')}
                >
                  Next
                </button>
              ) : (
                <a
                  className="cta cta-link"
                  ref={(el) => {
                    mainActionRef.current = el
                  }}
                  href={whatsappLink(current.phone, message)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={onOpenWhatsApp}
                >
                  <MessageCircle aria-hidden="true" size={22} strokeWidth={2.25} />
                  Send on WhatsApp
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const sent = outcomes.filter((o) => o === 'sent').length
  const skippedCount = outcomes.filter((o) => o === 'skipped').length
  const notSent = recipients.length - sent - skippedCount
  return (
    <div className="screen">
      {band}
      <main className="screen-body column message-body">
        <h2 className="message-summary-title" ref={summaryRef} tabIndex={-1}>
          {stoppedEarly ? 'Stopped sending' : 'All done'}
        </h2>
        <dl className="message-summary">
          <div className="message-stat">
            <dt>Sent</dt>
            <dd>{sent}</dd>
          </div>
          <div className="message-stat">
            <dt>Skipped</dt>
            <dd>{skippedCount}</dd>
          </div>
          {notSent > 0 && (
            <div className="message-stat">
              <dt>Not sent</dt>
              <dd>{notSent}</dd>
            </div>
          )}
        </dl>
        {renderRecipientList()}
        {skipped.length > 0 && (
          <p className="help message-summary-note">
            No guardian phone number, so not messaged: {joinList(skipped.map((s) => s.name))}.
          </p>
        )}
      </main>

      <div className="dock">
        <div className="column">
          <div className="dock-actions message-actions">
            <button type="button" className="button-secondary" onClick={copyMessage}>
              <Copy aria-hidden="true" size={20} strokeWidth={2.25} />
              Copy message
            </button>
            <button type="button" className="cta" onClick={onDone}>
              Back to home
            </button>
          </div>
          {copyStatusLine}
        </div>
      </div>
    </div>
  )
}
