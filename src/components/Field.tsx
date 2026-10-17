import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react'
import { ChevronDown, CircleAlert } from 'lucide-react'
import { describedBy } from '../lib/text'
import './form.css'

export function FieldError({ id, message, alert }: { id: string; message: string; alert?: boolean }) {
  return (
    <p className="field-error" id={id} role={alert ? 'alert' : undefined}>
      <CircleAlert aria-hidden="true" size={16} strokeWidth={2.25} />
      {message}
    </p>
  )
}

type FieldShellProps = {
  /** Section number (e.g. "1.1"). Omit for a field inside a numbered group. */
  number?: string
  id: string
  label: string
  optional?: boolean
  error: string | null
  help?: ReactNode
  children: (describedById: string | undefined) => ReactNode
}

/** Label, control, error (directly under the control) and help, wired with aria-describedby. */
function FieldShell({ number, id, label, optional, error, help, children }: FieldShellProps) {
  const helpId = `${id}-help`
  const errorId = `${id}-error`
  return (
    <div className={number ? 'section' : 'field'}>
      {number && (
        <span className="section-num" aria-hidden="true">
          {number}
        </span>
      )}
      <label className="section-label" htmlFor={id}>
        {label}
        {optional && <span className="optional"> (optional)</span>}
      </label>
      {children(describedBy(help ? helpId : null, error && errorId))}
      {error && <FieldError id={errorId} message={error} />}
      {help && (
        <div className="note" id={helpId}>
          {help}
        </div>
      )}
    </div>
  )
}

type TextFieldProps = Omit<FieldShellProps, 'children'> & {
  value: string
  onChange: (value: string) => void
  onBlur: () => void
  /** A unit shown inside the input before the value, such as "₹". */
  prefix?: string
  inputProps?: InputHTMLAttributes<HTMLInputElement>
}

export function TextField({ value, onChange, onBlur, prefix, inputProps, ...shell }: TextFieldProps) {
  return (
    <FieldShell {...shell}>
      {(describedById) => {
        const input = (
          <input
            id={shell.id}
            className="text-input"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            aria-invalid={shell.error ? true : undefined}
            aria-describedby={describedById}
            {...inputProps}
          />
        )
        if (!prefix) return input
        return (
          <div className="affix-wrap">
            <span className="affix" aria-hidden="true">
              {prefix}
            </span>
            {input}
          </div>
        )
      }}
    </FieldShell>
  )
}

type SelectFieldProps = Omit<FieldShellProps, 'children'> & {
  value: string
  onChange: (value: string) => void
  onBlur: () => void
  /** A disabled first option shown until something is chosen. Omit for filters with a default. */
  placeholder?: string
  options: { value: string; label: string }[]
  selectProps?: SelectHTMLAttributes<HTMLSelectElement>
}

/** Native select (best picker on phones), dressed as a text input. */
export function SelectField({ value, onChange, onBlur, placeholder, options, selectProps, ...shell }: SelectFieldProps) {
  return (
    <FieldShell {...shell}>
      {(describedById) => (
        <div className="select-wrap">
          <select
            id={shell.id}
            className="text-input"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            aria-invalid={shell.error ? true : undefined}
            aria-describedby={describedById}
            required
            {...selectProps}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown aria-hidden="true" size={20} strokeWidth={2} />
        </div>
      )}
    </FieldShell>
  )
}
