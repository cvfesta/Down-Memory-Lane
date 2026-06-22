import type { CSSProperties } from 'react'
import { HoverButton } from '../components/ui'

interface AboutProps {
  onContact: () => void
}

const heading: CSSProperties = {
  fontSize: 10,
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  color: 'var(--gold)',
  marginBottom: 8,
}

const ctaBase: CSSProperties = {
  marginTop: 34,
  background: 'var(--btn-bg)',
  color: 'var(--btn-text)',
  border: 'none',
  cursor: 'pointer',
  fontSize: 12,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  padding: '13px 30px',
  borderRadius: 10,
}
const ctaHover: CSSProperties = { background: 'var(--gold)' }

export function About({ onContact }: AboutProps) {
  return (
    <section style={{ paddingTop: 44 }}>
      <div
        style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 'var(--hero)', fontWeight: 600, lineHeight: 1.05 }}
      >
        About Down Memory Lane
      </div>
      <p style={{ margin: '14px 0 44px', maxWidth: 560, color: 'var(--muted)' }}>
        A note from the people behind the collection.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'var(--cols-about)', gap: 'var(--gap-split)', alignItems: 'start' }}>
        <div
          style={{
            aspectRatio: '4 / 5',
            background: 'repeating-linear-gradient(135deg,var(--stripe-a) 0,var(--stripe-a) 9px,var(--stripe-b) 9px,var(--stripe-b) 18px)',
            border: '1px solid var(--line)',
            borderRadius: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span
            style={{
              fontFamily: 'ui-monospace,Menlo,monospace',
              fontSize: 10,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--muted-3)',
            }}
          >
            portrait / shop photo
          </span>
        </div>

        <div style={{ maxWidth: 580 }}>
          <p style={{ margin: '0 0 18px', fontSize: 16, lineHeight: 1.75, color: 'var(--ink-strong)' }}>
            Down Memory Lane began the way most good collections do — with a love of objects that carry a story. Over the
            years that habit grew into a small business, seeking out clocks, paintings, books and curiosities with real
            character and a little history to them.
          </p>
          <p style={{ margin: 0, fontSize: 16, lineHeight: 1.75, color: 'var(--ink-strong)' }}>
            We offer pieces online and in person at antique fairs and markets around the area. Most are found at estate
            sales, auctions and the occasional lucky discovery, then cleaned, gently repaired where needed, and described
            honestly — patina, wear and all.
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'var(--cols-2)',
              gap: 32,
              marginTop: 36,
              borderTop: '1px solid var(--line)',
              paddingTop: 30,
            }}
          >
            <div>
              <div style={heading}>What we look for</div>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.65, color: 'var(--ink-soft)' }}>
                Quality, character and a bit of a story. We favour things that have aged well and were made to last.
              </p>
            </div>
            <div>
              <div style={heading}>How buying works</div>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.65, color: 'var(--ink-soft)' }}>
                Send an inquiry on anything that catches your eye. We confirm availability, then arrange payment and
                local pickup or delivery.
              </p>
            </div>
          </div>

          <HoverButton baseStyle={ctaBase} hoverStyle={ctaHover} onClick={onContact}>
            Get in touch
          </HoverButton>
        </div>
      </div>
    </section>
  )
}
