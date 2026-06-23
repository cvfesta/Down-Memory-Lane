import type { CSSProperties } from 'react'

interface PlaceholderSwatchProps {
  aspectRatio: string
  label: string
  fontSize?: number
  border?: boolean
}

/** The striped fallback tile shown when a product has no photo. */
export function PlaceholderSwatch({ aspectRatio, label, fontSize = 10, border = true }: PlaceholderSwatchProps) {
  const style: CSSProperties = {
    aspectRatio,
    background: 'repeating-linear-gradient(135deg,var(--stripe-a) 0,var(--stripe-a) 8px,var(--stripe-b) 8px,var(--stripe-b) 16px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    ...(border ? { border: '1px solid var(--line)' } : null),
  }
  return (
    <div style={style}>
      <span
        style={{
          fontFamily: 'ui-monospace,Menlo,monospace',
          fontSize,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: 'var(--muted-3)',
        }}
      >
        {label}
      </span>
    </div>
  )
}
