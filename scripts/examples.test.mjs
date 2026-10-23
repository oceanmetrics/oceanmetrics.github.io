// data/examples.json: the example links of the front page's doors and /docs/ "Maps". the shape (three doors, five maps
// with one sentence each, every url on oceanmetrics.io) always; that every link answers 200 only online (skipped with
// OM_OFFLINE=1, or when oceanmetrics.io cannot be reached at all). a url's fragment is never sent, so a viewer link is
// checked as its page.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const ex = JSON.parse(readFileSync(new URL('../data/examples.json', import.meta.url), 'utf8'))
const all = [...Object.values(ex.doors), ...ex.maps]

test('three doors, each with a label and a link', () => {
  assert.deepEqual(Object.keys(ex.doors), ['places', 'indicators', 'atlas'])
  for (const d of Object.values(ex.doors)) assert.ok(d.label && d.url)
})

test('the indicators door is Then vs Now at the Channel Islands, the same link as the compare map', () => {
  assert.equal(ex.doors.indicators.url, ex.maps.find((m) => m.id === 'compare').url)
  assert.match(ex.doors.indicators.url, /&t2=2016-07/)
  assert.match(ex.doors.indicators.url, /&place=NMS:CINMS/)
})

test('five maps in the viewer\'s Try these order, one sentence each', () => {
  assert.deepEqual(ex.maps.map((m) => m.id), ['layer', 'compare', 'anomaly', 'range', 'place'])
  for (const m of ex.maps) {
    assert.ok(m.label, m.id)
    assert.match(m.sentence, /^[A-Z][^]*\.$/, m.id)
    assert.ok(m.url.startsWith('https://oceanmetrics.io/indicators/#view='), m.id)
  }
})

test('every link is https on oceanmetrics.io', () => {
  for (const x of all) assert.equal(new URL(x.url).host, 'oceanmetrics.io', x.url)
})

const reachable = async () => {
  if (process.env.OM_OFFLINE === '1') return false
  try { await fetch('https://oceanmetrics.io/', { method: 'HEAD', signal: AbortSignal.timeout(10000) }); return true } catch { return false }
}

test('every link answers 200', { skip: !(await reachable()) && 'offline (OM_OFFLINE=1 or oceanmetrics.io unreachable)' }, async () => {
  for (const url of new Set(all.map((x) => x.url.split('#')[0]))) {
    const r = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(20000) })
    assert.equal(r.status, 200, url)
  }
})
