import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import type { Item, ItemStatus } from '../data/items'
import { productImageUrl } from '../data/items'
import type { ConditionGrade } from '../data/conditions'
import { CONDITION_GRADES, gradeMeaning } from '../data/conditions'
import { optimizeImage } from '../lib/optimizeImage'
import { checkToken, loadProductsFromRepo, commitFiles, IMAGES_DIR, PRODUCTS_PATH, type CommitFile } from '../lib/github'
import { serif, adminField } from '../lib/styles'
import { Combobox } from './Combobox'

const TOKEN_KEY = 'dml-gh-token'

type ImageEntry = { kind: 'existing'; name: string; url: string } | { kind: 'new'; file: File; url: string }

interface Draft {
  id: string | null
  title: string
  category: string
  sub: string
  price: string
  status: ItemStatus
  era: string
  dimH: string
  dimW: string
  dimD: string
  dimUnit: 'in' | 'cm'
  dimOther: string
  grade: ConditionGrade
  condNotes: string
  label: string
  desc: string
  images: ImageEntry[]
}

/** Assemble the stored dimensions string from the structured fields. */
function buildDim(d: Pick<Draft, 'dimH' | 'dimW' | 'dimD' | 'dimUnit' | 'dimOther'>): string {
  if (d.dimOther.trim()) return d.dimOther.trim()
  const sym = d.dimUnit === 'cm' ? ' cm' : '"'
  const parts: string[] = []
  if (d.dimH.trim()) parts.push(`${d.dimH.trim()}${sym} H`)
  if (d.dimW.trim()) parts.push(`${d.dimW.trim()}${sym} W`)
  if (d.dimD.trim()) parts.push(`${d.dimD.trim()}${sym} D`)
  return parts.join(' × ')
}

const input = adminField
const label: CSSProperties = {
  display: 'block',
  fontSize: 11,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: 'var(--muted-2)',
  marginBottom: 5,
  marginTop: 16,
}
const btn: CSSProperties = {
  border: '1px solid var(--line-2)',
  background: 'var(--surface)',
  color: 'var(--ink)',
  borderRadius: 8,
  padding: '9px 16px',
  fontSize: 13,
  cursor: 'pointer',
  fontFamily: 'inherit',
}
const btnPrimary: CSSProperties = { ...btn, background: 'var(--btn-bg)', color: 'var(--btn-text)', border: 'none' }
const note: CSSProperties = { fontSize: 13, color: 'var(--muted)', lineHeight: 1.5 }
const errorText: CSSProperties = { ...note, color: 'var(--error-text)' }
const h: CSSProperties = { fontFamily: serif, fontWeight: 600 }
const dropzone: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 4,
  textAlign: 'center',
  cursor: 'pointer',
  border: '2px dashed var(--line-2)',
  borderRadius: 12,
  padding: '26px 16px',
  background: 'var(--surface-2)',
  color: 'var(--muted)',
  fontSize: 13,
}
const subLabel: CSSProperties = { fontSize: 10, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--muted-2)', display: 'block', marginBottom: 4 }

function slugify(s: string): string {
  return (
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'item'
  )
}

function emptyDraft(): Draft {
  return {
    id: null,
    title: '',
    category: '',
    sub: '',
    price: 'Price on request',
    status: 'available',
    era: '',
    dimH: '',
    dimW: '',
    dimD: '',
    dimUnit: 'in',
    dimOther: '',
    grade: 'Good',
    condNotes: '',
    label: '',
    desc: '',
    images: [],
  }
}

function toDraft(it: Item): Draft {
  return {
    id: it.id,
    title: it.title,
    category: it.category,
    sub: it.sub ?? '',
    price: it.price,
    status: it.status,
    era: it.era,
    // Existing dimension strings are varied (diameters, sets, framed sizes), so
    // they load into the free-text field rather than being parsed into boxes.
    dimH: '',
    dimW: '',
    dimD: '',
    dimUnit: 'in',
    dimOther: it.dim,
    grade: it.grade,
    condNotes: it.condNotes,
    label: it.label,
    desc: it.desc,
    images: (it.images ?? []).map((name) => ({ kind: 'existing', name, url: productImageUrl(name) }) as ImageEntry),
  }
}

