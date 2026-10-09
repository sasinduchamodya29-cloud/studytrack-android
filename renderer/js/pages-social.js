/* StudyTrack Desktop - Leaderboard, Achievements, Smart Planner pages.
 * Native app pages (same look as Goals / Tasks / Timetable). Data: pages5.php (actions lb_*, ac_*, spl_*).
 * Needs js/pages-extra.js (window.StUI helpers) to be loaded first. */
(function () {
  var Pages = window.stPages, TITLES = window.stTitles, api = window.stApi, UI = window.StUI;
  if (!Pages || !api || !UI) return;
  var toast = UI.toast, modal = UI.modal, errPage = UI.errPage, $ = UI.$, lsGet = UI.lsGet, lsSet = UI.lsSet;
  TITLES.leaderboard = 'Leaderboard'; TITLES.achievements = 'Achievements'; TITLES['smart-planner'] = 'Smart Planner';

  var SITE = 'https://edurx.icu/studytrack';
  var TRASH = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>';

  /* ── helpers ─────────────────────────────────────────────────────────── */
  function esc(s) { return E(String(s == null ? '' : s)); }
  function here(route) { return location.hash.indexOf('#/' + route) === 0; }
  function pcEl() { return document.getElementById('pageContent'); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function cssVar(n, d) { var v = getComputedStyle(document.documentElement).getPropertyValue(n).trim(); return v || d; }
  function hm(min) { min = Math.max(0, Math.round(+min || 0)); return Math.floor(min / 60) + 'h ' + pad(min % 60) + 'm'; }
  function fmt(m) { m = Math.max(0, Math.round(+m || 0)); var h = Math.floor(m / 60), r = m % 60; return h > 0 ? (h + 'h' + (r ? ' ' + r + 'min' : '')) : (r + 'min'); }
  function toMin(t) { var p = String(t).split(':'); return (+p[0]) * 60 + (+p[1]); }
  function toSec(t) { var p = String(t).split(':'); return (+p[0]) * 3600 + (+p[1]) * 60 + (+p[2] || 0); }
  function t12(t) { var m = toMin(t), h = Math.floor(m / 60), r = m % 60; return ((h % 12) || 12) + ':' + pad(r) + ' ' + (h < 12 ? 'AM' : 'PM'); }
  function fmtDate(s) { return new Date(s + 'T00:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }); }
  function longDate(s) { return new Date(s + 'T00:00:00Z').toLocaleDateString('en-US', { month: 'long', day: 'numeric', timeZone: 'UTC' }); }
  function shortDate(s) { return new Date(s + 'T00:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }); }
  function emptyBlock(ico, h, p, btn) { return '<div class="mp-empty"><div>' + ico + '</div><h2>' + h + '</h2><p>' + p + '</p>' + (btn || '') + '</div>'; }
  function tile(ico, label, val, c) { return '<div class="mp-tile" style="--c:' + c + '"><div class="mp-tile-i">' + ico + '</div><div><b>' + val + '</b><span>' + label + '</span></div></div>'; }
  function onOff(root, sel, fn) { root.querySelectorAll(sel).forEach(function (el) { el.onclick = function (e) { fn(el, e); }; }); }
  function avatar(name, file, cls) {
    return '<span class="' + (cls || 'lb-av') + '">' + esc((name || '?').charAt(0).toUpperCase()) +
      (file ? '<img src="' + SITE + '/assets/uploads/avatars/' + encodeURIComponent(file) + '" alt="" onerror="this.remove()">' : '') + '</span>';
  }

  /* generic form modal: o = {title, body, ok, danger, cls, mount(ov), collect(ov)->{error}|{action,payload}, action, payload, done, after(d)} */
  function askModal(o) {
    return modal('<div class="px-h"><h3>' + o.title + '</h3><button data-close class="px-x">✕</button></div><div class="px-err" id="pxErr"></div>' + o.body +
      '<div class="px-btns"><button data-close class="px-sec">Cancel</button><button id="pxOk" class="px-pri' + (o.danger ? ' dng' : '') + '">' + o.ok + '</button></div>',
      function (ov, close) {
        if (o.cls) ov.firstChild.classList.add(o.cls);
        if (o.mount) o.mount(ov);
        var err = ov.querySelector('#pxErr'), ok = ov.querySelector('#pxOk');
        function submit() {
          err.style.display = 'none';
          var r = o.collect ? o.collect(ov) : { action: o.action, payload: o.payload };
          if (r.error) { err.textContent = r.error; err.style.display = 'block'; return; }
          ok.disabled = true; ok.textContent = 'Saving…';
          api(r.action, r.payload).then(function (d) {
            if (d && d.success) { close(); toast(d.message || o.done || 'Done', 'ok'); if (o.after) o.after(d); }
            else { ok.disabled = false; ok.textContent = o.ok; err.textContent = (d && d.message) || 'Something went wrong.'; err.style.display = 'block'; }
          });
        }
        ok.onclick = submit;
        ov.addEventListener('keydown', function (e) { if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA' && e.target.tagName !== 'SELECT') { e.preventDefault(); submit(); } });
        var f = ov.querySelector('[data-focus]'); if (f) setTimeout(function () { f.focus(); }, 60);
      });
  }
  function confirmModal(title, text, okText, action, payload, after) {
    askModal({ title: title, body: '<p class="px-p">' + text + '</p>', ok: okText, danger: true, action: action, payload: payload, after: after });
  }

  /* ════════════════════════════════════════════════════════════════════
     LEADERBOARD
     ════════════════════════════════════════════════════════════════════ */
  var LB = { d: null, period: lsGet('lb_period', 'daily') };
  if (['daily', 'weekly', 'monthly'].indexOf(LB.period) === -1) LB.period = 'daily';
  var PLABEL = { daily: 'today', weekly: 'this week', monthly: 'this month' };
  var MEDAL = ['🥇', '🥈', '🥉'];

  Pages.leaderboard = function (pc) {
    return api('lb_page').then(function (d) {
      if (!d || !d.success) return errPage(pc, d);
      LB.d = d; drawLb(pc);
      setInterval(function () {                                   /* quiet refresh, like the Daily Battle board */
        if (!here('leaderboard') || document.querySelector('.px-ov')) return;
        api('lb_page').then(function (n) { if (n && n.success && here('leaderboard') && !document.querySelector('.px-ov')) { LB.d = n; drawLb(pcEl()); } });
      }, 45000);
    });
  };
  function lbReload() { return api('lb_page').then(function (d) { if (d && d.success && here('leaderboard') && pcEl()) { LB.d = d; drawLb(pcEl()); } return d; }); }

  function drawLb(pc) {
    var d = LB.d, board = d.boards[LB.period], lim = d.limit;
    var max = Math.max.apply(null, board.map(function (r) { return r.period_mins; }).concat([1]));
    var myIdx = 0; board.forEach(function (r, i) { if (r.is_me) myIdx = i; });
    var me = board[myIdx], gap;
    if (board.length < 2) gap = '—';
    else if (myIdx === 0) gap = '+' + hm(me.period_mins - board[1].period_mins);
    else gap = '-' + hm(board[myIdx - 1].period_mins - me.period_mins);
    var head = '<div class="mp-head"><p>Compare your study hours with friends</p><div class="mp-head-r">' +
      (lim.is_pro ? '' : '<span class="mp-lim' + (lim.used >= lim.limit ? ' full' : '') + '">Friends ' + lim.used + ' / ' + lim.limit + '</span>') +
      '<button class="mp-add" id="lbAdd">＋ Add Friend</button></div></div>';
    var tiles = '<div class="mp-tiles four">' + tile('🏅', 'Your rank ' + PLABEL[LB.period], '#' + (myIdx + 1) + ' <small>of ' + board.length + '</small>', '#f59e0b') +
      tile('⏱️', 'Your study time', hm(me.period_mins), '#6366f1') +
      tile(myIdx === 0 ? '👑' : '🎯', board.length < 2 ? 'Add friends to compete' : (myIdx === 0 ? 'Lead over 2nd place' : 'Behind the one above'), gap, myIdx === 0 ? '#10b981' : '#ef4444') +
      tile('👥', 'Friends', board.length - 1, '#06b6d4') + '</div>';

    var inc = d.incoming.length ? '<div class="mp-card lb-pend in"><div class="mp-card-t"><span>🔔 Pending friend requests</span><span>' + d.incoming.length + '</span></div>' +
      d.incoming.map(function (r) {
        return '<div class="lb-req">' + avatar(r.name) + '<b>' + esc(r.name) + '</b><div class="lb-req-b"><button class="mp-mini ok" data-acc="' + r.id + '">✓ Accept</button><button class="mp-mini" data-rej="' + r.id + '">✕ Decline</button></div></div>';
      }).join('') + '</div>' : '';
    var snt = d.sent.length ? '<div class="mp-card lb-pend"><div class="mp-card-t"><span>📤 Sent requests</span><span>' + d.sent.length + '</span></div>' +
      d.sent.map(function (r) {
        return '<div class="lb-req">' + avatar(r.name) + '<b>' + esc(r.name) + '</b><div class="lb-req-b"><span class="lb-wait">⏳ Pending</span><button class="mp-mini" data-can="' + r.id + '">Cancel</button></div></div>';
      }).join('') + '</div>' : '';

    var rows;
    if (board.length <= 1 && !board[0].period_mins) {
      rows = emptyBlock('📚', 'No data yet', board.length <= 1 ? 'Add friends and log study sessions — ' + PLABEL[LB.period] + ' rankings will appear here.' : 'Study sessions logged ' + PLABEL[LB.period] + ' will appear here.', '<button class="mp-add" id="lbAdd2">＋ Add Friend</button>');
    } else {
      rows = '<div class="lb-list">' + board.map(function (u, i) {
        var rk = i + 1;
        return '<div class="lb-row' + (u.is_me ? ' me' : '') + (rk <= 3 ? ' r' + rk : '') + '">' +
          '<div class="lb-rank">' + (rk <= 3 ? MEDAL[i] : '#' + rk) + '</div>' + avatar(u.name, u.avatar) +
          '<div class="lb-mid"><b>' + esc(u.name) + (u.is_me ? ' <em>(You)</em>' : '') + '</b><span>' + u.total_sessions + ' sessions · ' + u.badges + ' badges · ' + u.xp + ' XP</span>' +
          '<div class="mp-bar"><i style="width:' + Math.round(u.period_mins / max * 100) + '%"></i></div></div>' +
          '<div class="lb-time"><b>' + hm(u.period_mins) + '</b><span>' + PLABEL[LB.period] + '</span></div>' +
          (u.is_me ? '<span class="lb-x"></span>' : '<button class="mp-ib dng lb-x" data-rm="' + u.id + '" data-nm="' + esc(u.name) + '" title="Remove friend">✕</button>') + '</div>';
      }).join('') + '</div>';
    }
    var tabs = '<div class="mp-tabs">' + ['daily', 'weekly', 'monthly'].map(function (p) {
      return '<button data-p="' + p + '" class="' + (p === LB.period ? 'on' : '') + '">' + { daily: '📅 Daily', weekly: '📆 Weekly', monthly: '🗓️ Monthly' }[p] + '</button>';
    }).join('') + '</div>';
    pc.innerHTML = '<div class="mp lb">' + head + tiles + inc + snt +
      '<div class="mp-card"><div class="mp-card-t lb-rh"><span>🏆 Rankings</span>' + tabs + '</div>' +
      '<p class="mp-note lb-note">Daily resets at midnight · Weekly resets every Monday · Monthly resets on the 1st</p>' + rows + '</div></div>';

    $('#lbAdd', pc).onclick = addFriendModal; if ($('#lbAdd2', pc)) $('#lbAdd2', pc).onclick = addFriendModal;
    onOff(pc, '[data-p]', function (b) { LB.period = b.dataset.p; lsSet('lb_period', LB.period); drawLb(pc); });
    onOff(pc, '[data-acc]', function (b) { respond(b, 'lb_accept', { id: +b.dataset.acc }); });
    onOff(pc, '[data-rej]', function (b) { respond(b, 'lb_reject', { id: +b.dataset.rej }); });
    onOff(pc, '[data-can]', function (b) { respond(b, 'lb_cancel', { id: +b.dataset.can }); });
    onOff(pc, '[data-rm]', function (b) { confirmModal('Remove friend', 'Remove <b>' + b.dataset.nm + '</b> from your friends?', 'Remove', 'lb_remove', { friend_id: +b.dataset.rm }, lbReload); });
  }
  function respond(btn, action, payload) {
    btn.disabled = true;
    api(action, payload).then(function (d) {
      if (d && d.success) { toast(d.message || 'Done', 'ok'); lbReload(); }
      else { btn.disabled = false; toast((d && d.message) || 'Something went wrong', 'warn'); }
    });
  }

  function addFriendModal() {
    modal('<div class="px-h"><h3>👥 Add Friend</h3><button data-close class="px-x">✕</button></div><div class="px-err" id="pxErr"></div>' +
      '<input id="lbQ" class="lb-q" placeholder="Search by name or username…" data-focus autocomplete="off">' +
      '<div class="lb-ucount" id="lbCount"></div><div class="lb-ulist" id="lbUl"></div><div id="lbById"></div>',
      function (ov) {
        ov.firstChild.classList.add('lb-modal');
        var q = ov.querySelector('#lbQ'), ul = ov.querySelector('#lbUl'), cnt = ov.querySelector('#lbCount'), byId = ov.querySelector('#lbById'), err = ov.querySelector('#pxErr'), timer = null, seq = 0;
        function showErr(m) { err.textContent = m; err.style.display = 'block'; }
        function btnFor(u) {
          if (u.rel === 'friends') return '<button class="lb-ab fr" disabled>✓ Friends</button>';
          if (u.rel === 'sent') return '<button class="lb-ab pe" disabled>⏳ Pending</button>';
          if (u.rel === 'incoming') return '<button class="lb-ab in" data-acc="' + u.fr_id + '">✓ Accept</button>';
          return '<button class="lb-ab add" data-add="' + u.id + '">＋ Add</button>';
        }
        function load() {
          var my = ++seq, val = q.value.trim();
          api('lb_users', { q: val }).then(function (d) {
            if (my !== seq) return;
            if (!d || !d.success) { ul.innerHTML = ''; return showErr((d && d.message) || 'Could not load users.'); }
            cnt.textContent = d.users.length + (val ? ' match' + (d.users.length === 1 ? '' : 'es') : ' users — most active first');
            ul.innerHTML = d.users.length ? d.users.map(function (u) {
              return '<div class="lb-uc">' + avatar(u.name, u.avatar, 'lb-av sm') + '<div class="lb-ui"><b>' + esc(u.name) + (u.username ? ' <i>@' + esc(u.username) + '</i>' : '') + '</b>' +
                '<span>Total: <em>' + hm(u.total) + '</em> · This week: <em>' + hm(u.week) + '</em></span></div>' + btnFor(u) + '</div>';
            }).join('') : '<div class="lb-none">👤<br>No verified user found.</div>';
            byId.innerHTML = (val && !d.users.length) || val.indexOf('@') > 0 ? '<button class="mp-add sec lb-byid" id="lbSendId">Send request to “' + esc(val) + '” (email or username)</button>' : '';
            if (byId.firstChild) byId.firstChild.onclick = function () {
              var b = this; b.disabled = true; err.style.display = 'none';
              api('lb_send', { identifier: val }).then(function (r) {
                if (r && r.success) { toast(r.message, 'ok'); lbReload(); load(); } else { b.disabled = false; showErr((r && r.message) || 'Could not send.'); }
              });
            };
            ul.querySelectorAll('[data-add]').forEach(function (b) {
              b.onclick = function () {
                b.disabled = true; b.textContent = '…'; err.style.display = 'none';
                api('lb_send', { user_id: +b.dataset.add }).then(function (r) {
                  if (r && r.success) { b.className = 'lb-ab pe'; b.textContent = '⏳ Pending'; toast(r.message, 'ok'); lbReload(); }
                  else { b.disabled = false; b.textContent = '＋ Add'; showErr((r && r.message) || 'Could not send.'); }
                });
              };
            });
            ul.querySelectorAll('[data-acc]').forEach(function (b) {
              b.onclick = function () {
                b.disabled = true; err.style.display = 'none';
                api('lb_accept', { id: +b.dataset.acc }).then(function (r) {
                  if (r && r.success) { toast(r.message, 'ok'); lbReload(); load(); } else { b.disabled = false; showErr((r && r.message) || 'Could not accept.'); }
                });
              };
            });
          });
        }
        q.oninput = function () { clearTimeout(timer); timer = setTimeout(load, 250); };
        load();
      });
  }

  /* ════════════════════════════════════════════════════════════════════
     ACHIEVEMENTS
     ════════════════════════════════════════════════════════════════════ */
  var AC = { d: null, tab: 'all' };
  Pages.achievements = function (pc) {
    return api('ac_page').then(function (d) {
      if (!d || !d.success) return errPage(pc, d);
      AC.d = d; drawAc(pc);
      (d.newly || []).forEach(function (n, i) { setTimeout(function () { toast('🏆 Achievement unlocked: ' + n.title + ' (+' + n.xp + ' XP)', 'ok'); }, 500 + i * 1500); });
    });
  };
  function drawAc(pc) {
    var d = AC.d, items = d.items, got = items.filter(function (a) { return a.earned; });
    var list = items.filter(function (a) { return AC.tab === 'all' || (AC.tab === 'done' ? a.earned : !a.earned); });
    var lv = Math.max(1, +d.level || 1), into = Math.max(0, Math.min(99, +d.xpInto || 0));
    var xp = '<div class="mp-card acx-card"><div class="ac-lv"><small>LEVEL</small>' + lv + '</div><div class="ac-xp-m"><b>Level ' + lv + '</b><span>' + into + ' / 100 XP · ' + (100 - into) + ' XP to Level ' + (lv + 1) + '</span>' +
      '<div class="mp-bar ac-bar"><i style="width:' + into + '%"></i></div><div class="ac-lvs"><em>Level ' + lv + '</em><em>Level ' + (lv + 1) + '</em></div></div><div class="ac-xp-t"><b>' + d.xp + '</b><span>Total XP</span></div></div>';
    var tabs = '<div class="mp-tabs">' + ['daily', 'weekly', 'monthly'].map(function (p) {
      return '<button data-p="' + p + '" class="' + (p === LB.period ? 'on' : '') + '">' + { daily: '📅 Daily', weekly: '📆 Weekly', monthly: '🗓️ Monthly' }[p] + '</button>';
    }).join('') + '</div>';
    pc.innerHTML = '<div class="mp lb">' + head + tiles + inc + snt +
      '<div class="mp-card"><div class="mp-card-t lb-rh"><span>🏆 Rankings</span>' + tabs + '</div>' +
      '<p class="mp-note lb-note">Daily resets at midnight · Weekly resets every Monday · Monthly resets on the 1st</p>' + rows + '</div></div>';

    $('#lbAdd', pc).onclick = addFriendModal; if ($('#lbAdd2', pc)) $('#lbAdd2', pc).onclick = addFriendModal;
    onOff(pc, '[data-p]', function (b) { LB.period = b.dataset.p; lsSet('lb_period', LB.period); drawLb(pc); });
    onOff(pc, '[data-acc]', function (b) { respond(b, 'lb_accept', { id: +b.dataset.acc }); });
    onOff(pc, '[data-rej]', function (b) { respond(b, 'lb_reject', { id: +b.dataset.rej }); });
    onOff(pc, '[data-can]', function (b) { respond(b, 'lb_cancel', { id: +b.dataset.can }); });
    onOff(pc, '[data-rm]', function (b) { confirmModal('Remove friend', 'Remove <b>' + b.dataset.nm + '</b> from your friends?', 'Remove', 'lb_remove', { friend_id: +b.dataset.rm }, lbReload); });
  }
  function respond(btn, action, payload) {
    btn.disabled = true;
    api(action, payload).then(function (d) {
      if (d && d.success) { toast(d.message || 'Done', 'ok'); lbReload(); }
      else { btn.disabled = false; toast((d && d.message) || 'Something went wrong', 'warn'); }
    });
  }

  function addFriendModal() {
    modal('<div class="px-h"><h3>👥 Add Friend</h3><button data-close class="px-x">✕</button></div><div class="px-err" id="pxErr"></div>' +
      '<input id="lbQ" class="lb-q" placeholder="Search by name or username…" data-focus autocomplete="off">' +
      '<div class="lb-ucount" id="lbCount"></div><div class="lb-ulist" id="lbUl"></div><div id="lbById"></div>',
      function (ov) {
        ov.firstChild.classList.add('lb-modal');
        var q = ov.querySelector('#lbQ'), ul = ov.querySelector('#lbUl'), cnt = ov.querySelector('#lbCount'), byId = ov.querySelector('#lbById'), err = ov.querySelector('#pxErr'), timer = null, seq = 0;
        function showErr(m) { err.textContent = m; err.style.display = 'block'; }
        function btnFor(u) {
          if (u.rel === 'friends') return '<button class="lb-ab fr" disabled>✓ Friends</button>';
          if (u.rel === 'sent') return '<button class="lb-ab pe" disabled>⏳ Pending</button>';
          if (u.rel === 'incoming') return '<button class="lb-ab in" data-acc="' + u.fr_id + '">✓ Accept</button>';
          return '<button class="lb-ab add" data-add="' + u.id + '">＋ Add</button>';
        }
        function load() {
          var my = ++seq, val = q.value.trim();
          api('lb_users', { q: val }).then(function (d) {
            if (my !== seq) return;
            if (!d || !d.success) { ul.innerHTML = ''; return showErr((d && d.message) || 'Could not load users.'); }
            cnt.textContent = d.users.length + (val ? ' match' + (d.users.length === 1 ? '' : 'es') : ' users — most active first');
            ul.innerHTML = d.users.length ? d.users.map(function (u) {
              return '<div class="lb-uc">' + avatar(u.name, u.avatar, 'lb-av sm') + '<div class="lb-ui"><b>' + esc(u.name) + (u.username ? ' <i>@' + esc(u.username) + '</i>' : '') + '</b>' +
                '<span>Total: <em>' + hm(u.total) + '</em> · This week: <em>' + hm(u.week) + '</em></span></div>' + btnFor(u) + '</div>';
            }).join('') : '<div class="lb-none">👤<br>No verified user found.</div>';
            byId.innerHTML = (val && !d.users.length) || val.indexOf('@') > 0 ? '<button class="mp-add sec lb-byid" id="lbSendId">Send request to “' + esc(val) + '” (email or username)</button>' : '';
            if (byId.firstChild) byId.firstChild.onclick = function () {
              var b = this; b.disabled = true; err.style.display = 'none';
              api('lb_send', { identifier: val }).then(function (r) {
                if (r && r.success) { toast(r.message, 'ok'); lbReload(); load(); } else { b.disabled = false; showErr((r && r.message) || 'Could not send.'); }
              });
            };
            ul.querySelectorAll('[data-add]').forEach(function (b) {
              b.onclick = function () {
                b.disabled = true; b.textContent = '…'; err.style.display = 'none';
                api('lb_send', { user_id: +b.dataset.add }).then(function (r) {
                  if (r && r.success) { b.className = 'lb-ab pe'; b.textContent = '⏳ Pending'; toast(r.message, 'ok'); lbReload(); }
                  else { b.disabled = false; b.textContent = '＋ Add'; showErr((r && r.message) || 'Could not send.'); }
                });
              };
            });
            ul.querySelectorAll('[data-acc]').forEach(function (b) {
              b.onclick = function () {
                b.disabled = true; err.style.display = 'none';
                api('lb_accept', { id: +b.dataset.acc }).then(function (r) {
                  if (r && r.success) { toast(r.message, 'ok'); lbReload(); load(); } else { b.disabled = false; showErr((r && r.message) || 'Could not accept.'); }
                });
              };
            });
          });
        }
        q.oninput = function () { clearTimeout(timer); timer = setTimeout(load, 250); };
        load();
      });
  }

  /* ════════════════════════════════════════════════════════════════════
     ACHIEVEMENTS
     ════════════════════════════════════════════════════════════════════ */
  var AC = { d: null, tab: 'all' };
  Pages.achievements = function (pc) {
    return api('ac_page').then(function (d) {
      if (!d || !d.success) return errPage(pc, d);
      AC.d = d; drawAc(pc);
      (d.newly || []).forEach(function (n, i) { setTimeout(function () { toast('🏆 Achievement unlocked: ' + n.title + ' (+' + n.xp + ' XP)', 'ok'); }, 500 + i * 1500); });
    });
  };
  function drawAc(pc) {
    var d = AC.d, items = d.items, got = items.filter(function (a) { return a.earned; });
    var list = items.filter(function (a) { return AC.tab === 'all' || (AC.tab === 'done' ? a.earned : !a.earned); });
    var xp = '<div class="mp-card acx-card"><div class="ac-lv">' + d.level + '</div><div class="ac-xp-m"><b>Level ' + d.level + '</b><span>' + d.xp + ' XP · ' + (100 - d.xpInto) + ' XP to next level</span>' +
      '<div class="mp-bar ac-bar"><i style="width:' + d.xpInto + '%"></i></div></div><div class="ac-xp-t"><b>' + d.xp + '</b><span>Total XP</span></div></div>';
    var tabs = '<div class="mp-tabs">' + [['all', 'All', items.length], ['done', 'Unlocked', got.length], ['lock', 'Locked', items.length - got.length]].map(function (t) {
      return '<button data-t="' + t[0] + '" class="' + (AC.tab === t[0] ? 'on' : '') + '">' + t[1] + ' <em>' + t[2] + '</em></button>';
    }).join('') + '</div>';
    var grid = list.length ? '<div class="ac-grid">' + list.map(function (a) {
      var foot;
      if (a.earned) foot = '<div class="ac-f"><span class="ac-b ok">✓ Earned</span><small>' + fmtDate(a.earned) + '</small></div>';
      else {
        var pct = a.cur == null ? 0 : Math.min(100, Math.round(a.cur / Math.max(1, a.need) * 100));
        foot = (a.cur == null ? '' : '<div class="mp-bar"><i style="width:' + pct + '%"></i></div><div class="ac-pr">' + Math.min(a.cur, a.need) + ' / ' + a.need + '</div>') +
          '<div class="ac-f"><span class="ac-b">🔒 Locked</span><strong>+' + a.xp_reward + ' XP</strong></div>';
      }
      return '<div class="ac-card' + (a.earned ? ' on' : '') + '"><div class="ac-ic">' + esc(a.icon) + '</div><h4>' + esc(a.title) + '</h4><p>' + esc(a.description) + '</p>' + foot + '</div>';
    }).join('') + '</div>' : emptyBlock('🏆', AC.tab === 'done' ? 'Nothing unlocked yet' : 'Everything unlocked!', AC.tab === 'done' ? 'Keep studying — your first badge is close.' : 'You have earned every achievement. Amazing!');
    pc.innerHTML = '<div class="mp ac"><div class="mp-head"><p>' + got.length + ' / ' + items.length + ' unlocked</p><div class="mp-head-r">' + tabs + '</div></div>' + xp + grid + '</div>';
    onOff(pc, '[data-t]', function (b) { AC.tab = b.dataset.t; drawAc(pc); });
  }

  /* ════════════════════════════════════════════════════════════════════
     SMART PLANNER  (Pro)
     ════════════════════════════════════════════════════════════════════ */
  var SP = { data: null, at: 0, nowSec: 0, ro: false, demo: false, date: '', view: lsGet('spx_view3', 'table') === 'list' ? 'list' : 'table', chart: null, gen: 0, lastSub: lsGet('spx_lastsub', ''), sig: '' };
  function spNow() { return SP.demo ? (function () { var n = new Date(); return n.getHours() * 3600 + n.getMinutes() * 60 + n.getSeconds(); })() : SP.nowSec + (Date.now() - SP.at) / 1000; }

  function calcDay(rows, isToday, nowSec) {
    var day = { entries: [], sleeps: [], planned: 0, studied: 0, wasted: 0, sleep: 0, by: {} };
    rows.forEach(function (r) {
      if (r.kind === 'sleep') { day.sleeps.push(r); day.sleep += r.planned; return; }
      var elapsed = isToday ? toSec(r.end) <= nowSec : true;
      var studied = r.studied || 0;
      var wasted = r.status === 'done' ? Math.max(0, r.planned - studied) : (elapsed ? r.planned : 0);
      var e = Object.assign({}, r, { elapsed: elapsed, wasted: wasted, st: studied });
      day.entries.push(e); day.planned += r.planned; day.studied += studied; day.wasted += wasted;
      var b = day.by[r.subject] || (day.by[r.subject] = { name: r.subject, color: r.color, planned: 0, studied: 0 });
      b.planned += r.planned; b.studied += studied;
    });
    day.pct = day.planned > 0 ? Math.round(Math.min(100, day.studied / day.planned * 100)) : 0;
    return day;
  }
  function spToday() { return calcDay(SP.data.todayRows, true, spNow()); }
  function spView() { if (SP.demo) return spToday(); return SP.ro ? calcDay(SP.data.viewRows || SP.data.todayRows, false, 0) : spToday(); }

  /* demo data (view-only, same sample as the website's demo) */
  function demoData() {
    var d = new Date(), today = d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
    function mk(id, sub, color, topic, s, e, p, st, status) { return { id: id, subject_id: id, topic: topic, start: s, end: e, planned: p, studied: st, status: status || 'done', kind: 'study', subject: sub, color: color }; }
    var rows = [mk(1, 'Physics', '#6366f1', 'Mechanics — Past Paper', '06:30', '07:30', 60, 55), mk(2, 'Chemistry', '#10b981', 'Atomic Structure Review', '09:00', '10:00', 60, 48),
      mk(3, 'Combined Maths', '#f59e0b', 'Differentiation Practice', '14:00', '15:30', 90, 72), mk(4, 'Physics', '#6366f1', 'Waves — MCQ Practice', '19:00', '20:00', 60, null, 'pending'),
      { id: 5, subject_id: 0, topic: 'Sleep', start: '22:30', end: '06:00', planned: 450, studied: null, status: 'done', kind: 'sleep', subject: 'Sleep', color: '#6366f1' }];
    return { today: today, yesterday: today, now: '12:00:00', subjects: [], todayRows: rows, yesterdayRows: rows };
  }

  Pages['smart-planner'] = function (pc, q) {
    return api('spl_page', { date: q.date || '' }).then(function (d) {
      if (!d || !d.success) return errPage(pc, d);
      if (!d.pro) {
        if (q.demo === '1') { SP.demo = true; SP.ro = true; SP.data = demoData(); SP.date = SP.data.today; return drawSp(pc); }
        return drawLock(pc);
      }
      SP.demo = false; spSet(d.data); drawSp(pc);
    });
  };
  function spSet(data) {
    SP.data = data; SP.at = Date.now(); SP.nowSec = toSec(data.now);
    SP.ro = !!data.viewRows; SP.date = data.viewDate || data.today;
  }

  function drawLock(pc) {
    pc.innerHTML = '<div class="mp"><div class="spl-lock"><i class="spl-sp s1"></i><i class="spl-sp s2"></i><i class="spl-sp s3"></i>' +
      '<div class="spl-lock-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/><path d="M12 14v3"/></svg></div>' +
      '<div class="spl-badge">✦ Pro Feature</div><h1>Smart Planner is <span>Pro Only</span></h1>' +
      '<p>Turn your study time into a structured daily plan, track what you actually studied, and see your progress at a glance. Upgrade to Pro to unlock Smart Planner.</p>' +
      '<div class="spl-chips"><span>🗓 Daily planning</span><span>⏱ Study time tracking</span><span>📊 Study vs wasted time</span><span>😴 Sleep planning</span></div>' +
      '<div class="spl-lock-b"><button class="mp-add" id="spUp">Upgrade to Pro →</button><button class="mp-add sec" id="spDemo">▶ Try Smart Planner Demo</button></div></div></div>';
    $('#spUp', pc).onclick = function () { window.st.openExternal(SITE + '/upgrade.php'); };
    $('#spDemo', pc).onclick = function () { location.hash = '#/smart-planner?demo=1'; };
  }

  /* ── render pieces ──────────────────────────────────────────────────── */
  var SVG = {
    cal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
    ok: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
    bad: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
    clk: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 2a10 10 0 1 0 10 10"/><path d="M12 2v10l7 4"/></svg>'
  };
  function statsHtml(d, ro) {
    return tile(SVG.cal, ro ? 'Planned' : 'Planned today', fmt(d.planned), '#6366f1') + tile(SVG.ok, ro ? 'Studied' : 'Studied so far', fmt(d.studied), '#10b981') +
      tile(SVG.bad, ro ? 'Wasted' : 'Wasted so far', fmt(d.wasted), '#ef4444') + tile(SVG.clk, 'Plan followed', d.pct + '%', '#f97316');
  }
  function actBtns(r, ro) {
    if (ro) return '';
    return (r.status === 'done' ? '<button class="mp-ib" data-reopen="' + r.id + '" title="Edit">✎</button>' : '<button class="mp-mini" data-log="' + r.id + '" data-pl="' + r.planned + '">Log time</button>') +
      '<button class="mp-ib dng" data-del="' + r.id + '" title="Delete">' + TRASH + '</button>';
  }
  function listHtml(d, ro) {
    if (!d.entries.length && !d.sleeps.length) return emptyBlock('🗓️', ro ? 'Nothing was planned this day' : 'No plan blocks yet', ro ? 'There are no time blocks saved for this date.' : "Add your first time block for today — pick a subject, a time slot, and what you'll study.", ro ? '' : '<button class="mp-add" data-addblk>＋ Add block</button>');
    var h = d.sleeps.map(function (r) {
      return '<div class="spl-row sleep"><i class="spl-dot" style="background:#6366f1"></i><div class="spl-rm"><small>' + t12(r.start) + ' – ' + t12(r.end) + '</small><b>😴 Sleep</b><span>Not counted as study time</span></div>' +
        '<div class="spl-res">' + fmt(r.planned) + '<small>slept</small></div>' + (ro ? '' : '<button class="mp-ib dng" data-del="' + r.id + '" title="Delete">' + TRASH + '</button>') + '</div>';
    }).join('');
    return h + d.entries.map(function (r) {
      var done = r.status === 'done', on = r.wasted === 0;
      return '<div class="spl-row ' + (done ? 'done' : (r.elapsed ? 'wasted' : 'up')) + '"><i class="spl-dot" style="background:' + esc(r.color) + '"></i>' +
        '<div class="spl-rm"><small>' + t12(r.start) + ' – ' + t12(r.end) + '</small><b>' + esc(r.topic) + '</b><span>' + esc(r.subject) + ' · planned ' + fmt(r.planned) + '</span></div>' +
        (done ? '<div class="spl-res ' + (on ? 'ok' : 'bad') + '">' + fmt(r.st) + ' studied<small>' + (on ? 'On target ✅' : fmt(r.wasted) + ' wasted') + '</small></div>'
          : '<span class="spl-pill ' + (r.elapsed ? 'bad' : '') + '">' + (r.elapsed ? '⏳ Not logged' : 'Upcoming') + '</span>') + actBtns(r, ro) + '</div>';
    }).join('');
  }
  function totalHtml(d, ro) {
    return '<strong>✎ TOTAL STUDY TIME</strong><span class="spl-tv">' + fmt(d.studied) + '</span><span class="spl-tip">' + (ro ? 'Wasted' : 'Wasted so far') + ': ' + fmt(d.wasted) + ' · Plan followed: ' + d.pct + '%' + (d.sleep ? ' · 😴 Slept: ' + fmt(d.sleep) : '') + '</span>';
  }
  function analysisHtml(d, title, badge) {
    if (!d.entries.length) return '';
    var by = Object.keys(d.by).map(function (k) { return d.by[k]; });
    return '<div class="mp-card spl-an"><div class="mp-card-t"><span>' + title + '</span>' + (badge ? '<span class="spl-pill">' + esc(badge) + '</span>' : '') + '</div>' +
      '<div class="spl-mini"><div><b>' + fmt(d.planned) + '</b><span>Planned</span></div><div><b style="color:#10b981">' + fmt(d.studied) + '</b><span>Studied</span></div><div><b style="color:#ef4444">' + fmt(d.wasted) + '</b><span>Wasted</span></div><div><b>' + d.pct + '%</b><span>Followed</span></div></div>' +
      by.map(function (s) {
        return '<div class="spl-sb"><span class="spl-sbn"><i class="spl-dot" style="background:' + esc(s.color) + '"></i>' + esc(s.name) + '</span><div class="mp-bar"><i style="width:' + Math.round(Math.min(100, s.studied / Math.max(1, s.planned) * 100)) + '%;background:' + esc(s.color) + '"></i></div><span class="spl-sbv">' + fmt(s.studied) + ' / ' + fmt(s.planned) + '</span></div>';
      }).join('') + '</div>';
  }
  function sheetHtml(d, subs, ro) {
    var startsIn = {}, cov = {};
    function put(r, from) { var sh = Math.floor(from / 60); (startsIn[sh] = startsIn[sh] || []).push(r); var e = toMin(r.end); for (var h = sh + 1; h < 24 && h * 60 < e; h++) if (!cov[h]) cov[h] = r; }
    d.entries.forEach(function (r) { put(r, toMin(r.start)); });
    d.sleeps.forEach(function (r) { put(r, toMin(r.end) < toMin(r.start) ? 0 : toMin(r.start)); });   /* sleep sits on the day you WAKE UP */
    var delBtn = function (r) { return ro ? '' : '<button class="mp-ib dng" data-del="' + r.id + '" title="Delete">' + TRASH + '</button>'; };
    var body = '';
    for (var h = 0; h < 24; h++) {
      var hs = pad(h) + ':00', he = h === 23 ? '24:00' : pad(h + 1) + ':00', addEnd = h === 23 ? '23:59' : he;
      if (startsIn[h]) {
        startsIn[h].forEach(function (r) {
          if (r.kind === 'sleep') { body += '<tr class="sl"><td class="tr">' + r.start + ' – ' + r.end + '</td><td>😴 Sleep</td><td></td><td class="tw"><span class="nl">Slept ' + fmt(r.planned) + ' · not counted as study</span></td><td></td><td class="ta">' + delBtn(r) + '</td></tr>'; return; }
          body += '<tr><td class="tr">' + r.start + ' – ' + r.end + '</td><td><i class="spl-dot" style="background:' + esc(r.color) + '"></i>' + esc(r.subject) + '</td>' +
            '<td class="ts">' + (r.status === 'done' ? fmt(r.st) : '<span class="nl">' + (r.elapsed ? 'not logged' : '—') + '</span>') + '</td><td class="tw">' + esc(r.topic) + '</td>' +
            '<td class="' + (r.wasted > 0 ? 'tx' : 'tk') + '">' + (r.wasted > 0 ? fmt(r.wasted) : '—') + '</td><td class="ta">' + (ro || r.status === 'done' ? '' : '<button class="mp-mini" data-log="' + r.id + '" data-pl="' + r.planned + '">Log</button>') + delBtn(r) + '</td></tr>';
        });
      } else if (cov[h]) {
        var c = cov[h], sl = c.kind === 'sleep';
        body += '<tr class="ct"><td class="tr">' + hs + ' – ' + he + '</td><td>' + (sl ? '😴 Sleep' : '<i class="spl-dot" style="background:' + esc(c.color) + '"></i>' + esc(c.subject)) + '</td><td></td><td class="tw"><span class="nl">' + (sl ? '💤 sleeping' : '↳ ' + esc(c.topic) + ' (continues)') + '</span></td><td></td><td></td></tr>';
      } else {
        body += '<tr class="em" data-h="' + h + '" data-start="' + hs + '" data-end="' + addEnd + '"><td class="tr">' + hs + ' – ' + he + '</td><td>' +
          (ro ? '' : '<select class="spl-inl isub"><option value="">General</option>' + subs.map(function (s) { return '<option value="' + s.id + '">' + esc(s.name) + '</option>'; }).join('') + '</select>') + '</td><td></td><td class="tw">' +
          (ro ? '' : '<input type="text" class="spl-inl iwork" maxlength="200" placeholder="Type what you\'ll study, then Enter">') + '</td><td></td><td></td></tr>';
      }
    }
    return '<div class="spl-tw"><table class="spl-tbl"><thead><tr><th>Time</th><th>Subject</th><th>Study time</th><th>Work / Lesson / Notes</th><th>Waste time</th><th></th></tr></thead><tbody>' + body +
      '</tbody><tfoot><tr><td colspan="2">✎ Total</td><td class="ts"><b>' + fmt(d.studied) + '</b></td><td></td><td class="tx"><b>' + fmt(d.wasted) + '</b></td><td></td></tr></tfoot></table></div>';
  }

  function drawSp(pc) {
    var data = SP.data, ro = SP.ro, minDay = new Date(); minDay.setDate(minDay.getDate() - 1);
    var sub = SP.demo ? 'Explore a sample Smart Planner. This demo is view-only — upgrade to Pro to use your own planner.' : (ro ? "A past day — you can look at it, but it can't be edited." : "Plan your day, log what you actually studied, and see what was wasted.");
    var ctrls = SP.demo ? '<button class="mp-add sec" id="spBack">← Back</button><button class="mp-add" id="spUp">Upgrade to Pro</button>' :
      '<button class=\"mp-add sec\" id=\"spPdf\" title=\"Download this day as a PDF\">📄 PDF</button><button class=\"mp-add sec\" id=\"spTg\" title=\"Send the PDF to your Telegram\">✈ Telegram</button>' + '<input type="date" class="mp-sel" id="spDate" max="' + data.yesterday + '" value="' + SP.date + '" title="Open a past day">' + (ro ? '<button class="mp-add sec" id="spToday">Back to today</button>' :
        '<button class="mp-add sec" id="spSleep">😴 Add sleep</button><button class="mp-add" id="spAdd">＋ Add block</button>');
    pc.innerHTML = '<div class="mp spl"><div class="mp-head"><p>' + sub + '</p><div class="mp-head-r">' + ctrls + '</div></div><div id="spYest"></div>' +
      '<div class="mp-tiles four" id="spStats"></div>' +
      '<div class="mp-card"><div class="mp-card-t"><span>Studied vs wasted — ' + (ro && !SP.demo ? shortDate(SP.date) : 'Today') + '</span></div><div class="spl-chart"><canvas id="spChart"></canvas></div></div>' +
      '<div class="mp-card spl-paper"><div class="spl-ph"><span class="spl-heart">♥</span><div class="spl-pt">' + longDate(SP.date) + '</div><div class="spl-vt"><button class="mp-mini' + (SP.view === 'list' ? ' on' : '') + '" id="spVt">☰ List</button></div></div>' +
      '<div id="spList"></div><div id="spTable"></div><div class="spl-total" id="spTotal"></div></div></div>';
    if ($('#spDate', pc)) $('#spDate', pc).onchange = function () { location.hash = (!this.value || this.value >= data.today) ? '#/smart-planner' : '#/smart-planner?date=' + this.value; };
    if ($('#spToday', pc)) $('#spToday', pc).onclick = function () { location.hash = '#/smart-planner'; };
    if ($('#spBack', pc)) $('#spBack', pc).onclick = function () { location.hash = '#/smart-planner'; };
    if ($('#spUp', pc)) $('#spUp', pc).onclick = function () { window.st.openExternal(SITE + '/upgrade.php'); };
    if ($('#spPdf', pc)) $('#spPdf', pc).onclick = function () { spPdf(this, false); };
    if ($('#spTg', pc)) $('#spTg', pc).onclick = function () { spPdf(this, true); };
    if ($('#spAdd', pc)) $('#spAdd', pc).onclick = function () { addBlockModal(); };
    if ($('#spSleep', pc)) $('#spSleep', pc).onclick = sleepModal;
    $('#spVt', pc).onclick = function () { SP.view = SP.view === 'list' ? 'table' : 'list'; lsSet('spx_view3', SP.view); this.classList.toggle('on', SP.view === 'list'); spApplyView(); };
    bindSheet(pc);
    $('.spl', pc).onclick = function (e) {   /* bound on the page's own root, never on #pageContent (that one outlives the page) */
      var t = e.target.closest ? e.target.closest('[data-log],[data-del],[data-reopen],[data-addblk]') : null; if (!t || ro) return;
      if (t.hasAttribute('data-addblk')) return addBlockModal();
      if (t.dataset.log) return logModal(+t.dataset.log, +t.dataset.pl);
      if (t.dataset.reopen) return api('spl_reopen', { id: +t.dataset.reopen }).then(spAfter);
      if (t.dataset.del) confirmModal('Delete plan block', "Delete this plan block? This can't be undone.", 'Delete', 'spl_delete', { id: +t.dataset.del }, spAfter);
    };
    spRefresh(true);
    spStartTicks(pc);
  }
  /* Smart Planner PDF: save to disk (Windows "Save as") or send to the linked Telegram */
  function spPdf(btn, tg) {
    var old = btn.innerHTML; btn.disabled = true; btn.innerHTML = '⏳ ' + (tg ? 'Sending…' : 'Building PDF…');
    var done = function () { btn.disabled = false; btn.innerHTML = old; };
    api(tg ? 'spl_telegram' : 'spl_pdf', { date: SP.date }).then(function (r) {
      if (!r || !r.success) { done(); return toast((r && r.message) || 'Could not build the PDF.', 'warn'); }
      if (tg) { done(); return toast(r.message || 'Sent to your Telegram!', 'ok'); }
      return window.st.saveFile(r.filename, r.pdf).then(function (s) {
        done();
        if (s && s.success) { toast('PDF saved', 'ok'); window.st.showInFolder(s.path); }
        else if (!(s && s.canceled)) toast((s && s.message) || 'Could not save the PDF.', 'warn');
      });
    });
  }
  function spAfter(d) { if (d && d.success && d.data) { spSet(d.data); spRefresh(true); } else if (d && d.message) toast(d.message, 'warn'); }

  function spApplyView() { var l = $('#spList'), t = $('#spTable'); if (l) l.style.display = SP.view === 'list' ? '' : 'none'; if (t) t.style.display = SP.view === 'table' ? '' : 'none'; }
  function fillSubs() { document.querySelectorAll('#spTable .isub').forEach(function (s) { s.value = SP.lastSub; if (s.selectedIndex < 0) s.value = ''; }); }

  /* re-draw everything from the raw rows (also used by the live ticker) */
  function spRefresh(force) {
    if (!$('#spStats')) return;
    var vd = spView(), ro = SP.ro;
    var sig = vd.entries.map(function (e) { return (e.elapsed ? 1 : 0) + e.status; }).join('|') + '#' + vd.entries.length + vd.sleeps.length;
    if (!force && sig === SP.sig) return;
    SP.sig = sig;
    var keep = {}, ae = document.activeElement, keepH = null;
    document.querySelectorAll('#spTable tr.em').forEach(function (tr) { var w = tr.querySelector('.iwork'); if (w && w.value) keep[tr.dataset.h] = { v: w.value, s: tr.querySelector('.isub').value }; });
    if (ae && ae.classList && ae.classList.contains('iwork')) keepH = ae.closest('tr').dataset.h;

    var y = '';
    if (!SP.demo) y = ro ? analysisHtml(vd, '📊 Study Analysis', shortDate(SP.date)) : analysisHtml(calcDay(SP.data.yesterdayRows, false, 0), "📊 Yesterday's Study Analysis", shortDate(SP.data.yesterday));
    else y = analysisHtml(calcDay(SP.data.yesterdayRows, false, 0), '📊 Study Analysis (sample)', 'Demo');
    $('#spYest').innerHTML = y;
    $('#spStats').innerHTML = statsHtml(vd, ro);
    $('#spList').innerHTML = listHtml(vd, ro);
    $('#spTable').innerHTML = sheetHtml(vd, SP.data.subjects, ro);
    $('#spTotal').innerHTML = totalHtml(vd, ro);
    spApplyView(); fillSubs();
    Object.keys(keep).forEach(function (h) { var tr = document.querySelector('#spTable tr.em[data-h="' + h + '"]'); if (!tr) return; tr.querySelector('.iwork').value = keep[h].v; tr.querySelector('.isub').value = keep[h].s; });
    var target = null;
    if (SP.focusAfter != null) {
      var rows = document.querySelectorAll('#spTable tr.em');
      for (var i = 0; i < rows.length; i++) if (parseInt(rows[i].dataset.h, 10) > SP.focusAfter) { target = rows[i].querySelector('.iwork'); break; }
      SP.focusAfter = null;
    } else if (keepH !== null) { var r = document.querySelector('#spTable tr.em[data-h="' + keepH + '"]'); if (r) target = r.querySelector('.iwork'); }
    if (target) { target.focus(); var L = target.value.length; try { target.setSelectionRange(L, L); } catch (e) {} }
    drawChart(vd);
  }
  function drawChart(vd) {
    var el = $('#spChart'); if (SP.chart) { SP.chart.destroy(); SP.chart = null; }
    if (!el || !vd.entries.length || !window.Chart) return;
    var gc = cssVar('--border', 'rgba(148,163,184,.25)'), tc = cssVar('--text-muted', '#94a3b8');
    SP.chart = new Chart(el.getContext('2d'), { type: 'bar', data: { labels: vd.entries.map(function (e) { return t12(e.start); }),
      datasets: [{ label: 'Studied', data: vd.entries.map(function (e) { return e.st; }), backgroundColor: '#10b98199', borderRadius: 6 }, { label: 'Wasted', data: vd.entries.map(function (e) { return e.wasted; }), backgroundColor: '#ef444499', borderRadius: 6 }] },
      options: { responsive: true, maintainAspectRatio: false, animation: { duration: 500 }, plugins: { legend: { labels: { color: tc, font: { size: 11 } } } },
        scales: { x: { stacked: true, grid: { display: false }, ticks: { color: tc, font: { size: 10 } } }, y: { stacked: true, min: 0, grid: { color: gc }, ticks: { color: tc, callback: function (v) { return v + 'm'; } } } } } });
  }

  /* type straight into an hour row: pick a subject, type the work, press Enter (or click away) */
  function bindSheet(pc) {
    var enterH = null, busy = false;
    var tbl = $('#spTable', pc); if (!tbl) return;
    tbl.addEventListener('keydown', function (e) { if (e.key === 'Enter' && e.target.classList.contains('iwork')) enterH = parseInt(e.target.closest('tr').dataset.h, 10); });
    tbl.addEventListener('change', function (e) {
      var t = e.target;
      if (t.classList.contains('isub')) { SP.lastSub = t.value; lsSet('spx_lastsub', t.value); return; }
      if (!t.classList.contains('iwork') || SP.ro || busy) return;
      var topic = t.value.trim(); if (!topic) return;
      var tr = t.closest('tr'), h = parseInt(tr.dataset.h, 10), viaEnter = enterH === h; enterH = null;
      t.disabled = true; busy = true; t.classList.remove('err');
      api('spl_add', { topic: topic, start_time: tr.dataset.start, end_time: tr.dataset.end, subject_id: +tr.querySelector('.isub').value || 0 }).then(function (d) {
        busy = false;
        if (d && d.success) { if (viaEnter) SP.focusAfter = h; spAfter(d); }
        else { t.disabled = false; t.classList.add('err'); toast((d && d.message) || 'Could not save.', 'warn'); }
      });
    });
  }

  /* ── live ticker: slots flip to "wasted" when their end time passes; at midnight the new day + yesterday's analysis load by themselves ── */
  function spStartTicks(pc) {
    var gen = ++SP.gen;
    if (SP.ro || SP.demo) return;
    function rollover() { if (gen === SP.gen && here('smart-planner') && !SP.ro) window.stReload(); }
    var left = 86400 - spNow();
    if (left > 0) setTimeout(rollover, left * 1000 + 1500);
    setInterval(function () {
      if (gen !== SP.gen || !here('smart-planner') || SP.ro) return;
      if (spNow() >= 86400) return rollover();
      spRefresh(false);
    }, 15000);
  }

  /* ── modals ─────────────────────────────────────────────────────────── */
  function subOpts(sel) { return '<option value="0">General</option>' + SP.data.subjects.map(function (s) { return '<option value="' + s.id + '"' + (s.id === sel ? ' selected' : '') + '>' + esc(s.name) + '</option>'; }).join(''); }
  function addBlockModal() {
    var n = new Date(), sh = Math.min(22, n.getHours() + (n.getMinutes() > 0 ? 1 : 0)), s0 = pad(sh) + ':00', e0 = pad(sh + 1) + ':00';
    askModal({ title: 'Add plan block', ok: 'Add block', done: 'Plan block added.',
      body: '<label>Subject</label><select class="px-sel" id="spSub">' + subOpts(+SP.lastSub || 0) + '</select><label>What will you study?</label><input id="spTopic" maxlength="200" placeholder="e.g. Differentiation practice" data-focus>' +
        '<div class="px-two"><div><label>Start time</label><input type="time" id="spS" value="' + s0 + '"></div><div><label>End time</label><input type="time" id="spE" value="' + e0 + '"></div></div>',
      collect: function (ov) {
        var topic = ov.querySelector('#spTopic').value.trim(), s = ov.querySelector('#spS').value, e = ov.querySelector('#spE').value;
        if (!topic) return { error: "Tell me what you'll study." };
        if (!s || !e || e <= s) return { error: 'End time must be after start time.' };
        return { action: 'spl_add', payload: { subject_id: +ov.querySelector('#spSub').value || 0, topic: topic, start_time: s, end_time: e } };
      }, after: spAfter });
  }
  function logModal(id, planned) {
    var row = SP.data.todayRows.filter(function (r) { return r.id === id; })[0];
    askModal({ title: 'Log studied time', ok: 'Save', done: 'Logged!',
      body: '<p class="px-p"><b>' + esc(row ? row.topic : 'Plan block') + '</b><br>Planned: ' + fmt(planned) + '</p><label>How long did you actually study? (minutes)</label><input type="number" id="spMin" min="0" max="1440" value="' + planned + '" data-focus>' +
        '<div class="px-quick"><button type="button" data-m="' + planned + '">Full (' + planned + ')</button><button type="button" data-m="' + Math.round(planned * 0.75) + '">¾</button><button type="button" data-m="' + Math.round(planned / 2) + '">Half</button><button type="button" data-m="0" class="dng">Didn\'t study</button></div>',
      mount: function (ov) { ov.querySelectorAll('[data-m]').forEach(function (b) { b.onclick = function () { ov.querySelector('#spMin').value = b.dataset.m; }; }); },
      collect: function (ov) { var v = parseInt(ov.querySelector('#spMin').value, 10); if (isNaN(v) || v < 0) return { error: 'Enter the minutes you studied (0 or more).' }; return { action: 'spl_complete', payload: { id: id, minutes: v } }; },
      after: spAfter });
  }
  function sleepMins(s, e) { if (!s || !e) return 0; var a = toMin(s), b = toMin(e); if (a === b) return 0; return b > a ? b - a : 1440 - a + b; }
  function sleepModal() {
    askModal({ title: '😴 Add sleep', ok: 'Add sleep', done: 'Sleep added.',
      body: '<div class="px-two"><div><label>Fell asleep</label><input type="time" id="slS" value="23:00"></div><div><label>Woke up</label><input type="time" id="slE" value="06:00"></div></div>' +
        '<div class="px-quick"><button type="button" data-h="6">6h</button><button type="button" data-h="7">7h</button><button type="button" data-h="8">8h</button><button type="button" data-h="9">9h</button></div><p class="px-p" id="slSum" style="margin-top:12px"></p>',
      mount: function (ov) {
        var s = ov.querySelector('#slS'), e = ov.querySelector('#slE'), sum = ov.querySelector('#slSum');
        function upd() { var m = sleepMins(s.value, e.value); sum.textContent = m ? 'Total sleep: ' + fmt(m) : ''; }
        s.oninput = upd; e.oninput = upd; upd();
        ov.querySelectorAll('[data-h]').forEach(function (b) { b.onclick = function () { var end = toMin(e.value || '06:00'), st = ((end - (+b.dataset.h) * 60) % 1440 + 1440) % 1440; s.value = pad(Math.floor(st / 60)) + ':' + pad(st % 60); upd(); }; });
      },
      collect: function (ov) {
        var s = ov.querySelector('#slS').value, e = ov.querySelector('#slE').value;
        if (!s || !e) return { error: 'Pick when you fell asleep and when you woke up.' };
        if (sleepMins(s, e) > 960) return { error: "Sleep can't be longer than 16 hours." };
        return { action: 'spl_add_sleep', payload: { start_time: s, end_time: e } };
      }, after: spAfter });
  }
})();
