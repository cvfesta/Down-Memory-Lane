import { useEffect } from 'react'
import { Routes, Route, Navigate, useParams, useNavigate, useLocation } from 'react-router-dom'
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { Browse } from './views/Browse'
import { ItemDetail } from './views/ItemDetail'
import { Contact } from './views/Contact'
import { About } from './views/About'
import { getItem } from './data/catalog'

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
  const item = id ? getItem(id) : null
  if (!item) return <Navigate to="/" replace />
  return <ItemDetail key={item.id} item={item} onBack={() => navigate('/')} />
}

export default function App() {
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
      <ScrollToTop />
      <Header />

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '0 var(--pad-x) 80px' }}>
        <Routes>
          <Route path="/" element={<Browse />} />
          <Route path="/item/:id" element={<ItemPage />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />
    </div>
  )
}
