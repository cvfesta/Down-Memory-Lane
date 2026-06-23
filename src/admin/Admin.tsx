import { useEffect, useState } from 'react'
import { TextField, Label, Input, TextArea, Select, ListBox, ComboBox, Button, Spinner, Alert, AlertDialog, Table } from '@heroui/react'
import type { Item, ItemStatus } from '../data/items'
import { productImageUrl } from '../data/items'
import type { ConditionGrade } from '../data/conditions'
import { CONDITION_GRADES, gradeMeaning } from '../data/conditions'
import { optimizeImage } from '../lib/optimizeImage'
import { checkToken, loadProductsFromRepo, commitFiles, IMAGES_DIR, PRODUCTS_PATH, type CommitFile } from '../lib/github'
import { DEFAULT_ABOUT, ABOUT_PATH, normalizeAbout } from '../data/about'
import type { AboutContent, AboutSection } from '../data/about'

const TOKEN_KEY = 'dml-gh-token'

type ImageEntry = { kind: 'existing'; name: string; url: string } | { kind: 'new'; file: File; url: string }

interface Draft {
  id: string | null
  title: string
  category: string
  sub: string
  priceAmount: string
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
  ref: string
  images: ImageEntry[]
}

function buildDim(d: Pick<Draft, 'dimH' | 'dimW' | 'dimD' | 'dimUnit' | 'dimOther'>): string {
  if (d.dimOther.trim()) return d.dimOther.trim()
  const sym = d.dimUnit === 'cm' ? ' cm' : '"'
  const parts: string[] = []
  if (d.dimH.trim()) parts.push(`${d.dimH.trim()}${sym} H`)
  if (d.dimW.trim()) parts.push(`${d.dimW.trim()}${sym} W`)
  if (d.dimD.trim()) parts.push(`${d.dimD.trim()}${sym} D`)
  return parts.join(' × ')
}

/** Turn whatever was typed into a clean price string: "$1,234" or "Price on request". */
function formatPrice(amount: string): string {
  const n = parseFloat(amount.replace(/[^0-9.]/g, ''))
  return Number.isFinite(n) && n > 0 ? `$${n.toLocaleString('en-US')}` : 'Price on request'
}

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'item'
}

function emptyDraft(): Draft {
  return {
    id: null, title: '', category: '', sub: '', priceAmount: '', status: 'available',
    era: '', dimH: '', dimW: '', dimD: '', dimUnit: 'in', dimOther: '', grade: 'Good',
    condNotes: '', label: '', desc: '', ref: '', images: [],
  }
}

function toDraft(it: Item): Draft {
  return {
    id: it.id, title: it.title, category: it.category, sub: it.sub ?? '',
    priceAmount: /request/i.test(it.price) ? '' : it.price.replace(/[^0-9.]/g, ''),
    status: it.status,
    era: it.era, dimH: '', dimW: '', dimD: '', dimUnit: 'in', dimOther: it.dim, grade: it.grade,
    condNotes: it.condNotes, label: it.label, desc: it.desc, ref: it.ref ?? '',
    images: (it.images ?? []).map((name) => ({ kind: 'existing', name, url: productImageUrl(name) }) as ImageEntry),
  }
}

// ── Small v3-composition wrappers to keep the form readable ───────────────────
function TF(props: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; className?: string }) {
  return (
    <TextField value={props.value} onChange={props.onChange} type={props.type} className={props.className}>
      <Label>{props.label}</Label>
      <Input placeholder={props.placeholder} />
    </TextField>
  )
}

function Sel(props: { label: string; value: string; onChange: (v: string) => void; options: { id: string; label: string }[]; className?: string }) {
  return (
    <Select value={props.value} onChange={(v) => props.onChange(String(v))} className={props.className}>
      <Label>{props.label}</Label>
      <Select.Trigger>
        <Select.Value />
        <Select.Indicator />
      </Select.Trigger>
      <Select.Popover>
        <ListBox>
          {props.options.map((o) => (
            <ListBox.Item key={o.id} id={o.id} textValue={o.label}>
              {o.label}
              <ListBox.ItemIndicator />
            </ListBox.Item>
          ))}
        </ListBox>
      </Select.Popover>
    </Select>
  )
}

