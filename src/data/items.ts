import type { ConditionGrade } from './conditions'

export type ItemStatus = 'available' | 'sold'

export interface Item {
  id: string
  title: string
  category: string
  sub: string | null
  price: string
  status: ItemStatus
  era: string
  dim: string
  /** Standardized condition grade. */
  grade: ConditionGrade
  /** Free-text condition specifics (wear, repairs, servicing…). */
  condNotes: string
  /** Short label shown in the placeholder image swatches. */
  label: string
  desc: string
  /**
   * Internal-only reference (e.g. a shelf/inventory tag). Used by the shop
   * owner for bookkeeping — never shown to customers.
   */
  ref?: string
  /**
   * Product photo filenames (under public/products/), in display order — the
   * first is the lead image. Items may have one, several, or (for now) none,
   * in which case a striped placeholder swatch is shown.
   */
  images?: string[]
}

/** Resolve a stored image filename to a URL the browser can load. */
export function productImageUrl(file: string): string {
  return `${import.meta.env.BASE_URL}products/${file}`
}
