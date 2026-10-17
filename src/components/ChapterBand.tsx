import type { ReactNode, Ref } from 'react'
import './ChapterBand.css'

type Props = {
  /** Shows the app mark at the band's right (Setup only). Decorative; hidden from assistive tech. */
  mark?: boolean
  title: string
  subtitle?: string
  /** Plays the first-launch "print in" sequence when the band mounts. */
  opening?: boolean
  /** Lets a screen move focus to its heading after a screen change. */
  titleRef?: Ref<HTMLHeadingElement>
  /** Controls that belong in the band, under the heading (e.g. Home's month switcher). */
  children?: ReactNode
}

// The teal chapter band shared by every screen. Its view-transition names
// keep it in place while screens change underneath it (see ChapterBand.css).
export default function ChapterBand({ mark, title, subtitle, opening, titleRef, children }: Props) {
  return (
    <header className={`chapter-band${opening ? ' is-opening' : ''}`}>
      <div className="column chapter-band-inner">
        <div className="chapter-text">
          <h1 className="chapter-title" ref={titleRef} tabIndex={titleRef ? -1 : undefined}>
            {title}
          </h1>
          {subtitle && <p className="chapter-sub">{subtitle}</p>}
          {children}
        </div>
        {mark && <img className="chapter-mark" src="/icons/appIcons/favicon.svg" alt="" width={80} height={80} />}
      </div>
    </header>
  )
}
