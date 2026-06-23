// Minimal GitHub REST client for the admin page. Authenticated with a
// fine-grained Personal Access Token (repo: Down-Memory-Lane, Contents R/W)
// that the editor pastes in — stored only in their browser.

export const OWNER = 'cvfesta'
export const REPO = 'Down-Memory-Lane'
export const BRANCH = 'main'
export const PRODUCTS_PATH = 'public/products.json'
export const IMAGES_DIR = 'public/products'

const API = 'https://api.github.com'

async function api(token: string, method: string, path: string, body?: unknown): Promise<unknown> {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as { message?: string } | null
    throw new Error(data?.message || `GitHub API error (${res.status})`)
  }
  return res.json()
}

export interface TokenCheck {
  ok: boolean
  canWrite: boolean
  message: string
}

/** Verify the token can reach the repo and has write access. */
export async function checkToken(token: string): Promise<TokenCheck> {
  try {
    const repo = (await api(token, 'GET', `/repos/${OWNER}/${REPO}`)) as {
      permissions?: { push?: boolean }
    }
    const canWrite = !!repo.permissions?.push
    return {
      ok: true,
      canWrite,
      message: canWrite ? 'Connected.' : 'Token works but lacks write access (needs Contents: Read & Write).',
    }
  } catch (err) {
    return { ok: false, canWrite: false, message: err instanceof Error ? err.message : 'Could not connect.' }
  }
}

/**
 * Load the current products list straight from the repo (latest committed) —
 * the authoritative source for editing. Returns null if products.json doesn't
 * exist there yet, so the caller can fall back to the served file.
 */
export async function loadProductsFromRepo<T>(token: string): Promise<T | null> {
  const res = await fetch(`${API}/repos/${OWNER}/${REPO}/contents/${PRODUCTS_PATH}?ref=${BRANCH}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  })
  if (res.status === 404) return null
  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as { message?: string } | null
    throw new Error(data?.message || `GitHub API error (${res.status})`)
  }
  const file = (await res.json()) as { content: string }
  const bin = atob(file.content.replace(/\n/g, ''))
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0))
  return JSON.parse(new TextDecoder().decode(bytes)) as T
}

async function blobToBase64(blob: Blob): Promise<string> {
  const bytes = new Uint8Array(await blob.arrayBuffer())
  let binary = ''
  const chunk = 0x8000
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk))
  }
  return btoa(binary)
}

export type CommitFile = { path: string; text: string } | { path: string; blob: Blob }

/**
 * Commit one or more files (text and/or binary) to the repo in a single
 * commit via the Git Data API, then move the branch to it. One commit means
 * exactly one rebuild/redeploy.
 */
export async function commitFiles(token: string, message: string, files: CommitFile[]): Promise<void> {
  const ref = (await api(token, 'GET', `/repos/${OWNER}/${REPO}/git/ref/heads/${BRANCH}`)) as {
    object: { sha: string }
  }
  const latestCommitSha = ref.object.sha
  const commit = (await api(token, 'GET', `/repos/${OWNER}/${REPO}/git/commits/${latestCommitSha}`)) as {
    tree: { sha: string }
  }
  const baseTreeSha = commit.tree.sha

  const tree: Array<{ path: string; mode: '100644'; type: 'blob'; sha?: string; content?: string }> = []
  for (const f of files) {
    if ('text' in f) {
      tree.push({ path: f.path, mode: '100644', type: 'blob', content: f.text })
    } else {
      const blob = (await api(token, 'POST', `/repos/${OWNER}/${REPO}/git/blobs`, {
        content: await blobToBase64(f.blob),
        encoding: 'base64',
      })) as { sha: string }
      tree.push({ path: f.path, mode: '100644', type: 'blob', sha: blob.sha })
    }
  }

  const newTree = (await api(token, 'POST', `/repos/${OWNER}/${REPO}/git/trees`, {
    base_tree: baseTreeSha,
    tree,
  })) as { sha: string }

  const newCommit = (await api(token, 'POST', `/repos/${OWNER}/${REPO}/git/commits`, {
    message,
    tree: newTree.sha,
    parents: [latestCommitSha],
  })) as { sha: string }

  await api(token, 'PATCH', `/repos/${OWNER}/${REPO}/git/refs/heads/${BRANCH}`, { sha: newCommit.sha })
}
