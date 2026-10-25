import { useState, type FormEvent } from 'react'
import { Plus, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { Game } from '@/hooks/use-voting'
import { formatRupiah } from '@/lib/parse-amount'
import { cn } from '@/lib/utils'

type Props = {
  games: Game[]
  activeId: string | null
  onSelect: (id: string) => void
  onAdd: (name: string) => void
  onRemove: (id: string) => void
}

export function GameList({ games, activeId, onSelect, onAdd, onRemove }: Props) {
  const [name, setName] = useState('')
  const max = Math.max(1, ...games.map(g => g.total))

  const submit = (e: FormEvent) => {
    e.preventDefault()
    onAdd(name)
    setName('')
  }

  return (
    <section className="px-6 py-6">
      <h2 className="mb-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">Game</h2>

      {games.length === 0 ? (
        <p className="border border-dashed border-border px-4 py-10 text-center text-muted-foreground">
          Belum ada game. Tambah game dulu di bawah.
        </p>
      ) : (
        <ul className="space-y-2">
          {games.map(g => (
            <li
              key={g.id}
              className={cn(
                'relative flex items-center border bg-card transition-colors',
                g.id === activeId ? 'border-primary' : 'border-border hover:border-line-hi',
              )}
            >
              <div
                className="absolute inset-y-0 left-0 bg-primary/15 transition-[width] duration-300"
                style={{ width: `${Math.max(0, g.total / max) * 100}%` }}
                aria-hidden
              />
              <button
                type="button"
                onClick={() => onSelect(g.id)}
                aria-pressed={g.id === activeId}
                className="relative flex flex-1 items-center justify-between gap-4 px-4 py-4 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="flex items-center gap-3">
                  <span className="font-semibold">{g.name}</span>
                  {g.id === activeId && (
                    <Badge variant="outline" className="font-mono text-[10px] uppercase tracking-wider">
                      Aktif
                    </Badge>
                  )}
                </span>
                <span className="font-mono text-xl font-bold tabular-nums">{formatRupiah(g.total)}</span>
              </button>
              <Button
                variant="ghost"
                size="icon"
                className="relative mr-1 size-11 md:size-8"
                aria-label={`Hapus ${g.name}`}
                onClick={() => (g.total === 0 || confirm(`Hapus ${g.name}? Total ${formatRupiah(g.total)} ikut hilang.`)) && onRemove(g.id)}
              >
                <X />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={submit} className="mt-4 flex gap-2">
        <Input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Nama game"
          aria-label="Nama game baru"
          autoComplete="off"
          className="h-11 md:h-8"
        />
        <Button type="submit" variant="outline" className="font-mono text-[11px] uppercase tracking-wider h-11 md:h-8">
          <Plus data-icon="inline-start" />
          Tambah
        </Button>
      </form>
    </section>
  )
}
