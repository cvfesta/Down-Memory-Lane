import { useState } from 'react'
import type { FormEvent } from 'react'
import { HoverButton, FocusInput, FocusTextarea } from './ui'
import { readForm, sendContactForm } from '../lib/contact'
import {
  serif,
  fieldBase,
  fieldFocus,
  primaryBtn,
  primaryBtnHover,
  primaryBtnSending,
  outlineBtn,
  outlineBtnHover,
  errorBanner,
} from '../lib/styles'

type Status = 'idle' | 'sending' | 'sent' | 'error'

interface InquiryFormProps {
  /** Email subject for this submission. */
  subject: string
  heading: string
  intro: string
  submitLabel?: string
  messagePlaceholder?: string
  messageRows?: number
  successTitle: string
  successText: string
}

/**
 * The shared message form behind both the Contact page and each product's
 * inquiry box — name/phone/email/message, honeypot, sending/sent/error states,
 * delivered via Web3Forms.
 */
export function InquiryForm({
  subject,
  heading,
  intro,
  submitLabel = 'Send message',
  messagePlaceholder = 'How can we help?',
  messageRows = 4,
  successTitle,
  successText,
}: InquiryFormProps) {
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState('')

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fields = readForm(e.currentTarget)
    setError('')
    setStatus('sending')
    try {
      await sendContactForm(subject, fields)
      setStatus('sent')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setStatus('error')
    }
  }

  if (status === 'sent') {
    return (
      <>
        <div style={{ fontFamily: serif, fontSize: 24, fontWeight: 600, marginBottom: 6 }}>{successTitle}</div>
        <p style={{ margin: '0 0 18px', fontSize: 14, color: 'var(--muted)' }}>{successText}</p>
        <HoverButton baseStyle={outlineBtn} hoverStyle={outlineBtnHover} onClick={() => setStatus('idle')}>
          Send another
        </HoverButton>
      </>
    )
  }

  return (
    <>
      <h3 style={{ margin: '0 0 4px', fontFamily: "'Libre Franklin',system-ui,sans-serif", fontSize: 20, fontWeight: 600 }}>
        {heading}
      </h3>
      <p style={{ margin: '0 0 18px', fontSize: 13, color: 'var(--muted-2)' }}>{intro}</p>
      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <input type="checkbox" name="botcheck" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ display: 'none' }} />
        {status === 'error' && <div style={errorBanner}>{error}</div>}
        <div style={{ display: 'grid', gridTemplateColumns: 'var(--cols-2)', gap: 12 }}>
          <FocusInput baseStyle={fieldBase} focusStyle={fieldFocus} name="name" placeholder="Your name" required />
          <FocusInput baseStyle={fieldBase} focusStyle={fieldFocus} name="phone" placeholder="Phone (optional)" />
        </div>
        <FocusInput baseStyle={fieldBase} focusStyle={fieldFocus} name="email" type="email" placeholder="Email" required />
        <FocusTextarea
          baseStyle={{ ...fieldBase, resize: 'vertical' }}
          focusStyle={fieldFocus}
          name="message"
          rows={messageRows}
          placeholder={messagePlaceholder}
          required
        />
        <HoverButton
          baseStyle={status === 'sending' ? { ...primaryBtn, ...primaryBtnSending } : primaryBtn}
          hoverStyle={status === 'sending' ? {} : primaryBtnHover}
          type="submit"
          disabled={status === 'sending'}
        >
          {status === 'sending' ? 'Sending…' : submitLabel}
        </HoverButton>
      </form>
    </>
  )
}
