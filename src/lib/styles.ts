import type { CSSProperties } from 'react'

/** The display serif used for headings and the brand wordmark. */
export const serif = "'Playfair Display',Georgia,serif"

// ── Shared form styles (inquiry + contact forms) ──────────────────────────────
export const fieldBase: CSSProperties = {
  background: 'var(--surface)',
  border: '1px solid var(--line-2)',
  borderRadius: 10,
  padding: '11px 13px',
  fontSize: 14,
  color: 'var(--ink)',
  outline: 'none',
}
export const fieldFocus: CSSProperties = { borderColor: 'var(--gold)' }

export const primaryBtn: CSSProperties = {
  marginTop: 4,
  alignSelf: 'flex-start',
  background: 'var(--btn-bg)',
  color: 'var(--btn-text)',
  border: 'none',
  cursor: 'pointer',
  fontSize: 12,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  padding: '13px 28px',
  borderRadius: 10,
}
export const primaryBtnHover: CSSProperties = { background: 'var(--gold)' }
export const primaryBtnSending: CSSProperties = { opacity: 0.6, cursor: 'default' }

export const outlineBtn: CSSProperties = {
  background: 'none',
  border: '1px solid var(--line-2)',
  cursor: 'pointer',
  fontSize: 12,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  padding: '10px 20px',
  borderRadius: 10,
  color: 'var(--ink)',
}
export const outlineBtnHover: CSSProperties = { borderColor: 'var(--gold)', color: 'var(--gold)' }

export const errorBanner: CSSProperties = {
  background: 'var(--error-bg)',
  border: '1px solid var(--error-border)',
  color: 'var(--error-text)',
  borderRadius: 10,
  padding: '10px 13px',
  fontSize: 13,
  lineHeight: 1.5,
}

// ── Admin form field (used by the admin page and its Combobox) ─────────────────
export const adminField: CSSProperties = {
  width: '100%',
  background: 'var(--surface)',
  border: '1px solid var(--line-2)',
  borderRadius: 8,
  padding: '9px 11px',
  fontSize: 14,
  color: 'var(--ink)',
  fontFamily: 'inherit',
  outline: 'none',
}
