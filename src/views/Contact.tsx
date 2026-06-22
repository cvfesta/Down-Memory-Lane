import { useState } from 'react'
import type { CSSProperties, FormEvent } from 'react'
import { HoverButton, FocusInput, FocusTextarea } from '../components/ui'
import { readForm, sendContactForm } from '../lib/contact'

type Status = 'idle' | 'sending' | 'sent' | 'error'

const label: CSSProperties = {
  fontSize: 10,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: 'var(--gold)',
  marginBottom: 8,
}

const inputBase: CSSProperties = {
  background: 'var(--surface-2)',
  border: '1px solid var(--line-2)',
  borderRadius: 10,
  padding: '12px 14px',
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
  padding: '13px 30px',
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

export function Contact() {
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState('')

  const onContact = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fields = readForm(e.currentTarget)
    setError('')
    setStatus('sending')
    try {
      await sendContactForm('Message via Down Memory Lane', fields)
      setStatus('sent')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setStatus('error')
    }
  }

  return (
    <section style={{ paddingTop: 44 }}>
      <div
        style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 'var(--hero)', fontWeight: 600, lineHeight: 1.05 }}
      >
        Get in touch
      </div>
      <p style={{ margin: '14px 0 40px', maxWidth: 520, color: 'var(--muted)' }}>
        Everything in the collection is offered online and direct. Send a message about any piece and we will get right
        back to you.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'var(--cols-split)', gap: 'var(--gap-split)', alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
          {/*
            "Reach us" email/phone block — hidden for now (placeholder details).
            To restore: re-add the ContactProps interface + linkStyle const, take
            { contactEmail, telLink, telDisplay } as props again, pass them from
            App.tsx, and uncomment this block.

            <div>
              <div style={label}>Reach us</div>
              <div style={{ fontSize: 15, lineHeight: 1.9 }}>
                <a href={`mailto:${contactEmail}`} style={linkStyle}>{contactEmail}</a>
                <br />
                <a href={telLink} style={linkStyle}>{telDisplay}</a>
              </div>
            </div>
          */}
          <div>
            <div style={label}>Out &amp; about</div>
            <div style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--ink-soft)' }}>
              We also set up at antique fairs and flea markets around the area. Drop us a line to find out where we will
              be next, or to arrange a local viewing or pickup.
            </div>
          </div>
          <div>
            <div style={label}>Response</div>
            <div style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--ink-soft)' }}>
              Most messages are answered within a day or two. Pieces are first-come, first-served — if something catches
              your eye, reach out.
            </div>
          </div>
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 16, padding: 30 }}>
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
                Send a message
              </h3>
              <p style={{ margin: '0 0 20px', fontSize: 13, color: 'var(--muted-2)' }}>
                Questions, a piece you are hunting for, or to arrange a visit.
              </p>
              <form onSubmit={onContact} style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
                <input type="checkbox" name="botcheck" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ display: 'none' }} />
                {status === 'error' && <div style={errorBanner}>{error}</div>}
                <FocusInput baseStyle={inputBase} focusStyle={inputFocus} name="name" placeholder="Your name" required />
                <FocusInput
                  baseStyle={inputBase}
                  focusStyle={inputFocus}
                  name="email"
                  type="email"
                  placeholder="Email"
                  required
                />
                <FocusInput
                  baseStyle={inputBase}
                  focusStyle={inputFocus}
                  name="phone"
                  placeholder="Phone (optional)"
                />
                <FocusTextarea
                  baseStyle={{ ...inputBase, resize: 'vertical' }}
                  focusStyle={inputFocus}
                  name="message"
                  rows={5}
                  placeholder="How can we help?"
                  required
                />
                <HoverButton
                  baseStyle={status === 'sending' ? { ...submitBase, ...submitSending } : submitBase}
                  hoverStyle={status === 'sending' ? {} : submitHover}
                  type="submit"
                  disabled={status === 'sending'}
                >
                  {status === 'sending' ? 'Sending…' : 'Send message'}
                </HoverButton>
              </form>
            </>
          ) : (
            <>
              <div
                style={{
                  fontFamily: "'Libre Franklin',system-ui,sans-serif",
                  fontSize: 20,
                  fontWeight: 600,
                  marginBottom: 6,
                }}
              >
                Thank you.
              </div>
              <p style={{ margin: '0 0 18px', fontSize: 14, color: 'var(--muted)' }}>
                Your message has been sent — we will get back to you soon.
              </p>
              <HoverButton baseStyle={resetBase} hoverStyle={resetHover} onClick={() => setStatus('idle')}>
                Send another
              </HoverButton>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
