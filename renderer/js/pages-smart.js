/* StudyTrack Desktop - Smart Features Center (same tools / rules as the website's /smart/ folder).
   Pages: #/smart (hub), #/smart-today, #/smart-readiness, #/smart-predictor, #/smart-deadlines, #/smart-revision, #/smart-balance, #/smart-finish
   Data: pages10.php (action sm_all, one call for everything). Needs js/pages-extra.js (window.StUI). Styles: css/pages-smart.css */
(function () {
  var Pages = window.stPages, TITLES = window.stTitles, api = window.stApi, UI = window.StUI;
  if (!Pages || !api || !UI) return;
  var errPage = UI.errPage, lsGet = UI.lsGet, lsSet = UI.lsSet;
  var SITE = 'https://edurx.icu/studytrack';

  var FEATS = [
    { slug: 'today',     icon: '🎯', title: "Today's Smart Plan",    short: 'Today',     desc: 'Ranks your subjects by how much they need you today and splits your remaining goal minutes between them — with the reason for each pick.' },
    { slug: 'readiness', icon: '🎓', title: 'Exam Readiness Score',  short: 'Readiness', desc: 'A 0–100 readiness score per subject built from marks, syllabus coverage, study consistency, tasks and revision.' },
    { slug: 'predictor', icon: '🔮', title: 'Marks Predictor',       short: 'Predictor', desc: 'Trend line through your past results, projected to your next exam, with the gap to your target.' },
    { slug: 'deadlines', icon: '⏰', title: 'Deadline Guard',        short: 'Deadlines', desc: 'Tasks ranked by urgency × priority, plus a 7-day workload check that warns about overloaded days.' },
    { slug: 'revision',  icon: '🧠', title: 'Revision Radar',        short: 'Revision',  desc: 'Everything that is due for spaced-repetition review: syllabus topics, difficult topics and flashcard decks.' },
    { slug: 'balance',   icon: '⚖️', title: 'Study Balance & Habits', short: 'Balance',  desc: '8-week trend, best weekdays, goal hit-rate, streaks — and whether your time matches what each subject needs.' },
    { slug: 'finish',    icon: '🏁', title: 'Finish-by Forecast',    short: 'Finish',    desc: "Projects when you'll complete each subject's syllabus at your recent pace, and flags subjects that won't finish before the exam." }
  ];
  TITLES.smart = 'Smart Features Center';
  FEATS.forEach(function (f) { TITLES['smart-' + f.slug] = f.title; });

  function esc(s) { return E(String(s == null ? '' : s)); }
  function round(n) { return Math.round(+n || 0); }
  function band(score) {
    if (score === null || score === undefined) return ['No data', '#64748b'];
    if (score >= 80) return ['Strong', '#10b981'];
    if (score >= 60) return ['On track', '#38bdf8'];
    if (score >= 40) return ['Needs work', '#f59e0b'];
    return ['At risk', '#ef4444'];
  }
  function fdate(s, withYear) { var d = new Date(String(s).slice(0, 10) + 'T00:00:00'); return d.toLocaleDateString('en-US', withYear ? { month: 'short', day: 'numeric', year: 'numeric' } : { month: 'short', day: 'numeric' }); }
  /* a link inside the app when the page exists in the desktop app, otherwise the website in the browser */
  function link(route, label, cls) {
    if (Pages[route] || route === 'dashboard') return '<a class="' + (cls || 'sm-link') + '" href="#/' + route + '">' + label + '</a>';
    return '<a class="' + (cls || 'sm-link') + '" href="' + SITE + '/' + route + '" target="_blank" rel="noopener">' + label + '</a>';
  }
  function hrefOf(h) { return h === 'subjects' ? '#/subjects' : '#/smart-' + h; }

  function nav(active) {
    var o = '<nav class="sm-nav"><a class="sm-nav-home' + (active === '' ? ' on' : '') + '" href="#/smart">✨ Smart Center</a>';
    FEATS.forEach(function (f) { o += '<a class="' + (active === f.slug ? 'on' : '') + '" href="#/smart-' + f.slug + '">' + f.icon + ' ' + f.short + '</a>'; });
    return o + '</nav>';
  }
  function head(icon, title, sub) { return '<div class="sm-title">' + icon + ' ' + esc(title) + '</div><div class="sm-sub">' + sub + '</div>'; }
  function kpi(label, val, sub, color) { return '<div class="sm-kpi"><small>' + esc(label) + '</small><b' + (color ? ' style="color:' + color + '"' : '') + '>' + val + '</b><span>' + sub + '</span></div>'; }
  function dot(c) { return '<span class="sm-dot" style="--c:' + esc(c) + '"></span>'; }
  function pill(text, c) { return '<span class="sm-pill" style="--c:' + esc(c) + '">' + esc(text) + '</span>'; }

  /* ── load + frame ─────────────────────────────────────────────────── */
  var cache = { d: null, at: 0 };
  function load(pc, slug, render) {
    return api('sm_all').then(function (d) {
      if (!d || !d.success) return errPage(pc, d);
      if (!d.pro) return lock(pc);
      cache.d = d; cache.at = Date.now();
      pc.innerHTML = '<div class="sm-wrap">' + nav(slug) + render(d) + '</div>';
      after(pc, d);
    });
  }
  function lock(pc) {
    pc.innerHTML = '<div class="mp"><div class="spl-lock"><i class="spl-sp s1"></i><i class="spl-sp s2"></i><i class="spl-sp s3"></i>' +
      '<div class="spl-lock-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/><path d="M12 14v3"/></svg></div>' +
      '<div class="spl-badge">✦ Pro Feature</div><h1>Smart Features Center is <span>Pro Only</span></h1>' +
      '<p>Unlock advanced study intelligence that uses your StudyTrack data to help you decide what to study next.</p>' +
      '<div class="spl-chips"><span>✨ Smart Study Plan</span><span>📚 Exam Readiness</span><span>📈 Marks Predictor</span><span>🎯 Revision Radar</span><span>⏰ Deadline Guard</span><span>⚖️ Study Balance</span></div>' +
      '<div class="spl-lock-b"><button class="mp-add" id="smUp">Upgrade to Pro →</button></div></div></div>';
    pc.querySelector('#smUp').onclick = function () { window.st.openExternal(SITE + '/upgrade.php'); };
  }
  function after(pc, d) {
    /* "Today's plan" tick boxes are remembered on this PC only (same as the website) */
    pc.querySelectorAll('.sm-check').forEach(function (l) {
      var k = l.getAttribute('data-key'), cb = l.querySelector('input');
      if (lsGet(k, '') === '1') { cb.checked = true; l.classList.add('done'); }
      cb.addEventListener('change', function () { l.classList.toggle('done', cb.checked); lsSet(k, cb.checked ? '1' : '0'); });
    });
  }

  /* ── HUB ───────────────────────────────────────────────────────────── */
  Pages.smart = function (pc) {
    return load(pc, '', function (d) {
      var rd = d.readiness, b = band(rd);
      var o = head('✨', 'Smart Features Center', 'Tools that read your own study data and tell you what to do next — no guesswork, no AI credits used.');
      o += '<div class="sm-kpis">' +
        kpi('Exam readiness', rd === null ? '—' : rd, esc(b[0]), b[1]) +
        kpi('Study streak', d.streak + ' 🔥', 'Best: ' + d.best_streak + ' days') +
        kpi('Today', d.today_min + '<span style="font-size:14px"> / ' + d.goal + ' min</span>', d.today_min >= d.goal ? 'Goal reached ✅' : Math.max(0, d.goal - d.today_min) + ' min to go') +
        (d.exam ? kpi(d.exam.exam_name, d.exam.days_left, 'days left') : '') + '</div>';
      o += '<div class="sm-cat">Smart alerts</div>';
      if (!d.alerts.length) o += '<div class="sm-card sm-empty">All clear — nothing needs your attention right now. 🎉</div>';
      d.alerts.forEach(function (a) {
        o += '<' + (a.href ? 'a href="' + hrefOf(a.href) + '"' : 'div') + ' class="sm-alert ' + esc(a.lvl) + '"><div class="ic">' + a.icon + '</div><div><b>' + esc(a.title) + '</b><span>' + esc(a.text) + '</span></div></' + (a.href ? 'a' : 'div') + '>';
      });
      o += '<div class="sm-cat" style="margin-top:24px">Smart tools</div><div class="sm-grid">';
      FEATS.forEach(function (f) {
        var chip = d.chips[f.slug];
        o += '<a class="sm-fcard" href="#/smart-' + f.slug + '"><div class="ic">' + f.icon + '</div><h4>' + esc(f.title) + '</h4><p>' + esc(f.desc) + '</p>' + (chip ? '<span class="sm-chip">' + esc(chip) + '</span>' : '') + '</a>';
      });
      return o + '</div>';
    });
  };

  /* ── TODAY ─────────────────────────────────────────────────────────── */
  Pages['smart-today'] = function (pc) {
    return load(pc, 'today', function (d) {
      var pl = d.plan;
      var o = head('🎯', "Today's Smart Plan", "Built from your marks, gaps in the syllabus, how long each subject has been ignored, and what's due soon.");
      o += '<div class="sm-kpis">' + kpi('Daily goal', d.goal + ' min', 'set in Settings') +
        kpi('Done today', d.today_min + ' min', d.today_min >= d.goal ? 'Goal reached ✅' : 'Keep going') +
        kpi('Still to plan', pl.remaining + ' min', 'split across focus subjects') + '</div>';
      if (!pl.items.length) {
        o += '<div class="sm-card sm-empty">Add a few subjects and log some study sessions — then this page can plan your day.<br><br>' + link('subjects', 'Add subjects', 'sm-btn') + '</div>';
      } else {
        if (pl.remaining === 0) o += '<div class="sm-alert good"><div class="ic">✅</div><div><b>Daily goal already reached</b><span>Anything more is a bonus. Here\'s where extra time would help most.</span></div></div>';
        o += '<div class="sm-card"><h3>Focus subjects (tick them off as you go)</h3>';
        pl.items.forEach(function (it) {
          o += '<div class="sm-row" style="align-items:flex-start"><label class="sm-check" data-key="smart_plan_' + esc(d.today) + '_' + it.id + '" style="flex:1"><input type="checkbox"><div>' +
            '<div class="sm-t">' + '<span class="sm-dot" style="display:inline-block;margin-right:6px;--c:' + esc(it.color) + '"></span>' + '<b style="color:var(--text-primary)">' + esc(it.name) + '</b>' +
            '<span style="margin-left:8px">' + pill(it.rd_label + (it.rd_score !== null ? ' · ' + it.rd_score : ''), it.rd_color) + '</span></div>' +
            '<ul class="sm-why">' + it.why.map(function (w) { return '<li>' + esc(w) + '</li>'; }).join('') + '</ul></div></label>' +
            '<div class="sm-mins">' + (it.minutes ? it.minutes + '<span style="font-size:12px;color:var(--text-muted)"> min</span>' : '—') + '</div></div>';
        });
        o += '<div class="sm-note">Priority = 35% weak marks · 25% days since last study · 20% syllabus not covered · 20% urgent tasks. Ticks are saved on this PC only.</div>' +
          '<div class="sm-actions">' + link('pomodoro', '▶ Start a focus session', 'sm-btn') + link('study-log', 'Log a session', 'sm-btn ghost') + '</div></div>';
      }
      o += '<div class="sm-grid-2"><div class="sm-card"><h3>⏰ Due today / tomorrow / overdue</h3>';
      if (!d.focus_tasks.length) o += '<div class="sm-empty" style="padding:10px">Nothing urgent 🎉</div>';
      d.focus_tasks.forEach(function (t) {
        var od = t.due_date < d.today;
        o += '<div class="sm-row">' + dot(t.color) + '<div style="flex:1"><b class="sm-tt">' + esc(t.title) + '</b><div class="sm-muted">' + esc(t.subject || 'General') + '</div></div>' +
          pill(od ? 'Overdue' : (t.due_date === d.today ? 'Today' : 'Tomorrow'), od ? '#ef4444' : '#f59e0b') + '</div>';
      });
      o += '<div style="margin-top:10px"><a class="sm-link" href="#/smart-deadlines">Open Deadline Guard →</a></div></div>' +
        '<div class="sm-card"><h3>🧠 Revision waiting</h3>' +
        '<div class="sm-row"><b class="sm-mins" style="text-align:left">' + d.fc_due + '</b><span class="sm-muted">flashcards due</span></div>' +
        '<div class="sm-row"><b class="sm-mins" style="text-align:left">' + d.syl_overdue + '</b><span class="sm-muted">syllabus topics due for review</span></div>' +
        '<div style="margin-top:10px"><a class="sm-link" href="#/smart-revision">Open Revision Radar →</a></div></div></div>';
      return o;
    });
  };

  /* ── READINESS ─────────────────────────────────────────────────────── */
  Pages['smart-readiness'] = function (pc) {
    return load(pc, 'readiness', function (d) {
      var subs = d.subjects.slice().sort(function (a, b) { return (a.readiness.score === null ? 999 : a.readiness.score) - (b.readiness.score === null ? 999 : b.readiness.score); });
      var o = head('🎓', 'Exam Readiness Score', "A blended score from what you've actually done — weakest subjects first.");
      if (!subs.length) return o + '<div class="sm-card sm-empty">No subjects yet. ' + link('subjects', 'Add subjects →') + '</div>';
      var ov = d.readiness, ob = band(ov);
      o += '<div class="sm-card sm-hero" style="--c:' + ob[1] + '"><div><div class="sm-muted">Overall readiness</div><div class="sm-score" style="font-size:56px">' + (ov === null ? '—' : ov) +
        '<span style="font-size:18px;color:var(--text-muted)">/100</span></div>' + pill(ob[0], ob[1]) + '</div>';
      if (d.exam) o += '<div style="flex:1;min-width:220px"><div class="sm-muted">' + esc(d.exam.exam_name) + '</div><div style="font-size:15px;color:var(--text-primary);margin-top:4px"><b>' + d.exam.days_left +
        ' days</b> left (' + fdate(d.exam.exam_date, true) + ')</div><div class="sm-note">Focus your time on the red and amber subjects below.</div></div>';
      o += '</div><div class="sm-grid">';
      subs.forEach(function (s) {
        var rd = s.readiness;
        o += '<div class="sm-card" style="--c:' + esc(rd.color) + '"><div class="sm-spread"><div style="display:flex;align-items:center;gap:8px">' + dot(s.color) + '<b style="color:var(--text-primary)">' + esc(s.name) + '</b></div>' + pill(rd.label, rd.color) + '</div>';
        if (rd.score === null) o += '<div class="sm-empty" style="padding:14px 0">No data yet — log a session, add marks or syllabus topics for this subject.</div>';
        else o += '<div class="sm-score" style="margin:8px 0 6px">' + rd.score + '<span style="font-size:14px;color:var(--text-muted)">/100</span></div>';
        rd.parts.forEach(function (p) {
          o += '<div style="margin:8px 0"><div class="sm-spread" style="font-size:12px;color:var(--text-secondary)"><span>' + esc(p.label) + '</span><span>' + round(p.v) + '%</span></div>' +
            '<div class="sm-bar"><i style="width:' + Math.round(Math.max(2, Math.min(100, p.v))) + '%"></i></div></div>';
        });
        o += '<div class="sm-note">Target ' + round(s.target) + '%' + (s.recent_avg !== null ? ' · recent average ' + round(s.recent_avg) + '%' : ' · no marks yet') + (s.syl_total ? '' : ' · no syllabus topics added') + '</div></div>';
      });
      return o + '</div><div class="sm-note">Weights: marks 40 · syllabus 25 · study consistency 20 · tasks 10 · revision 5. If a signal has no data (e.g. no marks yet) it is skipped and the rest are re-weighted. Subjects without a custom target use the 75% A-grade line.</div>';
    });
  };

  /* ── PREDICTOR ─────────────────────────────────────────────────────── */
  function spark(s) {
    var W = 300, H = 90, px = 8, py = 8, pr = s.pred, marks = s.marks;
    var maxX = Math.max(marks[marks.length - 1].x, pr ? pr.xNext : 0, 1);
    function X(x) { return px + (W - 2 * px) * (x / maxX); }
    function Y(y) { return H - py - (H - 2 * py) * (Math.max(0, Math.min(100, y)) / 100); }
    var o = '<svg viewBox="0 0 ' + W + ' ' + H + '" class="sm-spark" preserveAspectRatio="none">';
    o += '<line x1="0" x2="' + W + '" y1="' + Y(s.target) + '" y2="' + Y(s.target) + '" stroke="#f59e0b" stroke-width="1" stroke-dasharray="4 4" opacity=".7"/>';
    o += '<polyline fill="none" stroke="' + esc(s.color) + '" stroke-width="2" points="' + marks.map(function (m) { return X(m.x).toFixed(1) + ',' + Y(m.pct).toFixed(1); }).join(' ') + '"/>';
    if (pr) {
      var l = marks[marks.length - 1];
      o += '<line x1="' + X(l.x).toFixed(1) + '" y1="' + Y(l.pct).toFixed(1) + '" x2="' + X(pr.xNext).toFixed(1) + '" y2="' + Y(pr.pred).toFixed(1) + '" stroke="' + esc(s.color) + '" stroke-width="2" stroke-dasharray="3 4"/>';
      o += '<circle cx="' + X(pr.xNext).toFixed(1) + '" cy="' + Y(pr.pred).toFixed(1) + '" r="4" fill="none" stroke="' + esc(s.color) + '" stroke-width="2"/>';
    }
    marks.forEach(function (m) { o += '<circle cx="' + X(m.x).toFixed(1) + '" cy="' + Y(m.pct).toFixed(1) + '" r="3" fill="' + esc(s.color) + '"/>'; });
    return o + '</svg>';
  }
  Pages['smart-predictor'] = function (pc) {
    return load(pc, 'predictor', function (d) {
      var o = head('🔮', 'Marks Predictor', "A straight-line trend through each subject's past results, projected " + (d.exam ? 'to <b>' + esc(d.exam.exam_name) + '</b>' : 'to your next exam') + '. Dashed amber line = your target.');
      var withMarks = d.subjects.filter(function (s) { return s.marks.length >= 1; });
      if (!withMarks.length) return o + '<div class="sm-card sm-empty">No marks recorded yet. Add exam results to see predictions.<br><br>' + link('marks', 'Add marks', 'sm-btn') + '</div>';
      o += '<div class="sm-grid">';
      withMarks.forEach(function (s) {
        var last = s.marks[s.marks.length - 1], avg = s.marks.reduce(function (a, m) { return a + m.pct; }, 0) / s.marks.length, pr = s.pred;
        o += '<div class="sm-card"><div style="display:flex;align-items:center;gap:8px">' + dot(s.color) + '<b style="color:var(--text-primary)">' + esc(s.name) + '</b><span class="sm-muted" style="margin-left:auto">' + s.marks.length + ' result' + (s.marks.length > 1 ? 's' : '') + '</span></div>';
        if (pr) {
          var gap = pr.pred - s.target, up = pr.slope_month >= 0;
          o += spark(s) +
            '<div class="sm-row"><span class="sm-muted" style="flex:1">Latest / average</span><b>' + round(last.pct) + '% / ' + round(avg) + '%</b></div>' +
            '<div class="sm-row"><span class="sm-muted" style="flex:1">Trend</span><b style="color:' + (Math.abs(pr.slope_month) < 1 ? '#94a3b8' : (up ? '#10b981' : '#ef4444')) + '">' + (up ? '▲' : '▼') + ' ' + Math.abs(pr.slope_month).toFixed(1) + ' pts / month</b></div>' +
            '<div class="sm-row"><span class="sm-muted" style="flex:1">Projected (' + fdate(pr.at) + ')</span><b style="font-size:18px">' + round(pr.pred) + '%</b></div>' +
            '<div class="sm-row"><span class="sm-muted" style="flex:1">vs ' + round(s.target) + '% target</span><b style="color:' + (gap >= 0 ? '#10b981' : '#f59e0b') + '">' + (gap >= 0 ? 'On track (+' + round(gap) + ')' : round(-gap) + ' pts short') + '</b></div>' +
            '<div class="sm-note">Confidence: ' + pr.conf + ' (' + pr.n + ' results' + (pr.sd >= 12 ? ', scores vary a lot' : '') + ').</div>';
        } else {
          o += '<div class="sm-row"><span class="sm-muted" style="flex:1">Latest</span><b>' + round(last.pct) + '% (' + esc(last.name) + ')</b></div><div class="sm-note">Add at least one more result (on a different date) to unlock the trend line.</div>';
        }
        o += '</div>';
      });
      return o + '</div><div class="sm-note">This is a simple linear projection of your own results — a guide, not a guarantee. It is more reliable with 5+ results and gets capped at ~6 months ahead.</div>';
    });
  };

  /* ── DEADLINES ─────────────────────────────────────────────────────── */
  Pages['smart-deadlines'] = function (pc) {
    return load(pc, 'deadlines', function (d) {
      var open = d.deadlines.open, load7 = d.deadlines.load;
      var groups = [['Overdue', '#ef4444'], ['Next 48 hours', '#f59e0b'], ['This week', '#38bdf8'], ['Later', '#64748b'], ['No due date', '#64748b']], by = {};
      groups.forEach(function (g) { by[g[0]] = []; });
      open.forEach(function (t) { var k = t.days === null ? 'No due date' : (t.days < 0 ? 'Overdue' : (t.days <= 2 ? 'Next 48 hours' : (t.days <= 7 ? 'This week' : 'Later'))); by[k].push(t); });
      var maxLoad = Math.max.apply(null, load7.map(function (x) { return x.n; }).concat([1]));
      var heavy = load7.filter(function (x) { return x.n >= 4; });
      var o = head('⏰', 'Deadline Guard', 'Open tasks ranked by <b>priority × urgency</b> — the top of the list is what to do first.');
      o += '<div class="sm-card"><h3>Next 7 days workload</h3><div class="sm-cols">';
      load7.forEach(function (x) {
        var over = x.n >= 4;
        o += '<div class="sm-col"><b style="color:' + (over ? '#ef4444' : 'var(--text-secondary)') + '">' + x.n + '</b><i style="height:' + Math.max(3, round(x.n / maxLoad * 100)) + '%;' + (over ? 'background:#ef4444' : '') + '"></i><span>' + esc(x.label) + '</span></div>';
      });
      o += '</div><div class="sm-note">' + (heavy.length ? '⚠️ ' + heavy.map(function (x) { return esc(x.long); }).join(', ') + ' look overloaded (4+ tasks due) — move some earlier.' : 'No overloaded days coming up.') +
        (by['Overdue'].length ? ' · ' + by['Overdue'].length + ' overdue task(s) not counted above.' : '') + '</div></div>';
      if (!open.length) return o + '<div class="sm-card sm-empty">No open tasks. 🎉 ' + link('tasks', 'Add a task →') + '</div>';
      groups.forEach(function (g) {
        var list = by[g[0]]; if (!list.length) return;
        o += '<div class="sm-card"><h3>' + pill(g[0], g[1]) + ' <span class="sm-muted">· ' + list.length + '</span></h3>';
        list.forEach(function (t) {
          o += '<div class="sm-row">' + dot(t.color) + '<div style="flex:1"><b class="sm-tt">' + esc(t.title) + '</b><div class="sm-muted">' + esc(t.subject || 'General') + ' · ' + esc((t.priority || 'medium').charAt(0).toUpperCase() + (t.priority || 'medium').slice(1)) +
            ' priority' + (t.due_date ? ' · due ' + fdate(t.due_date) : '') + '</div></div><span class="sm-muted" style="font-size:12px">' + (t.days === null ? '' : (t.days < 0 ? (-t.days) + 'd late' : (t.days === 0 ? 'today' : t.days + 'd left'))) + '</span></div>';
        });
        o += '</div>';
      });
      return o + link('tasks', 'Manage tasks →');
    });
  };

  /* ── REVISION ──────────────────────────────────────────────────────── */
  Pages['smart-revision'] = function (pc) {
    return load(pc, 'revision', function (d) {
      var r = d.revision;
      var o = head('🧠', 'Revision Radar', 'What your memory is about to forget — from your spaced-repetition schedule.');
      o += '<div class="sm-kpis">' + kpi('Topics due', r.due.length, 'syllabus review') + kpi('Flashcards due', d.fc_due, 'across ' + r.decks.length + ' deck' + (r.decks.length === 1 ? '' : 's')) + kpi('Difficult, not done', r.hard.length, 'topics you flagged') + '</div>';
      o += '<div class="sm-grid-2"><div class="sm-card"><h3>📚 Syllabus topics to review</h3>';
      if (!r.review_cols) o += '<div class="sm-empty">Revision schedule not set up yet — open the Syllabus page once and it will start tracking review dates.</div>';
      else if (!r.due.length) o += '<div class="sm-empty">Nothing due. 🎉</div>';
      else r.due.forEach(function (t) {
        var c = t.late >= 7 ? '#ef4444' : (t.late >= 3 ? '#f59e0b' : '#38bdf8');
        o += '<div class="sm-row">' + dot(t.color) + '<div style="flex:1"><b class="sm-tt">' + esc(t.topic_name) + (+t.is_difficult ? ' ⭐' : '') + '</b><div class="sm-muted">' + esc(t.sname) + (t.unit_name ? ' · ' + esc(t.unit_name) : '') + '</div></div>' + pill(t.late ? t.late + 'd overdue' : 'due today', c) + '</div>';
      });
      o += '<div style="margin-top:10px">' + link('syllabus', 'Open Syllabus →') + '</div></div><div>' +
        '<div class="sm-card"><h3>🃏 Flashcard decks due</h3>';
      if (!r.decks.length) o += '<div class="sm-empty" style="padding:10px">No cards due.</div>';
      r.decks.forEach(function (x) { o += '<div class="sm-row"><span style="flex:1;color:var(--text-primary);font-size:13.5px">' + esc(x.deck_name) + '</span>' + pill(x.c + ' due', '#6366f1') + '</div>'; });
      o += '<div style="margin-top:10px">' + link('notes', 'Start reviewing →') + '</div></div>' +
        '<div class="sm-card"><h3>⭐ Difficult topics not finished</h3>';
      if (!r.hard.length) o += '<div class="sm-empty" style="padding:10px">None flagged.</div>';
      r.hard.forEach(function (t) { o += '<div class="sm-row">' + dot(t.color) + '<div style="flex:1"><b class="sm-tt">' + esc(t.topic_name) + '</b><div class="sm-muted">' + esc(t.sname) + '</div></div></div>'; });
      return o + '</div></div></div>';
    });
  };

  /* ── BALANCE ───────────────────────────────────────────────────────── */
  Pages['smart-balance'] = function (pc) {
    return load(pc, 'balance', function (d) {
      var b = d.balance, names = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      var maxW = Math.max.apply(null, b.weeks.map(function (w) { return w.min; }).concat([1]));
      var maxD = Math.max.apply(null, b.wd.concat([1])), wdMax = Math.max.apply(null, b.wd);
      var o = head('⚖️', 'Study Balance & Habits', "How consistent you are — and whether your time goes where it's needed most.");
      o += '<div class="sm-kpis">' + kpi('Current streak', d.streak + ' 🔥', 'Best: ' + d.best_streak + ' days') +
        kpi('Goal hit-rate (30d)', round(b.hit / 30 * 100) + '%', b.hit + ' of 30 days ≥ ' + d.goal + ' min') +
        kpi('Active days (30d)', b.active30, 'days with any study') +
        kpi('Best weekday', wdMax > 0 ? names[b.best_day - 1] : '—', wdMax > 0 ? wdMax + ' min average' : 'log more sessions') + '</div>';
      o += '<div class="sm-grid-2"><div class="sm-card"><h3>Hours per week (last 8 weeks)</h3><div class="sm-cols">';
      b.weeks.forEach(function (w) { o += '<div class="sm-col"><b style="color:var(--text-secondary);font-size:11px">' + (w.min ? Math.round(w.min / 6) / 10 : 0) + 'h</b><i style="height:' + Math.max(3, round(w.min / maxW * 100)) + '%"></i><span>' + esc(w.label) + '</span></div>'; });
      o += '</div></div><div class="sm-card"><h3>Average minutes by weekday</h3><div class="sm-cols">';
      b.wd.forEach(function (v, i) { o += '<div class="sm-col"><b style="color:var(--text-secondary);font-size:11px">' + v + '</b><i style="height:' + Math.max(3, round(v / maxD * 100)) + '%;' + ((i + 1 === b.best_day && v > 0) ? '' : 'opacity:.55') + '"></i><span>' + names[i] + '</span></div>'; });
      o += '</div></div></div><div class="sm-card"><h3>Where your time went vs where it\'s needed (last 30 days)</h3>';
      if (!b.share.length) o += '<div class="sm-empty">Add subjects to see this.</div>';
      else if (!b.tot30) o += '<div class="sm-empty">No sessions in the last 30 days.</div>';
      else {
        b.share.forEach(function (s) {
          var f = s.diff <= -10 ? ['Under-studied', '#f59e0b'] : (s.diff >= 15 ? ['Over-weighted', '#38bdf8'] : ['Balanced', '#10b981']);
          o += '<div class="sm-row" style="flex-wrap:wrap">' + dot(s.color) + '<div style="flex:1;min-width:130px"><b class="sm-tt">' + esc(s.name) + '</b><div class="sm-muted">' + (Math.round(s.m30 / 6) / 10) + 'h studied</div></div>' +
            '<div style="flex:2;min-width:170px"><div class="sm-spread" style="font-size:11.5px;color:var(--text-muted)"><span>Actual ' + s.actual + '%</span><span>Needed ~' + s.ideal + '%</span></div>' +
            '<div class="sm-bar" style="position:relative;--c:' + esc(s.color) + '"><i style="width:' + s.actual + '%"></i><span style="position:absolute;top:-2px;bottom:-2px;left:' + s.ideal + '%;width:2px;background:#f59e0b"></span></div></div>' + pill(f[0], f[1]) + '</div>';
        });
        o += '<div class="sm-note">"Needed" share = weaker marks and unfinished syllabus get more weight. The amber tick marks the suggested share.</div>';
      }
      return o + '</div>';
    });
  };

  /* ── FINISH-BY ─────────────────────────────────────────────────────── */
  Pages['smart-finish'] = function (pc) {
    return load(pc, 'finish', function (d) {
      var f = d.finish, rows = f.rows;
      var o = head('🏁', 'Finish-by Forecast', "At your last-30-days completion pace, when you'll finish each subject's syllabus" + (f.exam_name ? ' — checked against <b>' + esc(f.exam_name) + '</b>' : '') + '.');
      if (!rows.length) return o + '<div class="sm-card sm-empty">No syllabus topics added yet for any subject.<br><br>' + link('syllabus', 'Add syllabus topics', 'sm-btn') + '</div>';
      var behind = rows.filter(function (r) { return r.status === 'behind'; }).length, remain = rows.reduce(function (a, r) { return a + r.remaining; }, 0);
      o += '<div class="sm-kpis">' + kpi('Topics remaining', remain, 'across ' + rows.length + ' subject' + (rows.length === 1 ? '' : 's')) +
        kpi('Behind schedule', behind, behind ? "won't finish in time" : 'none — nice work', behind ? '#ef4444' : '#10b981') +
        (f.exam_name ? kpi(f.exam_name, f.days_left, 'days left') : '') + '</div><div class="sm-grid">';
      rows.forEach(function (r) {
        o += '<div class="sm-card"><div style="display:flex;align-items:center;gap:8px">' + dot(r.color) + '<b style="color:var(--text-primary)">' + esc(r.name) + '</b><span class="sm-muted" style="margin-left:auto">' + r.done + '/' + r.total + ' topics</span></div>' +
          '<div class="sm-bar" style="margin:10px 0;--c:' + esc(r.color) + '"><i style="width:' + r.pct + '%"></i></div>';
        if (r.status === 'done') o += '<div class="sm-row"><span class="sm-muted" style="flex:1">Status</span><b style="color:#10b981">🎉 Syllabus fully covered</b></div>';
        else if (r.status === 'stalled') o += '<div class="sm-row"><span class="sm-muted" style="flex:1">Remaining</span><b>' + r.remaining + ' topics</b></div><div class="sm-note">No topics marked done in the last 30 days — can\'t project a finish date yet. Cover a few topics on the Syllabus page to unlock this.</div>';
        else {
          o += '<div class="sm-row"><span class="sm-muted" style="flex:1">Remaining</span><b>' + r.remaining + ' topics</b></div>' +
            '<div class="sm-row"><span class="sm-muted" style="flex:1">Recent pace</span><b>' + r.rate_week.toFixed(1) + ' topics / week</b></div>' +
            '<div class="sm-row"><span class="sm-muted" style="flex:1">Projected finish</span><b>' + fdate(r.finish_date, true) + '</b></div>';
          if (r.status === 'on_track') o += '<div class="sm-row"><span class="sm-muted" style="flex:1">vs exam date</span><b style="color:#10b981">✅ On track</b></div>';
          else if (r.status === 'behind') o += '<div class="sm-row"><span class="sm-muted" style="flex:1">vs exam date</span><b style="color:#ef4444">' + r.late_days + ' days late</b></div>';
        }
        o += '</div>';
      });
      return o + '</div><div class="sm-note">Pace is your average topic-completion rate over the last 30 days — a quiet week (exams, holidays) will push the projection out, and a busy week will pull it in. Add an exam date under A/L Exam Dates to see the on-track / behind check.</div>';
    });
  };
})();
