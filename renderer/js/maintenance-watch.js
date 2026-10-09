/* StudyTrack Desktop - Maintenance Mode watcher (same behaviour as the website's assets/js/maintenance-watch.js).
 * When the admin switches Maintenance Mode ON (manual switch or a scheduled window) the app covers itself with the SAME maintenance
 * screen the website shows (the server sends the markup), without a restart and without a refresh. The title bar stays usable.
 * When maintenance is switched OFF the screen goes away and the app reloads itself, so you are straight back where you were.
 * Triggers: a timer (about every 10 s, 6 s while the screen is shown), the window getting focus, the PC coming back online,
 * and any API call that comes back "503 maintenance" (main.js tells this file). Admin accounts are never blocked on the server. */
(function () {
  'use strict';
  if (window.__stMaintWatch || !window.st || !window.st.maintenanceStatus) return;
  window.__stMaintWatch = true;

  var IDLE_MS = 10000, SHOWN_MS = 6000;
  var host = null, shown = false, timer = null, busy = false;

  function theme() { try { return localStorage.getItem('stTheme') || 'dark'; } catch (e) { return 'dark'; } }
  function tbH() { var t = document.getElementById('stTitlebar'); return t ? t.offsetHeight : 0; }

  function show(html) {
    if (!html) return;
    if (!host) {
      host = document.createElement('div');
      host.id = 'st-maint-host';
      host.attachShadow({ mode: 'open' });
      /* links inside the screen (Contact Support, support e-mail) open in the default browser / mail app */
      host.shadowRoot.addEventListener('click', function (e) {
        var a = e.target.closest && e.target.closest('a[href]');
        if (a && /^(https:\/\/|mailto:)/i.test(a.href)) { e.preventDefault(); window.st.openExternal(a.href); }
      });
    }
    host.style.cssText = 'position:fixed;top:' + tbH() + 'px;left:0;right:0;bottom:0;z-index:2147483000;overflow:auto;background:#07070d;';
    if (!shown) {
      host.shadowRoot.innerHTML = html;
      var root = host.shadowRoot.querySelector('.mt-root');
      if (root) { root.setAttribute('data-theme', theme()); root.style.minHeight = '100%'; }
      document.body.appendChild(host);
      try { if (document.activeElement && document.activeElement.blur) document.activeElement.blur(); } catch (e) {}
      try { document.querySelectorAll('audio,video').forEach(function (m) { m.pause(); }); } catch (e) {}
      shown = true;
    }
  }
  function hide() {
    if (!shown) return;
    if (host && host.parentNode) host.parentNode.removeChild(host);
    shown = false;
    /* the pages behind the screen may have failed while the site was down - start fresh (the sign-in is kept) */
    try { window.st.reload(); } catch (e) { location.reload(); }
  }

  function schedule() { clearTimeout(timer); timer = setTimeout(check, (shown ? SHOWN_MS : IDLE_MS) + Math.floor(Math.random() * 2500)); }
  function check() {
    if (busy) return;
    busy = true;
    Promise.resolve(window.st.maintenanceStatus()).then(function (d) {
      if (!d || !d.ok) return;                     /* offline / server hiccup: keep the current state */
      if (d.maintenance && !d.admin) show(d.html); else hide();
    }).catch(function () {}).then(function () { busy = false; schedule(); });
  }

  window.addEventListener('focus', check);
  window.addEventListener('online', check);
  document.addEventListener('visibilitychange', function () { if (!document.hidden) check(); });
  if (window.st.onMaintenanceHit) window.st.onMaintenanceHit(function () { if (!shown) check(); });
  window.addEventListener('resize', function () { if (shown && host) host.style.top = tbH() + 'px'; });
  setTimeout(check, 1200);
})();
