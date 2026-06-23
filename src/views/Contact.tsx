import type { CSSProperties } from 'react'
import { InquiryForm } from '../components/InquiryForm'
import { serif } from '../lib/styles'

const label: CSSProperties = {
  fontSize: 10,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: 'var(--gold)',
  marginBottom: 8,
}

export function Contact() {
  return (
    <section style={{ paddingTop: 44 }}>
      <div style={{ fontFamily: serif, fontSize: 'var(--hero)', fontWeight: 600, lineHeight: 1.05 }}>Get in touch</div>
      <p style={{ margin: '14px 0 40px', maxWidth: 520, color: 'var(--muted)' }}>
        Everything in the collection is offered online and direct. Send a message about any piece and we will get right
        back to you.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'var(--cols-split)', gap: 'var(--gap-split)', alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
          {/*
            "Reach us" email/phone block — hidden for now (placeholder details).
            To restore: add the contact details back here.
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
          <InquiryForm
            subject="Message via Down Memory Lane"
            heading="Send a message"
            intro="Questions, a piece you are hunting for, or to arrange a visit."
            submitLabel="Send message"
            messagePlaceholder="How can we help?"
            messageRows={5}
            successTitle="Thank you."
            successText="Your message has been sent — we will get back to you soon."
          />
        </div>
      </div>
    </section>
  )
}
