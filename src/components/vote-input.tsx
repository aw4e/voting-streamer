import { useState, type KeyboardEvent, type RefObject } from 'react'
import { Info } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import type { Game, VotePart } from '@/hooks/use-voting'
import { formatRate, formatRupiah, POPULAR, type Rates } from '@/lib/parse-amount'
import { parseVote, type Part, type VoteParse } from '@/lib/parse-vote'
import { cn } from '@/lib/utils'

type Props = {
  inputRef: RefObject<HTMLInputElement | null>
  rates: Rates
  disabled: boolean
  placeholder: string
  games: Game[]
  activeId: string | null
  onVote: (parts: VotePart[]) => boolean
  onCycle: (dir: 1 | -1) => void
}

const HINT = 'Enter = tambah · -50rb = kurangi · 50rb 80% a 20% b = bagi persen · ↑↓ ganti game'

function previewText(ok: Extract<VoteParse, { parts: Part[] }>) {
  const [first] = ok.parts
  if (ok.parts.length === 1 && !ok.code && first.amount === ok.total) return `${formatRupiah(ok.total)} → ${first.name}`
  const split = ok.parts.map(p => `${p.name} ${formatRupiah(p.amount)}`).join(' · ')
  return `${ok.code ? ok.code + ' · ' : ''}${formatRupiah(ok.total)} → ${split}`
}

export function VoteInput({ inputRef, rates, disabled, placeholder, games, activeId, onVote, onCycle }: Props) {
  const [value, setValue] = useState('')
  const trimmed = value.trim()
  const result = parseVote(trimmed, rates, games, activeId)
  const ok = result && 'parts' in result ? result : null

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      onCycle(e.key === 'ArrowDown' ? 1 : -1)
    } else if (e.key === 'Enter' && ok && onVote(ok.parts)) {
      setValue('')
    }
  }

  return (
    <section className="border-b border-border px-6 py-6">
      <div className="flex items-center gap-3">
        <label htmlFor="amount" className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Nominal donasi
        </label>
        <Tooltip>
          <TooltipTrigger
            aria-label="Info mata uang"
            className="inline-flex items-center gap-1 border border-border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground outline-none hover:border-line-hi hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            IDR <Info className="size-3" aria-hidden />
          </TooltipTrigger>
          <TooltipContent side="bottom" align="start" className="block">
            <p className="mb-2 font-semibold">Tanpa kode = IDR (Rupiah)</p>
            <ul className="space-y-1 font-mono">
              {POPULAR.map(c => (
                <li key={c}>
                  <span className="text-primary">{c}</span> → {rates[c] ? formatRate(rates[c]) : 'belum ada kurs'}
                </li>
              ))}
            </ul>
            <p className="mt-2 text-muted-foreground">Semua mata uang bisa: 5 sgd, 100 krw, 2 baht thailand, €5. Daftar lengkap ada di panel Kurs.</p>
          </TooltipContent>
        </Tooltip>
      </div>
      <Input
        id="amount"
        ref={inputRef}
        autoFocus
        autoComplete="off"
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        onChange={e => setValue(e.target.value)}
        onKeyDown={onKeyDown}
        aria-invalid={result !== null && 'error' in result}
        className="mt-2 h-16 px-4 font-mono text-2xl font-bold tabular-nums md:text-3xl"
      />
      <p
        aria-live="polite"
        className={cn(
          'mt-2 min-h-5 font-mono text-sm tabular-nums',
          ok ? 'text-ok' : result ? 'text-destructive' : 'text-muted-foreground',
        )}
      >
        {!result ? HINT : 'error' in result ? result.error : previewText(result)}
      </p>
    </section>
  )
}
