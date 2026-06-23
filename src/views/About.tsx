import { useEffect, useState } from 'react'
import { Button } from '@heroui/react'
import { useNavigate } from 'react-router-dom'
import { DEFAULT_ABOUT, normalizeAbout, toParagraphs } from '../data/about'
import type { AboutContent } from '../data/about'

export function About() {
  const navigate = useNavigate()
  const [c, setC] = useState<AboutContent>(DEFAULT_ABOUT)

  useEffect(() => {
    let cancelled = false
    fetch(`${import.meta.env.BASE_URL}about.json`, { cache: 'no-cache' })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled && data) setC(normalizeAbout(data))
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  const paragraphs = toParagraphs(c.body)

  return (
    <section className="pt-11">
      <h1 className="font-serif text-3xl font-semibold sm:text-4xl">About Down Memory Lane</h1>
      <p className="mb-11 mt-3.5 max-w-[560px] text-neutral-600 dark:text-neutral-400">{c.subhead}</p>

      <div className="grid items-start gap-10 lg:grid-cols-[330px_1fr] lg:gap-14">
        <img
          src={`${import.meta.env.BASE_URL}about.jpg`}
          alt="Down Memory Lane — the shop"
          className="aspect-[4/5] w-full rounded-lg border border-neutral-200 object-cover dark:border-neutral-800"
        />

        <div className="max-w-[580px]">
          {paragraphs.map((p, i) => (
            <p
              key={i}
              className={`text-base leading-relaxed text-neutral-700 dark:text-neutral-300 ${i > 0 ? 'mt-4' : ''}`}
            >
              {p}
            </p>
          ))}

          {c.sections.length > 0 && (
            <div className="mt-9 grid gap-8 border-t border-neutral-200 pt-7 sm:grid-cols-2 dark:border-neutral-800">
              {c.sections.map((s, i) => (
                <div key={i}>
                  <div className="mb-2 text-[10px] uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                    {s.title}
                  </div>
                  {toParagraphs(s.body).map((p, j) => (
                    <p
                      key={j}
                      className={`text-sm leading-relaxed text-neutral-600 dark:text-neutral-300 ${j > 0 ? 'mt-3' : ''}`}
                    >
                      {p}
                    </p>
                  ))}
                </div>
              ))}
            </div>
          )}

          <Button variant="primary" className="mt-9" onPress={() => navigate('/contact')}>
            Get in touch
          </Button>
        </div>
      </div>
    </section>
  )
}
