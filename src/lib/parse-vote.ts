import { currencyOf, parseAmount, type Rates } from './parse-amount.ts'

type GameRef = { id: string; name: string }
export type Part = { gameId: string; name: string; amount: number }
export type VoteParse = { parts: Part[]; total: number; code: string | null } | { error: string }

const PERCENT = /(\d+(?:[.,]\d+)?)\s*%/g

function amountOrError(text: string, rates: Rates): { total: number; code: string | null } | { error: string } {
  const total = parseAmount(text, rates)
  const code = currencyOf(text)
  if (total !== null) return { total, code }
  return { error: code && !rates[code] ? `Kurs ${code} belum tersedia` : 'Format tidak dikenali' }
}

// "1" -> 1st game, then exact name, word prefix ("a" -> "Game A"), substring. Must be unique.
function findGame(token: string, games: GameRef[]): GameRef | { error: string } {
  const t = token.toLowerCase()
  if (/^\d+$/.test(t)) return games[Number(t) - 1] ?? { error: `Game nomor ${t} tidak ada` }

  const lower = games.map(g => ({ g, name: g.name.toLowerCase() }))
  const stages = [
    (n: string) => n === t,
    (n: string) => n.split(/\s+/).some(w => w.startsWith(t)),
    (n: string) => n.includes(t),
  ]
  for (const stage of stages) {
    const hits = lower.filter(x => stage(x.name))
    if (hits.length === 1) return hits[0].g
    if (hits.length > 1) return { error: `"${token}" cocok dengan lebih dari satu game` }
  }
  return { error: `Game "${token}" tidak ditemukan` }
}

/** Splits `total` by percentages; whole rupiah, and the parts always add up to `total` (largest remainder). */
function allocate(total: number, percents: number[]): number[] {
  const abs = Math.abs(total)
  const exact = percents.map(p => (abs * p) / 100)
  const parts = exact.map(Math.floor)
  let left = abs - parts.reduce((a, b) => a + b, 0)
  const byRemainder = exact.map((x, i) => [x - parts[i], i]).sort((a, b) => b[0] - a[0])
  for (const [, i] of byRemainder) {
    if (left-- <= 0) break
    parts[i]++
  }
  return parts.map(p => Math.sign(total) * p)
}

/**
 * "10rb" -> whole amount to the active game.
 * "50rb 80% alpha 20% beta" (also "80% ke alpha, 20% ke beta", or game numbers "80% 1 20% 2") -> split by percent.
 * Returns null for empty input.
 */
export function parseVote(raw: string, rates: Rates, games: GameRef[], activeId: string | null): VoteParse | null {
  const text = raw.trim()
  if (!text) return null

  const marks = [...text.matchAll(PERCENT)]
  if (marks.length === 0) {
    const active = games.find(g => g.id === activeId)
    if (!active) return { error: 'Tambah atau pilih game dulu' }
    const a = amountOrError(text, rates)
    if ('error' in a) return a
    return { ...a, parts: [{ gameId: active.id, name: active.name, amount: a.total }] }
  }

  const a = amountOrError(text.slice(0, marks[0].index), rates)
  if ('error' in a) return a

  const percents: number[] = []
  const targets: GameRef[] = []
  for (const [i, m] of marks.entries()) {
    const end = marks[i + 1]?.index ?? text.length
    const name = text
      .slice(m.index + m[0].length, end)
      .replace(/^\s*(?:ke|untuk)\s+/i, '')
      .replace(/\s*(?:[,;&+]|\bdan)\s*$/i, '')
      .trim()
    if (!name) return { error: `Tulis nama game setelah ${m[0].trim()}` }
    const game = findGame(name, games)
    if ('error' in game) return game
    percents.push(parseFloat(m[1].replace(',', '.')))
    targets.push(game)
  }

  const sum = percents.reduce((x, y) => x + y, 0)
  if (Math.abs(sum - 100) > 1e-9) return { error: `Total persen harus 100% (sekarang ${+sum.toFixed(4)}%)` }

  const amounts = allocate(a.total, percents)
  const parts = targets.flatMap((g, i) => (amounts[i] ? [{ gameId: g.id, name: g.name, amount: amounts[i] }] : []))
  return { ...a, parts }
}
