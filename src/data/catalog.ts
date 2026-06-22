import { ITEMS } from './items'
import { deriveCategories } from '../lib/categories'

/** Whether sold pieces are hidden from the catalog. */
const HIDE_SOLD = false

/** The items shown across the site (sold pieces optionally filtered out). */
export const VISIBLE_ITEMS = HIDE_SOLD ? ITEMS.filter((i) => i.status !== 'sold') : ITEMS

/** Category tree derived from the visible items. */
export const CATEGORIES = deriveCategories(VISIBLE_ITEMS)

/** Look up a single product by its id (slug), or null if it doesn't exist. */
export function getItem(id: string) {
  return VISIBLE_ITEMS.find((i) => i.id === id) ?? null
}
