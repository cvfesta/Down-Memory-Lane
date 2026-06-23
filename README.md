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
  data/
    items.ts             # Item type + image-url helper (data itself is in public/)
    CatalogContext.tsx   # loads public/products.json at runtime, app-wide
  admin/Admin.tsx        # the /admin content-management page
  lib/
    categories.ts        # derives the category tree from the products
    contact.ts           # Web3Forms submission + honeypot
    theme.ts             # light/dark/auto theme hook
    github.ts            # admin: GitHub API (single-commit writes)
    optimizeImage.ts     # admin: in-browser resize → WebP
  components/             # Header, Footer, shared UI (HoverButton, inputs)
  views/                  # Browse, ItemDetail, Contact, About
  App.tsx                # routes: /, /item/:id, /contact, /about, /admin
  index.css              # CSS variables: colour palette + responsive layout
index.html               # meta tags, favicon, theme + SPA-restore scripts
public/
  products.json          # THE CATALOG (edited via /admin or by hand)
  products/              # product images (.webp)
  favicon.svg, og-image.png, 404.html
```

## Managing the catalog

Products live in **`public/products.json`** — an array of `Item` objects (see the shape in
`src/data/items.ts`). Each item's `images` are **filenames** under `public/products/`:

```jsonc
{
  "id": "cinnabar-clock",
  "title": "Carved Cinnabar-Lacquer Wall Clock",
  "category": "Clocks",      // sidebar builds itself from these
  "sub": "Wall",             // optional sub-group, or null
  "price": "Price on request",
  "status": "available",     // "available" | "sold" (sold shows a badge)
  "era": "China · carved-lacquer tradition",
  "dim": "Approx. 12\" diameter",
  "cond": "Good — quartz movement",
  "label": "cinnabar wall clock",
  "desc": "A decorative charger in the classic Chinese carved cinnabar-lacquer style…",
  "images": ["cinnabar-wall-clock.webp"]
}
```

There are two ways to edit it:

1. **The admin page (recommended)** — see [Admin](#admin-content-management) below. A form
   with photo upload that commits the changes for you. No code.
2. **By hand** — edit `public/products.json` and drop optimized `.webp` files into
   `public/products/`, then commit. (Use [Squoosh](https://squoosh.app) → WebP, longest edge
   ~1200px; the admin does this automatically.)

Categories and sub-categories — and all their counts — are **derived automatically** from the
products, so there's no separate list to maintain. A product with no `images` falls back to a
striped placeholder.

## Admin (content management)

Visit **`/admin`** (e.g. `https://cvfesta.github.io/Down-Memory-Lane/admin`) to add, edit and
remove products with a form, including drag-in photo upload that's auto-resized and converted
to WebP. Saving commits `products.json` (and any new images) to this repo in a single commit;
the deploy workflow then rebuilds the site, so changes go live ~1–2 minutes later.

**Signing in** uses a GitHub **fine-grained Personal Access Token** (stored only in the
editor's browser — no passwords, no extra service):

1. GitHub → Settings → Developer settings → **Fine-grained tokens** → *Generate new token*.
2. **Resource owner:** your account · **Repository access:** *Only select repositories* →
   `Down-Memory-Lane`.
3. **Permissions → Repository → Contents: Read and write** (nothing else needed).
4. Set an expiry, generate, copy the `github_pat_…` string, and paste it into `/admin`.

The token can only edit this one repository, so its blast radius is contained. When it
expires, generate a new one and paste it again.

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

- Prices are currently `'Price on request'` for every item — fill in real prices (via /admin
  or in `public/products.json`).
- If you move to a custom domain, update the absolute OG URLs in `index.html` and set
  `base` back to `/` in `vite.config.ts`.
