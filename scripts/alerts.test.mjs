// node --test scripts/alerts.test.mjs   (npm test): the pure functions of static/js/alerts.js, with the Worker's contract
// (platform/workers/alerts/README.md) as the spec. every rule has a small fixture with the exact expected output.
import test from 'node:test'
import assert from 'node:assert/strict'
import {
  ALL_SANCTUARIES, FEEDS, buildSubscribeBody, confirmOutcome, describeRules, feedFile, feedForSelection, feedHref,
  isEmail, isPlaceId, isToken, manageBody, manageError, manageHref, parseHash, parseQuery, subscribeOutcome, updateBody,
} from '../static/js/alerts.js'
import { allowed, offending, selfTest } from './check-no-addresses.mjs'

const EMAIL = 'reader@example.org'
const TOKEN = 'u3Kq0Z9o1xYb7mVt5nW2cLr8sHd4gJf6PaEiXyQkTzA' // 43 chars, base64url
const MANAGE = 'm1.9f2c4e7a1b3d5f60.1729670400.Zm9vYmFyYmF6cXV4'

test('parseHash reads t and u from the fragment, with or without the #', () => {
  assert.deepEqual(parseHash(`#t=${TOKEN}`), { t: TOKEN, u: '' })
  assert.deepEqual(parseHash(`t=${TOKEN}&u=all`), { t: TOKEN, u: 'all' })
  assert.deepEqual(parseHash(`#u=all&t=${MANAGE}`), { t: MANAGE, u: 'all' })
  assert.deepEqual(parseHash(''), { t: '', u: '' })
  assert.deepEqual(parseHash(undefined), { t: '', u: '' })
  assert.deepEqual(parseHash('#nothing'), { t: '', u: '' })
})

test('isToken accepts the confirm and manage tokens and refuses anything else', () => {
  assert.equal(isToken(TOKEN), true)
  assert.equal(isToken(MANAGE), true)
  assert.equal(isToken(''), false)
  assert.equal(isToken('short'), false)
  assert.equal(isToken(`${TOKEN}<script>`), false)
  assert.equal(isToken(null), false)
})

test('isEmail and isPlaceId', () => {
  assert.equal(isEmail(EMAIL), true)
  assert.equal(isEmail(` ${EMAIL} `), true)
  assert.equal(isEmail('nobody'), false)
  assert.equal(isEmail('a@b'), false)
  assert.equal(isEmail('two words@example.org'), false)
  assert.equal(isPlaceId('NMS:CINMS'), true)
  assert.equal(isPlaceId('NMS CINMS'), false)
  assert.equal(isPlaceId(''), false)
  assert.equal(isPlaceId('a/b'), false)
})

test('parseQuery: a place, the report keys, a title; the report keys win over a place', () => {
  assert.deepEqual(parseQuery('?place=NMS:CINMS'), { place: 'NMS:CINMS' })
  assert.deepEqual(parseQuery('?pi=coll:places&px=NMS:FKNMS&ii=cat:sst&ix=series:x:*&title=My%20report'),
    { params: { pi: 'coll:places', px: 'NMS:FKNMS', ii: 'cat:sst', ix: 'series:x:*' }, title: 'My report' })
  assert.deepEqual(parseQuery('?pi=coll:places&place=NMS:CINMS'), { params: { pi: 'coll:places' } })
  assert.deepEqual(parseQuery('?place=bad%20id&other=1'), {})
  assert.deepEqual(parseQuery(''), {})
  assert.equal(parseQuery(`?title=${encodeURIComponent('a@b report')}`).title, 'ab report', 'a title never holds an @')
  assert.equal(parseQuery(`?title=${'x'.repeat(300)}`).title.length, 200)
})

test('feedFile and feedHref follow the catalog naming, with the unsafe characters mapped to _', () => {
  assert.equal(feedFile('all', 'all'), 'all.xml')
  assert.equal(feedFile('place', 'NMS:CINMS'), 'place=NMS:CINMS.xml')
  assert.equal(feedFile('coll', 'places'), 'coll=places.xml')
  assert.equal(feedFile('place', 'a b/c'), 'place=a_b_c.xml')
  assert.equal(feedHref('place', 'NMS:CINMS'), 'https://s3.us-east-1.amazonaws.com/oceanmetrics.io-public/indicators/feeds/place=NMS:CINMS.xml')
  assert.equal(feedHref('place', 'NMS:CINMS', FEEDS.target), 'https://storage.oceanmetrics.io/indicators/feeds/place=NMS:CINMS.xml')
})

