import { useState } from 'react'
import type { CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import { HoverButton } from '../components/ui'
import { VISIBLE_ITEMS, CATEGORIES } from '../data/catalog'

const catBtnBase: CSSProperties = {
  width: '100%',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  textAlign: 'left',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 8,
  padding: '9px 10px',
  borderRadius: 10,
  color: 'var(--ink)',
  fontSize: 13.5,
}
const catBtnHover: CSSProperties = { background: 'var(--hover-bg)' }

const subBtnBase: CSSProperties = {
  width: '100%',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  textAlign: 'left',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 8,
  padding: '6px 10px',
  color: 'var(--muted)',
  fontSize: 12.5,
}
const subBtnHover: CSSProperties = { color: 'var(--gold)' }

const cardBase: CSSProperties = {
  background: 'var(--surface)',
  border: '1px solid var(--line)',
  borderRadius: 10,
  overflow: 'hidden',
  cursor: 'pointer',
  textAlign: 'left',
  display: 'flex',
  flexDirection: 'column',
  padding: 0,
  transition: 'border-color .15s,box-shadow .15s,transform .15s',
}
const cardHover: CSSProperties = {
  borderColor: 'var(--card-hover-border)',
  boxShadow: '0 10px 26px -14px var(--card-shadow)',
  transform: 'translateY(-2px)',
}

// Mobile-only "Categories" filter bar (collapsed by default; CSS hides it on desktop).
const filterToggle: CSSProperties = {
  width: '100%',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 10,
  background: 'var(--surface)',
  border: '1px solid var(--line)',
  borderRadius: 10,
  padding: '12px 14px',
  marginBottom: 12,
  cursor: 'pointer',
  color: 'var(--ink)',
  fontSize: 13,
  fontFamily: 'inherit',
}

export function Browse() {
  const navigate = useNavigate()
  const items = VISIBLE_ITEMS
  const categories = CATEGORIES

  const [activeCat, setActiveCat] = useState<string | null>(null)
  const [activeSub, setActiveSub] = useState<string | null>(null)
  const [catsOpen, setCatsOpen] = useState(false)

  const onSelectAll = () => {
    setActiveCat(null)
    setActiveSub(null)
  }
  const onSelectCategory = (name: string) => {
    setActiveCat(name)
    setActiveSub(null)
  }
  const onSelectSub = (cat: string, sub: string) => {
    setActiveCat(cat)
    setActiveSub(sub)
  }
  const onOpenItem = (id: string) => navigate(`/item/${id}`)

  let filtered = items
  if (activeCat) {
    filtered = filtered.filter((i) => i.category === activeCat)
    if (activeSub) filtered = filtered.filter((i) => i.sub === activeSub)
  }

  const heading = activeSub ?? activeCat ?? 'All Pieces'
  const countLabel = `${filtered.length} ${filtered.length === 1 ? 'piece' : 'pieces'}`

  return (
    <section>
      <div style={{ padding: '44px 0 36px', borderBottom: '1px solid var(--line)', marginBottom: 40 }}>
        <div
          style={{
            fontFamily: "'Playfair Display',Georgia,serif",
            fontSize: 'var(--hero)',
            fontWeight: 600,
            lineHeight: 1.05,
            maxWidth: 620,
          }}
        >
          A rotating selection of clocks, paintings &amp; curiosities.
        </div>
        <p style={{ margin: '16px 0 0', maxWidth: 540, color: 'var(--muted)', fontSize: 15 }}>
          Found, restored and offered for sale. Browse by category below — see something you like? Send an inquiry and we
          will get back to you.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'var(--cols-browse)', gap: 'var(--gap-browse)', alignItems: 'start' }}>
        <aside className="dml-sidebar" data-open={catsOpen ? 'true' : 'false'}>
          <button
            type="button"
            className="dml-cat-toggle"
            aria-expanded={catsOpen}
            onClick={() => setCatsOpen((o) => !o)}
            style={filterToggle}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
              <span
                style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--gold)', flex: 'none' }}
              >
                Categories
              </span>
              <span
                style={{ color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
              >
                {heading}
              </span>
            </span>
            <span aria-hidden style={{ color: 'var(--muted)', flex: 'none' }}>
              {catsOpen ? '▲' : '▼'}
            </span>
          </button>

          <div className="dml-cat-list">
            <div
              className="dml-cat-heading"
              style={{
                fontSize: 10,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'var(--gold)',
                padding: '0 10px 10px',
                borderBottom: '1px solid var(--line)',
              }}
            >
              Categories
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', marginTop: 8 }}>
              <HoverButton
                baseStyle={catBtnBase}
                hoverStyle={catBtnHover}
                onClick={() => {
                  onSelectAll()
                  setCatsOpen(false)
                }}
              >
                <span>All Pieces</span>
                <span style={{ color: 'var(--muted-3)', fontSize: 11 }}>{items.length}</span>
              </HoverButton>

              {categories.map((cat) => {
                const isActive = activeCat === cat.name
                const showSubs = isActive && cat.subs.length > 0
                return (
                  <div key={cat.name}>
                    <HoverButton
                      baseStyle={catBtnBase}
                      hoverStyle={catBtnHover}
                      onClick={() => {
                        onSelectCategory(cat.name)
                        // Leaf categories apply and collapse; ones with sub-filters stay open.
                        if (cat.subs.length === 0) setCatsOpen(false)
                      }}
                    >
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {isActive && (
                        <span
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            background: 'var(--gold)',
                            display: 'block',
                            flex: 'none',
                          }}
                        />
                      )}
                      {cat.name}
                    </span>
                    <span style={{ color: 'var(--muted-3)', fontSize: 11 }}>{cat.count}</span>
                  </HoverButton>

                  {showSubs && (
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        margin: '2px 0 6px',
                        borderLeft: '1px solid var(--line)',
                        marginLeft: 14,
                      }}
                    >
                      {cat.subs.map((sub) => {
                        const subActive = isActive && activeSub === sub.name
                        return (
                          <HoverButton
                            key={sub.name}
                            baseStyle={subBtnBase}
                            hoverStyle={subBtnHover}
                            onClick={() => {
                              onSelectSub(cat.name, sub.name)
                              setCatsOpen(false)
                            }}
                          >
                            <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                              {subActive && (
                                <span
                                  style={{
                                    width: 5,
                                    height: 5,
                                    borderRadius: '50%',
                                    background: 'var(--gold)',
                                    display: 'block',
                                    flex: 'none',
                                  }}
                                />
                              )}
                              {sub.name}
                            </span>
                            <span style={{ color: 'var(--muted-4)', fontSize: 11 }}>{sub.count}</span>
                          </HoverButton>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
            <p style={{ margin: '18px 10px 0', fontSize: 12, color: 'var(--muted-5)', lineHeight: 1.5 }}>
              New finds are added to the shelves often — check back.
            </p>
          </div>
        </aside>

        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 24 }}>
            <h2 style={{ margin: 0, fontFamily: "'Playfair Display',Georgia,serif", fontSize: 'var(--section)', fontWeight: 600 }}>
              {heading}
            </h2>
            <span
              style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted-3)' }}
            >
              {countLabel}
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(var(--card-min),1fr))', gap: 26 }}>
            {filtered.map((it) => {
              const metaLine = [it.sub ?? it.category, it.era].filter(Boolean).join(' · ')
              return (
                <HoverButton
                  key={it.id}
                  baseStyle={cardBase}
                  hoverStyle={cardHover}
                  onClick={() => onOpenItem(it.id)}
                >
                  <div style={{ position: 'relative' }}>
                    {it.images && it.images.length > 0 ? (
                      <img
                        src={it.images[0]}
                        alt={it.title}
                        style={{
                          display: 'block',
                          width: '100%',
                          aspectRatio: '4 / 5',
                          objectFit: 'contain',
                          background: 'var(--image-bg)',
                          padding: 10,
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          aspectRatio: '4 / 5',
                          background:
                            'repeating-linear-gradient(135deg,var(--stripe-a) 0,var(--stripe-a) 8px,var(--stripe-b) 8px,var(--stripe-b) 16px)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <span
                          style={{
                            fontFamily: 'ui-monospace,Menlo,monospace',
                            fontSize: 10,
                            letterSpacing: '0.12em',
                            textTransform: 'uppercase',
                            color: 'var(--muted-3)',
                          }}
                        >
                          {it.label}
                        </span>
                      </div>
                    )}
                    {it.status === 'sold' && (
                      <div
                        style={{
                          position: 'absolute',
                          top: 12,
                          left: 12,
                          background: 'var(--sold-bg)',
                          color: '#fff',
                          fontSize: 9.5,
                          fontWeight: 600,
                          letterSpacing: '0.16em',
                          textTransform: 'uppercase',
                          padding: '4px 9px',
                        }}
                      >
                        Sold
                      </div>
                    )}
                  </div>
                  <div
                    style={{ padding: '14px 15px 16px', display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}
                  >
                    <div
                      style={{
                        fontSize: 9.5,
                        letterSpacing: '0.14em',
                        textTransform: 'uppercase',
                        color: 'var(--gold)',
                      }}
                    >
                      {metaLine}
                    </div>
                    <div
                      style={{
                        fontFamily: "'Libre Franklin',system-ui,sans-serif",
                        fontSize: 17,
                        fontWeight: 600,
                        lineHeight: 1.25,
                      }}
                    >
                      {it.title}
                    </div>
                    <div style={{ marginTop: 'auto', paddingTop: 6, fontSize: 14, fontWeight: 500, color: 'var(--ink)' }}>
                      {it.price}
                    </div>
                  </div>
                </HoverButton>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
