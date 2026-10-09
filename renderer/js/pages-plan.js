/* StudyTrack Desktop - Timetable, Exam Area, Reminders pages.
 * Native app pages (same look as Goals / Tasks / Habits). Data: pages4.php (actions tt_*, ex_*, rm_*).
 * Needs js/pages-extra.js (window.StUI helpers) to be loaded first. */
(function () {
  var Pages = window.stPages, TITLES = window.stTitles, api = window.stApi, UI = window.StUI;
  if (!Pages || !api || !UI) return;
  var toast = UI.toast, modal = UI.modal, errPage = UI.errPage, $ = UI.$, lsGet = UI.lsGet, lsSet = UI.lsSet;
  TITLES.timetable = 'Timetable'; TITLES['exam-area'] = 'Exam Area'; TITLES.reminders = 'Reminders';

  var TRASH = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>';
  var PALETTE = ['#6366f1', '#a855f7', '#ec4899', '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6'];

  /* ── helpers ─────────────────────────────────────────────────────────── */
  function esc(s) { return E(String(s == null ? '' : s)); }
  function here(route) { return location.hash.indexOf('#/' + route) === 0; }
  function pcEl() { return document.getElementById('pageContent'); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function cssVar(n, d) { var v = getComputedStyle(document.documentElement).getPropertyValue(n).trim(); return v || d; }
  function toMin(t) { var p = String(t).split(':'); return (+p[0]) * 60 + (+p[1]); }
  function fmt12(t) { var m = toMin(t), h = Math.floor(m / 60), r = m % 60; return ((h % 12) || 12) + ':' + pad(r) + ' ' + (h < 12 ? 'AM' : 'PM'); }
  function fmt12s(t) { var m = toMin(t), h = Math.floor(m / 60), r = m % 60; return ((h % 12) || 12) + (r ? ':' + pad(r) : '') + (h < 12 ? 'a' : 'p'); }
  function fmtDate(s) { return new Date(s + 'T00:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }); }
  function fmtShort(s) { return new Date(s + 'T00:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }); }
  function emptyBlock(ico, h, p, btn) { return '<div class="mp-empty"><div>' + ico + '</div><h2>' + h + '</h2><p>' + p + '</p>' + (btn || '') + '</div>'; }
  function tile(ico, label, val, c) { return '<div class="mp-tile" style="--c:' + c + '"><div class="mp-tile-i">' + ico + '</div><div><b>' + val + '</b><span>' + label + '</span></div></div>'; }
  function onOff(root, sel, fn) { root.querySelectorAll(sel).forEach(function (el) { el.onclick = function (e) { fn(el, e); }; }); }
  function subOptions(list, sel, ph) {
    return (ph ? '<option value="0">' + ph + '</option>' : '') + list.map(function (s) { return '<option value="' + s.id + '"' + (s.id === sel ? ' selected' : '') + '>' + esc(s.name) + '</option>'; }).join('');
  }
  function beep() {
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

  /* generic form modal: o = {title, body, ok, danger, wide, mount(ov), collect(ov)->{error}|{action,payload}, after(d)} */
  function formModal(o) {
    return modal('<div class="px-h"><h3>' + o.title + '</h3><button data-close class="px-x">✕</button></div><div class="px-err" id="pxErr"></div>' + o.body +
      '<div class="px-btns"><button data-close class="px-sec">Cancel</button><button id="pxOk" class="px-pri' + (o.danger ? ' dng' : '') + '">' + o.ok + '</button></div>',
      function (ov, close) {
        if (o.wide) ov.firstChild.classList.add('sx-wide');
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
        ov.addEventListener('keydown', function (e) { if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA' && e.target.tagName !== 'SELECT' && !e.target.isContentEditable) { e.preventDefault(); submit(); } });
        var f = ov.querySelector('[data-focus]'); if (f) setTimeout(function () { f.focus(); }, 60);
      });
  }
  function confirmModal(title, text, okText, action, payload, after) {
    formModal({ title: title, body: '<p class="px-p">' + text + '</p>', ok: okText, danger: true, action: action, payload: payload, done: 'Deleted', after: after });
  }
  function bindSeg(ov, id, init, onChange) {
    var box = ov.querySelector('#' + id), cur = init;
    function mark() { box.querySelectorAll('button').forEach(function (b) { b.classList.toggle('on', b.dataset.v === cur); }); }
    box.querySelectorAll('button').forEach(function (b) { b.onclick = function () { cur = b.dataset.v; mark(); if (onChange) onChange(cur); }; });
    mark();
    return { get: function () { return cur; } };
  }
  function swatches(id, cur) {
    return '<div class="sx-sw" id="' + id + '">' + PALETTE.map(function (c) { return '<button type="button" data-c="' + c + '" style="background:' + c + '"' + (c === cur ? ' class="on"' : '') + '></button>'; }).join('') + '</div>';
  }
  function bindSw(ov, id, init) {
    var box = ov.querySelector('#' + id), cur = init;
    box.querySelectorAll('button').forEach(function (b) { b.onclick = function () { cur = b.dataset.c; box.querySelectorAll('button').forEach(function (x) { x.classList.toggle('on', x === b); }); }; });
    return { get: function () { return cur; } };
  }

  /* ════════════════════════════════════════════════════════════════════
     TIMETABLE
     ════════════════════════════════════════════════════════════════════ */
  var DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  var DSHORT = { Monday: 'Mon', Tuesday: 'Tue', Wednesday: 'Wed', Thursday: 'Thu', Friday: 'Fri', Saturday: 'Sat', Sunday: 'Sun' };
  var TYPES = {
    'class': { ico: '🏫', label: 'Class', hint: 'School, tuition or lecture', ph: 'e.g. Physics class, Chemistry tuition' },
    study: { ico: '📖', label: 'Study', hint: 'Revision, reading, past papers', ph: 'e.g. Revision, Past papers, Reading' },
    task: { ico: '📝', label: 'Task', hint: 'Homework, assignments, projects', ph: 'e.g. Maths homework, Project work' },
    other: { ico: '📌', label: 'Other', hint: 'Anything else you have to do', ph: 'e.g. Sports practice, Family time' }
  };
  var TT = { slots: [], subjects: [], timer: null }, HOUR = 56;
  function todayName() { return DAYS[(new Date().getDay() + 6) % 7]; }
  function slotName(s) { return s.label || s.subject_name || (TYPES[s.type] || TYPES['class']).label; }

  Pages.timetable = function (pc) {
    return api('tt_list').then(function (d) {
      if (!d || !d.success) return errPage(pc, d);
      TT.slots = d.slots; TT.subjects = d.subjects; drawTT(pc, true);
    });
  };
  function ttReload() {
    return api('tt_list').then(function (d) { if (d && d.success) { TT.slots = d.slots; TT.subjects = d.subjects; if (here('timetable') && pcEl()) drawTT(pcEl(), false); } });
  }
  function ttRange() {
    var s = 7 * 60, e = 21 * 60;
    if (TT.slots.length) {
      var mn = 1440, mx = 0;
      TT.slots.forEach(function (x) { mn = Math.min(mn, toMin(x.start)); mx = Math.max(mx, toMin(x.end)); });
      s = Math.min(s, Math.floor(mn / 60) * 60); e = Math.max(e, Math.ceil(mx / 60) * 60);
    }
    if (e <= s) e = s + 60;
    return { s: s, e: e };
  }
  /* overlapping slots in one day sit side by side */
  function layoutDay(list) {
    var arr = list.map(function (x) { return { x: x, s: toMin(x.start), e: toMin(x.end), lane: 0, n: 1 }; }).sort(function (a, b) { return a.s - b.s || a.e - b.e; });
    var lanes = [], cluster = [], cEnd = 0;
    function flush() { var n = 0; cluster.forEach(function (c) { n = Math.max(n, c.lane + 1); }); cluster.forEach(function (c) { c.n = n; }); cluster = []; lanes = []; cEnd = 0; }
    arr.forEach(function (it) {
      if (cluster.length && it.s >= cEnd) flush();
      var l = 0; while (lanes[l] !== undefined && lanes[l] > it.s) l++;
      lanes[l] = it.e; it.lane = l; cluster.push(it); cEnd = Math.max(cEnd, it.e);
    });
    flush();
    return arr;
  }
  function nowTop(r) { var n = new Date(), m = n.getHours() * 60 + n.getMinutes(); return (m >= r.s && m <= r.e) ? ((m - r.s) / 60) * HOUR : -1; }

  function drawTT(pc, first) {
    var oldScroll = pc.querySelector('.tt-scroll'), keep = oldScroll ? oldScroll.scrollTop : 0;
    var r = ttRange(), H = Math.round(((r.e - r.s) / 60) * HOUR), today = todayName();
    var active = TT.slots.filter(function (s) { return s.active; });
    var todayItems = active.filter(function (s) { return s.day === today; });
    var pct = TT.slots.length ? Math.round(active.length / TT.slots.length * 100) : 0;
    var head = '<div class="mp-head"><p>Plan your week — classes, study sessions, homework and anything else you have to do</p><div class="mp-head-r"><button class="mp-add" id="ttAdd">＋ Add slot</button></div></div>';
    var tiles = '<div class="mp-tiles four">' + tile('📋', 'Total slots', TT.slots.length, '#6366f1') + tile('✅', 'Active slots · ' + pct + '%', active.length, '#14b8a6') +
      tile('📚', "Today's schedule", todayItems.length, '#f97316') + tile('📖', 'Subjects', TT.subjects.length, '#22c55e') + '</div>';
    var hdr = '<div class="tt-row tt-hd"><div class="tt-corner"></div>' + DAYS.map(function (d) {
      var n = TT.slots.filter(function (s) { return s.day === d; }).length;
      return '<div class="tt-dh' + (d === today ? ' today' : '') + '"><div><b>' + DSHORT[d] + '</b>' + (n ? '<span>' + n + ' slot' + (n > 1 ? 's' : '') + '</span>' : '') + '</div><button data-add="' + d + '" title="Add slot to ' + d + '">＋</button></div>';
    }).join('') + '</div>';
    var times = '';
    for (var m = r.s; m < r.e; m += 60) times += '<div class="tt-tl" style="top:' + (((m - r.s) / 60) * HOUR) + 'px">' + (((m / 60) % 12) || 12) + ' ' + (m / 60 < 12 ? 'AM' : 'PM') + '</div>';
    var nt = nowTop(r);
    var cols = DAYS.map(function (d) {
      var items = layoutDay(TT.slots.filter(function (s) { return s.day === d; }));
      var html = items.map(function (it) {
        var s = it.x, top = ((it.s - r.s) / 60) * HOUR, h = Math.max(((it.e - it.s) / 60) * HOUR - 3, 20), t = TYPES[s.type] || TYPES['class'];
        return '<div class="tt-slot' + (s.active ? '' : ' off') + '" data-id="' + s.id + '" title="' + esc(t.label) + '" style="top:' + top + 'px;height:' + h + 'px;left:calc(' + (it.lane / it.n * 100) + '% + 3px);width:calc(' + (100 / it.n) + '% - 6px);background:' + esc(s.color) + '">' +
          '<div class="tt-st"><span>' + t.ico + '</span>' + esc(slotName(s)) + '</div>' + (h > 30 ? '<div class="tt-sm">' + fmt12s(s.start) + ' – ' + fmt12s(s.end) + '</div>' : '') + '</div>';
      }).join('');
      if (d === today && nt >= 0) html += '<div class="tt-now" style="top:' + nt + 'px"></div>';
      return '<div class="tt-col' + (d === today ? ' today' : '') + '" style="--hp:' + HOUR + 'px">' + html + '</div>';
    }).join('');
    var body = '<div class="tt-row tt-bd" style="height:' + H + 'px"><div class="tt-times">' + times + '</div>' + cols + '</div>';
    var empty = TT.slots.length ? '' : '<p class="mp-note tt-hint">No slots yet — press <b>＋ Add slot</b> (or the ＋ above a day) to start your week.</p>';
    pc.innerHTML = '<div class="mp tt">' + head + tiles + empty + '<div class="mp-card tt-card"><div class="tt-scroll" id="ttScroll"><div class="tt-grid">' + hdr + body + '</div></div></div></div>';

    var sc = $('#ttScroll', pc);
    if (first) { var n = new Date(), nm = n.getHours() * 60 + n.getMinutes(), anchor = Math.min(Math.max(nm - 90, r.s), r.e); sc.scrollTop = Math.max(0, ((anchor - r.s) / 60) * HOUR); }
    else sc.scrollTop = keep;
    $('#ttAdd', pc).onclick = function () { slotAddModal(); };
    onOff(pc, '[data-add]', function (b) { slotAddModal(b.dataset.add); });
    onOff(pc, '.tt-slot', function (el) { slotModal(+el.dataset.id); });
    clearInterval(TT.timer);
    TT.timer = setInterval(function () {
      var line = pc.querySelector('.tt-now'), col = pc.querySelector('.tt-col.today'); if (!col) return;
      var t = nowTop(r);
      if (t < 0) { if (line) line.remove(); return; }
      if (!line) { line = document.createElement('div'); line.className = 'tt-now'; col.appendChild(line); }
      line.style.top = t + 'px';
    }, 60000);
  }

  function slotModal(id) {
    var s = TT.slots.filter(function (x) { return x.id === id; })[0]; if (!s) return;
    var row = function (l, v) { return '<div class="tt-dr"><span>' + l + '</span><b>' + v + '</b></div>'; };
    modal('<div class="px-h"><h3><i class="tt-dsw" style="background:' + esc(s.color) + '"></i>Slot details</h3><button data-close class="px-x">✕</button></div>' +
      row('Label', esc(slotName(s))) + row('Day', s.day) + row('Time', fmt12(s.start) + ' – ' + fmt12(s.end)) + (s.subject_name ? row('Subject', esc(s.subject_name)) : '') +
      row('Status', s.active ? 'Active' : '<em style="color:#f59e0b;font-style:normal">Inactive</em>') +
      '<label>Type</label><div class="px-seg" id="ttDType">' + Object.keys(TYPES).map(function (k) { return '<button data-v="' + k + '">' + TYPES[k].ico + ' ' + TYPES[k].label + '</button>'; }).join('') + '</div>' +
      '<div class="px-btns"><button id="ttDel" class="px-pri dng">Delete</button><button id="ttTog" class="px-sec">' + (s.active ? 'Make inactive' : 'Make active') + '</button></div>',
      function (ov, close) {
        var cur = s.type;
        ov.querySelectorAll('#ttDType button').forEach(function (b) {
          b.classList.toggle('on', b.dataset.v === cur);
          b.onclick = function () {
            if (b.dataset.v === cur) return;
            api('tt_set_type', { id: id, type: b.dataset.v }).then(function (d) { close(); if (d && d.success) { toast('Type updated', 'ok'); ttReload(); } else toast((d && d.message) || 'Could not update', 'warn'); });
          };
        });
        ov.querySelector('#ttTog').onclick = function () {
          api('tt_toggle', { id: id }).then(function (d) { close(); if (d && d.success) ttReload(); else toast((d && d.message) || 'Could not update', 'warn'); });
        };
        ov.querySelector('#ttDel').onclick = function () {
          close(); confirmModal('Delete slot?', 'Remove <b>' + esc(slotName(s)) + '</b> (' + s.day + ', ' + fmt12(s.start) + ')?', 'Delete', 'tt_delete', { id: id }, ttReload);
        };
      });
  }

  function slotAddModal(presetDay) {
    var tn = todayName();
    formModal({
      title: 'Add schedule slot', ok: 'Save slot', done: 'Slot added!',
      body: '<label>What is this slot for?</label><div class="px-seg" id="ttType">' + Object.keys(TYPES).map(function (k) { return '<button data-v="' + k + '">' + TYPES[k].ico + ' ' + TYPES[k].label + '</button>'; }).join('') + '</div><p class="mp-note" id="ttHint" style="margin-top:8px"></p>' +
        '<label>Day</label><select id="ttDay">' + DAYS.map(function (d) { return '<option' + (d === (presetDay || tn) ? ' selected' : '') + '>' + d + '</option>'; }).join('') + '</select>' +
        '<div class="sx-2"><div><label>Start time</label><input id="ttStart" type="time" value="08:00"></div><div><label>End time</label><input id="ttEnd" type="time" value="09:00"></div></div>' +
        '<label>Subject <span class="sx-opt">(optional)</span></label><select id="ttSub">' + subOptions(TT.subjects, 0, '— No subject —') + '</select>' +
        '<label>Label <span class="sx-opt">(optional)</span></label><input id="ttLabel" data-focus maxlength="100">' +
        '<label>Colour</label>' + swatches('ttSw', PALETTE[0]),
      mount: function (ov) {
        var lab = ov.querySelector('#ttLabel'), hint = ov.querySelector('#ttHint');
        ov._seg = bindSeg(ov, 'ttType', 'class', function (k) { hint.textContent = TYPES[k].hint; lab.placeholder = TYPES[k].ph; });
        hint.textContent = TYPES['class'].hint; lab.placeholder = TYPES['class'].ph;
        ov._sw = bindSw(ov, 'ttSw', PALETTE[0]);
      },
      collect: function (ov) {
        var day = ov.querySelector('#ttDay').value, st = ov.querySelector('#ttStart').value, en = ov.querySelector('#ttEnd').value;
        var sid = +ov.querySelector('#ttSub').value || 0, label = ov.querySelector('#ttLabel').value.trim(), type = ov._seg.get();
        if (!st || !en) return { error: 'Please set start and end time.' };
        if (st >= en) return { error: 'End time must be after start time.' };
        if ((type === 'task' || type === 'other') && !label && !sid) return { error: 'Please write what you have to do in this slot.' };
        return { action: 'tt_add', payload: { day: day, start_time: st, end_time: en, subject_id: sid, label: label, color: ov._sw.get(), type: type } };
      },
      after: ttReload
    });
  }

  /* ════════════════════════════════════════════════════════════════════
     EXAM AREA  (the timer lives outside the page: it keeps running while you browse other pages)
     ════════════════════════════════════════════════════════════════════ */
  var X = window.StExam = { s: null, subs: [], tickT: null, saving: false, warned: false };
  var EX_KEY = 'stExamState', EX_STALE = 12 * 3600 * 1000;
  function xRem() { if (!X.s) return 0; return X.s.paused ? X.s.base : X.s.base - (Date.now() - X.s.savedAt) / 1000; }
  function xPersist() { try { if (X.s) localStorage.setItem(EX_KEY, JSON.stringify(X.s)); else localStorage.removeItem(EX_KEY); } catch (e) {} }
  function xClock(sec) {
    var over = sec < 0; sec = Math.max(0, Math.round(Math.abs(sec)));
    var h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
    return (over ? '+' : '') + (h > 0 ? pad(h) + ':' : '') + pad(m) + ':' + pad(s);
  }
  function xDur(sec) { sec = Math.max(0, Math.round(sec)); var h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60; return h > 0 ? h + ':' + pad(m) + ':' + pad(s) : m + ':' + pad(s); }
  function xEmit() { X.subs = X.subs.filter(function (f) { try { return f() !== false; } catch (e) { return false; } }); xChip(); }
  function xTick() {   /* setTimeout chain - not tied to the page, survives navigation */
    clearTimeout(X.tickT);
    if (!X.s) return;
    var rem = xRem();
    if (rem <= 0 && !X.warned && !X.s.paused) { X.warned = true; beep(); notify('Exam time is up ⏰', X.s.label + ' - you are now in overtime. Finish when you are done.'); }
    xEmit();
    X.tickT = setTimeout(xTick, 500);
  }
  X.start = function (o) {
    X.s = { subjectId: o.subjectId || 0, paperId: o.paperId || 0, subName: o.subName, label: o.label, totalSec: o.totalSec, base: o.totalSec, paused: false, savedAt: Date.now() };
    X.warned = false; xPersist(); xTick();
  };
  X.toggle = function () { if (!X.s) return; X.s.base = xRem(); X.s.paused = !X.s.paused; X.s.savedAt = Date.now(); xPersist(); xEmit(); };
  X.discard = function () { X.s = null; X.warned = false; clearTimeout(X.tickT); xPersist(); xEmit(); };
  X.finish = function () {
    if (!X.s || X.saving) return Promise.resolve();
    if (!X.s.paused) { X.s.base = xRem(); X.s.paused = true; X.s.savedAt = Date.now(); xPersist(); xEmit(); }   /* freeze: saved time = what is on screen */
    var elapsed = Math.max(1, Math.round(X.s.totalSec - X.s.base)), s = X.s;
    X.saving = true; xEmit();
    return api('ex_save', { subject_id: s.subjectId, paper_id: s.paperId, label: s.label, duration_seconds: s.totalSec, time_taken_seconds: elapsed }).then(function (d) {
      X.saving = false;
      if (d && d.success) {
        toast('✅ Exam saved · ' + xDur(elapsed) + ' used', 'ok');
        X.discard();
        if (window.__exReload) window.__exReload();
      } else { toast((d && d.message) || 'Could not save - your time is safe, try Finish again.', 'warn'); xEmit(); }
    });
  };
  /* title-bar chip (while an exam runs and you are on another page) */
  var xchip = document.createElement('button');
  xchip.id = 'tbExam'; xchip.title = 'Open Exam Area'; xchip.style.display = 'none';
  xchip.onclick = function () { location.hash = '#/exam-area'; };
  (function () { var tb = document.getElementById('stTitlebar'), t = document.getElementById('tbTitle'); if (tb && t) tb.insertBefore(xchip, t); })();
  function xChip() {
    var on = X.s && !/^#\/exam-area/.test(location.hash);
    xchip.style.display = on ? 'inline-flex' : 'none';
    if (!X.s) return;
    var over = xRem() < 0;
    xchip.className = (X.s.paused ? 'pause ' : 'run ') + (over ? 'over' : '');
    xchip.textContent = '📝 ' + xClock(Math.ceil(xRem())) + (X.s.paused ? '  ⏸' : '');
  }
  window.addEventListener('hashchange', xChip);
  document.addEventListener('visibilitychange', function () { if (X.s && !document.hidden) xTick(); });
  (function restore() {   /* an exam that was running when the app was closed / refreshed */
    try {
      var raw = localStorage.getItem(EX_KEY); if (!raw) return;
      var s = JSON.parse(raw);
      if (!s || typeof s.base !== 'number' || !s.savedAt || (Date.now() - s.savedAt) > EX_STALE) { localStorage.removeItem(EX_KEY); return; }
      X.s = { subjectId: s.subjectId || 0, paperId: s.paperId || 0, subName: s.subName || 'General', label: s.label || 'Exam Session', totalSec: s.totalSec || 0, base: s.base, paused: !!s.paused, savedAt: s.savedAt };
      xTick();
    } catch (e) { try { localStorage.removeItem(EX_KEY); } catch (_) {} }
  })();

  var EX = { sessions: [], subjects: [], filter: 0, charts: { trend: null, sub: null } };
  Pages['exam-area'] = function (pc) {
    return api('ex_list', { subject_id: EX.filter }).then(function (d) {
      if (!d || !d.success) return errPage(pc, d);
      EX.sessions = d.sessions; EX.subjects = d.subjects;
      if (EX.filter && !EX.subjects.some(function (s) { return s.id === EX.filter; })) EX.filter = 0;
      drawEx(pc);
    });
  };
  function exReload() {
    return api('ex_list', { subject_id: EX.filter }).then(function (d) { if (d && d.success) { EX.sessions = d.sessions; EX.subjects = d.subjects; if (here('exam-area') && pcEl()) drawEx(pcEl()); } });
  }
  window.__exReload = exReload;

  function drawEx(pc) {
    var S = EX.sessions, total = S.length, sum = 0, longest = 0, over = 0;
    S.forEach(function (x) { sum += x.time_taken_seconds; longest = Math.max(longest, x.time_taken_seconds); if (x.time_taken_seconds > x.duration_seconds) over++; });
    var avg = total ? Math.round(sum / total) : null;
    var live = '<div class="ex-live" id="exLive" style="display:none"><span class="ex-badge"><i></i><em id="exState">In progress</em></span><div class="ex-lt" id="exTitle"></div><div class="ex-ls" id="exSub"></div>' +
      '<div class="ex-clockwrap"><div class="ex-clock" id="exClock">00:00</div><div class="ex-over" id="exOver" style="display:none">Overtime — keep going or finish</div></div>' +
      '<div class="mp-bar"><i id="exBar" style="width:0"></i></div>' +
      '<div class="ex-ctrls"><button class="mp-add sec" id="exPause">⏸ Pause</button><button class="mp-add sec" id="exFs">⛶ Fullscreen</button><button class="mp-add" id="exFinish">✓ Finish &amp; save</button><button class="mp-add sec dng" id="exDiscard">Discard</button></div></div>';
    var head = '<div class="mp-head"><div class="mp-head-l"><select class="mp-sel" id="exSel">' + subOptions(EX.subjects, EX.filter, 'All subjects') + '</select></div><div class="mp-head-r"><button class="mp-add" id="exNew">＋ Start new exam</button></div></div>';
    var tiles = '<div class="mp-tiles four">' + tile('📝', 'Exams taken', total, '#f97316') + tile('⏱️', 'Avg time used', avg !== null ? xDur(avg) : '—', '#06b6d4') +
      tile('🏁', 'Longest session', total ? xDur(longest) : '—', '#10b981') + tile('⚠️', 'Ran overtime', over, '#ef4444') + '</div>';
    var bySub = {}, order = [];
    S.forEach(function (x) { var k = x.subject_name || 'General'; if (!bySub[k]) { bySub[k] = { sum: 0, n: 0, color: x.subject_color || '#6366f1' }; order.push(k); } bySub[k].sum += x.time_taken_seconds; bySub[k].n++; });
    var recent = S.slice().reverse().slice(-10);
    var charts = '';
    if (recent.length) charts = '<div class="ex-charts"><div class="mp-card"><div class="mp-card-t"><span>Recent sessions</span><span>Last ' + recent.length + '</span></div><div class="ex-chart"><canvas id="exTrend"></canvas></div></div>' +
      '<div class="mp-card"><div class="mp-card-t"><span>Avg time by subject</span><span>' + order.length + ' subject' + (order.length === 1 ? '' : 's') + '</span></div><div class="ex-chart"><canvas id="exSubC"></canvas></div></div></div>';
    var list;
    if (!S.length) list = emptyBlock('⏱️', 'No exams timed yet', 'Press “Start new exam” to time your first practice session.');
    else list = '<div class="mp-card-t ex-ht"><span>Exam history</span></div><div class="ex-list">' + S.map(function (x) {
      var ov = x.time_taken_seconds > x.duration_seconds;
      return '<div class="ex-row"><i class="ex-dot" style="background:' + esc(x.subject_color || '#6366f1') + '"></i><div class="ex-main"><b>' + esc(x.label) + '</b><span>' + esc(x.subject_name || 'General') + ' · ' + fmtDate(x.completed_at.slice(0, 10)) + '</span></div>' +
        '<div class="ex-time' + (ov ? ' over' : '') + '">' + xDur(x.time_taken_seconds) + '<em>/ ' + xDur(x.duration_seconds) + ' planned' + (ov ? ' · overtime' : '') + '</em></div>' +
        '<button class="mp-ib dng" data-del="' + x.id + '" title="Delete">' + TRASH + '</button></div>';
    }).join('') + '</div>';
    pc.innerHTML = '<div class="mp ex">' + live + head + tiles + charts + list + '</div>';

    $('#exSel', pc).onchange = function () { EX.filter = +this.value; exReload(); };
    $('#exNew', pc).onclick = function () { if (X.s) { toast('An exam is already running'); return; } examSetup(); };
    $('#exPause', pc).onclick = function () { X.toggle(); };
    $('#exFinish', pc).onclick = function () { X.finish(); };
    $('#exFs', pc).onclick = openFs;
    $('#exDiscard', pc).onclick = function () {
      modal('<div class="px-h"><h3>Discard this exam?</h3><button data-close class="px-x">✕</button></div><p class="px-p">The time so far will <b>not</b> be saved.</p>' +
        '<div class="px-btns"><button data-close class="px-sec">Keep going</button><button id="exDisc" class="px-pri dng">Discard</button></div>',
        function (ov, close) { ov.querySelector('#exDisc').onclick = function () { close(); X.discard(); toast('Exam discarded'); }; });
    };
    onOff(pc, '[data-del]', function (b) {
      var id = +b.dataset.del, x = EX.sessions.filter(function (q) { return q.id === id; })[0];
      confirmModal('Delete exam session?', 'Remove <b>' + esc(x.label) + '</b> from your history?', 'Delete', 'ex_delete', { id: id }, exReload);
    });
    drawExCharts(recent, order, bySub);
    X.subs = X.subs.filter(function (f) { return f !== exPageRender; }); X.subs.push(exPageRender); exPageRender(); xChip();
  }
  function exPageRender() {
    var live = document.getElementById('exLive');
    if (!live) return false;
    if (!X.s) { live.style.display = 'none'; var nb = document.getElementById('exNew'); if (nb) nb.disabled = false; return; }
    var rem = xRem(), secs = Math.ceil(rem), over = secs < 0, s = X.s;
    live.style.display = 'block'; live.classList.toggle('paused', !!s.paused); live.classList.toggle('over', over);
    document.getElementById('exTitle').textContent = s.label;
    document.getElementById('exSub').textContent = s.subName + ' • ' + Math.round(s.totalSec / 60) + ' min planned';
    var ck = document.getElementById('exClock'); ck.textContent = xClock(secs); ck.classList.toggle('over', over);
    document.getElementById('exOver').style.display = over ? 'block' : 'none';
    document.getElementById('exState').textContent = X.saving ? 'Saving…' : (over ? 'Overtime' : (s.paused ? 'Paused' : 'In progress'));
    var pct = s.totalSec > 0 ? ((s.totalSec - rem) / s.totalSec) * 100 : 0;
    document.getElementById('exBar').style.width = Math.min(100, Math.max(0, pct)) + '%';
    document.getElementById('exPause').textContent = s.paused ? '▶ Resume' : '⏸ Pause';
    document.getElementById('exFinish').disabled = X.saving;
    var nb2 = document.getElementById('exNew'); if (nb2) nb2.disabled = true;
  }
  function openFs() {
    if (!X.s || document.getElementById('exFsView')) return;
    var el = document.createElement('div'); el.id = 'exFsView'; el.className = 'ex-fs';
    el.innerHTML = '<div class="ex-fs-sub" id="fsSub"></div><div class="ex-fs-clock" id="fsClock">00:00</div><div class="ex-fs-over" id="fsOver" style="display:none">Overtime</div>' +
      '<div class="ex-fs-ctrls"><button class="mp-add sec" id="fsPause">⏸ Pause</button><button class="mp-add" id="fsFinish">✓ Finish &amp; save</button><button class="mp-add sec" id="fsExit">✕ Exit fullscreen</button></div>';
    document.body.appendChild(el);
    function close() { if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(function () {}); el.remove(); document.removeEventListener('fullscreenchange', fsc); }
    function fsc() { if (!document.fullscreenElement) { el.remove(); document.removeEventListener('fullscreenchange', fsc); } }
    el.querySelector('#fsPause').onclick = function () { X.toggle(); };
    el.querySelector('#fsFinish').onclick = function () { close(); X.finish(); };
    el.querySelector('#fsExit').onclick = close;
    document.addEventListener('fullscreenchange', fsc);
    if (el.requestFullscreen) el.requestFullscreen().catch(function () {});
    X.subs.push(function () {
      if (!document.body.contains(el)) return false;
      if (!X.s) { close(); return false; }
      var secs = Math.ceil(xRem()), over = secs < 0;
      el.querySelector('#fsSub').textContent = X.s.label + ' • ' + X.s.subName;
      var c = el.querySelector('#fsClock'); c.textContent = xClock(secs); c.classList.toggle('over', over);
      el.querySelector('#fsOver').style.display = over ? 'block' : 'none';
      el.querySelector('#fsPause').textContent = X.s.paused ? '▶ Resume' : '⏸ Pause';
    });
    xEmit();
  }

  function drawExCharts(recent, order, bySub) {
    ['trend', 'sub'].forEach(function (k) { if (EX.charts[k]) { EX.charts[k].destroy(); EX.charts[k] = null; } });
    if (!window.Chart || !recent.length) return;
    var tc = cssVar('--text-muted', '#64748b'), gc = 'rgba(127,127,160,.16)', tbg = cssVar('--bg-card', '#101018'), tx = cssVar('--text-primary', '#f1f5f9');
    var base = {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { backgroundColor: tbg, titleColor: tx, bodyColor: tc, borderColor: 'rgba(249,115,22,.3)', borderWidth: 1, cornerRadius: 10, padding: 12 } },
      scales: { x: { grid: { display: false }, border: { display: false }, ticks: { color: tc, font: { size: 11 } } },
        y: { grid: { color: gc }, border: { display: false }, min: 0, ticks: { color: tc, font: { size: 11 }, callback: function (v) { return v + 'm'; } } } },
      animation: { duration: 600 }
    };
    var tipMin = { callbacks: { label: function (c) { return '  ' + c.raw + ' min'; } } };
    var tEl = document.getElementById('exTrend'), sEl = document.getElementById('exSubC');
    if (tEl) EX.charts.trend = new Chart(tEl.getContext('2d'), { type: 'line', data: { labels: recent.map(function (x) { return fmtShort(x.completed_at.slice(0, 10)); }),
      datasets: [{ data: recent.map(function (x) { return Math.round(x.time_taken_seconds / 6) / 10; }), borderColor: '#f97316', backgroundColor: 'rgba(249,115,22,.1)', pointBackgroundColor: '#f97316', pointRadius: 5, pointHoverRadius: 7, borderWidth: 2.5, fill: true, tension: .35 }] },
      options: Object.assign({}, base, { plugins: Object.assign({}, base.plugins, { tooltip: Object.assign({}, base.plugins.tooltip, tipMin) }) }) });
    if (sEl) EX.charts.sub = new Chart(sEl.getContext('2d'), { type: 'bar', data: { labels: order,
      datasets: [{ data: order.map(function (k) { return Math.round(bySub[k].sum / bySub[k].n / 6) / 10; }), backgroundColor: order.map(function (k) { return bySub[k].color + '99'; }), hoverBackgroundColor: order.map(function (k) { return bySub[k].color; }), borderRadius: 8, borderSkipped: false, borderWidth: 0 }] },
      options: Object.assign({}, base, { plugins: Object.assign({}, base.plugins, { tooltip: Object.assign({}, base.plugins.tooltip, tipMin) }) }) });
  }

  function examSetup() {
    modal('<div class="px-h"><h3>Start new exam</h3><button data-close class="px-x">✕</button></div><div class="px-err" id="pxErr"></div>' +
      '<label>Subject <span class="sx-opt">(optional)</span></label><select id="xSub">' + subOptions(EX.subjects, EX.filter, '— None / General —') + '</select>' +
      '<div id="xPaperWrap" style="display:none"><label>Link to a past paper <span class="sx-opt">(optional)</span></label><select id="xPaper"><option value="">— None / custom label —</option></select></div>' +
      '<label>Label</label><input id="xLabel" data-focus maxlength="150" placeholder="e.g. Mock exam 1, 2021 Paper 1…">' +
      '<label>Duration</label><div class="px-quick" id="xPre"><button data-m="30">30m</button><button data-m="60">1h</button><button data-m="90">1h 30m</button><button data-m="120">2h</button><button data-m="180">3h</button></div>' +
      '<input id="xMin" type="number" min="1" max="600" value="60" style="margin-top:10px" placeholder="Custom minutes">' +
      '<div class="px-btns"><button data-close class="px-sec">Cancel</button><button id="pxOk" class="px-pri">Begin exam →</button></div>',
      function (ov, close) {
        var sub = ov.querySelector('#xSub'), wrap = ov.querySelector('#xPaperWrap'), paper = ov.querySelector('#xPaper'), lab = ov.querySelector('#xLabel'), min = ov.querySelector('#xMin'), err = ov.querySelector('#pxErr');
        function loadPapers() {
          var sid = +sub.value || 0;
          if (!sid) { wrap.style.display = 'none'; paper.innerHTML = '<option value="">— None / custom label —</option>'; return; }
          wrap.style.display = 'block'; paper.innerHTML = '<option value="">Loading…</option>';
          api('ex_papers', { subject_id: sid }).then(function (d) {
            var h = '<option value="">— None / custom label —</option>';
            ((d && d.papers) || []).forEach(function (p) {
              var l = 'Paper ' + p.paper_no + ' (' + p.year + ')' + (p.lesson ? ' — ' + p.lesson : '');
              h += '<option value="' + p.id + '" data-l="' + esc(l) + '">' + esc(l) + '</option>';
            });
            paper.innerHTML = h;
          });
        }
        sub.onchange = loadPapers; loadPapers();
        paper.onchange = function () { var o = paper.options[paper.selectedIndex]; if (o && o.value) lab.value = o.dataset.l || o.textContent; };
        ov.querySelectorAll('#xPre button').forEach(function (b) { b.onclick = function () { min.value = b.dataset.m; }; });
        function begin() {
          var m = parseInt(min.value, 10) || 0;
          if (m <= 0 || m > 600) { err.textContent = 'Please set a valid duration (1–600 minutes).'; err.style.display = 'block'; return; }
          var sid = +sub.value || 0, name = sid ? sub.options[sub.selectedIndex].textContent : 'General';
          var label = lab.value.trim() || (sid ? name + ' Exam' : 'Exam Session');
          close();
          X.start({ subjectId: sid, paperId: +paper.value || 0, subName: name, label: label, totalSec: m * 60 });
        }
        ov.querySelector('#pxOk').onclick = begin;
        ov.addEventListener('keydown', function (e) { if (e.key === 'Enter' && e.target.tagName !== 'SELECT') { e.preventDefault(); begin(); } });
        setTimeout(function () { lab.focus(); }, 60);
      });
  }

  /* ════════════════════════════════════════════════════════════════════
     REMINDERS  (delivered by the Telegram bot; the app also alerts you while it is open)
     ════════════════════════════════════════════════════════════════════ */
  var RD = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  var RM = { list: [], tg: false, alerts: lsGet('stRemAlerts', '1') === '1', fired: {}, started: false, tick: null };
  var TG_ICO = '<svg viewBox="0 0 240 240" width="40" height="40"><circle cx="120" cy="120" r="120" fill="#229ED9"/><path fill="#fff" d="M54 118l118-46c5-2 10 1 8 9l-20 95c-1 6-5 8-10 5l-31-23-15 14c-2 2-3 3-6 3l2-31 57-52c3-3-1-4-4-2l-71 45-31-10c-7-2-7-7 2-10z"/></svg>';
  var BOT = 'https://t.me/StudyTrackedurx_bot';

  function nextFire(r) {
    if (!r.active || !r.days.length) return '';
    var now = new Date(), t = toMin(r.time);
    for (var i = 0; i < 8; i++) {
      var d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
      var name = RD[(d.getDay() + 6) % 7];
      if (r.days.indexOf(name) === -1) continue;
      if (i === 0 && t <= now.getHours() * 60 + now.getMinutes()) continue;
      return (i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : name) + ' · ' + fmt12(r.time);
    }
    return '';
  }

  Pages.reminders = function (pc) {
    return api('rm_list').then(function (d) {
      if (!d || !d.success) return errPage(pc, d);
      RM.list = d.reminders; RM.tg = d.tg_linked; drawRm(pc);
    });
  };
  function rmReload(quiet) {
    return api('rm_list').then(function (d) { if (d && d.success) { RM.list = d.reminders; RM.tg = d.tg_linked; if (!quiet && here('reminders') && pcEl()) drawRm(pcEl()); } return d; });
  }
  function drawRm(pc) {
    var act = RM.list.filter(function (r) { return r.active; });
    var head = '<div class="mp-head"><p>Set daily reminders to keep your study habit consistent</p><div class="mp-head-r"><button class="mp-add" id="rmAdd">＋ Add reminder</button></div></div>';
    var tg = '<div class="mp-card rm-tg"><div class="rm-tg-i">' + TG_ICO + '</div><div class="rm-tg-t"><b>Get reminders on Telegram</b>' +
      (RM.tg ? '<span class="ok">✅ Telegram connected — your reminders are sent to you in the StudyTrack bot at the time you set.</span>'
        : '<span>Your reminders are delivered by the StudyTrack Telegram bot. Link your account to start receiving them. In the bot tap “Link my StudyTrack account” and log in, then press “Check again”.</span>') + '</div>' +
      '<div class="rm-tg-b"><button class="mp-add" id="rmTg">' + (RM.tg ? 'Open Telegram bot' : 'Connect Telegram') + '</button>' + (RM.tg ? '' : '<button class="mp-add sec" id="rmChk">Check again</button>') + '</div></div>';
    var al = '<div class="mp-card rm-al"><div class="rm-tg-t"><b>Desktop alerts</b><span>Also pop up a notification on this PC at the reminder time while StudyTrack is open.</span></div>' +
      '<div class="rm-tg-b"><button class="mp-add sec" id="rmTest">Send test</button><button class="rm-sw' + (RM.alerts ? ' on' : '') + '" id="rmSw" role="switch" aria-checked="' + RM.alerts + '" title="Desktop alerts"><i></i></button></div></div>';
    var body;
    if (!RM.list.length) body = emptyBlock('🔔', 'No reminders set', 'Create a reminder to build a consistent study habit!', '<button class="mp-add" id="rmAdd2">＋ Add reminder</button>');
    else body = '<div class="rm-list">' + RM.list.map(function (r) {
      var nx = nextFire(r);
      return '<div class="rm-card' + (r.active ? '' : ' off') + '"><div class="rm-body"><div class="rm-title">' + (r.active ? '🔔' : '🔕') + ' ' + esc(r.title) + '</div>' + (r.message ? '<div class="rm-msg">' + esc(r.message) + '</div>' : '') +
        '<div class="rm-meta"><span class="rm-time">' + fmt12(r.time) + '</span><div class="rm-days">' + RD.map(function (d) { return '<span class="' + (r.days.indexOf(d) !== -1 ? 'on' : '') + '">' + d + '</span>'; }).join('') + '</div>' + (nx ? '<span class="rm-next">Next: ' + nx + '</span>' : '') + '</div></div>' +
        '<div class="rm-act"><button class="mp-mini" data-tg="' + r.id + '">' + (r.active ? 'Pause' : 'Resume') + '</button><button class="mp-ib dng" data-del="' + r.id + '" title="Delete">' + TRASH + '</button></div></div>';
    }).join('') + '</div>';
    pc.innerHTML = '<div class="mp rm">' + head + tg + al + (RM.list.length ? '<div class="mp-card-t rm-ht"><span>Your reminders</span><span>' + act.length + ' active</span></div>' : '') + body + '</div>';
    $('#rmAdd', pc).onclick = reminderModal; if ($('#rmAdd2', pc)) $('#rmAdd2', pc).onclick = reminderModal;
    $('#rmTg', pc).onclick = function () { window.st.openExternal(BOT + (RM.tg ? '' : '?start=link')); };
    if ($('#rmChk', pc)) $('#rmChk', pc).onclick = function () { var b = this; b.disabled = true; rmReload().then(function (d) { if (d && d.success && !RM.tg) toast('Not linked yet — finish the steps in the Telegram bot first', 'warn'); else if (d && d.success) toast('Telegram connected!', 'ok'); }); };
    $('#rmSw', pc).onclick = function () {
      RM.alerts = !RM.alerts; lsSet('stRemAlerts', RM.alerts ? '1' : '0');
      this.classList.toggle('on', RM.alerts); this.setAttribute('aria-checked', RM.alerts);
      toast(RM.alerts ? 'Desktop alerts on' : 'Desktop alerts off');
    };
    $('#rmTest', pc).onclick = function () { notify('📚 StudyTrack', 'Desktop alerts are working!'); beep(); toast('Test alert sent'); };
    onOff(pc, '[data-tg]', function (b) {
      b.disabled = true;
      api('rm_toggle', { id: +b.dataset.tg }).then(function (d) { if (d && d.success) rmReload(); else { b.disabled = false; toast((d && d.message) || 'Could not update', 'warn'); } });
    });
    onOff(pc, '[data-del]', function (b) {
      var id = +b.dataset.del, r = RM.list.filter(function (x) { return x.id === id; })[0];
      confirmModal('Delete reminder?', 'Remove <b>' + esc(r.title) + '</b>?', 'Delete', 'rm_delete', { id: id }, rmReload);
    });
  }
  function reminderModal() {
    formModal({
      title: '🔔 New reminder', ok: 'Save reminder', done: 'Reminder created!',
      body: '<label>Title *</label><input id="rmT" data-focus maxlength="200" placeholder="e.g. Morning study session">' +
        '<label>Message <span class="sx-opt">(optional)</span></label><input id="rmM" maxlength="500" placeholder="e.g. Time to study Physics!">' +
        '<label>Time *</label><input id="rmTime" type="time" value="08:00">' +
        '<label>Days *</label><div class="rm-dpick" id="rmDp">' + RD.map(function (d) { return '<button type="button" data-d="' + d + '">' + d + '</button>'; }).join('') + '</div>' +
        '<div class="px-quick"><button type="button" data-q="all">Every day</button><button type="button" data-q="wk">Weekdays</button><button type="button" data-q="we">Weekend</button><button type="button" data-q="none" class="dng">Clear</button></div>',
      mount: function (ov) {
        var btns = ov.querySelectorAll('#rmDp button');
        btns.forEach(function (b) { b.onclick = function () { b.classList.toggle('on'); }; });
        ov.querySelectorAll('[data-q]').forEach(function (q) {
          q.onclick = function () {
            var set = { all: RD, wk: RD.slice(0, 5), we: RD.slice(5), none: [] }[q.dataset.q];
            btns.forEach(function (b) { b.classList.toggle('on', set.indexOf(b.dataset.d) !== -1); });
          };
        });
      },
      collect: function (ov) {
        var title = ov.querySelector('#rmT').value.trim(), time = ov.querySelector('#rmTime').value;
        var days = Array.prototype.map.call(ov.querySelectorAll('#rmDp button.on'), function (b) { return b.dataset.d; });
        if (!title || !time || !days.length) return { error: 'Please fill in the title, time and at least one day.' };
        return { action: 'rm_add', payload: { title: title, message: ov.querySelector('#rmM').value.trim(), reminder_time: time, days: days } };
      },
      after: function () { rmReload(); }
    });
  }

  /* desktop alerts while the app is open (setTimeout chain: not tied to any page) */
  function rmCheck() {
    var now = new Date(), nm = now.getHours() * 60 + now.getMinutes(), day = RD[(now.getDay() + 6) % 7], ymd = now.getFullYear() + '-' + pad(now.getMonth() + 1) + '-' + pad(now.getDate());
    if (RM.alerts) RM.list.forEach(function (r) {
      if (!r.active || r.days.indexOf(day) === -1) return;
      var diff = nm - toMin(r.time), key = r.id + '|' + ymd + '|' + r.time;
      if (diff >= 0 && diff <= 1 && !RM.fired[key]) {
        RM.fired[key] = 1; notify('📚 ' + r.title, r.message || 'Time to study!'); beep(); toast('🔔 ' + r.title);
      }
    });
  }
  function rmBoot() {
    if (!document.getElementById('pageContent')) { setTimeout(rmBoot, 2500); return; }   /* wait until signed in */
    if (RM.started) return; RM.started = true;
    var n = 0;
    (function loop() {
      n++;
      var p = (n === 1 || n % 15 === 0) && !here('reminders') ? rmReload(true) : Promise.resolve({ success: true });
      Promise.resolve(p).then(function (d) {
        if (d && d.auth === false) { RM.started = false; return; }
        rmCheck(); RM.tick = setTimeout(loop, 20000);
      });
    })();
  }
  setTimeout(rmBoot, 3000);
})();
