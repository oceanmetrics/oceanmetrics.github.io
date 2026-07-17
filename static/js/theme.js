// light / dark theme toggle — persists choice, defaults to the OS preference
(function () {
  var root = document.documentElement;
  var btn = document.querySelector('[data-theme-toggle]');
  if (!btn) return;
  var mq = window.matchMedia('(prefers-color-scheme: dark)');

  function current() {
    return root.dataset.theme || (mq.matches ? 'dark' : 'light');
  }

  function render() {
    var dark = current() === 'dark';
    btn.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
    btn.setAttribute('title', dark ? 'Switch to light theme' : 'Switch to dark theme');
    btn.innerHTML = '<i class="fas fa-' + (dark ? 'sun' : 'moon') + '" aria-hidden="true"></i>';
  }

  btn.addEventListener('click', function () {
    var next = current() === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    try { localStorage.setItem('om-theme', next); } catch (e) {}
    render();
  });

  // follow the OS while the user hasn't made an explicit choice
  mq.addEventListener('change', function () { if (!root.dataset.theme) render(); });

  render();
})();
