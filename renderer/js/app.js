/* StudyTrack Desktop - renderer.
 * The sidebar / topbar / Dashboard / Study Log markup + CSS are ported 1:1 from the website
 * (see templates.js, generated from the site's PHP templates). Data comes from the JSON API. */
(function () {
  var app = document.getElementById('app');
  var shellCtx = null, shellMounted = false, route = null;
  var pageIntervals = [], collecting = false;

  /* ── interval bookkeeping so pages stop their timers when you leave them ── */
  var _si = window.setInterval;
  window.setInterval = function () { var id = _si.apply(window, arguments); if (collecting) pageIntervals.push(id); return id; };
  function clearPageIntervals() { pageIntervals.forEach(function (id) { clearInterval(id); }); pageIntervals = []; }

  function api(action, payload) {
    return Promise.resolve(window.st.api(action, payload || {})).catch(function (e) { return { success: false, message: 'App error: ' + (e && e.message ? e.message : e) }; });
  }
  window.stApi = api;

  /* ── fetch() shim: the site's page scripts call fetch(); here they talk to the API ── */
  window.stFetch = function (url, init) {
    init = init || {};
    var u = String(url || '');
    var fd = init.body, fields = {};
    if (fd && typeof fd.forEach === 'function') fd.forEach(function (v, k) { fields[k] = v; });
    var p;
    if (u.indexOf('dashboard-chart') !== -1) {
      var m = u.match(/period=(\w+)/);
      p = api('dash_chart', { period: m ? m[1] : 'week' });
    } else if (u.indexOf('class-hours') !== -1) {
      p = api('class_add', fields);
    } else if (route === 'study-log') {
      var f2 = Object.assign({}, fields, { action2: fields.action, period: window.__slPeriod || 'week' });
      delete f2.action;
      p = api('sl_post', f2).then(function (d) { return window.SLC.withFragments(d); });
    } else {
      var f3 = Object.assign({}, fields, { action2: fields.action });
      delete f3.action;
      p = api('dash_post', f3);
    }
    return Promise.resolve(p).then(function (d) {
      if (d && d.auth === false) { logoutLocal(); }
      return { json: function () { return Promise.resolve(d); }, ok: true };
    });
  };
  window.stReload = function () { renderRoute(true); };

  /* ── helpers ── */
  function toast(msg) {
    var t = document.getElementById('stDeskToast');
    if (!t) {
      t = document.createElement('div'); t.id = 'stDeskToast';
      t.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);z-index:100000;background:var(--bg-card);border:1px solid var(--border);color:var(--text-primary);padding:11px 18px;border-radius:12px;font-size:13px;font-weight:600;box-shadow:0 12px 40px rgba(0,0,0,.45);display:none';
      document.body.appendChild(t);
    }
    t.textContent = msg; t.style.display = 'block';
    clearTimeout(t._h); t._h = setTimeout(function () { t.style.display = 'none'; }, 3200);
  }

  function execScripts(root) {
    var scripts = Array.prototype.slice.call(root.querySelectorAll('script'));
    scripts.forEach(function (old) {
      var s = document.createElement('script');
      if (old.src) s.src = old.src; else s.textContent = old.textContent;
      old.parentNode.replaceChild(s, old);
    });
  }

  function loadScript(src) {
    return new Promise(function (res) { var s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = res; document.head.appendChild(s); });
  }

  /* ── sign in / sign up / Get Started: see js/auth.js (same design as the website's auth pages) ── */
  function showLogin(msg) {
    window.stAuth.mount({ api: api, message: msg || '' });
  }

  function logoutLocal() { api('logout').then(function () { location.hash = ''; window.st.reload(); }); }

  /* ── shell (sidebar + topbar) ── */
  function notifSetup() {
    window.toggleNotifPanel = function () {
      var p = document.getElementById('notifPanel'); if (!p) return;
      var open = p.style.display === 'block';
      p.style.display = open ? 'none' : 'block';
      if (!open) {
        var l = document.getElementById('notifLoading'), em = document.getElementById('notifEmpty'), er = document.getElementById('notifError');
        if (er) er.style.display = 'none'; if (em) em.style.display = 'none'; if (l) l.style.display = 'block';
        if (window.stNotif) window.stNotif.load(); else { if (l) l.style.display = 'none'; if (em) em.style.display = 'block'; }
      }
    };
    window.notifMarkAllRead = function () { if (window.stNotif) window.stNotif.readAll(); };
    window.loadNotifications = function () { if (window.stNotif) window.stNotif.load(); };
    if (window.stNotif) window.stNotif.start();
    document.addEventListener('click', function (e) {
      var w = document.getElementById('notifBellWrap'), p = document.getElementById('notifPanel');
      if (p && w && !w.contains(e.target)) p.style.display = 'none';
    });
  }

  function mountShell(data) {
    shellCtx = Object.assign({
      siteName: 'StudyTrack', siteUrl: '#', title: 'Dashboard', activePage: '',
      _SESSION: { user_id: 1 }, pdo: null, supportUserUnreadCount: function () { return data.supUnread || 0; },
      __supUnread: data.supUnread || 0
    }, data);
    document.body.classList.remove('st-login-mode');
    /* the shell template opens <div class="main-content"> (the site's footer closes it) */
    app.innerHTML = window.tplShell(shellCtx) + '<div class="page-content" id="pageContent"></div></div>';
    notifSetup();
    execScripts(app);
    return Promise.all([loadScript('js/site-theme-fx.js'), loadScript('js/site-app.js')]).then(function () {
      document.dispatchEvent(new Event('DOMContentLoaded'));
      shellMounted = true;
    });
  }

  /* ── pages ── */
  var TITLES = { dashboard: 'Dashboard', 'study-log': 'Study Log' };
  var Pages = {};
  window.stPages = Pages; window.stTitles = TITLES;   /* extra pages register themselves (js/pages-extra.js) */

  Pages.dashboard = function (pc) {
    return api('dash_full').then(function (d) {
      if (!d || !d.success) return pageError(pc, d);
      var hr = new Date().getHours();
      var ctx = Object.assign({}, d, { siteUrl: '#', _SESSION: shellCtx._SESSION, greetTime: hr < 12 ? 'morning' : (hr < 17 ? 'afternoon' : 'evening') });
      pc.innerHTML = window.tplDash(ctx);
      execScripts(pc);
    });
  };

  var SLC = window.SLC = {
    data: null,
    ctx: function (d) { return Object.assign({}, d, { siteUrl: '#' }); },
    fragments: function (d) {
      var c = SLC.ctx(d);
      return { statsHtml: window.tplSLStats(c), srHtml: window.tplSLSr(c), sessionsHtml: window.tplSLSessions(c) };
    },
    withFragments: function (d) { if (d && d.sessions) { try { Object.assign(d, SLC.fragments(d)); } catch (e) { console.error(e); } } return d; }
  };

  Pages['study-log'] = function (pc, q) {
    var period = q.period || window.__slPeriod || 'week';
    window.__slPeriod = period;
    return api('sl_page', { period: period }).then(function (d) {
      if (!d || !d.success) return pageError(pc, d);
      var ctx = SLC.ctx(d);
      ctx.frag = SLC.fragments(d);
      pc.innerHTML = window.tplSL(ctx);
      execScripts(pc);
    });
  };

  function pageError(pc, d) {
    if (d && d.offline) {
      pc.innerHTML = '<div class="st-ph"><div class="st-ph-ic">📡</div><h2>You\'re offline</h2><p>' + E(d.message) + '</p><button class="st-ph-btn" onclick="stReload()">Try again</button></div>';
    } else {
      pc.innerHTML = '<div class="st-ph"><div class="st-ph-ic">⚠️</div><h2>Something went wrong</h2><p>' + E((d && d.message) || 'Could not load this page.') + '</p><button class="st-ph-btn" onclick="stReload()">Try again</button></div>';
    }
  }

  function placeholder(pc, name) {
    pc.innerHTML = '<div class="st-ph"><div class="st-ph-ic">🛠️</div><h2>' + E(name) + '</h2><p>This page will be added to the desktop app next, with the same design as the website.</p><a class="st-ph-btn" href="#/dashboard">Back to Dashboard</a></div>';
  }

  /* ── router ── */
  function parseHash() {
    var h = (location.hash || '').replace(/^#\/?/, '');
    var parts = h.split('?'); var r = (parts[0] || 'dashboard').replace(/\/+$/, '') || 'dashboard';
    var q = {};
    (parts[1] || '').split('&').forEach(function (kv) { if (!kv) return; var a = kv.split('='); q[decodeURIComponent(a[0])] = decodeURIComponent(a[1] || ''); });
    return { route: r, q: q };
  }

  function setActive(r) {
    document.querySelectorAll('#sidebar a.nav-item').forEach(function (a) {
      var href = (a.getAttribute('href') || '').replace(/^#\/?/, '').replace(/\/+$/, '');
      a.classList.toggle('active', href === r);
    });
    /* top-bar icon buttons (Music, Notifications, Settings, Profile photo) light up for their own page.
       The shell is built once, so the "active" colours it was built with never change - toggle a class instead. */
    document.querySelectorAll('.topbar a[href="#/music"], .topbar a[href="#/settings"], .topbar a[href="#/smart/"], .topbar a.user-avatar, #notifBellBtn').forEach(function (el) {
      var key = el.id === 'notifBellBtn' ? 'notifications' : (el.classList.contains('user-avatar') ? 'profile' : (el.getAttribute('href') || '').replace(/^#\/?/, '').replace(/\/+$/, ''));
      el.classList.toggle('tb-on', key === r || (key === 'smart' && r.indexOf('smart-') === 0 && r !== 'smart-planner'));
    });
    var t = document.querySelector('.topbar-title');
    var nav = document.querySelector('#sidebar a.nav-item[href="#/' + r + '"]');
    var title = TITLES[r] || (nav ? nav.textContent.replace(/\s+/g, ' ').replace(/\b(NEW|Updated)$/, '').trim() : r);
    if (t) t.textContent = title;
    document.title = title + ' - StudyTrack';
  }

  function renderRoute(force) {
    if (!shellMounted) return;
    var p = parseHash();
    route = p.route;
    if (Pages[route]) { try { localStorage.setItem('stLastRoute', '#/' + route); } catch (e) {} }
    var pc = document.getElementById('pageContent');
    clearPageIntervals();
    collecting = true;
    setActive(route);
    pc.innerHTML = '<div class="st-skel"><i></i><i></i><i></i><i></i><i class="w2"></i><i class="w2"></i></div>';
    var done;
    if (Pages[route]) done = Pages[route](pc, p.q);
    else if (route === 'logout') { logoutLocal(); return; }
    else { placeholder(pc, document.querySelector('.topbar-title') ? document.querySelector('.topbar-title').textContent : route); done = Promise.resolve(); }
    Promise.resolve(done).then(function () { pc.classList.remove('st-enter'); void pc.offsetWidth; pc.classList.add('st-enter'); pc.scrollTop = 0; window.scrollTo(0, 0); var mc = document.querySelector('.main-content'); if (mc) mc.scrollTop = 0; });
  }

  window.addEventListener('hashchange', function () { renderRoute(); });

  /* logout link in the sidebar (site uses /logout) */
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href="#/logout"]');
    if (a) { e.preventDefault(); logoutLocal(); }
    var ext = e.target.closest && e.target.closest('a[target="_blank"]');
    if (ext && /^https:\/\//i.test(ext.href)) { e.preventDefault(); window.st.openExternal(ext.href); }
  });

  /* ── boot ── */
  function boot() {
    window.st.hasSession().then(function (has) {
      if (!has) return showLogin();
      api('shell').then(function (d) {
        if (d && d.locked) { setTimeout(boot, 3000); return; }   /* locked / suspended: js/account-status.js shows the screen; keep trying until it lifts */
        if (!d || !d.success) {
          if (d && d.offline) { app.innerHTML = '<div class="st-ph"><div class="st-ph-ic">📡</div><h2>You\'re offline</h2><p>' + E(d.message) + '</p><button class="st-ph-btn" onclick="window.st.reload()">Try again</button></div>'; return; }
          return showLogin(d && d.message);
        }
        mountShell(d).then(function () {
          clearPageIntervals();
          if (!location.hash) { var last = ''; try { last = localStorage.getItem('stLastRoute') || ''; } catch (e) {} location.hash = /^#\/[\w-]+$/.test(last) ? last : '#/dashboard'; }
          renderRoute();
        });
      });
    });
  }
  boot();
})();
