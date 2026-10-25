import { useCallback, useEffect, useState } from 'react'
import { fetchRates, type RateTable } from '@/lib/fetch-rates'

type Cached = RateTable & { fetchedAt: number }
type Status = 'loading' | 'ok' | 'error'

const KEY = 'voting-streamer:rates'
const REFRESH_MS = 15 * 60_000

function load(): Cached | null {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) ?? 'null')
    return saved && typeof saved.rates === 'object' ? saved : null
  } catch {
    return null
  }
}

/** Live rates; the cached copy only fills in until the first fetch lands or while offline. */
export function useRates() {
  const [data, setData] = useState<Cached | null>(load)
  const [status, setStatus] = useState<Status>('loading')

  const pull = useCallback(
    () =>
      fetchRates()
        .then(table => {
          const cached = { ...table, fetchedAt: Date.now() }
          localStorage.setItem(KEY, JSON.stringify(cached))
          setData(cached)
          setStatus('ok')
        })
        .catch(() => setStatus('error')),
    [],
  )

  useEffect(() => {
    pull()
    const id = setInterval(pull, REFRESH_MS)
    return () => clearInterval(id)
  }, [pull])

  const refresh = useCallback(() => {
    setStatus('loading')
    pull()
  }, [pull])

  return { rates: data?.rates ?? {}, date: data?.date ?? null, fetchedAt: data?.fetchedAt ?? null, status, refresh }
}
