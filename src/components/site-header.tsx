import { Zap } from 'lucide-react'

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background">
      <div className="mx-auto flex h-14 w-full max-w-[960px] items-center border-x border-border px-6">
        <span className="flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-widest">
          <Zap className="size-4 text-primary" aria-hidden />
          Vote Donasi
        </span>
      </div>
    </header>
  )
}
