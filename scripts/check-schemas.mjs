#!/usr/bin/env node
// assert that every schema of the pinned @oceanmetrics/catalog is served at its $id.
//
//   node scripts/check-schemas.mjs                       the built site in ./public (the deploy gate, before upload)
//   node scripts/check-schemas.mjs --live [origin]       the live site (default https://oceanmetrics.io), one line per schema
//   node scripts/check-schemas.mjs --retries 6           live only: wait for Pages to publish (10 s apart)
//
// built mode checks, for each schema in node_modules: the file exists at the $id path, parses, carries
// the same $id and the same bytes as the package, is listed in schemas/index.json and linked from
// schemas/index.html. live mode fetches each $id and checks status 200, JSON and the same $id.
// exit status is non-zero on any failure.

import { existsSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { readSchemas } from './sync-schemas.mjs'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const args = process.argv.slice(2)
const live = args.includes('--live')
const opt = (flag) => { const i = args.indexOf(flag); return i >= 0 ? args[i + 1] : undefined }
const liveOrigin = (live && args[args.indexOf('--live') + 1] && !args[args.indexOf('--live') + 1].startsWith('--'))
  ? args[args.indexOf('--live') + 1].replace(/\/$/, '') : 'https://oceanmetrics.io'
const retries = Number(opt('--retries') ?? 0)
const pub = resolve(ROOT, (!live && args.find((a, i) => !a.startsWith('--') && args[i - 1] !== '--retries')) || 'public')

const rows = readSchemas(join(ROOT, 'node_modules', '@oceanmetrics', 'catalog', 'schemas'))
const fails = []
const ok = (cond, msg) => { if (!cond) fails.push(msg) }

async function checkBuilt() {
  const index = existsSync(join(pub, 'schemas', 'index.json')) ? JSON.parse(readFileSync(join(pub, 'schemas', 'index.json'), 'utf8')) : null
  const html = existsSync(join(pub, 'schemas', 'index.html')) ? readFileSync(join(pub, 'schemas', 'index.html'), 'utf8') : ''
  ok(index, 'schemas/index.json missing from the build')
  ok(html, 'schemas/index.html (the /schemas/ page) missing from the build')
  for (const r of rows) {
    const file = join(pub, r.path)
    if (!existsSync(file)) { fails.push(`${r.path}: not in the build`); continue }
    const text = readFileSync(file, 'utf8')
    let parsed
    try { parsed = JSON.parse(text) } catch { fails.push(`${r.path}: not JSON`); continue }
    ok(parsed.$id === r.id, `${r.path}: $id is ${parsed.$id}, expected ${r.id}`)
    ok(text === r.text, `${r.path}: differs from node_modules/@oceanmetrics/catalog/schemas/${r.file}`)
    ok(index?.schemas?.some((s) => s.id === r.id), `${r.path}: not listed in schemas/index.json`)
    ok(new RegExp(`href=["']?${r.path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["'\\s>]`).test(html), `${r.path}: not linked from schemas/index.html`)
    console.log(`built  ok  ${r.path}`)
  }
  ok(index?.count === rows.length, `schemas/index.json counts ${index?.count}, the package has ${rows.length}`)
}

async function fetchOne(r) {
  const res = await fetch(liveOrigin + r.path, { redirect: 'follow' })
  let id = ''
  let body = ''
  if (res.ok) { body = await res.text(); try { id = JSON.parse(body).$id } catch { /* reported below */ } }
  return { status: res.status, id, same: body === r.text }
}

async function checkLive() {
  for (let attempt = 0; ; attempt++) {
    const results = await Promise.all(rows.map(async (r) => [r, await fetchOne(r).catch((e) => ({ status: 0, id: '', same: false, err: String(e) }))]))
    const bad = results.filter(([r, x]) => x.status !== 200 || x.id !== r.id || !x.same)
    if (!bad.length || attempt >= retries) {
      for (const [r, x] of results) {
        const good = x.status === 200 && x.id === r.id && x.same
        console.log(`${x.status}  ${good ? 'ok  ' : 'FAIL'}  ${liveOrigin}${r.path}${good ? '' : `  ($id ${x.id || 'unreadable'}${x.same ? '' : ', differs from the package'})`}`)
        if (!good) fails.push(`${liveOrigin}${r.path}: status ${x.status}`)
      }
      return
    }
    console.log(`live: ${bad.length} of ${rows.length} not there yet, retry ${attempt + 1}/${retries} in 10 s`)
    await new Promise((s) => setTimeout(s, 10000))
  }
}

await (live ? checkLive() : checkBuilt())
if (fails.length) {
  console.error(`\n${fails.length} schema check failure(s):\n  ` + fails.join('\n  '))
  process.exit(1)
}
console.log(`\nschemas: all ${rows.length} reachable at their $id (${live ? liveOrigin : pub})`)
