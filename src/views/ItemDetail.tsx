import { useState } from 'react'
import type { CSSProperties } from 'react'
import { HoverButton } from '../components/ui'
import { InquiryForm } from '../components/InquiryForm'
import { PlaceholderSwatch } from '../components/PlaceholderSwatch'
import type { Item } from '../data/items'
import { productImageUrl } from '../data/items'
import { serif } from '../lib/styles'

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
  const [activePhoto, setActivePhoto] = useState(0)

  const images = item.images ?? []
  const catLine = [item.category, item.sub].filter(Boolean).join(' · ')
  const available = item.status !== 'sold'
  const conditionText =
    item.grade === 'Unspecified'
      ? item.condNotes || '—'
      : [item.grade, item.condNotes].filter(Boolean).join(' · ')

  return (
    <section style={{ paddingTop: 32 }}>
      <HoverButton baseStyle={backBtnBase} hoverStyle={backBtnHover} onClick={onBack}>
        ←&nbsp;&nbsp;Back to the collection
      </HoverButton>

      <div style={{ display: 'grid', gridTemplateColumns: 'var(--cols-split)', gap: 'var(--gap-split)', alignItems: 'start' }}>
        <div>
          {images.length > 0 ? (
            <>
              <img src={productImageUrl(images[Math.min(activePhoto, images.length - 1)])} alt={item.title} style={mainImage} />
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
                        <img src={productImageUrl(src)} alt={`${item.title} — photo ${i + 1}`} style={thumbImg} />
                      </button>
                    )
                  })}
                </div>
              )}
            </>
          ) : (
            <PlaceholderSwatch aspectRatio="1 / 1" label={item.label} fontSize={12} />
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
          <h1 style={{ margin: 0, fontFamily: serif, fontSize: 'var(--h1)', fontWeight: 600, lineHeight: 1.08 }}>
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
              <div style={specValue}>{conditionText}</div>
            </div>
          </div>

          <p style={{ margin: '24px 0 0', color: 'var(--ink-soft)', fontSize: 15, lineHeight: 1.7 }}>{item.desc}</p>

          <div style={{ marginTop: 34, borderTop: '1px solid var(--line)', paddingTop: 28 }}>
            <InquiryForm
              subject={`Inquiry: ${item.title}`}
              heading="Interested in this piece?"
              intro="Send a note and we will get back to you about availability and viewing."
              submitLabel="Send inquiry"
              messagePlaceholder="Tell us what you'd like to know — measurements, condition, history, or arranging a viewing or delivery."
              messageRows={4}
              successTitle="Thank you — your message is on its way."
              successText={`We have received your inquiry about the ${item.title} and will be in touch shortly.`}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
