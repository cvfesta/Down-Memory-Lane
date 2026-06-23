export interface AboutSection {
  title: string
  body: string
}

export interface AboutContent {
  subhead: string
  /** Free text. Leave a blank line between paragraphs. */
  body: string
  /** Titled blocks shown below the body — add/remove freely. */
  sections: AboutSection[]
}

/** Path committed by the admin (and copied to dist by the build). */
export const ABOUT_PATH = 'public/about.json'

export const DEFAULT_ABOUT: AboutContent = {
  subhead: 'A note from the people behind the collection.',
  body:
    'Down Memory Lane began the way most good collections do — with a love of objects that carry a story. Over the years that habit grew into a small business, seeking out clocks, paintings, books and curiosities with real character and a little history to them.\n\nWe offer pieces online and in person at antique fairs and markets around the area. Most are found at estate sales, auctions and the occasional lucky discovery, then cleaned, gently repaired where needed, and described honestly — patina, wear and all.',
  sections: [
    {
      title: 'What we look for',
      body: 'Quality, character and a bit of a story. We favour things that have aged well and were made to last.',
    },
    {
      title: 'How buying works',
      body: 'Send an inquiry on anything that catches your eye. We confirm availability, then arrange payment and local pickup or delivery.',
    },
  ],
}

/**
 * Coerce whatever is in about.json into the current shape. Accepts both the
 * current shape and the older {paragraph1, paragraph2, lookFor, buying} one so
 * a previously-saved file keeps working.
 */
export function normalizeAbout(raw: unknown): AboutContent {
  if (!raw || typeof raw !== 'object') return DEFAULT_ABOUT
  const r = raw as Record<string, unknown>
  const str = (v: unknown, fallback = '') => (typeof v === 'string' ? v : fallback)

  // Current shape
  if (typeof r.body === 'string' || Array.isArray(r.sections)) {
    const sections = Array.isArray(r.sections)
      ? r.sections
          .map((s) => {
            const o = (s ?? {}) as Record<string, unknown>
            return { title: str(o.title), body: str(o.body) }
          })
          .filter((s) => s.title || s.body)
      : DEFAULT_ABOUT.sections
    return {
      subhead: str(r.subhead, DEFAULT_ABOUT.subhead),
      body: str(r.body, DEFAULT_ABOUT.body),
      sections,
    }
  }

  // Legacy shape
  const body = [str(r.paragraph1), str(r.paragraph2)].filter(Boolean).join('\n\n')
  const sections: AboutSection[] = []
  if (str(r.lookFor)) sections.push({ title: 'What we look for', body: str(r.lookFor) })
  if (str(r.buying)) sections.push({ title: 'How buying works', body: str(r.buying) })
  return {
    subhead: str(r.subhead, DEFAULT_ABOUT.subhead),
    body: body || DEFAULT_ABOUT.body,
    sections: sections.length ? sections : DEFAULT_ABOUT.sections,
  }
}

/** Split the free-text body into paragraphs on blank lines. */
export function toParagraphs(body: string): string[] {
  return body
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
}
