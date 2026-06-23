interface PlaceholderSwatchProps {
  aspectRatio: string
  label: string
  fontSize?: number
  border?: boolean
}

/** The striped fallback tile shown when a product has no photo. */
export function PlaceholderSwatch({ aspectRatio, label, fontSize = 10, border = true }: PlaceholderSwatchProps) {
  return (
    <div
      className={`flex items-center justify-center ${border ? 'border border-neutral-200 dark:border-neutral-800' : ''}`}
      style={{
        aspectRatio,
        background:
          'repeating-linear-gradient(135deg,var(--stripe-a) 0,var(--stripe-a) 8px,var(--stripe-b) 8px,var(--stripe-b) 16px)',
      }}
    >
      <span className="font-mono uppercase text-neutral-600 dark:text-neutral-400" style={{ fontSize, letterSpacing: '0.14em' }}>
        {label}
      </span>
    </div>
  )
}
