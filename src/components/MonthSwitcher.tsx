import { ChevronLeft, ChevronRight } from 'lucide-react'
import { addMonths, formatMonth } from '../lib/fees'

type Props = {
  month: string
  first: string
  last: string
  onChange: (month: string) => void
}

/** "‹ October 2026 ›" inside the chapter band. Bounded to the tracked range. */
export default function MonthSwitcher({ month, first, last, onChange }: Props) {
  const prev = addMonths(month, -1)
  const next = addMonths(month, 1)
  const canPrev = prev >= first
  const canNext = next <= last
  return (
    <div className="month-switcher">
      <button
        type="button"
        className="month-step"
        onClick={() => onChange(prev)}
        disabled={!canPrev}
        aria-label={`Previous month, ${formatMonth(prev)}`}
      >
        <ChevronLeft aria-hidden="true" size={24} strokeWidth={2.25} />
      </button>
      <p className="month-label" aria-live="polite">
        {formatMonth(month)}
      </p>
      <button
        type="button"
        className="month-step"
        onClick={() => onChange(next)}
        disabled={!canNext}
        aria-label={`Next month, ${formatMonth(next)}`}
      >
        <ChevronRight aria-hidden="true" size={24} strokeWidth={2.25} />
      </button>
    </div>
  )
}