test('feedForSelection: a place, all sanctuaries, a collection from the report, else the index', () => {
  assert.equal(feedForSelection({ place: 'NMS:CINMS' }).href, FEEDS.today + 'place=NMS:CINMS.xml')
  assert.equal(feedForSelection({}).href, FEEDS.today + 'coll=places.xml')
  assert.equal(feedForSelection({ params: { pi: 'coll:mr_eez' } }).href, FEEDS.today + 'coll=mr_eez.xml')
  assert.equal(feedForSelection({ params: { pi: 'coll:places', px: 'NMS:X' } }).href, FEEDS.today + 'index.json')
  assert.equal(feedForSelection({ params: { pi: '*', ii: 'cat:sst' } }).href, FEEDS.today + 'index.json')
})

test('buildSubscribeBody: all sanctuaries is the places collection', () => {
  const r = buildSubscribeBody({ email: ` ${EMAIL} `, scope: 'all', kinds: ['status'], cadence: 'daily', title: 'All sanctuaries' })
  assert.deepEqual(r, { ok: true, body: { email: EMAIL, kinds: ['status'], cadence: 'daily', params: { pi: 'coll:places' }, title: 'All sanctuaries', source: 'alerts' } })
  assert.deepEqual(ALL_SANCTUARIES, { pi: 'coll:places' })
})

test('buildSubscribeBody: one place sends place, not params, and source place', () => {
  const r = buildSubscribeBody({ email: EMAIL, scope: 'place', place: ' NMS:CINMS ', kinds: ['new', 'status'], cadence: 'weekly', title: 'Channel Islands' })
  assert.deepEqual(r.body, { email: EMAIL, kinds: ['status', 'new'], cadence: 'weekly', place: 'NMS:CINMS', title: 'Channel Islands', source: 'place' })
  assert.equal('params' in r.body, false)
})

test('buildSubscribeBody: the report keys pass through, source report, only the four keys', () => {
  const r = buildSubscribeBody({ email: EMAIL, scope: 'params', params: { pi: 'coll:places', ix: 'series:x', junk: 'no' }, kinds: ['status'], cadence: 'daily' })
  assert.deepEqual(r.body.params, { pi: 'coll:places', ix: 'series:x' })
  assert.equal(r.body.source, 'report')
  assert.equal('title' in r.body, false, 'an empty title is not sent')
})

test('buildSubscribeBody: the turnstile token is sent only when there is one; an unknown cadence is daily', () => {
  assert.equal(buildSubscribeBody({ email: EMAIL, scope: 'all', kinds: ['status'], turnstile: 'tok' }).body.turnstile, 'tok')
  assert.equal('turnstile' in buildSubscribeBody({ email: EMAIL, scope: 'all', kinds: ['status'], turnstile: '' }).body, false)
  assert.equal(buildSubscribeBody({ email: EMAIL, scope: 'all', kinds: ['status'], cadence: 'hourly' }).body.cadence, 'daily')
})

test('buildSubscribeBody: kinds are limited to the two offered and de-duplicated in order', () => {
  assert.deepEqual(buildSubscribeBody({ email: EMAIL, scope: 'all', kinds: ['new', 'period', 'status', 'new'] }).body.kinds, ['status', 'new'])
})

test('buildSubscribeBody: the problems, each naming its field', () => {
  assert.deepEqual(buildSubscribeBody({ email: 'nope', scope: 'all', kinds: ['status'] }).field, 'email')
  assert.deepEqual(buildSubscribeBody({ email: EMAIL, scope: 'all', kinds: [] }).field, 'kinds')
  assert.deepEqual(buildSubscribeBody({ email: EMAIL, scope: 'all', kinds: ['period'] }).field, 'kinds')
  assert.deepEqual(buildSubscribeBody({ email: EMAIL, scope: 'place', place: 'bad id', kinds: ['status'] }).field, 'place')
  assert.deepEqual(buildSubscribeBody({ email: EMAIL, scope: 'place', place: '', kinds: ['status'] }).field, 'place')
  assert.deepEqual(buildSubscribeBody({ email: EMAIL, scope: 'params', params: {}, kinds: ['status'] }).field, 'place')
})

test('buildSubscribeBody: a title never holds an @ and is cut at 200', () => {
  const r = buildSubscribeBody({ email: EMAIL, scope: 'all', kinds: ['status'], title: `a@b ${'x'.repeat(300)}` })
  assert.equal(r.body.title.includes('@'), false)
  assert.equal(r.body.title.length, 200)
})

