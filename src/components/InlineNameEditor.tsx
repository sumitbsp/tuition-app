import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { describedBy } from '../lib/text'
import { FieldError } from './Field'

type Props = {
  id: string
  label: string
  initialValue?: string
  saveLabel: string
  placeholder?: string
  /** Returns an error message, or null when the name is acceptable. */
  validate: (value: string) => string | null
  /** Persists the name. Returns an error message when it couldn't be saved. */
  onSave: (value: string) => string | null
  onCancel: () => void
}

/**
 * A text field with its own Save / Cancel, used inside other screens and forms
 * (new batch, rename batch). Enter saves and Escape cancels; it never submits
 * an enclosing form.
 */
export default function InlineNameEditor({
  id,
  label,
  initialValue = '',
  saveLabel,
  placeholder,
  validate,
  onSave,
  onCancel,
}: Props) {
  const [value, setValue] = useState(initialValue)
  const [showError, setShowError] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
    inputRef.current?.select()
  }, [])

  const error = saveError ?? (showError ? validate(value) : null)
  const errorId = `${id}-error`

  function save() {
    const problem = validate(value)
    if (problem) {
      setShowError(true)
      inputRef.current?.focus()
      return
    }
    const failed = onSave(value.trim())
    if (failed) setSaveError(failed)
  }

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Escape') {
      e.preventDefault()
      e.stopPropagation()
      onCancel()
    }
  }

  return (
    <div className="inline-editor-wrap">
    <div className="inline-editor" onKeyDown={onKeyDown}>
      <label className="section-label" htmlFor={id}>
        {label}
      </label>
      <input
        ref={inputRef}
        id={id}
        className="text-input"
        value={value}
        onChange={(e) => {
          setValue(e.target.value)
          setSaveError(null)
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault() // never submit an enclosing form
            save()
          }
        }}
        placeholder={placeholder}
        autoComplete="off"
        autoCapitalize="sentences"
        enterKeyHint="done"
        maxLength={60}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(error && errorId)}
      />
      {error && <FieldError id={errorId} message={error} />}
      <div className="inline-editor-actions">
        <button type="button" className="button-secondary button-small" onClick={onCancel}>
          Cancel
        </button>
        <button type="button" className="cta button-small" onClick={save}>
          {saveLabel}
        </button>
      </div>
    </div>
    </div>
  )
}
