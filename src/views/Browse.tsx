import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Chip, Button, Skeleton, Disclosure } from '@heroui/react'
import { PlaceholderSwatch } from '../components/PlaceholderSwatch'
import { useCatalog } from '../data/CatalogContext'
import { productImageUrl } from '../data/items'

const GRID = 'grid gap-5 [grid-template-columns:repeat(auto-fill,minmax(150px,1fr))] sm:[grid-template-columns:repeat(auto-fill,minmax(212px,1fr))]'
const catBtn = 'flex w-full items-center justify-between rounded-md px-2.5 py-2 text-sm transition-colors hover:bg-default-100'

export function Browse() {
  const navigate = useNavigate()
  const { items, categories, loading, error } = useCatalog()

  const [activeCat, setActiveCat] = useState<string | null>(null)
  const [activeSub, setActiveSub] = useState<string | null>(null)
  const [catsOpen, setCatsOpen] = useState(false)

  if (loading) {
    return (
      <div className={`${GRID} pt-10`}>
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="aspect-[4/5] rounded-2xl" />
        ))}
      </div>
    )
  }
  if (error) {
    return <div className="py-24 text-center text-danger">{error}</div>
  }

  let filtered = items
  if (activeCat) {
    filtered = filtered.filter((i) => i.category === activeCat)
    if (activeSub) filtered = filtered.filter((i) => i.sub === activeSub)
  }
  const heading = activeSub ?? activeCat ?? 'All Pieces'
  const countLabel = `${filtered.length} ${filtered.length === 1 ? 'piece' : 'pieces'}`

  const categoryList = (
    <div className="mt-2 flex flex-col">
      <button
        className={catBtn}
        onClick={() => {
          setActiveCat(null)
          setActiveSub(null)
          setCatsOpen(false)
        }}
      >
        <span>All Pieces</span>
        <span className="text-xs text-neutral-600 dark:text-neutral-400">{items.length}</span>
      </button>

      {categories.map((cat) => {
        const isActive = activeCat === cat.name
        const showSubs = isActive && cat.subs.length > 0
        return (
          <div key={cat.name}>
            <button
              className={catBtn}
              onClick={() => {
                setActiveCat(cat.name)
                setActiveSub(null)
                if (cat.subs.length === 0) setCatsOpen(false)
              }}
            >
              <span className={isActive ? 'font-medium' : ''}>{cat.name}</span>
              <span className="text-xs text-neutral-600 dark:text-neutral-400">{cat.count}</span>
            </button>

            {showSubs && (
              <div className="my-1 ml-3.5 flex flex-col border-l border-default-200">
                {cat.subs.map((sub) => (
                  <button
                    key={sub.name}
                    className="flex w-full items-center justify-between px-2.5 py-1.5 text-[13px] text-neutral-600 dark:text-neutral-400 transition-colors hover:text-foreground"
                    onClick={() => {
                      setActiveCat(cat.name)
                      setActiveSub(sub.name)
                      setCatsOpen(false)
                    }}
                  >
                    <span className={isActive && activeSub === sub.name ? 'font-medium' : ''}>{sub.name}</span>
                    <span className="text-xs text-neutral-600 dark:text-neutral-400">{sub.count}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )

  return (
    <section>
      <div className="border-b border-default-200 py-10">
        <h1 className="max-w-[640px] font-serif text-3xl font-semibold sm:text-4xl">
          A rotating selection of clocks, paintings &amp; curiosities.
        </h1>
        <p className="mt-4 max-w-[540px] text-neutral-600 dark:text-neutral-400">
          Found, restored and offered for sale. Browse by category below — see something you like? Send an inquiry and we
          will get back to you.
        </p>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[212px_1fr] lg:gap-12">
        <aside className="h-max lg:sticky lg:top-24">
          {/* Mobile: collapsible filter */}
          <div className="lg:hidden">
            <Disclosure isExpanded={catsOpen} onExpandedChange={setCatsOpen}>
              <Disclosure.Heading>
                <Button slot="trigger" variant="outline" className="w-full justify-between">
                  Categories · {heading}
                  <Disclosure.Indicator />
                </Button>
              </Disclosure.Heading>
              <Disclosure.Content>
                <Disclosure.Body>{categoryList}</Disclosure.Body>
              </Disclosure.Content>
            </Disclosure>
          </div>

          {/* Desktop: always shown */}
          <div className="hidden lg:block">
            <div className="border-b border-default-200 px-2.5 pb-2.5 text-[10px] uppercase tracking-widest text-neutral-600 dark:text-neutral-400">
              Categories
            </div>
            {categoryList}
          </div>
        </aside>

        <div>
          <div className="mb-6 flex items-baseline justify-between">
            <h2 className="font-serif text-2xl font-semibold sm:text-3xl">{heading}</h2>
            <span className="text-xs uppercase tracking-wider text-neutral-600 dark:text-neutral-400">{countLabel}</span>
          </div>
          <div className={GRID}>
            {filtered.map((it) => (
              <button key={it.id} onClick={() => navigate(`/item/${it.id}`)} className="block text-left">
                <div className="relative">
                  {it.images && it.images.length > 0 ? (
                    <img
                      src={productImageUrl(it.images[0])}
                      alt={it.title}
                      className="aspect-[4/5] w-full rounded-t-2xl bg-[var(--image-bg)] object-contain"
                    />
                  ) : (
                    <div className="overflow-hidden rounded-t-2xl">
                      <PlaceholderSwatch aspectRatio="4 / 5" label={it.label} border={false} />
                    </div>
                  )}
                  {it.status === 'sold' && (
                    <Chip variant="primary" className="absolute left-3 top-3">
                      Sold
                    </Chip>
                  )}
                </div>
                <Card className="rounded-t-none rounded-b-2xl">
                  <Card.Content className="flex flex-col gap-2">
                    <div className="text-base font-medium leading-tight">{it.title}</div>
                    <div className="flex flex-wrap gap-1.5">
                      <Chip variant="soft" size="sm" className="min-w-0 max-w-full">
                        <span className="block truncate">{it.sub ?? it.category}</span>
                      </Chip>
                      {it.era && (
                        <Chip variant="soft" size="sm" className="min-w-0 max-w-full">
                          <span className="block truncate">{it.era}</span>
                        </Chip>
                      )}
                    </div>
                    <div className="text-sm font-medium">{it.price}</div>
                  </Card.Content>
                </Card>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
