import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="border-t border-neutral-200 dark:border-neutral-800">
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-3 px-4 py-7 sm:px-8">
        <div className="font-serif text-lg font-semibold">Down Memory Lane</div>
        <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-600 dark:text-neutral-400">
          <Link to="/share" className="underline-offset-2 hover:text-foreground hover:underline">
            Share (QR)
          </Link>
          <span>© {new Date().getFullYear()} Down Memory Lane</span>
        </div>
      </div>
    </footer>
  )
}
