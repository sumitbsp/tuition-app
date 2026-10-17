import { useRef, type KeyboardEvent } from 'react'

/** Upcoming fees have no tab: All lists them under "Due later this month". */
export type FeeFilter = 'due' | 'paid' | 'all'

type Props = {
  value: FeeFilter
  counts: Record<FeeFilter, number>
  panelId: string
  onChange: (value: FeeFilter) => void
}

const TABS: { value: FeeFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'due', label: 'Due' },
  { value: 'paid', label: 'Paid' },
]

/** WAI-ARIA tabs: arrow keys move between tabs, Home/End jump to the ends. */
export default function FilterTabs({ value, counts, panelId, onChange }: Props) {
  const refs = useRef<(HTMLButtonElement | null)[]>([])

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const index = TABS.findIndex((tab) => tab.value === value)
    const moves: Record<string, number> = { ArrowRight: index + 1, ArrowLeft: index - 1, Home: 0, End: TABS.length - 1 }
    if (!(e.key in moves)) return
    e.preventDefault()
    const next = (moves[e.key] + TABS.length) % TABS.length
    onChange(TABS[next].value)
    refs.current[next]?.focus()
  }

  return (
    <div className="filter-tabs" role="tablist" aria-label="Show students" onKeyDown={onKeyDown}>
      {TABS.map((tab, i) => {
        const selected = tab.value === value
        return (
          <button
            key={tab.value}
            ref={(el) => {
              refs.current[i] = el
            }}
            type="button"
            role="tab"
            id={`tab-${tab.value}`}
            className="filter-tab"
            aria-selected={selected}
            aria-controls={panelId}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(tab.value)}
          >
            {tab.label}
            <span className="filter-count">{counts[tab.value]}</span>
          </button>
        )
      })}
    </div>
  )
}
