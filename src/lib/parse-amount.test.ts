import assert from 'node:assert/strict'
import { test } from 'node:test'
import { parseAmount, type Rates } from './parse-amount.ts'

const rates: Rates = { USD: 16000, MYR: 3800, JPY: 100, SGD: 12000, EUR: 18000, KRW: 12, THB: 500 }

test('parseAmount', () => {
  const cases: [string, number | null][] = [
    ['10ribu', 10000],
    ['10rb', 10000],
    ['10k', 10000],
    ['1jt', 1000000],
    ['1juta', 1000000],
    ['1,5jt', 1500000],
    ['1.5jt', 1500000],
    ['2jt500rb', 2500000],
    ['1miliar', 1e9],
    ['1,5milyar', 1.5e9],
    ['1miliar500jt', 1.5e9],
    ['2m', null],
    ['1triliun', 1e12],
    ['2triliun', null],
    ['132131', 132131],
    ['Rp 10.000', 10000],
    ['-10rb', -10000],
    ['-1,5jt', -1500000],
    ['-Rp 5.000', -5000],
    ['-', null],
    ['--5', null],
    ['999999999999999999999', null],
    ['0', null],
    ['abc', null],
    ['10ribux', null],
    ['', null],
    ['1 ringgit', 3800],
    ['1 dolar', 16000],
    ['1 yen', 100],
    ['2,5 dolar', 40000],
    ['$5', 80000],
    ['rm10', 38000],
    ['¥1.500', 150000],
    ['1,000 usd', 16000000],
    ['10k yen', 1000000],
    ['-1 dolar', -16000],
    ['idr 5000', 5000],
    ['5 sgd', 60000],
    ['EUR 2', 36000],
    ['€5', 90000],
    ['100 won', 1200],
    ['5 dolar singapura', 60000],
    ['2 baht thailand', 1000],
    ['1 dolar amerika serikat', 16000],
    ['1 aud', null],
    ['1 euros', null],
    ['dolar', null],
    ['1.5.5 yen', null],
  ]
  for (const [input, expected] of cases) assert.equal(parseAmount(input, rates), expected, input)
})
