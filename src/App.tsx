import { Suspense, lazy, useEffect } from 'react'
import type { ReactNode } from 'react'
import { Routes, Route, Navigate, useParams, useNavigate, useLocation } from 'react-router-dom'
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { Browse } from './views/Browse'
import { ItemDetail } from './views/ItemDetail'
import { Contact } from './views/Contact'
import { About } from './views/About'
import { CatalogProvider, useCatalog } from './data/CatalogContext'

// The admin bundle (and GitHub API code) only loads when /admin is visited.
const Admin = lazy(() => import('./admin/Admin'))

function Centered({ children }: { children: ReactNode }) {
  return (
    <div style={{ padding: '80px 0', textAlign: 'center', color: 'var(--muted)' }}>{children}</div>
  )
}

/** Scroll to the top whenever the route changes (e.g. opening a product). */
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

/** Resolve /item/:id to a product, remounting per id so view state resets. */
function ItemPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { items, loading } = useCatalog()
  if (loading) return <Centered>Loading…</Centered>
  const item = items.find((i) => i.id === id) ?? null
  if (!item) return <Navigate to="/" replace />
  return <ItemDetail key={item.id} item={item} onBack={() => navigate('/')} />
}

export default function App() {
  return (
    <CatalogProvider>
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
        <ScrollToTop />
        <Header />

        <main style={{ maxWidth: 1200, margin: '0 auto', padding: '0 var(--pad-x) 80px' }}>
          <Routes>
            <Route path="/" element={<Browse />} />
            <Route path="/item/:id" element={<ItemPage />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/about" element={<About />} />
            <Route
              path="/admin"
              element={
                <Suspense fallback={<Centered>Loading admin…</Centered>}>
                  <Admin />
                </Suspense>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </CatalogProvider>
  )
}
