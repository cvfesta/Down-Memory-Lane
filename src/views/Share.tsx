import { useState } from 'react'
import QRCode from 'react-qr-code'
import { Button } from '@heroui/react'

// The live site address. If you move to a custom domain, update this (and the
// OG urls in index.html).
const url = 'https://cvfesta.github.io/Down-Memory-Lane/'

export function Share() {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* clipboard may be unavailable; the URL is shown below regardless */
    }
  }

  return (
    <section className="flex flex-col items-center pt-12 text-center">
      <h1 className="font-serif text-3xl font-semibold sm:text-4xl">Scan to visit the shop</h1>
      <p className="mt-3 max-w-[460px] text-neutral-600 dark:text-neutral-400">
        Point a phone camera at the code to open Down Memory Lane — handy for fairs, markets, or sharing in person.
      </p>

      <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
        <QRCode value={url} size={240} bgColor="#ffffff" fgColor="#2a251e" />
      </div>

      <p className="mt-6 break-all text-sm text-neutral-600 dark:text-neutral-400">{url}</p>
      <Button variant="outline" className="mt-3" onPress={copy}>
        {copied ? 'Copied!' : 'Copy link'}
      </Button>
    </section>
  )
}
