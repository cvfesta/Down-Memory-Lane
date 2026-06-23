import { serif } from '../lib/styles'

export function Footer() {
  return (
    <footer style={{ borderTop: '1px solid var(--line)' }}>
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '26px var(--pad-x)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{ fontFamily: serif, fontSize: 18, fontWeight: 600 }}>
          Down Memory Lane
        </div>
        <div style={{ fontSize: 12, color: 'var(--muted-5)', letterSpacing: '0.04em' }}>
          Antiques &amp; Curiosities · Established locally · © 2026
        </div>
      </div>
    </footer>
  )
}
