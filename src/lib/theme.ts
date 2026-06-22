import { useEffect, useState } from 'react'

/** What the user chose. 'auto' follows the operating-system setting. */
export type ThemePref = 'auto' | 'light' | 'dark'
export type ResolvedTheme = 'light' | 'dark'

const STORAGE_KEY = 'dml-theme'

function systemTheme(): ResolvedTheme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function getStoredPref(): ThemePref {
  const saved = localStorage.getItem(STORAGE_KEY)
  return saved === 'light' || saved === 'dark' || saved === 'auto' ? saved : 'auto'
}

function resolve(pref: ThemePref): ResolvedTheme {
  return pref === 'auto' ? systemTheme() : pref
}

function apply(pref: ThemePref) {
  document.documentElement.dataset.theme = resolve(pref)
}

/**
 * Theme preference synced to <html data-theme> and localStorage. Defaults to
 * 'auto', which tracks the OS setting (and live-updates if the OS flips). The
 * cycle order is Auto → Light → Dark → Auto.
 */
export function useTheme() {
  const [pref, setPref] = useState<ThemePref>(() => getStoredPref())

  useEffect(() => {
    apply(pref)
  }, [pref])

  // While on 'auto', follow OS changes in real time.
  useEffect(() => {
    if (pref !== 'auto') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => apply('auto')
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [pref])

  const setTheme = (next: ThemePref) => {
    localStorage.setItem(STORAGE_KEY, next)
    setPref(next)
  }

  return { pref, setTheme }
}
