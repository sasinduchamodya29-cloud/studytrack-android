/* StudyTrack Desktop - Notifications page + the top-bar bell panel (same data / look as the website's notifications.php).
   Data: pages9.php (actions nf_*). Needs js/pages-extra.js (window.StUI) first. Styles: css/pages-notifications.css */
(function () {
  var Pages = window.stPages, TITLES = window.stTitles, api = window.stApi, UI = window.StUI;
  if (!Pages || !api || !UI) return;
  var toast = UI.toast, modal = UI.modal, errPage = UI.errPage;
  TITLES.notifications = 'Notifications';
  var SITE = 'https://edurx.icu/studytrack';

  var TYPES = {
    info:        { icon: 'ℹ️', color: '#818cf8', bg: 'rgba(99,102,241,.1)',  border: 'rgba(99,102,241,.25)' },
    success:     { icon: '✅', color: '#34d399', bg: 'rgba(16,185,129,.1)',  border: 'rgba(16,185,129,.25)' },
    warning:     { icon: '⚠️', color: '#fbbf24', bg: 'rgba(245,158,11,.1)',  border: 'rgba(245,158,11,.25)' },
    danger:      { icon: '🚨', color: '#f87171', bg: 'rgba(239,68,68,.1)',   border: 'rgba(239,68,68,.25)' },
    achievement: { icon: '🏆', color: '#fbbf24', bg: 'rgba(245,158,11,.1)',  border: 'rgba(245,158,11,.25)' },
    streak:      { icon: '🔥', color: '#fb923c', bg: 'rgba(249,115,22,.1)',  border: 'rgba(249,115,22,.25)' },
    reminder:    { icon: '⏰', color: '#22d3ee', bg: 'rgba(6,182,212,.1)',   border: 'rgba(6,182,212,.25)' },
    task:        { icon: '✅', color: '#34d399', bg: 'rgba(16,185,129,.1)',  border: 'rgba(16,185,129,.25)' }
  };
  var BELL_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="color:var(--accent)"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>';
  var TICK = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>';
  var BIN = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg>';

  function esc(s) { return E(String(s == null ? '' : s)); }
  function here() { return location.hash.indexOf('#/notifications') === 0; }
  function cfg(t) { return TYPES[t] || TYPES.info; }
  function ts(s) { return new Date(String(s).replace(' ', 'T')).getTime(); }
  function ago(created, now) {
    var d = Math.max(0, ((now ? ts(now) : Date.now()) - ts(created)) / 1000);
    if (d < 60) return 'just now'; if (d < 3600) return Math.floor(d / 60) + 'm ago'; if (d < 86400) return Math.floor(d / 3600) + 'h ago'; if (d < 604800) return Math.floor(d / 86400) + 'd ago';
    return new Date(ts(created)).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
  /* open a notification's link: app page if we have one, otherwise the website in the browser */
  function go(link) {
    if (!link) return;
    if (/^https?:\/\//i.test(link) && link.indexOf('edurx.icu/studytrack') < 0) return window.st.openExternal(link);
    var r = link.replace(/^https?:\/\/edurx\.icu\/studytrack\/?/i, '').replace(/^\/?(studytrack\/)?/, '').split('?')[0].split('#')[0].replace(/\.php$/, '').replace(/\/$/, '');
    if (r === '' || r === 'home') r = 'dashboard';
    if (Pages[r] || r === 'dashboard') location.hash = '#/' + r; else window.st.openExternal(SITE + '/' + link.replace(/^\/?(studytrack\/)?/, ''));
  }
  function setBadge(n) {
    var b = document.getElementById('notifBadge'); if (!b) return;
    b.textContent = n > 99 ? '99+' : n; b.style.display = n > 0 ? 'inline-flex' : 'none';
    var c = document.getElementById('notifPanelCount'); if (c) c.textContent = n > 0 ? n + ' new' : '';
  }
  function confirmBox(text, okText, run) {
    modal('<div class="px-h"><h3>Delete all notifications?</h3><button data-close class="px-x">✕</button></div><p class="px-p">' + text + '</p><div class="px-btns"><button data-close class="px-sec">Cancel</button><button id="nfOk" class="px-pri dng">' + okText + '</button></div>',
      function (ov, close) { ov.querySelector('#nfOk').onclick = function () { close(); run(); }; });
  }

  /* ── page ──────────────────────────────────────────────────────────── */
  var NF = { items: [], now: '', filter: 'all' };

  Pages.notifications = function (pc) {
    return api('nf_page').then(function (d) {
      if (!here()) return;
      if (!d || !d.success) return errPage(pc, d);
      NF.items = d.items; NF.now = d.now; if (NF.filter !== 'all' && NF.filter !== 'unread') { /* keep */ }
      draw(pc);
    });
  };
  function counts() {
    var unread = NF.items.filter(function (n) { return !n.read; }).length, by = {};
    NF.items.forEach(function (n) { by[n.type] = (by[n.type] || 0) + 1; });
    return { unread: unread, total: NF.items.length, by: by };
  }
  function itemHtml(n, i) {
    var c = cfg(n.type);
    return '<div class="nf-item ' + (n.read ? 'is-read' : 'is-unread') + '" id="nf-' + n.id + '" data-id="' + n.id + '" style="animation-delay:' + Math.min(i * 0.04, 0.3) + 's' + (n.link ? ';cursor:pointer' : '') + '">' +
      '<div class="nf-icon" style="background:' + c.bg + ';border-color:' + c.border + '">' + c.icon + '</div>' +
      '<div class="nf-body"><div class="nf-item-title">' + (n.read ? '' : '<span class="nf-unread-dot"></span>') + esc(n.title) + '</div><div class="nf-message">' + esc(n.message) + '</div>' +
      '<div class="nf-meta"><span class="nf-time">' + ago(n.created_at, NF.now) + '</span><span class="nf-type-badge" style="color:' + c.color + ';background:' + c.bg + ';border-color:' + c.border + '">' + esc(n.type.charAt(0).toUpperCase() + n.type.slice(1)) + '</span></div></div>' +
      '<div class="nf-actions">' + (n.read ? '' : '<button class="nf-btn" data-a="read" title="Mark as read">' + TICK + '</button>') + '<button class="nf-btn danger" data-a="del" title="Delete">' + BIN + '</button></div></div>';
  }
  function visible() {
    return NF.items.filter(function (n) { return NF.filter === 'all' || (NF.filter === 'unread' ? !n.read : n.type === NF.filter); });
  }
  function draw(pc) {
    var k = counts();
    if (NF.filter === 'unread' && !k.unread) NF.filter = 'all';
    if (NF.filter !== 'all' && NF.filter !== 'unread' && !k.by[NF.filter]) NF.filter = 'all';
    var tabs = '<div class="nf-tab' + (NF.filter === 'all' ? ' active' : '') + '" data-f="all">All <span class="nf-tab-count">' + k.total + '</span></div>' +
      (k.unread ? '<div class="nf-tab' + (NF.filter === 'unread' ? ' active' : '') + '" data-f="unread">Unread <span class="nf-tab-count" style="background:rgba(99,102,241,.25)">' + k.unread + '</span></div>' : '') +
      Object.keys(k.by).map(function (t) { return '<div class="nf-tab' + (NF.filter === t ? ' active' : '') + '" data-f="' + esc(t) + '">' + cfg(t).icon + ' ' + esc(t.charAt(0).toUpperCase() + t.slice(1)) + ' <span class="nf-tab-count">' + k.by[t] + '</span></div>'; }).join('');
    var list = visible();
    var body = list.length ? '<div class="nf-list" id="nfList">' + list.map(itemHtml).join('') + '</div>'
      : '<div class="nf-empty"><span class="nf-empty-icon">🔕</span><div class="nf-empty-title">' + (k.total ? 'All clear!' : 'No notifications yet') + '</div><div class="nf-empty-sub">' + (k.total ? 'No notifications to show.' : 'Smart notifications will appear here based on your study activity.') + '</div></div>';
    pc.innerHTML = '<div class="nfx"><div class="nf-header"><div><div class="nf-title">' + BELL_SVG + 'Notifications' + (k.unread ? '<span class="nf-unread-badge">' + k.unread + ' new</span>' : '') + '</div><div class="nf-subtitle">' + k.unread + ' unread · ' + k.total + ' total</div></div>' +
      '<div class="nf-action-bar">' + (k.unread ? '<button class="btn" id="nfAll">' + TICK + '&nbsp;Mark all read</button>' : '') + (k.total ? '<button class="btn" id="nfClr" style="background:rgba(239,68,68,.08);color:var(--danger,#ef4444);border-color:rgba(239,68,68,.2)">' + BIN + '&nbsp;Clear all</button>' : '') + '</div></div>' +
      (k.total ? '<div class="nf-tabs">' + tabs + '</div>' : '') + body + '</div>';
    wire(pc); setBadge(k.unread);
  }
  function byId(id) { return NF.items.find(function (n) { return n.id === id; }); }
  function wire(pc) {
    pc.querySelectorAll('.nf-tab').forEach(function (t) { t.onclick = function () { NF.filter = t.dataset.f; draw(pc); }; });
    pc.querySelectorAll('.nf-item').forEach(function (el) {
      var id = +el.dataset.id, n = byId(id);
      el.onclick = function (e) {
        var a = e.target.closest('[data-a]');
        if (a) {
          e.stopPropagation();
          if (a.dataset.a === 'read') { n.read = true; api('nf_read', { id: id }); draw(pc); }
          else {
            api('nf_delete', { id: id }); el.classList.add('removing');
            setTimeout(function () { NF.items = NF.items.filter(function (x) { return x.id !== id; }); if (here()) draw(pc); }, 320);
          }
          return;
        }
        if (!n.link) return;
        if (!n.read) { n.read = true; api('nf_read', { id: id }); setBadge(counts().unread); }
        go(n.link);
      };
    });
    var all = pc.querySelector('#nfAll');
    if (all) all.onclick = function () { all.disabled = true; api('nf_read_all').then(function () { NF.items.forEach(function (n) { n.read = true; }); if (here()) draw(pc); }); };
    var clr = pc.querySelector('#nfClr');
    if (clr) clr.onclick = function () {
      confirmBox('This cannot be undone.', 'Delete all', function () {
        api('nf_clear').then(function (r) {
          if (!r || !r.success) return toast((r && r.message) || 'Could not clear notifications', 'warn');
          NF.items = NF.items.filter(function (n) { return false; }); if (here()) draw(pc); setBadge(0);
        });
      });
    };
  }

  /* ── top-bar bell (badge + dropdown), driven from app.js ─────────────── */
  var bellBusy = false;
  function bellLoad() {
    if (bellBusy || !document.getElementById('notifBellWrap')) return;
    bellBusy = true;
    api('nf_page', { limit: 30 }).then(function (d) {
      bellBusy = false;
      var l = document.getElementById('notifLoading'), em = document.getElementById('notifEmpty'), er = document.getElementById('notifError'), box = document.getElementById('notifList');
      if (!box) return;
      if (l) l.style.display = 'none';
      if (!d || !d.success) { if (er) er.style.display = 'block'; if (em) em.style.display = 'none'; return; }
      if (er) er.style.display = 'none';
      NF.items = d.items; NF.now = d.now; setBadge(d.unread);
      box.querySelectorAll('.nfb-row').forEach(function (r) { r.remove(); });
      if (em) em.style.display = d.items.length ? 'none' : 'block';
      d.items.slice(0, 8).forEach(function (n) {
        var c = cfg(n.type), r = document.createElement('div'); r.className = 'nfb-row';
        r.style.cssText = 'display:flex;gap:10px;padding:11px 14px;border-bottom:1px solid var(--border);cursor:pointer;' + (n.read ? 'opacity:.7' : 'background:rgba(99,102,241,.05)');
        r.innerHTML = '<div style="width:30px;height:30px;border-radius:9px;display:flex;align-items:center;justify-content:center;flex:none;font-size:14px;background:' + c.bg + '">' + c.icon + '</div><div style="min-width:0;flex:1"><div style="font-size:12.5px;font-weight:700;color:var(--text-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + esc(n.title) + '</div><div style="font-size:11.5px;color:var(--text-secondary);line-height:1.4;max-height:32px;overflow:hidden">' + esc(n.message) + '</div><div style="font-size:10.5px;color:var(--text-muted);margin-top:3px">' + ago(n.created_at, d.now) + '</div></div>';
        r.onclick = function () {
          if (!n.read) { n.read = true; api('nf_read', { id: n.id }); }
          var p = document.getElementById('notifPanel'); if (p) p.style.display = 'none';
          if (n.link) go(n.link); else location.hash = '#/notifications';
        };
        box.appendChild(r);
      });
    });
  }
  function bellReadAll() {
    api('nf_read_all').then(function () { NF.items.forEach(function (n) { n.read = true; }); setBadge(0); bellLoad(); if (here() && document.getElementById('pageContent')) draw(document.getElementById('pageContent')); });
  }
  var poll = null;
  window.stNotif = {
    load: bellLoad, readAll: bellReadAll,
    start: function () { bellLoad(); clearInterval(poll); poll = setInterval(function () { if (!document.hidden) api('nf_page', { limit: 30 }).then(function (d) { if (d && d.success) setBadge(d.unread); }); }, 60000); }
  };
})();