test('subscribeOutcome: 202 pending, 503 not_configured (the setup state), the errors', () => {
  assert.equal(subscribeOutcome(202, { ok: true, status: 'pending' }).state, 'pending')
  assert.equal(subscribeOutcome(503, { error: 'not_configured' }).state, 'not_configured')
  const rl = subscribeOutcome(429, { error: 'rate_limited' }, '600')
  assert.equal(rl.state, 'error')
  assert.match(rl.message, /10 minutes/)
  assert.match(subscribeOutcome(429, {}, '').message, /few minutes/)
  assert.equal(subscribeOutcome(403, { error: 'turnstile_failed' }).resetCheck, true)
  assert.equal(subscribeOutcome(403, { error: 'origin_not_allowed' }).resetCheck, false)
  assert.match(subscribeOutcome(400, { error: 'bad_email' }).message, /address/)
  assert.match(subscribeOutcome(502, { error: 'send_failed' }).message, /could not be sent/)
  assert.match(subscribeOutcome(500, {}).message, /Something went wrong/)
})

test('confirmOutcome: confirmed (with the manage link), already, unknown or old, too many tries', () => {
  const ok = confirmOutcome(200, { ok: true, status: 'confirmed', already: false, manage: MANAGE })
  assert.deepEqual([ok.state, ok.manage], ['confirmed', `/alerts/manage/#t=${MANAGE}`])
  assert.equal(confirmOutcome(200, { already: true, manage: MANAGE }).state, 'already')
  assert.equal(confirmOutcome(200, { manage: '<script>' }).manage, '/alerts/manage/', 'a manage value that is not a token is not put in a link')
  assert.deepEqual([confirmOutcome(404, {}).state, confirmOutcome(404, {}).retry], ['gone', false])
  assert.equal(confirmOutcome(400, {}).state, 'gone')
  assert.deepEqual([confirmOutcome(429, {}).state, confirmOutcome(429, {}).retry], ['error', true])
  assert.equal(confirmOutcome(500, {}).retry, true)
  assert.match(confirmOutcome(503, { error: 'not_configured' }).message, /being set up/)
})

test('manage: the link, the bodies, the update rules and the errors', () => {
  assert.equal(manageHref(MANAGE), `/alerts/manage/#t=${MANAGE}`)
  assert.deepEqual(manageBody(MANAGE, 'list'), { token: MANAGE, action: 'list' })
  assert.deepEqual(manageBody(MANAGE, 'delete', { id: 'abc' }), { token: MANAGE, action: 'delete', id: 'abc' })
  assert.deepEqual(updateBody(MANAGE, 'abc', ['new', 'status'], 'weekly'), { ok: true, body: { token: MANAGE, action: 'update', id: 'abc', kinds: ['status', 'new'], cadence: 'weekly' } })
  assert.equal(updateBody(MANAGE, 'abc', ['period'], 'daily').body.kinds[0], 'period', 'the manage page keeps period alerts a person already has')
  assert.equal(updateBody(MANAGE, 'abc', [], 'daily').ok, false)
  assert.equal(updateBody(MANAGE, 'abc', ['status'], 'whenever').body.cadence, 'daily')
  assert.match(manageError(403), /not valid/)
  assert.match(manageError(404), /unsubscribed already/)
  assert.match(manageError(429), /Too many/)
  assert.match(manageError(503), /being set up/)
  assert.match(manageError(500), /Something went wrong/)
})

test('describeRules words the places and indicators with their excludes', () => {
  assert.equal(describeRules({ places: { include: ['coll:places'], exclude: [] }, indicators: { include: ['*'], exclude: [] } }),
    'places: coll:places; indicators: *')
  assert.equal(describeRules({ places: { include: ['NMS:CINMS'], exclude: [] }, indicators: { include: ['cat:sst'], exclude: ['series:x'] } }),
    'places: NMS:CINMS; indicators: cat:sst except series:x')
  assert.equal(describeRules({}), 'places: none; indicators: none')
})

test('the address check: example addresses and the studio contacts pass, others are caught', () => {
  assert.equal(selfTest(), true)
  assert.equal(allowed('x@example.org'), true)
  assert.equal(allowed('ALERTS@mail.oceanmetrics.io'), true)
  assert.deepEqual(offending(`see ${['reader', 'mailhost.io'].join('@')} and ${EMAIL}`), [['reader', 'mailhost.io'].join('@')])
})
