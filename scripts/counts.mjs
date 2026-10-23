#!/usr/bin/env node
// the front page's live numbers and "What changed", read from the public bucket at build time and written to
// data/counts.json, so the page needs no JavaScript for them. deploy.yml runs it before hugo (and daily on a
// schedule, so the numbers are a day old at most).
//
//   node scripts/counts.mjs [--out data/counts.json] [--src <dir>]
//
// the host is chosen by @oceanmetrics/catalog/storage, the one rule the apps use: OM_STORAGE, else the package
// default (path-style S3 until the storage.oceanmetrics.io cutover). --src reads the same keys from a local folder
// (the tests' fixtures). if any read fails the last good file is kept and the build goes on with a warning.
//
// the pure functions are exported for scripts/counts.test.mjs.

import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { parquetReadObjects } from 'hyparquet'
import { resolveStorageHost, storageUrl, STORAGE_ENV } from '@oceanmetrics/catalog/storage'

/** the bucket keys this script reads */
export const KEYS = {
  layers:     'gazetteer/index/layers.json',
  indicators: 'indicators/indicators.json',
  coverage:   'indicators/coverage.parquet',
  atlas:      'atlas/catalog.json',
  latest:     'indicators/changes/latest.json',
  feed:       'indicators/feeds/all.xml',
}

/** how many feed entries the front page shows */
export const N_CHANGES = 5

/** places door: the gazetteer layers and the places in them (each layer row's `n`) */
export function countLayers(layers) {
  const rows = Array.isArray(layers) ? layers : layers?.layers
  if (!Array.isArray(rows) || rows.length === 0) throw new Error('layers.json: no layer rows')
  const places = rows.reduce((a, r) => a + (Number.isFinite(r?.n) ? r.n : 0), 0)
  return { layers: rows.length, places, updated: layers?.generated ?? null }
}

/** indicators door: the indicators in the manifest */
export function countIndicators(manifest) {
  const rows = manifest?.indicators
  if (!Array.isArray(rows) || rows.length === 0) throw new Error('indicators.json: no indicators')
  return { indicators: rows.length, updated: manifest?.created ?? null, version: manifest?.version ?? null }
}

/** the distinct places of coverage rows ({ place_id }) and a place_id -> place_name lookup */
export function coveragePlaces(rows) {
  const names = new Map()
  for (const r of rows) if (r?.place_id != null && !names.has(r.place_id)) names.set(r.place_id, r.place_name ?? null)
  return { places: names.size, names }
}

/** atlas door: the catalog's child collections */
export function countCollections(catalog) {
  const kids = (catalog?.links ?? []).filter(l => l?.rel === 'child')
  if (kids.length === 0) throw new Error('atlas/catalog.json: no child collections')
  return { collections: kids.length, updated: catalog?.updated ?? null }
}

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" }
/** decode the five XML entities and numeric character references */
export const unxml = s => String(s ?? '').replace(/&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos);/gi, (m, e) =>
  e[0] === '#' ? String.fromCodePoint(e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10)) : ENTITIES[e.toLowerCase()])

const tag = (xml, name) => { const m = xml.match(new RegExp(`<${name}\\b[^>]*>([\\s\\S]*?)</${name}>`)); return m ? unxml(m[1].trim()) : null }
const attr = (el, name) => { const m = el.match(new RegExp(`\\b${name}="([^"]*)"`)); return m ? unxml(m[1]) : null }

/**
 * the place id of a feed entry: the `place=` key of its link's fragment (the indicators viewer's deep link), else the
 * entry id's path (`changes/<date>/<place>/<coll>/<indicator>/<kind>`)
 */
export function entryPlace(href, id) {
  const hash = String(href ?? '').split('#')[1]
  const p = hash ? new URLSearchParams(hash).get('place') : null
  if (p) return p
  const m = String(id ?? '').match(/changes\/\d{4}-\d{2}-\d{2}\/(.+)\/[^/]+\/[^/]+\/[^/]+$/)
  return m ? m[1] : null
}

