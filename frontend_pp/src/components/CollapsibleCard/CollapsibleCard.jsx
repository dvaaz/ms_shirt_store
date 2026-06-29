import { useState } from 'react'
import { ChevronDownIcon } from '../../assets/icons/Icons'
import styles from './CollapsibleCard.module.css'

// Card colapsável: mostra só o título + seta quando fechado; expande/recolhe
// com animação suave (transição de grid-rows 0fr → 1fr, sem altura fixa).
export default function CollapsibleCard({ title, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <section className={styles.card}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className={styles.header}
      >
        <h4 className={styles.title}>{title}</h4>
        <ChevronDownIcon
          className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`.trim()}
        />
      </button>

      <div className={`${styles.panel} ${open ? styles.panelOpen : ''}`.trim()}>
        <div className={styles.panelInner}>
          <div className={styles.content}>{children}</div>
        </div>
      </div>
    </section>
  )
}
