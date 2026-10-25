import { useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { useRates } from '@/hooks/use-rates'
import { currencyName, formatRate } from '@/lib/parse-amount'
import { cn } from '@/lib/utils'

const time = new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit' })

export function RatesPanel({ fx }: { fx: ReturnType<typeof useRates> }) {
  const { rates, date, fetchedAt, status, refresh } = fx
  const [query, setQuery] = useState('')
  const q = query.trim().toLowerCase()

  const all = Object.entries(rates)
    .map(([code, rate]) => ({ code, rate, name: currencyName(code) }))
    .sort((a, b) => a.code.localeCompare(b.code))
  const shown = all.filter(c => !q || c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q))

  const message =
    status === 'error'
      ? date
        ? `Gagal ambil kurs terbaru. Memakai kurs tersimpan per ${date}.`
        : 'Gagal ambil kurs. Mata uang asing belum bisa dipakai.'
      : date
        ? `Kurs per ${date}${fetchedAt ? ` · dicek ${time.format(fetchedAt)}` : ''} · otomatis tiap 15 menit`
        : 'Memuat kurs terbaru…'

  return (
    <section className="border-t border-border px-6 py-6">
      <div className="mb-3 flex items-center justify-between gap-4">
        <h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Kurs · basis IDR · {all.length} mata uang
        </h2>
        <Button
          variant="outline"
          onClick={refresh}
          disabled={status === 'loading'}
          className="h-11 font-mono text-[11px] uppercase tracking-wider md:h-8"
        >
          <RefreshCw className={cn(status === 'loading' && 'animate-spin')} data-icon="inline-start" />
          Perbarui
        </Button>
      </div>
      <p role="status" className={cn('mb-4 text-sm', status === 'error' ? 'text-destructive' : 'text-muted-foreground')}>
        {message}
      </p>

      <Input
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Cari kode atau nama: sgd, won, dirham…"
        aria-label="Cari mata uang"
        autoComplete="off"
        className="mb-2 h-11 md:h-8"
      />
      <ul className="max-h-80 overflow-y-auto border border-border">
        {shown.map(c => (
          <li key={c.code} className="flex items-baseline gap-3 border-b border-border px-3 py-2 last:border-b-0">
            <span className="w-10 shrink-0 font-mono text-primary">{c.code}</span>
            <span className="min-w-0 flex-1 truncate text-muted-foreground">{c.name}</span>
            <span className="shrink-0 font-mono tabular-nums">{formatRate(c.rate)}</span>
          </li>
        ))}
        {shown.length === 0 && (
          <li className="px-3 py-6 text-center text-muted-foreground">
            {all.length ? 'Tidak ada mata uang yang cocok.' : 'Belum ada kurs.'}
          </li>
        )}
      </ul>
    </section>
  )
}
