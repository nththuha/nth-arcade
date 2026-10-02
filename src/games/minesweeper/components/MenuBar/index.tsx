import { useEffect, useRef, useState } from 'react'
import classes from './index.module.css'

export interface MenuItem {
  label: string
  shortcut?: string
  onSelect: () => void
  separator?: boolean
  checked?: boolean
}

export interface Menu {
  label: string
  items: MenuItem[]
}

export function MenuBar({ menus }: { menus: Menu[] }) {
  const [open, setOpen] = useState<number | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open === null) return
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(null)
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null)
    }
    window.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div className={classes.bar} ref={rootRef} role="menubar">
      {menus.map((menu, i) => (
        <div key={menu.label} className={classes.menu}>
          <button
            type="button"
            className={classes.trigger}
            aria-haspopup="menu"
            aria-expanded={open === i}
            onClick={() => setOpen(open === i ? null : i)}
            onMouseEnter={() => open !== null && setOpen(i)}
          >
            {menu.label}
          </button>

          {open === i && (
            <div className={classes.dropdown} role="menu">
              {menu.items.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  role={item.checked === undefined ? 'menuitem' : 'menuitemcheckbox'}
                  aria-checked={item.checked}
                  className={`${classes.item} ${item.separator ? classes.separator : ''}`}
                  onClick={() => {
                    setOpen(null)
                    item.onSelect()
                  }}
                >
                  {item.checked && <span className={classes.check}>✓</span>}
                  <span>{item.label}</span>
                  {item.shortcut && <span className={classes.shortcut}>{item.shortcut}</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
