export interface ContactFields {
  name: string
  email: string
  phone: string
  message: string
  /** Honeypot — a hidden field real users never fill; bots that do are dropped. */
  botcheck: boolean
}

/** Read the standard name/email/phone/message fields off a submitted form. */
export function readForm(form: HTMLFormElement): ContactFields {
  const get = (name: string): string => {
    const el = form.elements.namedItem(name)
    return el && 'value' in el ? String((el as { value: unknown }).value) : ''
  }
  const honeypot = form.elements.namedItem('botcheck')
  return {
    name: get('name'),
    email: get('email'),
    phone: get('phone'),
    message: get('message'),
    botcheck: honeypot instanceof HTMLInputElement ? honeypot.checked : false,
  }
}

/**
 * Web3Forms access key. It is a *public* client-side key by design — it can
 * only route a submission to the inbox it is registered to, so exposing it in
 * the bundle is expected. Get a free key at https://web3forms.com and put it
 * in `.env` as VITE_WEB3FORMS_KEY.
 */
const ACCESS_KEY = import.meta.env.VITE_WEB3FORMS_KEY as string | undefined

/** True until a real key has been dropped into `.env`. */
export const isContactConfigured =
  !!ACCESS_KEY && !ACCESS_KEY.startsWith('YOUR_') && ACCESS_KEY.length > 10

/**
 * Send a form submission to the shop owner via Web3Forms. Resolves on success
 * and throws an Error (with a human-readable message) on any failure, so the
 * caller can show a retry prompt.
 */
export async function sendContactForm(subject: string, fields: ContactFields): Promise<void> {
  if (!isContactConfigured) {
    throw new Error(
      'The contact form is not set up yet — add your Web3Forms access key to .env (VITE_WEB3FORMS_KEY).',
    )
  }

  let res: Response
  try {
    res = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        access_key: ACCESS_KEY,
        subject,
        from_name: 'Down Memory Lane',
        name: fields.name,
        email: fields.email,
        phone: fields.phone,
        message: fields.message,
        botcheck: fields.botcheck,
      }),
    })
  } catch {
    throw new Error('Could not reach the server. Please check your connection and try again.')
  }

  const data = (await res.json().catch(() => null)) as { success?: boolean; message?: string } | null
  if (!res.ok || !data?.success) {
    throw new Error(data?.message || 'Something went wrong sending your message. Please try again.')
  }
}
