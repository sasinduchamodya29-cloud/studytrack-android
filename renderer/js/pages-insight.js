/* StudyTrack Desktop - Analysis, Progress and Reports pages.
 * Native app pages (same look as Goals / Marks / Leaderboard). Data: pages6.php (actions an_*, pg_*, rp_*).
 * Needs js/pages-extra.js (window.StUI helpers) and Chart.js to be loaded first. */
(function () {
  var Pages = window.stPages, TITLES = window.stTitles, api = window.stApi, UI = window.StUI;
  if (!Pages || !api || !UI) return;
  var toast = UI.toast, modal = UI.modal, errPage = UI.errPage, lsGet = UI.lsGet, lsSet = UI.lsSet, $ = UI.$;
  TITLES.analysis = 'Analysis'; TITLES.progress = 'Progress'; TITLES.report = 'Reports';

  /* ── helpers ─────────────────────────────────────────────────────────── */
  function esc(s) { return E(String(s == null ? '' : s)); }
  function here(route) { return location.hash.indexOf('#/' + route) === 0; }
  function pcEl() { return document.getElementById('pageContent'); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function cssVar(n, d) { var v = getComputedStyle(document.documentElement).getPropertyValue(n).trim(); return v || d; }
  function fmt(m) { m = Math.max(0, Math.round(+m || 0)); var h = Math.floor(m / 60), r = m % 60; return h > 0 ? (h + 'h' + (r ? ' ' + r + 'm' : '')) : (r + 'm'); }
  function hrs(m) { return Math.round((+m || 0) / 6) / 10; }
  function fmtSec(s) { s = Math.max(0, Math.round(+s || 0)); var h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60); return h > 0 ? h + 'h ' + m + 'm' : m + 'm ' + (s % 60) + 's'; }
  function utc(s) { return new Date(s + 'T00:00:00Z'); }
  function dShort(s) { return utc(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }); }
  function dDay(s) { return utc(s).toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' }); }
  function dLong(s) { return utc(s).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' }); }
  function ymd(dt) { return dt.getUTCFullYear() + '-' + pad(dt.getUTCMonth() + 1) + '-' + pad(dt.getUTCDate()); }
  function addDays(s, n) { var d = utc(s); d.setUTCDate(d.getUTCDate() + n); return ymd(d); }
  function pctOf(a, b) { return b > 0 ? Math.min(100, Math.round(a / b * 100)) : 0; }
  function tile(ico, label, val, c) { return '<div class="mp-tile" style="--c:' + c + '"><div class="mp-tile-i">' + ico + '</div><div><b>' + val + '</b><span>' + label + '</span></div></div>'; }
  function card(title, inner, extra, cls) { return '<div class="mp-card ' + (cls || '') + '"><div class="mp-card-t"><span>' + title + '</span>' + (extra || '') + '</div>' + inner + '</div>'; }
  function note(t) { return '<p class="mp-note in-none">' + t + '</p>'; }
  function bar(p, c) { return '<div class="mp-bar"><i style="width:' + Math.max(0, Math.min(100, p)) + '%;--c:' + c + '"></i></div>'; }
  function onOff(root, sel, fn) { root.querySelectorAll(sel).forEach(function (el) { el.onclick = function (e) { fn(el, e); }; }); }
  function emptyBlock(ico, h, p) { return '<div class="mp-empty"><div>' + ico + '</div><h2>' + h + '</h2><p>' + p + '</p></div>'; }
  function seg(id, items, cur) { return '<div class="mp-tabs" id="' + id + '">' + items.map(function (i) { return '<button data-v="' + i[0] + '" class="' + (String(i[0]) === String(cur) ? 'on' : '') + '">' + i[1] + '</button>'; }).join('') + '</div>'; }

  /* Chart.js bookkeeping: everything is destroyed before the page is drawn again */
  var charts = [];
  function killCharts() { charts.forEach(function (c) { try { c.destroy(); } catch (e) {} }); charts = []; }
  function theme() { return { muted: cssVar('--text-muted', '#8b8ba0'), accent: cssVar('--accent', '#6366f1'), grid: 'rgba(127,127,160,.14)', text: cssVar('--text-primary', '#e5e7eb') }; }
  function mkChart(sel, root, cfg) {
    var el = $(sel, root); if (!el || !window.Chart) return null;
    var c = new Chart(el, cfg); charts.push(c); return c;
  }
  function axes(t, o) {
    o = o || {};
    return {
      y: { beginAtZero: true, stacked: !!o.stack, max: o.ymax, ticks: { color: t.muted, precision: 0, callback: o.yfmt }, grid: { color: t.grid } },
      x: { stacked: !!o.stack, ticks: { color: t.muted, maxRotation: 0, autoSkip: true, maxTicksLimit: o.xmax || 12 }, grid: { display: false } }
    };
  }
  function baseOpts(t, o) {
    o = o || {};
    return { maintainAspectRatio: false, animation: { duration: 450 }, plugins: { legend: { display: !!o.legend, labels: { color: t.muted, boxWidth: 8, boxHeight: 8, usePointStyle: true, pointStyle: 'circle' } }, tooltip: o.tooltip || {} }, scales: axes(t, o) };
  }
  function gradeColor(g) { return { A: '#10b981', B: '#06b6d4', C: '#f59e0b', S: '#fb923c', F: '#ef4444' }[g] || '#6366f1'; }
  function scoreColor(avg, target, exams) { return !exams ? 'var(--text-muted)' : (avg >= target ? '#10b981' : (avg >= 55 ? '#f59e0b' : '#ef4444')); }

  /* small form modal (same markup as the other pages) */
  function askModal(o) {
    return modal('<div class="px-h"><h3>' + o.title + '</h3><button data-close class="px-x">✕</button></div><div class="px-err" id="pxErr"></div>' + o.body +
      '<div class="px-btns"><button data-close class="px-sec">Cancel</button><button id="pxOk" class="px-pri">' + o.ok + '</button></div>',
      function (ov, close) {
        if (o.mount) o.mount(ov);
        var err = ov.querySelector('#pxErr'), ok = ov.querySelector('#pxOk');
        function submit() {
          err.style.display = 'none';
          var r = o.collect(ov);
          if (r.error) { err.textContent = r.error; err.style.display = 'block'; return; }
          ok.disabled = true; ok.textContent = 'Saving…';
          api(r.action, r.payload).then(function (d) {
            if (d && d.success) { close(); toast(d.message || 'Done', 'ok'); if (o.after) o.after(d); }
            else { ok.disabled = false; ok.textContent = o.ok; err.textContent = (d && d.message) || 'Something went wrong.'; err.style.display = 'block'; }
          });
        }
        ok.onclick = submit;
        ov.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); submit(); } });
        var f = ov.querySelector('[data-focus]'); if (f) setTimeout(function () { f.focus(); f.select && f.select(); }, 60);
      });
  }

  /* ════════════════════════════════════════════════════════════════════
     ANALYSIS
     ════════════════════════════════════════════════════════════════════ */
  var AN = { period: lsGet('anPeriod', 'month'), d: null, sub: 0, wt: lsGet('anWt', 'weekly') };
  if (['week', 'month', 'year'].indexOf(AN.period) < 0) AN.period = 'month';

  Pages.analysis = function (pc) { return anLoad(pc, true); };
  function anLoad(pc, first) {
    if (!first) pc.classList.add('in-busy');
    return api('an_page', { period: AN.period }).then(function (d) {
      pc.classList.remove('in-busy');
      if (!here('analysis')) return;
      if (!d || !d.success) return errPage(pc, d);
      AN.d = d; if (!d.marks.some(function (m) { return m.subject_id === AN.sub; })) AN.sub = 0;
      anDraw(pc);
    });
  }

  /* daily minutes -> chart rows (day bars for week / month, month bars for a year) */
  function anSeries(d) {
    if (d.period !== 'year') return { labels: d.daily.map(function (r) { return d.period === 'week' ? dLong(r.date) : dShort(r.date); }), values: d.daily.map(function (r) { return hrs(r.minutes); }), dates: d.daily.map(function (r) { return r.date; }) };
    var map = {}, order = [];
    d.daily.forEach(function (r) { var k = r.date.slice(0, 7); if (!(k in map)) { map[k] = 0; order.push(k); } map[k] += r.minutes; });
    return { labels: order.map(function (k) { return utc(k + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit', timeZone: 'UTC' }); }), values: order.map(function (k) { return hrs(map[k]); }), dates: order };
  }

  function anHighlights(d) {
    var items = [];
    var best = d.daily.reduce(function (a, r) { return r.minutes > (a ? a.minutes : 0) ? r : a; }, null);
    if (best) items.push(['🏅', 'Best day', dLong(best.date) + ' · ' + fmt(best.minutes)]);
    if (d.split.length) items.push(['📚', 'Most studied', esc(d.split[0].name) + ' · ' + fmt(d.split[0].minutes)]);
    var scored = d.perSubject.filter(function (s) { return s.exams > 0; });
    if (scored.length) {
      var gap = scored.map(function (s) { return { s: s, g: s.avg - s.target }; }).sort(function (a, b) { return a.g - b.g; })[0];
      if (gap.g < 0) items.push(['🎯', 'Needs attention', esc(gap.s.name) + ' · ' + Math.abs(Math.round(gap.g)) + '% below target']);
      else items.push(['✅', 'All on target', 'Every scored subject is at or above its target']);
    }
    var cons = d.summary.studyDays + ' of ' + d.days + ' days studied';
    items.push(['📅', 'Consistency', cons]);
    return '<div class="in-hl">' + items.map(function (i) { return '<div><span>' + i[0] + '</span><div><b>' + i[1] + '</b><em>' + i[2] + '</em></div></div>'; }).join('') + '</div>';
  }

  function anHeat(d) {
    var today = d.today, dow = (utc(today).getUTCDay() + 6) % 7;            // Monday = 0
    var start = addDays(today, -(dow + 77)), cells = '';
    for (var i = 0; i < 84; i++) {
      var ds = addDays(start, i);
      if (ds > today) { cells += '<i class="x"></i>'; continue; }
      var m = d.heat[ds] || 0, lv = m >= 180 ? 4 : (m >= 120 ? 3 : (m >= 60 ? 2 : (m > 0 ? 1 : 0)));
      cells += '<i class="l' + lv + '" title="' + dShort(ds) + ' · ' + (m ? fmt(m) : 'no study') + '"></i>';
    }
    return '<div class="in-heat">' + cells + '</div><div class="in-legend">Less <i class="l0"></i><i class="l1"></i><i class="l2"></i><i class="l3"></i><i class="l4"></i> More</div>';
  }

  function anAttendance(d) {
    var c = d.class;
    if (!c.total) return note('No classes logged in this period. Add classes in the Class Log page.');
    var subs = c.bySubject.map(function (s) { return '<div class="in-row"><span class="in-rn"><i class="mp-dot" style="background:' + s.color + '"></i>' + esc(s.name) + '</span><span class="in-rv">' + s.attended + '/' + s.total + '</span>' + bar(pctOf(s.attended, s.total), s.color) + '</div>'; }).join('');
    return '<div class="mp-tiles four in-mt">' + tile('🏫', 'Attendance rate', c.rate + '%', c.rate >= 80 ? '#10b981' : (c.rate >= 60 ? '#f59e0b' : '#ef4444')) + tile('✅', 'Attended', c.attended, '#10b981') + tile('❌', 'Missed', c.missed, '#ef4444') + tile('⏱️', 'Hours attended', hrs(c.attMins) + 'h', '#6366f1') + '</div>' +
      '<div class="in-two"><div><div class="mp-card-t"><span>Class hours · last 7 days</span></div><div class="in-chart sm"><canvas id="anClsChart"></canvas></div></div><div><div class="mp-card-t"><span>By subject</span></div>' + subs + '</div></div>';
  }

  function anWasted(d) {
    var rows = AN.wt === 'monthly' ? d.wtMonthly : d.wtWeekly;
    var any = rows.some(function (r) { return r.worked > 0; });
    var tr = rows.reduce(function (a, r) { return a + (r.tracked || 0); }, 0);
    var tot = rows.reduce(function (a, r) { return { w: a.w + r.worked, x: a.x + r.wasted }; }, { w: 0, x: 0 });
    var latest = rows[rows.length - 1];
    var tiles = '<div class="mp-tiles four in-mt">' + tile('✅', 'Worked', hrs(tot.w) + 'h', '#10b981') + tile('🕳️', 'Wasted', hrs(tot.x) + 'h', '#ef4444') + tile('🎯', 'Focus score', (latest && latest.focus != null ? latest.focus + '%' : '—'), '#6366f1') + tile('⏲️', 'Tracked sessions', tr, '#06b6d4') + '</div>';
    if (!any) return note('Nothing studied in this range yet.');
    return tiles + '<div class="in-chart"><canvas id="anWtChart"></canvas></div>' + (tr ? '' : note('Add "wasted minutes" when you log a session (Focus Timer / Study Log) to see your focus score.'));
  }

  function anTimetable(d) {
    var t = d.timetable;
    if (!t.slots) return note('No active timetable slots. Build your week in the Timetable page.');
    var order = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], busy = t.byDay.indexOf(Math.max.apply(null, t.byDay));
    var subs = t.bySubject.slice(0, 8).map(function (s) { return '<div class="in-row"><span class="in-rn"><i class="mp-dot" style="background:' + s.color + '"></i>' + esc(s.name) + '</span><span class="in-rv">' + fmt(s.minutes) + ' · ' + s.count + ' slot' + (s.count === 1 ? '' : 's') + '</span>' + bar(pctOf(s.minutes, t.bySubject[0].minutes), s.color) + '</div>'; }).join('');
    return '<div class="mp-tiles four in-mt">' + tile('🗓️', 'Active slots', t.slots, '#6366f1') + tile('⏱️', 'Weekly hours', hrs(t.total) + 'h', '#06b6d4') + tile('📚', 'Subjects', t.bySubject.length, '#f59e0b') + tile('🔥', 'Busiest day', order[busy] + ' · ' + hrs(t.byDay[busy]) + 'h', '#ef4444') + '</div>' +
      '<div class="in-two"><div class="in-chart sm"><canvas id="anTtChart"></canvas></div><div>' + subs + '</div></div>';
  }

  function anHabits(d) {
    var h = d.habits;
    if (!h.total) return note('No habits yet. Create some in the Habit Tracker.');
    var list = h.list.map(function (x) { return '<div class="in-row"><span class="in-rn">' + esc(x.icon || '•') + ' ' + esc(x.name) + '</span><span class="in-rv">' + x.pct + '% · 🔥 ' + x.current + 'd</span>' + bar(x.pct, x.color) + '</div>'; }).join('');
    return '<div class="mp-tiles four in-mt">' + tile('📆', 'Today', h.todayRate + '%', '#6366f1') + tile('📈', 'This period', h.periodRate + '%', '#10b981') + tile('🔥', 'Best current streak', h.bestStreak + 'd', '#f59e0b') + tile('✨', 'Active habits', h.total, '#06b6d4') + '</div>' +
      '<div class="in-two"><div class="in-chart sm"><canvas id="anHbChart"></canvas></div><div>' + list + '</div></div>';
  }

  function anExam(d) {
    var e = d.exam;
    if (!e.total) return note('No timed practice sessions in this period. Start one in the Exam Area.');
    var subs = e.bySubject.map(function (s) { return '<div class="in-row"><span class="in-rn"><i class="mp-dot" style="background:' + s.color + '"></i>' + esc(s.name) + '</span><span class="in-rv">' + s.count + ' × avg ' + s.avgMin + 'm</span>' + bar(pctOf(s.count, e.bySubject[0].count), s.color) + '</div>'; }).join('');
    return '<div class="mp-tiles four in-mt">' + tile('📝', 'Sessions', e.total, '#6366f1') + tile('⏱️', 'Total time', fmtSec(e.totalSec), '#06b6d4') + tile('⌀', 'Average', fmtSec(e.avgSec), '#f59e0b') + tile('⏰', 'Went overtime', e.over, e.over ? '#ef4444' : '#10b981') + '</div>' +
      '<div class="in-two"><div class="in-chart sm"><canvas id="anExChart"></canvas></div><div>' + subs + '</div></div>';
  }

  function anPlanner(d) {
    var p = d.planner;
    if (!p.entries) return note('No planner blocks in this period. Plan your day in the Smart Planner (Pro).');
    var subs = p.bySubject.slice(0, 8).map(function (s) { return '<div class="in-row"><span class="in-rn"><i class="mp-dot" style="background:' + s.color + '"></i>' + esc(s.name) + '</span><span class="in-rv">' + fmt(s.studied) + ' / ' + fmt(s.planned) + '</span>' + bar(pctOf(s.studied, s.planned), s.color) + '</div>'; }).join('');
    return '<div class="mp-tiles five in-mt">' + tile('✅', 'Plan completed', p.pct + '%', p.pct >= 70 ? '#10b981' : '#f59e0b') + tile('📋', 'Planned', fmt(p.planned), '#6366f1') + tile('📚', 'Studied', fmt(p.studied), '#06b6d4') + tile('🔥', 'Planner streak', p.streak + 'd', '#f59e0b') +
      tile('🏅', 'Best / worst', (p.best ? dShort(p.best) : '—') + ' / ' + (p.worst ? dShort(p.worst) : '—'), '#a855f7') + '</div>' +
      '<div class="in-two"><div class="in-chart sm"><canvas id="anPlChart"></canvas></div><div>' + subs + '</div></div>';
  }

  function anSubjects(d) {
    var rows = d.perSubject;
    if (!rows.length) return note('Add subjects to see per-subject performance.');
    var maxM = Math.max.apply(null, rows.map(function (r) { return r.minutes; }).concat([1]));
    return '<div class="in-tbl"><div class="in-tr in-th"><span>Subject</span><span>Study time</span><span>Sessions</span><span>Exams</span><span>Average vs target</span><span>Best</span><span>Lowest</span></div>' + rows.map(function (r) {
      var c = scoreColor(r.avg, r.target, r.exams);
      return '<div class="in-tr"><span class="in-sn"><i class="mp-dot" style="background:' + r.color + '"></i>' + esc(r.name) + '</span>' +
        '<span><b>' + fmt(r.minutes) + '</b>' + bar(pctOf(r.minutes, maxM), r.color) + '</span><span>' + r.sessions + '</span><span>' + r.exams + '</span>' +
        '<span>' + (r.exams ? '<b style="color:' + c + '">' + r.avg + '%</b> <em>/ ' + r.target + '%</em>' : '<em>no exams</em>') + '</span>' +
        '<span style="color:#10b981">' + (r.exams ? r.best + '%' : '—') + '</span><span style="color:' + (r.exams ? '#ef4444' : 'inherit') + '">' + (r.exams ? r.worst + '%' : '—') + '</span></div>';
    }).join('') + '</div>';
  }

  function anDraw(pc) {
    var d = AN.d, s = d.summary, t = theme();
    killCharts();
    var periodLbl = d.period === 'week' ? 'Last 7 days' : (d.period === 'year' ? 'Last 12 months' : 'Last 30 days');
    var subs = []; d.marks.forEach(function (m) { if (!subs.some(function (x) { return x.id === m.subject_id; })) subs.push({ id: m.subject_id, name: m.name }); });
    var head = '<div class="mp-head"><p>' + periodLbl + ' · study habits, marks &amp; attendance insights</p><div class="mp-head-r">' + seg('anPer', [['week', '7 days'], ['month', '30 days'], ['year', 'Year']], d.period) + '</div></div>';
    var tiles = '<div class="mp-tiles four">' + tile('⏱️', 'Total study time', fmt(s.total), '#6366f1') + tile('📅', 'Days studied', s.studyDays + ' <small>/ ' + d.days + '</small>', '#06b6d4') + tile('⌀', 'Avg per study day', fmt(s.avg), '#f59e0b') + tile('🏅', 'Best day', fmt(s.max), '#10b981') + '</div>';
    var studyCard = card('⏱️ Study hours', s.total ? '<div class="in-chart"><canvas id="anDaily"></canvas></div>' : note('No study sessions in this period. Start a Focus Timer session to see your hours here.'), '<span class="in-badge">' + (d.period === 'year' ? 'per month' : 'per day') + '</span>', 'in-wide');
    var marksCard = card('📊 Marks trend', d.marks.length ? '<div class="in-chart"><canvas id="anMarks"></canvas></div>' : note('No exam results in this period. Add results in Marks &amp; Results.'),
      subs.length > 1 ? '<select class="mp-sel" id="anSub"><option value="0">All subjects</option>' + subs.map(function (x) { return '<option value="' + x.id + '"' + (AN.sub === x.id ? ' selected' : '') + '>' + esc(x.name) + '</option>'; }).join('') + '</select>' : '');
    var splitCard = card('🥧 Study split', d.split.length ? '<div class="in-split"><div class="in-chart sm"><canvas id="anSplit"></canvas></div><div>' + d.split.slice(0, 8).map(function (x) { return '<div class="in-row"><span class="in-rn"><i class="mp-dot" style="background:' + x.color + '"></i>' + esc(x.name) + '</span><span class="in-rv">' + fmt(x.minutes) + ' · ' + pctOf(x.minutes, s.total) + '%</span></div>'; }).join('') + '</div></div>' : note('No subject time recorded yet.'));
    pc.innerHTML = '<div class="mp in">' + head + tiles + anHighlights(d) + '<div class="in-grid">' + studyCard + marksCard + splitCard +
      card('🗓️ Study heatmap', anHeat(d), '<span class="in-badge">Last 12 weeks</span>', 'in-wide') +
      card('🏫 Attendance overview', anAttendance(d), '', 'in-wide') +
      card('⏳ Worked vs wasted time', anWasted(d), seg('anWt', [['weekly', '8 weeks'], ['monthly', '6 months']], AN.wt), 'in-wide') +
      card('🗓️ Weekly schedule load', anTimetable(d), '', 'in-wide') +
      card('🔥 Consistency overview', anHabits(d), '', 'in-wide') +
      card('📝 Timed practice', anExam(d), '', 'in-wide') +
      card('📋 Plan vs reality', anPlanner(d), '', 'in-wide') +
      card('📖 Per-subject performance', anSubjects(d), '', 'in-wide') + '</div></div>';

    onOff(pc, '#anPer button', function (b) { if (AN.period === b.dataset.v) return; AN.period = b.dataset.v; lsSet('anPeriod', AN.period); anLoad(pc); });
    onOff(pc, '#anWt button', function (b) { AN.wt = b.dataset.v; lsSet('anWt', AN.wt); var y = pcScroll(); anDraw(pc); pcScroll(y); });
    var sel = $('#anSub', pc); if (sel) sel.onchange = function () { AN.sub = +sel.value; drawMarks(pc, t); };
    drawAnCharts(pc, d, t);
  }
  function pcScroll(y) { var el = document.querySelector('.main-content') || pcEl(); if (!el) return 0; if (y == null) return el.scrollTop; el.scrollTop = y; }

  function drawMarks(pc, t) {
    var d = AN.d, old = charts.filter(function (c) { return c.canvas && c.canvas.id === 'anMarks'; })[0];
    if (old) { old.destroy(); charts.splice(charts.indexOf(old), 1); }
    var rows = d.marks.filter(function (m) { return !AN.sub || m.subject_id === AN.sub; });
    var dates = []; rows.forEach(function (m) { if (dates.indexOf(m.date) < 0) dates.push(m.date); }); dates.sort();
    var by = {}, order = [];
    rows.forEach(function (m) { if (!by[m.subject_id]) { by[m.subject_id] = { label: m.name, borderColor: m.color, backgroundColor: m.color, data: dates.map(function () { return null; }), tension: .35, borderWidth: 2.5, pointRadius: 4, pointHoverRadius: 6, spanGaps: true }; order.push(m.subject_id); } by[m.subject_id].data[dates.indexOf(m.date)] = m.pct; });
    var o = baseOpts(t, { legend: order.length > 1, ymax: 100, yfmt: function (v) { return v + '%'; } });
    o.plugins.tooltip = { callbacks: { label: function (it) { return it.dataset.label + ': ' + it.parsed.y + '%'; } } };
    mkChart('#anMarks', pc, { type: 'line', data: { labels: dates.map(dShort), datasets: order.map(function (k) { return by[k]; }) }, options: o });
  }

  function drawAnCharts(pc, d, t) {
    var ser = anSeries(d), col = t.accent;
    mkChart('#anDaily', pc, { type: 'bar', data: { labels: ser.labels, datasets: [{ data: ser.values, backgroundColor: col, borderRadius: 6, maxBarThickness: 34 }] },
      options: Object.assign(baseOpts(t, { xmax: d.period === 'week' ? 7 : 15, yfmt: function (v) { return v + 'h'; } }), { plugins: { legend: { display: false }, tooltip: { callbacks: { label: function (it) { return it.parsed.y + ' h'; } } } } }) });
    drawMarks(pc, t);
    mkChart('#anSplit', pc, { type: 'doughnut', data: { labels: d.split.map(function (x) { return x.name; }), datasets: [{ data: d.split.map(function (x) { return x.minutes; }), backgroundColor: d.split.map(function (x) { return x.color; }), borderWidth: 0 }] },
      options: { maintainAspectRatio: false, cutout: '64%', plugins: { legend: { display: false }, tooltip: { callbacks: { label: function (it) { return it.label + ': ' + fmt(it.parsed); } } } } } });
    mkChart('#anClsChart', pc, { type: 'bar', data: { labels: d.class.week.map(function (r) { return dDay(r.date); }), datasets: [{ data: d.class.week.map(function (r) { return hrs(r.minutes); }), backgroundColor: '#10b981', borderRadius: 6, maxBarThickness: 30 }] },
      options: Object.assign(baseOpts(t, { yfmt: function (v) { return v + 'h'; } }), { plugins: { legend: { display: false } } }) });
    var wt = AN.wt === 'monthly' ? d.wtMonthly : d.wtWeekly;
    var wo = baseOpts(t, { stack: true, legend: true, yfmt: function (v) { return v + 'h'; } });
    wo.plugins.tooltip = { callbacks: { label: function (it) { return it.dataset.label + ': ' + it.parsed.y + 'h'; }, afterBody: function (its) { var r = wt[its[0].dataIndex]; return r && r.focus != null ? 'Focus: ' + r.focus + '%' : ''; } } };
    mkChart('#anWtChart', pc, { type: 'bar', data: { labels: wt.map(function (r) { return r.label || dShort(r.from); }), datasets: [{ label: 'Worked', data: wt.map(function (r) { return hrs(r.worked); }), backgroundColor: '#10b981', borderRadius: 4 }, { label: 'Wasted', data: wt.map(function (r) { return hrs(r.wasted); }), backgroundColor: '#ef4444', borderRadius: 4 }] }, options: wo });
    mkChart('#anTtChart', pc, { type: 'bar', data: { labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], datasets: [{ data: d.timetable.byDay.map(hrs), backgroundColor: '#6366f1', borderRadius: 6, maxBarThickness: 30 }] },
      options: Object.assign(baseOpts(t, { yfmt: function (v) { return v + 'h'; } }), { plugins: { legend: { display: false } } }) });
    mkChart('#anHbChart', pc, { type: 'line', data: { labels: d.habits.daily.map(function (r) { return dShort(r.date); }), datasets: [{ data: d.habits.daily.map(function (r) { return r.rate; }), borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,.15)', fill: true, tension: .35, borderWidth: 2.5, pointRadius: 0, pointHoverRadius: 5 }] },
      options: Object.assign(baseOpts(t, { ymax: 100, yfmt: function (v) { return v + '%'; } }), { plugins: { legend: { display: false } } }) });
    mkChart('#anExChart', pc, { type: 'bar', data: { labels: d.exam.recent.map(function (r) { return dShort(r.date); }), datasets: [{ data: d.exam.recent.map(function (r) { return r.min; }), backgroundColor: '#f59e0b', borderRadius: 6, maxBarThickness: 30 }] },
      options: Object.assign(baseOpts(t, { yfmt: function (v) { return v + 'm'; } }), { plugins: { legend: { display: false } } }) });
    var pl = d.planner.days.slice(-30);
    var po = baseOpts(t, { stack: true, legend: true, xmax: 10, yfmt: function (v) { return v + 'h'; } });
    mkChart('#anPlChart', pc, { type: 'bar', data: { labels: pl.map(function (r) { return dShort(r.date); }), datasets: [{ label: 'Studied', data: pl.map(function (r) { return hrs(r.studied); }), backgroundColor: '#10b981', borderRadius: 3 }, { label: 'Wasted', data: pl.map(function (r) { return hrs(r.wasted); }), backgroundColor: '#ef4444', borderRadius: 3 }] }, options: po });
  }

  /* ════════════════════════════════════════════════════════════════════
     PROGRESS
     ════════════════════════════════════════════════════════════════════ */
  var PG = { d: null };
  Pages.progress = function (pc) {
    return api('pg_page').then(function (d) {
      if (!d || !d.success) return errPage(pc, d);
      PG.d = d; pgDraw(pc);
    });
  };
  function monthBuckets(d) {
    var map = {}; d.monthly.forEach(function (r) { map[r.month] = r.mins; });
    var t = utc(d.today), out = [];
    for (var i = 5; i >= 0; i--) {
      var m = new Date(Date.UTC(t.getUTCFullYear(), t.getUTCMonth() - i, 1)), k = m.getUTCFullYear() + '-' + pad(m.getUTCMonth() + 1);
      out.push({ label: m.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' }), mins: map[k] || 0 });
    }
    return out;
  }
  function pgSubject(s, i) {
    var tPct = s.target > 0 ? Math.min(100, Math.round(s.avg / s.target * 100)) : 0, c = scoreColor(s.avg, s.target, s.exams);
    var wkTarget = s.weeklyTarget * 60, medal = i === 0 ? '🥇' : (i === 1 ? '🥈' : (i === 2 ? '🥉' : (i + 1)));
    var badge = s.exams ? '<span class="pg-badge" style="--c:' + c + '">' + s.avg + '% avg</span>' : '<span class="pg-badge" style="--c:var(--text-muted)">No exams yet</span>';
    return '<div class="pg-sub" style="--sc:' + s.color + '"><div class="pg-sub-main"><div class="pg-sub-n"><span class="pg-rank">' + medal + '</span>' + esc(s.name) + badge + '<em>Target ' + s.target + '%</em></div>' +
      '<div class="in-row"><span class="in-rn">Progress to target</span><span class="in-rv">' + s.avg + '% / ' + s.target + '%</span>' + bar(tPct, c) + '</div>' +
      (wkTarget > 0 ? '<div class="in-row"><span class="in-rn">This week <em>(' + esc(PG.d.weekLabel) + ')</em></span><span class="in-rv">' + hrs(s.weekMins) + 'h / ' + s.weeklyTarget + 'h</span>' + bar(pctOf(s.weekMins, wkTarget), s.color) + '</div>' : '') +
      '</div><div class="pg-sub-st"><div><b>' + Math.floor(s.totalMins / 60) + 'h</b><span>Total study</span></div><div><b>' + s.exams + '</b><span>Exams</span></div><div><b style="color:#10b981">' + (s.exams ? s.best + '%' : '—') + '</b><span>Best</span></div></div></div>';
  }
  function pgDraw(pc) {
    var d = PG.d, t = theme();
    killCharts();
    var p = pctOf(d.todayMins, d.goal), C = 2 * Math.PI * 54, off = C * (1 - p / 100), rem = Math.max(0, d.goal - d.todayMins);
    var tiles = '<div class="mp-tiles four">' + tile('🔥', 'Current streak', d.streak + ' day' + (d.streak === 1 ? '' : 's'), '#f59e0b') + tile('⏱️', 'Total study time', fmt(d.totalAll), '#6366f1') + tile('🎯', 'Subjects on target', d.onTarget + ' <small>/ ' + d.subjects.length + '</small>', '#10b981') + tile('📈', 'Overall average', d.overallAvg + '%', '#06b6d4') + '</div>';
    var goal = card('🎯 Daily study goal', '<div class="pg-goal"><div class="pg-ring"><svg viewBox="0 0 130 130"><defs><linearGradient id="pgGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6366f1"/><stop offset="1" stop-color="#a855f7"/></linearGradient></defs>' +
      '<circle cx="65" cy="65" r="54" fill="none" stroke="var(--srf2)" stroke-width="10"/><circle cx="65" cy="65" r="54" fill="none" stroke="url(#pgGrad)" stroke-width="10" stroke-linecap="round" stroke-dasharray="' + C + '" stroke-dashoffset="' + off + '" style="transition:stroke-dashoffset .8s ease"/></svg>' +
      '<div class="pg-ring-in"><b>' + p + '%</b><span>Today</span></div></div><div class="pg-goal-i"><div class="pg-amt">' + fmt(d.todayMins) + ' <span>/ ' + fmt(d.goal) + ' goal</span></div>' +
      (p >= 100 ? '<div class="pg-msg ok">🎉 Goal achieved today — keep it up!</div>' : '<div class="pg-msg">⏳ ' + fmt(rem) + ' more to reach your goal</div>') + '</div></div>', '<button class="mp-mini" id="pgEdit">Edit</button>');
    var streak = card('🔥 Study streak', '<div class="pg-streak"><div class="pg-flame">🔥</div><b>' + d.streak + '</b><span>Day streak</span><p class="mp-note">' + (d.streak > 0 ? "You've studied every day of this streak — don't break the chain!" : 'Log a session today to start a new streak.') + '</p></div>');
    var mb = monthBuckets(d);
    var monthly = card('📅 Monthly study hours', mb.some(function (m) { return m.mins > 0; }) ? '<div class="in-chart"><canvas id="pgMonthly"></canvas></div>' : note('No study sessions in the last 6 months yet.'), '<span class="in-badge">Last 6 months</span>');
    var subs = d.subjects.length ? '<div class="pg-subs">' + d.subjects.map(pgSubject).join('') + '</div>' : emptyBlock('🎯', 'Add subjects to track progress', 'Create subjects, set a target mark and weekly hours, then your progress shows up here.');
    pc.innerHTML = '<div class="mp in pg">' + '<div class="mp-head"><p>Your goals, streak and subject targets at a glance</p></div>' + tiles + '<div class="in-grid">' + goal + streak + '</div>' + monthly +
      '<div class="mp-head in-sechd"><h3>📊 Subject progress tracker</h3><p>' + d.subjects.length + ' subject' + (d.subjects.length === 1 ? '' : 's') + '</p></div>' + subs + '</div>';
    $('#pgEdit', pc).onclick = goalModal;
    mkChart('#pgMonthly', pc, { type: 'bar', data: { labels: mb.map(function (m) { return m.label; }), datasets: [{ data: mb.map(function (m) { return hrs(m.mins); }), backgroundColor: t.accent, borderRadius: 7, maxBarThickness: 46 }] },
      options: Object.assign(baseOpts(t, { yfmt: function (v) { return v + 'h'; } }), { plugins: { legend: { display: false }, tooltip: { callbacks: { label: function (it) { return it.parsed.y + ' h'; } } } } }) });
  }
  function goalModal() {
    askModal({ title: '🎯 Set daily goal', ok: 'Save goal',
      body: '<label>Daily study goal (minutes)</label><input id="pgMin" type="number" class="selectable" min="15" max="1440" step="15" value="' + PG.d.goal + '" data-focus>' +
        '<div class="px-quick" id="pgQuick">' + [60, 90, 120, 180, 240].map(function (m) { return '<button type="button" data-m="' + m + '">' + fmt(m) + '</button>'; }).join('') + '</div><p class="px-p" style="margin-top:10px">Recommended: 2–4 hours a day for A/L students.</p>',
      mount: function (ov) { ov.querySelectorAll('#pgQuick button').forEach(function (b) { b.onclick = function () { ov.querySelector('#pgMin').value = b.dataset.m; }; }); },
      collect: function (ov) { var v = parseInt(ov.querySelector('#pgMin').value, 10); if (!(v >= 15 && v <= 1440)) return { error: 'Enter a goal between 15 and 1440 minutes.' }; return { action: 'pg_goal', payload: { minutes: v } }; },
      after: function (d) { PG.d = d; if (here('progress') && pcEl()) pgDraw(pcEl()); } });
  }

  /* ════════════════════════════════════════════════════════════════════
     REPORTS
     ════════════════════════════════════════════════════════════════════ */
  var RP = { period: lsGet('rpPeriod', 'week'), week: null, month: null, year: null, d: null };
  if (['week', 'month', 'year', 'all'].indexOf(RP.period) < 0) RP.period = 'week';
  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  Pages.report = function (pc) { return rpLoad(pc, true); };
  function rpLoad(pc, first) {
    if (!first) pc.classList.add('in-busy');
    var q = { period: RP.period };
    if (RP.week) q.week_start = RP.week; if (RP.month) q.month = RP.month; if (RP.year) q.year = RP.year;
    return api('rp_page', q).then(function (d) {
      pc.classList.remove('in-busy');
      if (!here('report')) return;
      if (!d || !d.success) return errPage(pc, d);
      RP.d = d; RP.week = d.weekStart; RP.month = d.month; RP.year = d.year;
      rpDraw(pc);
    });
  }
  function delta(cur, prev, isPct) {
    if (prev == null) return '';
    var diff = isPct ? Math.round((cur - prev) * 10) / 10 : (prev > 0 ? Math.round((cur - prev) / prev * 100) : (cur > 0 ? 100 : 0));
    if (!diff) return '<em class="rp-d flat">no change vs previous</em>';
    return '<em class="rp-d ' + (diff > 0 ? 'up' : 'down') + '">' + (diff > 0 ? '▲ ' : '▼ ') + Math.abs(diff) + (isPct ? ' pts' : '%') + ' vs previous</em>';
  }
  function rpControls(d) {
    var nav = '';
    if (d.period === 'week') nav = '<div class="rp-nav"><button id="rpPrev">‹</button><span>' + esc(d.label) + '</span><button id="rpNext"' + (d.weekStart >= d.curWeek ? ' disabled' : '') + '>›</button></div>';
    else if (d.period === 'month') nav = '<div class="rp-nav"><button id="rpPrev">‹</button><span>' + esc(d.label) + '</span><button id="rpNext"' + (d.year === d.curYear && d.month >= d.curMonth ? ' disabled' : '') + '>›</button></div>';
    else if (d.period === 'year') nav = '<div class="rp-nav"><button id="rpPrev">‹</button><span>' + esc(d.label) + '</span><button id="rpNext"' + (d.year >= d.curYear ? ' disabled' : '') + '>›</button></div>';
    else nav = '<div class="rp-nav"><span>' + esc(d.label) + '</span></div>';
    return '<div class="mp-head rp-ctl">' + seg('rpPer', [['week', 'Week'], ['month', 'Month'], ['year', 'Year'], ['all', 'All time']], d.period) + nav +
      '<div class="mp-head-r rp-btns"><button class="rp-b" id="rpPrint">🖨️ Print</button>' + rpPdfButtons(d) + '</div></div>';
  }
  function rpDaily(d) {
    if (!d.daily.length) return { html: note('No study sessions in this period.'), draw: null };
    var labels, values;
    if (d.period === 'week' || d.period === 'month') {
      var map = {}; d.daily.forEach(function (r) { map[r.date] = r.mins; });
      labels = []; values = [];
      for (var i = 0, ds = d.from; ds <= d.to && i < 40; i++, ds = addDays(ds, 1)) { labels.push(d.period === 'week' ? dLong(ds) : dShort(ds)); values.push(hrs(map[ds] || 0)); }
    } else {
      var m = {}, ord = [];
      d.daily.forEach(function (r) { var k = r.date.slice(0, 7); if (!(k in m)) { m[k] = 0; ord.push(k); } m[k] += r.mins; });
      labels = ord.map(function (k) { return utc(k + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit', timeZone: 'UTC' }); }); values = ord.map(function (k) { return hrs(m[k]); });
    }
    return { html: '<div class="in-chart"><canvas id="rpDaily"></canvas></div>', draw: function (pc, t) {
      mkChart('#rpDaily', pc, { type: 'bar', data: { labels: labels, datasets: [{ data: values, backgroundColor: t.accent, borderRadius: 6, maxBarThickness: 34 }] },
        options: Object.assign(baseOpts(t, { xmax: d.period === 'week' ? 7 : 16, yfmt: function (v) { return v + 'h'; } }), { plugins: { legend: { display: false }, tooltip: { callbacks: { label: function (it) { return it.parsed.y + ' h'; } } } } }) });
    } };
  }
  function rpMarks(d) {
    if (!d.marks.length) return note('No exam results in this period.');
    var g = d.grades, tot = d.marks.length;
    var dist = ['A', 'B', 'C', 'S', 'F'].map(function (k) { return '<div class="rp-gr"><b style="color:' + gradeColor(k) + '">' + k + '</b>' + bar(pctOf(g[k], tot), gradeColor(k)) + '<span>' + g[k] + '</span></div>'; }).join('');
    var rows = d.marks.slice(0, 12).map(function (m) { return '<div class="in-tr rp-mr"><span class="in-sn"><i class="mp-dot" style="background:' + m.color + '"></i>' + esc(m.subject) + '</span><span>' + esc(m.exam) + '</span><span>' + dShort(m.date) + '</span><span>' + m.got + '/' + m.total + '</span><span><b style="color:' + gradeColor(m.grade) + '">' + m.pct + '% · ' + m.grade + '</b></span></div>'; }).join('');
    return '<div class="in-two rp-mk"><div><div class="mp-card-t"><span>Grade distribution</span></div>' + dist + '</div><div class="in-tbl rp-tbl"><div class="in-tr rp-mr in-th"><span>Subject</span><span>Exam</span><span>Date</span><span>Marks</span><span>Score</span></div>' + rows + (d.marks.length > 12 ? '<p class="mp-note">+ ' + (d.marks.length - 12) + ' more results</p>' : '') + '</div></div>';
  }
  /* Premium PDF: download is free for everyone, Send to Telegram is Premium (same rules as the website) */
  function rpPdfButtons(d) {
    var cur = d.period !== 'week' || d.weekStart >= d.curWeek;
    var tip = cur ? '' : ' disabled title="The PDF covers the current week. Go to this week to download it."';
    var tg = !d.premium ? '<button class="rp-b tg" id="rpTg" title="Premium members can send the report to Telegram">🔒 Send to Telegram</button>'
      : (!d.telegram ? '<button class="rp-b tg" id="rpTg" title="Link your Telegram account first">✈ Link Telegram</button>' : '<button class="rp-b tg"' + tip + ' id="rpTg">✈ Send to Telegram</button>');
    return '<button class="rp-b pri"' + tip + ' id="rpPdf">⬇ Premium PDF</button>' + tg;
  }
  function rpQuery(d) { return { period: d.period, month: d.month, year: d.year }; }
  function rpDownload(btn) {
    var d = RP.d, old = btn.innerHTML; btn.disabled = true; btn.innerHTML = '⏳ Building PDF…';
    api('rp_pdf', rpQuery(d)).then(function (r) {
      if (!r || !r.success) { btn.disabled = false; btn.innerHTML = old; return toast((r && r.message) || 'Could not build the PDF.', 'warn'); }
      return window.st.saveFile(r.filename, r.pdf).then(function (s) {
        btn.disabled = false; btn.innerHTML = old;
        if (s && s.success) { toast('PDF saved', 'ok'); window.st.showInFolder(s.path); }
        else if (!(s && s.canceled)) toast((s && s.message) || 'Could not save the PDF.', 'warn');
      });
    });
  }
  function rpTelegram(btn) {
    var d = RP.d;
    if (!d.premium) return modal('<div class="px-h"><h3>🔒 Premium feature</h3><button data-close class="px-x">✕</button></div><p class="px-p">Sending the report to Telegram is a Premium feature. Downloading the PDF is free.</p><div class="px-btns"><button data-close class="px-sec">Not now</button><button id="rpUp" class="px-pri">Open upgrade page</button></div>',
      function (ov, close) { ov.querySelector('#rpUp').onclick = function () { window.st.openExternal('https://edurx.icu/studytrack/upgrade.php'); close(); }; });
    if (!d.telegram) return toast('Connect Telegram first: Reminders page → Telegram card.', 'warn');
    var old = btn.innerHTML; btn.disabled = true; btn.innerHTML = '⏳ Sending…';
    api('rp_telegram', rpQuery(d)).then(function (r) {
      btn.disabled = false; btn.innerHTML = old;
      toast((r && r.message) || 'Could not send the report.', r && r.success ? 'ok' : 'warn');
    });
  }
  function rpDraw(pc) {
    var d = RP.d, s = d.stats, pv = d.prev, t = theme();
    killCharts();
    var hero = '<div class="rp-hero"><div><span>' + esc(d.label) + '</span><h2>' + (s.total ? fmt(s.total) + ' of focused study' : 'No study recorded yet') + '</h2>' +
      '<p>' + (s.studyDays ? 'You studied on ' + s.studyDays + ' of ' + d.periodDays + ' day' + (d.periodDays === 1 ? '' : 's') + ' across ' + s.sessions + ' session' + (s.sessions === 1 ? '' : 's') + '.' : 'Log a session with the Focus Timer to start filling this report.') + '</p>' +
      (pv ? delta(s.total, pv.total) : '') + '</div><div class="rp-hero-s"><b>' + s.streak + '</b><span>🔥 day streak</span></div></div>';
    var tiles = '<div class="mp-tiles four">' + tile('⏱️', 'Total study time', fmt(s.total), '#6366f1') + tile('📅', 'Days studied', s.studyDays + ' <small>/ ' + d.periodDays + '</small>', '#06b6d4') + tile('⌀', 'Avg per study day', fmt(s.avgPerDay), '#f59e0b') + tile('✅', 'Tasks completed', s.tasksDone, '#10b981') + '</div>';
    var avgCard = '<div class="mp-tiles four">' + tile('📝', 'Exams taken', s.exams, '#a855f7') + tile('📈', 'Average mark', s.exams ? s.avgMark + '%' : '—', '#06b6d4') + tile('🏆', 'Achievements earned', d.achievements.length, '#f59e0b') + tile('🎯', 'Goals completed', d.goalsDone, '#10b981') + '</div>';
    var cmp = pv ? '<p class="mp-note rp-cmp">Previous period: ' + fmt(pv.total) + ' studied' + (pv.exams ? ' · average mark ' + pv.avgMark + '%' : '') + '</p>' : '';
    var daily = rpDaily(d);
    var subj = d.subjects.length ? d.subjects.map(function (x) { return '<div class="in-row"><span class="in-rn"><i class="mp-dot" style="background:' + x.color + '"></i>' + esc(x.name) + '</span><span class="in-rv">' + fmt(x.mins) + ' · ' + x.sessions + ' session' + (x.sessions === 1 ? '' : 's') + ' · ' + pctOf(x.mins, s.total) + '%</span>' + bar(pctOf(x.mins, d.subjects[0].mins), x.color) + '</div>'; }).join('') : note('No subject time recorded.');
    var tk = d.tasks, tkTot = tk.pending + tk.in_progress + tk.completed;
    var tasks = tkTot ? '<div class="rp-tk">' + [['Completed', tk.completed, '#10b981'], ['In progress', tk.in_progress, '#f59e0b'], ['Pending', tk.pending, '#6366f1']].map(function (r) { return '<div class="in-row"><span class="in-rn">' + r[0] + '</span><span class="in-rv">' + r[1] + '</span>' + bar(pctOf(r[1], tkTot), r[2]) + '</div>'; }).join('') + '</div>' : note('No tasks created in this period.');
    var goals = d.goals.length ? d.goals.map(function (g) { var p = pctOf(g.current, g.target); return '<div class="in-row"><span class="in-rn">' + esc(g.title) + (g.subject ? ' <em>· ' + esc(g.subject) + '</em>' : '') + '</span><span class="in-rv">' + p + '%' + (g.deadline ? ' · due ' + dShort(g.deadline) : '') + '</span>' + bar(p, '#a855f7') + '</div>'; }).join('') : note('No active goals. Set one in the Goals page.');
    var at = d.attendance, attHtml = at.rate == null ? note('No classes logged in this period.') : '<div class="mp-tiles four in-mt">' + tile('🏫', 'Attendance', at.rate + '%', at.rate >= 80 ? '#10b981' : '#f59e0b') + tile('✅', 'Attended', at.attended, '#10b981') + tile('❌', 'Missed', at.missed, '#ef4444') + tile('⏱️', 'Class hours', hrs(at.mins) + 'h', '#6366f1') + '</div>';
    var habits = d.habits.length ? d.habits.map(function (h) { return '<div class="in-row"><span class="in-rn">' + esc(h.icon || '•') + ' ' + esc(h.name) + '</span><span class="in-rv">' + h.done + ' day' + (h.done === 1 ? '' : 's') + ' · ' + h.pct + '%</span>' + bar(h.pct, h.color) + '</div>'; }).join('') : note('No habits yet.');
    var tl = d.tools, tools = '<div class="rp-chips">' + [['🃏', 'Flashcards reviewed', tl.flashcards], ['❓', 'Quizzes taken', tl.quizzes + (tl.quizzes ? ' · avg ' + tl.quizAvg + '%' : '')], ['📄', 'Past papers done', tl.papers], ['⏲️', 'Timed practice', tl.timed], ['📚', 'Syllabus topics done', tl.syllabus]].map(function (c) { return '<div><span>' + c[0] + '</span><b>' + c[2] + '</b><em>' + c[1] + '</em></div>'; }).join('') + '</div>';
    var ach = d.achievements.length ? '<div class="rp-ach">' + d.achievements.map(function (a) { return '<span>' + esc(a.icon || '🏆') + ' ' + esc(a.title) + '</span>'; }).join('') + '</div>' : note('No new achievements in this period.');
    var lb = d.library, lib = '<div class="rp-chips">' + [['📚', 'Subjects', lb.subjects], ['📝', 'Notes', lb.notes], ['🃏', 'Flashcards', lb.flashcards], ['📄', 'Past papers', lb.papers], ['🧠', 'Mind maps', lb.mindmaps], ['📎', 'Resources', lb.resources]].map(function (c) { return '<div><span>' + c[0] + '</span><b>' + c[2] + '</b><em>' + c[1] + '</em></div>'; }).join('') + '</div>';

    pc.innerHTML = '<div class="mp in rp">' + rpControls(d) + hero + tiles + avgCard + cmp +
      '<div class="in-grid">' + card('⏱️ Study time', daily.html, '<span class="in-badge">' + (d.period === 'year' || d.period === 'all' ? 'per month' : 'per day') + '</span>', 'in-wide') +
      card('📚 Subject breakdown', subj) + card('✅ Tasks', tasks) +
      card('📊 Exam results', rpMarks(d), '', 'in-wide') +
      card('🎯 Active goals', goals) + card('🔥 Habit consistency', habits) +
      card('🏫 Class attendance', attHtml, '', 'in-wide') +
      card('🧰 Study tools activity', tools) + card('🏆 Achievements earned', ach) +
      card('🗂️ Library snapshot', lib, '<span class="in-badge">all time</span>', 'in-wide') + '</div>' +
      '<p class="mp-note rp-foot">Generated by StudyTrack for ' + esc(d.name) + ' · ' + new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) + '</p></div>';

    onOff(pc, '#rpPer button', function (b) { if (RP.period === b.dataset.v) return; RP.period = b.dataset.v; lsSet('rpPeriod', RP.period); rpLoad(pc); });
    var pv2 = $('#rpPrev', pc), nx = $('#rpNext', pc);
    if (pv2) pv2.onclick = function () { rpStep(pc, -1); };
    if (nx) nx.onclick = function () { if (!nx.disabled) rpStep(pc, 1); };
    $('#rpPrint', pc).onclick = function () { window.print(); };
    $('#rpPdf', pc).onclick = function () { if (!this.disabled) rpDownload(this); };
    $('#rpTg', pc).onclick = function () { if (!this.disabled) rpTelegram(this); };
    if (daily.draw) daily.draw(pc, t);
  }
  function rpStep(pc, dir) {
    var d = RP.d;
    if (d.period === 'week') RP.week = addDays(d.weekStart, dir * 7);
    else if (d.period === 'month') { var m = d.month + dir, y = d.year; if (m < 1) { m = 12; y--; } if (m > 12) { m = 1; y++; } RP.month = m; RP.year = y; }
    else RP.year = d.year + dir;
    rpLoad(pc);
  }

  /* ════════════════════════════════════════════════════════════════════
     REFERRALS  (Refer & Earn)
     ════════════════════════════════════════════════════════════════════ */
  TITLES.referrals = 'Referrals';
  var RF = { d: null };
  var RF_MSG = 'Join me on StudyTrack — the free A/L study tracker! 📚';
  Pages.referrals = function (pc) {
    return api('rf_page').then(function (d) {
      if (!d || !d.success) return errPage(pc, d);
      RF.d = d; rfDraw(pc);
      setInterval(rfPoll, 30000);          /* stopped automatically when you leave the page */
    });
  };
  function rfPoll() {
    if (!here('referrals')) return;
    var o = RF.d; if (o.proGranted && o.premiumGranted) return;
    api('rf_page').then(function (d) {
      if (!d || !d.success || !here('referrals') || !pcEl()) return;
      var changed = d.verified !== o.verified || d.pending !== o.pending || d.proGranted !== o.proGranted || d.premiumGranted !== o.premiumGranted || d.referred.length !== o.referred.length;
      if (d.proGranted && !o.proGranted) toast('🎉 PRO Lifetime unlocked!', 'ok');
      if (d.premiumGranted && !o.premiumGranted) toast('👑 Premium Lifetime unlocked!', 'ok');
      if (changed) { RF.d = d; rfDraw(pcEl()); }
    });
  }
  function rfBanner(ico, title, sub, badge, c) {
    return '<div class="rf-ban" style="--c:' + c + '"><div class="rf-ban-i">' + ico + '</div><div><b>' + title + '</b><span>' + sub + '</span></div><em>' + badge + '</em></div>';
  }
  function rfDraw(pc) {
    var d = RF.d, barMax = Math.max(d.proTarget, d.premiumTarget), pct = Math.min(100, Math.round(d.verified / barMax * 100));
    var next = null, nextName = '';
    if (!d.proGranted && d.verified < d.proTarget) { next = d.proTarget; nextName = 'PRO'; }
    else if (!d.premiumGranted && d.verified < d.premiumTarget) { next = d.premiumTarget; nextName = 'Premium'; }
    var toGo = next !== null ? Math.max(0, next - d.verified) : 0;
    var banners = '';
    if (d.proGranted) banners += rfBanner('🏆', 'PRO Lifetime unlocked via referrals!', (d.proAt ? 'Earned on ' + fmtD(d.proAt) + ' — ' : '') + 'thank you for growing StudyTrack 💜', '⭐ PRO Lifetime', '#f59e0b');
    if (d.premiumGranted) banners += rfBanner('👑', 'Premium Lifetime unlocked via referrals!', (d.premiumAt ? 'Earned on ' + fmtD(d.premiumAt) + ' — ' : '') + 'Aurora &amp; Sakura themes and everything in Pro are yours 💜', '👑 Premium Lifetime', '#fbbf24');
    var steps = [['Share your link', 'Send your referral link to friends — WhatsApp, Telegram, wherever they will actually see it.'], ['They sign up', "Your friend creates a StudyTrack account using your link — it's linked to you automatically."],
      ['They become active', 'They verify their email and start using StudyTrack — then their referral turns <b>✅ Verified</b>.'], ['Unlock PRO, then Premium — free, forever', 'Reach <b>' + d.proTarget + '</b> verified referrals for <b>PRO Lifetime</b>, <b>' + d.premiumTarget + '</b> for <b>Premium Lifetime</b> (Aurora &amp; Sakura themes, 👑 badge). No payment, no expiry.']];
    var how = card('🚀 How it works', '<div class="rf-steps">' + steps.map(function (x, i) { return '<div><span' + (i === 3 ? ' class="g"' : '') + '>' + (i + 1) + '</span><div><b>' + x[0] + '</b><p>' + x[1] + '</p></div></div>'; }).join('') + '</div>');
    var share = card('🔗 Your referral link', '<p class="mp-note" style="margin-bottom:12px">Share this link — when someone signs up with it and becomes an active student, it counts toward your reward.</p>' +
      '<div class="rf-link"><input class="selectable" id="rfLink" readonly value="' + esc(d.link) + '"><button class="mp-add" id="rfCopy">📋 Copy link</button><button class="rp-b" id="rfCopyMsg">💬 Copy invite message</button></div>' +
      '<div class="rf-share"><button class="rp-b" data-s="wa">🟢 WhatsApp</button><button class="rp-b" data-s="tg">✈️ Telegram</button><button class="rp-b" data-s="fb">📘 Facebook</button><button class="rp-b" data-s="x">✖️ X</button></div>');
    var marks = [['⭐ PRO', d.proTarget, d.proGranted], ['👑 Premium', d.premiumTarget, d.premiumGranted]].map(function (m) {
      var left = Math.min(100, Math.round(m[1] / barMax * 100)), sh = left >= 100 ? '-100%' : '-50%';
      return (left < 100 ? '<i class="rf-tick" style="left:' + left + '%"></i>' : '') + '<span class="rf-ml' + (m[2] ? ' ok' : '') + '" style="left:' + left + '%;transform:translateX(' + sh + ')">' + m[0] + ' · ' + m[1] + (m[2] ? ' ✓' : '') + '</span>';
    }).join('');
    var prog = card('📈 Your progress', '<div class="rf-bar"><div class="mp-bar" style="height:12px"><i style="width:' + pct + '%;background:linear-gradient(135deg,#f59e0b,#f97316)"></i></div>' + marks + '</div>',
      '<span class="rf-count">' + d.verified + '/' + barMax + '</span>');
    var tiles = '<div class="mp-tiles">' + tile('✅', 'Verified', d.verified, '#10b981') + tile('⏳', 'Pending', d.pending, '#f59e0b') + tile(next !== null ? '🎯' : '🎉', next !== null ? 'To go for ' + nextName : 'All rewards unlocked', next !== null ? toGo : '🎉', '#6366f1') + '</div>';
    var list = d.referred.length ? '<div class="rf-list">' + d.referred.map(function (r) {
      var c = r.status === 'verified' ? '#10b981' : (r.status === 'rejected' ? '#ef4444' : '#06b6d4'), lb = r.status === 'verified' ? 'Verified' : (r.status === 'rejected' ? 'Rejected' : (r.review ? 'Under review' : 'Pending'));
      return '<div><div><b>' + esc(r.name) + '</b><span>' + esc(r.email) + ' · Joined ' + fmtD(r.joined) + '</span></div><em style="--c:' + c + '">' + lb + '</em></div>';
    }).join('') + '</div>' : '<p class="mp-note in-none">No referrals yet — share your link above to get started!</p>';
    pc.innerHTML = '<div class="mp in rf"><div class="mp-head"><p>Invite friends — unlock <b>PRO Lifetime</b> free at ' + d.proTarget + ' active students and <b>Premium Lifetime</b> at ' + d.premiumTarget + '</p></div>' +
      banners + how + share + prog + tiles + card('👥 Your referrals', list) + '</div>';
    var copy = function (t, m) { var done = function () { toast(m, 'ok'); }; try { navigator.clipboard.writeText(t).then(done, function () { $('#rfLink', pc).select(); document.execCommand('copy'); done(); }); } catch (e) { $('#rfLink', pc).select(); document.execCommand('copy'); done(); } };
    $('#rfCopy', pc).onclick = function () { copy(d.link, 'Referral link copied!'); };
    $('#rfCopyMsg', pc).onclick = function () { copy(RF_MSG + '\n' + d.link, 'Invite message copied!'); };
    $('#rfLink', pc).onclick = function () { this.select(); };
    var u = encodeURIComponent(d.link), t = encodeURIComponent(RF_MSG);
    var urls = { wa: 'https://wa.me/?text=' + encodeURIComponent(RF_MSG + '\n' + d.link), tg: 'https://t.me/share/url?url=' + u + '&text=' + t, fb: 'https://www.facebook.com/sharer/sharer.php?u=' + u, x: 'https://twitter.com/intent/tweet?url=' + u + '&text=' + t };
    onOff(pc, '.rf-share button', function (b) { window.st.openExternal(urls[b.dataset.s]); });
  }
  function fmtD(s) { return utc(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }); }

  /* ════════════════════════════════════════════════════════════════════
     STUDY HEATMAP
     ════════════════════════════════════════════════════════════════════ */
  TITLES.heatmap = 'Study Heatmap';
  var HM = { year: null, d: null };
  var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  Pages.heatmap = function (pc) { return hmLoad(pc); };
  function hmLoad(pc) {
    if (HM.d) pc.classList.add('in-busy');
    return api('hm_page', HM.year ? { year: HM.year } : {}).then(function (d) {
      pc.classList.remove('in-busy');
      if (!here('heatmap')) return;
      if (!d || !d.success) return errPage(pc, d);
      HM.d = d; HM.year = d.year; hmDraw(pc);
    });
  }
  function hmLevel(m) { return m >= 240 ? 5 : (m >= 180 ? 4 : (m >= 120 ? 3 : (m >= 60 ? 2 : (m > 0 ? 1 : 0)))); }
  function hmStats(d) {
    var keys = Object.keys(d.days).sort(), total = 0, best = null, wd = [0, 0, 0, 0, 0, 0, 0], longest = 0, run = 0, prev = null;
    keys.forEach(function (k) {
      var m = d.days[k][0]; total += m;
      if (!best || m > best.m) best = { k: k, m: m };
      wd[(utc(k).getUTCDay() + 6) % 7] += m;
      run = (prev && addDays(prev, 1) === k) ? run + 1 : 1; if (run > longest) longest = run; prev = k;
    });
    var cur = 0, c = d.today; if (!d.days[c]) c = addDays(c, -1);
    if (d.year === d.curYear) while (d.days[c]) { cur++; c = addDays(c, -1); }
    return { n: keys.length, total: total, avg: keys.length ? Math.round(total / keys.length) : 0, best: best, wd: wd, longest: longest, cur: cur };
  }
  function hmDraw(pc) {
    var d = HM.d, s = hmStats(d), y = d.year;
    /* grid: weeks start on Monday, first column contains Jan 1 */
    var jan1 = utc(y + '-01-01'), off = (jan1.getUTCDay() + 6) % 7, start = addDays(y + '-01-01', -off), end = y + '-12-31';
    var cells = '', labels = '', cols = 0, lastM = -1;
    for (var ds = start, i = 0; ; ds = addDays(ds, 1), i++) {
      if (ds > end && i % 7 === 0) break;
      var inYear = ds.slice(0, 4) === String(y), rec = d.days[ds], m = rec ? rec[0] : 0;
      cells += inYear ? '<i class="hl' + hmLevel(m) + (ds === d.today ? ' now' : '') + '" data-d="' + ds + '"></i>' : '<i class="x"></i>';
      if (i % 7 === 0) {
        var wkMonth = -1; for (var k = 0; k < 7; k++) { var dd = addDays(ds, k); if (dd.slice(0, 4) === String(y) && dd.slice(8) === '01') wkMonth = +dd.slice(5, 7) - 1; }
        labels += '<span>' + (wkMonth >= 0 && wkMonth !== lastM ? MON[wkMonth] : '') + '</span>'; if (wkMonth >= 0) lastM = wkMonth; cols++;
      }
    }
    var nav = '<div class="rp-nav"><button id="hmPrev"' + (y <= 2020 ? ' disabled' : '') + '>‹</button><span style="min-width:70px">' + y + '</span><button id="hmNext"' + (y >= d.curYear ? ' disabled' : '') + '>›</button></div>';
    var tiles = '<div class="mp-tiles four">' + tile('📅', 'Study days in ' + y, s.n, '#6366f1') + tile('⏱️', 'Total study time', fmt(s.total), '#10b981') + tile('⚡', 'Daily average', fmt(s.avg), '#f59e0b') +
      tile('🏆', 'Best single day', s.best ? fmt(s.best.m) + ' <small>' + dShort(s.best.k) + '</small>' : '—', '#a855f7') + '</div>';
    var tiles2 = '<div class="mp-tiles four">' + tile('🔥', 'Current streak', s.cur + (s.cur === 1 ? ' day' : ' days'), '#f59e0b') + tile('🏅', 'Longest streak', s.longest + (s.longest === 1 ? ' day' : ' days'), '#ef4444') +
      tile('📆', 'Best weekday', s.total ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][s.wd.indexOf(Math.max.apply(null, s.wd))] : '—', '#06b6d4') + tile('🗓️', 'Best month', s.total ? MON[d.monthly.indexOf(Math.max.apply(null, d.monthly))] : '—', '#10b981') + '</div>';
    var grid = card('📅 Study activity — ' + y, s.n || y !== d.curYear ? '<div class="hm-wrap"><div class="hm-days"><span></span><span>Mon</span><span></span><span>Wed</span><span></span><span>Fri</span><span></span></div><div><div class="hm-months" style="grid-template-columns:repeat(' + cols + ',var(--hs))">' + labels + '</div><div class="hm-grid" id="hmGrid">' + cells + '</div></div></div>' +
      '<div class="in-legend">Less <i class="hl0"></i><i class="hl1"></i><i class="hl2"></i><i class="hl3"></i><i class="hl4"></i><i class="hl5"></i> More <em>· 1h / 2h / 3h / 4h+ per day</em></div>' : '<div class="in-none mp-note">No study recorded in ' + y + ' yet.</div>', nav, 'hm-card');
    var mx = Math.max.apply(null, d.monthly.concat([1])), bm = d.monthly.indexOf(Math.max.apply(null, d.monthly));
    var months = card('📊 Monthly breakdown', '<div class="hm-mon">' + d.monthly.map(function (m, i) { return '<div><b>' + (m ? fmt(m) : '&nbsp;') + '</b><i class="' + (m && i === bm ? 'best' : '') + '" style="height:' + Math.max(4, Math.round(m / mx * 120)) + 'px"></i><span>' + MON[i] + '</span></div>'; }).join('') + '</div>',
      s.total ? '<span class="in-badge">Best: ' + MON[bm] + '</span>' : '');
    pc.innerHTML = '<div class="mp in hm"><div class="mp-head"><p>Every day you studied, at a glance</p></div>' + tiles + tiles2 + grid + months + '</div>';
    $('#hmPrev', pc).onclick = function () { HM.year = y - 1; hmLoad(pc); };
    $('#hmNext', pc).onclick = function () { if (y < d.curYear) { HM.year = y + 1; hmLoad(pc); } };
    var g = $('#hmGrid', pc), tip = null;
    if (g) {
      g.onmousemove = function (e) {
        var c = e.target.closest && e.target.closest('i[data-d]'); if (!c) { if (tip) tip.style.display = 'none'; return; }
        if (!tip) { tip = document.createElement('div'); tip.className = 'hm-tip'; document.body.appendChild(tip); }
        var rec = d.days[c.dataset.d];
        tip.innerHTML = '<b>' + utc(c.dataset.d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }) + '</b>' + (rec ? '<br>⏱️ ' + fmt(rec[0]) + ' studied<br>📚 ' + rec[1] + ' session' + (rec[1] === 1 ? '' : 's') : '<br><em>No study recorded</em>');
        tip.style.display = 'block'; tip.style.left = Math.min(window.innerWidth - 190, e.clientX + 14) + 'px'; tip.style.top = (e.clientY - 64) + 'px';
      };
      g.onmouseleave = function () { if (tip) tip.style.display = 'none'; };
      var obs = new MutationObserver(function () { if (!document.body.contains(g) && tip) { tip.remove(); obs.disconnect(); } }); obs.observe(document.getElementById('app') || document.body, { childList: true, subtree: true });
    }
  }
})();