export default function Admin() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY))
  const [tokenField, setTokenField] = useState('')
  const [phase, setPhase] = useState<'gate' | 'loading' | 'list' | 'edit'>(token ? 'loading' : 'gate')
  const [products, setProducts] = useState<Item[]>([])
  const [draft, setDraft] = useState<Draft | null>(null)
  const [editIndex, setEditIndex] = useState<number | null>(null)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')

  // Validate the token and load products whenever the token changes.
  useEffect(() => {
    if (!token) return
    let cancelled = false
    ;(async () => {
      const check = await checkToken(token)
      if (cancelled) return
      if (!check.ok || !check.canWrite) {
        setErr(check.message)
        setPhase('gate')
        return
      }
      try {
        // Authoritative copy from the repo; if it isn't committed yet, fall
        // back to whatever the site is currently serving (the local file in
        // dev, the deployed file in prod) so there's always something to edit.
        let items = await loadProductsFromRepo<Item[]>(token)
        if (items === null) {
          const served = await fetch(`${import.meta.env.BASE_URL}products.json`, { cache: 'no-cache' })
          items = served.ok ? ((await served.json()) as Item[]) : []
        }
        if (cancelled) return
        setProducts(items)
        setPhase('list')
      } catch (e) {
        if (cancelled) return
        setErr(e instanceof Error ? e.message : 'Could not load products.')
        setPhase('gate')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [token])

  const connect = async () => {
    setErr('')
    setBusy(true)
    const t = tokenField.trim()
    const check = await checkToken(t)
    setBusy(false)
    if (!check.ok || !check.canWrite) {
      setErr(check.message)
      return
    }
    localStorage.setItem(TOKEN_KEY, t)
    setPhase('loading')
    setToken(t)
    setTokenField('')
  }

  const signOut = () => {
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
    setProducts([])
    setPhase('gate')
  }

  const startNew = () => {
    setEditIndex(null)
    setDraft(emptyDraft())
    setMsg('')
    setErr('')
    setPhase('edit')
  }
  const startEdit = (i: number) => {
    setEditIndex(i)
    setDraft(toDraft(products[i]))
    setMsg('')
    setErr('')
    setPhase('edit')
  }

  const removeProduct = async (i: number) => {
    if (!token) return
    if (!window.confirm(`Remove "${products[i].title}"? This cannot be undone.`)) return
    setBusy(true)
    setErr('')
    try {
      const next = products.filter((_, idx) => idx !== i)
      await commitFiles(token, `Admin: remove ${products[i].title}`, [
        { path: PRODUCTS_PATH, text: JSON.stringify(next, null, 2) + '\n' },
      ])
      setProducts(next)
      setMsg('Removed. Your site will update in a minute or two.')
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Could not save.')
    } finally {
      setBusy(false)
    }
  }

  const save = async () => {
    if (!token || !draft) return
    if (!draft.title.trim()) {
      setErr('A title is required.')
      return
    }
    setBusy(true)
    setErr('')
    try {
      const takenIds = new Set(products.map((p) => p.id).filter((_, idx) => idx !== editIndex))
      let id = draft.id ?? slugify(draft.title)
      if (editIndex === null) {
        const base = id
        let n = 2
        while (takenIds.has(id)) id = `${base}-${n++}`
      }

      const stamp = () => Date.now().toString(36) + Math.floor(Math.random() * 1296).toString(36)
      const finalNames: string[] = []
      const fileCommits: CommitFile[] = []
      for (const img of draft.images) {
        if (img.kind === 'existing') {
          finalNames.push(img.name)
        } else {
          const opt = await optimizeImage(img.file)
          const name = `${id}-${stamp()}.${opt.ext}`
          fileCommits.push({ path: `${IMAGES_DIR}/${name}`, blob: opt.blob })
          finalNames.push(name)
        }
      }

      const item: Item = {
        id,
        title: draft.title.trim(),
        category: draft.category.trim() || 'Uncategorized',
        sub: draft.sub.trim() || null,
        price: draft.price.trim() || 'Price on request',
        status: draft.status,
        era: draft.era.trim(),
        dim: buildDim(draft),
        grade: draft.grade,
        condNotes: draft.condNotes.trim(),
        label: draft.label.trim() || draft.title.trim(),
        desc: draft.desc.trim(),
        images: finalNames,
      }

      const next = [...products]
      if (editIndex === null) next.unshift(item)
      else next[editIndex] = item

      await commitFiles(token, `Admin: ${editIndex === null ? 'add' : 'update'} ${item.title}`, [
        ...fileCommits,
        { path: PRODUCTS_PATH, text: JSON.stringify(next, null, 2) + '\n' },
      ])

      setProducts(next)
      setDraft(null)
      setEditIndex(null)
      setPhase('list')
      setMsg('Saved. Your site will update in a minute or two.')
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Could not save.')
    } finally {
      setBusy(false)
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  const categories = [...new Set(products.map((p) => p.category))].sort()
  const subs = [...new Set(products.map((p) => p.sub).filter((s): s is string => !!s))].sort()

  if (phase === 'loading') {
    return <div style={{ padding: '60px 0', ...note }}>Connecting…</div>
  }

  if (phase === 'gate') {
    return (
      <div style={{ maxWidth: 520, margin: '0 auto', padding: '48px 0' }}>
        <h1 style={{ ...h, fontSize: 30, margin: '0 0 8px' }}>Shop admin</h1>
        <p style={{ ...note, marginBottom: 20 }}>
          Paste your GitHub access token to manage products. It's stored only in this browser. Need one? Create a
          fine-grained token on GitHub for the <strong>Down-Memory-Lane</strong> repository with{' '}
          <strong>Contents: Read &amp; write</strong>.
        </p>
        <input
          type="password"
          value={tokenField}
          onChange={(e) => setTokenField(e.target.value)}
          placeholder="github_pat_…"
          style={input}
          onKeyDown={(e) => e.key === 'Enter' && connect()}
        />
        {err && <p style={{ ...errorText, marginTop: 12 }}>{err}</p>}
        <button style={{ ...btnPrimary, marginTop: 16 }} onClick={connect} disabled={busy || !tokenField.trim()}>
          {busy ? 'Connecting…' : 'Connect'}
        </button>
      </div>
    )
  }

  if (phase === 'list') {
    return (
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '40px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <h1 style={{ ...h, fontSize: 30, margin: 0 }}>Products</h1>
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={btnPrimary} onClick={startNew}>+ Add product</button>
            <button style={btn} onClick={signOut}>Sign out</button>
          </div>
        </div>
        <p style={{ ...note, marginTop: 8 }}>{products.length} products · changes go live 1–2 minutes after saving.</p>
        {msg && <p style={{ ...note, color: 'var(--available)', marginTop: 4 }}>{msg}</p>}
        {err && <p style={{ ...errorText, marginTop: 4 }}>{err}</p>}

        <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {products.map((p, i) => (
            <div
              key={p.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                border: '1px solid var(--line)',
                borderRadius: 10,
                padding: 10,
                background: 'var(--surface)',
              }}
            >
              <div
                style={{
                  width: 54,
                  height: 54,
                  flex: 'none',
                  borderRadius: 6,
                  background: 'var(--image-bg)',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {p.images && p.images[0] ? (
                  <img
                    src={productImageUrl(p.images[0])}
                    alt=""
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                ) : null}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{p.title}</div>
                <div style={{ ...note, fontSize: 12 }}>
                  {p.category}
                  {p.sub ? ` · ${p.sub}` : ''} · {p.price} · {p.status}
                </div>
              </div>
              <button style={btn} onClick={() => startEdit(i)} disabled={busy}>Edit</button>
              <button
                style={{ ...btn, color: 'var(--error-text)', borderColor: 'var(--error-border)' }}
                onClick={() => removeProduct(i)}
                disabled={busy}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // phase === 'edit'
  if (!draft) return null
  const setField = <K extends keyof Draft>(k: K, v: Draft[K]) => setDraft({ ...draft, [k]: v })

  const addFiles = (files: FileList | null) => {
    if (!files) return
    const added: ImageEntry[] = Array.from(files).map((file) => ({
      kind: 'new',
      file,
      url: URL.createObjectURL(file),
    }))
    setDraft({ ...draft, images: [...draft.images, ...added] })
  }
  const removeImage = (i: number) => setDraft({ ...draft, images: draft.images.filter((_, idx) => idx !== i) })
  const makeLead = (i: number) => {
    const imgs = [...draft.images]
    const [picked] = imgs.splice(i, 1)
    imgs.unshift(picked)
    setDraft({ ...draft, images: imgs })
  }

  const dimPreview = buildDim(draft)

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '36px 0' }}>
      <button style={{ ...btn, marginBottom: 16 }} onClick={() => setPhase('list')} disabled={busy}>← Back</button>
      <h1 style={{ ...h, fontSize: 26, margin: '0 0 14px' }}>{editIndex === null ? 'Add product' : 'Edit product'}</h1>

      {/* Photos first — the main image is what shows in listings. */}
      <label style={label}>Photos · first is the main image</label>
      {draft.images.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
          {draft.images.map((img, i) => (
            <div key={img.url} style={{ width: 256 }}>
              <div
                style={{
                  width: 256,
                  height: 256,
                  borderRadius: 10,
                  overflow: 'hidden',
                  background: 'var(--image-bg)',
                  border: i === 0 ? '2px solid var(--gold)' : '1px solid var(--line)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                }}
              >
                <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                {i === 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: 6,
                      left: 6,
                      background: 'var(--gold)',
                      color: '#fff',
                      fontSize: 10,
                      fontWeight: 600,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      padding: '2px 7px',
                      borderRadius: 5,
                    }}
                  >
                    Main
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5 }}>
                {i !== 0 ? (
                  <button style={{ ...btn, padding: '3px 8px', fontSize: 11 }} onClick={() => makeLead(i)}>
                    Make main
                  </button>
                ) : (
                  <span />
                )}
                <button
                  style={{ ...btn, padding: '3px 8px', fontSize: 11, color: 'var(--error-text)', border: 'none' }}
                  onClick={() => removeImage(i)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <label
        style={dropzone}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault()
          addFiles(e.dataTransfer.files)
        }}
      >
        <span style={{ fontSize: 22, lineHeight: 1 }}>＋</span>
        <span>
          <strong>Drag photos here</strong> or click to choose
        </span>
        <span style={{ fontSize: 11 }}>Big phone photos are fine — they're resized &amp; compressed automatically.</span>
        <input type="file" accept="image/*" multiple onChange={(e) => addFiles(e.target.files)} style={{ display: 'none' }} />
      </label>

      <label style={label}>Title</label>
      <input style={input} value={draft.title} onChange={(e) => setField('title', e.target.value)} />

      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <label style={label}>Category</label>
          <Combobox value={draft.category} onChange={(v) => setField('category', v)} options={categories} placeholder="e.g. Clocks" />
        </div>
        <div style={{ flex: 1 }}>
          <label style={label}>Sub-category (optional)</label>
          <Combobox value={draft.sub} onChange={(v) => setField('sub', v)} options={subs} placeholder="e.g. Wall" />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <label style={label}>Price</label>
          <input style={input} value={draft.price} onChange={(e) => setField('price', e.target.value)} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={label}>Status</label>
          <select style={input} value={draft.status} onChange={(e) => setField('status', e.target.value as ItemStatus)}>
            <option value="available">available</option>
            <option value="sold">sold</option>
          </select>
        </div>
      </div>

      <label style={label}>Condition grade</label>
      <select style={input} value={draft.grade} onChange={(e) => setField('grade', e.target.value as ConditionGrade)}>
        {CONDITION_GRADES.map((g) => (
          <option key={g.value} value={g.value}>
            {g.value} — {g.meaning}
          </option>
        ))}
      </select>
      <p style={{ ...note, fontSize: 12, marginTop: 5 }}>{gradeMeaning(draft.grade)}</p>

      <label style={label}>Condition notes (optional)</label>
      <input
        style={input}
        value={draft.condNotes}
        onChange={(e) => setField('condNotes', e.target.value)}
        placeholder="e.g. light surface wear; recently serviced"
      />

      <label style={label}>Era / origin</label>
      <input style={input} value={draft.era} onChange={(e) => setField('era', e.target.value)} placeholder="e.g. c. 1890 · France" />

      <label style={label}>Dimensions</label>
      <div style={{ display: 'flex', gap: 8 }}>
        <div style={{ flex: 1 }}>
          <span style={subLabel}>Height</span>
          <input style={input} value={draft.dimH} onChange={(e) => setField('dimH', e.target.value)} placeholder="14" />
        </div>
        <div style={{ flex: 1 }}>
          <span style={subLabel}>Width</span>
          <input style={input} value={draft.dimW} onChange={(e) => setField('dimW', e.target.value)} placeholder="18" />
        </div>
        <div style={{ flex: 1 }}>
          <span style={subLabel}>Depth</span>
          <input style={input} value={draft.dimD} onChange={(e) => setField('dimD', e.target.value)} placeholder="7" />
        </div>
        <div style={{ width: 76 }}>
          <span style={subLabel}>Unit</span>
          <select style={input} value={draft.dimUnit} onChange={(e) => setField('dimUnit', e.target.value as 'in' | 'cm')}>
            <option value="in">in</option>
            <option value="cm">cm</option>
          </select>
        </div>
      </div>
      <input
        style={{ ...input, marginTop: 8 }}
        value={draft.dimOther}
        onChange={(e) => setField('dimOther', e.target.value)}
        placeholder="Or enter exactly (diameter, set, framed size) — takes precedence"
      />
      <p style={{ ...note, fontSize: 12, marginTop: 5 }}>
        Will display as: <strong>{dimPreview || '—'}</strong>
      </p>

      <label style={label}>Description</label>
      <textarea
        style={{ ...input, resize: 'vertical', minHeight: 110 }}
        value={draft.desc}
        onChange={(e) => setField('desc', e.target.value)}
      />

      {err && <p style={{ ...errorText, marginTop: 14 }}>{err}</p>}
      <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
        <button style={btnPrimary} onClick={save} disabled={busy}>
          {busy ? 'Saving…' : 'Save'}
        </button>
        <button style={btn} onClick={() => setPhase('list')} disabled={busy}>
          Cancel
        </button>
      </div>
    </div>
  )
}
