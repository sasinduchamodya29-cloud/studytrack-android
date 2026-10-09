/* StudyTrack Android - replaces preload.js + main.js of the Windows app.
   Provides the same window.st object the UI already uses, but talks to the server with Capacitor's native HTTP
   (no CORS, same X-Auth-Token header), stores the sign-in token in Android storage, and maps files / links / deep links
   to Android. Loaded BEFORE all other scripts (see scripts/prepare-www.js). */
(function () {
  'use strict';
  var BASE = 'https://edurx.icu/studytrack/api/desktop/';
  var UA = 'StudyTrack-Android/1.29.1 (Linux; Android; Mobile)';   // the server's online list shows this as a phone
  var Cap = window.Capacitor || {}, P = Cap.Plugins || {};
  window.__stAndroid = true;
  document.documentElement.classList.add('st-android');

  // same routing table as main.js (order matters)
  var ROUTES = [
    [/^(pu|rv)_/, 'pages16'], [/^up_/, 'pages15'], [/^gd_/, 'pages14'], [/^de_/, 'pages13'], [/^pl_/, 'pages12'],
    [/^sr_/, 'pages11'], [/^sm_/, 'pages10'], [/^(ct|st|pf|nf)_/, 'pages9'], [/^(mu|vn|sf)_/, 'pages8'],
    [/^(sy|qz|mm)_/, 'pages7'], [/^(an|pg|rp|rf|hm)_/, 'pages6'], [/^(lb|ac|spl)_/, 'pages5'], [/^(tt|ex|rm)_/, 'pages4'],
    [/^(gl|pp|nt|bt)_/, 'pages3'], [/^(mk|ch|tk|hb)_/, 'pages2'], [/^(pm|sub)_/, 'pages']
  ];
  function urlFor(action) {
    for (var i = 0; i < ROUTES.length; i++) if (ROUTES[i][0].test(action)) return BASE + ROUTES[i][1] + '.php';
    return BASE + 'index.php';
  }

  // ── sign-in token (Android Preferences; localStorage as fallback) ─────────
  var KEY = 'stAuthToken', token = null, tokenReady = null;
  function loadToken() {
    if (!tokenReady) tokenReady = Promise.resolve().then(function () {
      if (P.Preferences) return P.Preferences.get({ key: KEY }).then(function (r) { token = (r && r.value) || null; });
      try { token = localStorage.getItem(KEY); } catch (e) {}
    }).catch(function () {});
    return tokenReady;
  }
  function saveToken(t) {
    token = t || null;
    try { if (P.Preferences) { if (t) P.Preferences.set({ key: KEY, value: t }); else P.Preferences.remove({ key: KEY }); } } catch (e) {}
    try { if (t) localStorage.setItem(KEY, t); else localStorage.removeItem(KEY); } catch (e) {}
  }

  var maintCb = [];
  function http(opts) {   // -> { status, headers, text }
    if (P.CapacitorHttp) {
      return P.CapacitorHttp.request(Object.assign({ responseType: 'text', connectTimeout: 15000, readTimeout: 25000 }, opts)).then(function (r) {
        return { status: r.status, headers: r.headers || {}, text: typeof r.data === 'string' ? r.data : JSON.stringify(r.data) };
      });
    }
    // browser preview fallback (needs CORS)
    return fetch(opts.url, { method: opts.method || 'GET', headers: opts.headers, body: opts.data ? JSON.stringify(opts.data) : undefined }).then(function (r) {
      return r.text().then(function (t) { var h = {}; r.headers.forEach(function (v, k) { h[k] = v; }); return { status: r.status, headers: h, text: t }; });
    });
  }
  function hdr(h, name) { for (var k in h) if (k.toLowerCase() === name) return h[k]; return null; }

  function api(action, payload) {
    return loadToken().then(function () {
      var headers = { 'Content-Type': 'application/json', 'User-Agent': UA };
      if (token) headers['X-Auth-Token'] = token;
      var body = Object.assign({}, payload || {}, { action: action });
      var isAuth = action === 'login' || action === 'social_poll' || action === 'verify_otp';
      if (isAuth) body.device = 'Android app';
      return http({ url: urlFor(action), method: 'POST', headers: headers, data: body }).then(function (res) {
        if (res.status === 503 && hdr(res.headers, 'x-maintenance') === '1') maintCb.forEach(function (f) { try { f(); } catch (e) {} });
        var data;
        try { data = JSON.parse(res.text); } catch (e) {
          return { success: false, message: 'Unexpected response from the server (HTTP ' + res.status + '): ' + String(res.text).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 160) };
        }
        if (isAuth && data && data.success && data.token) { saveToken(data.token); delete data.token; }
        if (action === 'logout') saveToken(null);
        if (res.status === 403 && data && (data.locked || data.auth === false)) { data.locked = true; delete data.auth; }
        else if (data && data.auth === false) saveToken(null);
        return data;
      });
    }).catch(function (e) {
      return { success: false, offline: true, message: 'Cannot reach StudyTrack (' + (e && e.message ? e.message : 'network error') + '). Please check your internet connection.' };
    });
  }

  // ── files: write to cache, then the Android share sheet (Save to Drive / Files / WhatsApp ...) ──
  function saveFile(name, b64) {
    var safe = String(name || 'report.pdf').replace(/[^\w.\- ]+/g, '_');
    if (!P.Filesystem) return Promise.resolve({ success: false, message: 'File saving is not available on this device.' });
    return P.Filesystem.writeFile({ path: safe, data: String(b64), directory: 'CACHE' }).then(function (r) {
      var done = { success: true, path: safe };
      if (!P.Share) return done;
      return P.Share.share({ title: safe, url: r.uri, dialogTitle: 'Save or share ' + safe }).then(function () { return done; }, function () { return { success: false, canceled: true }; });
    }).catch(function (e) { return { success: false, message: 'Could not save the file: ' + (e && e.message ? e.message : e) }; });
  }

  // ── links / deep links ────────────────────────────────────────────────────
  function openExternal(url) {
    url = String(url || '');
    if (!/^(https:\/\/|mailto:)/i.test(url)) return;
    if (/^mailto:/i.test(url)) { location.href = url; return; }
    if (P.Browser) P.Browser.open({ url: url }); else window.open(url, '_blank');
  }
  var deepCb = [];
  if (P.App) {
    P.App.addListener('appUrlOpen', function (e) { if (e && e.url && /^studytrack:\/\//i.test(e.url)) deepCb.forEach(function (f) { try { f(e.url); } catch (x) {} }); });
    // hardware back: same as the app's own back arrow, exit only from the first screen
    P.App.addListener('backButton', function () {
      var b = document.getElementById('tbBack');
      if (b && !b.disabled) b.click(); else if (P.App.exitApp) P.App.exitApp();
    });
  }

  window.st = {
    api: api,
    hasSession: function () { return loadToken().then(function () { return !!token; }); },
    setTitlebar: function () { return Promise.resolve(); },            // no title bar on Android
    reload: function () { location.reload(); return Promise.resolve(); },
    saveFile: saveFile,
    showInFolder: function () { return Promise.resolve(); },          // saveFile already opened the share sheet
    onDeepLink: function (cb) { deepCb.push(cb); },
    openExternal: openExternal,
    maintenanceStatus: function () {
      return http({ url: 'https://edurx.icu/studytrack/api/maintenance-status.php?_=' + Date.now(), method: 'GET', headers: { 'X-Requested-With': 'XMLHttpRequest', 'Cache-Control': 'no-store', 'User-Agent': UA }, connectTimeout: 10000, readTimeout: 10000 })
        .then(function (r) { var d = JSON.parse(r.text); return { ok: true, maintenance: !!d.maintenance, admin: !!d.admin, html: d.html || null }; })
        .catch(function () { return { ok: false }; });
    },
    onMaintenanceHit: function (cb) { maintCb.push(cb); }
  };
  loadToken();
})();
