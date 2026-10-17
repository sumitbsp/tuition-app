import { IndianRupee, Settings, Users } from 'lucide-react'
import './BottomNav.css'

export type Tab = 'home' | 'students' | 'settings'

type Props = {
  current: Tab
  onChange: (tab: Tab) => void
}

const TABS: { value: Tab; label: string; icon: typeof Users }[] = [
  { value: 'home', label: 'Fees', icon: IndianRupee },
  { value: 'students', label: 'Students', icon: Users },
  { value: 'settings', label: 'Settings', icon: Settings },
]

/**
 * App-level navigation between the two top screens. Rendered by App outside the
 * screens, so it holds still (and keeps focus) when the tab changes.
 */
export default function BottomNav({ current, onChange }: Props) {
  return (
    <nav className="bottom-nav" aria-label="Main">
      <ul className="bottom-nav-list">
        {TABS.map(({ value, label, icon: Icon }) => {
          const active = value === current
          return (
            <li key={value}>
              <button
                type="button"
                className="bottom-nav-item"
                aria-current={active ? 'page' : undefined}
                onClick={() => {
                  if (!active) onChange(value)
                }}
              >
                <Icon aria-hidden="true" size={24} strokeWidth={active ? 2.5 : 2} />
                {label}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
