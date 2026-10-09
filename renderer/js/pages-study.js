/* StudyTrack Desktop - Goals, Past Papers, Notes & Flashcards, Daily Battle pages.
 * Native app pages (same look as Marks / Tasks / Habits). Data: pages3.php (actions gl_*, pp_*, nt_*, bt_*).
 * Needs js/pages-extra.js (window.StUI helpers) to be loaded first. */
(function () {
  var Pages = window.stPages, TITLES = window.stTitles, api = window.stApi, UI = window.StUI;
  if (!Pages || !api || !UI) return;
  var toast = UI.toast, modal = UI.modal, errPage = UI.errPage, $ = UI.$, lsGet = UI.lsGet, lsSet = UI.lsSet;
  TITLES.goals = 'Goals'; TITLES['past-papers'] = 'Past Papers'; TITLES.notes = 'Notes & Flashcards'; TITLES['daily-battle'] = 'Daily Battle';

  var TRASH = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>';
  var PALETTE = ['#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f97316', '#f59e0b', '#10b981', '#14b8a6', '#06b6d4', '#3b82f6'];

  /* ── helpers ─────────────────────────────────────────────────────────── */
  function esc(s) { return E(String(s == null ? '' : s)); }
  function r1(n) { return Math.round(n * 10) / 10; }
  function here(route) { return location.hash.indexOf('#/' + route) === 0; }
  function pcEl() { return document.getElementById('pageContent'); }
  function plural(n, w) { return n + ' ' + w + (n === 1 ? '' : 's'); }
  function fmtDate(s) { return new Date(s + 'T00:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }); }
  function daysBetween(a, b) { return Math.round((new Date(b + 'T00:00:00Z') - new Date(a + 'T00:00:00Z')) / 86400000); }
  function cssVar(n, d) { var v = getComputedStyle(document.documentElement).getPropertyValue(n).trim(); return v || d; }
  function subOptions(list, sel, ph) {
    return (ph ? '<option value="0">' + ph + '</option>' : '') + list.map(function (s) { return '<option value="' + s.id + '"' + (s.id === sel ? ' selected' : '') + '>' + esc(s.name) + '</option>'; }).join('');
  }
  function emptyBlock(ico, h, p, btn) { return '<div class="mp-empty"><div>' + ico + '</div><h2>' + h + '</h2><p>' + p + '</p>' + (btn || '') + '</div>'; }
  function tile(ico, label, val, c) { return '<div class="mp-tile" style="--c:' + c + '"><div class="mp-tile-i">' + ico + '</div><div><b>' + val + '</b><span>' + label + '</span></div></div>'; }
  function onOff(root, sel, fn) { root.querySelectorAll(sel).forEach(function (el) { el.onclick = function (e) { fn(el, e); }; }); }

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
  function bindSeg(ov, id, init) {
    var box = ov.querySelector('#' + id), cur = init;
    function mark() { box.querySelectorAll('button').forEach(function (b) { b.classList.toggle('on', b.dataset.v === cur); }); }
    box.querySelectorAll('button').forEach(function (b) { b.onclick = function () { cur = b.dataset.v; mark(); }; });
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
     GOALS
     ════════════════════════════════════════════════════════════════════ */
  var GL = { goals: [], subjects: [], today: '', tab: 'active' };
  var GTYPE = {
    study_hours: { ico: '📚', label: 'Study Hours', c: '#818cf8', unit: 'hours' },
    mark_target: { ico: '📊', label: 'Mark Target', c: '#34d399', unit: '%' },
    streak: { ico: '🔥', label: 'Study Streak', c: '#fb923c', unit: 'days' },
    custom: { ico: '✏️', label: 'Custom Goal', c: '#a78bfa', unit: '' }
  };
  Pages.goals = function (pc) {
    return api('gl_list').then(function (d) {
      if (!d || !d.success) return errPage(pc, d);
      GL.goals = d.goals; GL.subjects = d.subjects; GL.today = d.today; drawGoals(pc);
    });
  };
  function glReload() {
    return api('gl_list').then(function (d) { if (d && d.success) { GL.goals = d.goals; GL.subjects = d.subjects; GL.today = d.today; if (here('goals') && pcEl()) drawGoals(pcEl()); } });
  }
  function gPct(g) { return g.target_value > 0 ? Math.min(100, (g.current_value / g.target_value) * 100) : 0; }
  function drawGoals(pc) {
    var act = GL.goals.filter(function (g) { return g.status === 'active'; }), done = GL.goals.filter(function (g) { return g.status === 'completed'; });
    var avg = act.length ? Math.round(act.reduce(function (a, g) { return a + gPct(g); }, 0) / act.length) : 0;
    var list = GL.tab === 'done' ? done : act;
    var head = '<div class="mp-head"><div class="mp-tabs" id="glTabs"><button data-t="active" class="' + (GL.tab === 'active' ? 'on' : '') + '">Active <em>' + act.length + '</em></button><button data-t="done" class="' + (GL.tab === 'done' ? 'on' : '') + '">Completed <em>' + done.length + '</em></button></div>' +
      '<div class="mp-head-r"><button class="mp-add" id="glAdd">＋ New goal</button></div></div>';
    var tiles = '<div class="mp-tiles">' + tile('🎯', 'Active goals', act.length, '#6366f1') + tile('🏆', 'Completed', done.length, '#10b981') + tile('📈', 'Avg progress (active)', avg + '%', '#f59e0b') + '</div>';
    var body;
    if (!GL.goals.length) body = emptyBlock('🎯', 'No goals yet', 'Set a study-hours, mark or streak target and watch it fill up automatically.', '<button class="mp-add" id="glAdd2">＋ New goal</button>');
    else if (!list.length) body = emptyBlock(GL.tab === 'done' ? '🏁' : '🎯', GL.tab === 'done' ? 'Nothing completed yet' : 'No active goals', GL.tab === 'done' ? 'Finish an active goal and it will show up here.' : 'Create a new goal to get started.');
    else body = '<div class="sx-list">' + list.map(goalCard).join('') + '</div>';
    pc.innerHTML = '<div class="mp sx">' + head + tiles + body + '</div>';
    onOff(pc, '#glTabs button', function (b) { GL.tab = b.dataset.t; drawGoals(pc); });
    var add = function () { goalModal(); };
    $('#glAdd', pc).onclick = add; if ($('#glAdd2', pc)) $('#glAdd2', pc).onclick = add;
    onOff(pc, '[data-del]', function (b) {
      var id = +b.dataset.del, g = GL.goals.filter(function (x) { return x.id === id; })[0];
      confirmModal('Delete goal?', 'Remove <b>' + esc(g.title) + '</b>?', 'Delete', 'gl_delete', { id: id }, glReload);
    });
    onOff(pc, '[data-upd]', function (b) { var id = +b.dataset.upd; progressModal(GL.goals.filter(function (x) { return x.id === id; })[0]); });
  }
  function goalCard(g) {
    var t = GTYPE[g.type] || GTYPE.custom, p = gPct(g), isDone = g.status === 'completed';
    var unit = g.unit || t.unit, auto = g.type !== 'custom';
    var dl = '';
    if (g.deadline && !isDone) {
      var n = daysBetween(GL.today, g.deadline);
      dl = '<span class="sx-dl' + (n < 0 ? ' od' : n <= 3 ? ' soon' : '') + '">⏰ ' + (n < 0 ? Math.abs(n) + 'd overdue' : n === 0 ? 'Due today' : n + 'd left') + ' · ' + fmtDate(g.deadline) + '</span>';
    } else if (g.deadline) dl = '<span class="sx-dl">' + fmtDate(g.deadline) + '</span>';
    return '<div class="sx-goal' + (isDone ? ' done' : '') + '" style="--c:' + t.c + '"><div class="sx-goal-top"><div class="sx-gi">' + t.ico + '</div><div class="sx-gm"><b>' + esc(g.title) + '</b><div class="sx-chips"><span>' + t.label + '</span>' +
      (g.subject_name ? '<span><i style="background:' + esc(g.subject_color || '#6366f1') + '"></i>' + esc(g.subject_name) + '</span>' : '') + (auto ? '<span>Auto-tracked</span>' : '') + dl + '</div></div>' +
      '<div class="sx-gp"><b>' + (isDone ? '✓' : Math.round(p) + '%') + '</b></div></div>' +
      '<div class="mp-bar"><i style="width:' + p + '%;--c:' + t.c + '"></i></div>' +
      '<div class="sx-goal-foot"><span>' + r1(g.current_value) + ' <em>/ ' + r1(g.target_value) + ' ' + esc(unit) + '</em></span><div>' +
      (!isDone && !auto ? '<button class="mp-mini" data-upd="' + g.id + '">Update progress</button>' : '') + '<button class="mp-ib dng" data-del="' + g.id + '" title="Delete">' + TRASH + '</button></div></div></div>';
  }
  function goalModal() {
    formModal({
      title: 'New goal', ok: 'Create goal', done: 'Goal created!',
      body: '<label>Goal type</label><div class="px-seg" id="glType"><button data-v="study_hours">📚 Hours</button><button data-v="mark_target">📊 Marks</button><button data-v="streak">🔥 Streak</button><button data-v="custom">✏️ Custom</button></div>' +
        '<label>Title</label><input id="glTitle" data-focus maxlength="120" placeholder="e.g. Study 100 hours of Chemistry">' +
        '<div class="sx-2"><div><label>Target</label><input id="glTarget" type="number" min="0" step="any" placeholder="100"></div><div><label>Unit</label><input id="glUnit" maxlength="20" placeholder="hours"></div></div>' +
        '<label>Subject <span class="sx-opt">(optional)</span></label><select id="glSub">' + subOptions(GL.subjects, 0, 'All subjects') + '</select>' +
        '<label>Deadline <span class="sx-opt">(optional)</span></label><input id="glDl" type="date">' +
        '<p class="mp-note" id="glHint" style="margin-top:12px"></p>',
      mount: function (ov) {
        var seg = bindSeg(ov, 'glType', 'study_hours'), unit = ov.querySelector('#glUnit'), hint = ov.querySelector('#glHint');
        var hints = { study_hours: 'Progress is counted automatically from your study sessions.', mark_target: 'Progress is your average mark % (from Marks & Results).', streak: 'Progress follows your study streak days.', custom: 'You update the progress yourself.' };
        function sync() { var t = seg.get(); unit.value = GTYPE[t].unit; hint.textContent = hints[t]; }
        ov.querySelector('#glType').addEventListener('click', sync); sync();
        ov._seg = seg;
      },
      collect: function (ov) {
        var title = ov.querySelector('#glTitle').value.trim(), target = parseFloat(ov.querySelector('#glTarget').value);
        if (!title) return { error: 'Please enter a goal title.' };
        if (!(target > 0)) return { error: 'Target must be greater than 0.' };
        return { action: 'gl_add', payload: { title: title, type: ov._seg.get(), target_value: target, unit: ov.querySelector('#glUnit').value.trim(), subject_id: +ov.querySelector('#glSub').value, deadline: ov.querySelector('#glDl').value } };
      },
      after: glReload
    });
  }
  function progressModal(g) {
    formModal({
      title: 'Update progress', ok: 'Save', done: 'Progress updated',
      body: '<p class="px-p"><b>' + esc(g.title) + '</b><br>Target: ' + r1(g.target_value) + ' ' + esc(g.unit || '') + '</p><label>Current value</label><input id="glVal" data-focus type="number" min="0" step="any" value="' + g.current_value + '">',
      collect: function (ov) { var v = parseFloat(ov.querySelector('#glVal').value); if (!(v >= 0)) return { error: 'Enter a valid number.' }; return { action: 'gl_progress', payload: { id: g.id, value: v } }; },
      after: glReload
    });
  }

  /* ════════════════════════════════════════════════════════════════════
     PAST PAPERS
     ════════════════════════════════════════════════════════════════════ */
  var PP = { papers: [], subjects: [], sub: 0, type: 0, year: new Date().getFullYear(), closed: {}, chart1: null, chart2: null };
  var PTYPE = { 1: { short: 'MCQ', label: 'Paper 1 – MCQ', c: '#0ea5e9' }, 2: { short: 'Structured', label: 'Paper 2 – Structured', c: '#14b8a6' }, 3: { short: 'Essay', label: 'Paper 3 – Essay', c: '#ec4899' } };
  function ppPct(p) { return (p.done && p.score !== null && p.total_marks > 0) ? (p.score / p.total_marks) * 100 : null; }
  function ppStats(papers, ptype) {
    var byYear = {}, bySub = {}, sum = 0, cnt = 0;
    papers.forEach(function (p) {
      var pc = ppPct(p); if (pc === null) return; if (ptype && p.paper_no !== ptype) return;
      (byYear[p.year] = byYear[p.year] || { s: 0, n: 0 }); byYear[p.year].s += pc; byYear[p.year].n++;
      (bySub[p.subject_name] = bySub[p.subject_name] || { s: 0, n: 0, c: p.subject_color }); bySub[p.subject_name].s += pc; bySub[p.subject_name].n++;
      sum += pc; cnt++;
    });
    var yrs = Object.keys(byYear).sort();
    return { labels: yrs, trend: yrs.map(function (y) { return r1(byYear[y].s / byYear[y].n); }), sub: Object.keys(bySub).map(function (n) { return { name: n, avg: r1(bySub[n].s / bySub[n].n), c: bySub[n].c }; }), avg: cnt ? r1(sum / cnt) : null, cnt: cnt };
  }
  Pages['past-papers'] = function (pc) {
    return api('pp_list').then(function (d) {
      if (!d || !d.success) return errPage(pc, d);
      PP.papers = d.papers; PP.subjects = d.subjects; PP.year = d.year; drawPapers(pc);
    });
  };
  function ppReload() {
    return api('pp_list').then(function (d) { if (d && d.success) { PP.papers = d.papers; PP.subjects = d.subjects; if (here('past-papers') && pcEl()) drawPapers(pcEl()); } });
  }
  function ppKill() { ['chart1', 'chart2'].forEach(function (k) { if (PP[k]) { try { PP[k].destroy(); } catch (e) {} PP[k] = null; } }); }
  function drawPapers(pc) {
    ppKill();
    if (PP.sub && !PP.subjects.some(function (s) { return s.id === PP.sub; })) PP.sub = 0;
    var papers = PP.papers.filter(function (p) { return !PP.sub || p.subject_id === PP.sub; });
    var total = papers.length, done = papers.filter(function (p) { return p.done; }).length, pct = total ? Math.round(done / total * 100) : 0;
    var all = ppStats(papers, 0);
    var head = '<div class="mp-head"><p>' + plural(total, 'paper') + (PP.sub ? ' in this subject' : '') + '</p><div class="mp-head-r">' +
      (PP.subjects.length ? '<select class="mp-sel" id="ppSub"><option value="0">All subjects</option>' + subOptions(PP.subjects, PP.sub) + '</select>' : '') +
      '<button class="mp-add sec" id="ppOne">＋ Single paper</button><button class="mp-add" id="ppBulk">＋ Add by year range</button></div></div>';
    var body;
    if (!PP.subjects.length) body = emptyBlock('📚', 'Add a subject first', 'Past papers belong to a subject. Create one on the Subjects page.', '<a class="mp-add" style="display:inline-block;text-decoration:none" href="#/subjects">Go to Subjects</a>');
    else if (!total) body = emptyBlock('📄', 'No past papers yet', 'Use “Add by year range” to add many papers at once (e.g. 2015 – 2024).', '<button class="mp-add" id="ppBulk2">＋ Add by year range</button>');
    else {
      var tiles = '<div class="mp-tiles four">' + tile('📄', 'Total papers', total, '#6366f1') + tile('✅', 'Completed', done, '#10b981') + tile('⏳', 'Remaining', total - done, '#ef4444') + tile('⭐', 'Avg score', all.avg !== null ? all.avg + '%' : '—', '#f59e0b') + '</div>';
      var prog = '<div class="mp-card"><div class="mp-card-t"><span>Overall progress</span><span>' + done + ' / ' + total + ' · ' + pct + '%</span></div><div class="mp-bar" style="height:9px"><i style="width:' + pct + '%"></i></div></div>';
      var charts = '';
      if (all.cnt && window.Chart) {
        charts = '<div class="sx-tf"><div class="mp-tabs" id="ppTf"><button data-t="0" class="' + (PP.type === 0 ? 'on' : '') + '">All</button>' + [1, 2, 3].map(function (n) { return '<button data-t="' + n + '" class="' + (PP.type === n ? 'on' : '') + '">P' + n + ' · ' + PTYPE[n].short + '</button>'; }).join('') + '</div></div>' +
          '<div class="sx-charts"><div class="mp-card"><div class="mp-card-t"><span>Score trend by year</span></div><div class="mk-chart"><canvas id="ppTrend"></canvas></div></div>' +
          '<div class="mp-card"><div class="mp-card-t"><span>Avg score by subject</span></div><div class="mk-chart"><canvas id="ppSubC"></canvas></div></div></div>';
      }
      var by = {};
      papers.forEach(function (p) { (by[p.subject_id] = by[p.subject_id] || { name: p.subject_name, c: p.subject_color, list: [] }).list.push(p); });
      var blocks = Object.keys(by).sort(function (a, b) { return by[a].name.localeCompare(by[b].name); }).map(function (sid) { return subjBlock(+sid, by[sid]); }).join('');
      body = tiles + prog + charts + '<div class="mp-card-t sx-sec"><span>Papers</span></div>' + blocks;
    }
    pc.innerHTML = '<div class="mp sx">' + head + body + '</div>';
    var s = $('#ppSub', pc); if (s) s.onchange = function () { PP.sub = +s.value; drawPapers(pc); };
    $('#ppBulk', pc).onclick = bulkModal; if ($('#ppBulk2', pc)) $('#ppBulk2', pc).onclick = bulkModal;
    $('#ppOne', pc).onclick = singleModal;
    onOff(pc, '#ppTf button', function (b) { PP.type = +b.dataset.t; drawPaperCharts(pc, papers); pc.querySelectorAll('#ppTf button').forEach(function (x) { x.classList.toggle('on', x === b); }); });
    onOff(pc, '[data-tog]', function (h, e) { if (e.target.closest('[data-delsub]')) return; var k = h.dataset.tog; PP.closed[k] = !PP.closed[k]; h.parentNode.classList.toggle('closed', !!PP.closed[k]); });
    onOff(pc, '[data-chip]', function (el, e) {
      if (e.target.closest('[data-score]') || e.target.closest('[data-delone]')) return;
      var id = +el.dataset.chip, p = PP.papers.filter(function (x) { return x.id === id; })[0];
      api('pp_toggle', { id: id, done: p.done ? 0 : 1 }).then(function (d) { if (d && d.success) ppReload(); else toast((d && d.message) || 'Failed', 'warn'); });
    });
    onOff(pc, '[data-score]', function (b, e) { e.stopPropagation(); var id = +b.dataset.score; scoreModal(PP.papers.filter(function (x) { return x.id === id; })[0]); });
    onOff(pc, '[data-delone]', function (b, e) {
      e.stopPropagation(); var id = +b.dataset.delone, p = PP.papers.filter(function (x) { return x.id === id; })[0];
      confirmModal('Delete paper?', 'Remove <b>' + esc(p.subject_name) + ' ' + p.year + ' · ' + PTYPE[p.paper_no].label + '</b>?', 'Delete', 'pp_delete_one', { id: id }, ppReload);
    });
    onOff(pc, '[data-delsub]', function (b, e) {
      e.stopPropagation(); var sid = +b.dataset.delsub, nm = b.dataset.nm;
      confirmModal('Delete all papers?', 'Remove <b>every</b> past paper of <b>' + esc(nm) + '</b>? This cannot be undone.', 'Delete all', 'pp_delete_subject', { subject_id: sid }, ppReload);
    });
    onOff(pc, '[data-delyr]', function (b, e) {
      e.stopPropagation(); var sid = +b.dataset.sid, yr = +b.dataset.delyr, nm = b.dataset.nm;
      confirmModal('Delete ' + yr + '?', 'Remove all <b>' + yr + '</b> papers of <b>' + esc(nm) + '</b>?', 'Delete', 'pp_delete_year', { subject_id: sid, year: yr }, ppReload);
    });
    if (window.Chart && all.cnt) drawPaperCharts(pc, papers);
  }
  function subjBlock(sid, g) {
    var list = g.list, nDone = list.filter(function (p) { return p.done; }).length, pct = Math.round(nDone / list.length * 100);
    var st = ppStats(list, 0), byY = {};
    list.forEach(function (p) { (byY[p.year] = byY[p.year] || []).push(p); });
    var years = Object.keys(byY).sort(function (a, b) { return b - a; });
    var badge = st.avg !== null ? '<span class="sx-badge ' + (st.avg >= 75 ? 'g' : st.avg >= 55 ? 'y' : 'r') + '">Avg ' + st.avg + '%</span>' : '';
    return '<div class="sx-subj' + (PP.closed[sid] ? ' closed' : '') + '" style="--c:' + esc(g.c) + '"><div class="sx-subj-hd" data-tog="' + sid + '"><div class="sx-subj-nm"><span class="mp-dot" style="background:' + esc(g.c) + '"></span>' + esc(g.name) + '</div>' +
      '<div class="sx-subj-r">' + badge + '<span class="sx-cnt">' + nDone + '/' + list.length + '</span><button class="sx-link dng" data-delsub="' + sid + '" data-nm="' + esc(g.name) + '">Delete all</button><span class="sx-chev">▾</span></div></div>' +
      '<div class="sx-subj-bd"><div class="mp-bar" style="margin-bottom:12px"><i style="width:' + pct + '%;--c:' + esc(g.c) + '"></i></div>' +
      years.map(function (y) {
        return '<div class="sx-yr"><div class="sx-yr-h"><b>' + y + '</b><button class="sx-link dng" data-delyr="' + y + '" data-sid="' + sid + '" data-nm="' + esc(g.name) + '">Delete ' + y + '</button></div><div class="sx-chipsrow">' +
          byY[y].map(chipHtml).join('') + '</div></div>';
      }).join('') + '</div></div>';
  }
  function chipHtml(p) {
    var pc = ppPct(p), col = pc === null ? '' : (pc >= 75 ? '#10b981' : pc >= 55 ? '#f59e0b' : '#ef4444');
    return '<div class="sx-chip' + (p.done ? ' done' : '') + '" data-chip="' + p.id + '" style="--pt:' + PTYPE[p.paper_no].c + '"><span class="sx-chk">' + (p.done ? '✓' : '') + '</span>' +
      '<span class="sx-chip-l"><b>' + PTYPE[p.paper_no].label + '</b>' + (p.lesson ? '<i>' + esc(p.lesson) + '</i>' : '') + '</span>' +
      (pc !== null ? '<button class="sx-score" data-score="' + p.id + '" style="background:' + col + '22;color:' + col + '">' + Math.round(pc) + '%</button>' : '<button class="sx-addscore" data-score="' + p.id + '">+ Score</button>') +
      '<button class="sx-x" data-delone="' + p.id + '" title="Delete">✕</button></div>';
  }
  function drawPaperCharts(pc, papers) {
    ppKill(); if (!window.Chart) return;
    var st = ppStats(papers, PP.type), accent = cssVar('--accent', '#6366f1'), muted = cssVar('--text-muted', '#8b8ba0'), grid = 'rgba(127,127,160,.14)';
    var c1 = $('#ppTrend', pc), c2 = $('#ppSubC', pc); if (!c1 || !c2) return;
    var scales = { y: { min: 0, max: 100, ticks: { color: muted, callback: function (v) { return v + '%'; } }, grid: { color: grid } }, x: { ticks: { color: muted }, grid: { display: false } } };
    PP.chart1 = new Chart(c1, { type: 'line', data: { labels: st.labels, datasets: [{ data: st.trend, borderColor: accent, backgroundColor: accent, tension: .35, borderWidth: 2.5, pointRadius: 4, fill: false }] }, options: { maintainAspectRatio: false, animation: { duration: 400 }, plugins: { legend: { display: false } }, scales: scales } });
    PP.chart2 = new Chart(c2, { type: 'bar', data: { labels: st.sub.map(function (s) { return s.name; }), datasets: [{ data: st.sub.map(function (s) { return s.avg; }), backgroundColor: st.sub.map(function (s) { return s.c; }), borderRadius: 8 }] }, options: { maintainAspectRatio: false, animation: { duration: 400 }, plugins: { legend: { display: false } }, scales: scales } });
  }
  function bulkModal() {
    var y = PP.year;
    formModal({
      title: 'Add by year range', ok: 'Add papers', wide: false,
      body: '<label>Subject</label><select id="ppbSub" data-focus>' + subOptions(PP.subjects, PP.sub || (PP.subjects[0] && PP.subjects[0].id)) + '</select>' +
        '<div class="sx-2"><div><label>From year</label><input id="ppbFrom" type="number" min="1990" max="2100" value="' + (y - 9) + '"></div><div><label>To year</label><input id="ppbTo" type="number" min="1990" max="2100" value="' + y + '"></div></div>' +
        '<label>Paper types</label><div class="sx-checks" id="ppbTypes">' + [1, 2, 3].map(function (n) { return '<label class="sx-ck"><input type="checkbox" value="' + n + '"' + (n === 1 ? ' checked' : '') + '><span style="--pt:' + PTYPE[n].c + '">' + PTYPE[n].label + '</span></label>'; }).join('') + '</div>' +
        '<label>Lesson / topic <span class="sx-opt">(optional)</span></label><input id="ppbLes" maxlength="120" placeholder="e.g. Organic chemistry">',
      collect: function (ov) {
        var f = +ov.querySelector('#ppbFrom').value, t = +ov.querySelector('#ppbTo').value, sid = +ov.querySelector('#ppbSub').value;
        var types = Array.prototype.map.call(ov.querySelectorAll('#ppbTypes input:checked'), function (i) { return +i.value; });
        if (!sid) return { error: 'Please choose a subject.' }; if (!f || !t) return { error: 'Enter the year range.' }; if (f > t) return { error: 'From year must be ≤ To year.' }; if (!types.length) return { error: 'Pick at least one paper type.' };
        return { action: 'pp_add_bulk', payload: { subject_id: sid, from_year: f, to_year: t, papers: types, lesson: ov.querySelector('#ppbLes').value.trim() } };
      },
      after: ppReload
    });
  }
  function singleModal() {
    formModal({
      title: 'Add a paper', ok: 'Add paper',
      body: '<label>Subject</label><select id="ppsSub" data-focus>' + subOptions(PP.subjects, PP.sub || (PP.subjects[0] && PP.subjects[0].id)) + '</select>' +
        '<div class="sx-2"><div><label>Year</label><input id="ppsYr" type="number" min="1990" max="2100" value="' + PP.year + '"></div><div><label>Paper</label><select id="ppsNo">' + [1, 2, 3].map(function (n) { return '<option value="' + n + '">' + PTYPE[n].label + '</option>'; }).join('') + '</select></div></div>' +
        '<label>Lesson / topic <span class="sx-opt">(optional)</span></label><input id="ppsLes" maxlength="120">',
      collect: function (ov) {
        var sid = +ov.querySelector('#ppsSub').value, yr = +ov.querySelector('#ppsYr').value;
        if (!sid || !yr) return { error: 'Subject and year are required.' };
        return { action: 'pp_add_single', payload: { subject_id: sid, year: yr, paper_no: +ov.querySelector('#ppsNo').value, lesson: ov.querySelector('#ppsLes').value.trim() } };
      },
      after: ppReload
    });
  }
  function scoreModal(p) {
    formModal({
      title: 'Paper score', ok: 'Save score', done: 'Score saved!',
      body: '<p class="px-p"><b>' + esc(p.subject_name) + ' ' + p.year + '</b> · ' + PTYPE[p.paper_no].label + '</p>' +
        '<div class="sx-2"><div><label>Marks obtained</label><input id="scS" data-focus type="number" min="0" step="any" value="' + (p.score === null ? '' : p.score) + '"></div><div><label>Total marks</label><input id="scT" type="number" min="1" step="any" value="' + (p.total_marks || 100) + '"></div></div>' +
        '<label>Notes <span class="sx-opt">(optional)</span></label><textarea id="scN" rows="3" placeholder="Mistakes, topics to revise…">' + esc(p.notes || '') + '</textarea>',
      collect: function (ov) { return { action: 'pp_score', payload: { id: p.id, score: ov.querySelector('#scS').value, total: ov.querySelector('#scT').value, notes: ov.querySelector('#scN').value } }; },
      after: ppReload
    });
  }

  /* ════════════════════════════════════════════════════════════════════
     NOTES & FLASHCARDS
     ════════════════════════════════════════════════════════════════════ */
  var NT = { notes: [], cards: [], subjects: [], tab: lsGet('stNtTab', 'notes'), q: '', tag: '', sub: 0, deck: '' };
  var OK_TAGS = { B: 1, STRONG: 1, I: 1, EM: 1, U: 1, S: 1, STRIKE: 1, H2: 1, H3: 1, H4: 1, P: 1, BR: 1, DIV: 1, SPAN: 1, UL: 1, OL: 1, LI: 1, A: 1, PRE: 1, CODE: 1, MARK: 1, BLOCKQUOTE: 1, INPUT: 1 };
  function cleanHtml(html) {          /* defence in depth: the server already strips scripts, this also drops unknown tags / attributes */
    html = String(html || '');
    if (html.indexOf('<') === -1) html = esc(html).replace(/\r?\n/g, '<br>');
    var doc = new DOMParser().parseFromString('<div>' + html + '</div>', 'text/html'), root = doc.body.firstChild;
    (function walk(n) {
      Array.prototype.slice.call(n.childNodes).forEach(function (c) {
        if (c.nodeType === 8) { c.remove(); return; }
        if (c.nodeType !== 1) return;
        if (!OK_TAGS[c.tagName]) { if (/^(SCRIPT|STYLE|IFRAME|OBJECT|EMBED|FORM)$/.test(c.tagName)) c.remove(); else { walk(c); while (c.firstChild) c.parentNode.insertBefore(c.firstChild, c); c.remove(); } return; }
        Array.prototype.slice.call(c.attributes).forEach(function (a) {
          var nm = a.name.toLowerCase();
          if (nm === 'href' && c.tagName === 'A' && /^https?:/i.test(a.value)) { c.setAttribute('target', '_blank'); return; }
          if (nm === 'style' && /^[\w\s:;#%.,()-]*$/.test(a.value) && !/url|expression/i.test(a.value)) return;
          if (c.tagName === 'INPUT' && (nm === 'type' || nm === 'checked')) return;
          c.removeAttribute(a.name);
        });
        if (c.tagName === 'INPUT') { c.setAttribute('type', 'checkbox'); c.setAttribute('disabled', ''); }
        walk(c);
      });
    })(root);
    return root.innerHTML;
  }
  function plainText(html) { var d = document.createElement('div'); d.innerHTML = cleanHtml(html); return (d.textContent || '').replace(/\s+/g, ' ').trim(); }

  Pages.notes = function (pc) {
    return api('nt_list').then(function (d) {
      if (!d || !d.success) return errPage(pc, d);
      NT.notes = d.notes; NT.cards = d.flashcards; NT.subjects = d.subjects; drawNotes(pc);
    });
  };
  function ntReload() {
    return api('nt_list').then(function (d) { if (d && d.success) { NT.notes = d.notes; NT.cards = d.flashcards; NT.subjects = d.subjects; if (here('notes') && pcEl()) drawNotes(pcEl()); } });
  }
  function drawNotes(pc) {
    var head = '<div class="mp-head"><div class="mp-tabs" id="ntTabs"><button data-t="notes" class="' + (NT.tab === 'notes' ? 'on' : '') + '">📝 Notes <em>' + NT.notes.length + '</em></button><button data-t="cards" class="' + (NT.tab === 'cards' ? 'on' : '') + '">🃏 Flashcards <em>' + NT.cards.length + '</em></button></div>' +
      '<div class="mp-head-r">' + (NT.tab === 'notes' ? '<button class="mp-add" id="ntNew">＋ New note</button>' : '<button class="mp-add" id="fcNew">＋ New flashcard</button>') + '</div></div>';
    pc.innerHTML = '<div class="mp sx">' + head + '<div id="ntBody"></div></div>';
    onOff(pc, '#ntTabs button', function (b) { NT.tab = b.dataset.t; lsSet('stNtTab', NT.tab); drawNotes(pc); });
    if (NT.tab === 'notes') { $('#ntNew', pc).onclick = function () { noteModal(null); }; drawNoteList(pc); }
    else { $('#fcNew', pc).onclick = function () { cardModal(NT.deck); }; drawCards(pc); }
  }
  function drawNoteList(pc) {
    var body = $('#ntBody', pc);
    if (!NT.notes.length) { body.innerHTML = emptyBlock('📝', 'No notes yet', 'Write formulas, summaries and reminders. Pin the important ones to the top.', '<button class="mp-add" id="ntNew2">＋ New note</button>'); $('#ntNew2', pc).onclick = function () { noteModal(null); }; return; }
    var tags = [], seen = {};
    NT.notes.forEach(function (n) { n.tags.forEach(function (t) { if (!seen[t.toLowerCase()]) { seen[t.toLowerCase()] = 1; tags.push(t); } }); });
    tags.sort(function (a, b) { return a.toLowerCase() < b.toLowerCase() ? -1 : 1; });
    body.innerHTML = '<div class="sx-bar"><input id="ntQ" class="sx-search" placeholder="Search notes…" value="' + esc(NT.q) + '"><select class="mp-sel" id="ntSub"><option value="0">All subjects</option>' + subOptions(NT.subjects, NT.sub) + '</select></div>' +
      (tags.length ? '<div class="sx-tags" id="ntTags"><button data-tag="" class="' + (NT.tag ? '' : 'on') + '">All</button>' + tags.map(function (t) { return '<button data-tag="' + esc(t) + '" class="' + (NT.tag.toLowerCase() === t.toLowerCase() ? 'on' : '') + '"># ' + esc(t) + '</button>'; }).join('') + '</div>' : '') +
      '<div id="ntGrid"></div>';
    var q = $('#ntQ', pc); q.oninput = function () { NT.q = q.value; fillGrid(pc); };
    $('#ntSub', pc).onchange = function (e) { NT.sub = +e.target.value; fillGrid(pc); };
    onOff(pc, '#ntTags button', function (b) { NT.tag = b.dataset.tag; pc.querySelectorAll('#ntTags button').forEach(function (x) { x.classList.toggle('on', x === b); }); fillGrid(pc); });
    fillGrid(pc);
  }
  function fillGrid(pc) {
    var g = $('#ntGrid', pc), q = NT.q.trim().toLowerCase();
    var list = NT.notes.filter(function (n) {
      if (NT.sub && n.subject_id !== NT.sub) return false;
      if (NT.tag && !n.tags.some(function (t) { return t.toLowerCase() === NT.tag.toLowerCase(); })) return false;
      if (q && (n.title + ' ' + plainText(n.content) + ' ' + n.tags.join(' ')).toLowerCase().indexOf(q) === -1) return false;
      return true;
    });
    if (!list.length) { g.innerHTML = '<div class="mp-empty" style="padding:50px 20px"><div>🔎</div><h2>No matching notes</h2><p>Try a different search, tag or subject.</p></div>'; return; }
    var pin = list.filter(function (n) { return n.is_pinned; }), reg = list.filter(function (n) { return !n.is_pinned; });
    g.innerHTML = (pin.length ? '<div class="mp-card-t sx-sec"><span>📌 Pinned</span></div><div class="sx-notes">' + pin.map(noteCard).join('') + '</div>' : '') +
      (reg.length ? (pin.length ? '<div class="mp-card-t sx-sec"><span>All notes</span></div>' : '') + '<div class="sx-notes">' + reg.map(noteCard).join('') + '</div>' : '');
    onOff(g, '[data-open]', function (c, e) { if (e.target.closest('button')) return; viewNote(+c.dataset.open); });
    onOff(g, '[data-pin]', function (b, e) { e.stopPropagation(); api('nt_pin', { id: +b.dataset.pin }).then(ntReload); });
    onOff(g, '[data-edit]', function (b, e) { e.stopPropagation(); noteModal(NT.notes.filter(function (n) { return n.id === +b.dataset.edit; })[0]); });
    onOff(g, '[data-delnote]', function (b, e) { e.stopPropagation(); var n = NT.notes.filter(function (x) { return x.id === +b.dataset.delnote; })[0]; confirmModal('Delete note?', 'Remove <b>' + esc(n.title) + '</b>?', 'Delete', 'nt_delete', { id: n.id }, ntReload); });
  }
  function noteCard(n) {
    var prev = plainText(n.content); if (prev.length > 170) prev = prev.slice(0, 170) + '…';
    return '<div class="sx-note" data-open="' + n.id + '" style="--c:' + esc(n.color || '#6366f1') + '"><div class="sx-note-h"><b>' + esc(n.title) + '</b><div class="sx-note-a">' +
      '<button class="mp-ib' + (n.is_pinned ? ' pinned' : '') + '" data-pin="' + n.id + '" title="' + (n.is_pinned ? 'Unpin' : 'Pin') + '">📌</button><button class="mp-ib" data-edit="' + n.id + '" title="Edit">✏️</button><button class="mp-ib dng" data-delnote="' + n.id + '" title="Delete">' + TRASH + '</button></div></div>' +
      '<p>' + (esc(prev) || '<i>Empty note</i>') + '</p><div class="sx-note-f">' + (n.subject_name ? '<span><i style="background:' + esc(n.subject_color || '#6366f1') + '"></i>' + esc(n.subject_name) + '</span>' : '') +
      n.tags.slice(0, 3).map(function (t) { return '<span class="tg"># ' + esc(t) + '</span>'; }).join('') + '</div></div>';
  }
  function viewNote(id) {
    var n = NT.notes.filter(function (x) { return x.id === id; })[0]; if (!n) return;
    modal('<div class="px-h"><h3>' + esc(n.title) + '</h3><button data-close class="px-x">✕</button></div>' +
      '<div class="sx-note-f" style="margin:-6px 0 12px">' + (n.subject_name ? '<span><i style="background:' + esc(n.subject_color || '#6366f1') + '"></i>' + esc(n.subject_name) + '</span>' : '') + n.tags.map(function (t) { return '<span class="tg"># ' + esc(t) + '</span>'; }).join('') + '</div>' +
      '<div class="sx-rich sx-view">' + (cleanHtml(n.content) || '<i>Empty note</i>') + '</div><div class="px-btns"><button data-close class="px-sec">Close</button><button class="px-pri" id="nvEdit">Edit</button></div>',
      function (ov, close) { ov.firstChild.classList.add('sx-wide'); ov.querySelector('#nvEdit').onclick = function () { close(); noteModal(n); }; });
  }
  function noteModal(n) {
    var color = n ? n.color : '#6366f1';
    formModal({
      title: n ? 'Edit note' : 'New note', ok: n ? 'Save changes' : 'Save note', wide: true,
      body: '<label>Title</label><input id="ntTitle" data-focus maxlength="200" value="' + esc(n ? n.title : '') + '">' +
        '<div class="sx-2"><div><label>Subject <span class="sx-opt">(optional)</span></label><select id="ntSubSel">' + subOptions(NT.subjects, n ? n.subject_id : 0, 'No subject') + '</select></div>' +
        '<div><label>Tags <span class="sx-opt">(comma separated)</span></label><input id="ntTagsIn" maxlength="200" value="' + esc(n ? n.tags.join(', ') : '') + '" placeholder="formulas, exam"></div></div>' +
        '<label>Colour</label>' + swatches('ntColor', color) +
        '<label>Content</label><div class="sx-tb" id="ntTb"><button type="button" data-cmd="bold"><b>B</b></button><button type="button" data-cmd="italic"><i>I</i></button><button type="button" data-cmd="underline"><u>U</u></button>' +
        '<button type="button" data-cmd="hiliteColor" data-v="#fde68a">🖍</button><button type="button" data-cmd="formatBlock" data-v="h3">H</button><button type="button" data-cmd="insertUnorderedList">• List</button><button type="button" data-cmd="insertOrderedList">1. List</button><button type="button" data-cmd="removeFormat">⌫</button></div>' +
        '<div class="sx-rich sx-edit" id="ntEd" contenteditable="true">' + (n ? cleanHtml(n.content) : '') + '</div>',
      mount: function (ov) {
        ov._sw = bindSw(ov, 'ntColor', color);
        var ed = ov.querySelector('#ntEd');
        onOff(ov, '#ntTb button', function (b) { ed.focus(); try { document.execCommand('styleWithCSS', false, false); document.execCommand(b.dataset.cmd, false, b.dataset.v || null); } catch (e) {} });
        ed.addEventListener('paste', function (e) { e.preventDefault(); var t = (e.clipboardData || window.clipboardData).getData('text/plain'); document.execCommand('insertText', false, t); });
      },
      collect: function (ov) {
        var title = ov.querySelector('#ntTitle').value.trim(); if (!title) return { error: 'Please enter a title.' };
        return { action: 'nt_save', payload: { id: n ? n.id : 0, title: title, content: cleanHtml(ov.querySelector('#ntEd').innerHTML), subject_id: +ov.querySelector('#ntSubSel').value, tags: ov.querySelector('#ntTagsIn').value, color: ov._sw.get() } };
      },
      after: ntReload
    });
  }

  /* ── flashcards ── */
  function drawCards(pc) {
    var body = $('#ntBody', pc);
    if (!NT.cards.length) { body.innerHTML = emptyBlock('🃏', 'No flashcards yet', 'Make question / answer cards, group them in decks and flip through them to revise.', '<button class="mp-add" id="fcNew2">＋ New flashcard</button>'); $('#fcNew2', pc).onclick = function () { cardModal(''); }; return; }
    var decks = {}; NT.cards.forEach(function (c) { (decks[c.deck_name] = decks[c.deck_name] || []).push(c); });
    var names = Object.keys(decks).sort();
    if (NT.deck && !decks[NT.deck]) NT.deck = '';
    if (!NT.deck) {
      body.innerHTML = '<div class="sx-decks">' + names.map(function (n) {
        var rev = decks[n].filter(function (c) { return c.times_reviewed > 0; }).length;
        return '<div class="sx-deck" data-deck="' + esc(n) + '"><div class="sx-deck-i">🃏</div><b>' + esc(n) + '</b><span>' + plural(decks[n].length, 'card') + ' · ' + rev + ' reviewed</span><div class="mp-bar"><i style="width:' + Math.round(rev / decks[n].length * 100) + '%"></i></div></div>';
      }).join('') + '</div>';
      onOff(body, '[data-deck]', function (d) { NT.deck = d.dataset.deck; drawCards(pc); });
      return;
    }
    var cards = decks[NT.deck];
    body.innerHTML = '<div class="sx-deckhd"><button class="sx-link" id="fcBack">← All decks</button><b>' + esc(NT.deck) + '</b><span>' + plural(cards.length, 'card') + '</span><button class="mp-add" id="fcStudy">▶ Study deck</button></div>' +
      '<div class="sx-cards">' + cards.map(function (c) {
        return '<div class="sx-card"><div class="sx-card-q">' + esc(c.question) + '</div><div class="sx-card-a">' + esc(c.answer) + '</div><div class="sx-card-f"><span class="df ' + c.difficulty + '">' + c.difficulty + '</span>' +
          (c.subject_name ? '<span>' + esc(c.subject_name) + '</span>' : '') + '<button class="mp-ib dng" data-delcard="' + c.id + '" title="Delete">' + TRASH + '</button></div></div>';
      }).join('') + '</div>';
    $('#fcBack', pc).onclick = function () { NT.deck = ''; drawCards(pc); };
    $('#fcStudy', pc).onclick = function () { studyDeck(cards); };
    onOff(body, '[data-delcard]', function (b) { confirmModal('Delete flashcard?', 'This card will be removed from the deck.', 'Delete', 'nt_flash_delete', { id: +b.dataset.delcard }, ntReload); });
  }
  function cardModal(deck) {
    var decks = []; NT.cards.forEach(function (c) { if (decks.indexOf(c.deck_name) < 0) decks.push(c.deck_name); });
    formModal({
      title: 'New flashcard', ok: 'Add card', wide: false,
      body: '<label>Deck</label><input id="fcDeck" list="fcDecks" maxlength="100" value="' + esc(deck || (decks[0] || 'General')) + '"><datalist id="fcDecks">' + decks.map(function (d) { return '<option value="' + esc(d) + '">'; }).join('') + '</datalist>' +
        '<label>Question</label><textarea id="fcQ" data-focus rows="3"></textarea><label>Answer</label><textarea id="fcA" rows="3"></textarea>' +
        '<div class="sx-2"><div><label>Subject</label><select id="fcSub">' + subOptions(NT.subjects, 0, 'None') + '</select></div><div><label>Difficulty</label><div class="px-seg" id="fcDiff"><button data-v="easy">Easy</button><button data-v="medium">Medium</button><button data-v="hard">Hard</button></div></div></div>',
      mount: function (ov) { ov._d = bindSeg(ov, 'fcDiff', 'medium'); },
      collect: function (ov) {
        var q = ov.querySelector('#fcQ').value.trim(), a = ov.querySelector('#fcA').value.trim();
        if (!q || !a) return { error: 'Question and answer are required.' };
        return { action: 'nt_flash_add', payload: { deck: ov.querySelector('#fcDeck').value.trim() || 'General', question: q, answer: a, subject_id: +ov.querySelector('#fcSub').value, difficulty: ov._d.get() } };
      },
      after: ntReload
    });
  }
  function studyDeck(cards) {
    var order = cards.slice().sort(function () { return Math.random() - .5; }), i = 0, shown = false, knew = 0;
    modal('<div class="px-h"><h3>Study · ' + esc(NT.deck) + '</h3><button data-close class="px-x">✕</button></div><div id="stBody"></div>', function (ov, close) {
      ov.firstChild.classList.add('sx-wide');
      var box = ov.querySelector('#stBody');
      function draw() {
        if (i >= order.length) {
          box.innerHTML = '<div class="sx-study-done"><div>🎉</div><h2>Deck finished!</h2><p>You marked ' + knew + ' of ' + order.length + ' cards as known.</p><div class="px-btns"><button data-close class="px-sec">Close</button><button class="px-pri" id="stAgain">Study again</button></div></div>';
          ov.querySelectorAll('[data-close]').forEach(function (b) { b.onclick = function () { close(); ntReload(); }; });
          ov.querySelector('#stAgain').onclick = function () { order.sort(function () { return Math.random() - .5; }); i = 0; knew = 0; shown = false; draw(); };
          return;
        }
        var c = order[i];
        box.innerHTML = '<div class="sx-study-n">' + (i + 1) + ' / ' + order.length + '<div class="mp-bar"><i style="width:' + (i / order.length * 100) + '%"></i></div></div>' +
          '<div class="sx-flip' + (shown ? ' on' : '') + '" id="stCard"><div class="sx-flip-f"><small>QUESTION</small><p>' + esc(c.question) + '</p><em>Click to reveal answer (Space)</em></div><div class="sx-flip-b"><small>ANSWER</small><p>' + esc(c.answer) + '</p></div></div>' +
          '<div class="sx-study-btns" style="visibility:' + (shown ? 'visible' : 'hidden') + '"><button class="px-sec" id="stNo">Still learning</button><button class="px-pri" id="stYes">I knew it</button></div>';
        ov.querySelector('#stCard').onclick = function () { shown = !shown; draw(); };
        ov.querySelector('#stNo').onclick = function () { next(false); };
        ov.querySelector('#stYes').onclick = function () { next(true); };
      }
      function next(k) { if (k) knew++; api('nt_flash_review', { id: order[i].id }); i++; shown = false; draw(); }
      ov.addEventListener('keydown', function (e) { if (e.key === ' ' && i < order.length) { e.preventDefault(); shown = !shown; draw(); } });
      ov.tabIndex = -1; ov.focus(); draw();
    });
  }

  /* ════════════════════════════════════════════════════════════════════
     DAILY BATTLE
     ════════════════════════════════════════════════════════════════════ */
  var BT = { s: null, tab: 'battle', rar: 'all', pick: {}, left: 0, timer: null, poll: null, giftShown: false, giftData: null };
  var RAR = { common: { c: '#94a3b8', t: 'Common' }, rare: { c: '#38bdf8', t: 'Rare' }, epic: { c: '#c084fc', t: 'Epic' }, legendary: { c: '#fbbf24', t: 'Legendary' } };
  function mmss(sec) { sec = Math.max(0, sec | 0); function p(n) { return (n < 10 ? '0' : '') + n; } return p(Math.floor(sec / 3600)) + ':' + p(Math.floor(sec % 3600 / 60)) + ':' + p(sec % 60); }
  function hm(m) { m = Math.round(+m || 0); var h = Math.floor(m / 60), r = m % 60; return h ? h + 'h ' + r + 'm' : r + 'm'; }
  function avatar(u) { return u.av ? '<img class="bt-av" src="' + esc(u.av) + '" alt="" referrerpolicy="no-referrer">' : '<span class="bt-av ph">' + esc((u.name || '?').charAt(0).toUpperCase()) + '</span>'; }

  Pages['daily-battle'] = function (pc) {
    BT.pick = {}; BT.giftShown = false;
    return api('bt_state').then(function (d) {
      if (!d || !d.success) return errPage(pc, d);
      if (d.enabled === false) { pc.innerHTML = emptyBlock('⚔️', 'Daily Battle is taking a short break', 'This feature has been paused by an admin. Please check back later.'); return; }
      BT.s = d; BT.left = d.left; drawBattle(pc);
      clearInterval(BT.timer); clearInterval(BT.poll);
      BT.timer = setInterval(function () { BT.left--; var el = document.getElementById('btCd'); if (!el) { clearInterval(BT.timer); return; } el.textContent = mmss(BT.left); }, 1000);
      BT.poll = setInterval(function () {
        if (!here('daily-battle') || document.hidden) return;
        if (document.querySelector('.px-ov, .bt-pop2')) return;
        api('bt_state').then(function (n) { if (n && n.success && n.enabled !== false && here('daily-battle') && pcEl()) { BT.s = n; BT.left = n.left; if (BT.tab === 'battle') drawBattleBody(pcEl()); } });
      }, 20000);
      maybeGift();
    });
  };
  function drawBattle(pc) {
    var s = BT.s;
    pc.innerHTML = '<div class="mp sx"><div class="bt-hero"><div><h2>⚔️ Daily Study Battle</h2><p>Study more than your friends today. The leader at midnight wins a gift!</p></div><div class="bt-timer"><small>Ends in (11:59 PM)</small><b id="btCd">' + mmss(BT.left) + '</b></div></div>' +
      '<div class="mp-head"><div class="mp-tabs" id="btTabs"><button data-t="battle" class="' + (BT.tab === 'battle' ? 'on' : '') + '">⚔️ Battle</button><button data-t="gifts" class="' + (BT.tab === 'gifts' ? 'on' : '') + '">🎁 Gift collection</button><button data-t="hist" class="' + (BT.tab === 'hist' ? 'on' : '') + '">📜 History</button></div></div><div id="btBody"></div></div>';
    onOff(pc, '#btTabs button', function (b) { BT.tab = b.dataset.t; pc.querySelectorAll('#btTabs button').forEach(function (x) { x.classList.toggle('on', x === b); }); drawBattleBody(pc); });
    drawBattleBody(pc);
  }
  function drawBattleBody(pc) {
    var b = $('#btBody', pc); if (!b) return;
    if (BT.tab === 'gifts') return drawGifts(b);
    if (BT.tab === 'hist') return drawHist(b);
    var s = BT.s, lb = s.lb || [], leader = lb[0] && lb[0].min > 0 ? lb[0] : null;
    var inv = (s.invites || []).map(function (i) {
      return '<div class="bt-inv"><span>⚔️ <b>' + esc(i.name) + '</b> invited you to today\'s battle</span><div><button class="px-sec" data-no="' + i.host_id + '">Decline</button><button class="mp-add" data-yes="' + i.host_id + '">Join battle</button></div></div>';
    }).join('');
    var me = lb.filter(function (u) { return u.me; })[0], gap = '';
    if (me && lb.length > 1) {
      var idx = lb.indexOf(me);
      if (idx === 0) gap = lb[1].min === me.min ? '🤝 Tied for the lead — study a bit more to win!' : '👑 You lead by ' + hm(me.min - lb[1].min) + '. Keep going!';
      else gap = '🔥 ' + hm(lb[0].min - me.min + 1) + ' more to take the lead from ' + esc(lb[0].name) + '.';
    }
    var board;
    if (!s.room) board = '<div class="bt-empty">You are not in a battle yet. Invite friends on the right to start one.</div>';
    else board = lb.map(function (u, i) {
      var mx = Math.max(1, lb[0].min);
      return '<div class="bt-row' + (u.me ? ' me' : '') + '"><span class="bt-rk r' + (i + 1) + '">' + (i === 0 && u.min > 0 ? '👑' : i + 1) + '</span>' + avatar(u) + '<div class="bt-nm"><b>' + esc(u.name) + (u.me ? ' <em>(you)</em>' : '') + '</b><div class="mp-bar"><i style="width:' + (u.min / mx * 100) + '%"></i></div></div><span class="bt-min">' + hm(u.min) + '</span></div>';
    }).join('');
    var frs = (s.friends || []).map(function (f) {
      var can = f.st === 'none', label = f.st === 'in' ? 'In your battle' : f.st === 'busy' ? 'In another battle' : f.st === 'invited' ? 'Invited' : '';
      return '<label class="bt-fr' + (can ? '' : ' off') + '">' + avatar(f) + '<span><b>' + esc(f.name) + '</b>' + (label ? '<em>' + label + '</em>' : '') + '</span>' + (can ? '<input type="checkbox" data-fr="' + f.id + '"' + (BT.pick[f.id] ? ' checked' : '') + '>' : '') + '</label>';
    }).join('') || '<div class="bt-empty">No friends yet. Add friends on the website to battle with them.</div>';
    b.innerHTML = inv + '<div class="mp-tiles"><div class="mp-tile" style="--c:#6366f1"><div class="mp-tile-i">👥</div><div><b>' + lb.length + '</b><span>Participants</span></div></div>' +
      '<div class="mp-tile" style="--c:#f59e0b"><div class="mp-tile-i">🎁</div><div><b class="sm">' + esc(s.reward || 'Study Gift') + '</b><span>Today\'s reward</span></div></div>' +
      '<div class="mp-tile" style="--c:#10b981"><div class="mp-tile-i">👑</div><div><b class="sm">' + (leader ? esc(leader.name) : '—') + '</b><span>Current leader</span></div></div></div>' +
      '<div class="bt-grid"><div class="mp-card"><div class="mp-card-t"><span>Live leaderboard</span><span class="bt-live">● Live</span></div>' + board + (gap ? '<p class="mp-note" style="margin-top:12px">' + gap + '</p>' : '') +
      (s.room ? '<button class="sx-link dng" id="btLeave" style="margin-top:12px">Leave battle</button>' : '') + '</div>' +
      '<div class="mp-card"><div class="mp-card-t"><span>Invite friends</span></div><p class="mp-note" style="margin-bottom:10px">Only friends who are not in another battle can be invited.</p><div class="bt-frs">' + frs + '</div>' +
      '<button class="mp-add" id="btSend" style="width:100%;margin-top:12px">Send invite</button><a class="mp-add sec" href="#/study-log" style="display:block;text-align:center;text-decoration:none;margin-top:8px">▶ Log study time</a></div></div>';
    onOff(b, '[data-yes]', function (x) { respond(+x.dataset.yes, true); });
    onOff(b, '[data-no]', function (x) { respond(+x.dataset.no, false); });
    b.querySelectorAll('[data-fr]').forEach(function (c) { c.onchange = function () { BT.pick[c.dataset.fr] = c.checked; }; });
    var sb = $('#btSend', b);
    if (sb) sb.onclick = function () {
      var ids = Object.keys(BT.pick).filter(function (k) { return BT.pick[k]; }).map(Number);
      if (!ids.length) { toast('Pick at least one friend', 'warn'); return; }
      sb.disabled = true;
      api('bt_invite', { ids: ids }).then(function (d) { sb.disabled = false; if (d && d.success) { BT.pick = {}; toast(d.sent ? 'Invite sent to ' + plural(d.sent, 'friend') : 'Nobody could be invited', d.sent ? 'ok' : 'warn'); refreshBattle(); } else toast((d && d.message) || 'Failed', 'warn'); });
    };
    var lv = $('#btLeave', b);
    if (lv) lv.onclick = function () { confirmModal('Leave battle?', 'You will no longer compete in today\'s battle.', 'Leave', 'bt_leave', {}, refreshBattle); };
  }
  function refreshBattle() { return api('bt_state').then(function (n) { if (n && n.success && here('daily-battle') && pcEl()) { BT.s = n; BT.left = n.left; drawBattleBody(pcEl()); maybeGift(); } }); }
  function respond(host, acc) { api('bt_respond', { host: host, accept: acc ? 1 : 0 }).then(function (d) { if (d && d.success) { toast(acc ? 'Joined the battle!' : 'Declined', 'ok'); refreshBattle(); } else toast((d && d.message) || 'Failed', 'warn'); }); }

  function art() { return window.stBattleArt || null; }
  function giftArt(key, fallback) { var A = art(); return (A && A.has(key)) ? A.gi(key) : '<div class="gi gi-em">' + (fallback || '🎁') + '</div>'; }
  function giftCard(key, item, count) {
    var A = art(), rar = item[2], r = RAR[rar] || RAR.common, own = count > 0;
    return '<div class="bt-gift btg ' + (own ? '' : 'lock') + '" style="--rc:' + r.c + '"><span class="bt-ct">' + (own ? '×' + count : '🔒') + '</span>' + giftArt(key, item[1]) +
      '<b>' + esc(item[0]) + '</b><span class="bt-rar">' + r.t + '</span>' + (A && A.msg(key) ? '<small>' + esc(A.msg(key)) + '</small>' : '') + '</div>';
  }
  function drawGifts(b) {
    b.innerHTML = '<div class="mp-card"><div class="bt-loading">Loading…</div></div>';
    api('bt_gifts', {}).then(function (d) {
      if (!d || !d.success) { b.innerHTML = '<div class="mp-card"><div class="bt-empty">Could not load gifts.</div></div>'; return; }
      var cat = BT.s.catalog || {}, own = {}, tot = 0;
      d.gifts.forEach(function (g) { own[g.gift_key] = +g.c || 0; tot += +g.c || 0; });
      var all = Object.keys(cat), have = all.filter(function (k) { return own[k] > 0; }).length;
      var shown = all.filter(function (k) { return BT.rar === 'all' || cat[k][2] === BT.rar; });
      var tabs = '<div class="mp-tabs" id="btRar" style="margin:0 0 14px">' + ['all', 'common', 'rare', 'epic', 'legendary'].map(function (r) {
        return '<button data-r="' + r + '" class="' + (BT.rar === r ? 'on' : '') + '">' + r.charAt(0).toUpperCase() + r.slice(1) + '</button>'; }).join('') + '</div>';
      b.innerHTML = '<div class="mp-card"><div class="mp-card-t"><span>🎁 My Gift Collection</span><span>🏆 ' + d.wins + ' battle win' + (d.wins === 1 ? '' : 's') + ' · ' + tot + ' gift' + (tot === 1 ? '' : 's') + ' · ' + have + ' / ' + all.length + ' unique</span></div>' + tabs +
        '<div class="bt-gifts">' + shown.map(function (k) { return giftCard(k, cat[k], own[k] || 0); }).join('') + '</div></div>';
      b.querySelectorAll('#btRar button').forEach(function (x) { x.onclick = function () { BT.rar = x.dataset.r; drawGifts(b); }; });
    });
  }
  function drawHist(b) {
    b.innerHTML = '<div class="mp-card"><div class="bt-loading">Loading…</div></div>';
    api('bt_history', {}).then(function (d) {
      if (!d || !d.success) { b.innerHTML = '<div class="mp-card"><div class="bt-empty">Could not load history.</div></div>'; return; }
      b.innerHTML = '<div class="mp-card"><div class="mp-card-t"><span>Past battles</span></div>' + (d.rows.length ? d.rows.map(function (r) {
        return '<div class="bt-h"><b>' + fmtDate(r.battle_date) + '</b><span>' + plural(r.participants, 'player') + '</span><span class="bt-hw">' + (r.champion_id ? '👑 ' + (r.me ? 'You' : esc(r.cname)) + ' · ' + hm(r.minutes) : 'No winner') + '</span></div>';
      }).join('') : '<div class="bt-empty">No finished battles yet.</div>') + '</div>';
    });
  }
  function maybeGift() {
    var s = BT.s; if (!s || BT.giftShown || (!s.gift && !s.bonus)) return;
    BT.giftShown = true;
    var g = s.gift, cat = s.catalog || {}, A = art(), item = g ? (cat[g.key] || ['Gift', '🎁', g.rarity]) : null, r = g ? (RAR[g.rarity] || RAR.common) : RAR.common;
    var ov = document.createElement('div'); ov.className = 'btg bt-pop2'; ov.style.setProperty('--rc', r.c);
    ov.innerHTML = '<div class="bt-pbox"><div class="bt-prays"></div>' +
      '<div class="bt-pcong">🏆 Congratulations!</div><h2>You won today\'s Daily Battle!</h2>' +
      '<div class="bt-pstage"><div class="bt-pflash"></div><div class="bt-pbx">' + giftArt('motivation_box', '🎁') + '</div><div class="bt-prise">' + (item ? giftArt(g.key, item[1]) : '<div class="gi gi-em">🏆</div>') + '</div></div>' +
      '<div class="bt-pfade">' + (item ? '<div class="bt-pnm">' + esc(item[0]) + '</div><span class="bt-rar bt-rar-s">' + r.t.toUpperCase() + '</span><p>🎁 ' + esc(item[0]) + ' added to your Gift Collection.</p>' : '') +
      (s.bonus ? '<p class="bt-bonus">🎉 Bonus reward: ' + esc(s.bonus) + '</p>' : '') +
      (item && A && A.msg(g.key) ? '<p class="bt-pmsg">' + esc(A.msg(g.key)) + '</p>' : '') +
      '<button class="px-pri" id="gpGo">View Gift Collection</button></div></div>';
    document.body.appendChild(ov);
    requestAnimationFrame(function () { ov.classList.add('on'); });
    var done = false;
    function seen() { if (done) return; done = true; api('bt_seen', { id: g ? g.id : 0 }); BT.s.gift = null; BT.s.bonus = null; }
    function close() { document.removeEventListener('keydown', onKey); ov.classList.remove('on'); setTimeout(function () { ov.remove(); }, 200); }
    function onKey(e) { if (e.key === 'Escape') { seen(); close(); } }
    document.addEventListener('keydown', onKey);
    ov.addEventListener('mousedown', function (e) { if (e.target === ov) { seen(); close(); } });
    ov.querySelector('#gpGo').onclick = function () { seen(); close(); BT.tab = 'gifts'; if (pcEl()) drawBattle(pcEl()); };
    // confetti + floating hearts, same timing as the website
    var cols = ['#fbbf24', '#a78bfa', '#38bdf8', '#f472b6', '#34d399'], n = { common: 50, rare: 80, epic: 110, legendary: 170 }[g ? g.rarity : 'common'] || 80;
    setTimeout(function () {
      if (!ov.isConnected) return;
      for (var i = 0; i < n; i++) { (function (i) { var c = document.createElement('i'); c.className = 'bt-cf'; c.style.cssText = 'left:' + Math.random() * 100 + '%;background:' + cols[i % 5] + ';animation-duration:' + (2 + Math.random() * 3) + 's;animation-delay:' + Math.random() * 1.2 + 's'; ov.appendChild(c); setTimeout(function () { c.remove(); }, 6500); })(i); }
      for (var j = 0; j < 14; j++) { (function (j) { var h = document.createElement('i'); h.className = 'bt-ht'; h.textContent = ['💜', '✨', '💙', '⭐'][j % 4]; h.style.cssText = 'left:' + Math.random() * 100 + '%;animation-duration:' + (4 + Math.random() * 3) + 's;animation-delay:' + Math.random() * 2 + 's'; ov.appendChild(h); setTimeout(function () { h.remove(); }, 9500); })(j); }
    }, 1200);
  }
})();