function Combo(props: { label: string; value: string; onChange: (v: string) => void; options: string[]; placeholder?: string; className?: string }) {
  return (
    <ComboBox
      allowsCustomValue
      inputValue={props.value}
      onInputChange={props.onChange}
      onSelectionChange={(k) => k != null && props.onChange(String(k))}
      className={props.className}
    >
      <Label>{props.label}</Label>
      <ComboBox.InputGroup>
        <Input placeholder={props.placeholder} />
        <ComboBox.Trigger />
      </ComboBox.InputGroup>
      <ComboBox.Popover>
        <ListBox>
          {props.options.map((o) => (
            <ListBox.Item key={o} id={o} textValue={o}>
              {o}
              <ListBox.ItemIndicator />
            </ListBox.Item>
          ))}
        </ListBox>
      </ComboBox.Popover>
    </ComboBox>
  )
}

function StatusAlert({ status, text }: { status: 'success' | 'danger'; text: string }) {
  return (
    <Alert status={status} className="mt-3">
      <Alert.Indicator />
      <Alert.Content>
        <Alert.Title>{text}</Alert.Title>
      </Alert.Content>
    </Alert>
  )
}

export default function Admin() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY))
  const [tokenField, setTokenField] = useState('')
  const [phase, setPhase] = useState<'gate' | 'loading' | 'list' | 'edit' | 'about'>(token ? 'loading' : 'gate')
  const [products, setProducts] = useState<Item[]>([])
  const [draft, setDraft] = useState<Draft | null>(null)
  const [aboutDraft, setAboutDraft] = useState<AboutContent | null>(null)
  const [editIndex, setEditIndex] = useState<number | null>(null)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')

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

  const startEditAbout = async () => {
    setMsg('')
    setErr('')
    try {
      const r = await fetch(`${import.meta.env.BASE_URL}about.json`, { cache: 'no-cache' })
      const data = r.ok ? await r.json() : null
      setAboutDraft(normalizeAbout(data))
    } catch {
      setAboutDraft(DEFAULT_ABOUT)
    }
    setPhase('about')
  }

  const saveAbout = async () => {
    if (!token || !aboutDraft) return
    setBusy(true)
    setErr('')
    try {
      await commitFiles(token, 'Admin: update About page', [
        { path: ABOUT_PATH, text: JSON.stringify(aboutDraft, null, 2) + '\n' },
      ])
      setPhase('list')
      setMsg('About page saved. Your site will update in a minute or two.')
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Could not save.')
    } finally {
      setBusy(false)
    }
  }

  const doRemove = async (i: number) => {
    if (!token) return
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
        price: formatPrice(draft.priceAmount),
        status: draft.status,
        era: draft.era.trim(),
        dim: buildDim(draft),
        grade: draft.grade,
        condNotes: draft.condNotes.trim(),
        label: draft.label.trim() || draft.title.trim(),
        desc: draft.desc.trim(),
        ...(draft.ref.trim() ? { ref: draft.ref.trim() } : {}),
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

  const categories = [...new Set(products.map((p) => p.category))].sort()
  const subs = [...new Set(products.map((p) => p.sub).filter((s): s is string => !!s))].sort()

  if (phase === 'loading') {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-neutral-600 dark:text-neutral-400">
        <Spinner />
        Connecting…
      </div>
    )
  }

  if (phase === 'gate') {
    return (
      <div className="mx-auto max-w-[520px] py-12">
        <h1 className="mb-2 font-serif text-3xl font-semibold">Shop admin</h1>
        <p className="mb-5 text-sm text-neutral-600 dark:text-neutral-400">
          Paste your GitHub access token to manage products. It's stored only in this browser. Create a fine-grained
          token for the <strong>Down-Memory-Lane</strong> repository with <strong>Contents: Read &amp; write</strong>.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            connect()
          }}
        >
          <TextField type="password" value={tokenField} onChange={setTokenField}>
            <Label>Access token</Label>
            <Input placeholder="github_pat_…" />
          </TextField>
          {err && <StatusAlert status="danger" text={err} />}
          <Button type="submit" variant="primary" className="mt-4" isPending={busy} isDisabled={!tokenField.trim()}>
            {({ isPending }) => (isPending ? 'Connecting…' : 'Connect')}
          </Button>
        </form>
      </div>
    )
  }

  if (phase === 'list') {
    return (
      <div className="mx-auto max-w-[760px] py-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-serif text-3xl font-semibold">Products</h1>
          <div className="flex gap-2">
            <Button variant="primary" onPress={startNew}>
              + Add product
            </Button>
            <Button variant="outline" onPress={startEditAbout}>
              About page
            </Button>
            <Button variant="outline" onPress={signOut}>
              Sign out
            </Button>
          </div>
        </div>
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
          {products.length} products · changes go live 1–2 minutes after saving.
        </p>
        {msg && <StatusAlert status="success" text={msg} />}
        {err && <StatusAlert status="danger" text={err} />}

        <div className="mt-5">
          <Table>
            <Table.ScrollContainer>
              <Table.Content aria-label="Products">
                <Table.Header>
                  <Table.Column isRowHeader>Product</Table.Column>
                  <Table.Column>Details</Table.Column>
                  <Table.Column>{''}</Table.Column>
                </Table.Header>
                <Table.Body>
                  {products.map((p, i) => (
                    <Table.Row key={p.id} id={p.id}>
                      <Table.Cell>
                        <div className="flex items-center gap-3">
                          <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-md bg-[var(--image-bg)]">
                            {p.images && p.images[0] ? (
                              <img src={productImageUrl(p.images[0])} alt="" className="size-full object-contain" />
                            ) : null}
                          </div>
                          <div>
                            <span className="font-medium">{p.title}</span>
                            {p.ref ? (
                              <span className="block text-xs text-neutral-600 dark:text-neutral-400">Ref: {p.ref}</span>
                            ) : null}
                          </div>
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <span className="text-xs text-neutral-600 dark:text-neutral-400">
                          {p.category}
                          {p.sub ? ` · ${p.sub}` : ''} · {p.price} · {p.status}
                        </span>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" onPress={() => startEdit(i)} isDisabled={busy}>
                            Edit
                          </Button>
                          <AlertDialog>
                            <Button size="sm" variant="danger-soft" isDisabled={busy}>
                              Delete
                            </Button>
                            <AlertDialog.Backdrop>
                              <AlertDialog.Container>
                                <AlertDialog.Dialog className="sm:max-w-[420px]">
                                  <AlertDialog.Header>
                                    <AlertDialog.Icon status="danger" />
                                    <AlertDialog.Heading>Remove “{p.title}”?</AlertDialog.Heading>
                                  </AlertDialog.Header>
                                  <AlertDialog.Body>
                                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                      This permanently removes the product from your shop. It can't be undone.
                                    </p>
                                  </AlertDialog.Body>
                                  <AlertDialog.Footer>
                                    <Button slot="close" variant="tertiary">
                                      Cancel
                                    </Button>
                                    <Button slot="close" variant="danger" onPress={() => doRemove(i)}>
                                      Delete
                                    </Button>
                                  </AlertDialog.Footer>
                                </AlertDialog.Dialog>
                              </AlertDialog.Container>
                            </AlertDialog.Backdrop>
                          </AlertDialog>
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Content>
            </Table.ScrollContainer>
          </Table>
        </div>
      </div>
    )
  }

  if (phase === 'about' && aboutDraft) {
    const setA = (patch: Partial<AboutContent>) => setAboutDraft({ ...aboutDraft, ...patch })
    const setSection = (i: number, patch: Partial<AboutSection>) =>
      setA({ sections: aboutDraft.sections.map((s, j) => (j === i ? { ...s, ...patch } : s)) })
    const addSection = () => setA({ sections: [...aboutDraft.sections, { title: '', body: '' }] })
    const removeSection = (i: number) => setA({ sections: aboutDraft.sections.filter((_, j) => j !== i) })
    const moveSection = (i: number, dir: -1 | 1) => {
      const j = i + dir
      if (j < 0 || j >= aboutDraft.sections.length) return
      const next = [...aboutDraft.sections]
      ;[next[i], next[j]] = [next[j], next[i]]
      setA({ sections: next })
    }
    return (
      <div className="mx-auto max-w-[640px] py-9">
        <Button variant="outline" size="sm" className="mb-4" onPress={() => setPhase('list')} isDisabled={busy}>
          ← Back
        </Button>
        <h1 className="mb-2 font-serif text-2xl font-semibold">Edit About page</h1>
        <p className="mb-5 text-sm text-neutral-600 dark:text-neutral-400">
          Write as much or as little as you like. Leave a blank line between paragraphs to start a new one. Sections are
          the small titled blocks lower on the page — add, rename, reorder or remove them however you want.
        </p>

        <div className="flex flex-col gap-4">
          <TextField value={aboutDraft.subhead} onChange={(v) => setA({ subhead: v })}>
            <Label>Subheading (under the title)</Label>
            <Input />
          </TextField>
          <TextField value={aboutDraft.body} onChange={(v) => setA({ body: v })}>
            <Label>Main text</Label>
            <TextArea className="min-h-[200px]" />
            <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
              Tip: press Enter twice to leave a blank line and start a new paragraph.
            </p>
          </TextField>
        </div>

        <div className="mt-7 flex items-center justify-between">
          <h2 className="font-serif text-lg font-semibold">Sections</h2>
          <Button variant="outline" size="sm" onPress={addSection}>
            + Add section
          </Button>
        </div>

        {aboutDraft.sections.length === 0 ? (
          <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400">
            No sections. The page will just show the main text above.
          </p>
        ) : (
          <div className="mt-3 flex flex-col gap-4">
            {aboutDraft.sections.map((s, i) => (
              <div key={i} className="rounded-lg border border-default-200 bg-default-50 p-4">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <span className="text-xs font-medium uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                    Section {i + 1}
                  </span>
                  <div className="flex gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      isIconOnly
                      aria-label="Move section up"
                      isDisabled={i === 0}
                      onPress={() => moveSection(i, -1)}
                    >
                      ↑
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      isIconOnly
                      aria-label="Move section down"
                      isDisabled={i === aboutDraft.sections.length - 1}
                      onPress={() => moveSection(i, 1)}
                    >
                      ↓
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      aria-label="Remove section"
                      onPress={() => removeSection(i)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <TextField value={s.title} onChange={(v) => setSection(i, { title: v })}>
                    <Label>Title</Label>
                    <Input placeholder="e.g. What we look for" />
                  </TextField>
                  <TextField value={s.body} onChange={(v) => setSection(i, { body: v })}>
                    <Label>Text</Label>
                    <TextArea className="min-h-[100px]" />
                  </TextField>
                </div>
              </div>
            ))}
          </div>
        )}

        {err && <StatusAlert status="danger" text={err} />}
        <div className="mt-6 flex gap-2.5">
          <Button variant="primary" onPress={saveAbout} isPending={busy}>
            {({ isPending }) => (isPending ? 'Saving…' : 'Save')}
          </Button>
          <Button variant="outline" onPress={() => setPhase('list')} isDisabled={busy}>
            Cancel
          </Button>
        </div>
      </div>
    )
  }

  // phase === 'edit'
  if (!draft) return null
  const setField = <K extends keyof Draft>(k: K, v: Draft[K]) => setDraft({ ...draft, [k]: v })

  const addFiles = (files: FileList | null) => {
    if (!files) return
    const added: ImageEntry[] = Array.from(files).map((file) => ({ kind: 'new', file, url: URL.createObjectURL(file) }))
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
    <div className="mx-auto max-w-[640px] py-9">
      <Button variant="outline" size="sm" className="mb-4" onPress={() => setPhase('list')} isDisabled={busy}>
        ← Back
      </Button>
      <h1 className="mb-4 font-serif text-2xl font-semibold">{editIndex === null ? 'Add product' : 'Edit product'}</h1>

      <p className="mb-2 text-[11px] uppercase tracking-wide text-neutral-600 dark:text-neutral-400">Photos · first is the main image</p>
      {draft.images.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-3">
          {draft.images.map((img, i) => (
            <div key={img.url} className="w-64">
              <div
                className={`relative flex size-64 items-center justify-center overflow-hidden rounded-md bg-[var(--image-bg)] ${i === 0 ? 'ring-2 ring-neutral-900 dark:ring-neutral-100' : 'border border-neutral-200 dark:border-neutral-800'}`}
              >
                <img src={img.url} alt="" className="size-full object-contain" />
                {i === 0 && (
                  <span className="absolute left-1.5 top-1.5 rounded bg-neutral-900 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-white dark:bg-neutral-100 dark:text-neutral-900">
                    Main
                  </span>
                )}
              </div>
              <div className="mt-1.5 flex justify-between">
                {i !== 0 ? (
                  <Button size="sm" variant="ghost" onPress={() => makeLead(i)}>
                    Make main
                  </Button>
                ) : (
                  <span />
                )}
                <Button size="sm" variant="ghost" onPress={() => removeImage(i)}>
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
      <label
        className="flex cursor-pointer flex-col items-center gap-1 rounded-lg border-2 border-dashed border-neutral-300 px-4 py-6 text-center text-sm text-neutral-600 dark:text-neutral-400 dark:border-neutral-700"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault()
          addFiles(e.dataTransfer.files)
        }}
      >
        <span className="text-[22px] leading-none">＋</span>
        <span>
          <strong>Drag photos here</strong> or click to choose
        </span>
        <span className="text-[11px]">Big phone photos are fine — resized &amp; compressed automatically.</span>
        <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => addFiles(e.target.files)} />
      </label>

      <div className="mt-4 flex flex-col gap-4">
        <TF label="Title" value={draft.title} onChange={(v) => setField('title', v)} />

        <div>
          <TF
            label="Internal reference (optional)"
            value={draft.ref}
            onChange={(v) => setField('ref', v)}
            placeholder="e.g. shelf B-12 / lot 487"
          />
          <p className="mt-1.5 text-xs text-neutral-600 dark:text-neutral-400">
            For your own records only — never shown to customers.
          </p>
        </div>

        <div className="flex gap-3">
          <Combo label="Category" value={draft.category} onChange={(v) => setField('category', v)} options={categories} placeholder="e.g. Clocks" className="flex-1" />
          <Combo label="Sub-category" value={draft.sub} onChange={(v) => setField('sub', v)} options={subs} placeholder="optional" className="flex-1" />
        </div>

        <div>
          <div className="flex gap-3">
            <TF label="Price (USD)" value={draft.priceAmount} onChange={(v) => setField('priceAmount', v)} placeholder="e.g. 480" className="flex-1" />
            <Sel
              label="Status"
              value={draft.status}
              onChange={(v) => setField('status', v as ItemStatus)}
              options={[
                { id: 'available', label: 'Available' },
                { id: 'sold', label: 'Sold' },
              ]}
              className="flex-1"
            />
          </div>
          <p className="mt-1.5 text-xs text-neutral-600 dark:text-neutral-400">
            Enter a number — leave blank to show “Price on request”.
          </p>
        </div>

        <div>
          <Sel
            label="Condition grade"
            value={draft.grade}
            onChange={(v) => setField('grade', v as ConditionGrade)}
            options={CONDITION_GRADES.map((g) => ({ id: g.value, label: g.value }))}
          />
          <div className="mt-2 rounded-md border border-default-200 bg-default-50 px-3 py-2 text-sm text-neutral-600 dark:text-neutral-300">
            <span className="font-medium text-foreground">{draft.grade}</span> — {gradeMeaning(draft.grade)}
          </div>
        </div>

        <TF label="Condition notes (optional)" value={draft.condNotes} onChange={(v) => setField('condNotes', v)} placeholder="e.g. light surface wear; recently serviced" />
        <TF label="Era / origin" value={draft.era} onChange={(v) => setField('era', v)} placeholder="e.g. c. 1890 · France" />

        <div>
          <p className="mb-1.5 text-sm font-medium">Dimensions</p>
          <div className="flex items-end gap-2">
            <TF label="Height" value={draft.dimH} onChange={(v) => setField('dimH', v)} placeholder="14" className="min-w-0 flex-1" />
            <TF label="Width" value={draft.dimW} onChange={(v) => setField('dimW', v)} placeholder="18" className="min-w-0 flex-1" />
            <TF label="Depth" value={draft.dimD} onChange={(v) => setField('dimD', v)} placeholder="7" className="min-w-0 flex-1" />
            <Sel
              label="Unit"
              value={draft.dimUnit}
              onChange={(v) => setField('dimUnit', v as 'in' | 'cm')}
              options={[{ id: 'in', label: 'in' }, { id: 'cm', label: 'cm' }]}
              className="w-20 shrink-0"
            />
          </div>
          <TF
            label="Or enter exactly (optional)"
            value={draft.dimOther}
            onChange={(v) => setField('dimOther', v)}
            placeholder={'e.g. 12" diameter, Set of 12'}
            className="mt-3"
          />
          <p className="mt-1.5 text-xs text-neutral-600 dark:text-neutral-400">
            Typing in the field above <strong>overrides</strong> the Height / Width / Depth boxes. Will display as:{' '}
            <strong>{dimPreview || '—'}</strong>
          </p>
        </div>

        <TextField value={draft.desc} onChange={(v) => setField('desc', v)}>
          <Label>Description</Label>
          <TextArea className="min-h-[256px]" />
        </TextField>
      </div>

      {err && <StatusAlert status="danger" text={err} />}
      <div className="mt-4 flex gap-2.5">
        <Button variant="primary" onPress={save} isPending={busy}>
          {({ isPending }) => (isPending ? 'Saving…' : 'Save')}
        </Button>
        <Button variant="outline" onPress={() => setPhase('list')} isDisabled={busy}>
          Cancel
        </Button>
      </div>
    </div>
  )
}
