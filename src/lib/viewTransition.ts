import { flushSync } from 'react-dom'

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Runs a state change inside a view transition.
 * - "screen": a screen change; the chapter band holds while the page crossfades.
 *   `scrollY` is applied after the new screen renders (the update runs asynchronously).
 * - "list": rows reflow in place (e.g. a row leaving the Pending tab). The page
 *   itself doesn't crossfade; see `html.vt-list` in HomeScreen.css. Skipped under
 *   reduced motion.
 * Browsers without View Transitions just apply the change, as does `instant`
 * (the browser already animated it, e.g. a swipe-back gesture).
 */
export function transition(
  update: () => void,
  options: { kind?: 'screen' | 'list'; scrollY?: number; instant?: boolean } = {},
) {
  const { kind = 'screen', scrollY, instant = false } = options
  const run = () => {
    flushSync(update)
    if (scrollY !== undefined) window.scrollTo(0, scrollY)
  }
  if (instant || !document.startViewTransition || (kind === 'list' && reducedMotion())) {
    run()
    return
  }
  const root = document.documentElement
  if (kind === 'list') root.classList.add('vt-list')
  const vt = document.startViewTransition(run)
  // A skipped transition (hidden tab, another one starting) still runs the update; only the
  // animation is lost, so its rejection is expected, not an error.
  vt.ready.catch(() => {})
  vt.finished.catch(() => {}).finally(() => root.classList.remove('vt-list'))
}
