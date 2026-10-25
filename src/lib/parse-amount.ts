const UNITS: Record<string, number> = { ribu: 1e3, rb: 1e3, k: 1e3, juta: 1e6, jt: 1e6 }

/** Rupiah per 1 unit of each ISO 4217 code, e.g. { USD: 18060.4, MYR: 4420.1 }. */
export type Rates = Record<string, number>

/** Shown in the tooltip and Kurs panel; every ISO code works, these are just the usual ones. */
export const POPULAR = ['USD', 'MYR', 'JPY', 'SGD', 'EUR']

export const ISO_CODES = new Set(Intl.supportedValuesOf('currency'))

const names = new Intl.DisplayNames(['id'], { type: 'currency' })
/** Indonesian name, e.g. "Dolar Singapura". */
export const currencyName = (code: string) => names.of(code) ?? code

// Short names and symbols people actually type. Every ISO code ("sgd") and full name ("dolar singapura") is also an alias.
const EXTRA_ALIASES: Record<string, string> = {
  dolar: 'USD', dollar: 'USD', $: 'USD',
  ringgit: 'MYR', rm: 'MYR',
  yen: 'JPY', '¥': 'JPY',
  euro: 'EUR', '€': 'EUR',
  poundsterling: 'GBP', pound: 'GBP', '£': 'GBP',
  won: 'KRW', '₩': 'KRW',
  yuan: 'CNY', rmb: 'CNY',
  baht: 'THB', '฿': 'THB',
  riyal: 'SAR', dirham: 'AED',
  rupee: 'INR', '₹': 'INR',
  peso: 'PHP', '₱': 'PHP',
  franc: 'CHF', dong: 'VND', '₫': 'VND',
  rubel: 'RUB', ruble: 'RUB', '₽': 'RUB',
  lira: 'TRY', '₺': 'TRY',
  rand: 'ZAR', '₪': 'ILS', '₦': 'NGN', '₴': 'UAH',
}

// Longest alias first so a short one ("rm") never shadows a longer one.
const ALIASES = Object.entries({
  ...Object.fromEntries([...ISO_CODES].map(c => [normalize(currencyName(c)).s, c])),
  ...Object.fromEntries([...ISO_CODES].map(c => [c.toLowerCase(), c])),
  ...EXTRA_ALIASES,
}).sort((a, b) => b[0].length - a[0].length)

// Keeps sums far below Number.MAX_SAFE_INTEGER.
const MAX_AMOUNT = 1e12

const UNIT_PART = /(\d+(?:[.,]\d+)?)(ribu|rb|k|juta|jt)/y

/** Splits "5dolar", "dolar5", "rm10", "¥1.500" into the number text and its ISO code (null = rupiah). */
function splitCurrency(s: string): [string, string | null] {
  for (const [alias, code] of ALIASES) {
    if (s.endsWith(alias)) return [s.slice(0, -alias.length), code]
    if (s.startsWith(alias)) return [s.slice(alias.length), code]
  }
  return [s, null]
}

function normalize(raw: string) {
  const compact = raw.toLowerCase().replace(/rp\.?|idr/g, '').replace(/\s+/g, '')
  return compact.startsWith('-') ? { sign: -1, s: compact.slice(1) } : { sign: 1, s: compact }
}

/** ISO code the text asks for ("5 dolar" -> "USD"), or null for plain rupiah. */
export const currencyOf = (raw: string) => splitCurrency(normalize(raw).s)[1]

// Rupiah: "." and "," are thousand separators. Foreign: they are decimals, except "1.500" / "1,000" style groups.
function parseValue(s: string, foreign: boolean): number | null {
  if (/^[\d.,]+$/.test(s)) {
    if (!foreign || /^\d{1,3}([.,]\d{3})+$/.test(s)) return Number(s.replace(/[.,]/g, ''))
    return /^\d+([.,]\d+)?$/.test(s) ? Number(s.replace(',', '.')) : null
  }
  let total = 0
  let pos = 0
  while (pos < s.length) {
    UNIT_PART.lastIndex = pos
    const m = UNIT_PART.exec(s)
    if (!m) return null
    total += parseFloat(m[1].replace(',', '.')) * UNITS[m[2]]
    pos = UNIT_PART.lastIndex
  }
  return total
}

/**
 * Returns whole rupiah, or null if unparseable or the currency has no rate.
 * "10ribu" -> 10000, "1,5jt" -> 1500000, "2jt500rb" -> 2500000, "Rp 10.000" -> 10000, "-10rb" -> -10000,
 * "5 dolar" -> 5 * rates.USD, "rm10" -> 10 * rates.MYR, "100 krw" -> 100 * rates.KRW.
 */
export function parseAmount(raw: string, rates: Rates = {}): number | null {
  const { sign, s } = normalize(raw)
  const [body, code] = splitCurrency(s)
  if (!body) return null
  const rate = code === null ? 1 : rates[code]
  if (!rate) return null

  const value = parseValue(body, code !== null)
  if (value === null) return null
  const rupiah = Math.round(value * rate)
  return rupiah > 0 && rupiah <= MAX_AMOUNT ? sign * rupiah : null
}

const rupiah = new Intl.NumberFormat('id-ID')

/** Rate for display: keeps decimals for small rates (1 JPY = Rp 115,19). */
export const formatRate = (n: number) => `Rp ${n.toLocaleString('id-ID', { maximumFractionDigits: n < 1000 ? 2 : 0 })}`

export const formatRupiah = (n: number) => `${n < 0 ? '-' : ''}Rp ${rupiah.format(Math.abs(n))}`
