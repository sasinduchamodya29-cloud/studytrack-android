/* StudyTrack Desktop - Study Room (Study Together).
   Routes: #/study (lobby)  and  #/study?room=CODE (inside a room).  #/study-together is an alias.
   Data: pages11.php (actions sr_*). Same tables / rules / timer logic as the website's /study/ (index.php).
   Needs js/pages-extra.js (window.StUI).  Styles: css/pages-rooms.css */
(function () {
  var Pages = window.stPages, TITLES = window.stTitles, api = window.stApi, UI = window.StUI;
  if (!Pages || !api || !UI) return;
  var toast = UI.toast, modal = UI.modal, errPage = UI.errPage, lsGet = UI.lsGet, lsSet = UI.lsSet;
  TITLES.study = 'Study Room'; TITLES['study-together'] = 'Study Room';

  function esc(s) { return E(String(s == null ? '' : s)); }
  function here() { return /^#\/study(-together)?([?\/]|$)/.test(location.hash); }
  function pcEl() { return document.getElementById('pageContent'); }
  function curRoom() { var m = location.hash.match(/[?&]room=([A-Za-z0-9]+)/); return m ? m[1].toUpperCase() : ''; }
  function p2(n) { return (n < 10 ? '0' : '') + n; }
  function mmss(sec) { sec = Math.max(0, Math.ceil(sec)); return p2(Math.floor(sec / 60)) + ':' + p2(sec % 60); }
  function hm(m) { m = Math.round(+m || 0); var h = Math.floor(m / 60), r = m % 60; return h ? h + 'h' + (r ? ' ' + r + 'm' : '') : r + 'm'; }
  function av(u, cls) {
    return u.avatar ? '<img class="sr-av ' + (cls || '') + '" src="' + esc(u.avatar) + '" alt="" referrerpolicy="no-referrer">'
      : '<span class="sr-av ph ' + (cls || '') + '">' + esc((u.name || '?').charAt(0).toUpperCase()) + '</span>';
  }
  function $(s, r) { return (r || document).querySelector(s); }
  function goRoom(code) { location.hash = '#/study?room=' + code; }
  function goLobby() { location.hash = '#/study'; }
  function confirmBox(title, text, ok, fn, danger) {
    modal('<h3 style="margin:0 0 8px">' + esc(title) + '</h3><p style="margin:0;color:var(--text-secondary);font-size:13.5px;line-height:1.5">' + esc(text) + '</p>' +
      '<div class="px-btns"><button data-close class="px-sec">Cancel</button><button id="srOk" class="px-pri' + (danger ? ' dng' : '') + '">' + esc(ok) + '</button></div>',
      function (ov, close) { $('#srOk', ov).onclick = function () { close(); fn(); }; });
  }
  function subOptions(sel) {
    var o = '<option value="0">— No subject (time will not be logged) —</option>';
    (S.subs || []).forEach(function (s) { o += '<option value="' + s.id + '"' + (+sel === s.id ? ' selected' : '') + '>' + esc(s.name) + '</option>'; });
    return o;
  }

  /* ── shared state ─────────────────────────────────────────────────── */
  var S = { subs: [], me: 0 };
  var R = null;                       /* the room I am looking at */
  var BG = { id: 0, since: 0, t: null }; /* keeps presence + study-time crediting alive while I browse other pages */

  /* small beep (WebAudio) - can be switched off in the room header */
  function beep() {
    if (lsGet('srSound', '1') !== '1') return;
    try {
      var C = window.AudioContext || window.webkitAudioContext, c = new C(), o = c.createOscillator(), g = c.createGain();
      o.type = 'sine'; o.frequency.value = 880; g.gain.value = 0.0001; o.connect(g); g.connect(c.destination);
      g.gain.exponentialRampToValueAtTime(0.18, c.currentTime + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.7);
      o.start(); o.stop(c.currentTime + 0.75); setTimeout(function () { try { c.close(); } catch (e) {} }, 1000);
    } catch (e) {}
  }
  function showCredit(c) {
    if (!c) return;
    if (c.minutes > 0) toast('✅ ' + c.minutes + ' min logged' + (c.subject ? ' for ' + c.subject : '') + (c.points ? ' · +' + c.points + ' pts' : '') + (c.coins ? ' · +' + c.coins + ' 🪙' : ''), 'ok');
    else if (c.reason === 'no_subject') toast('Pick a subject in the room so your study time can be logged.', 'warn');
  }

  /* background keep-alive: while I am in a room but looking at another page */
  function bgStart(id) { BG.id = id; BG.since = 0; bgLoop(); }
  function bgStop() { BG.id = 0; clearTimeout(BG.t); }
  function bgLoop() {
    clearTimeout(BG.t);
    if (!BG.id) return;
    BG.t = setTimeout(function () {
      if (!BG.id) return;
      if (here() && curRoom()) return bgLoop();          /* the room page is polling itself */
      api('sr_sync', { room_id: BG.id, since: BG.since }).then(function (d) {
        if (!BG.id) return;
        if (d && d.success) {
          if (d.credited) showCredit(d.credited);
          if (d.closed) { bgStop(); toast('Your study room was closed.', 'warn'); return; }
          if (d.msgs && d.msgs.length) BG.since = d.msgs[d.msgs.length - 1].id;
        } else if (d && (d.gone || d.left || d.kicked)) { bgStop(); return; }
        bgLoop();
      });
    }, 25000);
  }

  /* ════════════════════════════════════════════════════════════════════
     ROUTE
     ════════════════════════════════════════════════════════════════════ */
  Pages.study = function (pc) {
    var code = curRoom();
    return code ? openRoom(pc, code) : lobby(pc);
  };
  Pages['study-together'] = Pages.study;

  /* ════════════════════════════════════════════════════════════════════
     LOBBY
     ════════════════════════════════════════════════════════════════════ */
  function lobby(pc) {
    return api('sr_lobby').then(function (d) {
      if (!d || !d.success) return errPage(pc, d);
      S.subs = d.subjects || []; S.me = d.me;
      drawLobby(pc, d);
      setInterval(function () {
        if (!here() || curRoom() || document.hidden || document.querySelector('.px-ov')) return;
        api('sr_lobby').then(function (n) { if (n && n.success && here() && !curRoom()) { S.subs = n.subjects || S.subs; drawLobby(pcEl(), n); } });
      }, 10000);
    });
  }
  var PRIV = { code: '🔑 Invite code', friends: '👥 Friends', public: '🌐 Public' };
  function roomCard(r, kind) {
    var ph = r.phase === 'focus' ? '<span class="sr-ph focus">🔥 Focus · ' + mmss(r.left) + '</span>' : (r.phase === 'break' ? '<span class="sr-ph brk">☕ Break · ' + mmss(r.left) + '</span>' : '<span class="sr-ph">💤 Waiting to start</span>');
    var act;
    if (kind === 'mine') act = '<button class="mp-add" data-open="' + r.code + '">Open room</button>';
    else if (kind === 'public') {
      if (r.request_status === 'pending') act = '<button class="mp-add sec" data-wait="' + r.code + '">⏳ Request sent</button>';
      else act = '<button class="mp-add" data-req="' + r.code + '">' + (r.request_status === 'rejected' ? 'Ask again' : 'Request to join') + '</button>';
    } else act = '<button class="mp-add" data-join="' + r.code + '">Join</button>';
    return '<div class="sr-rc"><div class="sr-rc-top"><b>' + esc(r.name) + '</b><span class="sr-priv">' + PRIV[r.privacy] + '</span></div>' +
      '<div class="sr-rc-meta">Host: ' + esc(r.host) + ' · 👥 ' + r.online + '/' + r.max + ' online · ' + r.focus_min + '/' + r.break_min + ' min</div>' +
      '<div class="sr-rc-foot">' + ph + (r.pending > 0 ? '<span class="sr-badge">🔔 ' + r.pending + ' request' + (r.pending > 1 ? 's' : '') + '</span>' : '') + act + '</div></div>';
  }
  function section(title, sub, list, kind, emptyText) {
    return '<div class="sr-sec"><h3>' + title + '</h3>' + (sub ? '<p>' + sub + '</p>' : '') + (list.length ? '<div class="sr-grid">' + list.map(function (r) { return roomCard(r, kind); }).join('') + '</div>' : '<div class="sr-empty">' + emptyText + '</div>') + '</div>';
  }
  function drawLobby(pc, d) {
    if (!pc) return;
    pc.innerHTML = '<div class="mp sr-wrap">' +
      '<div class="sr-hero"><div><h2>👥 Study Room</h2><p>Study together with friends — one shared Pomodoro timer, live presence and room chat. Every focus round you finish is logged to your streak, points and coins automatically.</p></div>' +
      '<div class="sr-hero-r"><div class="sr-stat"><small>Studying now</small><b>' + d.studyingNow + '</b></div><div class="sr-stat"><small>This week in rooms</small><b>' + hm(d.weekMinutes) + '</b></div></div></div>' +
      '<div class="sr-actions"><button class="mp-add" id="srNew">＋ Create a room</button><button class="mp-add sec" id="srCode">🔑 Join with a code</button></div>' +
      section('🏠 My rooms', 'Rooms you host or are inside right now.', d.mine, 'mine', 'You are not in any room yet. Create one or join with a code.') +
      section('👥 Friends\' rooms', 'Open rooms hosted by your friends.', d.friends, 'friends', 'None of your friends has an open room right now.') +
      section('🌐 Public rooms', 'Anyone can ask to join — the host approves each request.', d.public, 'public', 'No public rooms are open at the moment. Create one!') +
      '</div>';
    $('#srNew', pc).onclick = createModal;
    $('#srCode', pc).onclick = function () { joinModal('', false); };
    pc.querySelectorAll('[data-open]').forEach(function (b) { b.onclick = function () { goRoom(b.dataset.open); }; });
    pc.querySelectorAll('[data-wait]').forEach(function (b) { b.onclick = function () { goRoom(b.dataset.wait); }; });
    pc.querySelectorAll('[data-join]').forEach(function (b) { b.onclick = function () { joinModal(b.dataset.join, false); }; });
    pc.querySelectorAll('[data-req]').forEach(function (b) { b.onclick = function () { joinModal(b.dataset.req, true); }; });
  }

  function createModal() {
    modal('<h3 style="margin:0">Create a study room</h3>' +
      '<label>Room name</label><input id="crName" maxlength="60" placeholder="e.g. A/L Physics grind 📚">' +
      '<label>Who can join?</label><select id="crPriv"><option value="code">🔑 Invite code — only people with the code</option><option value="friends">👥 Friends — your friends can see and join</option><option value="public">🌐 Public — listed for everyone, you approve requests</option></select>' +
      '<div class="sx-2"><div><label>Focus (min)</label><input id="crFocus" type="number" min="5" max="120" value="25"></div><div><label>Break (min)</label><input id="crBreak" type="number" min="0" max="30" value="5"></div></div>' +
      '<div class="sx-2"><div><label>Max people</label><input id="crMax" type="number" min="2" max="30" value="10"></div><div><label>My subject</label><select id="crSub">' + subOptions(lsGet('srSub', 0)) + '</select></div></div>' +
      '<div class="px-btns"><button data-close class="px-sec">Cancel</button><button id="crOk" class="px-pri">Create room</button></div>',
      function (ov, close) {
        $('#crName', ov).focus();
        $('#crOk', ov).onclick = function () {
          var b = this; b.disabled = true;
          var sub = +$('#crSub', ov).value; lsSet('srSub', sub);
          api('sr_create', { name: $('#crName', ov).value, privacy: $('#crPriv', ov).value, focus_min: +$('#crFocus', ov).value || 25, break_min: +$('#crBreak', ov).value, max_members: +$('#crMax', ov).value || 10, subject_id: sub }).then(function (d) {
            b.disabled = false;
            if (!d || !d.success) return toast((d && d.message) || 'Could not create the room.', 'warn');
            close(); goRoom(d.code);
          });
        };
      });
  }
  function joinModal(code, isReq) {
    modal('<h3 style="margin:0">' + (isReq ? 'Request to join' : 'Join a study room') + '</h3>' +
      (code ? '<p style="margin:6px 0 0;color:var(--text-secondary);font-size:13px">Room code <b>' + esc(code) + '</b></p>' : '<label>Room code</label><input id="jmCode" maxlength="10" placeholder="6-letter code" style="text-transform:uppercase;letter-spacing:3px;font-weight:700">') +
      '<label>My subject (your study time is logged to it)</label><select id="jmSub">' + subOptions(lsGet('srSub', 0)) + '</select>' +
      (isReq ? '<p style="margin:12px 0 0;font-size:12px;color:var(--text-muted)">The host has to approve your request before you can enter.</p>' : '') +
      '<div class="px-btns"><button data-close class="px-sec">Cancel</button><button id="jmOk" class="px-pri">' + (isReq ? 'Send request' : 'Join') + '</button></div>',
      function (ov, close) {
        var ci = $('#jmCode', ov); if (ci) { ci.focus(); ci.oninput = function () { ci.value = ci.value.toUpperCase().replace(/[^A-Z0-9]/g, ''); }; }
        $('#jmOk', ov).onclick = function () {
          var b = this, c = code || (ci ? ci.value : '');
          if (!c) return toast('Enter the room code.', 'warn');
          b.disabled = true; var sub = +$('#jmSub', ov).value; lsSet('srSub', sub);
          api('sr_join', { code: c, subject_id: sub }).then(function (d) {
            b.disabled = false;
            if (!d || !d.success) return toast((d && d.message) || 'Could not join.', 'warn');
            close();
            if (d.pending) toast('Request sent — the host will approve it soon.', 'ok');
            goRoom(d.code);
          });
        };
      });
  }

  /* ════════════════════════════════════════════════════════════════════
     WAITING FOR APPROVAL / not a member yet
     ════════════════════════════════════════════════════════════════════ */
  function waiting(pc, code, d) {
    if (d.status === 'none' || d.status === 'rejected') {
      var pub = d.privacy === 'public';
      pc.innerHTML = '<div class="mp sr-wrap"><div class="sr-wait"><div class="sr-wait-ic">' + (d.status === 'rejected' ? '🚫' : '🔑') + '</div><h2>' + esc(d.room_name) + '</h2>' +
        '<p>' + (d.status === 'rejected' ? 'The host declined your last request.' : 'You are not in this room yet.') + '</p>' +
        '<div class="sr-actions" style="justify-content:center"><button class="mp-add" id="wtGo">' + (pub ? 'Request to join' : 'Join room') + '</button><button class="mp-add sec" id="wtBack">Back</button></div></div></div>';
      $('#wtGo', pc).onclick = function () { joinModal(code, pub); };
      $('#wtBack', pc).onclick = goLobby;
      return;
    }
    pc.innerHTML = '<div class="mp sr-wrap"><div class="sr-wait"><div class="sr-wait-ic pulse">⏳</div><h2>Waiting for the host…</h2><p>Your request to join <b>' + esc(d.room_name) + '</b> was sent. This page opens the room by itself as soon as the host approves it.</p>' +
      '<div class="sr-actions" style="justify-content:center"><button class="mp-add sec" id="wtBack">Back to rooms</button></div></div></div>';
    $('#wtBack', pc).onclick = goLobby;
    var iv = setInterval(function () {
      if (!here() || curRoom() !== code) return clearInterval(iv);
      api('sr_request_status', { code: code }).then(function (s) {
        if (!s || !s.success || !here() || curRoom() !== code) return;
        if (s.status === 'approved') { clearInterval(iv); toast('🎉 The host approved your request!', 'ok'); renderAgain(); }
        else if (s.status === 'rejected') { clearInterval(iv); toast('The host declined your request.', 'warn'); renderAgain(); }
        else if (s.status === 'gone' || s.status === 'closed' || s.status === 'banned') { clearInterval(iv); toast('This room is not available any more.', 'warn'); goLobby(); }
      });
    }, 3000);
  }
  function renderAgain() { var pc = pcEl(); if (pc && here() && curRoom()) openRoom(pc, curRoom()); }

  /* ════════════════════════════════════════════════════════════════════
     INSIDE A ROOM
     ════════════════════════════════════════════════════════════════════ */
  function openRoom(pc, code) {
    return api('sr_enter', { code: code }).then(function (d) {
      if (!d || !d.success) {
        if (d && (d.gone || d.kicked)) { toast(d.message, 'warn'); return goLobby(); }
        return errPage(pc, d);
      }
      if (!d.member) return waiting(pc, code, d);
      if (!S.subs.length) { /* subjects come with the lobby call */
        return api('sr_lobby').then(function (l) { if (l && l.success) { S.subs = l.subjects || []; S.me = l.me; } startRoom(pc, d); });
      }
      startRoom(pc, d);
    });
  }

  function startRoom(pc, d) {
    R = { id: d.room_id, code: d.code, since: 0, msgs: [], seen: {}, members: [], room: null, off: 0, tab: 'chat', busy: false, first: true, joinReq: [], lbAt: 0, prevPhase: null, myBuilt: false };
    bgStart(R.id);
    pc.innerHTML = '<div class="mp sr-wrap sr-in"><div class="sr-top" id="srTop"></div>' +
      '<div class="sr-cols"><div class="sr-left">' +
      '<div class="sr-card sr-timer" id="srTimer"></div>' +
      '<div class="sr-card" id="srHost"></div>' +
      '<div class="sr-card" id="srMy"></div>' +
      '<div class="sr-card" id="srReq" style="display:none"></div>' +
      '<div class="sr-card"><h4>👥 In this room <span id="srCount"></span></h4><div id="srMembers" class="sr-members"></div></div>' +
      '</div><div class="sr-right"><div class="sr-card sr-chatcard"><div class="sr-tabs" id="srTabs"><button data-t="chat" class="on">💬 Chat</button><button data-t="lb">🏆 Today\'s ranking</button></div>' +
      '<div id="srChatBox"><div class="sr-chat" id="srChat"></div><div class="sr-send"><input id="srMsg" maxlength="300" placeholder="Say something to the room…" autocomplete="off"><button class="mp-add" id="srSend">Send</button></div></div>' +
      '<div id="srLb" style="display:none"></div></div></div></div></div>';
    $('#srTabs', pc).querySelectorAll('button').forEach(function (b) {
      b.onclick = function () {
        R.tab = b.dataset.t;
        $('#srTabs', pc).querySelectorAll('button').forEach(function (x) { x.classList.toggle('on', x === b); });
        $('#srChatBox', pc).style.display = R.tab === 'chat' ? '' : 'none';
        $('#srLb', pc).style.display = R.tab === 'lb' ? '' : 'none';
        if (R.tab === 'lb') loadLb(true);
      };
    });
    var inp = $('#srMsg', pc);
    function send() {
      var t = inp.value.trim(); if (!t) return; inp.value = '';
      api('sr_say', { room_id: R.id, body: t }).then(function (r) { if (!r || !r.success) toast((r && r.message) || 'Could not send.', 'warn'); sync(); });
    }
    $('#srSend', pc).onclick = send;
    inp.onkeydown = function (e) { if (e.key === 'Enter') send(); };
    setInterval(clockTick, 400);
    setInterval(function () { if (here() && curRoom() && !document.hidden) sync(); }, 3000);
    setInterval(function () { if (R && R.tab === 'lb' && here()) loadLb(false); }, 20000);
    sync();
  }

  function leaveCleanup() { bgStop(); R = null; }

  function sync() {
    if (!R || R.busy) return;
    var my = R; R.busy = true;
    api('sr_sync', { room_id: R.id, since: R.since }).then(function (d) {
      my.busy = false;
      if (R !== my || !here() || !curRoom()) return;
      if (!d || !d.success) {
        if (d && (d.gone || d.left || d.kicked)) { leaveCleanup(); toast(d.message || 'You are no longer in this room.', 'warn'); goLobby(); }
        else setConn(!(d && d.offline));
        return;
      }
      setConn(true);
      if (d.closed) { showCredit(d.credited); leaveCleanup(); toast('This room was closed.', 'warn'); goLobby(); return; }
      my.off = d.now - Date.now() / 1000;
      var prev = my.room; my.room = d.room; my.members = d.members; my.joinReq = d.join_requests || [];
      my.mySub = d.my_subject; my.myTask = d.my_task;
      (d.msgs || []).forEach(function (m) { if (!my.seen[m.id]) { my.seen[m.id] = 1; my.msgs.push(m); } if (m.id > my.since) my.since = m.id; });
      BG.since = my.since;
      if (d.credited) showCredit(d.credited);
      if (prev && prev.phase !== d.room.phase) { beep(); toast(d.room.phase === 'focus' ? '🔥 Focus round started' : (d.room.phase === 'break' ? '☕ Break time' : '✅ Round finished'), 'ok'); }
      paintAll(my.first); my.first = false;
    });
  }
  function setConn(ok) { var t = $('#srConn'); if (t) { t.classList.toggle('off', !ok); t.textContent = ok ? '● Live' : '● Reconnecting…'; } }

  function paintAll(first) {
    var r = R.room; if (!r) return;
    var tb = document.querySelector('.topbar-title'); if (tb) tb.textContent = r.name;
    paintTop(); paintHost(); paintMembers(); paintChat(); paintReq();
    if (!R.myBuilt) paintMy();
    clockTick();
  }

  function paintTop() {
    var r = R.room, el = $('#srTop'); if (!el) return;
    el.innerHTML = '<button class="sr-back" id="srBack">← Rooms</button><div class="sr-top-t"><h2>' + esc(r.name) + '</h2><div class="sr-top-m"><span class="sr-priv">' + PRIV[r.privacy] + '</span>' +
      '<span>Round <b>' + r.rounds + (r.target_rounds ? ' / ' + r.target_rounds : '') + '</b></span><span id="srConn" class="sr-live">● Live</span></div></div>' +
      '<div class="sr-top-r"><button class="sr-code" id="srCodeBtn" title="Copy the room code">' + esc(r.code) + ' <i>⧉</i></button>' +
      '<button class="sr-ic" id="srSnd" title="Round sound">' + (lsGet('srSound', '1') === '1' ? '🔔' : '🔕') + '</button>' +
      '<button class="mp-add sec" id="srLeave">Leave</button>' + (r.is_owner ? '<button class="mp-add sr-dng" id="srClose">Close room</button>' : '') + '</div>';
    $('#srBack').onclick = goLobby;     /* I stay in the room (and keep being credited) while I browse other pages */
    $('#srCodeBtn').onclick = function () { try { navigator.clipboard.writeText(r.code); toast('Room code copied: ' + r.code, 'ok'); } catch (e) { toast('Code: ' + r.code); } };
    $('#srSnd').onclick = function () { var on = lsGet('srSound', '1') === '1'; lsSet('srSound', on ? '0' : '1'); this.textContent = on ? '🔕' : '🔔'; };
    $('#srLeave').onclick = function () {
      confirmBox('Leave this room?', 'Your study time for the current focus round is logged first.', 'Leave', function () {
        var id = R.id; api('sr_leave', { room_id: id }).then(function (d) { showCredit(d && d.credited); leaveCleanup(); goLobby(); });
      });
    };
    var cl = $('#srClose');
    if (cl) cl.onclick = function () {
      confirmBox('Close this room for everyone?', 'Everybody is paid for the time they studied, then the room ends.', 'Close room', function () {
        var id = R.id; api('sr_close', { room_id: id }).then(function (d) { if (d && d.success) { showCredit(d.credited); leaveCleanup(); toast('Room closed.', 'ok'); goLobby(); } else toast((d && d.message) || 'Could not close.', 'warn'); });
      }, true);
    };
  }

  /* ── timer ring (pure clock math from the server's start time + length) ── */
  function left() { var r = R.room; if (!r || r.phase === 'idle') return 0; return r.phase_started + r.phase_secs - (Date.now() / 1000 + R.off); }
  function clockTick() {
    if (!R || !R.room) return;
    var r = R.room, el = $('#srTimer'); if (!el) return;
    var l = left(), total = r.phase === 'idle' ? r.focus_min * 60 : r.phase_secs, frac = r.phase === 'idle' ? 1 : Math.max(0, Math.min(1, l / Math.max(1, total)));
    var C = 2 * Math.PI * 92, label = r.phase === 'focus' ? 'FOCUS' : (r.phase === 'break' ? 'BREAK' : 'READY');
    if (!el.firstChild) {
      el.innerHTML = '<div class="sr-ring ' + r.phase + '"><svg viewBox="0 0 200 200"><circle class="bg" cx="100" cy="100" r="92"/><circle class="fg" id="srArc" cx="100" cy="100" r="92" stroke-dasharray="' + C + '" stroke-dashoffset="0"/></svg>' +
        '<div class="sr-ring-in"><small id="srPh">' + label + '</small><b id="srClock">00:00</b><span id="srSub"></span></div></div>';
    }
    $('.sr-ring', el).className = 'sr-ring ' + r.phase;
    $('#srArc').style.strokeDashoffset = (C * (1 - frac)).toFixed(1);
    $('#srPh').textContent = label;
    $('#srClock').textContent = r.phase === 'idle' ? mmss(r.focus_min * 60) : mmss(l);
    $('#srSub').textContent = r.phase === 'focus' ? 'Stay with it 💪' : (r.phase === 'break' ? 'Stretch, drink some water' : (r.is_owner ? 'Press Start focus' : 'Waiting for the host'));
    if (r.phase !== 'idle' && l <= -4 && !R.busy) sync();   /* the round ran out - let the server roll the phase */
  }

  /* ── host controls / info ── */
  function paintHost() {
    var r = R.room, el = $('#srHost'); if (!el) return;
    if (!r.is_owner) {
      el.innerHTML = '<h4>⏱ Timer</h4><p class="sr-note">The host controls the shared timer. Focus <b>' + r.focus_min + ' min</b> · break <b>' + r.break_min + ' min</b>' + (r.auto_cycle ? ' · rounds continue automatically' : '') + '.</p>';
      el.dataset.built = '';
      return;
    }
    var focusing = r.phase === 'focus';
    if (el.dataset.built === '1') {      /* only refresh the buttons - never wipe what the host is typing */
      $('#hStart', el).disabled = focusing; $('#hStop', el).disabled = r.phase === 'idle';
      return;
    }
    el.dataset.built = '1';
    el.innerHTML = '<h4>🎛 Host controls</h4>' +
      '<div class="sx-2"><div><label class="sr-lb">Focus (min)</label><input id="hFocus" type="number" min="5" max="120" value="' + r.focus_min + '"></div><div><label class="sr-lb">Break (min)</label><input id="hBreakMin" type="number" min="0" max="30" value="' + r.break_min + '"></div></div>' +
      '<div class="sr-hbtns"><button class="mp-add" id="hStart"' + (focusing ? ' disabled' : '') + '>▶ Start focus</button><button class="mp-add sec" id="hBreak">☕ Break</button><button class="mp-add sec" id="hStop"' + (r.phase === 'idle' ? ' disabled' : '') + '>■ Stop</button></div>' +
      '<details class="sr-more"><summary>Room settings</summary><label class="sr-chk"><input type="checkbox" id="hAuto"' + (r.auto_cycle ? ' checked' : '') + '> Keep going automatically (focus → break → focus…)</label>' +
      '<div class="sx-2"><div><label class="sr-lb">Stop after rounds (0 = never)</label><input id="hTarget" type="number" min="0" max="20" value="' + r.target_rounds + '"></div><div><label class="sr-lb">Max people</label><input id="hMax" type="number" min="2" max="30" value="' + r.max_members + '"></div></div>' +
      '<button class="mp-add sec" id="hSave" style="margin-top:10px">Save settings</button></details>';
    function timer(cmd) {
      api('sr_timer', { room_id: R.id, cmd: cmd, focus_min: +$('#hFocus', el).value || 25, break_min: +$('#hBreakMin', el).value }).then(function (d) {
        if (!d || !d.success) toast((d && d.message) || 'Could not change the timer.', 'warn'); sync();
      });
    }
    $('#hStart', el).onclick = function () { timer('start_focus'); };
    $('#hBreak', el).onclick = function () { timer('start_break'); };
    $('#hStop', el).onclick = function () { timer('stop'); };
    $('#hSave', el).onclick = function () {
      api('sr_room_settings', { room_id: R.id, auto_cycle: $('#hAuto', el).checked ? 1 : 0, target_rounds: +$('#hTarget', el).value || 0, max_members: +$('#hMax', el).value || 10 }).then(function (d) {
        toast(d && d.success ? 'Settings saved.' : ((d && d.message) || 'Could not save.'), d && d.success ? 'ok' : 'warn'); sync();
      });
    };
  }

  /* ── my subject + what I am working on (built once so typing is never interrupted) ── */
  function paintMy() {
    var el = $('#srMy'); if (!el) return; R.myBuilt = true;
    el.innerHTML = '<h4>📘 My focus</h4><label class="sr-lb">Subject (your time is logged to it)</label><select id="mySub">' + subOptions(R.mySub) + '</select>' +
      '<label class="sr-lb">What are you working on?</label><input id="myTask" maxlength="80" placeholder="e.g. Organic chemistry past paper" value="' + esc(R.myTask || '') + '">';
    $('#mySub', el).onchange = function () { lsSet('srSub', this.value); api('sr_set_subject', { room_id: R.id, subject_id: +this.value }).then(function () { sync(); }); };
    var t = $('#myTask', el);
    function saveTask() { api('sr_set_task', { room_id: R.id, task: t.value }).then(function () { sync(); }); }
    t.onblur = saveTask; t.onkeydown = function (e) { if (e.key === 'Enter') { t.blur(); } };
  }

  /* ── people ── */
  var ST_LABEL = { studying: '🔥 Studying', break: '☕ On break', ready: '🟢 Ready', away: '💤 Away' };
  function paintMembers() {
    var el = $('#srMembers'); if (!el) return;
    var online = R.members.filter(function (m) { return m.status !== 'away'; }).length;
    $('#srCount').textContent = '· ' + online + ' online / ' + R.members.length;
    el.innerHTML = R.members.map(function (m) {
      return '<div class="sr-m ' + m.status + '">' + av(m) + '<div class="sr-m-b"><div class="sr-m-n">' + (m.is_owner ? '👑 ' : '') + esc(m.name) + (m.is_me ? ' <i>(you)</i>' : '') + '</div>' +
        '<div class="sr-m-s"><span class="sr-st ' + m.status + '">' + ST_LABEL[m.status] + '</span>' +
        (m.subject ? '<span class="sr-sub" style="--c:' + esc(m.color || '#6366f1') + '">' + esc(m.subject) + '</span>' : '') + '</div>' +
        (m.task ? '<div class="sr-m-t">“' + esc(m.task) + '”</div>' : '') + '</div>' +
        '<div class="sr-m-r"><b>' + hm(m.today_min) + '</b><small>today</small>' +
        (R.room.is_owner && !m.is_me ? '<button class="sr-kick" data-k="' + m.user_id + '" title="Remove from room">✕</button>' : '') + '</div></div>';
    }).join('');
    el.querySelectorAll('[data-k]').forEach(function (b) {
      b.onclick = function () {
        var uid = +b.dataset.k, m = R.members.filter(function (x) { return x.user_id === uid; })[0];
        confirmBox('Remove ' + (m ? m.name : 'this person') + '?', 'They are removed from the room and cannot join it again.', 'Remove', function () {
          api('sr_kick', { room_id: R.id, user_id: uid }).then(function (d) { if (!d || !d.success) toast((d && d.message) || 'Could not remove.', 'warn'); sync(); });
        }, true);
      };
    });
  }

  /* ── join requests (host of a public room) ── */
  function paintReq() {
    var el = $('#srReq'); if (!el) return;
    if (!R.room.is_owner || !R.joinReq.length) { el.style.display = 'none'; el.innerHTML = ''; return; }
    el.style.display = '';
    el.innerHTML = '<h4>🔔 Join requests <span class="sr-badge">' + R.joinReq.length + '</span></h4>' + R.joinReq.map(function (q) {
      return '<div class="sr-rq"><div><b>' + esc(q.name) + '</b>' + (q.subject ? '<small> · ' + esc(q.subject) + '</small>' : '') + '</div><div><button class="px-sec" data-no="' + q.id + '">Decline</button><button class="mp-add" data-yes="' + q.id + '">Approve</button></div></div>';
    }).join('');
    function decide(act, id) { api(act, { room_id: R.id, request_id: id }).then(function (d) { if (!d || !d.success) toast((d && d.message) || 'Could not update the request.', 'warn'); sync(); }); }
    el.querySelectorAll('[data-yes]').forEach(function (b) { b.onclick = function () { b.disabled = true; decide('sr_approve_request', +b.dataset.yes); }; });
    el.querySelectorAll('[data-no]').forEach(function (b) { b.onclick = function () { b.disabled = true; decide('sr_reject_request', +b.dataset.no); }; });
  }

  /* ── chat ── */
  function paintChat() {
    var box = $('#srChat'); if (!box) return;
    var near = box.scrollHeight - box.scrollTop - box.clientHeight < 80, shown = +box.dataset.n || 0;
    if (R.msgs.length === shown) return;
    for (var i = shown; i < R.msgs.length; i++) {
      var m = R.msgs[i], d = document.createElement('div');
      var t = new Date(m.at * 1000), hh = t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      if (m.sys) { d.className = 'sr-msg sys'; d.textContent = m.body; }
      else { d.className = 'sr-msg' + (m.me ? ' me' : ''); d.innerHTML = '<div class="sr-bub">' + (m.me ? '' : '<b>' + esc(m.name) + '</b>') + '<span>' + esc(m.body) + '</span><small>' + hh + '</small></div>'; }
      box.appendChild(d);
    }
    box.dataset.n = R.msgs.length;
    if (near || shown === 0) box.scrollTop = box.scrollHeight;
  }

  /* ── ranking tab ── */
  function loadLb(force) {
    if (!R) return; var el = $('#srLb'); if (!el) return;
    if (force) el.innerHTML = '<div class="sr-empty">Loading…</div>';
    api('sr_leaderboard', { room_id: R.id }).then(function (d) {
      var e2 = $('#srLb'); if (!e2 || !d || !d.success) return;
      var top = Math.max(1, d.rows.length ? d.rows[0].today_min : 1), medals = ['🥇', '🥈', '🥉'];
      e2.innerHTML = '<p class="sr-note" style="margin:0 0 10px">Everything each person studied today (manual, Pomodoro and Study Room).</p>' + d.rows.map(function (u, i) {
        return '<div class="sr-lbrow">' + '<span class="sr-rk">' + (medals[i] || (i + 1)) + '</span>' + av(u, 'sm') +
          '<div class="sr-lbm"><b>' + esc(u.name) + (u.user_id === S.me ? ' <i>(you)</i>' : '') + '</b><div class="sr-bar"><i style="width:' + Math.round(u.today_min / top * 100) + '%"></i></div></div>' +
          '<div class="sr-lbr"><b>' + hm(u.today_min) + '</b><small>' + (u.streak ? '🔥 ' + u.streak + 'd' : '—') + '</small></div></div>';
      }).join('');
    });
  }
})();
