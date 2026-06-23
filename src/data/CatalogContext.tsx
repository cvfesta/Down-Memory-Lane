import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { Item } from './items'
import { deriveCategories } from '../lib/categories'
import type { Category } from '../lib/categories'

interface CatalogState {
  items: Item[]
  categories: Category[]
  loading: boolean
  error: string | null
}

const CatalogContext = createContext<CatalogState>({
  items: [],
  categories: [],
  loading: true,
  error: null,
})

/** Loads the product catalog from public/products.json once, app-wide. */
export function CatalogProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    // Cache-bust so edits show up promptly after a redeploy.
    fetch(`${import.meta.env.BASE_URL}products.json`, { cache: 'no-cache' })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then((data: Item[]) => {
        if (cancelled) return
        setItems(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => {
        if (cancelled) return
        setError('Could not load the collection. Please refresh.')
        setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const categories = useMemo(() => deriveCategories(items), [items])

  return (
    <CatalogContext.Provider value={{ items, categories, loading, error }}>{children}</CatalogContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCatalog(): CatalogState {
  return useContext(CatalogContext)
}
