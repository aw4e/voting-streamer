import { useRef } from 'react'
import { GameList } from '@/components/game-list'
import { SiteHeader } from '@/components/site-header'
import { TimerPanel } from '@/components/timer-panel'
import { RatesPanel } from '@/components/rates-panel'
import { VoteActions } from '@/components/vote-actions'
import { VoteInput } from '@/components/vote-input'
import { useRates } from '@/hooks/use-rates'
import { useVoting } from '@/hooks/use-voting'

export default function App() {
  const v = useVoting()
  const fx = useRates()
  const inputRef = useRef<HTMLInputElement>(null)
  // Deferred so the input is already enabled again after the state change.
  const refocus = () => setTimeout(() => inputRef.current?.focus(), 0)
  const active = v.games.find(g => g.id === v.activeId) ?? null

  const top = Math.max(0, ...v.games.map(g => g.total))
  const winner = top > 0 ? v.games.filter(g => g.total === top).map(g => g.name).join(' / ') : null

  const placeholder = v.closed
    ? 'Voting sudah ditutup'
    : active
      ? '10rb · 1jt · 132131'
      : 'Tambah game dulu'

  return (
    <div className="flex min-h-screen flex-col text-sm">
      <SiteHeader />
      <main className="mx-auto w-full max-w-[960px] min-w-0 flex-1 border-x border-border">
        <TimerPanel
          secondsLeft={v.secondsLeft}
          closed={v.closed}
          winner={winner}
          onStart={m => (v.startTimer(m), refocus())}
          onStop={() => (v.stopTimer(), refocus())}
        />
        <VoteInput
          inputRef={inputRef}
          rates={fx.rates}
          disabled={v.closed || !active}
          placeholder={placeholder}
          games={v.games}
          activeId={v.activeId}
          onVote={v.vote}
          onCycle={v.cycleActive}
        />
        <GameList
          games={v.games}
          activeId={v.activeId}
          onSelect={id => (v.setActive(id), refocus())}
          onAdd={v.addGame}
          onRemove={v.removeGame}
        />
        <RatesPanel fx={fx} />
        <VoteActions
          canUndo={v.canUndo}
          onUndo={() => (v.undo(), refocus())}
          onReset={() => (v.reset(), refocus())}
        />
      </main>
    </div>
  )
}
