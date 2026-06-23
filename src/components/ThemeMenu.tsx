import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { HoverButton } from './ui'
import { useTheme } from '../lib/theme'
import type { ThemePref } from '../lib/theme'

const THEMES: { value: ThemePref; icon: string; label: string }[] = [
  { value: 'auto', icon: '◐', label: 'Auto' },
  { value: 'light', icon: '☀', label: 'Light' },
  { value: 'dark', icon: '☾', label: 'Dark' },
]

const trigger: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 34,
  height: 34,
  borderRadius: '50%',
  border: '1px solid var(--line-2)',
  background: 'none',
  color: 'var(--ink)',
  cursor: 'pointer',
  fontSize: 15,
  lineHeight: 1,
}
const triggerHover: CSSProperties = { borderColor: 'var(--gold)', color: 'var(--gold)' }

const menu: CSSProperties = {
  position: 'absolute',
  top: '100%',
  right: 0,
  marginTop: 8,
  zIndex: 40,
  minWidth: 150,
  background: 'var(--surface)',
  border: '1px solid var(--line-2)',
  borderRadius: 10,
  boxShadow: '0 10px 28px -12px var(--card-shadow)',
  padding: 5,
  display: 'flex',
  flexDirection: 'column',
}
const itemHover: CSSProperties = { background: 'var(--hover-bg)' }
function itemBase(active: boolean): CSSProperties {
  return {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    textAlign: 'left',
    background: 'none',
    border: 'none',
    borderRadius: 7,
    padding: '8px 9px',
    cursor: 'pointer',
    fontSize: 13,
    fontFamily: 'inherit',
    color: active ? 'var(--gold)' : 'var(--ink)',
  }
}

export function ThemeMenu() {
  const { pref, setTheme } = useTheme()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const current = THEMES.find((t) => t.value === pref) ?? THEMES[0]

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <HoverButton
        baseStyle={trigger}
        hoverStyle={triggerHover}
        onClick={() => setOpen((o) => !o)}
        aria-label={`Theme: ${current.label}`}
        aria-haspopup="menu"
        aria-expanded={open}
        title="Theme"
      >
        {current.icon}
      </HoverButton>
      {open && (
        <div role="menu" style={menu}>
          {THEMES.map((t) => (
            <HoverButton
              key={t.value}
              role="menuitem"
              baseStyle={itemBase(t.value === pref)}
              hoverStyle={itemHover}
              onClick={() => {
                setTheme(t.value)
                setOpen(false)
              }}
            >
              <span style={{ width: 14, textAlign: 'center' }}>{t.value === pref ? '✓' : ''}</span>
              <span style={{ width: 16, textAlign: 'center' }}>{t.icon}</span>
              <span>{t.label}</span>
            </HoverButton>
          ))}
        </div>
      )}
    </div>
  )
}
