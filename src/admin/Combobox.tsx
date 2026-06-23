import { useRef, useState } from 'react'
import { adminField as inputStyle } from '../lib/styles'

interface ComboboxProps {
  value: string
  onChange: (v: string) => void
  options: string[]
  placeholder?: string
}

/**
 * Free-text input with a filtered dropdown of existing options. Picks an
 * existing value to keep data consistent, or lets you add a brand-new one.
 */
export function Combobox({ value, onChange, options, placeholder }: ComboboxProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState(value)
  const blurTimer = useRef<number | undefined>(undefined)

  // Keep the visible text in sync when the value changes from outside.
  if (!open && query !== value) setQuery(value)

  const q = query.trim().toLowerCase()
  const matches = options.filter((o) => o.toLowerCase().includes(q))
  const exact = options.some((o) => o.toLowerCase() === q)
  const showAddNew = query.trim().length > 0 && !exact

  const pick = (v: string) => {
    onChange(v)
    setQuery(v)
    setOpen(false)
  }

  return (
    <div style={{ position: 'relative' }}>
      <input
        style={inputStyle}
        value={query}
        placeholder={placeholder}
        onChange={(e) => {
          setQuery(e.target.value)
          onChange(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          // Delay so an option click registers before closing.
          blurTimer.current = window.setTimeout(() => setOpen(false), 120)
        }}
      />
      {open && (matches.length > 0 || showAddNew) && (
        <div
          onMouseDown={() => window.clearTimeout(blurTimer.current)}
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: 4,
            zIndex: 20,
            background: 'var(--surface)',
            border: '1px solid var(--line-2)',
            borderRadius: 8,
            boxShadow: '0 8px 24px -10px var(--card-shadow)',
            maxHeight: 220,
            overflowY: 'auto',
          }}
        >
          {matches.map((o) => (
            <button
              key={o}
              type="button"
              onClick={() => pick(o)}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                background: 'none',
                border: 'none',
                padding: '9px 11px',
                fontSize: 14,
                color: 'var(--ink)',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              {o}
            </button>
          ))}
          {showAddNew && (
            <button
              type="button"
              onClick={() => pick(query.trim())}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                background: 'none',
                border: 'none',
                borderTop: matches.length ? '1px solid var(--line)' : 'none',
                padding: '9px 11px',
                fontSize: 14,
                color: 'var(--gold)',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              ➕ Add new: “{query.trim()}”
            </button>
          )}
        </div>
      )}
    </div>
  )
}
