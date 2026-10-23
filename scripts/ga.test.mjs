// node --test of the analytics wiring: scripts/check-ga.mjs on small dists, and the real Hugo build (skipped without
// hugo on PATH; deploy.yml installs it before npm test) with GA_ID unset, malformed and set to a dummy
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { checkGa } from './check-ga.mjs'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const dist = (files) => {
  const d = mkdtempSync(join(tmpdir(), 'ga-dist-'))
  for (const [f, s] of Object.entries(files)) { mkdirSync(join(d, f, '..'), { recursive: true }); writeFileSync(join(d, f), s) }
  return d
}
const BAR = 'const s="https://www.googletagmanager.com/gtag/js?id=";'

test('checkGa: off passes with no id and no script tag; a stray id or a script tag fails', () => {
  assert.deepEqual(checkGa(dist({ 'index.html': '<om-nav></om-nav>', 'js/a.js': BAR }), ''), [])
  assert.deepEqual(checkGa(dist({ 'index.html': '<om-nav data-ga="G-TEST000000">' }), ''), ['a measurement id that was not given: G-TEST000000'])
  assert.ok(checkGa(dist({ 'a/index.html': '<script async src="https://www.googletagmanager.com/gtag/js?id=G-TEST000000"></script>', 'b.js': BAR }), 'G-TEST000000')
    .includes('a/index.html: a gtag.js script tag in the page'))
})

test('checkGa: set passes when the id and the bar\'s loader are in the build', () => {
  assert.deepEqual(checkGa(dist({ 'index.html': '<om-nav data-ga="G-TEST000000">', 'b.js': BAR }), 'G-TEST000000'), [])
  assert.deepEqual(checkGa(dist({ 'index.html': '<om-nav>', 'b.js': BAR }), 'G-TEST000000'), ['the given id G-TEST000000 is not in the build'])
})

let hugo = true
try { execFileSync('hugo', ['version'], { stdio: 'ignore' }) } catch { hugo = false }

const build = (ga) => {
  const out = mkdtempSync(join(tmpdir(), 'ga-site-'))
  const env = { ...process.env }
  delete env.HUGOxPARAMSxGA_ID
  if (ga !== undefined) env.HUGOxPARAMSxGA_ID = ga
  execFileSync('hugo', ['--quiet', '--minify', '--destination', out], { cwd: ROOT, env, stdio: 'pipe' })
  return out
}
const bar = (out) => readFileSync(join(out, 'index.html'), 'utf8').match(/<om-nav[^>]*>/)?.[0] ?? ''

test('the site built without GA_ID: no data-ga, no id, no script tag', { skip: !hugo && 'no hugo on PATH' }, () => {
  const out = build(undefined)
  assert.ok(bar(out).length > 0, 'the front page has the bar')
  assert.doesNotMatch(bar(out), /data-ga/)
  assert.deepEqual(checkGa(out, ''), [])
})

test('the site built with a malformed GA_ID: the same as unset', { skip: !hugo && 'no hugo on PATH' }, () => {
  const out = build('G-TEST000000"><script>')
  assert.doesNotMatch(bar(out), /data-ga/)
  assert.deepEqual(checkGa(out, ''), [])
})

test('the site built with GA_ID=G-TEST000000: the bar carries data-ga, the bundled bar has the loader', { skip: !hugo && 'no hugo on PATH' }, () => {
  const out = build('G-TEST000000')
  assert.match(bar(out), /data-ga="?G-TEST000000"?/)
  assert.deepEqual(checkGa(out, 'G-TEST000000'), [])
})
