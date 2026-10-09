/* StudyTrack Desktop - Syllabus Tracker, Quiz Practice and Mind Maps pages.
 * Native app pages (same look as Goals / Marks / Analysis). Data: pages7.php (actions sy_*, qz_*, mm_*).
 * Needs js/pages-extra.js (window.StUI helpers) to be loaded first. */
(function () {
  var Pages = window.stPages, TITLES = window.stTitles, api = window.stApi, UI = window.StUI;
  if (!Pages || !api || !UI) return;
  var toast = UI.toast, modal = UI.modal, errPage = UI.errPage, lsGet = UI.lsGet, lsSet = UI.lsSet, $ = UI.$;
  TITLES.syllabus = 'Syllabus Tracker'; TITLES.quiz = 'Quiz Practice'; TITLES['mind-map'] = 'Mind Maps';

  /* ── helpers ─────────────────────────────────────────────────────────── */
  function esc(s) { return E(String(s == null ? '' : s)); }
  function here(route) { return location.hash.indexOf('#/' + route) === 0; }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function utc(s) { return new Date(String(s).slice(0, 10) + 'T00:00:00Z'); }
  function dShort(s) { return utc(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }); }
  function dFull(s) { return new Date(String(s).replace(' ', 'T')).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }
  function pctOf(a, b) { return b > 0 ? Math.round(a / b * 100) : 0; }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function tile(ico, label, val, c) { return '<div class="mp-tile" style="--c:' + c + '"><div class="mp-tile-i">' + ico + '</div><div><b>' + val + '</b><span>' + label + '</span></div></div>'; }
  function card(title, inner, extra, cls) { return '<div class="mp-card ' + (cls || '') + '"><div class="mp-card-t"><span>' + title + '</span>' + (extra || '') + '</div>' + inner + '</div>'; }
  function bar(p, c) { return '<div class="mp-bar"><i style="width:' + Math.max(0, Math.min(100, p)) + '%;--c:' + c + '"></i></div>'; }
  function seg(id, items, cur) { return '<div class="mp-tabs" id="' + id + '">' + items.map(function (i) { return '<button data-v="' + i[0] + '" class="' + (String(i[0]) === String(cur) ? 'on' : '') + '">' + i[1] + '</button>'; }).join('') + '</div>'; }
  function emptyBlock(ico, h, p) { return '<div class="mp-empty"><div>' + ico + '</div><h2>' + h + '</h2><p>' + p + '</p></div>'; }
  function scrollBoxes(pc) { var out = [pc]; var mc = document.querySelector('.main-content'); if (mc) out.push(mc); return out; }
  function keepScroll(pc, fn) { var b = scrollBoxes(pc), v = b.map(function (x) { return x.scrollTop; }); fn(); b.forEach(function (x, i) { x.scrollTop = v[i]; }); }
  function confirmBox(title, text, okText, run) {
    modal('<div class="px-h"><h3>' + title + '</h3><button data-close class="px-x">✕</button></div><p class="px-p">' + text + '</p>' +
      '<div class="px-btns"><button data-close class="px-sec">Cancel</button><button id="lnOk" class="px-pri dng">' + okText + '</button></div>',
      function (ov, close) { ov.querySelector('#lnOk').onclick = function () { close(); run(); }; });
  }
  function colorOf(c) { return /^#[0-9a-fA-F]{3,8}$/.test(c || '') ? c : '#6366f1'; }
  function rgba(hex, a) {
    var h = String(hex || '#6366f1').replace('#', ''); if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    return 'rgba(' + parseInt(h.substr(0, 2), 16) + ',' + parseInt(h.substr(2, 2), 16) + ',' + parseInt(h.substr(4, 2), 16) + ',' + a + ')';
  }

  /* ═════════════════════════════════════════════════════════════════
     SYLLABUS TRACKER
     ═════════════════════════════════════════════════════════════════ */
  var SY = { d: null, sub: 0, view: lsGet('syView', 'subjects'), closed: {}, tpl: {}, W: { set: [], pick: null, rot: 0, spinning: false } };
  if (['subjects', 'review', 'wheel'].indexOf(SY.view) < 0) SY.view = 'subjects';

  Pages.syllabus = function (pc) { return syLoad(pc, true); };
  function syLoad(pc, first) {
    return api('sy_page').then(function (d) {
      if (!here('syllabus')) return;
      if (!d || !d.success) return errPage(pc, d);
      SY.d = d;
      if (!d.subjects.some(function (s) { return s.id === SY.sub; })) SY.sub = d.subjects.length ? d.subjects[0].id : 0;
      SY.W = { set: [], pick: null, rot: SY.W.rot || 0, spinning: false };
      keepScroll(pc, function () { syDraw(pc); });
    });
  }
  function syCalc(d) {
    var today = d.today, tp = d.topics, r = {};
    r.total = tp.length; r.done = tp.filter(function (t) { return t.is_completed; }).length; r.pct = pctOf(r.done, r.total);
    r.diff = tp.filter(function (t) { return t.is_difficult; });
    r.due = tp.filter(function (t) { return t.is_completed && t.next_review_date && t.next_review_date <= today; });
    r.cycle = tp.filter(function (t) { return t.next_review_date; }).length;
    var weekAgo = new Date(String(d.now).replace(' ', 'T')).getTime() - 7 * 86400000;
    r.week = tp.filter(function (t) { return t.completed_at && new Date(String(t.completed_at).replace(' ', 'T')).getTime() >= weekAgo; }).length;
    r.remaining = r.total - r.done; r.eta = (r.week > 0 && r.remaining > 0) ? Math.ceil(r.remaining / (r.week / 7)) : null;
    r.perf = d.subjects.map(function (s) {
      var x = tp.filter(function (t) { return t.subject_id === s.id; }), dn = x.filter(function (t) { return t.is_completed; }).length;
      return { id: s.id, name: s.name, color: s.color, total: x.length, done: dn, pct: pctOf(dn, x.length) };
    }).filter(function (p) { return p.total > 0; }).sort(function (a, b) { return b.pct - a.pct; });
    r.strong = r.perf[0] || null; r.weak = r.perf.length > 1 ? r.perf[r.perf.length - 1] : null;
    r.days = []; var base = utc(today);
    for (var i = 6; i >= 0; i--) {
      var dt = new Date(base.getTime() - i * 86400000), key = dt.getUTCFullYear() + '-' + pad(dt.getUTCMonth() + 1) + '-' + pad(dt.getUTCDate());
      r.days.push({ key: key, label: i === 0 ? 'Today' : dt.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' }), n: tp.filter(function (t) { return t.completed_at && String(t.completed_at).slice(0, 10) === key; }).length, today: i === 0 });
    }
    return r;
  }
  function subOf(d, id) { return d.subjects.filter(function (s) { return s.id === id; })[0]; }

  function syDraw(pc) {
    var d = SY.d;
    if (!d.subjects.length) { pc.innerHTML = '<div class="mp ln">' + emptyBlock('📚', 'No subjects yet', 'Add subjects first, then come back here to track your syllabus.') + '<div style="text-align:center"><a class="mp-add" href="#/subjects" style="display:inline-block;text-decoration:none">Go to Subjects</a></div></div>'; return; }
    var s = syCalc(d), maxDay = Math.max.apply(null, s.days.map(function (x) { return x.n; }).concat([1]));
    var tiles = '<div class="mp-tiles four">' + tile('📈', 'Syllabus coverage', s.pct + '<small>%</small>', '#6366f1') + tile('✅', 'Topics completed', s.done + '<small>/' + s.total + '</small>', '#10b981') +
      tile('🔖', 'Difficult topics', s.diff.length, '#f59e0b') + tile('🎡', 'Due for revision', s.due.length, '#ec4899') + '</div>';
    var analytics = '';
    if (s.total) {
      var act = '<div class="ln-act">' + s.days.map(function (x) { return '<div class="' + (x.today ? 'today' : '') + '"><em>' + (x.n || '') + '</em><span><i style="height:' + (x.n ? Math.max(6, Math.round(x.n / maxDay * 100)) : 0) + '%"></i></span><b>' + x.label + '</b></div>'; }).join('') + '</div>';
      var brk = s.perf.map(function (p) { return '<div class="ln-hb"><span title="' + esc(p.name) + '">' + esc(p.name) + '</span>' + bar(p.pct, p.color) + '<b>' + p.pct + '%</b></div>'; }).join('');
      var ins = [];
      ins.push(s.week > 0 ? ['🔥', 'You completed <b>' + s.week + ' topic' + (s.week === 1 ? '' : 's') + '</b> in the last 7 days.' + (s.eta !== null ? ' At this pace the remaining <b>' + s.remaining + '</b> take about <b>' + s.eta + ' day' + (s.eta === 1 ? '' : 's') + '</b>.' : '')] : ['💤', 'No topics completed in the last 7 days. Tick a few off to get your pace going.']);
      if (s.strong) ins.push(['🏆', 'Strongest subject: <b>' + esc(s.strong.name) + '</b> at <b>' + s.strong.pct + '%</b> (' + s.strong.done + '/' + s.strong.total + ').']);
      if (s.weak) ins.push(['⚠️', 'Needs attention: <b>' + esc(s.weak.name) + '</b> is only at <b>' + s.weak.pct + '%</b> (' + s.weak.done + '/' + s.weak.total + ').']);
      if (s.diff.length) ins.push(['🔖', '<b>' + s.diff.length + '</b> topic' + (s.diff.length === 1 ? ' is' : 's are') + ' marked difficult. Check <b>Review Later</b> when you have spare time.']);
      analytics = '<div class="ln-two">' + card('📊 7-day activity', act) + card('📚 Subject breakdown', brk) + '</div>' +
        card('🧠 Progress analysis', ins.map(function (i) { return '<div class="ln-ins"><span>' + i[0] + '</span><p>' + i[1] + '</p></div>'; }).join(''));
    }
    var tabs = seg('syTabs', [['subjects', '📚 By Subject'], ['review', '🔖 Review Later <em>' + s.diff.length + '</em>'], ['wheel', '🎡 Revision Wheel <em>' + s.due.length + '</em>']], SY.view);
    var body = SY.view === 'subjects' ? syBySubject(d, s) : (SY.view === 'review' ? syReview(d, s) : syWheel(d, s));
    pc.innerHTML = '<div class="mp ln"><div class="mp-head"><p>Track how much of each subject\'s syllabus you\'ve covered</p></div>' + tiles + analytics + '<div style="margin:6px 0 14px">' + tabs + '</div><div id="syBody">' + body + '</div></div>';
    syBind(pc, s);
  }

  function syBySubject(d, s) {
    var sub = subOf(d, SY.sub), topics = d.topics.filter(function (t) { return t.subject_id === SY.sub; });
    var chips = '<div class="ln-chips">' + d.subjects.map(function (x) {
      var n = d.topics.filter(function (t) { return t.subject_id === x.id; }), dn = n.filter(function (t) { return t.is_completed; }).length;
      return '<button data-sub="' + x.id + '" class="' + (x.id === SY.sub ? 'on' : '') + '"><i class="mp-dot" style="background:' + x.color + '"></i>' + esc(x.name) + '<em>' + pctOf(dn, n.length) + '%</em></button>';
    }).join('') + '</div>';
    var done = topics.filter(function (t) { return t.is_completed; }).length, sp = pctOf(done, topics.length);
    var head = '<div class="ln-sh"><div><b>' + esc(sub.name) + '</b><span>' + done + ' of ' + topics.length + ' topics completed</span></div><strong style="color:' + sub.color + '">' + sp + '%</strong></div>' + bar(sp, sub.color);
    var tplRow = '';
    if (sub.loaded) tplRow = '<span class="ln-badge">✓ Official syllabus loaded</span><button class="mp-mini ln-delsyl" id="syDelLoaded">🗑️ Delete syllabus</button>';
    else if (d.templates.length) {
      var pick = SY.tpl[sub.id] || d.auto[sub.id] || d.templates[0].name;
      tplRow = '<select id="syTpl" class="mp-sel" style="max-width:260px">' + d.templates.map(function (t) { return '<option value="' + esc(t.name) + '"' + (t.name === pick ? ' selected' : '') + '>' + esc(t.name) + ' (' + t.n + ')</option>'; }).join('') + '</select><button class="mp-mini" id="syLoad">📥 Load syllabus</button>';
    }
    var units = [], map = {};
    topics.forEach(function (t) { if (!map[t.unit_name]) { map[t.unit_name] = []; units.push(t.unit_name); } map[t.unit_name].push(t); });
    var list = units.length ? units.map(function (u) {
      var key = sub.id + '|' + u, closed = SY.closed[key], ud = map[u].filter(function (t) { return t.is_completed; }).length;
      return '<div class="ln-unit' + (closed ? ' closed' : '') + '"><div class="ln-unit-t" data-unit="' + esc(key) + '"><svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg><span>' + esc(u) + '</span><em>' + ud + '/' + map[u].length + '</em></div><div class="ln-rows">' +
        map[u].map(function (t) {
          return '<div class="ln-row' + (t.is_completed ? ' done' : '') + '"><button class="ln-chk' + (t.is_completed ? ' on' : '') + '" data-tg="' + t.id + '" title="Mark complete"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></button><span class="ln-tn">' + esc(t.topic_name) + '</span>' +
            (t.next_review_date && t.is_completed ? '<em class="ln-rev" title="Next revision">🎡 ' + (t.next_review_date <= d.today ? 'due' : dShort(t.next_review_date)) + '</em>' : '') +
            '<button class="ln-bm' + (t.is_difficult ? ' on' : '') + '" data-df="' + t.id + '" title="Mark as difficult / review later">🔖</button><button class="mp-ib dng ln-del" data-dl="' + t.id + '" title="Delete topic">✕</button></div>';
        }).join('') + '</div></div>';
    }).join('') : emptyBlock('📝', 'No topics yet', 'Add topics below' + (d.templates.length && !sub.loaded ? ' or load the official syllabus above.' : '.'));
    var add = '<div class="ln-add"><input id="syUnit" placeholder="Unit (e.g. Mechanics)" maxlength="150" value="' + esc(lsGet('syUnit', '')) + '"><textarea id="syTopics" rows="2" placeholder="Topic name (one per line to add several at once)"></textarea><button class="mp-add" id="syAdd">＋ Add</button></div>';
    return chips + card('', head + (tplRow ? '<div class="ln-tpl">' + tplRow + '</div>' : ''), '', 'ln-card0') + '<div>' + list + '</div>' + card('➕ Add topics', add, topics.length ? '<button class="mp-mini" id="syDelAll" style="color:#ef4444">Delete all topics</button>' : '');
  }

  function syReview(d, s) {
    if (!s.diff.length) return card('', emptyBlock('🔖', 'No topics bookmarked yet', 'Tap the 🔖 icon next to a topic in <b>By Subject</b> to save it here for later review.'));
    var by = {}; s.diff.forEach(function (t) { (by[t.subject_id] = by[t.subject_id] || []).push(t); });
    return d.subjects.filter(function (x) { return by[x.id]; }).map(function (x) {
      return card('<i class="mp-dot" style="background:' + x.color + '"></i>' + esc(x.name), by[x.id].map(function (t) {
        return '<div class="ln-row' + (t.is_completed ? ' done' : '') + '"><button class="ln-chk' + (t.is_completed ? ' on' : '') + '" data-tg="' + t.id + '"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></button><span class="ln-tn">' + esc(t.topic_name) + '<small>' + esc(t.unit_name) + '</small></span><button class="ln-bm on" data-df="' + t.id + '" title="Remove from Review Later">🔖</button></div>';
      }).join(''));
    }).join('');
  }

  /* Revision wheel: spaced repetition (SM-2), same ratings as the website */
  function syWheel(d, s) {
    var stats = '<div class="mp-tiles">' + tile('🎯', 'Due today', s.due.length, '#ec4899') + tile('🔁', 'In revision cycle', s.cycle, '#6366f1') + tile('✅', 'Topics completed', s.done, '#10b981') + '</div>';
    if (!s.due.length) return stats + card('', emptyBlock('🎡', s.cycle ? 'All revised for today!' : 'Nothing due for revision right now', s.cycle ? 'Come back tomorrow - topics return here exactly when it is time to review them again.' : 'Tick off topics as complete in <b>By Subject</b> - they join the Revision Wheel using spaced repetition and pop up here when it is time to review them again.'));
    var W = SY.W;
    if (!W.set.length) W.set = shuffle(s.due).slice(0, 12);
    var n = W.set.length, step = 360 / n, stops = W.set.map(function (t, i) { var c = colorOf((subOf(d, t.subject_id) || {}).color); return c + ' ' + (i * step) + 'deg ' + ((i + 1) * step) + 'deg'; }).join(',');
    var labels = W.set.map(function (t, i) { var a = i * step + step / 2; return '<b style="transform:rotate(' + a + 'deg) translateY(-96px) rotate(' + (-a) + 'deg)">' + (i + 1) + '</b>'; }).join('');
    var pick = W.pick !== null ? W.set[W.pick] : null, ps = pick ? subOf(d, pick.subject_id) : null;
    var res = pick ? '<div class="ln-wres"><span style="color:' + (ps ? ps.color : '#6366f1') + '">' + esc(ps ? ps.name : '') + '</span><h3>' + esc(pick.topic_name) + '</h3><p>How well do you remember it?</p><div class="ln-rate">' +
      [[0, 'Again', '&lt;1 day', 'again'], [3, 'Hard', '1 day', 'hard'], [4, 'Good', 'a few days', 'good'], [5, 'Easy', 'longer', 'easy']].map(function (r) { return '<button class="' + r[3] + '" data-q="' + r[0] + '">' + r[1] + '<small>' + r[2] + '</small></button>'; }).join('') + '</div></div>' : '';
    return stats + card('', '<div class="ln-wheelwrap"><div class="ln-wheel"><div class="ln-ptr"></div><div class="ln-dial" id="syDial" style="background:conic-gradient(' + stops + ');transform:rotate(' + W.rot + 'deg)">' + labels + '<div class="ln-hub">🎡</div></div></div>' +
      '<button class="mp-add" id="sySpin"' + (W.spinning ? ' disabled' : '') + '>🎯 ' + (pick ? 'Spin again' : 'Spin the wheel') + '</button></div>' + res);
  }

  function syBind(pc, s) {
    var d = SY.d;
    pc.querySelectorAll('#syTabs button').forEach(function (b) { b.onclick = function () { SY.view = b.dataset.v; lsSet('syView', SY.view); SY.W.pick = null; syDraw(pc); }; });
    pc.querySelectorAll('[data-sub]').forEach(function (b) { b.onclick = function () { SY.sub = +b.dataset.sub; syDraw(pc); }; });
    pc.querySelectorAll('.ln-unit-t').forEach(function (u) { u.onclick = function () { var k = u.dataset.unit; SY.closed[k] = !SY.closed[k]; u.parentNode.classList.toggle('closed', !!SY.closed[k]); }; });
    function find(id) { return d.topics.filter(function (t) { return t.id === id; })[0]; }
    pc.querySelectorAll('[data-tg]').forEach(function (b) {
      b.onclick = function () {
        var t = find(+b.dataset.tg); if (!t) return;
        t.is_completed = t.is_completed ? 0 : 1;
        if (t.is_completed) { t.completed_at = d.now; if (!t.next_review_date) t.next_review_date = d.today; } else t.completed_at = null;
        keepScroll(pc, function () { syDraw(pc); });
        api('sy_toggle', { id: t.id }).then(function (r) { if (!r || !r.success) { toast((r && r.message) || 'Could not save', 'warn'); syLoad(pc); } });
      };
    });
    pc.querySelectorAll('[data-df]').forEach(function (b) {
      b.onclick = function () {
        var t = find(+b.dataset.df); if (!t) return; t.is_difficult = t.is_difficult ? 0 : 1;
        toast(t.is_difficult ? 'Saved to Review Later' : 'Removed from Review Later', 'ok');
        keepScroll(pc, function () { syDraw(pc); });
        api('sy_difficult', { id: t.id }).then(function (r) { if (!r || !r.success) syLoad(pc); });
      };
    });
    pc.querySelectorAll('[data-dl]').forEach(function (b) {
      b.onclick = function () {
        var t = find(+b.dataset.dl); if (!t) return;
        confirmBox('Delete topic?', 'Remove <b>' + esc(t.topic_name) + '</b> from your syllabus?', 'Delete', function () {
          api('sy_delete', { id: t.id }).then(function (r) { if (r && r.success) { toast('Topic deleted', 'ok'); syLoad(pc); } else toast((r && r.message) || 'Could not delete', 'warn'); });
        });
      };
    });
    var tplSel = $('#syTpl', pc); if (tplSel) tplSel.onchange = function () { SY.tpl[SY.sub] = tplSel.value; };
    var ld = $('#syLoad', pc);
    if (ld) ld.onclick = function () {
      ld.disabled = true; ld.textContent = 'Loading…';
      api('sy_load', { subject_id: SY.sub, template_subject: tplSel ? tplSel.value : '' }).then(function (r) {
        toast((r && r.message) || 'Done', r && r.success ? 'ok' : 'warn'); syLoad(pc);
      });
    };
    var add = $('#syAdd', pc);
    if (add) {
      var unit = $('#syUnit', pc), tx = $('#syTopics', pc);
      var go = function () {
        var v = tx.value.trim(); if (!v) { tx.focus(); return; }
        lsSet('syUnit', unit.value.trim());
        add.disabled = true;
        api('sy_add', { subject_id: SY.sub, unit_name: unit.value.trim() || 'General', topic_name: v }).then(function (r) {
          if (r && r.success) { toast(r.message, 'ok'); syLoad(pc); } else { add.disabled = false; toast((r && r.message) || 'Could not add', 'warn'); }
        });
      };
      add.onclick = go;
      tx.onkeydown = function (e) { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); go(); } };
    }
    var delAll = function () {
      var sub = subOf(d, SY.sub);
      confirmBox('Delete all topics?', 'This removes <b>every topic</b> in <b>' + esc(sub.name) + '</b> together with its revision history. You can load the official syllabus again afterwards.', 'Delete all', function () {
        api('sy_delete_all', { subject_id: SY.sub }).then(function (r) { toast((r && r.message) || 'Done', r && r.success ? 'ok' : 'warn'); syLoad(pc); });
      });
    };
    var da = $('#syDelAll', pc); if (da) da.onclick = delAll;
    var dl = $('#syDelLoaded', pc); if (dl) dl.onclick = delAll;
    /* wheel */
    var spin = $('#sySpin', pc);
    if (spin) spin.onclick = function () {
      var W = SY.W; if (W.spinning || !W.set.length) return;
      var n = W.set.length, step = 360 / n, i = Math.floor(Math.random() * n), dial = $('#syDial', pc);
      W.spinning = true; spin.disabled = true;
      var cur = ((W.rot % 360) + 360) % 360, target = 360 * 5 + (360 - (i * step + step / 2)), nr = W.rot + ((target - cur + 360) % 360) + 360 * 4;
      W.pick = null; var r0 = $('.ln-wres', pc); if (r0) r0.remove();
      dial.style.transition = 'transform 3.6s cubic-bezier(.12,.7,.1,1)'; dial.style.transform = 'rotate(' + nr + 'deg)';
      setTimeout(function () { W.rot = nr; W.spinning = false; W.pick = i; if (here('syllabus') && SY.view === 'wheel') keepScroll(pc, function () { syDraw(pc); }); }, 3700);
    };
    pc.querySelectorAll('.ln-rate button').forEach(function (b) {
      b.onclick = function () {
        var W = SY.W, t = W.set[W.pick]; if (!t) return;
        pc.querySelectorAll('.ln-rate button').forEach(function (x) { x.disabled = true; });
        api('sy_rate', { id: t.id, quality: +b.dataset.q }).then(function (r) {
          if (r && r.success) { toast('Next review ' + (r.interval_days <= 1 ? 'tomorrow' : 'in ' + r.interval_days + ' days'), 'ok'); syLoad(pc); }
          else { toast((r && r.message) || 'Could not save', 'warn'); pc.querySelectorAll('.ln-rate button').forEach(function (x) { x.disabled = false; }); }
        });
      };
    });
  }

  /* ═════════════════════════════════════════════════════════════════
     QUIZ PRACTICE
     ═════════════════════════════════════════════════════════════════ */
  var QZ = { d: null, tab: lsGet('qzTab', 'practice'), sub: 0, count: +lsGet('qzCount', '10') || 10, bankSub: 0, run: null };
  if (['practice', 'bank', 'history'].indexOf(QZ.tab) < 0) QZ.tab = 'practice';
  var LET = ['a', 'b', 'c', 'd', 'e'];

  Pages.quiz = function (pc) { QZ.run = null; return qzLoad(pc); };
  function qzLoad(pc) {
    return api('qz_page').then(function (d) {
      if (!here('quiz')) return;
      if (!d || !d.success) return errPage(pc, d);
      QZ.d = d; qzDraw(pc);
    });
  }
  function qzCountFor(sid) {
    var d = QZ.d, own = d.questions.filter(function (q) { return !sid || q.subject_id === sid; }).length, adm = 0;
    if (sid) adm = d.adminBySubject[sid] || 0; else Object.keys(d.adminBySubject).forEach(function (k) { adm += d.adminBySubject[k]; });
    return own + adm;
  }
  function qzDraw(pc) {
    var d = QZ.d;
    if (QZ.run) return qzRunDraw(pc);
    var h = d.history, avg = h.length ? Math.round(h.reduce(function (a, x) { return a + x.score_percent; }, 0) / h.length) : 0, best = h.length ? Math.round(Math.max.apply(null, h.map(function (x) { return x.score_percent; }))) : 0;
    var tiles = '<div class="mp-tiles four">' + tile('📝', 'Questions in your bank', d.questions.length, '#6366f1') + tile('🧪', 'Quizzes taken', h.length, '#10b981') + tile('📈', 'Average score', h.length ? avg + '%' : '—', '#f59e0b') + tile('🏆', 'Best score', h.length ? best + '%' : '—', '#ec4899') + '</div>';
    var tabs = seg('qzTabs', [['practice', '🎯 Practice'], ['bank', '🗂️ My Questions <em>' + d.questions.length + '</em>'], ['history', '🕘 History']], QZ.tab);
    var body = QZ.tab === 'practice' ? qzSetup(d) : (QZ.tab === 'bank' ? qzBank(d) : qzHistory(d));
    pc.innerHTML = '<div class="mp ln"><div class="mp-head"><p>Test yourself with multiple-choice questions from your own bank</p>' + (QZ.tab === 'bank' ? '<div class="mp-head-r"><button class="mp-add" id="qzNew">＋ Add question</button></div>' : '') + '</div>' + tiles + '<div style="margin:6px 0 14px">' + tabs + '</div>' + body + '</div>';
    qzBind(pc);
  }
  function qzSetup(d) {
    var tot = qzCountFor(QZ.sub);
    var opts = '<option value="0">All subjects (' + qzCountFor(0) + ')</option>' + d.subjects.map(function (s) { return '<option value="' + s.id + '"' + (s.id === QZ.sub ? ' selected' : '') + '>' + esc(s.name) + ' (' + qzCountFor(s.id) + ')</option>'; }).join('');
    var cnt = [5, 10, 15, 20, 30, 50].map(function (n) { return '<option value="' + n + '"' + (n === QZ.count ? ' selected' : '') + '>' + n + ' questions</option>'; }).join('');
    if (!d.questions.length && !qzCountFor(0)) return card('', emptyBlock('🎯', 'Your question bank is empty', 'Add a few multiple-choice questions first, then come back to practise.') + '<div style="text-align:center"><button class="mp-add" id="qzGoBank">＋ Add questions</button></div>');
    return card('🎯 Start a quiz', '<div class="ln-setup"><label>Subject<select id="qzSub" class="mp-sel" style="max-width:none;width:100%">' + opts + '</select></label><label>How many?<select id="qzCnt" class="mp-sel" style="max-width:none;width:100%">' + cnt + '</select></label></div>' +
      '<p class="mp-note" style="margin:12px 0 14px">' + (tot ? 'Up to <b>' + Math.min(tot, QZ.count) + '</b> random questions will be picked. Keys: <b>A-E</b> choose · <b>Enter</b> / <b>→</b> next.' : 'No questions for this subject yet.') + '</p><button class="mp-add" id="qzStart"' + (tot ? '' : ' disabled') + '>▶ Start quiz</button>');
  }
  function qzBank(d) {
    var sel = '<select id="qzBSub" class="mp-sel"><option value="0">All subjects</option>' + d.subjects.map(function (s) { return '<option value="' + s.id + '"' + (s.id === QZ.bankSub ? ' selected' : '') + '>' + esc(s.name) + '</option>'; }).join('') + '</select>';
    var list = d.questions.filter(function (q) { return !QZ.bankSub || q.subject_id === QZ.bankSub; });
    var rows = list.length ? list.map(function (q) {
      var s = d.subjects.filter(function (x) { return x.id === q.subject_id; })[0], cnt = q.option_e ? 5 : 4;
      var ops = LET.slice(0, cnt).map(function (l) { return '<li class="' + (l === q.correct_option ? 'ok' : '') + '"><b>' + l.toUpperCase() + '</b>' + esc(q['option_' + l]) + '</li>'; }).join('');
      return '<div class="ln-q"><div class="ln-q-h"><span>' + (s ? '<i class="mp-dot" style="background:' + s.color + '"></i>' + esc(s.name) : 'No subject') + (q.year ? ' · ' + esc(q.year) : '') + '</span><button class="mp-ib dng" data-qd="' + q.id + '" title="Delete question">✕</button></div><h4>' + esc(q.question) + '</h4><ul>' + ops + '</ul>' + (q.explanation ? '<p class="ln-exp">💡 ' + esc(q.explanation) + '</p>' : '') + '</div>';
    }).join('') : emptyBlock('🗂️', 'No questions here yet', 'Add your first question with the button above.');
    return '<div style="margin-bottom:12px">' + sel + '</div>' + rows;
  }
  function qzHistory(d) {
    if (!d.history.length) return card('', emptyBlock('🕘', 'No quizzes taken yet', 'Your scores will show up here after your first quiz.'));
    return card('Recent quizzes', d.history.map(function (h) {
      var p = Math.round(h.score_percent), c = p >= 75 ? '#10b981' : (p >= 50 ? '#f59e0b' : '#ef4444');
      return '<div class="ln-hist"><div><b>' + esc(h.quiz_title || h.subject_name) + '</b><span>' + esc(h.quiz_title ? h.subject_name + ' · ' : '') + dFull(h.taken_at) + '</span></div><div class="ln-hbar">' + bar(p, c) + '</div><strong style="color:' + c + '">' + h.correct_count + '/' + h.total_questions + ' · ' + p + '%</strong></div>';
    }).join(''));
  }
  function qzBind(pc) {
    var d = QZ.d;
    pc.querySelectorAll('#qzTabs button').forEach(function (b) { b.onclick = function () { QZ.tab = b.dataset.v; lsSet('qzTab', QZ.tab); qzDraw(pc); }; });
    var g = $('#qzGoBank', pc); if (g) g.onclick = function () { QZ.tab = 'bank'; qzDraw(pc); };
    var ss = $('#qzSub', pc); if (ss) ss.onchange = function () { QZ.sub = +ss.value; qzDraw(pc); };
    var sc = $('#qzCnt', pc); if (sc) sc.onchange = function () { QZ.count = +sc.value; lsSet('qzCount', QZ.count); qzDraw(pc); };
    var st = $('#qzStart', pc);
    if (st) st.onclick = function () {
      st.disabled = true; st.textContent = 'Preparing…';
      api('qz_start', { subject_id: QZ.sub, count: QZ.count }).then(function (r) {
        if (!r || !r.success) { st.disabled = false; st.textContent = '▶ Start quiz'; return toast((r && r.message) || 'Could not start the quiz', 'warn'); }
        QZ.run = { qs: r.questions, items: r.items, sub: r.subject_id || 0, i: 0, ans: {}, result: null, busy: false }; qzDraw(pc);
      });
    };
    var bs = $('#qzBSub', pc); if (bs) bs.onchange = function () { QZ.bankSub = +bs.value; qzDraw(pc); };
    pc.querySelectorAll('[data-qd]').forEach(function (b) {
      b.onclick = function () {
        confirmBox('Delete question?', 'This question will be removed from your bank.', 'Delete', function () {
          api('qz_delete', { id: +b.dataset.qd }).then(function (r) { toast((r && r.message) || 'Done', r && r.success ? 'ok' : 'warn'); qzLoad(pc); });
        });
      };
    });
    var nw = $('#qzNew', pc); if (nw) nw.onclick = function () { qzAddModal(pc); };
  }
  function qzAddModal(pc) {
    var d = QZ.d, subs = '<option value="0">No subject</option>' + d.subjects.map(function (s) { return '<option value="' + s.id + '"' + (s.id === QZ.bankSub ? ' selected' : '') + '>' + esc(s.name) + '</option>'; }).join('');
    var opt = LET.map(function (l) { return '<label class="ln-optrow"><input type="radio" name="qzc" value="' + l + '"' + (l === 'a' ? ' checked' : '') + ' title="Correct answer"><b>' + l.toUpperCase() + '</b><input data-o="' + l + '" placeholder="Option ' + l.toUpperCase() + (l === 'e' ? ' (optional)' : '') + '" maxlength="500"></label>'; }).join('');
    modal('<div class="px-h"><h3>Add a question</h3><button data-close class="px-x">✕</button></div><div class="px-err" id="pxErr"></div>' +
      '<div class="px-two"><div><label>Subject</label><select id="qzaSub">' + subs + '</select></div><div><label>Year (optional)</label><input id="qzaYear" maxlength="20" placeholder="e.g. 2023"></div></div>' +
      '<label>Question</label><textarea id="qzaQ" rows="3" placeholder="Type the question"></textarea><label>Options - select the round button of the correct answer</label>' + opt +
      '<label>Explanation (optional)</label><textarea id="qzaE" rows="2" placeholder="Why is it correct?"></textarea>' +
      '<div class="px-btns"><button data-close class="px-sec">Cancel</button><button id="qzaOk" class="px-pri">Add question</button></div>',
      function (ov, close) {
        ov.querySelector('.px-modal').style.maxWidth = '560px';
        var err = ov.querySelector('#pxErr'), ok = ov.querySelector('#qzaOk');
        setTimeout(function () { ov.querySelector('#qzaQ').focus(); }, 60);
        ok.onclick = function () {
          var p = { action: 'qz_add', subject_id: +ov.querySelector('#qzaSub').value, year: ov.querySelector('#qzaYear').value, question: ov.querySelector('#qzaQ').value.trim(), explanation: ov.querySelector('#qzaE').value.trim() };
          LET.forEach(function (l) { p['option_' + l] = ov.querySelector('[data-o=' + l + ']').value.trim(); });
          var c = ov.querySelector('input[name=qzc]:checked'); p.correct_option = c ? c.value : 'a';
          var e = !p.question ? 'Please type the question.' : (!p.option_a || !p.option_b || !p.option_c || !p.option_d ? 'Options A to D are required.' : (p.correct_option === 'e' && !p.option_e ? 'Option E is empty but marked correct.' : ''));
          if (e) { err.textContent = e; err.style.display = 'block'; return; }
          ok.disabled = true; ok.textContent = 'Saving…'; var a = p.action; delete p.action;
          api(a, p).then(function (r) {
            if (r && r.success) { close(); toast(r.message, 'ok'); qzLoad(pc); } else { ok.disabled = false; ok.textContent = 'Add question'; err.textContent = (r && r.message) || 'Something went wrong.'; err.style.display = 'block'; }
          });
        };
      });
  }

  /* running a quiz: one question at a time, answers are checked by the server when you submit */
  var qzKey = null;
  function qzRunDraw(pc) {
    var R = QZ.run;
    if (qzKey) { document.removeEventListener('keydown', qzKey); qzKey = null; }
    if (R.result) return qzResultDraw(pc);
    var q = R.qs[R.i], n = R.qs.length, answered = Object.keys(R.ans).length, last = R.i === n - 1;
    var ops = Object.keys(q.options).map(function (l) { return '<button class="ln-opt' + (R.ans[q.id] === l ? ' sel' : '') + '" data-l="' + l + '"><b>' + l.toUpperCase() + '</b><span>' + esc(q.options[l]) + '</span></button>'; }).join('');
    var dots = R.qs.map(function (x, i) { return '<i class="' + (i === R.i ? 'cur ' : '') + (R.ans[x.id] ? 'on' : '') + '" data-go="' + i + '" title="Question ' + (i + 1) + '"></i>'; }).join('');
    pc.innerHTML = '<div class="mp ln ln-run"><div class="mp-head"><p>Question ' + (R.i + 1) + ' of ' + n + ' · ' + answered + ' answered</p><div class="mp-head-r"><button class="mp-mini" id="qzQuit">✕ Quit quiz</button></div></div>' +
      bar(Math.round((R.i + 1) / n * 100), 'var(--accent)') + '<div class="ln-qbox"><div class="ln-qnum">Question ' + (R.i + 1) + '</div><h3>' + esc(q.question) + '</h3>' + ops + '</div>' +
      '<div class="ln-nav"><button class="mp-add ln-ghost" id="qzPrev"' + (R.i ? '' : ' disabled') + '>← Previous</button><div class="ln-dots">' + dots + '</div>' +
      (last ? '<button class="mp-add" id="qzSubmit"' + (R.busy ? ' disabled' : '') + '>' + (R.busy ? 'Checking…' : 'Submit quiz ✓') + '</button>' : '<button class="mp-add" id="qzNext">Next →</button>') + '</div></div>';
    function pick(l) { if (q.options[l]) { R.ans[q.id] = l; qzRunDraw(pc); } }
    pc.querySelectorAll('.ln-opt').forEach(function (b) { b.onclick = function () { pick(b.dataset.l); }; });
    pc.querySelectorAll('[data-go]').forEach(function (b) { b.onclick = function () { R.i = +b.dataset.go; qzRunDraw(pc); }; });
    var pv = $('#qzPrev', pc), nx = $('#qzNext', pc), sb = $('#qzSubmit', pc);
    if (pv) pv.onclick = function () { if (R.i > 0) { R.i--; qzRunDraw(pc); } };
    if (nx) nx.onclick = function () { if (R.i < n - 1) { R.i++; qzRunDraw(pc); } };
    function submit() {
      if (R.busy) return;
      var un = n - Object.keys(R.ans).length;
      var send = function () {
        R.busy = true; qzRunDraw(pc);
        api('qz_submit', { items: R.items, answers: R.ans, subject_id: R.sub }).then(function (r) {
          R.busy = false;
          if (!r || !r.success) { toast((r && r.message) || 'Could not submit', 'warn'); return qzRunDraw(pc); }
          R.result = r; qzRunDraw(pc);
        });
      };
      if (un > 0) confirmBox('Submit with unanswered questions?', 'You still have <b>' + un + '</b> unanswered question' + (un === 1 ? '' : 's') + '. They will count as wrong.', 'Submit', send); else send();
    }
    if (sb) sb.onclick = submit;
    $('#qzQuit', pc).onclick = function () { confirmBox('Quit this quiz?', 'Your answers so far will be lost and no score will be saved.', 'Quit', function () { QZ.run = null; qzDraw(pc); }); };
    qzKey = function (e) {
      if (!here('quiz') || !QZ.run || QZ.run.result || document.querySelector('.px-ov')) { document.removeEventListener('keydown', qzKey); return; }
      var k = e.key.toLowerCase();
      if (LET.indexOf(k) >= 0 && !e.ctrlKey && !e.altKey) { pick(k); }
      else if (k === 'arrowright' || k === 'enter') { e.preventDefault(); if (nx) nx.click(); else if (sb && k === 'enter' && R.ans[q.id]) submit(); }
      else if (k === 'arrowleft' && pv) { pv.click(); }
    };
    document.addEventListener('keydown', qzKey);
  }
  function qzResultDraw(pc) {
    var R = QZ.run, r = R.result, p = Math.round(r.score_percent), c = p >= 75 ? '#10b981' : (p >= 50 ? '#f59e0b' : '#ef4444');
    var msg = p >= 90 ? 'Outstanding! 🌟' : (p >= 75 ? 'Great work! 🎉' : (p >= 50 ? 'Good effort - keep practising 💪' : 'Keep going, review the answers below 📖'));
    var wrong = r.results.filter(function (x) { return !x.is_correct; }).length;
    var list = r.results.map(function (x, i) {
      var ops = Object.keys(x.options).map(function (l) {
        var cl = l === x.correct_option ? ' ok' : (l === x.selected ? ' bad' : '');
        return '<div class="ln-ro' + cl + '"><b>' + l.toUpperCase() + '</b><span>' + esc(x.options[l]) + '</span>' + (l === x.correct_option ? '<em>✓ Correct</em>' : (l === x.selected ? '<em>Your answer</em>' : '')) + '</div>';
      }).join('');
      return '<div class="ln-q ' + (x.is_correct ? 'good' : 'wrong') + '"><div class="ln-q-h"><span>' + (x.is_correct ? '✅ Correct' : (x.selected ? '❌ Wrong' : '⏭️ Not answered')) + ' · Question ' + (i + 1) + '</span></div><h4>' + esc(x.question) + '</h4>' + ops + (x.explanation ? '<p class="ln-exp">💡 ' + esc(x.explanation) + '</p>' : '') + '</div>';
    }).join('');
    pc.innerHTML = '<div class="mp ln"><div class="mp-card ln-score"><div class="ln-ring" style="--p:' + p + ';--c:' + c + '"><b>' + p + '%</b></div><h2>' + msg + '</h2><p>You got <b>' + r.correct + '</b> of <b>' + r.total + '</b> right' + (wrong ? ' · ' + wrong + ' to review' : '') + '</p>' +
      '<div class="ln-sbtn"><button class="mp-add" id="qzAgain">🔁 Try another quiz</button><button class="mp-add ln-ghost" id="qzDone">Back to Quiz Practice</button></div></div>' + list + '</div>';
    $('#qzAgain', pc).onclick = function () {
      QZ.run = null; api('qz_start', { subject_id: QZ.sub, count: QZ.count }).then(function (x) {
        if (!x || !x.success) { toast((x && x.message) || 'Could not start', 'warn'); return qzLoad(pc); }
        QZ.run = { qs: x.questions, items: x.items, sub: x.subject_id || 0, i: 0, ans: {}, result: null, busy: false }; qzDraw(pc);
      });
    };
    $('#qzDone', pc).onclick = function () { QZ.run = null; QZ.tab = 'history'; qzLoad(pc); };
  }

  /* ═════════════════════════════════════════════════════════════════
     MIND MAPS  (same data format as the website: nodes with id / text / x / y / color / parentId)
     ═════════════════════════════════════════════════════════════════ */
  var PALETTE = ['#f59e0b', '#10b981', '#ec4899', '#38bdf8', '#8b5cf6', '#f43f5e', '#84cc16', '#06b6d4'];
  var MM = { maps: [], id: null, title: '', nodes: [], sel: null, scale: 1, px: 0, py: 0, timer: null, dirty: false, editing: false, colorN: null, pc: null, bound: false };

  Pages['mind-map'] = function (pc) {
    MM.pc = pc;
    return api('mm_list').then(function (d) {
      if (!here('mind-map')) return;
      if (!d || !d.success) return errPage(pc, d);
      MM.maps = d.maps;
      if (!MM.maps.length) { MM.id = null; return mmEmpty(pc); }
      var last = +lsGet('mmLast', '0'), first = MM.maps.filter(function (m) { return m.id === last; })[0] || MM.maps[0];
      return mmOpen(pc, first.id);
    });
  };
  function mmEmpty(pc) {
    pc.innerHTML = '<div class="mp ln">' + emptyBlock('🧠', 'No mind maps yet', 'Mind maps help you connect ideas and revise a whole chapter on one page.') + '<div style="text-align:center"><button class="mp-add" id="mmFirst">＋ Create your first mind map</button></div></div>';
    $('#mmFirst', pc).onclick = function () { mmCreateModal(pc); };
  }
  function mmCreateModal(pc) {
    modal('<div class="px-h"><h3>New mind map</h3><button data-close class="px-x">✕</button></div><div class="px-err" id="pxErr"></div><label>Central topic</label><input id="mmNewT" data-focus maxlength="120" placeholder="e.g. Photosynthesis"><div class="px-btns"><button data-close class="px-sec">Cancel</button><button id="pxOk" class="px-pri">Create</button></div>',
      function (ov, close) {
        var err = ov.querySelector('#pxErr'), ok = ov.querySelector('#pxOk'), inp = ov.querySelector('#mmNewT');
        setTimeout(function () { inp.focus(); }, 60);
        function go() {
          ok.disabled = true; ok.textContent = 'Creating…';
          mmFlush().then(function () { return api('mm_create', { title: inp.value.trim() || 'Untitled Map' }); }).then(function (r) {
            if (r && r.success) { close(); toast(r.message, 'ok'); lsSet('mmLast', r.id); Pages['mind-map'](pc); }
            else { ok.disabled = false; ok.textContent = 'Create'; err.textContent = (r && r.message) || 'Could not create the map.'; err.style.display = 'block'; }
          });
        }
        ok.onclick = go; inp.onkeydown = function (e) { if (e.key === 'Enter') { e.preventDefault(); go(); } };
      });
  }
  function nodeById(id) { return MM.nodes.filter(function (n) { return n.id === id; })[0]; }
  function kids(id) { return MM.nodes.filter(function (n) { return n.parentId === id; }); }
  function rootNode() { return MM.nodes.filter(function (n) { return n.parentId === null; })[0]; }

  function mmOpen(pc, id) {
    return mmFlush().then(function () { return api('mm_get', { id: id }); }).then(function (d) {
      if (!here('mind-map')) return;
      if (!d || !d.success) { toast((d && d.message) || 'Could not open the map', 'warn'); return errPage(pc, d); }
      MM.id = d.map.id; MM.title = d.map.title; MM.nodes = d.map.nodes; MM.sel = null; MM.colorN = null; MM.dirty = false; lsSet('mmLast', MM.id);
      mmShell(pc); mmRender(); mmFit();
    });
  }
  function mmShell(pc) {
    var tabs = MM.maps.map(function (m) { return '<div class="ln-mmtab' + (m.id === MM.id ? ' on' : '') + '" data-m="' + m.id + '"><span>' + esc(m.title) + '</span><b data-x="' + m.id + '" title="Delete map">✕</b></div>'; }).join('');
    pc.innerHTML = '<div class="mp ln ln-mm"><div class="mp-head"><div class="ln-mmtitle"><h2 id="mmTitle" spellcheck="false" title="Click to rename">' + esc(MM.title) + '</h2><span id="mmSub"></span><em id="mmSave"></em></div>' +
      '<div class="mp-head-r"><button class="mp-mini" id="mmTidy" title="Arrange the nodes neatly around the centre">✨ Tidy</button><button class="mp-mini" id="mmPng">🖼️ PNG</button><button class="mp-mini" id="mmJson">💾 JSON</button><button class="mp-add" id="mmNew">＋ New map</button></div></div>' +
      '<div class="ln-mmtabs">' + tabs + '</div>' +
      '<div class="ln-canvas" id="mmBox"><div class="ln-vp" id="mmVp"><div class="ln-world" id="mmWorld"><svg class="ln-edges" id="mmEdges"></svg></div></div>' +
      '<div class="ln-zoom"><button id="mmZo" title="Zoom out">−</button><span id="mmZp">100%</span><button id="mmZi" title="Zoom in">＋</button><button id="mmFit" title="Fit to screen">⤢</button></div>' +
      '<div class="ln-hint">Drag to pan · scroll to zoom · double-click a node to rename · Tab adds a child · Del deletes</div>' +
      '<div class="ln-bar" id="mmBar"><button id="mmbAdd" title="Add child (Tab)">＋ Child</button><button id="mmbEdit" title="Rename (F2)">✎ Rename</button><span id="mmbSw" class="ln-sw"></span><button id="mmbDel" class="dng" title="Delete (Del)">🗑</button></div></div></div>';
    $('#mmNew', pc).onclick = function () { mmCreateModal(pc); };
    pc.querySelectorAll('.ln-mmtab').forEach(function (t) { t.onclick = function (e) { var x = e.target.closest('[data-x]'); if (x) { e.stopPropagation(); return mmDelMap(pc, +x.dataset.x); } if (+t.dataset.m !== MM.id) mmOpen(pc, +t.dataset.m); }; });
    var ti = $('#mmTitle', pc);
    ti.onclick = function () { ti.setAttribute('contenteditable', 'true'); ti.focus(); };
    ti.onkeydown = function (e) { if (e.key === 'Enter') { e.preventDefault(); ti.blur(); } if (e.key === 'Escape') { ti.textContent = MM.title; ti.blur(); } e.stopPropagation(); };
    ti.onblur = function () {
      ti.removeAttribute('contenteditable'); var v = (ti.textContent || '').trim().slice(0, 120) || 'Untitled Map'; ti.textContent = v;
      if (v !== MM.title) { MM.title = v; var m = MM.maps.filter(function (x) { return x.id === MM.id; })[0]; if (m) m.title = v; var tb = pc.querySelector('.ln-mmtab.on span'); if (tb) tb.textContent = v; api('mm_rename', { id: MM.id, title: v }); }
    };
    $('#mmTidy', pc).onclick = function () { mmTidy(); };
    $('#mmPng', pc).onclick = mmExportPng; $('#mmJson', pc).onclick = mmExportJson;
    $('#mmZi', pc).onclick = function () { mmZoomC(1.2); }; $('#mmZo', pc).onclick = function () { mmZoomC(1 / 1.2); }; $('#mmFit', pc).onclick = mmFit;
    $('#mmbAdd', pc).onclick = function () { if (MM.sel) mmAddChild(MM.sel); };
    $('#mmbEdit', pc).onclick = function () { if (MM.sel) mmEdit(MM.sel); };
    $('#mmbDel', pc).onclick = mmDelNode;
    mmBindCanvas(pc);
  }
  function mmDelMap(pc, id) {
    var m = MM.maps.filter(function (x) { return x.id === id; })[0]; if (!m) return;
    confirmBox('Delete this mind map?', '<b>' + esc(m.title) + '</b> and everything in it will be permanently deleted.', 'Delete', function () {
      (id === MM.id ? (clearTimeout(MM.timer), MM.dirty = false, Promise.resolve()) : Promise.resolve()).then(function () { return api('mm_delete', { id: id }); }).then(function (r) {
        toast((r && r.message) || 'Done', r && r.success ? 'ok' : 'warn'); if (+lsGet('mmLast', '0') === id) lsSet('mmLast', '0'); Pages['mind-map'](pc);
      });
    });
  }

  /* ── rendering ── */
  function $w() { return document.getElementById('mmWorld'); }
  function mmRender() {
    var w = $w(); if (!w) return;
    w.querySelectorAll('.ln-node').forEach(function (n) { n.remove(); });
    MM.nodes.forEach(function (n) {
      var d = document.createElement('div'), root = n.parentId === null;
      d.className = 'ln-node ' + (root ? 'root' : 'leaf') + (n.id === MM.sel ? ' sel' : ''); d.dataset.id = n.id; d.style.left = n.x + 'px'; d.style.top = n.y + 'px';
      if (!root) { var c = colorOf(n.color); d.style.color = c; d.style.background = rgba(c, .14); d.style.borderColor = rgba(c, .45); d.style.boxShadow = '0 0 14px ' + rgba(c, .22); }
      var t = document.createElement('span'); t.className = 'ln-nt'; t.textContent = n.text; d.appendChild(t);
      var add = document.createElement('i'); add.className = 'ln-plus'; add.textContent = '+'; add.title = 'Add child'; add.onpointerdown = function (e) { e.stopPropagation(); }; add.onclick = function (e) { e.stopPropagation(); mmAddChild(n.id); }; d.appendChild(add);
      mmNodeEvents(d, n, t); w.appendChild(d);
    });
    mmEdges(); var s = $('#mmSub'); if (s) s.textContent = MM.nodes.length + (MM.nodes.length === 1 ? ' node' : ' nodes'); mmBar();
  }
  function mmEdges() {
    var svg = document.getElementById('mmEdges'); if (!svg) return;
    var xs = MM.nodes.map(function (n) { return n.x; }), ys = MM.nodes.map(function (n) { return n.y; }), pad = 500;
    var minX = Math.min.apply(null, xs.concat([0])), maxX = Math.max.apply(null, xs.concat([0])), minY = Math.min.apply(null, ys.concat([0])), maxY = Math.max.apply(null, ys.concat([0]));
    var L = minX - pad, T = minY - pad, W = maxX - minX + pad * 2, H = maxY - minY + pad * 2;
    svg.setAttribute('viewBox', L + ' ' + T + ' ' + W + ' ' + H); svg.style.cssText = 'left:' + L + 'px;top:' + T + 'px;width:' + W + 'px;height:' + H + 'px';
    var h = '';
    MM.nodes.forEach(function (n) {
      if (n.parentId === null) return; var p = nodeById(n.parentId); if (!p) return;
      var dx = n.x - p.x, dy = n.y - p.y, a, b, c, e;
      if (Math.abs(dx) >= Math.abs(dy)) { a = p.x + dx / 2; b = p.y; c = p.x + dx / 2; e = n.y; } else { a = p.x; b = p.y + dy / 2; c = n.x; e = p.y + dy / 2; }
      var depth = 0, cur = n; while (cur && cur.parentId !== null) { depth++; cur = nodeById(cur.parentId); }
      h += '<path d="M ' + p.x + ' ' + p.y + ' C ' + a + ' ' + b + ', ' + c + ' ' + e + ', ' + n.x + ' ' + n.y + '" stroke="' + colorOf(n.color) + '" stroke-width="' + Math.max(1.8, 4.4 - depth * .9) + '" stroke-linecap="round" fill="none" opacity=".9"/>';
    });
    svg.innerHTML = h;
  }
  function mmApply() {
    var w = $w(); if (!w) return; w.style.transform = 'translate(' + MM.px + 'px,' + MM.py + 'px) scale(' + MM.scale + ')';
    var z = $('#mmZp'); if (z) z.textContent = Math.round(MM.scale * 100) + '%'; mmBar();
  }
  function mmZoomAt(cx, cy, ns) {
    ns = Math.min(2.5, Math.max(.2, ns)); var wx = (cx - MM.px) / MM.scale, wy = (cy - MM.py) / MM.scale;
    MM.scale = ns; MM.px = cx - wx * ns; MM.py = cy - wy * ns; mmApply();
  }
  function mmZoomC(f) { var r = document.getElementById('mmVp').getBoundingClientRect(); mmZoomAt(r.width / 2, r.height / 2, MM.scale * f); }
  function mmFit() {
    var vp = document.getElementById('mmVp'); if (!vp) return; var r = vp.getBoundingClientRect();
    if (!MM.nodes.length || !r.width) { MM.scale = 1; MM.px = r.width / 2; MM.py = r.height / 2; return mmApply(); }
    var x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
    MM.nodes.forEach(function (n) { x0 = Math.min(x0, n.x - 90); x1 = Math.max(x1, n.x + 90); y0 = Math.min(y0, n.y - 40); y1 = Math.max(y1, n.y + 40); });
    var s = Math.min(1.3, Math.max(.3, Math.min(r.width / (x1 - x0), r.height / (y1 - y0)) * .88));
    MM.scale = s; MM.px = r.width / 2 - (x0 + x1) / 2 * s; MM.py = r.height / 2 - (y0 + y1) / 2 * s; mmApply();
  }
  /* floating toolbar above the selected node */
  function mmBar() {
    var bar = document.getElementById('mmBar'), box = document.getElementById('mmBox'); if (!bar || !box) return;
    var n = MM.sel ? nodeById(MM.sel) : null; if (!n) { bar.classList.remove('show'); return; }
    var el = $w().querySelector('.ln-node[data-id="' + n.id + '"]'); if (!el) return;
    var r = el.getBoundingClientRect(), b = box.getBoundingClientRect(), root = n.parentId === null;
    $('#mmbDel').style.display = root ? 'none' : ''; var sw = $('#mmbSw');
    if (root) sw.innerHTML = ''; else if (sw.dataset.for !== n.id + n.color) {
      sw.dataset.for = n.id + n.color;
      sw.innerHTML = PALETTE.map(function (c) { return '<i data-c="' + c + '" class="' + (c === n.color ? 'on' : '') + '" style="background:' + c + '"></i>'; }).join('');
      sw.querySelectorAll('i').forEach(function (i) { i.onclick = function () { n.color = i.dataset.c; sw.dataset.for = ''; mmRender(); mmSave(); }; });
    }
    var left = Math.max(120, Math.min(b.width - 120, r.left - b.left + r.width / 2)), top = r.top - b.top - 12;
    bar.style.left = left + 'px'; bar.style.top = Math.max(46, top) + 'px'; bar.classList.add('show');
  }
  function mmSelect(id) {
    MM.sel = id; var w = $w(); if (!w) return;
    w.querySelectorAll('.ln-node').forEach(function (d) { d.classList.toggle('sel', d.dataset.id === id); }); mmBar();
  }

  /* ── node actions ── */
  function nextColor() { if (MM.colorN === null) MM.colorN = MM.nodes.filter(function (n) { return n.parentId !== null; }).length; return PALETTE[MM.colorN++ % PALETTE.length]; }
  function newId() { return 'n' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function mmAddChild(pid) {
    if (MM.nodes.length >= 600) return toast('This map is full (600 nodes).', 'warn');
    var p = nodeById(pid); if (!p) return; var sibs = kids(pid), root = rootNode(), dx, dy;
    if (p.parentId === null) { var ang = (sibs.length * 46 - 90) * Math.PI / 180; dx = Math.cos(ang); dy = Math.sin(ang); }
    else {
      var rx = p.x - (root ? root.x : 0), ry = p.y - (root ? root.y : 0), len = Math.hypot(rx, ry) || 1; dx = rx / len; dy = ry / len;
      var pa = (sibs.length - (sibs.length - 1) / 2) * .35, ca = Math.cos(pa), sa = Math.sin(pa), ndx = dx * ca - dy * sa, ndy = dx * sa + dy * ca; dx = ndx; dy = ndy;
    }
    var dist = (p.parentId === null ? 190 : 150) + (Math.random() * 36 - 18), jit = (Math.random() * 10 - 5) * Math.PI / 180, jc = Math.cos(jit), js = Math.sin(jit);
    var n = { id: newId(), text: 'New idea', x: Math.round(p.x + (dx * jc - dy * js) * dist), y: Math.round(p.y + (dx * js + dy * jc) * dist), color: p.parentId === null ? nextColor() : p.color, parentId: pid };
    MM.nodes.push(n); MM.sel = n.id; mmRender(); mmSave(); setTimeout(function () { mmEdit(n.id); }, 50);
  }
  function mmDelNode() {
    var n = MM.sel ? nodeById(MM.sel) : null; if (!n) return toast('Select a node first', 'warn');
    if (n.parentId === null) return toast("The central node can't be deleted", 'warn');
    confirmBox('Delete this idea?', 'This node and any of its own branches will be removed.', 'Delete', function () {
      var rm = {}; rm[n.id] = 1; var grew = true;
      while (grew) { grew = false; MM.nodes.forEach(function (x) { if (x.parentId && rm[x.parentId] && !rm[x.id]) { rm[x.id] = 1; grew = true; } }); }
      MM.nodes = MM.nodes.filter(function (x) { return !rm[x.id]; }); MM.sel = null; mmRender(); mmSave();
    });
  }
  function mmEdit(id) {
    var el = $w() && $w().querySelector('.ln-node[data-id="' + id + '"] .ln-nt'); if (!el) return;
    MM.editing = true; el.setAttribute('contenteditable', 'true'); el.focus();
    var r = document.createRange(); r.selectNodeContents(el); var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
  }
  function mmNodeEvents(d, n, t) {
    var drag = null;
    d.onpointerdown = function (e) {
      if (MM.editing || e.button !== 0) return; e.stopPropagation(); d.setPointerCapture(e.pointerId);
      drag = { x: e.clientX, y: e.clientY, nx: n.x, ny: n.y, moved: false }; mmSelect(n.id);
    };
    d.onpointermove = function (e) {
      if (!drag) return; var dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      if (!drag.moved && Math.hypot(dx, dy) < 4) return; drag.moved = true;
      n.x = Math.round(drag.nx + dx / MM.scale); n.y = Math.round(drag.ny + dy / MM.scale); d.style.left = n.x + 'px'; d.style.top = n.y + 'px'; mmEdges(); mmBar();
    };
    d.onpointerup = function () { if (drag && drag.moved) mmSave(); drag = null; };
    d.ondblclick = function (e) { e.stopPropagation(); mmSelect(n.id); mmEdit(n.id); };
    t.onblur = function () {
      MM.editing = false; t.removeAttribute('contenteditable'); var v = (t.textContent || '').trim().slice(0, 200) || 'New idea';
      if (v !== n.text) { n.text = v; mmSave(); } t.textContent = n.text; mmEdges(); mmBar();
    };
    t.onkeydown = function (e) { e.stopPropagation(); if (e.key === 'Enter') { e.preventDefault(); t.blur(); } if (e.key === 'Escape') { e.preventDefault(); t.textContent = n.text; t.blur(); } };
  }
  function mmBindCanvas(pc) {
    var vp = document.getElementById('mmVp'), pan = null;
    vp.onpointerdown = function (e) {
      if (e.target.closest('.ln-node') || e.button !== 0) return; vp.setPointerCapture(e.pointerId);
      pan = { x: e.clientX, y: e.clientY, px: MM.px, py: MM.py, moved: false }; vp.classList.add('panning');
    };
    vp.onpointermove = function (e) {
      if (!pan) return; var dx = e.clientX - pan.x, dy = e.clientY - pan.y; if (Math.hypot(dx, dy) > 3) pan.moved = true;
      MM.px = pan.px + dx; MM.py = pan.py + dy; mmApply();
    };
    vp.onpointerup = function () { if (pan && !pan.moved) mmSelect(null); pan = null; vp.classList.remove('panning'); };
    vp.addEventListener('wheel', function (e) { e.preventDefault(); var r = vp.getBoundingClientRect(); mmZoomAt(e.clientX - r.left, e.clientY - r.top, MM.scale * (e.deltaY < 0 ? 1.1 : .9)); }, { passive: false });
    if (!MM.bound) {
      MM.bound = true;
      document.addEventListener('keydown', function (e) {
        if (!here('mind-map') || MM.editing || document.querySelector('.px-ov')) return;
        var tg = document.activeElement && document.activeElement.tagName; if (tg === 'INPUT' || tg === 'TEXTAREA' || (document.activeElement && document.activeElement.isContentEditable)) return;
        if ((e.key === 'Delete' || e.key === 'Backspace') && MM.sel) { e.preventDefault(); mmDelNode(); }
        else if (e.key === 'Tab' && MM.sel) { e.preventDefault(); mmAddChild(MM.sel); }
        else if (e.key === 'F2' && MM.sel) { e.preventDefault(); mmEdit(MM.sel); }
        else if (e.key === 'Escape') mmSelect(null);
      });
      window.addEventListener('hashchange', function () { if (!here('mind-map')) mmFlush(); });
      window.addEventListener('beforeunload', function () { mmFlush(); });
      window.addEventListener('resize', function () { if (here('mind-map') && MM.id) mmBar(); });
    }
  }
  /* radial "tidy" layout around the central node */
  function mmTidy() {
    var root = rootNode(); if (!root || MM.nodes.length < 2) return; root.x = 0; root.y = 0;
    function place(n, ang, spread, depth) {
      var ch = kids(n.id); if (!ch.length) return;
      ch.forEach(function (c, i) {
        var a = depth === 0 ? -Math.PI / 2 + i * 2 * Math.PI / ch.length : ang + (ch.length === 1 ? 0 : (i / (ch.length - 1) - .5) * spread), r = depth === 0 ? 240 : 175;
        c.x = Math.round(n.x + Math.cos(a) * r); c.y = Math.round(n.y + Math.sin(a) * r);
        place(c, a, depth === 0 ? Math.min(1.7, 2 * Math.PI / ch.length * .95) : Math.max(.7, spread * .85), depth + 1);
      });
    }
    place(root, 0, 0, 0); mmRender(); mmFit(); mmSave(); toast('Nodes arranged', 'ok');
  }

  /* ── saving ── */
  function mmSave() {
    MM.dirty = true; var m = MM.maps.filter(function (x) { return x.id === MM.id; })[0]; if (m) m.node_count = MM.nodes.length;
    var b = $('#mmSave'); if (b) { b.textContent = 'Saving…'; b.className = 'saving'; }
    clearTimeout(MM.timer); MM.timer = setTimeout(mmFlush, 700);
  }
  function mmFlush() {
    clearTimeout(MM.timer); if (!MM.dirty || !MM.id) return Promise.resolve();
    MM.dirty = false;
    return api('mm_save', { id: MM.id, title: MM.title, nodes: MM.nodes }).then(function (r) {
      var b = $('#mmSave'), ok = r && r.success;
      if (!ok) MM.dirty = true;
      if (b) { b.textContent = ok ? 'Saved' : 'Save failed'; b.className = ok ? 'saved' : 'saving'; setTimeout(function () { if (b) b.textContent = ''; }, 1600); }
      if (!ok) toast((r && r.message) || 'Could not save the mind map', 'warn');
    });
  }

  /* ── export (drawn on a canvas; the app shows the Windows "Save as" dialog) ── */
  function fileSafe() { return (MM.title || 'mindmap').replace(/[^a-z0-9\-_ ]/gi, '').trim() || 'mindmap'; }
  function mmExportJson() {
    var txt = JSON.stringify({ title: MM.title, nodes: MM.nodes }, null, 2), b64 = btoa(unescape(encodeURIComponent(txt)));
    window.st.saveFile(fileSafe() + '.json', b64).then(function (r) { if (r && r.success) toast('Saved to ' + r.path, 'ok'); else if (r && !r.canceled) toast((r && r.message) || 'Could not save', 'warn'); });
  }
  function mmExportPng() {
    if (!MM.nodes.length) return;
    var f = '700 14px Inter, "Segoe UI", sans-serif', cv = document.createElement('canvas'), cx = cv.getContext('2d'); cx.font = f;
    var boxes = MM.nodes.map(function (n) { var root = n.parentId === null; cx.font = (root ? '800 16px' : '700 14px') + ' Inter, "Segoe UI", sans-serif'; var w = cx.measureText(n.text).width + (root ? 52 : 36), h = root ? 44 : 34; return { n: n, w: w, h: h, root: root }; });
    var x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9; boxes.forEach(function (b) { x0 = Math.min(x0, b.n.x - b.w / 2); x1 = Math.max(x1, b.n.x + b.w / 2); y0 = Math.min(y0, b.n.y - b.h / 2); y1 = Math.max(y1, b.n.y + b.h / 2); });
    var pad = 60, S = 2, W = Math.ceil(x1 - x0 + pad * 2), H = Math.ceil(y1 - y0 + pad * 2);
    if (W * S > 8000 || H * S > 8000) S = 1;
    cv.width = W * S; cv.height = H * S; cx = cv.getContext('2d'); cx.scale(S, S); cx.fillStyle = '#0d0d14'; cx.fillRect(0, 0, W, H);
    function X(x) { return x - x0 + pad; } function Y(y) { return y - y0 + pad; }
    MM.nodes.forEach(function (n) {
      if (n.parentId === null) return; var p = nodeById(n.parentId); if (!p) return; var dx = n.x - p.x, dy = n.y - p.y, a, b, c, e;
      if (Math.abs(dx) >= Math.abs(dy)) { a = p.x + dx / 2; b = p.y; c = p.x + dx / 2; e = n.y; } else { a = p.x; b = p.y + dy / 2; c = n.x; e = p.y + dy / 2; }
      var depth = 0, cur = n; while (cur && cur.parentId !== null) { depth++; cur = nodeById(cur.parentId); }
      cx.beginPath(); cx.moveTo(X(p.x), Y(p.y)); cx.bezierCurveTo(X(a), Y(b), X(c), Y(e), X(n.x), Y(n.y)); cx.strokeStyle = colorOf(n.color); cx.lineWidth = Math.max(1.8, 4.4 - depth * .9); cx.lineCap = 'round'; cx.stroke();
    });
    function rr(x, y, w, h, r) { cx.beginPath(); cx.moveTo(x + r, y); cx.arcTo(x + w, y, x + w, y + h, r); cx.arcTo(x + w, y + h, x, y + h, r); cx.arcTo(x, y + h, x, y, r); cx.arcTo(x, y, x + w, y, r); cx.closePath(); }
    boxes.forEach(function (b) {
      var x = X(b.n.x) - b.w / 2, y = Y(b.n.y) - b.h / 2, c = colorOf(b.n.color); rr(x, y, b.w, b.h, b.h / 2);
      if (b.root) { var acc = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#6366f1', g = cx.createLinearGradient(x, y, x + b.w, y + b.h); g.addColorStop(0, acc); g.addColorStop(1, '#8b5cf6'); cx.fillStyle = g; cx.fill(); cx.fillStyle = '#fff'; cx.font = '800 16px Inter, "Segoe UI", sans-serif'; }
      else { cx.fillStyle = '#14141d'; cx.fill(); cx.fillStyle = rgba(c, .16); cx.fill(); cx.strokeStyle = rgba(c, .55); cx.lineWidth = 1.5; cx.stroke(); cx.fillStyle = c; cx.font = '700 14px Inter, "Segoe UI", sans-serif'; }
      cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.fillText(b.n.text, X(b.n.x), Y(b.n.y) + 1);
    });
    var b64 = cv.toDataURL('image/png').split(',')[1];
    window.st.saveFile(fileSafe() + '.png', b64).then(function (r) { if (r && r.success) toast('Saved to ' + r.path, 'ok'); else if (r && !r.canceled) toast((r && r.message) || 'Could not save', 'warn'); });
  }
})();
