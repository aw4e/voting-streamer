import { useCallback, useEffect, useState } from 'react'

export type Game = { id: string; name: string; total: number }
// One donation split over several games shares a batch, so Undo reverts it as one.
type Vote = { gameId: string; amount: number; batch?: string }
export type VotePart = { gameId: string; amount: number }
type State = {
  games: Game[]
  history: Vote[]
  activeId: string | null
  endsAt: number | null
}

const KEY = 'voting-streamer:v2'
const EMPTY: State = { games: [], history: [], activeId: null, endsAt: null }

function load(): State {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) ?? '{}')
    return Array.isArray(saved.games) && Array.isArray(saved.history) ? { games: saved.games, history: saved.history, activeId: saved.activeId ?? null, endsAt: saved.endsAt ?? null }
      : EMPTY
  } catch {
    return EMPTY
  }
}

// randomUUID needs HTTPS; the page may be opened over plain http on the LAN.
const newId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`

export function useVoting() {
  const [state, setState] = useState<State>(load)
  const [now, setNow] = useState(Date.now)

  useEffect(() => localStorage.setItem(KEY, JSON.stringify(state)), [state])

  // Keep a second tab (e.g. an OBS dock) in sync.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => e.key === KEY && setState(load())
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  useEffect(() => {
    if (state.endsAt === null) return
    const id = setInterval(() => setNow(Date.now()), 250)
    return () => clearInterval(id)
  }, [state.endsAt])

  const closed = state.endsAt !== null && now >= state.endsAt
  const secondsLeft = state.endsAt === null ? null : Math.max(0, Math.ceil((state.endsAt - now) / 1000))

  const addGame = useCallback((name: string) => {
    const trimmed = name.trim()
    if (!trimmed) return
    setState(s => {
      const game = { id: newId(), name: trimmed, total: 0 }
      return { ...s, games: [...s.games, game], activeId: s.activeId ?? game.id }
    })
  }, [])

  const removeGame = useCallback((id: string) => {
    setState(s => {
      const games = s.games.filter(g => g.id !== id)
      return {
        ...s,
        games,
        history: s.history.filter(v => v.gameId !== id),
        activeId: s.activeId === id ? (games[0]?.id ?? null) : s.activeId,
      }
    })
  }, [])

  const setActive = useCallback((id: string) => setState(s => ({ ...s, activeId: id })), [])

  const cycleActive = useCallback((dir: 1 | -1) => {
    setState(s => {
      if (!s.games.length) return s
      const i = s.games.findIndex(g => g.id === s.activeId)
      const next = s.games[(i + dir + s.games.length) % s.games.length]
      return { ...s, activeId: next.id }
    })
  }, [])

  const vote = useCallback(
    (parts: VotePart[]) => {
      // Date.now() not `closed`: the 250ms tick can lag behind the deadline.
      if ((state.endsAt !== null && Date.now() >= state.endsAt) || parts.length === 0) return false
      const batch = newId()
      setState(s => ({
        ...s,
        games: s.games.map(g => ({ ...g, total: g.total + parts.filter(p => p.gameId === g.id).reduce((n, p) => n + p.amount, 0) })),
        history: [...s.history, ...parts.map(p => ({ ...p, batch }))],
      }))
      return true
    },
    [state.endsAt],
  )

  const undo = useCallback(() => {
    setState(s => {
      const last = s.history.at(-1)
      if (!last) return s
      const undone = s.history.filter(v => (last.batch ? v.batch === last.batch : v === last))
      return {
        ...s,
        games: s.games.map(g => ({ ...g, total: g.total - undone.filter(v => v.gameId === g.id).reduce((n, v) => n + v.amount, 0) })),
        history: s.history.filter(v => !undone.includes(v)),
      }
    })
  }, [])

  const reset = useCallback(
    () =>
      setState(s => ({ ...s, games: s.games.map(g => ({ ...g, total: 0 })), history: [], endsAt: null })),
    [],
  )

  const startTimer = useCallback((minutes: number) => {
    setNow(Date.now())
    setState(s => ({ ...s, endsAt: Date.now() + minutes * 60_000 }))
  }, [])

  const stopTimer = useCallback(() => setState(s => ({ ...s, endsAt: null })), [])

  return {
    ...state,
    closed,
    secondsLeft,
    canUndo: state.history.length > 0,
    addGame,
    removeGame,
    setActive,
    cycleActive,
    vote,
    undo,
    reset,
    startTimer,
    stopTimer,
  }
}
