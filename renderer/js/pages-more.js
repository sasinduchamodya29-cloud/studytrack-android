/* StudyTrack Desktop - Marks & Results, Class Log, Tasks, Habit Tracker pages.
 * Native app pages (same look as Focus Timer / Subjects). Data: pages2.php (actions mk_*, ch_*, tk_*, hb_*).
 * Needs js/pages-extra.js (window.StUI helpers) to be loaded first. */
(function () {
  var Pages = window.stPages, TITLES = window.stTitles, api = window.stApi, UI = window.StUI;
  if (!Pages || !api || !UI) return;
  var toast = UI.toast, modal = UI.modal, errPage = UI.errPage, fmtMin = UI.fmtMin, $ = UI.$, lsGet = UI.lsGet, lsSet = UI.lsSet;
  TITLES.marks = 'Marks & Results'; TITLES['class-hours'] = 'Class Log'; TITLES.tasks = 'Tasks'; TITLES['habit-tracker'] = 'Habit Tracker';

  var UPGRADE = 'https://edurx.icu/studytrack/upgrade.php';
  var PALETTE = ['#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f97316', '#f59e0b', '#10b981', '#14b8a6', '#06b6d4', '#3b82f6'];
  var TRASH = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>';

  /* ── helpers ─────────────────────────────────────────────────────────── */
  function esc(s) { return E(String(s == null ? '' : s)); }
  function addDays(s, n) { var t = new Date(s + 'T00:00:00Z'); t.setUTCDate(t.getUTCDate() + n); return t.toISOString().slice(0, 10); }
  function fmtDate(s) { return new Date(s + 'T00:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }); }
  function fmtShort(s) { return new Date(s + 'T00:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }); }
  function fmtDay(s, today) {
    if (s === today) return 'Today'; if (s === addDays(today, -1)) return 'Yesterday';
    return new Date(s + 'T00:00:00Z').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', timeZone: 'UTC' });
  }
  function subOptions(list, sel, ph) {
    return (ph ? '<option value="0">' + ph + '</option>' : '') + list.map(function (s) { return '<option value="' + s.id + '"' + (s.id === sel ? ' selected' : '') + '>' + esc(s.name) + '</option>'; }).join('');
  }
  function here(route) { return location.hash.indexOf('#/' + route) === 0; }
  function pcEl() { return document.getElementById('pageContent'); }
  function openUpgrade() { window.st.openExternal(UPGRADE); }
  function plural(n, w) { return n + ' ' + w + (n === 1 ? '' : 's'); }

  /* generic form modal: o = {title, body, ok, danger, mount(ov), collect(ov)->{error}|{action,payload}, after(d)} */
  function formModal(o) {
    return modal('<div class="px-h"><h3>' + o.title + '</h3><button data-close class="px-x">✕</button></div><div class="px-err" id="pxErr"></div>' + o.body +
      '<div class="px-btns"><button data-close class="px-sec">Cancel</button><button id="pxOk" class="px-pri' + (o.danger ? ' dng' : '') + '">' + o.ok + '</button></div>',
      function (ov, close) {
        if (o.mount) o.mount(ov);
        var err = ov.querySelector('#pxErr'), ok = ov.querySelector('#pxOk');
        function submit() {
          err.style.display = 'none';
          var r = o.collect ? o.collect(ov) : { action: o.action, payload: o.payload };
          if (r.error) { err.textContent = r.error; err.style.display = 'block'; return; }
          ok.disabled = true; ok.textContent = 'Saving…';
          api(r.action, r.payload).then(function (d) {
            if (d && d.success) { close(); toast(d.message || o.done || 'Done', 'ok'); if (o.after) o.after(d); }
            else {
              ok.disabled = false; ok.textContent = o.ok;
              if (d && d.limit_reached) { close(); toast(d.message, 'warn'); return; }
              err.textContent = (d && d.message) || 'Something went wrong.'; err.style.display = 'block';
            }
          });
        }
        ok.onclick = submit;
        ov.addEventListener('keydown', function (e) { if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA' && e.target.tagName !== 'SELECT') { e.preventDefault(); submit(); } });
        var f = ov.querySelector('[data-focus]'); if (f) setTimeout(function () { f.focus(); }, 60);
      });
  }
  function confirmModal(title, text, okText, action, payload, after) {
    formModal({ title: title, body: '<p class="px-p">' + text + '</p>', ok: okText, danger: true, action: action, payload: payload, done: 'Deleted', after: after });
  }
  /* segmented buttons: <div class="px-seg" id=ID><button data-v=..>..</button></div> */
  function bindSeg(ov, id, init) {
    var box = ov.querySelector('#' + id), cur = init;
    function mark() { box.querySelectorAll('button').forEach(function (b) { b.classList.toggle('on', b.dataset.v === cur); }); }
    box.querySelectorAll('button').forEach(function (b) { b.onclick = function () { cur = b.dataset.v; mark(); }; });
    mark();
    return { get: function () { return cur; } };
  }
  function limitPill(lim, id) {
    if (!lim || lim.is_pro || !lim.limit) return '';
    return '<span class="mp-lim' + (lim.allowed ? '' : ' full') + '">' + lim.used + '/' + lim.limit + ' free</span>';
  }
  function emptyBlock(ico, h, p, btn) {
    return '<div class="mp-empty"><div>' + ico + '</div><h2>' + h + '</h2><p>' + p + '</p>' + (btn || '') + '</div>';
  }

  /* ════════════════════════════════════════════════════════════════════
     MARKS & RESULTS
     ════════════════════════════════════════════════════════════════════ */
  var MK = { marks: [], subjects: [], sub: 0, chart: null };
  function pctOf(m) { return m.total_marks > 0 ? (m.marks_obtained / m.total_marks) * 100 : 0; }
  function grade(p) { return p >= 75 ? 'A' : p >= 65 ? 'B' : p >= 55 ? 'C' : p >= 40 ? 'S' : 'F'; }
  function gcls(p) { return p >= 75 ? 'a' : p >= 55 ? 'b' : 'c'; }
  function r1(n) { return Math.round(n * 10) / 10; }

  Pages.marks = function (pc) {
    return api('mk_list').then(function (d) {
      if (!d || !d.success) return errPage(pc, d);
      MK.marks = d.marks; MK.subjects = d.subjects; drawMarks(pc);
    });
  };
  function mkReload() {
    return api('mk_list').then(function (d) { if (d && d.success) { MK.marks = d.marks; MK.subjects = d.subjects; if (here('marks') && pcEl()) drawMarks(pcEl()); } });
  }
  function drawMarks(pc) {
    if (MK.chart) { try { MK.chart.destroy(); } catch (e) {} MK.chart = null; }
    if (MK.sub && !MK.subjects.some(function (s) { return s.id === MK.sub; })) MK.sub = 0;
    var rows = MK.marks.filter(function (m) { return !MK.sub || m.subject_id === MK.sub; });
    var avg = 0, best = 0;
    if (rows.length) { var ps = rows.map(pctOf); avg = r1(ps.reduce(function (a, b) { return a + b; }, 0) / ps.length); best = r1(Math.max.apply(null, ps)); }
    var head = '<div class="mp-head"><p>' + plural(rows.length, 'result') + (MK.sub ? ' in this subject' : '') + '</p><div class="mp-head-r">' +
      (MK.subjects.length ? '<select class="mp-sel" id="mkSub"><option value="0">All subjects</option>' + subOptions(MK.subjects, MK.sub) + '</select>' : '') +
      '<button class="mp-add" id="mkAdd">＋ Add result</button></div></div>';
    var body;
    if (!MK.marks.length) body = emptyBlock('📝', 'No results yet', 'Record your first exam score to see your average, best score and progress.', '<button class="mp-add" id="mkAdd2">＋ Add result</button>');
    else if (!rows.length) body = emptyBlock('🔎', 'No results for this subject', 'Pick another subject or add a result.');
    else {
      var tiles = '<div class="mp-tiles">' +
        tile('📝', 'Total exams', rows.length, '#6366f1') + tile('📊', 'Average score', avg + '%', '#10b981') + tile('🏆', 'Best score', best + '%', '#f59e0b') + '</div>';
      var chartCard = (window.Chart && rows.length >= 2) ? '<div class="mp-card"><div class="mp-card-t">Score trend</div><div class="mk-chart"><canvas id="mkChart"></canvas></div></div>' : '';
      var tr = rows.map(function (m) {
        var p = r1(pctOf(m));
        return '<tr data-id="' + m.id + '"><td class="mk-date">' + fmtDate(m.exam_date) + '</td><td class="mk-exam"><b>' + esc(m.exam_name) + '</b>' + (m.notes ? '<span title="' + esc(m.notes) + '">' + esc(m.notes) + '</span>' : '') + '</td>' +
          '<td><span class="mp-dot" style="background:' + esc(m.color) + '"></span>' + esc(m.subject_name) + '</td><td class="mk-marks">' + m.marks_obtained + '<i>/' + m.total_marks + '</i></td>' +
          '<td><span class="mk-grade g-' + gcls(p) + '">' + grade(p) + ' · ' + p + '%</span></td><td class="mk-act"><button class="mp-ib dng" data-del="' + m.id + '" title="Delete">' + TRASH + '</button></td></tr>';
      }).join('');
      body = tiles + chartCard + '<div class="mp-card mk-tablecard"><table class="mk-table"><thead><tr><th>Date</th><th>Exam</th><th>Subject</th><th>Marks</th><th>Grade</th><th></th></tr></thead><tbody>' + tr + '</tbody></table></div>';
    }
    pc.innerHTML = '<div class="mp mk">' + head + body + '</div>';
    var sel = $('#mkSub', pc); if (sel) sel.onchange = function () { MK.sub = +sel.value; drawMarks(pc); };
    var add = function () { markModal(); };
    $('#mkAdd', pc).onclick = add; if ($('#mkAdd2', pc)) $('#mkAdd2', pc).onclick = add;
    pc.querySelectorAll('[data-del]').forEach(function (b) {
      b.onclick = function () {
        var id = +b.dataset.del, m = MK.marks.filter(function (x) { return x.id === id; })[0];
        confirmModal('Delete result?', 'Remove <b>' + esc(m.exam_name) + '</b> (' + esc(m.subject_name) + ', ' + r1(pctOf(m)) + '%)?', 'Delete', 'mk_delete', { id: id }, mkReload);
      };
    });
    if (window.Chart && rows.length >= 2 && $('#mkChart', pc)) drawMarkChart(rows);
  }
  function tile(ico, label, val, c) { return '<div class="mp-tile" style="--c:' + c + '"><div class="mp-tile-i">' + ico + '</div><div><b>' + val + '</b><span>' + label + '</span></div></div>'; }
  function cssVar(n, d) { var v = getComputedStyle(document.documentElement).getPropertyValue(n).trim(); return v || d; }
  function drawMarkChart(rows) {
    var data = rows.slice().sort(function (a, b) { return a.exam_date < b.exam_date ? -1 : (a.exam_date > b.exam_date ? 1 : a.id - b.id); }).slice(-24);
    var accent = cssVar('--accent', '#6366f1'), muted = cssVar('--text-muted', '#8b8ba0'), grid = 'rgba(127,127,160,.14)';
    MK.chart = new Chart($('#mkChart'), {
      type: 'line',
      data: { labels: data.map(function (m) { return fmtShort(m.exam_date); }), datasets: [{ data: data.map(function (m) { return r1(pctOf(m)); }), borderColor: accent, backgroundColor: accent, tension: .35, borderWidth: 2.5, pointRadius: 4, pointHoverRadius: 6, fill: false }] },
      options: {
        maintainAspectRatio: false, animation: { duration: 500 },
        plugins: { legend: { display: false }, tooltip: { callbacks: { title: function (it) { var m = data[it[0].dataIndex]; return m.exam_name; }, label: function (it) { var m = data[it.dataIndex]; return m.subject_name + ' · ' + m.marks_obtained + '/' + m.total_marks + ' (' + it.parsed.y + '%)'; } } } },
        scales: { y: { min: 0, max: 100, ticks: { color: muted, callback: function (v) { return v + '%'; } }, grid: { color: grid } }, x: { ticks: { color: muted, maxRotation: 0, autoSkip: true }, grid: { display: false } } }
      }
    });
  }
  function markModal() {
    if (!MK.subjects.length) { toast('Add a subject first (Subjects page)', 'warn'); return; }
    var today = (new Date()).toLocaleDateString('en-CA');
    formModal({
      title: 'Add result', ok: 'Add result',
      body: '<label>Subject</label><select id="pxSub" class="px-sel">' + subOptions(MK.subjects, MK.sub || MK.subjects[0].id) + '</select>' +
        '<label>Exam name</label><input id="pxExam" class="selectable" maxlength="150" placeholder="e.g. Term test 2" data-focus>' +
        '<div class="px-two"><div><label>Marks obtained</label><input id="pxGot" type="number" class="selectable" min="0" step="0.01"></div>' +
        '<div><label>Total marks</label><input id="pxTot" type="number" class="selectable" min="1" step="0.01" value="100"></div></div>' +
        '<label>Exam date</label><input id="pxDate" type="date" class="selectable" value="' + today + '">' +
        '<label>Notes (optional)</label><textarea id="pxNotes" class="selectable px-ta" rows="2" maxlength="500"></textarea>',
      collect: function (ov) {
        var g = function (i) { return ov.querySelector('#' + i).value; };
        if (!g('pxExam').trim()) return { error: 'Please enter the exam name.' };
        var got = parseFloat(g('pxGot')), tot = parseFloat(g('pxTot'));
        if (isNaN(got) || got < 0 || isNaN(tot) || tot <= 0) return { error: 'Please enter valid marks.' };
        if (got > tot) return { error: 'Marks obtained cannot exceed total marks.' };
        if (!g('pxDate')) return { error: 'Please select the exam date.' };
        return { action: 'mk_add', payload: { subject_id: g('pxSub'), exam_name: g('pxExam'), marks_obtained: got, total_marks: tot, exam_date: g('pxDate'), notes: g('pxNotes') } };
      },
      after: mkReload
    });
  }

  /* ════════════════════════════════════════════════════════════════════
     CLASS LOG
     ════════════════════════════════════════════════════════════════════ */
  var CH = { classes: [], slots: [], subjects: [], period: lsGet('stChPeriod', 'month'), sub: 0, today: '', todayName: '' };
  var DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  var TYPES = { regular: 'Regular', revision: 'Revision', practical: 'Practical', tutorial: 'Tutorial', online: 'Online' };
  var PERIODS = [['today', 'Today'], ['week', '7 days'], ['month', '30 days'], ['all', 'All time']];

  function chLoad() {
    return api('ch_list', { period: CH.period }).then(function (d) {
      if (!d || !d.success) return d;
      CH.classes = d.classes; CH.slots = d.slots; CH.subjects = d.subjects; CH.today = d.today; CH.todayName = d.today_name; return d;
    });
  }
  Pages['class-hours'] = function (pc) { return chLoad().then(function (d) { if (!d || !d.success) return errPage(pc, d); drawClasses(pc); }); };
  function chReload() { return chLoad().then(function (d) { if (d && d.success && here('class-hours') && pcEl()) drawClasses(pcEl()); }); }

  function drawClasses(pc) {
    if (CH.sub && !CH.subjects.some(function (s) { return s.id === CH.sub; })) CH.sub = 0;
    var rows = CH.classes.filter(function (c) { return !CH.sub || c.subject_id === CH.sub; });
    var total = rows.length, att = rows.filter(function (c) { return c.attended; }), missed = total - att.length;
    var attMins = att.reduce(function (a, c) { return a + c.duration_minutes; }, 0), rate = total ? Math.round(att.length / total * 100) : 0;
    var head = '<div class="mp-head"><div class="mp-tabs" id="chTabs">' + PERIODS.map(function (p) { return '<button data-p="' + p[0] + '"' + (p[0] === CH.period ? ' class="on"' : '') + '>' + p[1] + '</button>'; }).join('') + '</div>' +
      '<div class="mp-head-r">' + (CH.subjects.length ? '<select class="mp-sel" id="chSub"><option value="0">All subjects</option>' + subOptions(CH.subjects, CH.sub) + '</select>' : '') +
      '<button class="mp-add" id="chAdd">＋ Log class</button></div></div>';
    var tiles = '<div class="mp-tiles four">' + tile('🏫', 'Classes', total, '#6366f1') + tile('⏱️', 'Hours attended', fmtMin(attMins), '#06b6d4') +
      tile('✅', 'Attendance', rate + '%', rate >= 80 ? '#10b981' : (rate >= 60 ? '#f59e0b' : '#ef4444')) + tile('❌', 'Missed', missed, '#ef4444') + '</div>';

    var list;
    if (!rows.length) list = emptyBlock('🏫', 'No classes logged', 'Log the classes you attend (or miss) to track your attendance.', '<button class="mp-add" id="chAdd2">＋ Log class</button>');
    else {
      var groups = [], idx = {};
      rows.forEach(function (c) { if (!(c.class_date in idx)) { idx[c.class_date] = groups.length; groups.push({ date: c.class_date, items: [] }); } groups[idx[c.class_date]].items.push(c); });
      list = groups.map(function (g) {
        return '<div class="ch-day"><div class="ch-day-h">' + fmtDay(g.date, CH.today) + '<span>' + plural(g.items.length, 'class') + '</span></div>' + g.items.map(classCard).join('') + '</div>';
      }).join('');
    }

    /* subject summary (follows the period + subject filter) */
    var bySub = {};
    rows.forEach(function (c) { var b = bySub[c.subject_id] || (bySub[c.subject_id] = { name: c.subject_name, color: c.subject_color, n: 0, a: 0, mins: 0 }); b.n++; if (c.attended) { b.a++; b.mins += c.duration_minutes; } });
    var subs = Object.keys(bySub).map(function (k) { return bySub[k]; }).sort(function (a, b) { return b.mins - a.mins; });
    var subCard = '<div class="mp-card"><div class="mp-card-t">By subject</div>' + (subs.length ? subs.map(function (s) {
      var r = Math.round(s.a / s.n * 100);
      return '<div class="ch-sub" style="--c:' + esc(s.color) + '"><div class="ch-sub-l"><span><i class="mp-dot" style="background:' + esc(s.color) + '"></i>' + esc(s.name) + '</span><em>' + s.a + '/' + s.n + ' · ' + fmtMin(s.mins) + '</em></div><div class="mp-bar"><i style="width:' + r + '%"></i></div></div>';
    }).join('') : '<p class="mp-note">Nothing to show yet.</p>') + '</div>';

    /* weekly schedule */
    var sched = '<div class="mp-card"><div class="mp-card-t">Weekly schedule<button class="mp-mini" id="chSlotAdd">＋ Add</button></div>' +
      (CH.slots.length ? DAYS.map(function (day) {
        var sl = CH.slots.filter(function (s) { return s.day_of_week === day; });
        if (!sl.length) return '';
        return '<div class="ch-sd' + (day === CH.todayName ? ' today' : '') + '"><b>' + day.slice(0, 3) + '</b><div>' + sl.map(function (s) {
          var c = s.color || s.subject_color || '#38bdf8';
          return '<span class="ch-slot" style="--c:' + esc(c) + '"><i></i>' + s.start_time + '–' + s.end_time + ' ' + esc(s.label || s.subject_name || 'Class') + '<button data-slotdel="' + s.id + '" title="Remove">✕</button></span>';
        }).join('') + '</div></div>';
      }).join('') : '<p class="mp-note">No weekly classes yet. Add your timetable so the app knows when classes happen.</p>') + '</div>';

    pc.innerHTML = '<div class="mp ch">' + head + tiles + '<div class="ch-cols"><section class="ch-main">' + list + '</section><aside class="ch-side">' + subCard + sched + '</aside></div></div>';

    pc.querySelectorAll('#chTabs button').forEach(function (b) { b.onclick = function () { CH.period = b.dataset.p; lsSet('stChPeriod', CH.period); chReload(); }; });
    var sel = $('#chSub', pc); if (sel) sel.onchange = function () { CH.sub = +sel.value; drawClasses(pc); };
    var add = function () { classModal(); };
    $('#chAdd', pc).onclick = add; if ($('#chAdd2', pc)) $('#chAdd2', pc).onclick = add;
    $('#chSlotAdd', pc).onclick = slotModal;
    pc.querySelectorAll('[data-toggle]').forEach(function (b) { b.onclick = function () { b.disabled = true; api('ch_toggle', { id: +b.dataset.toggle }).then(function (d) { if (d && d.success) chReload(); else { b.disabled = false; toast((d && d.message) || 'Could not update', 'warn'); } }); }; });
    pc.querySelectorAll('[data-del]').forEach(function (b) {
      b.onclick = function () {
        var id = +b.dataset.del, c = CH.classes.filter(function (x) { return x.id === id; })[0];
        confirmModal('Delete class?', 'Remove the <b>' + esc(c.subject_name) + '</b> class on ' + fmtDate(c.class_date) + ' (' + c.start_time + '–' + c.end_time + ')?', 'Delete', 'ch_delete', { id: id }, chReload);
      };
    });
    pc.querySelectorAll('[data-slotdel]').forEach(function (b) { b.onclick = function () { api('ch_slot_delete', { id: +b.dataset.slotdel }).then(function (d) { if (d && d.success) { toast('Removed from schedule'); chReload(); } }); }; });
  }
  function classCard(c) {
    return '<article class="ch-card' + (c.attended ? '' : ' missed') + '" style="--c:' + esc(c.subject_color) + '"><div class="ch-bar"></div>' +
      '<div class="ch-info"><b>' + esc(c.subject_name) + '</b><span>' + c.start_time + ' – ' + c.end_time + ' · ' + fmtMin(c.duration_minutes) + '</span>' +
      (c.notes ? '<em title="' + esc(c.notes) + '">' + esc(c.notes) + '</em>' : '') + '</div>' +
      '<span class="ch-type">' + esc(TYPES[c.class_type] || c.class_type) + '</span>' +
      '<button class="ch-att ' + (c.attended ? 'yes' : 'no') + '" data-toggle="' + c.id + '" title="Click to change">' + (c.attended ? '✓ Attended' : '✕ Missed') + '</button>' +
      '<button class="mp-ib dng" data-del="' + c.id + '" title="Delete">' + TRASH + '</button></article>';
  }
  function classModal() {
    if (!CH.subjects.length) { toast('Add a subject first (Subjects page)', 'warn'); return; }
    var now = new Date(), hh = function (d) { return ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2); };
    var end = hh(now), start = hh(new Date(now.getTime() - 60 * 60000));
    if (start > end) start = '00:00';
    var seg;
    formModal({
      title: 'Log class', ok: 'Log class',
      body: '<label>Subject</label><select id="pxSub" class="px-sel">' + subOptions(CH.subjects, CH.sub || CH.subjects[0].id) + '</select>' +
        '<div class="px-two"><div><label>Date</label><input id="pxDate" type="date" class="selectable" value="' + (CH.today || now.toLocaleDateString('en-CA')) + '"></div>' +
        '<div><label>Type</label><select id="pxType" class="px-sel">' + Object.keys(TYPES).map(function (k) { return '<option value="' + k + '">' + TYPES[k] + '</option>'; }).join('') + '</select></div></div>' +
        '<div class="px-two"><div><label>Start time</label><input id="pxStart" type="time" class="selectable" value="' + start + '"></div><div><label>End time</label><input id="pxEnd" type="time" class="selectable" value="' + end + '"></div></div>' +
        '<label>Attendance</label><div class="px-seg" id="pxAtt"><button data-v="1">✓ Attended</button><button data-v="0">✕ Missed</button></div>' +
        '<label>Notes (optional)</label><textarea id="pxNotes" class="selectable px-ta" rows="2" maxlength="500"></textarea>',
      mount: function (ov) { seg = bindSeg(ov, 'pxAtt', '1'); },
      collect: function (ov) {
        var g = function (i) { return ov.querySelector('#' + i).value; };
        if (!g('pxDate') || !g('pxStart') || !g('pxEnd')) return { error: 'Please fill in all required fields.' };
        if (g('pxEnd') <= g('pxStart')) return { error: 'End time must be after start time.' };
        return { action: 'ch_add', payload: { subject_id: g('pxSub'), class_date: g('pxDate'), start_time: g('pxStart'), end_time: g('pxEnd'), class_type: g('pxType'), attended: seg.get() === '1' ? 1 : 0, notes: g('pxNotes') } };
      },
      after: chReload
    });
  }
  function slotModal() {
    var color = '#38bdf8';
    formModal({
      title: 'Add weekly class', ok: 'Add to schedule',
      body: '<div class="px-two"><div><label>Day</label><select id="pxDay" class="px-sel">' + DAYS.map(function (d) { return '<option' + (d === CH.todayName ? ' selected' : '') + '>' + d + '</option>'; }).join('') + '</select></div>' +
        '<div><label>Subject</label><select id="pxSub" class="px-sel">' + subOptions(CH.subjects, 0, 'No subject') + '</select></div></div>' +
        '<div class="px-two"><div><label>Start time</label><input id="pxStart" type="time" class="selectable" value="08:00"></div><div><label>End time</label><input id="pxEnd" type="time" class="selectable" value="09:00"></div></div>' +
        '<label>Label (optional)</label><input id="pxLabel" class="selectable" maxlength="60" placeholder="e.g. Physics tuition" data-focus>' +
        '<label>Colour</label><div class="px-sw" id="pxSw">' + PALETTE.map(function (c) { return '<button data-c="' + c + '" style="--c:' + c + '"></button>'; }).join('') + '</div>',
      mount: function (ov) {
        function mark() { ov.querySelectorAll('#pxSw button').forEach(function (b) { b.classList.toggle('on', b.dataset.c === color); }); }
        ov.querySelectorAll('#pxSw button').forEach(function (b) { b.onclick = function () { color = b.dataset.c; mark(); }; });
        var sub = ov.querySelector('#pxSub');
        sub.onchange = function () { var s = CH.subjects.filter(function (x) { return x.id === +sub.value; })[0]; if (s && /^#[0-9a-fA-F]{6}$/.test(s.color)) { color = s.color; mark(); } };
        mark();
      },
      collect: function (ov) {
        var g = function (i) { return ov.querySelector('#' + i).value; };
        if (!g('pxStart') || !g('pxEnd')) return { error: 'Please set start and end time.' };
        if (g('pxEnd') <= g('pxStart')) return { error: 'End time must be after start time.' };
        return { action: 'ch_slot_add', payload: { day: g('pxDay'), subject_id: g('pxSub'), start_time: g('pxStart'), end_time: g('pxEnd'), label: g('pxLabel'), color: color } };
      },
      after: chReload
    });
  }

  /* ════════════════════════════════════════════════════════════════════
     TASKS
     ════════════════════════════════════════════════════════════════════ */
  var TK = { tasks: [], subjects: [], limit: null, today: '', tab: lsGet('stTkTab', 'active') };
  var TABS = [['active', 'Active'], ['pending', 'Pending'], ['in_progress', 'In progress'], ['completed', 'Completed'], ['all', 'All']];
  var PRI = { high: 'High', medium: 'Medium', low: 'Low' };

  function tkLoad() {
    return api('tk_list').then(function (d) { if (d && d.success) { TK.tasks = d.tasks; TK.subjects = d.subjects; TK.limit = d.limit; TK.today = d.today; } return d; });
  }
  Pages.tasks = function (pc) { return tkLoad().then(function (d) { if (!d || !d.success) return errPage(pc, d); drawTasks(pc); }); };
  function tkReload() { return tkLoad().then(function (d) { if (d && d.success && here('tasks') && pcEl()) drawTasks(pcEl()); }); }
  function tkCount(t) {
    if (t === 'active') return TK.tasks.filter(function (x) { return x.status !== 'completed'; }).length;
    if (t === 'all') return TK.tasks.length;
    return TK.tasks.filter(function (x) { return x.status === t; }).length;
  }
  function drawTasks(pc) {
    var lim = TK.limit || {}, can = lim.allowed !== false;
    var shown = TK.tasks.filter(function (x) { return TK.tab === 'all' ? true : (TK.tab === 'active' ? x.status !== 'completed' : x.status === TK.tab); });
    var head = '<div class="mp-head"><div class="mp-tabs" id="tkTabs">' + TABS.map(function (t) { return '<button data-t="' + t[0] + '"' + (t[0] === TK.tab ? ' class="on"' : '') + '>' + t[1] + '<em>' + tkCount(t[0]) + '</em></button>'; }).join('') + '</div>' +
      '<div class="mp-head-r">' + limitPill(lim) + '<button class="mp-add" id="tkAdd">' + (can ? '＋ Add task' : '⚡ Upgrade for more') + '</button></div></div>';
    var body;
    if (!TK.tasks.length) body = emptyBlock('✅', 'No tasks yet', 'Add homework, assignments or anything you need to get done.', '<button class="mp-add" id="tkAdd2">＋ Add task</button>');
    else if (!shown.length) body = emptyBlock(TK.tab === 'completed' ? '🎯' : '🎉', TK.tab === 'completed' ? 'Nothing completed yet' : 'Nothing here', TK.tab === 'completed' ? 'Finished tasks will appear here.' : 'No tasks in this view.');
    else body = '<div class="tk-list">' + shown.map(taskCard).join('') + '</div>';
    pc.innerHTML = '<div class="mp tk">' + head + (!lim.is_pro && lim.limit && !can ? '<div class="mp-banner">You have used all <b>' + lim.limit + '</b> active tasks on the free plan. Complete or delete a task, or upgrade for unlimited tasks.</div>' : '') + body + '</div>';

    pc.querySelectorAll('#tkTabs button').forEach(function (b) { b.onclick = function () { TK.tab = b.dataset.t; lsSet('stTkTab', TK.tab); drawTasks(pc); }; });
    var add = function () { if (!can) { openUpgrade(); return; } taskModal(); };
    $('#tkAdd', pc).onclick = add; if ($('#tkAdd2', pc)) $('#tkAdd2', pc).onclick = add;
    function setStatus(id, status, el) {
      if (el) el.disabled = true;
      api('tk_status', { id: id, status: status }).then(function (d) {
        if (d && d.success) { if (status === 'completed') toast('Task completed 🎉', 'ok'); tkReload(); } else { if (el) el.disabled = false; toast((d && d.message) || 'Could not update', 'warn'); }
      });
    }
    pc.querySelectorAll('.tk-card').forEach(function (c) {
      var id = +c.dataset.id, t = TK.tasks.filter(function (x) { return x.id === id; })[0];
      c.querySelector('.tk-check').onclick = function () { setStatus(id, t.status === 'completed' ? 'pending' : 'completed', this); };
      c.querySelector('.tk-status').onchange = function () { setStatus(id, this.value, this); };
      c.querySelector('[data-del]').onclick = function () { confirmModal('Delete task?', 'Remove <b>' + esc(t.title) + '</b>?', 'Delete', 'tk_delete', { id: id }, tkReload); };
    });
  }
  function taskCard(t) {
    var done = t.status === 'completed', overdue = t.due_date && t.due_date < TK.today && !done;
    return '<article class="tk-card pri-' + t.priority + (done ? ' done' : '') + (overdue ? ' overdue' : '') + '" data-id="' + t.id + '">' +
      '<button class="tk-check' + (done ? ' on' : '') + (t.status === 'in_progress' ? ' prog' : '') + '" title="' + (done ? 'Mark as pending' : 'Mark as completed') + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="5 12.5 10 17.5 19 7"/></svg></button>' +
      '<div class="tk-body"><div class="tk-title">' + esc(t.title) + '</div>' +
      '<div class="tk-meta">' + (t.subject_name ? '<span><i class="mp-dot" style="background:' + esc(t.color) + '"></i>' + esc(t.subject_name) + '</span>' : '') +
      (t.due_date ? '<span class="' + (overdue ? 'od' : '') + '">📅 ' + fmtDate(t.due_date) + (overdue ? ' · Overdue' : '') + '</span>' : '') +
      '<span class="tk-pri p-' + t.priority + '">' + PRI[t.priority] + '</span></div>' +
      (t.description ? '<div class="tk-desc">' + esc(t.description) + '</div>' : '') + '</div>' +
      '<select class="tk-status px-sel" title="Status"><option value="pending"' + (t.status === 'pending' ? ' selected' : '') + '>Pending</option><option value="in_progress"' + (t.status === 'in_progress' ? ' selected' : '') + '>In progress</option><option value="completed"' + (done ? ' selected' : '') + '>Completed</option></select>' +
      '<button class="mp-ib dng" data-del title="Delete">' + TRASH + '</button></article>';
  }
  function taskModal() {
    var seg;
    formModal({
      title: 'Add task', ok: 'Add task',
      body: '<label>Title</label><input id="pxTitle" class="selectable" maxlength="255" placeholder="e.g. Finish chemistry worksheet" data-focus>' +
        '<label>Description (optional)</label><textarea id="pxDesc" class="selectable px-ta" rows="2" maxlength="1000"></textarea>' +
        '<div class="px-two"><div><label>Subject</label><select id="pxSub" class="px-sel">' + subOptions(TK.subjects, 0, 'No subject') + '</select></div><div><label>Due date</label><input id="pxDue" type="date" class="selectable"></div></div>' +
        '<label>Priority</label><div class="px-seg" id="pxPri"><button data-v="low">Low</button><button data-v="medium">Medium</button><button data-v="high">High</button></div>',
      mount: function (ov) { seg = bindSeg(ov, 'pxPri', 'medium'); },
      collect: function (ov) {
        var g = function (i) { return ov.querySelector('#' + i).value; };
        if (!g('pxTitle').trim()) return { error: 'Task title is required.' };
        return { action: 'tk_add', payload: { title: g('pxTitle'), description: g('pxDesc'), subject_id: g('pxSub'), due_date: g('pxDue'), priority: seg.get() } };
      },
      after: tkReload
    });
  }

  /* ════════════════════════════════════════════════════════════════════
     HABIT TRACKER
     ════════════════════════════════════════════════════════════════════ */
  var HB = { habits: [], week: [], today: '', limit: null };
  var ICONS = ['✅', '📖', '💧', '🏃', '🧘', '😴', '✍️', '🎧', '🥗', '📵'];
  var LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  function hbLoad() {
    return api('hb_list').then(function (d) { if (d && d.success) { HB.habits = d.habits; HB.week = d.week; HB.today = d.today; HB.limit = d.limit; } return d; });
  }
  Pages['habit-tracker'] = function (pc) { return hbLoad().then(function (d) { if (!d || !d.success) return errPage(pc, d); drawHabits(pc); }); };
  function hbReload() { return hbLoad().then(function (d) { if (d && d.success && here('habit-tracker') && pcEl()) drawHabits(pcEl()); }); }
  function isDone(h, d) { return h.dates.indexOf(d) !== -1; }

  function drawHabits(pc) {
    var lim = HB.limit || {}, can = lim.allowed !== false, hs = HB.habits, n = hs.length;
    var elapsed = HB.week.filter(function (d) { return d <= HB.today; });
    var doneToday = hs.filter(function (h) { return isDone(h, HB.today); }).length;
    var weeklyDone = 0, bestEver = 0, monthTotal = 0, perfect = 0;
    hs.forEach(function (h) { elapsed.forEach(function (d) { if (isDone(h, d)) weeklyDone++; }); if (h.streak.best > bestEver) bestEver = h.streak.best; monthTotal += h.month_count; });
    if (n) elapsed.forEach(function (d) { if (hs.every(function (h) { return isDone(h, d); })) perfect++; });
    var todayRate = n ? Math.round(doneToday / n * 100) : 0, weekRate = n && elapsed.length ? Math.round(weeklyDone / (n * elapsed.length) * 100) : 0;

    var head = '<div class="mp-head"><p>' + (n ? doneToday + ' of ' + plural(n, 'habit') + ' done today' : 'Build habits that stick') + '</p><div class="mp-head-r">' + limitPill(lim) +
      '<button class="mp-add" id="hbAdd">' + (can ? '＋ Add habit' : '⚡ Upgrade for more') + '</button></div></div>';
    var body;
    if (!n) body = emptyBlock('🌱', 'No habits yet', 'Add a daily habit — like reading 30 minutes — and check it off every day to build a streak.', '<button class="mp-add" id="hbAdd2">＋ Add habit</button>');
    else {
      var tiles = '<div class="mp-tiles five">' + tile('🎯', 'Today', todayRate + '%', todayRate === 100 ? '#10b981' : '#6366f1') + tile('📅', 'This week', weekRate + '%', '#06b6d4') +
        tile('🔥', 'Best streak', bestEver + 'd', '#f97316') + tile('✔️', 'Check-ins this month', monthTotal, '#ec4899') + tile('⭐', 'Perfect days (week)', perfect + '/' + elapsed.length, '#f59e0b') + '</div>';
      body = tiles + '<div class="hb-grid">' + hs.map(habitCard).join('') + '</div>';
    }
    pc.innerHTML = '<div class="mp hb">' + head + body + '</div>';

    var add = function () { if (!can) { openUpgrade(); return; } habitModal(); };
    $('#hbAdd', pc).onclick = add; if ($('#hbAdd2', pc)) $('#hbAdd2', pc).onclick = add;
    function toggle(id, date, el) {
      if (el) el.disabled = true;
      api('hb_toggle', { habit_id: id, date: date }).then(function (d) {
        if (!d || !d.success) { if (el) el.disabled = false; toast((d && d.message) || 'Could not update', 'warn'); return; }
        var h = HB.habits.filter(function (x) { return x.id === id; })[0], i = h.dates.indexOf(date);
        if (d.done && i === -1) h.dates.push(date); else if (!d.done && i !== -1) h.dates.splice(i, 1);
        h.streak = d.streak; h.month_count = d.month_count; h.total_count = d.total_count;
        if (d.done && [7, 30, 100].indexOf(d.streak.current) !== -1) toast('🔥 ' + d.streak.current + '-day streak! Keep going', 'ok');
        else if (d.done && date === HB.today) toast('Checked in ✓', 'ok');
        if (here('habit-tracker') && pcEl()) drawHabits(pcEl());
      });
    }
    pc.querySelectorAll('.hb-card').forEach(function (c) {
      var id = +c.dataset.id, h = HB.habits.filter(function (x) { return x.id === id; })[0];
      c.querySelectorAll('[data-date]').forEach(function (b) { b.onclick = function () { toggle(id, b.dataset.date, b); }; });
      c.querySelector('[data-del]').onclick = function () { confirmModal('Delete habit?', '<b>' + esc(h.name) + '</b> and its whole check-in history (' + plural(h.total_count, 'check-in') + ') will be removed.', 'Delete', 'hb_delete', { id: id }, hbReload); };
    });
  }
  function habitCard(h) {
    var t = HB.today, doneT = isDone(h, t);
    var week = HB.week.map(function (d, i) {
      var fut = d > t;
      return '<button class="hb-day' + (isDone(h, d) ? ' on' : '') + (d === t ? ' today' : '') + '"' + (fut ? ' disabled' : ' data-date="' + d + '"') + ' title="' + fmtDate(d) + '"><span>' + LETTERS[i] + '</span></button>';
    }).join('');
    /* 12-week heatmap: columns = weeks (Mon..Sun), ending with the current week */
    var start = addDays(HB.week[0], -77), cols = '';
    for (var w = 0; w < 12; w++) {
      var cells = '';
      for (var d = 0; d < 7; d++) { var ds = addDays(start, w * 7 + d); cells += '<i class="' + (ds > t ? 'fut' : (isDone(h, ds) ? 'on' : '')) + '" title="' + fmtDate(ds) + '"></i>'; }
      cols += '<div>' + cells + '</div>';
    }
    return '<article class="hb-card" data-id="' + h.id + '" style="--c:' + esc(h.color) + '"><header><div class="hb-ic">' + esc(h.icon) + '</div>' +
      '<div class="hb-name"><b title="' + esc(h.name) + '">' + esc(h.name) + '</b><span>' + (h.streak.current > 0 ? '🔥 ' + plural(h.streak.current, 'day') + ' streak' : 'No active streak') + (h.streak.best > 0 ? ' · best ' + h.streak.best : '') + '</span></div>' +
      '<button class="mp-ib dng hb-del" data-del title="Delete">' + TRASH + '</button></header>' +
      '<div class="hb-week">' + week + '</div><div class="hb-heat" title="Last 12 weeks">' + cols + '</div>' +
      '<footer><span>' + h.month_count + ' this month</span><button class="hb-today' + (doneT ? ' on' : '') + '" data-date="' + t + '">' + (doneT ? '✓ Done today' : 'Mark done today') + '</button></footer></article>';
  }
  function habitModal() {
    var color = PALETTE[Math.floor(Math.random() * PALETTE.length)];
    formModal({
      title: 'Add habit', ok: 'Add habit',
      body: '<label>Habit name</label><input id="pxName" class="selectable" maxlength="100" placeholder="e.g. Read 30 minutes" data-focus>' +
        '<label>Icon</label><div class="px-quick hb-icons" id="pxIcons">' + ICONS.map(function (i) { return '<button data-i="' + i + '">' + i + '</button>'; }).join('') + '<input id="pxIcon" class="selectable hb-iconin" maxlength="4" value="✅"></div>' +
        '<label>Colour</label><div class="px-sw" id="pxSw">' + PALETTE.map(function (c) { return '<button data-c="' + c + '" style="--c:' + c + '"></button>'; }).join('') + '</div>',
      mount: function (ov) {
        var inp = ov.querySelector('#pxIcon');
        ov.querySelectorAll('#pxIcons button').forEach(function (b) { b.onclick = function () { inp.value = b.dataset.i; }; });
        function mark() { ov.querySelectorAll('#pxSw button').forEach(function (b) { b.classList.toggle('on', b.dataset.c === color); }); }
        ov.querySelectorAll('#pxSw button').forEach(function (b) { b.onclick = function () { color = b.dataset.c; mark(); }; });
        mark();
      },
      collect: function (ov) {
        var name = ov.querySelector('#pxName').value;
        if (!name.trim()) return { error: 'Please enter a habit name.' };
        return { action: 'hb_add', payload: { name: name, icon: ov.querySelector('#pxIcon').value, color: color } };
      },
      after: hbReload
    });
  }
})();
