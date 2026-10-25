import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

const MAX_MINUTES = 24 * 60

function clock(total: number) {
  const h = Math.floor(total / 3600)
  const m = String(Math.floor((total % 3600) / 60)).padStart(2, '0')
  const s = String(total % 60).padStart(2, '0')
  return h ? `${h}:${m}:${s}` : `${m}:${s}`
}

type Props = {
  secondsLeft: number | null
  closed: boolean
  winner: string | null
  onStart: (minutes: number) => void
  onStop: () => void
}

export function TimerPanel({ secondsLeft, closed, winner, onStart, onStop }: Props) {
  const [minutes, setMinutes] = useState('')

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const m = parseFloat(minutes)
    if (m > 0 && m <= MAX_MINUTES) onStart(m)
  }

  return (
    <section className="flex flex-wrap items-center justify-between gap-4 border-b border-border px-6 py-5">
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Waktu voting</p>
        <p
          role="timer"
          className={cn('font-mono text-3xl font-bold tabular-nums', closed && 'text-destructive')}
        >
          {secondsLeft === null ? 'Tanpa batas' : closed ? 'Ditutup' : clock(secondsLeft)}
        </p>
        {closed && (
          <p className="mt-1 text-sm text-muted-foreground">
            {winner ? `Menang: ${winner}` : 'Belum ada vote masuk'}
          </p>
        )}
      </div>
      <form onSubmit={submit} className="flex items-center gap-2">
        <Input
          type="number"
          min="0.1"
          max={MAX_MINUTES}
          step="any"
          value={minutes}
          onChange={e => setMinutes(e.target.value)}
          placeholder="menit"
          aria-label="Durasi voting dalam menit"
          className="h-11 w-24 font-mono md:h-8"
        />
        <Button type="submit" variant="outline" className="font-mono text-[11px] uppercase tracking-wider h-11 md:h-8">
          Mulai
        </Button>
        <Button
          type="button"
          variant="ghost"
          disabled={secondsLeft === null}
          onClick={onStop}
          className="font-mono text-[11px] uppercase tracking-wider h-11 md:h-8"
        >
          Hentikan
        </Button>
      </form>
    </section>
  )
}
