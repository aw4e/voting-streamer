import { ISO_CODES, type Rates } from './parse-amount'

export type RateTable = { rates: Rates; date: string }

async function getJson(url: string) {
  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) throw new Error(`${url} -> ${res.status}`)
  return res.json()
}

const fiatOnly = (entries: [string, number][]): Rates =>
  Object.fromEntries(entries.filter(([code, rate]) => ISO_CODES.has(code) && rate > 0 && Number.isFinite(rate)))

async function fromCurrencyApi(): Promise<RateTable> {
  const j = await getJson('https://latest.currency-api.pages.dev/v1/currencies/idr.json')
  // Source quotes units per 1 IDR; we want rupiah per 1 unit.
  const rates = fiatOnly(Object.entries<number>(j.idr).map(([c, perIdr]) => [c.toUpperCase(), 1 / perIdr]))
  if (!rates.USD) throw new Error('currency-api: no USD')
  return { rates, date: j.date }
}

async function fromErApi(): Promise<RateTable> {
  const j = await getJson('https://open.er-api.com/v6/latest/USD')
  // Base USD (not IDR): IDR-base rates are rounded too coarsely (0.000055/IDR is off by ~0.7%).
  const idrPerUsd: number = j.rates?.IDR
  if (j.result !== 'success' || !idrPerUsd) throw new Error('er-api: bad response')
  const rates = fiatOnly(Object.entries<number>(j.rates).map(([c, perUsd]) => [c, idrPerUsd / perUsd]))
  return { rates, date: new Date(j.time_last_update_unix * 1000).toISOString().slice(0, 10) }
}

export const fetchRates = () => fromCurrencyApi().catch(fromErApi)
