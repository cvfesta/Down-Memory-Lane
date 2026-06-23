import { Button } from '@heroui/react'
import { useNavigate } from 'react-router-dom'
import { ThemeMenu } from './ThemeMenu'

export function Header() {
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-30 border-b border-neutral-200 bg-[#f5f0e6]/85 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/85">
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-8">
        <button onClick={() => navigate('/')} className="text-left">
          <div className="font-serif text-2xl font-semibold leading-none">Down Memory Lane</div>
          <div className="mt-1 text-[10px] uppercase tracking-[0.22em] text-neutral-600 dark:text-neutral-400">Antiques &amp; Curiosities</div>
        </button>
        <nav className="flex items-center gap-1.5">
          <Button variant="ghost" size="sm" onPress={() => navigate('/')}>
            Browse
          </Button>
          <Button variant="ghost" size="sm" onPress={() => navigate('/about')}>
            About
          </Button>
          <Button variant="ghost" size="sm" onPress={() => navigate('/contact')}>
            Contact
          </Button>
          <ThemeMenu />
        </nav>
      </div>
    </header>
  )
}
