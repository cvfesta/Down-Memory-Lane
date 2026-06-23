import { useState } from 'react'
import type { FormEvent } from 'react'
import { TextField, Label, Input, TextArea, Button } from '@heroui/react'
import { sendContactForm } from '../lib/contact'

type Status = 'idle' | 'sending' | 'sent' | 'error'

interface InquiryFormProps {
  subject: string
  heading: string
  intro: string
  submitLabel?: string
  messagePlaceholder?: string
  messageRows?: number
  successTitle: string
  successText: string
}

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
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const honeypot = e.currentTarget.elements.namedItem('botcheck')
    const botcheck = honeypot instanceof HTMLInputElement ? honeypot.checked : false
    setError('')
    setStatus('sending')
    try {
      await sendContactForm(subject, { name, email, phone, message, botcheck })
      setStatus('sent')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setStatus('error')
    }
  }

  if (status === 'sent') {
    return (
      <div>
        <h3 className="mb-2 text-2xl font-semibold">{successTitle}</h3>
        <p className="mb-4 text-neutral-600 dark:text-neutral-400">{successText}</p>
        <Button
          variant="outline"
          onPress={() => {
            setStatus('idle')
            setName('')
            setEmail('')
            setPhone('')
            setMessage('')
          }}
        >
          Send another
        </Button>
      </div>
    )
  }

  return (
    <div>
      <h3 className="mb-1 text-xl font-semibold">{heading}</h3>
      <p className="mb-4 text-sm text-neutral-600 dark:text-neutral-400">{intro}</p>
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <input type="checkbox" name="botcheck" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
        {status === 'error' && <p className="text-sm text-danger">{error}</p>}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <TextField isRequired value={name} onChange={setName}>
            <Label>Your name</Label>
            <Input placeholder="Your name" />
          </TextField>
          <TextField value={phone} onChange={setPhone}>
            <Label>Phone (optional)</Label>
            <Input placeholder="Phone" />
          </TextField>
        </div>
        <TextField isRequired type="email" value={email} onChange={setEmail}>
          <Label>Email</Label>
          <Input placeholder="Email" />
        </TextField>
        <TextField isRequired value={message} onChange={setMessage}>
          <Label>Message</Label>
          <TextArea rows={messageRows} placeholder={messagePlaceholder} />
        </TextField>
        <Button type="submit" variant="primary" isPending={status === 'sending'} className="self-start">
          {({ isPending }) => (isPending ? 'Sending…' : submitLabel)}
        </Button>
      </form>
    </div>
  )
}
