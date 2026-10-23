#!/usr/bin/env node
// the repo is public and the alerts form handles subscribers' addresses: no email address may appear anywhere in it
// (source, content, data, fixtures, tests) but the studio's own contact addresses and RFC 2606 examples. same rule as
// the Worker's scripts/no-addresses.mjs (platform/workers/alerts). a seeded fault proves the pattern still catches one.
//
//   node scripts/check-no-addresses.mjs        every file git tracks or would track (ignored files are skipped)
//
// exit status is non-zero on any other address.

import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const ADDRESS = /[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}/g
// the sender of the alerts and the studio's two published contact addresses (hugo.yaml, PLAN.md)
const OWN = new Set(['alerts@mail.oceanmetrics.io', 'ben@oceanmetrics.io', 'ben@ecoquants.com'])
export const allowed = (a) => /@(example\.(org|com|net)|[a-z0-9-]+\.example\.(org|com|net))$/i.test(a) || OWN.has(a.toLowerCase())
export const offending = (text) => [...text.matchAll(ADDRESS)].map((m) => m[0]).filter((a) => !allowed(a))

export function selfTest() {
  const seeded = ['someone', 'mailbox.test.io'].join('@')
  return offending(`x ${seeded} y`).length === 1 && offending('a@example.org ben@oceanmetrics.io b@sub.example.com').length === 0
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (!selfTest()) { console.error('no-addresses: the pattern no longer catches a seeded address'); process.exit(1) }
  const files = execFileSync('git', ['ls-files', '-co', '--exclude-standard', '-z'], { cwd: ROOT, encoding: 'utf8' }).split('\0').filter(Boolean)
  let bad = 0
  let n = 0
  for (const f of files) {
    if (!/\.(md|html|js|mjs|json|ya?ml|css|py|txt|toml|svg|xml|gs)$/.test(f) || f.endsWith('package-lock.json')) continue
    let text
    try { text = readFileSync(resolve(ROOT, f), 'utf8') } catch { continue } // a tracked file deleted in the working tree
    n++
    for (const _ of offending(text)) { console.error(`no-addresses: ${f}: an address outside the allowed list`); bad++ }
  }
  if (bad) process.exit(1)
  console.log(`no-addresses: ok (${n} files)`)
}
