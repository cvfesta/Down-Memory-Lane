import { useState } from 'react'
import { Button, Card } from '@heroui/react'
import { InquiryForm } from '../components/InquiryForm'
import { PlaceholderSwatch } from '../components/PlaceholderSwatch'
import type { Item } from '../data/items'
import { productImageUrl } from '../data/items'

interface ItemDetailProps {
  item: Item
  onBack: () => void
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <>
      <div className="self-center border-b border-neutral-200 py-3 text-[10px] uppercase tracking-wider text-neutral-600 dark:text-neutral-400 dark:border-neutral-800">
        {label}
      </div>
      <div className="border-b border-neutral-200 py-3 text-sm dark:border-neutral-800">{value}</div>
    </>
  )
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
    <section className="pt-8">
      <Button variant="ghost" size="sm" className="mb-6" onPress={onBack}>
        ← Back to the collection
      </Button>

      <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-14">
        <div>
          {images.length > 0 ? (
            <>
              <img
                src={productImageUrl(images[Math.min(activePhoto, images.length - 1)])}
                alt={item.title}
                className="aspect-square w-full rounded-2xl border border-neutral-200 bg-[var(--image-bg)] object-contain p-4 dark:border-neutral-800"
              />
              {images.length > 1 && (
                <div className="mt-2.5 grid grid-cols-4 gap-2.5">
                  {images.map((src, i) => (
                    <button
                      key={src}
                      type="button"
                      onClick={() => setActivePhoto(i)}
                      aria-label={`View photo ${i + 1}`}
                      className={`overflow-hidden rounded-lg bg-[var(--image-bg)] ${i === activePhoto ? 'ring-2 ring-neutral-900 dark:ring-neutral-100' : 'border border-neutral-200 dark:border-neutral-800'}`}
                    >
                      <img src={productImageUrl(src)} alt="" className="aspect-square w-full object-contain" />
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <PlaceholderSwatch aspectRatio="1 / 1" label={item.label} fontSize={12} />
          )}
        </div>

        <div>
          <div className="mb-3.5 flex items-center gap-2.5">
            {available ? (
              <span className="inline-flex items-center rounded-full border border-green-700/30 bg-green-600/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-green-800 dark:border-green-400/30 dark:bg-green-400/10 dark:text-green-300">
                Available
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full border border-red-700/30 bg-red-600/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-red-800 dark:border-red-400/30 dark:bg-red-400/10 dark:text-red-300">
                Sold
              </span>
            )}
          </div>
          <div className="mb-1.5 text-[10px] uppercase tracking-wider text-neutral-600 dark:text-neutral-400">{catLine}</div>
          <h1 className="font-serif text-3xl font-semibold leading-tight sm:text-4xl">{item.title}</h1>
          <div className="my-4 text-2xl font-medium">{item.price}</div>

          <div className="grid grid-cols-[120px_1fr] border-t border-neutral-200 sm:grid-cols-[130px_1fr] dark:border-neutral-800">
            <Spec label="Dimensions" value={item.dim} />
            <Spec label="Era & Origin" value={item.era} />
            <Spec label="Condition" value={conditionText} />
          </div>

          <p className="mt-6 text-[15px] leading-relaxed text-neutral-600 dark:text-neutral-300">{item.desc}</p>

          <Card className="mt-9">
            <Card.Content className="p-6">
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
            </Card.Content>
          </Card>
        </div>
      </div>
    </section>
  )
}
