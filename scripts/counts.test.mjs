// node --test of scripts/counts.mjs on the bucket-shaped fixtures in scripts/fixtures/counts/ (no network)
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, readFile, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  buildCounts, countCollections, countIndicators, countLayers, coveragePlaces, dirReader, entryPlace, feedEntries,
  main, unxml, KEYS,
} from './counts.mjs'

const FIX = join(dirname(fileURLToPath(import.meta.url)), 'fixtures', 'counts')
const fix = async k => readFile(join(FIX, k), 'utf8')

test('places door: layer rows and the sum of their n', async () => {
  assert.deepEqual(countLayers(JSON.parse(await fix(KEYS.layers))), { layers: 3, places: 381, updated: '2026-10-22T20:04:04Z' })
  // a row without n counts as a layer, adds no places
  assert.deepEqual(countLayers({ layers: [{ n: 2 }, {}] }), { layers: 2, places: 2, updated: null })
  assert.throws(() => countLayers({ layers: [] }), /no layer rows/)
})

test('indicators door: the manifest indicators', async () => {
  assert.deepEqual(countIndicators(JSON.parse(await fix(KEYS.indicators))), { indicators: 2, updated: '2026-10-23T13:22:57Z', version: '2026.10.23' })
  assert.throws(() => countIndicators({}), /no indicators/)
})

test('coverage: distinct place ids, first name wins', () => {
  const { places, names } = coveragePlaces([
    { place_id: 'a', place_name: 'A' }, { place_id: 'a', place_name: 'A again' }, { place_id: 'b', place_name: null }, { place_id: null },
  ])
  assert.equal(places, 2)
  assert.equal(names.get('a'), 'A')
  assert.equal(names.get('b'), null)
})

test('atlas door: child links only', async () => {
  assert.deepEqual(countCollections(JSON.parse(await fix(KEYS.atlas))), { collections: 2, updated: '2026-10-16T13:51:30Z' })
  assert.throws(() => countCollections({ links: [{ rel: 'self' }] }), /no child collections/)
})

test('unxml: the five entities and character references', () => {
  assert.equal(unxml('a &amp; b &lt;c&gt; &quot;d&quot; &apos;e&apos; &#8211; &#x2014;'), 'a & b <c> "d" \'e\' – —')
})

test('entryPlace: the link fragment, else the entry id', () => {
  assert.equal(entryPlace('https://oceanmetrics.io/indicators/#view=place&place=NMS:CINMS&ind=obis:bp', ''), 'NMS:CINMS')
  assert.equal(entryPlace('https://oceanmetrics.io/indicators/', 'tag:oceanmetrics.io,2026:changes/2026-10-23/mr_eez:8456/mr_eez/obis:bp/new'), 'mr_eez:8456')
  assert.equal(entryPlace(null, 'tag:x'), null)
})

test('feedEntries: the newest five, newest day first, feed order within a day', async () => {
  const names = new Map([['NMS:CBNMS', 'Cordell Bank National Marine Sanctuary']])
  const e = feedEntries(await fix(KEYS.feed), { names })
  assert.equal(e.length, 5)
  assert.deepEqual(e.map(x => [x.date, x.place_id]), [
    ['2026-10-23', 'NMS:CBNMS'], ['2026-10-23', 'NMS:CINMS'], ['2026-10-23', 'mr_eez:8456'], ['2026-10-22', 'NMS:MBNMS'], ['2026-10-21', 'NMS:OCNMS'],
  ])
  assert.deepEqual(e[0], {
    title: 'OBIS Berger-Parker dominance in Cordell Bank National Marine Sanctuary has its first value: 0.096 for 2025.',
    place_id: 'NMS:CBNMS', place_name: 'Cordell Bank National Marine Sanctuary', date: '2026-10-23', kind: 'new',
    href: 'https://oceanmetrics.io/indicators/#view=place&place=NMS:CBNMS&coll=places&ind=obis:bp',
  })
  assert.equal(e[1].title, 'OBIS Berger-Parker dominance in Channel Islands & Santa Barbara – a test has its first value: 0.115 for 2025.')
  assert.equal(e[1].place_name, null) // not in names
  assert.equal(e[2].href, 'https://oceanmetrics.io/indicators/') // a link without rel is the alternate
  assert.equal(e[3].kind, 'status')
  assert.equal(feedEntries('<feed></feed>').length, 0)
})

test('buildCounts: every number from the fixture bucket, coverage read with hyparquet', async () => {
  const host = 'https://s3.us-east-1.amazonaws.com/oceanmetrics.io-public'
  const c = await buildCounts(dirReader(FIX), { host, now: new Date('2026-10-23T15:00:00Z') })
  assert.equal(c.generated, '2026-10-23T15:00:00.000Z')
  assert.deepEqual(c.places, { layers: 3, places: 381, updated: '2026-10-22T20:04:04Z' })
  assert.deepEqual(c.indicators, { indicators: 2, updated: '2026-10-23T13:22:57Z', version: '2026.10.23', places: 4 })
  assert.deepEqual(c.atlas, { collections: 2, updated: '2026-10-16T13:51:30Z' })
  assert.equal(c.changes.checked, '2026-10-23T13:23:39Z')
  assert.equal(c.changes.feed, `${host}/indicators/feeds/all.xml`)
  assert.equal(c.changes.entries.length, 5)
  // place names come from coverage.parquet
  assert.deepEqual(c.changes.entries.map(e => e.place_name), [
    'Cordell Bank National Marine Sanctuary', 'Channel Islands National Marine Sanctuary', 'United States EEZ',
    'Monterey Bay National Marine Sanctuary', null,
  ])
})

test('main: writes the file from --src; an unreadable source keeps the last good file', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'om-counts-'))
  const out = join(dir, 'counts.json')
  assert.equal(await main(['--src', FIX, '--out', out]), 0)
  assert.equal(JSON.parse(await readFile(out, 'utf8')).atlas.collections, 2)
  await writeFile(out, '{"last":"good"}\n')
  assert.equal(await main(['--src', join(dir, 'missing'), '--out', out]), 0)
  assert.equal(await readFile(out, 'utf8'), '{"last":"good"}\n')
})
