#!/usr/bin/env node
// copy the JSON Schemas of the pinned @oceanmetrics/catalog (package.json) to where their $id says,
// so https://oceanmetrics.io/schemas/<name>/v<version>/schema.json answers.
//
//   npm ci && npm run schemas      (the deploy workflow runs both before `hugo`)
//
// writes (all git-ignored, regenerated every build):
//   static/schemas/<name>/v<version>/schema.json   one per schema, path read from its $id
//   static/schemas/index.json                       the list, for machines
//   data/schemas.json                               the same list, for the /schemas/ page
// a bump is one line: change the version of @oceanmetrics/catalog in package.json, npm install, commit.

import { readFileSync, readdirSync, writeFileSync, mkdirSync, rmSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const ORIGIN = 'https://oceanmetrics.io'
const ID_RE = /^https:\/\/oceanmetrics\.io\/schemas\/([a-z0-9][a-z0-9-]*)\/v(\d+\.\d+\.\d+)\/schema\.json$/

/** the first sentence of a description (two when the first is a stub like "Contract 1.2.0."), cut to one line */
function oneLine(text, max = 220) {
  const flat = String(text ?? '').replace(/\s+/g, ' ').trim()
  const sentences = flat.match(/.+?[.!?](?=\s|$)/g) ?? [flat]
  let s = sentences[0].trim()
  if (s.length < 30 && sentences[1]) s += ' ' + sentences[1].trim()
  return s.length > max ? s.slice(0, max - 1).trimEnd() + '…' : s
}

/** "h3: a STAC Collection for a layer on the H3 grid" -> "A STAC Collection for a layer on the H3 grid" */
function whatItDescribes(title) {
  const t = String(title).replace(/^[^:\s]+:\s+/, '')
  return t.charAt(0).toUpperCase() + t.slice(1)
}

/** read every *.schema.json of a directory into index rows (throws on a $id off the pattern) */
export function readSchemas(dir) {
  const rows = []
  for (const file of readdirSync(dir).filter((f) => f.endsWith('.schema.json')).sort()) {
    const text = readFileSync(join(dir, file), 'utf8')
    const schema = JSON.parse(text)
    const m = ID_RE.exec(schema.$id ?? '')
    if (!m) throw new Error(`${file}: $id ${JSON.stringify(schema.$id)} is not ${ORIGIN}/schemas/<name>/v<x.y.z>/schema.json`)
    const [, name, version] = m
    rows.push({
      name,
      version,
      file,
      id: schema.$id,
      path: `/schemas/${name}/v${version}/schema.json`,
      title: schema.title ?? name,
      what: whatItDescribes(schema.title ?? name),
      summary: oneLine(schema.description),
      text,
    })
  }
  const seen = new Set()
  for (const r of rows) {
    if (seen.has(r.id)) throw new Error(`two schemas share the $id ${r.id}`)
    seen.add(r.id)
  }
  return rows
}

function main() {
  const pkgDir = join(ROOT, 'node_modules', '@oceanmetrics', 'catalog')
  const pkg = JSON.parse(readFileSync(join(pkgDir, 'package.json'), 'utf8'))
  const rows = readSchemas(join(pkgDir, 'schemas'))
  if (!rows.length) throw new Error('no *.schema.json in ' + pkgDir)

  const out = join(ROOT, 'static', 'schemas')
  rmSync(out, { recursive: true, force: true })
  for (const r of rows) {
    const dest = join(out, r.name, `v${r.version}`, 'schema.json')
    mkdirSync(dirname(dest), { recursive: true })
    writeFileSync(dest, r.text)
  }
  const list = rows.map(({ text, file, ...r }) => ({ ...r, url: ORIGIN + r.path }))
  const index = { package: pkg.name, version: pkg.version, count: list.length, schemas: list }
  writeFileSync(join(out, 'index.json'), JSON.stringify(index, null, 2) + '\n')
  mkdirSync(join(ROOT, 'data'), { recursive: true })
  writeFileSync(join(ROOT, 'data', 'schemas.json'), JSON.stringify(index, null, 2) + '\n')
  console.log(`schemas: ${list.length} from ${pkg.name}@${pkg.version} -> static/schemas/`)
  for (const r of list) console.log(`  ${r.path}`)
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main()
