// Ocean Metrics email alerts, the three pages' script (/alerts/, /alerts/confirm/, /alerts/manage/).
// An ES module. The pure functions at the top build request bodies, parse the URL hash and word the answers;
// scripts/alerts.test.mjs tests them under `node --test`. The DOM code below the line only runs in a browser,
// on a page whose <main> carries data-alerts="form|confirm|manage".
//
// The API is the om-alerts Worker (platform/workers/alerts/README.md). The address is sent to it and nowhere else,
// never written to the page's URL, storage or console. The tokens ride in the URL fragment (never sent to a server).

export const KINDS = { status: 'status changes', new: 'first values', period: 'new periods' }
export const OFFERED_KINDS = ['status', 'new']
export const CADENCES = { daily: 'at most daily', weekly: 'weekly, Mondays' }
export const ALL_SANCTUARIES = { pi: 'coll:places' }
export const FEEDS = {
  today: 'https://s3.us-east-1.amazonaws.com/oceanmetrics.io-public/indicators/feeds/',
  target: 'https://storage.oceanmetrics.io/indicators/feeds/',
}

// ---- pure functions --------------------------------------------------------------------------------------

/** the fragment as parameters: `#t=abc&u=all` (or without the #) -> { t, u } (strings, '' when missing) */
export function parseHash(hash) {
  const q = new URLSearchParams(String(hash ?? '').replace(/^#/, ''))
  return { t: q.get('t') ?? '', u: q.get('u') ?? '' }
}

/** a token as the Worker mints it: base64url (confirm, 43 chars) or `m1.<hmac>.<epoch>.<hmac>` (manage) */
export const isToken = (t) => typeof t === 'string' && /^[A-Za-z0-9._-]{16,400}$/.test(t)

export const isEmail = (s) => typeof s === 'string' && s.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim())

/** a place id as the gazetteer writes it (`NMS:CINMS`): letters, digits and : . _ - only */
export const isPlaceId = (s) => typeof s === 'string' && /^[A-Za-z0-9:._-]{1,100}$/.test(s)

const clip = (s, n) => String(s).trim().slice(0, n)

/** the form's query: `?place=NMS:CINMS`, or the report's keys `pi px ii ix`, plus `title`. Anything else is ignored. */
export function parseQuery(search) {
  const q = new URLSearchParams(String(search ?? '').replace(/^\?/, ''))
  const out = {}
  const params = {}
  for (const k of ['pi', 'px', 'ii', 'ix']) if (q.get(k)) params[k] = clip(q.get(k), 500)
  if (Object.keys(params).length) out.params = params
  else if (isPlaceId(q.get('place') ?? '')) out.place = q.get('place')
  if (q.get('title')) out.title = clip(q.get('title').replaceAll('@', ''), 200)
  return out
}

/** the feed file for a kind and id, as the catalog names it (`feedFile` of @oceanmetrics/catalog/changes) */
export const feedFile = (kind, id) => (kind === 'all' ? 'all.xml' : `${kind}=${String(id).replace(/[^A-Za-z0-9:._-]/g, '_')}.xml`)

/** the feed's address; `host` is FEEDS.today (works now) or FEEDS.target (after the storage cutover) */
export const feedHref = (kind, id, host = FEEDS.today) => host + feedFile(kind, id)

/**
 * the feed to point at for a choice of what is watched: a place's own feed, the places collection for "all
 * sanctuaries", else the feeds index
 */
export function feedForSelection(sel = {}, host = FEEDS.today) {
  if (sel.place) return { href: feedHref('place', sel.place, host), label: `the ${sel.place} feed` }
  if (sel.params && sel.params.pi && /^coll:[A-Za-z0-9._-]+$/.test(sel.params.pi) && !sel.params.px)
    return { href: feedHref('coll', sel.params.pi.slice(5), host), label: `the ${sel.params.pi.slice(5)} feed` }
  if (!sel.params) return { href: feedHref('coll', 'places', host), label: 'the sanctuaries feed' }
  return { href: host + 'index.json', label: 'the list of feeds' }
}

/**
 * the POST /v1/subscribe body from the form's values, or the first problem.
 * f: { email, scope: 'all' | 'place' | 'params', place, params, kinds[], cadence, title, turnstile, source }
 */
export function buildSubscribeBody(f) {
  const email = String(f.email ?? '').trim()
  if (!isEmail(email)) return { ok: false, field: 'email', error: 'Enter the address the alerts should go to.' }
  const kinds = OFFERED_KINDS.filter((k) => (f.kinds ?? []).includes(k))
  if (!kinds.length) return { ok: false, field: 'kinds', error: 'Choose at least one kind of change.' }
  const cadence = f.cadence === 'weekly' ? 'weekly' : 'daily'
  const body = { email, kinds, cadence }
  let source = 'alerts'
  if (f.scope === 'place') {
    const place = String(f.place ?? '').trim()
    if (!isPlaceId(place)) return { ok: false, field: 'place', error: 'Enter a place id such as NMS:CINMS, or choose all sanctuaries.' }
    body.place = place
    source = 'place'
  } else if (f.scope === 'params') {
    const params = {}
    for (const k of ['pi', 'px', 'ii', 'ix']) if (f.params?.[k]) params[k] = clip(f.params[k], 500)
    if (!Object.keys(params).length) return { ok: false, field: 'place', error: 'Nothing is selected to watch.' }
    body.params = params
    source = 'report'
  } else {
    body.params = { ...ALL_SANCTUARIES }
  }
  const title = clip(String(f.title ?? '').replaceAll('@', ''), 200)
  if (title) body.title = title
  body.source = source
  if (f.turnstile) body.turnstile = String(f.turnstile)
  return { ok: true, body }
}

/** the answer of POST /v1/subscribe as a state for the page: pending | not_configured | error */
export function subscribeOutcome(status, out = {}, retryAfter = '') {
  if (status === 202) return { state: 'pending', message: '' }
  if (status === 503) return { state: 'not_configured', message: 'Alerts are being set up.' }
  const code = out?.error ?? ''
  if (status === 429) {
    const s = Number(retryAfter)
    const wait = Number.isFinite(s) && s > 0 ? ` Try again in about ${Math.max(1, Math.ceil(s / 60))} minute${s > 60 ? 's' : ''}.` : ' Wait a few minutes and try again.'
    return { state: 'error', code, resetCheck: false, message: 'Too many tries from this connection.' + wait }
  }
  const text = {
    bad_email: 'That address was not accepted. Check it and try again.',
    bad_rules: 'What you asked to watch was not understood. Choose a place again.',
    bad_kinds: 'Choose at least one kind of change.',
    bad_cadence: 'Choose daily or weekly.',
    bad_title: 'The title was not accepted.',
    bad_json: 'The request was not understood. Reload the page and try again.',
    turnstile_failed: 'The human check did not pass. Try it again.',
    origin_not_allowed: 'This page is not allowed to use the alerts service.',
    send_failed: 'The confirmation mail could not be sent. Try again later.',
  }[code]
  return { state: 'error', code, resetCheck: code === 'turnstile_failed', message: text ?? 'Something went wrong. Try again later.' }
}

/** the answer of POST /v1/confirm: confirmed | already | gone | error */
export function confirmOutcome(status, out = {}) {
  if (status >= 200 && status < 300) {
    const manage = isToken(out?.manage) ? out.manage : ''
    return { state: out?.already ? 'already' : 'confirmed', manage: manage ? manageHref(manage) : '/alerts/manage/', retry: false, message: out?.already ? 'This alert was already confirmed.' : '' }
  }
  if (status === 404) return { state: 'gone', retry: false, message: 'This link is unknown or older than 48 hours. Subscribe again from the alerts page.' }
  if (status === 400) return { state: 'gone', retry: false, message: 'This link is not a valid confirmation link. Open the link in the confirmation mail again.' }
  if (status === 429) return { state: 'error', retry: true, message: 'Too many tries. Wait a few minutes and press the button again.' }
  if (status === 503) return { state: 'error', retry: true, message: 'Alerts are being set up and cannot be confirmed yet. Try again later.' }
  return { state: 'error', retry: true, message: 'Something went wrong. Try again later.' }
}

/** the manage page for a manage token (the token stays in the fragment) */
export const manageHref = (token) => `/alerts/manage/#t=${token}`

/** the error to show for a failed POST /v1/manage (or /v1/unsubscribe) */
export function manageError(status, out = {}) {
  if (status === 403 || status === 400) return 'This manage link is not valid. Open the Manage link from one of the alert mails again.'
  if (status === 404) return 'No alert for this link: it may have been unsubscribed already.'
  if (status === 429) return 'Too many tries. Wait a few minutes and try again.'
  if (status === 503) return 'Alerts are being set up and cannot be managed yet. Try again later.'
  return 'Something went wrong. Try again later.'
}

/** the body of POST /v1/manage */
export const manageBody = (token, action, extra = {}) => ({ token, action, ...extra })

/** the body of an update, or the problem: kinds (at least one, of the three) and the cadence */
export function updateBody(token, id, kinds, cadence) {
  const ks = Object.keys(KINDS).filter((k) => (kinds ?? []).includes(k))
  if (!ks.length) return { ok: false, error: 'Choose at least one kind of change, or delete the alert.' }
  return { ok: true, body: manageBody(token, 'update', { id, kinds: ks, cadence: cadence === 'weekly' ? 'weekly' : 'daily' }) }
}

/** a subscription's rules in words: places and indicators, includes and excludes */
export function describeRules(r) {
  const part = (label, x) => `${label}: ${(x?.include ?? []).join(', ') || 'none'}${x?.exclude?.length ? ` except ${x.exclude.join(', ')}` : ''}`
  return `${part('places', r?.places)}; ${part('indicators', r?.indicators)}`
}

/** the whole sentence a subscription is shown with on the manage page */
export const describeKinds = (kinds) => (kinds ?? []).map((k) => KINDS[k] ?? k).join(', ')

// ---- the pages (browser only) ----------------------------------------------------------------------------

const $ = (id) => document.getElementById(id)
const apiBase = () => (document.querySelector('meta[name="om-alerts-api"]')?.content ?? '').replace(/\/+$/, '')

async function postJson(path, body) {
  const res = await fetch(`${apiBase()}${path}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })
  const out = await res.json().catch(() => ({}))
  return { status: res.status, out, retryAfter: res.headers.get('retry-after') ?? '' }
}
const unreachable = 'The alerts service could not be reached. Try again later.'

function say(text, kind = '') {
  const el = $('msg')
  el.textContent = text
  el.className = 'alerts-status' + (kind ? ` alerts-status--${kind}` : '')
}

// ---- /alerts/ ----
function initForm() {
  const form = $('alerts-form')
  const q = parseQuery(location.search)
  const key = form.dataset.turnstileKey || ''
  const placeInput = $('place')
  const radios = [...form.querySelectorAll('input[name="scope"]')]
  const names = new Map()
  let token = ''
  let widget = null

  // what is watched: the report's keys or a place from the query replace/preselect the choices
  if (q.params) {
    $('scope-fixed').hidden = false
    $('scope-choose').hidden = true
    $('scope-fixed-title').textContent = q.title || 'The selection from your report'
  } else if (q.place) {
    radios.find((r) => r.value === 'place').checked = true
    placeInput.value = q.place
  }
  const scope = () => (q.params ? 'params' : radios.find((r) => r.checked)?.value ?? 'all')
  const syncPlace = () => { placeInput.disabled = scope() !== 'place'; placeInput.required = scope() === 'place' }
  radios.forEach((r) => r.addEventListener('change', () => { syncPlace(); if (scope() === 'place') placeInput.focus() }))
  syncPlace()

  // place suggestions: the places that have a feed (best effort; a free id works without them)
  fetch(FEEDS.today + 'index.json').then((r) => (r.ok ? r.json() : null)).then((ix) => {
    const dl = $('place-list')
    for (const f of ix?.feeds ?? []) {
      if (f.kind !== 'place') continue
      const name = String(f.title ?? '').replace(/^Ocean Metrics indicators:\s*/, '')
      names.set(f.id, name)
      dl.append(Object.assign(document.createElement('option'), { value: f.id, label: name }))
    }
  }).catch(() => {})

  // the human check renders only when the site has a Turnstile key
  if (key) {
    $('turnstile').hidden = false
    const s = Object.assign(document.createElement('script'), {
      src: 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit', async: true,
      onload: () => { widget = window.turnstile.render('#turnstile-box', { sitekey: key, callback: (t) => { token = t }, 'expired-callback': () => { token = '' }, 'error-callback': () => { token = '' } }) },
    })
    document.head.append(s)
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    const sc = scope()
    const place = placeInput.value.trim()
    const title = q.title || (sc === 'place' ? names.get(place) || place : sc === 'all' ? 'All sanctuaries' : '')
    const built = buildSubscribeBody({
      email: $('email').value, scope: sc, place, params: q.params, title, turnstile: token,
      kinds: [...form.querySelectorAll('input[name="kinds"]:checked')].map((c) => c.value),
      cadence: form.querySelector('input[name="cadence"]:checked')?.value,
    })
    if (!built.ok) { say(built.error, 'error'); (built.field === 'place' ? placeInput : built.field === 'email' ? $('email') : form.querySelector('input[name="kinds"]')).focus(); return }
    if (key && !token) { say('Complete the human check first.', 'error'); return }
    const btn = $('go')
    btn.disabled = true
    say('Sending…')
    try {
      const { status, out, retryAfter } = await postJson('/v1/subscribe', built.body)
      const r = subscribeOutcome(status, out, retryAfter)
      if (r.state === 'pending') {
        form.hidden = true
        $('pending').hidden = false
        say('')
        $('pending').focus()
        return
      }
      if (r.state === 'not_configured') {
        const f = feedForSelection(sc === 'place' ? { place } : sc === 'params' ? { params: q.params } : {})
        form.hidden = true
        $('setup').hidden = false
        $('setup-feed').href = f.href
        $('setup-feed').textContent = f.label
        say('')
        $('setup').focus()
        return
      }
      say(r.message, 'error')
      if (r.resetCheck && widget !== null) { token = ''; window.turnstile.reset(widget) }
    } catch {
      say(unreachable, 'error')
    }
    btn.disabled = false
  })
}

// ---- /alerts/confirm/ ----
function initConfirm() {
  const { t } = parseHash(location.hash)
  if (!isToken(t)) { $('ask').hidden = true; say('This link has no valid token. Open the link from the confirmation mail again.', 'error'); return }
  $('go').addEventListener('click', async () => {
    $('go').disabled = true
    say('Confirming…')
    try {
      const { status, out } = await postJson('/v1/confirm', { token: t })
      const r = confirmOutcome(status, out)
      if (r.state === 'confirmed' || r.state === 'already') {
        $('ask').hidden = true
        $('done').hidden = false
        $('manage').href = r.manage
        say(r.message)
        return
      }
      if (r.state === 'gone') $('ask').hidden = true
      say(r.message, 'error')
      $('go').disabled = !r.retry && r.state === 'gone'
    } catch {
      say(unreachable, 'error')
      $('go').disabled = false
    }
  })
}

// ---- /alerts/manage/ ----
function initManage() {
  const { t, u } = parseHash(location.hash)
  if (!isToken(t)) { say('This link has no valid token. Open the Manage link from one of the alert mails.', 'error'); $('how').hidden = false; return }
  const call = async (path, body) => {
    const { status, out } = await postJson(path, body)
    if (status < 200 || status >= 300) throw new Error(manageError(status, out))
    return out
  }
  const busy = async (btn, fn) => {
    btn.disabled = true
    say('')
    try { await fn() } catch (e) { say(e instanceof TypeError ? unreachable : e.message, 'error') }
    btn.disabled = false
  }
  const gone = () => { $('unsub').hidden = true; $('list').hidden = true; $('gone').hidden = false; say('') }

  function render(subs) {
    const box = $('subs')
    box.textContent = ''
    if (!subs.length) { gone(); return }
    for (const s of subs) {
      const el = document.createElement('article')
      el.className = 'alerts-sub'
      const h = Object.assign(document.createElement('h2'), { textContent: s.title || 'Alert' })
      const rules = Object.assign(document.createElement('p'), { className: 'alerts-sub__rules', textContent: describeRules(s.rules) + (s.status === 'pending' ? ' (not confirmed yet)' : '') })
      const kinds = document.createElement('fieldset')
      kinds.className = 'alerts-checks'
      kinds.append(Object.assign(document.createElement('legend'), { textContent: 'Mail me about' }))
      for (const [k, label] of Object.entries(KINDS)) {
        const l = document.createElement('label')
        l.append(Object.assign(document.createElement('input'), { type: 'checkbox', value: k, checked: (s.kinds ?? []).includes(k) }), ' ', label)
        kinds.append(l)
      }
      const cad = document.createElement('select')
      cad.setAttribute('aria-label', 'How often')
      for (const [v, label] of Object.entries(CADENCES)) cad.append(new Option(label, v, false, s.cadence === v))
      const save = Object.assign(document.createElement('button'), { type: 'button', className: 'btn btn--sm', textContent: 'Save' })
      const del = Object.assign(document.createElement('button'), { type: 'button', className: 'btn btn--sm btn--outline', textContent: 'Delete this alert' })
      save.onclick = () => busy(save, async () => {
        const upd = updateBody(t, s.id, [...kinds.querySelectorAll('input:checked')].map((c) => c.value), cad.value)
        if (!upd.ok) throw new Error(upd.error)
        render((await call('/v1/manage', upd.body)).subscriptions)
        say('Saved.', 'ok')
      })
      del.onclick = () => busy(del, async () => render((await call('/v1/manage', manageBody(t, 'delete', { id: s.id }))).subscriptions))
      const row = document.createElement('div')
      row.className = 'alerts-row'
      row.append(cad, save, del)
      el.append(h, rules, kinds, row)
      box.append(el)
    }
    $('end').hidden = false
  }

  const all = (btn) => busy(btn, async () => { await call('/v1/unsubscribe', { token: t }); gone() })
  $('all').onclick = () => all($('all'))
  $('all2').onclick = () => all($('all2'))
  $('how').hidden = false
  if (u === 'all') $('unsub').hidden = false
  $('list').hidden = false
  // listing changes nothing, so it runs on load; every change is a button press
  say('Loading…')
  call('/v1/manage', manageBody(t, 'list')).then((out) => { say(''); render(out.subscriptions) }, (e) => { $('list').hidden = true; say(e instanceof TypeError ? unreachable : e.message, 'error') })
}

if (typeof document !== 'undefined') {
  const page = document.querySelector('[data-alerts]')?.dataset.alerts
  const init = { form: initForm, confirm: initConfirm, manage: initManage }[page]
  if (init) init()
}
