/* StudyTrack Desktop - "app feel": title bar, keyboard shortcuts, offline strip, theme-synced window buttons. */
(function () {
  function $(id) { return document.getElementById(id); }
  var tb = $('stTitlebar');
  if (!tb) return;

  /* ── back / forward / refresh ── */
  var nv = window.navigation;
  function navState() {
    var b = $('tbBack'), f = $('tbFwd');
    if (nv && 'canGoBack' in nv) { b.disabled = !nv.canGoBack; f.disabled = !nv.canGoForward; }
    else { b.disabled = false; f.disabled = false; }
  }
  function goBack() { history.back(); }
  function goFwd() { history.forward(); }
  function refresh() {
    tb.classList.remove('spin'); void tb.offsetWidth; tb.classList.add('spin');
    if ($('pageContent') && window.stReload) window.stReload(); else window.st.reload();
  }
  $('tbBack').onclick = goBack; $('tbFwd').onclick = goFwd; $('tbReload').onclick = refresh;
  window.addEventListener('hashchange', navState);
  if (nv && nv.addEventListener) nv.addEventListener('currententrychange', navState);
  navState();

  /* ── page title in the title bar ── */
  function syncTitle() { $('tbTitle').textContent = (document.title || '').replace(/\s*-\s*StudyTrack$/, '').replace(/^StudyTrack$/, ''); }
  var tEl = document.querySelector('title');
  if (tEl) new MutationObserver(syncTitle).observe(tEl, { childList: true, characterData: true, subtree: true });
  syncTitle();

  /* ── window buttons follow the theme ── */
  function toHex(c) {
    var m = /rgba?\((\d+)[,\s]+(\d+)[,\s]+(\d+)/.exec(c || '');
    if (!m) return '#111118';
    return '#' + [m[1], m[2], m[3]].map(function (n) { return ('0' + (+n).toString(16)).slice(-2); }).join('');
  }
  function syncTheme() {
    requestAnimationFrame(function () {
      var light = document.documentElement.getAttribute('data-theme') === 'light';
      try { window.st.setTitlebar(toHex(getComputedStyle(tb).backgroundColor), light ? '#334155' : '#cbd5e1'); } catch (e) {}
    });
  }
  new MutationObserver(syncTheme).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  syncTheme();

  var root = document.documentElement;

  /* ── keyboard shortcuts ── */
  document.addEventListener('keydown', function (e) {
    var k = e.key, ctrl = e.ctrlKey || e.metaKey;
    if ((ctrl && (k === 'r' || k === 'R')) || k === 'F5') { e.preventDefault(); refresh(); return; }
    if (e.altKey && k === 'ArrowLeft') { e.preventDefault(); goBack(); return; }
    if (e.altKey && k === 'ArrowRight') { e.preventDefault(); goFwd(); return; }
    /* Ctrl+B (collapse sidebar) is handled by the site's own sidebar script */
    if (ctrl && /^[1-9]$/.test(k)) {
      var items = Array.prototype.filter.call(document.querySelectorAll('#sidebar a.nav-item[href^="#/"]'), function (a) { return a.offsetParent !== null; });
      var a = items[+k - 1];
      if (a) { e.preventDefault(); location.hash = a.getAttribute('href'); }
      return;
    }
    if (ctrl && (k === '+' || k === '-' || k === '=' || k === '0')) e.preventDefault(); /* zoom is locked */
  });
  window.addEventListener('wheel', function (e) { if (e.ctrlKey) e.preventDefault(); }, { passive: false });

  /* ── offline strip ── */
  function net() { var o = $('stOffline'); if (o) o.classList.toggle('show', !navigator.onLine); }
  window.addEventListener('online', net); window.addEventListener('offline', net); net();

  /* ── pause background animations when the window is not focused ── */
  window.addEventListener('blur', function () { root.classList.add('st-blur'); });
  window.addEventListener('focus', function () { root.classList.remove('st-blur'); });
})();
