import { useState } from 'react'
import type { CSSProperties, FormEvent } from 'react'
import { HoverButton, FocusInput, FocusTextarea } from '../components/ui'
import type { Item } from '../data/items'
import { readForm, sendContactForm } from '../lib/contact'

type Status = 'idle' | 'sending' | 'sent' | 'error'

interface ItemDetailProps {
  item: Item
  onBack: () => void
}

const backBtnBase: CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  fontSize: 12,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: 'var(--muted)',
  padding: 0,
  marginBottom: 28,
}
const backBtnHover: CSSProperties = { color: 'var(--gold)' }

const inputBase: CSSProperties = {
  background: 'var(--surface)',
  border: '1px solid var(--line-2)',
  borderRadius: 10,
  padding: '11px 13px',
  fontSize: 14,
  color: 'var(--ink)',
  outline: 'none',
}
const inputFocus: CSSProperties = { borderColor: 'var(--gold)' }

const submitBase: CSSProperties = {
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
const submitHover: CSSProperties = { background: 'var(--gold)' }
const submitSending: CSSProperties = { opacity: 0.6, cursor: 'default' }

const errorBanner: CSSProperties = {
  background: 'var(--error-bg)',
  border: '1px solid var(--error-border)',
  color: 'var(--error-text)',
  borderRadius: 10,
  padding: '10px 13px',
  fontSize: 13,
  lineHeight: 1.5,
}

const resetBase: CSSProperties = {
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
const resetHover: CSSProperties = { borderColor: 'var(--gold)', color: 'var(--gold)' }

const specLabel: CSSProperties = {
  padding: '13px 0',
  borderBottom: '1px solid var(--line)',
  fontSize: 10,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  color: 'var(--muted-3)',
  alignSelf: 'center',
}
const specValue: CSSProperties = { padding: '13px 0', borderBottom: '1px solid var(--line)', fontSize: 14 }

const mainImage: CSSProperties = {
  display: 'block',
  width: '100%',
  aspectRatio: '1 / 1',
  objectFit: 'contain',
  background: 'var(--image-bg)',
  border: '1px solid var(--line)',
  padding: 16,
}

const thumbBtnBase: CSSProperties = {
  padding: 0,
  cursor: 'pointer',
  background: 'var(--image-bg)',
  borderRadius: 4,
  overflow: 'hidden',
  lineHeight: 0,
}

const thumbImg: CSSProperties = {
  display: 'block',
  width: '100%',
  aspectRatio: '1 / 1',
  objectFit: 'contain',
}

export function ItemDetail({ item, onBack }: ItemDetailProps) {
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState('')
  const [activePhoto, setActivePhoto] = useState(0)

  const images = item.images ?? []
  const catLine = [item.category, item.sub].filter(Boolean).join(' · ')
  const available = item.status !== 'sold'

  const onInquiry = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fields = readForm(e.currentTarget)
    setError('')
    setStatus('sending')
    try {
      await sendContactForm(`Inquiry: ${item.title}`, fields)
      setStatus('sent')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setStatus('error')
    }
  }

  return (
    <section style={{ paddingTop: 32 }}>
      <HoverButton baseStyle={backBtnBase} hoverStyle={backBtnHover} onClick={onBack}>
        ←&nbsp;&nbsp;Back to the collection
      </HoverButton>

      <div style={{ display: 'grid', gridTemplateColumns: 'var(--cols-split)', gap: 'var(--gap-split)', alignItems: 'start' }}>
        <div>
          {images.length > 0 ? (
            <>
              <img src={images[Math.min(activePhoto, images.length - 1)]} alt={item.title} style={mainImage} />
              {images.length > 1 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginTop: 10 }}>
                  {images.map((src, i) => {
                    const isActive = i === activePhoto
                    return (
                      <button
                        key={src}
                        type="button"
                        onClick={() => setActivePhoto(i)}
                        aria-label={`View photo ${i + 1}`}
                        style={{
                          ...thumbBtnBase,
                          border: `1px solid ${isActive ? 'var(--gold)' : 'var(--line)'}`,
                          outline: isActive ? '1px solid var(--gold)' : 'none',
                        }}
                      >
                        <img src={src} alt={`${item.title} — photo ${i + 1}`} style={thumbImg} />
                      </button>
                    )
                  })}
                </div>
              )}
            </>
          ) : (
            <div
              style={{
                aspectRatio: '1 / 1',
                background: 'repeating-linear-gradient(135deg,var(--stripe-a) 0,var(--stripe-a) 9px,var(--stripe-b) 9px,var(--stripe-b) 18px)',
                border: '1px solid var(--line)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span
                style={{
                  fontFamily: 'ui-monospace,Menlo,monospace',
                  fontSize: 12,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: 'var(--muted-3)',
                }}
              >
                {item.label}
              </span>
            </div>
          )}
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            {item.status === 'sold' && (
              <span
                style={{
                  background: 'var(--sold-bg)',
                  color: '#fff',
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  padding: '5px 11px',
                }}
              >
                Sold
              </span>
            )}
            {available && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 7,
                  fontSize: 11,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: 'var(--available)',
                }}
              >
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--available)', display: 'block' }} />
                Available
              </span>
            )}
          </div>
          <div
            style={{
              fontSize: 10,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'var(--gold)',
              marginBottom: 6,
            }}
          >
            {catLine}
          </div>
          <h1
            style={{
              margin: 0,
              fontFamily: "'Playfair Display',Georgia,serif",
              fontSize: 'var(--h1)',
              fontWeight: 600,
              lineHeight: 1.08,
            }}
          >
            {item.title}
          </h1>
          <div style={{ fontSize: 24, fontWeight: 500, margin: '14px 0 24px' }}>{item.price}</div>

          <div style={{ borderTop: '1px solid var(--line)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', gap: 0 }}>
              <div style={specLabel}>Dimensions</div>
              <div style={specValue}>{item.dim}</div>
              <div style={specLabel}>Era &amp; Origin</div>
              <div style={specValue}>{item.era}</div>
              <div style={specLabel}>Condition</div>
              <div style={specValue}>{item.cond}</div>
            </div>
          </div>

          <p style={{ margin: '24px 0 0', color: 'var(--ink-soft)', fontSize: 15, lineHeight: 1.7 }}>{item.desc}</p>

          <div style={{ marginTop: 34, borderTop: '1px solid var(--line)', paddingTop: 28 }}>
            {status !== 'sent' ? (
              <>
                <h3
                  style={{
                    margin: '0 0 4px',
                    fontFamily: "'Libre Franklin',system-ui,sans-serif",
                    fontSize: 20,
                    fontWeight: 600,
                  }}
                >
                  Interested in this piece?
                </h3>
                <p style={{ margin: '0 0 18px', fontSize: 13, color: 'var(--muted-2)' }}>
                  Send a note and we will get back to you about availability and viewing.
                </p>
                <form onSubmit={onInquiry} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <input type="checkbox" name="botcheck" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ display: 'none' }} />
                  {status === 'error' && <div style={errorBanner}>{error}</div>}
                  <div style={{ display: 'grid', gridTemplateColumns: 'var(--cols-2)', gap: 12 }}>
                    <FocusInput baseStyle={inputBase} focusStyle={inputFocus} name="name" placeholder="Your name" required />
                    <FocusInput
                      baseStyle={inputBase}
                      focusStyle={inputFocus}
                      name="phone"
                      placeholder="Phone (optional)"
                    />
                  </div>
                  <FocusInput
                    baseStyle={inputBase}
                    focusStyle={inputFocus}
                    name="email"
                    type="email"
                    placeholder="Email"
                    required
                  />
                  <FocusTextarea
                    baseStyle={{ ...inputBase, resize: 'vertical' }}
                    focusStyle={inputFocus}
                    name="message"
                    rows={4}
                    placeholder="Tell us what you'd like to know — measurements, condition, history, or arranging a viewing or delivery."
                    required
                  />
                  <HoverButton
                    baseStyle={status === 'sending' ? { ...submitBase, ...submitSending } : submitBase}
                    hoverStyle={status === 'sending' ? {} : submitHover}
                    type="submit"
                    disabled={status === 'sending'}
                  >
                    {status === 'sending' ? 'Sending…' : 'Send inquiry'}
                  </HoverButton>
                </form>
              </>
            ) : (
              <div style={{ background: 'var(--surface)', border: '1px solid var(--line-2)', borderRadius: 10, padding: 26 }}>
                <div
                  style={{
                    fontFamily: "'Libre Franklin',system-ui,sans-serif",
                    fontSize: 19,
                    fontWeight: 600,
                    marginBottom: 6,
                  }}
                >
                  Thank you — your message is on its way.
                </div>
                <p style={{ margin: '0 0 16px', fontSize: 14, color: 'var(--muted)' }}>
                  We have received your inquiry about the {item.title} and will be in touch shortly.
                </p>
                <HoverButton baseStyle={resetBase} hoverStyle={resetHover} onClick={() => setStatus('idle')}>
                  Send another
                </HoverButton>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
