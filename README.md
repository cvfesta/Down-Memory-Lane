# Down Memory Lane

A small storefront website for **Down Memory Lane — Antiques & Curiosities**: a rotating
collection of antique clocks, oil paintings, carvings, books and curiosities, found,
restored and offered for sale.

Built as a single-page React + TypeScript app (Vite). No backend — product data lives in
the repo and contact/inquiry forms are delivered by [Web3Forms](https://web3forms.com).

## Features

- **Catalog** with photos, dynamically derived categories & sub-categories, and per-item detail pages
- **Inquiry & contact forms** delivered straight to the shop inbox (Web3Forms) with honeypot spam protection
- **Light / dark / auto theming** (follows the visitor's device by default) via CSS variables
- **Mobile-responsive** layout with a collapsible category filter
- **SEO & social** meta tags, custom favicon, and an Open Graph share card

## Tech stack

React 19 · TypeScript · Vite · ESLint. Styling is inline styles driven by CSS custom
properties (see [Theming](#theming)). Fonts (Playfair Display + Libre Franklin) load from
Google Fonts.

## Getting started

```bash
npm install
npm run dev      # start the dev server (http://localhost:5173)
npm run build    # type-check + production build into dist/
npm run preview  # serve the production build locally
npm run lint     # run ESLint
```

Requires Node 18+ (Vite 8). Create a `.env` from `.env.example` and add your Web3Forms key
(see [Contact form](#contact-form)).

## Project structure

```
src/
  data/items.ts          # THE CATALOG — all products live here
  assets/products/        # product images (.webp)
  lib/
    categories.ts         # derives the category tree from the products
    contact.ts            # Web3Forms submission + honeypot
    theme.ts              # light/dark/auto theme hook
  components/             # Header, Footer, shared UI (HoverButton, inputs)
  views/                  # Browse, ItemDetail, Contact, About
  App.tsx                # view state / routing-by-state
  index.css              # CSS variables: colour palette + responsive layout
index.html               # meta tags, favicon, theme pre-paint script
public/                  # favicon.svg, og-image.png
```

## Managing the catalog

All products are defined in **`src/data/items.ts`** as an array of `Item` objects:

```ts
{
  id: 'cinnabar-clock',                 // unique slug (also used internally)
  title: 'Carved Cinnabar-Lacquer Wall Clock',
  category: 'Clocks',                   // top-level group (sidebar builds itself from these)
  sub: 'Wall',                          // optional sub-group, or null
  price: 'Price on request',            // free text — e.g. '$480' or 'Price on request'
  status: 'available',                  // 'available' | 'sold' (sold shows a badge)
  era: 'China · carved-lacquer tradition',
  dim: 'Approx. 12" diameter',
  cond: 'Good — quartz movement',
  label: 'cinnabar wall clock',         // fallback caption when there is no photo
  images: [cinnabarWallClock],          // one or more imported images (first is the lead)
  desc: 'A decorative charger in the classic Chinese carved cinnabar-lacquer style…',
}
```

**To add a product:**

1. Add the photo(s) to `src/assets/products/` (see image notes below).
2. `import` the image at the top of `items.ts`.
3. Add a new object to the `ITEMS` array with that image in `images: [...]`.

Categories and sub-categories — and all their counts — are **derived automatically** from
the products (`src/lib/categories.ts`), so there is no separate list to maintain. Add an
item in a new category and it appears in the sidebar on its own.

### Product images

Images are optimized **WebP** (transparency supported) sized to ~1200px. The originals the
photos came from were multi-megabyte PNGs; converting keeps the whole image set small
(~3 MB total). To prepare a new photo, either:

- Use [Squoosh](https://squoosh.app) → export WebP at ~1200px wide, **or**
- Resize/convert any way you like, keeping the longest edge ~1000–1200px.

Drop the result in `src/assets/products/` and import it. A product with **no** `images`
falls back to a striped placeholder, so missing photos won't break the page.

## Contact form

Both the per-item inquiry form and the Contact page submit via Web3Forms — no server needed.

1. Get a free access key at [web3forms.com](https://web3forms.com) (enter the inbox address
   you want messages delivered to; **click the verification email** to activate the key).
2. Copy `.env.example` to `.env` and set the key:

   ```
   VITE_WEB3FORMS_KEY=your-access-key-here
   ```

3. Restart `npm run dev` (Vite reads `.env` at startup).

The key is a **public, client-side** key by design — it can only route messages to its
registered inbox. `.env` is gitignored; on a deploy host, set `VITE_WEB3FORMS_KEY` in the
host's environment variables. Until a valid key is present, the forms show a friendly
"not set up yet" message rather than failing silently.

## Theming

Colours and responsive dimensions are CSS custom properties defined in **`src/index.css`**:

- `:root` — the light palette + desktop layout values
- `:root[data-theme='dark']` — dark overrides
- `@media (max-width: 760px)` — mobile layout values

Components reference tokens like `var(--ink)`, `var(--gold)`, `var(--bg)` rather than hard
hex codes, so a colour change is a one-line edit. **When adding components, use the
`var(--…)` tokens** (not raw hex) so they theme correctly. The active theme is stored in
`localStorage` and applied pre-paint by a small script in `index.html` to avoid a flash.

## SEO & social

`index.html` contains the meta description and Open Graph / Twitter tags, and
`public/og-image.png` is the share card. The `og:image` / `og:url` are currently relative —
**once the site has a domain, change them to absolute URLs** (some platforms require it).
There's a comment in `index.html` marking the spot.

## Deployment

It's a static site — `npm run build` outputs `dist/`. Host it anywhere static (Cloudflare
Pages, Netlify, Vercel, GitHub Pages). Typical settings:

- **Build command:** `npm run build`
- **Output directory:** `dist`
- **Environment variable:** `VITE_WEB3FORMS_KEY` = your Web3Forms key

## Known follow-ups

- Prices are currently `'Price on request'` for every item — fill in real prices in `items.ts`.
- Make the `og:image` / `og:url` absolute once a domain is set.
- Products aren't individually deep-linkable yet (the whole site is one URL); adding routing
  would make pieces shareable and improve SEO.
