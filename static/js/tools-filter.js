// Tools gallery: client-side filter, search and sort over the server-rendered cards.
// Pills are grouped by facet (project / kind / status / tech). Within a facet the
// selected values are ORed; across facets they are ANDed; free text is a substring
// match over the card's title, summary, tech and project. State round-trips to the
// URL (?project=calcofi,marinebon&kind=app&tech=r&q=hex&sort=title) so a filtered view
// is shareable and project pages can deep-link to their tools.
(function () {
  var root = document.querySelector('[data-tools-filter]');
  var grid = document.querySelector('[data-tools-grid]');
  if (!root || !grid) return;

  var cards = [].slice.call(grid.querySelectorAll('[data-tool]'));
  var pills = [].slice.call(root.querySelectorAll('[data-facet-pill]'));
  var qEl = root.querySelector('[data-tools-q]');
  var sortEl = root.querySelector('[data-tools-sort]');
  var countEl = root.querySelector('[data-tools-count]');
  var emptyEl = document.querySelector('[data-tools-empty]');
  var clearEls = [].slice.call(document.querySelectorAll('[data-tools-clear]'));
  var FACETS = ['project', 'kind', 'status', 'tech'];

  cards.forEach(function (c) {
    c._f = {};
    FACETS.forEach(function (f) { c._f[f] = (c.dataset[f] || '').split(/\s+/).filter(Boolean); });
    c._text = c.dataset.text || '';
    c._updated = parseInt(c.dataset.updated || '0', 10) || 0;
    c._featured = c.dataset.featured === '1';
    c._title = (c.dataset.title || '').toLowerCase();
  });

  var state = { q: '', sort: 'updated' };
  FACETS.forEach(function (f) { state[f] = []; });

  function readUrl() {
    var p = new URLSearchParams(location.search);
    FACETS.forEach(function (f) {
      var v = p.get(f);
      state[f] = v ? v.split(',').map(function (s) { return s.trim().toLowerCase(); }).filter(Boolean) : [];
    });
    state.q = (p.get('q') || '').trim();
    state.sort = p.get('sort') || 'updated';
  }
  function writeUrl() {
    var p = new URLSearchParams();
    FACETS.forEach(function (f) { if (state[f].length) p.set(f, state[f].join(',')); });
    if (state.q) p.set('q', state.q);
    if (state.sort !== 'updated') p.set('sort', state.sort);
    var qs = p.toString();
    history.replaceState(null, '', location.pathname + (qs ? '?' + qs : '') + location.hash);
  }

  function matches(c) {
    for (var i = 0; i < FACETS.length; i++) {
      var f = FACETS[i], sel = state[f];
      if (!sel.length) continue;
      var any = false;
      for (var j = 0; j < sel.length; j++) if (c._f[f].indexOf(sel[j]) !== -1) { any = true; break; }
      if (!any) return false;
    }
    if (state.q) {
      var terms = state.q.toLowerCase().split(/\s+/).filter(Boolean);
      for (var k = 0; k < terms.length; k++) if (c._text.indexOf(terms[k]) === -1) return false;
    }
    return true;
  }

  function cmp(a, b) {
    if (state.sort === 'title') return a._title < b._title ? -1 : a._title > b._title ? 1 : 0;
    if (state.sort === 'project') {
      var pa = a._f.project[0] || '', pb = b._f.project[0] || '';
      if (pa !== pb) return pa < pb ? -1 : 1;
    }
    // default: featured first, then most recent commit, then title
    if (a._featured !== b._featured) return a._featured ? -1 : 1;
    if (a._updated !== b._updated) return b._updated - a._updated;
    return a._title < b._title ? -1 : a._title > b._title ? 1 : 0;
  }

  function render() {
    var shown = 0;
    var ordered = cards.slice().sort(cmp);
    ordered.forEach(function (c) {
      var ok = matches(c);
      c.hidden = !ok;
      if (ok) shown++;
      grid.appendChild(c); // re-append in sorted order
    });
    pills.forEach(function (p) {
      var on = state[p.dataset.facet].indexOf(p.dataset.value) !== -1;
      p.classList.toggle('is-active', on);
      p.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    var active = state.q || FACETS.some(function (f) { return state[f].length; });
    if (countEl) countEl.textContent = active ? 'Showing ' + shown + ' of ' + cards.length + ' tools' : cards.length + ' tools';
    clearEls.forEach(function (el) { el.hidden = !active; });
    if (emptyEl) emptyEl.hidden = shown !== 0;
    if (sortEl) sortEl.value = state.sort;
    if (qEl && qEl.value !== state.q) qEl.value = state.q;
    writeUrl();
  }

  pills.forEach(function (p) {
    p.addEventListener('click', function () {
      var f = p.dataset.facet, v = p.dataset.value, i = state[f].indexOf(v);
      if (i === -1) state[f].push(v); else state[f].splice(i, 1);
      render();
    });
  });
  var t;
  if (qEl) qEl.addEventListener('input', function () {
    clearTimeout(t);
    t = setTimeout(function () { state.q = qEl.value.trim(); render(); }, 120);
  });
  if (sortEl) sortEl.addEventListener('change', function () { state.sort = sortEl.value; render(); });
  clearEls.forEach(function (el) {
    el.addEventListener('click', function () {
      FACETS.forEach(function (f) { state[f] = []; });
      state.q = '';
      render();
      if (qEl) qEl.focus();
    });
  });
  window.addEventListener('popstate', function () { readUrl(); render(); });

  readUrl();
  render();
})();
