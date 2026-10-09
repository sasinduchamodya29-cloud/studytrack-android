/* StudyTrack Desktop - Focus Timer (Pomodoro) + Subjects pages.
 * Native app pages (not website ports). Data: pages.php  (actions sub_* and pm_*). */
(function () {
  var Pages = window.stPages, TITLES = window.stTitles, api = window.stApi;
  if (!Pages || !api) return;
  TITLES.pomodoro = 'Focus Timer'; TITLES.subjects = 'Subjects';

  function $(s, r) { return (r || document).querySelector(s); }
  function fmtMin(m) { m = Math.round(+m || 0); var h = Math.floor(m / 60), r = m % 60; return h ? (h + 'h' + (r ? ' ' + r + 'm' : '')) : (r + 'm'); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function clock(sec) { sec = Math.max(0, Math.ceil(sec)); return pad(Math.floor(sec / 60)) + ':' + pad(sec % 60); }
  function lsGet(k, d) { try { var v = localStorage.getItem(k); return v === null ? d : v; } catch (e) { return d; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  /* ── small shared UI helpers ─────────────────────────────────────────── */
  function toast(msg, kind) {
    var t = document.createElement('div');
    t.className = 'px-toast' + (kind ? ' ' + kind : ''); t.textContent = msg;
    document.body.appendChild(t);
    requestAnimationFrame(function () { t.classList.add('in'); });
    setTimeout(function () { t.classList.remove('in'); setTimeout(function () { t.remove(); }, 250); }, 3600);
  }
  function modal(html, onMount) {
    var ov = document.createElement('div'); ov.className = 'px-ov';
    ov.innerHTML = '<div class="px-modal" role="dialog">' + html + '</div>';
    document.body.appendChild(ov);
    requestAnimationFrame(function () { ov.classList.add('in'); });
    function close() { ov.classList.remove('in'); setTimeout(function () { ov.remove(); }, 180); document.removeEventListener('keydown', esc); }
    function esc(e) { if (e.key === 'Escape') close(); }
    document.addEventListener('keydown', esc);
    ov.addEventListener('mousedown', function (e) { if (e.target === ov) close(); });
    ov.querySelectorAll('[data-close]').forEach(function (b) { b.onclick = close; });
    if (onMount) onMount(ov, close);
    return close;
  }
  function errPage(pc, d) {
    var off = d && d.offline;
    pc.innerHTML = '<div class="st-ph"><div class="st-ph-ic">' + (off ? '📡' : '⚠️') + '</div><h2>' + (off ? "You're offline" : 'Something went wrong') + '</h2><p>' +
      E((d && d.message) || 'Could not load this page.') + '</p><button class="st-ph-btn" onclick="stReload()">Try again</button></div>';
  }

  window.StUI = { toast: toast, modal: modal, errPage: errPage, fmtMin: fmtMin, $: $, lsGet: lsGet, lsSet: lsSet };   /* shared with js/pages-more.js */

  /* ════════════════════════════════════════════════════════════════════
     POMODORO  - one global timer that keeps running while you browse other pages
     ════════════════════════════════════════════════════════════════════ */
  var P = window.StPomo = {
    loaded: false, subjects: [], dur: { work: 25, short: 5, long: 15 },
    mode: 'work', remaining: 25 * 60, running: false, endAt: 0, cycle: 0,
    subjectId: +lsGet('stPmSubject', 0) || 0, auto: lsGet('stPmAuto', '0') === '1', sound: lsGet('stPmSound', '1') === '1',
    cyclesToday: 0, pomoMinToday: 0, minToday: 0, locked: null, pending: null, subs: []
  };
  function total() { return P.dur[P.mode] * 60; }
  function emit() { P.subs = P.subs.filter(function (f) { try { return f() !== false; } catch (e) { return false; } }); renderChip(); }
  function setMode(m, keep) { P.mode = m; if (!keep) { P.running = false; P.remaining = total(); } emit(); }

  function beep() {
    if (!P.sound) return;
    try {
      var ac = new (window.AudioContext || window.webkitAudioContext)(), t0 = ac.currentTime;
      [660, 880, 1100].forEach(function (f, i) {
        var o = ac.createOscillator(), g = ac.createGain(); o.type = 'sine'; o.frequency.value = f; o.connect(g); g.connect(ac.destination);
        g.gain.setValueAtTime(0.0001, t0 + i * 0.22); g.gain.exponentialRampToValueAtTime(0.25, t0 + i * 0.22 + 0.03); g.gain.exponentialRampToValueAtTime(0.0001, t0 + i * 0.22 + 0.2);
        o.start(t0 + i * 0.22); o.stop(t0 + i * 0.22 + 0.22);
      });
      setTimeout(function () { ac.close(); }, 1200);
    } catch (e) {}
  }
  function notify(title, body) { try { new Notification(title, { body: body, silent: true }); } catch (e) {} }

  P.start = function () {
    if (P.mode === 'work' && !P.subjectId) { toast('Pick a subject first', 'warn'); return; }
    if (P.mode === 'work' && P.locked) { toast('Account locked until ' + P.locked, 'warn'); return; }
    if (P.remaining <= 0) P.remaining = total();
    P.endAt = Date.now() + P.remaining * 1000; P.running = true; tick(); emit();
  };
  P.pause = function () { if (!P.running) return; P.remaining = Math.max(0, (P.endAt - Date.now()) / 1000); P.running = false; emit(); };
  P.toggle = function () { P.running ? P.pause() : P.start(); };
  P.reset = function () { P.running = false; P.remaining = total(); emit(); };
  P.elapsedMin = function () { return Math.floor((total() - P.remaining) / 60); };
  P.next = function (autoStartOK) {
    if (P.mode === 'work') { P.mode = (P.cycle % 4 === 0 && P.cycle > 0) ? 'long' : 'short'; } else { P.mode = 'work'; }
    P.running = false; P.remaining = total(); emit();
    if (autoStartOK && P.auto && !(P.mode === 'work' && !P.subjectId)) P.start();
  };
  P.skip = function () {
    if (P.mode === 'work') { /* skipped focus is not logged */ P.next(false); toast('Focus skipped - not logged'); } else P.next(false);
  };
  function logFocus(mins, quiet) {
    return api('pm_log', { subject_id: P.subjectId, minutes: mins }).then(function (d) {
      if (d && d.success) {
        P.pending = null; P.cyclesToday += quiet ? 0 : 1; P.pomoMinToday += mins; P.minToday += mins;
        var extra = [];
        if (d.points_earned) extra.push('+' + d.points_earned + ' pt');
        if (d.coins_earned) extra.push('+' + d.coins_earned + ' coins');
        toast('🍅 ' + mins + ' min logged' + (extra.length ? '  ·  ' + extra.join(' · ') : ''), 'ok');
      } else {
        P.pending = { minutes: mins, quiet: quiet };
        toast((d && d.message) || 'Could not save the session', 'warn');
      }
      emit();
    });
  }
  P.logSoFar = function () {
    var m = P.elapsedMin(); if (m < 1 || P.mode !== 'work') return;
    P.running = false; P.remaining = total();
    logFocus(m, true).then(function () { emit(); });
  };
  P.retry = function () { if (P.pending) logFocus(P.pending.minutes, P.pending.quiet); };

  function finish() {
    P.running = false; P.remaining = 0; beep();
    if (P.mode === 'work') {
      P.cycle++;
      notify('Focus complete 🍅', 'Nice work - time for a break.');
      logFocus(P.dur.work, false);
      P.next(true);
    } else {
      notify('Break over', 'Ready for the next focus block?');
      P.next(true);
    }
  }
  var tickT = null;
  function tick() {   /* setTimeout chain: not tied to the page, survives navigation */
    clearTimeout(tickT);
    if (!P.running) return;
    P.remaining = Math.max(0, (P.endAt - Date.now()) / 1000);
    if (P.remaining <= 0) { finish(); return; }
    emit();
    tickT = setTimeout(tick, 250);
  }
  document.addEventListener('visibilitychange', function () { if (!document.hidden && P.running) tick(); });

  /* title-bar chip (shown while the timer is running / paused and you are on another page) */
  var chip = document.createElement('button');
  chip.id = 'tbPomo'; chip.title = 'Open Focus Timer'; chip.style.display = 'none';
  chip.onclick = function () { location.hash = '#/pomodoro'; };
  (function () { var tb = document.getElementById('stTitlebar'), t = document.getElementById('tbTitle'); if (tb && t) tb.insertBefore(chip, t); })();
  function renderChip() {
    var onPage = /^#\/pomodoro/.test(location.hash);
    var active = P.running || (P.remaining < total() && P.remaining > 0);
    chip.style.display = (!onPage && active) ? 'inline-flex' : 'none';
    chip.className = (P.running ? 'run ' : 'pause ') + P.mode;
    chip.textContent = (P.mode === 'work' ? '🍅 ' : '☕ ') + clock(P.remaining) + (P.running ? '' : '  ⏸');
  }
  window.addEventListener('hashchange', renderChip);

  function loadPomo(force) {
    if (P.loaded && !force) return Promise.resolve({ success: true });
    return api('pm_get').then(function (d) {
      if (!d || !d.success) return d;
      P.loaded = true; P.subjects = d.subjects; P.cyclesToday = d.cycles_today; P.pomoMinToday = d.pomo_minutes_today; P.minToday = d.minutes_today; P.locked = d.locked_until;
      var idle = !P.running && P.remaining === total();
      P.dur = d.durations; if (idle) P.remaining = total();
      if (!P.subjects.some(function (s) { return s.id === P.subjectId; })) P.subjectId = P.subjects.length ? P.subjects[0].id : 0;
      return d;
    });
  }

  var RING_R = 128, RING_C = 2 * Math.PI * RING_R;
  Pages.pomodoro = function (pc) {
    return loadPomo(true).then(function (d) {
      if (!d || !d.success) return errPage(pc, d);
      if (!P.subjects.length) {
        pc.innerHTML = '<div class="st-ph"><div class="st-ph-ic">📚</div><h2>Add a subject first</h2><p>The Focus Timer logs every finished block to a subject.</p><a class="st-ph-btn" href="#/subjects">Go to Subjects</a></div>';
        return;
      }
      pc.innerHTML =
        '<div class="pm" id="pmRoot">' +
          '<section class="pm-main">' +
            '<div class="pm-tabs" id="pmTabs">' +
              '<button data-m="work">Focus</button><button data-m="short">Short break</button><button data-m="long">Long break</button><i id="pmTabInk"></i>' +
            '</div>' +
            '<div class="pm-ringwrap">' +
              '<svg viewBox="0 0 300 300" class="pm-ring"><circle class="pm-track" cx="150" cy="150" r="' + RING_R + '"/><circle class="pm-prog" id="pmProg" cx="150" cy="150" r="' + RING_R + '" stroke-dasharray="' + RING_C.toFixed(2) + '" stroke-dashoffset="0" transform="rotate(-90 150 150)"/></svg>' +
              '<div class="pm-face"><div class="pm-time selectable" id="pmTime">25:00</div><div class="pm-label" id="pmLabel"></div><div class="pm-dots" id="pmDots"></div></div>' +
            '</div>' +
            '<div class="pm-ctrl">' +
              '<button class="pm-sec" id="pmReset" title="Reset (R)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.5 15a9 9 0 1 0 2.1-9.4L1 10"/></svg></button>' +
              '<button class="pm-go" id="pmGo"></button>' +
              '<button class="pm-sec" id="pmSkip" title="Skip (S)"><svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5 4 15 12 5 20"/><rect x="17" y="4" width="3" height="16" rx="1"/></svg></button>' +
            '</div>' +
            '<div class="pm-pending" id="pmPending" style="display:none"></div>' +
            '<div class="pm-sub-h">Studying</div><div class="pm-chips" id="pmChips"></div>' +
          '</section>' +
          '<aside class="pm-side">' +
            '<div class="pm-card"><div class="pm-card-t">Today</div>' +
              '<div class="pm-stats"><div><b id="pmCyc">0</b><span>focus blocks</span></div><div><b id="pmPm">0m</b><span>in Pomodoro</span></div><div><b id="pmAll">0m</b><span>all study today</span></div></div></div>' +
            '<div class="pm-card"><div class="pm-card-t">Timer</div>' +
              '<div class="pm-steps">' +
                step('work', 'Focus', 1, 180) + step('short', 'Short break', 1, 60) + step('long', 'Long break', 1, 120) +
              '</div>' +
              '<label class="pm-sw"><input type="checkbox" id="pmAuto"><span></span>Auto-start next block</label>' +
              '<label class="pm-sw"><input type="checkbox" id="pmSound"><span></span>Sound when a block ends</label>' +
              '<button class="pm-save" id="pmSave">Save durations</button>' +
            '</div>' +
            '<div class="pm-keys"><span><kbd>Space</kbd>start / pause</span><span><kbd>R</kbd>reset</span><span><kbd>S</kbd>skip</span><span><kbd>L</kbd>log so far</span></div>' +
          '</aside>' +
        '</div>';
      mountPomo(pc);
    });
  };
  function step(k, label, min, max) {
    return '<div class="pm-step" data-k="' + k + '"><span>' + label + '</span><div><button data-d="-1">−</button><input type="number" class="selectable" min="' + min + '" max="' + max + '" value="' + P.dur[k] + '"><button data-d="1">+</button><em>min</em></div></div>';
  }

  function mountPomo(pc) {
    var root = $('#pmRoot', pc);
    var tabs = root.querySelectorAll('#pmTabs button'), ink = $('#pmTabInk', root), prog = $('#pmProg', root);
    var go = $('#pmGo', root), chips = $('#pmChips', root);
    function paintChips() {
      chips.innerHTML = P.subjects.map(function (s) {
        return '<button class="pm-chip' + (s.id === P.subjectId ? ' on' : '') + '" data-id="' + s.id + '" style="--c:' + E(s.color) + '"><i></i>' + E(s.name) + '</button>';
      }).join('');
    }
    chips.onclick = function (e) {
      var b = e.target.closest('.pm-chip'); if (!b) return;
      if (P.running && P.mode === 'work') { toast('Pause the timer to change subject'); return; }
      P.subjectId = +b.dataset.id; lsSet('stPmSubject', P.subjectId); emit();
    };
    tabs.forEach(function (b) { b.onclick = function () { setMode(b.dataset.m); }; });

    function paint() {
      if (!document.body.contains(root)) return false;   /* page left: unsubscribe */
      root.dataset.mode = P.mode;
      tabs.forEach(function (b, i) { var on = b.dataset.m === P.mode; b.classList.toggle('on', on); if (on) { ink.style.width = b.offsetWidth + 'px'; ink.style.transform = 'translateX(' + b.offsetLeft + 'px)'; } });
      $('#pmTime', root).textContent = clock(P.remaining);
      var frac = total() ? P.remaining / total() : 1;
      prog.style.strokeDashoffset = (RING_C * (1 - frac)).toFixed(2);
      var subj = P.subjects.filter(function (s) { return s.id === P.subjectId; })[0];
      $('#pmLabel', root).textContent = P.mode === 'work' ? (subj ? 'Focus · ' + subj.name : 'Pick a subject') : (P.mode === 'short' ? 'Short break' : 'Long break');
      var dotsOn = P.mode === 'long' ? 4 : P.cycle % 4;
      $('#pmDots', root).innerHTML = [0, 1, 2, 3].map(function (i) { return '<i class="' + (i < dotsOn ? 'on' : '') + '"></i>'; }).join('');
      go.innerHTML = P.running ? '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1.5"/><rect x="14" y="4" width="4" height="16" rx="1.5"/></svg>' : '<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="7 4 20 12 7 20"/></svg>';
      go.title = P.running ? 'Pause (Space)' : 'Start (Space)';
      root.classList.toggle('running', P.running);
      $('#pmCyc', root).textContent = P.cyclesToday; $('#pmPm', root).textContent = fmtMin(P.pomoMinToday); $('#pmAll', root).textContent = fmtMin(P.minToday);
      var pend = $('#pmPending', root);
      if (P.pending) { pend.style.display = 'flex'; pend.innerHTML = '<span>Last session was not saved (' + P.pending.minutes + ' min)</span><button id="pmRetry">Retry</button>'; $('#pmRetry', root).onclick = P.retry; }
      else if (P.mode === 'work' && P.elapsedMin() >= 1 && !P.running) { pend.style.display = 'flex'; pend.innerHTML = '<span>' + P.elapsedMin() + ' min done so far</span><button id="pmLog">Log it & reset</button>'; $('#pmLog', root).onclick = P.logSoFar; }
      else pend.style.display = 'none';
      chips.querySelectorAll('.pm-chip').forEach(function (c) { c.classList.toggle('on', +c.dataset.id === P.subjectId); c.classList.toggle('lock', P.running && P.mode === 'work'); });
      return true;
    }
    paintChips();
    $('#pmAuto', root).checked = P.auto; $('#pmSound', root).checked = P.sound;
    $('#pmAuto', root).onchange = function () { P.auto = this.checked; lsSet('stPmAuto', P.auto ? '1' : '0'); };
    $('#pmSound', root).onchange = function () { P.sound = this.checked; lsSet('stPmSound', P.sound ? '1' : '0'); };
    go.onclick = P.toggle; $('#pmReset', root).onclick = P.reset; $('#pmSkip', root).onclick = P.skip;
    root.querySelectorAll('.pm-step').forEach(function (st) {
      var inp = $('input', st);
      st.addEventListener('click', function (e) { var b = e.target.closest('button[data-d]'); if (!b) return; inp.value = Math.max(+inp.min, Math.min(+inp.max, (+inp.value || 1) + (+b.dataset.d))); });
    });
    $('#pmSave', root).onclick = function () {
      var v = {}; root.querySelectorAll('.pm-step').forEach(function (st) { var i = $('input', st); v[st.dataset.k] = Math.max(+i.min, Math.min(+i.max, parseInt(i.value, 10) || 1)); i.value = v[st.dataset.k]; });
      var btn = this; btn.disabled = true;
      api('pm_save_durations', v).then(function (d) {
        btn.disabled = false;
        if (d && d.success) { P.dur = v; if (!P.running) P.remaining = total(); emit(); toast('Durations saved', 'ok'); } else toast((d && d.message) || 'Could not save', 'warn');
      });
    };
    P.subs.push(paint); paint();
    requestAnimationFrame(function () { paint(); });
  }

  /* keyboard: Space / R / S / L on the Focus Timer page (not while typing) */
  document.addEventListener('keydown', function (e) {
    if (!/^#\/pomodoro/.test(location.hash) || e.ctrlKey || e.metaKey || e.altKey) return;
    var t = e.target; if (t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return;
    if (document.querySelector('.px-ov')) return;
    var k = e.key.toLowerCase();
    if (e.code === 'Space') { e.preventDefault(); P.toggle(); }
    else if (k === 'r') P.reset(); else if (k === 's') P.skip(); else if (k === 'l') P.logSoFar();
  });

  /* ════════════════════════════════════════════════════════════════════
     SUBJECTS
     ════════════════════════════════════════════════════════════════════ */
  var PALETTE = ['#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f97316', '#f59e0b', '#10b981', '#14b8a6', '#06b6d4', '#3b82f6'];
  var S = { subjects: [], limit: null };

  Pages.subjects = function (pc) {
    return api('sub_list').then(function (d) {
      if (!d || !d.success) return errPage(pc, d);
      S.subjects = d.subjects; S.limit = d.limit; drawSubjects(pc);
    });
  };
  function reloadSubjects() { var pc = document.getElementById('pageContent'); return api('sub_list').then(function (d) { if (d && d.success) { S.subjects = d.subjects; S.limit = d.limit; if (pc && /^#\/subjects/.test(location.hash)) drawSubjects(pc); } }); }

  function drawSubjects(pc) {
    var lim = S.limit || {}, can = lim.allowed !== false, totalWeek = 0, totalAll = 0;
    S.subjects.forEach(function (s) { totalWeek += s.week_mins; totalAll += s.total_mins; });
    var head =
      '<div class="sj-head"><div><p>' + S.subjects.length + ' subject' + (S.subjects.length === 1 ? '' : 's') + ' · ' + fmtMin(totalWeek) + ' this week · ' + fmtMin(totalAll) + ' all time</p></div>' +
      '<div class="sj-head-r">' + (!lim.is_pro && lim.limit ? '<span class="sj-lim' + (can ? '' : ' full') + '">' + lim.used + '/' + lim.limit + ' free</span>' : '') +
      '<button class="sj-add" id="sjAdd">' + (can ? '＋ Add subject' : '⚡ Upgrade for more') + '</button></div></div>';
    var body;
    if (!S.subjects.length) {
      body = '<div class="sj-empty"><div>📖</div><h2>No subjects yet</h2><p>Add your first subject to start logging study time, marks and notes.</p><button class="sj-add" id="sjAdd2">＋ Add subject</button></div>';
    } else {
      body = '<div class="sj-grid">' + S.subjects.map(card).join('') + '</div>';
    }
    pc.innerHTML = '<div class="sj">' + head + body + '</div>';
    var add = function () { if (!can) { window.st.openExternal('https://edurx.icu/studytrack/upgrade.php'); return; } addModal(); };
    $('#sjAdd', pc).onclick = add; if ($('#sjAdd2', pc)) $('#sjAdd2', pc).onclick = add;
    pc.querySelectorAll('.sj-card').forEach(function (c) {
      var id = +c.dataset.id, s = S.subjects.filter(function (x) { return x.id === id; })[0];
      c.querySelector('[data-a=focus]').onclick = function () { P.subjectId = id; lsSet('stPmSubject', id); location.hash = '#/pomodoro'; };
      c.querySelector('[data-a=target]').onclick = function () { targetModal(s); };
      c.querySelector('[data-a=del]').onclick = function () { delModal(s); };
    });
  }
  function card(s) {
    var wt = s.weekly_target_hours * 60, wp = wt > 0 ? Math.min(100, Math.round(s.week_mins / wt * 100)) : 0, done = wt > 0 && s.week_mins >= wt;
    var mp = s.target_marks > 0 ? Math.min(100, Math.round(s.avg_score / s.target_marks * 100)) : 0, hasMarks = s.exam_count > 0;
    var markCls = s.avg_score >= s.target_marks ? 'good' : (s.avg_score >= 50 ? 'mid' : 'low');
    return '<article class="sj-card" data-id="' + s.id + '" style="--c:' + E(s.color) + '">' +
      '<header><div class="sj-badge">' + E((s.name || '?').trim().charAt(0).toUpperCase()) + '</div>' +
      '<div class="sj-name"><b title="' + E(s.name) + '">' + E(s.name) + '</b><span>' + s.session_count + ' session' + (s.session_count === 1 ? '' : 's') + ' · ' + s.exam_count + ' exam' + (s.exam_count === 1 ? '' : 's') + '</span></div>' +
      '<div class="sj-tools"><button data-a="target" title="Weekly target"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1" fill="currentColor"/></svg></button>' +
      '<button data-a="del" class="dng" title="Delete"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg></button></div></header>' +
      '<div class="sj-total"><b>' + fmtMin(s.total_mins) + '</b><span>total study time</span></div>' +
      '<div class="sj-row"><div class="sj-rl"><span>This week</span><em>' + (wt > 0 ? fmtMin(s.week_mins) + ' / ' + fmtMin(wt) + (done ? ' ✓' : '') : fmtMin(s.week_mins) + ' · no target') + '</em></div>' +
      '<div class="sj-bar"><i class="' + (done ? 'done' : '') + '" style="width:' + (wt > 0 ? wp : 0) + '%"></i></div></div>' +
      '<div class="sj-row"><div class="sj-rl"><span>Avg score</span><em>' + (hasMarks ? s.avg_score + '% / ' + s.target_marks + '%' : 'no marks yet') + '</em></div>' +
      '<div class="sj-bar"><i class="' + markCls + '" style="width:' + (hasMarks ? mp : 0) + '%"></i></div></div>' +
      '<button class="sj-focus" data-a="focus"><svg viewBox="0 0 24 24" fill="currentColor"><polygon points="7 4 20 12 7 20"/></svg>Start focus</button></article>';
  }

  function addModal() {
    var color = PALETTE[Math.floor(Math.random() * PALETTE.length)];
    modal('<div class="px-h"><h3>Add subject</h3><button data-close class="px-x">✕</button></div>' +
      '<div class="px-err" id="pxErr"></div>' +
      '<label>Subject name</label><input id="pxName" class="selectable" maxlength="60" placeholder="e.g. Combined Maths" autofocus>' +
      '<label>Colour</label><div class="px-sw" id="pxSw">' + PALETTE.map(function (c) { return '<button data-c="' + c + '" style="--c:' + c + '"></button>'; }).join('') + '<input type="color" id="pxCol" value="' + color + '"></div>' +
      '<div class="px-two"><div><label>Target score %</label><input id="pxTarget" type="number" class="selectable" min="1" max="100" value="75"></div>' +
      '<div><label>Weekly target (hours)</label><input id="pxWeek" type="number" class="selectable" min="0" max="168" step="0.5" value="0"></div></div>' +
      '<div class="px-btns"><button data-close class="px-sec">Cancel</button><button id="pxOk" class="px-pri">Add subject</button></div>',
      function (ov, close) {
        var col = ov.querySelector('#pxCol'); var cur = color;
        function mark() { ov.querySelectorAll('#pxSw button').forEach(function (b) { b.classList.toggle('on', b.dataset.c === cur); }); }
        ov.querySelectorAll('#pxSw button').forEach(function (b) { b.onclick = function () { cur = b.dataset.c; col.value = cur; mark(); }; });
        col.oninput = function () { cur = col.value; mark(); }; mark();
        var name = ov.querySelector('#pxName'); setTimeout(function () { name.focus(); }, 60);
        function submit() {
          var err = ov.querySelector('#pxErr'), ok = ov.querySelector('#pxOk'); err.style.display = 'none';
          if (!name.value.trim()) { err.textContent = 'Subject name is required.'; err.style.display = 'block'; return; }
          ok.disabled = true; ok.textContent = 'Adding…';
          api('sub_add', { name: name.value, color: cur, target_marks: ov.querySelector('#pxTarget').value, weekly_target_hours: ov.querySelector('#pxWeek').value }).then(function (d) {
            if (d && d.success) { close(); toast('Subject added', 'ok'); P.loaded = false; reloadSubjects(); }
            else { ok.disabled = false; ok.textContent = 'Add subject'; err.textContent = (d && d.message) || 'Could not add subject.'; err.style.display = 'block'; }
          });
        }
        ov.querySelector('#pxOk').onclick = submit;
        ov.addEventListener('keydown', function (e) { if (e.key === 'Enter') submit(); });
      });
  }
  function targetModal(s) {
    modal('<div class="px-h"><h3>Weekly target</h3><button data-close class="px-x">✕</button></div>' +
      '<p class="px-p">How many hours a week do you want to study <b>' + E(s.name) + '</b>?</p>' +
      '<input id="pxHrs" type="number" class="selectable" min="0" max="168" step="0.5" value="' + s.weekly_target_hours + '">' +
      '<div class="px-quick">' + [2, 3, 5, 8, 10, 15].map(function (h) { return '<button data-h="' + h + '">' + h + 'h</button>'; }).join('') + '<button data-h="0" class="dng">Clear</button></div>' +
      '<div class="px-btns"><button data-close class="px-sec">Cancel</button><button id="pxOk" class="px-pri">Save</button></div>',
      function (ov, close) {
        var inp = ov.querySelector('#pxHrs'); setTimeout(function () { inp.focus(); inp.select(); }, 60);
        ov.querySelectorAll('.px-quick button').forEach(function (b) { b.onclick = function () { inp.value = b.dataset.h; }; });
        function save() { var ok = ov.querySelector('#pxOk'); ok.disabled = true; api('sub_target', { id: s.id, weekly_target_hours: inp.value }).then(function (d) { if (d && d.success) { close(); toast('Weekly target updated', 'ok'); reloadSubjects(); } else { ok.disabled = false; toast((d && d.message) || 'Could not save', 'warn'); } }); }
        ov.querySelector('#pxOk').onclick = save; inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') save(); });
      });
  }
  function delModal(s) {
    modal('<div class="px-h"><h3>Delete subject?</h3><button data-close class="px-x">✕</button></div>' +
      '<p class="px-p"><b>' + E(s.name) + '</b> and everything linked to it (' + s.session_count + ' sessions, ' + s.exam_count + ' exams, notes and cards) will be permanently removed.</p>' +
      '<div class="px-btns"><button data-close class="px-sec">Cancel</button><button id="pxOk" class="px-pri dng">Delete</button></div>',
      function (ov, close) {
        ov.querySelector('#pxOk').onclick = function () {
          this.disabled = true;
          api('sub_delete', { id: s.id }).then(function (d) { if (d && d.success) { close(); toast('Subject deleted'); P.loaded = false; reloadSubjects(); } else toast((d && d.message) || 'Could not delete', 'warn'); });
        };
      });
  }
})();
