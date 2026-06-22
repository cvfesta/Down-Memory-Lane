import { useMemo, useState } from 'react'
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { Browse } from './views/Browse'
import { ItemDetail } from './views/ItemDetail'
import { Contact } from './views/Contact'
import { About } from './views/About'
import { ITEMS } from './data/items'
import { deriveCategories } from './lib/categories'
import type { View } from './types'

/** Store configuration — equivalent to the original editor props. */
const CONFIG = {
  contactEmail: 'hello@example.com',
  hideSold: false,
  telLink: 'tel:+15550142890',
  telDisplay: '(555) 014–2890',
}

export default function App() {
  const [view, setView] = useState<View>('browse')
  const [activeCat, setActiveCat] = useState<string | null>(null)
  const [activeSub, setActiveSub] = useState<string | null>(null)
  const [itemId, setItemId] = useState<string | null>(null)

  const items = useMemo(() => (CONFIG.hideSold ? ITEMS.filter((i) => i.status !== 'sold') : ITEMS), [])
  const categories = useMemo(() => deriveCategories(items), [items])
  const currentItem = useMemo(() => items.find((i) => i.id === itemId) ?? null, [items, itemId])

  const openItem = (id: string) => {
    setItemId(id)
    setView('item')
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        color: 'var(--ink)',
        fontFamily: "'Libre Franklin',system-ui,sans-serif",
        fontSize: 16,
        lineHeight: 1.65,
      }}
    >
      <Header onNavigate={setView} />

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '0 var(--pad-x) 80px' }}>
        {view === 'browse' && (
          <Browse
            items={items}
            categories={categories}
            activeCat={activeCat}
            activeSub={activeSub}
            onSelectAll={() => {
              setActiveCat(null)
              setActiveSub(null)
            }}
            onSelectCategory={(name) => {
              setActiveCat(name)
              setActiveSub(null)
            }}
            onSelectSub={(cat, sub) => {
              setActiveCat(cat)
              setActiveSub(sub)
            }}
            onOpenItem={openItem}
          />
        )}

        {view === 'item' && currentItem && (
          <ItemDetail key={currentItem.id} item={currentItem} onBack={() => setView('browse')} />
        )}

        {view === 'contact' && <Contact />}

        {view === 'about' && <About onContact={() => setView('contact')} />}
      </main>

      <Footer />
    </div>
  )
}
