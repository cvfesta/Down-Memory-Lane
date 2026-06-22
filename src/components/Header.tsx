import type { CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import { HoverButton } from './ui'
import { useTheme } from '../lib/theme'
import type { ThemePref } from '../lib/theme'

const navBase: CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  fontSize: 12,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  color: 'var(--ink)',
  padding: '6px 0',
}
const navHover: CSSProperties = { color: 'var(--gold)' }

const themeSelect: CSSProperties = {
  border: '1px solid var(--line-2)',
  background: 'var(--surface)',
  color: 'var(--ink)',
  borderRadius: 8,
  padding: '6px 8px',
  fontSize: 12,
  fontFamily: 'inherit',
  cursor: 'pointer',
}

export function Header() {
  const navigate = useNavigate()
  const { pref, setTheme } = useTheme()

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 30,
        background: 'var(--header-bg)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid var(--line)',
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '14px var(--pad-x)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px 12px',
        }}
      >
        <button
          onClick={() => navigate('/')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0 }}
        >
          <div
            style={{
              fontFamily: "'Playfair Display',Georgia,serif",
              fontSize: 'var(--brand)',
              fontWeight: 600,
              lineHeight: 1,
              color: 'var(--ink)',
            }}
          >
            Down Memory Lane
          </div>
          <div
            style={{
              fontSize: 10,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: 'var(--gold)',
              marginTop: 4,
            }}
          >
            Antiques &amp; Curiosities
          </div>
        </button>
        <nav style={{ display: 'flex', gap: 'var(--nav-gap)', alignItems: 'center' }}>
          <HoverButton baseStyle={navBase} hoverStyle={navHover} onClick={() => navigate('/')}>
            Browse
          </HoverButton>
          <HoverButton baseStyle={navBase} hoverStyle={navHover} onClick={() => navigate('/about')}>
            About
          </HoverButton>
          <HoverButton baseStyle={navBase} hoverStyle={navHover} onClick={() => navigate('/contact')}>
            Contact
          </HoverButton>
          <select
            value={pref}
            onChange={(e) => setTheme(e.target.value as ThemePref)}
            aria-label="Theme"
            title="Theme"
            style={themeSelect}
          >
            <option value="auto">◐ Auto theme</option>
            <option value="light">☀ Light mode</option>
            <option value="dark">☾ Dark mode</option>
          </select>
        </nav>
      </div>
    </header>
  )
}
