import type { Item } from '../data/items'

export interface SubCategory {
  name: string
  count: number
}

export interface Category {
  name: string
  count: number
  subs: SubCategory[]
}

/**
 * Derive the category tree directly from the product list — categories,
 * their sub-categories and all counts are computed from the items, so the
 * sidebar always reflects whatever products exist. First-seen order is
 * preserved for both categories and sub-categories.
 */
export function deriveCategories(items: Item[]): Category[] {
  const order: string[] = []
  const map = new Map<string, { count: number; subs: Map<string, number> }>()

  for (const it of items) {
    let entry = map.get(it.category)
    if (!entry) {
      entry = { count: 0, subs: new Map() }
      map.set(it.category, entry)
      order.push(it.category)
    }
    entry.count++
    if (it.sub) {
      entry.subs.set(it.sub, (entry.subs.get(it.sub) ?? 0) + 1)
    }
  }

  return order.map((name) => {
    const entry = map.get(name)!
    return {
      name,
      count: entry.count,
      subs: [...entry.subs.entries()].map(([subName, count]) => ({ name: subName, count })),
    }
  })
}
