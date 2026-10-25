import assert from 'node:assert/strict'
import { test } from 'node:test'
import type { Rates } from './parse-amount.ts'
import { parseVote } from './parse-vote.ts'

const rates: Rates = { USD: 16000 }
const games = [
  { id: 'a', name: 'Game A' },
  { id: 'b', name: 'Game B' },
  { id: 'c', name: 'Elden Ring' },
]

const split = (input: string, active: string | null = 'a') => {
  const r = parseVote(input, rates, games, active)
  assert.ok(r && 'parts' in r, `${input} -> ${JSON.stringify(r)}`)
  return r.parts.map(p => `${p.gameId}:${p.amount}`).join(' ')
}
const fail = (input: string, active: string | null = 'a') => {
  const r = parseVote(input, rates, games, active)
  assert.ok(r && 'error' in r, `${input} -> ${JSON.stringify(r)}`)
  return r.error
}

test('whole amount goes to the active game', () => {
  assert.equal(split('10rb', 'b'), 'b:10000')
  assert.equal(parseVote('', rates, games, 'a'), null)
  assert.match(fail('10rb', null), /game dulu/)
})

test('percent split', () => {
  assert.equal(split('50rb 80% a 20% b'), 'a:40000 b:10000')
  assert.equal(split('50rb 80% ke a, 20% ke b'), 'a:40000 b:10000')
  assert.equal(split('50rb 80% game a dan 20% elden'), 'a:40000 c:10000')
  assert.equal(split('50rb 80% 1 20% 2'), 'a:40000 b:10000')
  assert.equal(split('50rb 100% elden ring'), 'c:50000')
  assert.equal(split('5 dolar 50% a 50% b'), 'a:40000 b:40000')
  assert.equal(split('-50rb 50% a 50% b'), 'a:-25000 b:-25000')
})

test('parts always add up to the total', () => {
  assert.equal(split('100 33% a 33% b 34% elden'), 'a:33 b:33 c:34')
  assert.equal(split('100 33,3% a 33,3% b 33,4% elden'), 'a:33 b:33 c:34')
  assert.equal(split('1 70% a 30% b'), 'a:1') // zero parts are dropped
  const sum = split('99999 33.3% a 33.3% b 33.4% elden').split(' ').reduce((s, p) => s + Number(p.split(':')[1]), 0)
  assert.equal(sum, 99999)
})

test('errors', () => {
  assert.match(fail('50rb 80% a 10% b'), /harus 100% \(sekarang 90%\)/)
  assert.match(fail('50rb 80% x 20% b'), /"x" tidak ditemukan/)
  assert.match(fail('50rb 80% game 20% b'), /lebih dari satu/)
  assert.match(fail('50rb 80% 9 20% b'), /nomor 9/)
  assert.match(fail('50rb 80% a 20%'), /nama game setelah 20%/)
  assert.match(fail('abc 50% a 50% b'), /Format tidak dikenali/)
  assert.match(fail('5 eur 50% a 50% b'), /Kurs EUR belum tersedia/)
})