/**
 * the newest `n` entries of an Atom feed (the one the changes builder writes): title, place id and name, date, kind
 * and link. `names` maps a place id to its name (coverage.parquet's place_name).
 */
export function feedEntries(xml, { n = N_CHANGES, names = new Map() } = {}) {
  const entries = [...String(xml).matchAll(/<entry\b[^>]*>([\s\S]*?)<\/entry>/g)].map(([, e], i) => {
    const link = [...e.matchAll(/<link\b[^>]*>/g)].map(m => m[0]).find(l => (attr(l, 'rel') ?? 'alternate') === 'alternate')
    const href = link ? attr(link, 'href') : null
    const id = tag(e, 'id')
    const updated = tag(e, 'updated')
    const place_id = entryPlace(href, id)
    const cat = e.match(/<category\b[^>]*>/)
    return {
      title: tag(e, 'title'), place_id, place_name: (place_id && names.get(place_id)) || null,
      date: updated ? updated.slice(0, 10) : null, kind: cat ? attr(cat[0], 'term') : null, href, i,
    }
  })
  // newest first; a stable sort keeps the feed's own order within a day
  entries.sort((a, b) => (b.date ?? '').localeCompare(a.date ?? '') || a.i - b.i)
  return entries.slice(0, n).map(({ i, ...e }) => e)
}

/** every number and entry of data/counts.json, from a reader `read(key) -> Promise<ArrayBuffer>` */
export async function buildCounts(read, { host = null, now = new Date() } = {}) {
  const text = async k => new TextDecoder().decode(await read(k))
  const json = async k => JSON.parse(await text(k))
  const [layers, manifest, coverage, catalog, latest, feed] = await Promise.all([
    json(KEYS.layers), json(KEYS.indicators), read(KEYS.coverage), json(KEYS.atlas), json(KEYS.latest), text(KEYS.feed),
  ])
  const cov = coveragePlaces(await parquetReadObjects({ file: coverage, columns: ['place_id', 'place_name'] }))
  const ind = countIndicators(manifest)
  return {
    generated: now.toISOString(),
    host,
    places:     countLayers(layers),
    indicators: { ...ind, places: cov.places },
    atlas:      countCollections(catalog),
    changes: {
      checked: latest?.checked_at ?? null,
      date:    latest?.date ?? null,
      feed:    host ? storageUrl(KEYS.feed, { host }) : KEYS.feed,
      entries: feedEntries(feed, { names: cov.names }),
    },
  }
}

/** a reader over the storage host (fetch, 30 s each) */
export const hostReader = host => async key => {
  const url = storageUrl(key, { host })
  const r = await fetch(url, { signal: AbortSignal.timeout(30_000) })
  if (!r.ok) throw new Error(`${r.status} ${url}`)
  return r.arrayBuffer()
}

/** a reader over a local folder laid out like the bucket */
export const dirReader = dir => async key => {
  const b = await readFile(join(dir, key))
  return b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength)
}

/** build and write; on any failure keep the file that is there (the last good numbers) and say so */
export async function main(argv = process.argv.slice(2)) {
  const opt = k => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : null }
  const out = opt('--out') ?? 'data/counts.json'
  const src = opt('--src')
  const host = src ? null : resolveStorageHost(process.env[STORAGE_ENV.node])
  try {
    const counts = await buildCounts(src ? dirReader(src) : hostReader(host), { host })
    await writeFile(out, JSON.stringify(counts, null, 2) + '\n')
    const { places: p, indicators: i, atlas: a, changes: c } = counts
    console.log(`counts: ${p.layers} layers, ${p.places} places; ${i.indicators} indicators over ${i.places} places; ` +
      `${a.collections} atlas collections; ${c.entries.length} changes (checked ${c.checked}) -> ${out}`)
    return 0
  } catch (e) {
    // a GitHub Actions annotation; the committed data/counts.json stays, so the page still reads right
    console.log(`::warning title=counts::kept the last good ${out}: ${e.message}`)
    return 0
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) process.exitCode = await main()
