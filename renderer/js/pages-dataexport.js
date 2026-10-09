/* StudyTrack Desktop - Data Export & Import (same sections, CSV layout and import rules as the website's data-export.php).
   Route: #/data-export.  Data: pages13.php (actions de_*).  Export shows the Windows "Save as" dialog.
   Needs js/pages-extra.js (window.StUI).  Styles: css/pages-dataexport.css */
(function () {
  var Pages = window.stPages, TITLES = window.stTitles, api = window.stApi, UI = window.StUI;
  if (!Pages || !api || !UI) return;
  var toast = UI.toast, modal = UI.modal, errPage = UI.errPage;
  TITLES['data-export'] = 'Data Export & Import';

  function esc(s) { return E(String(s == null ? '' : s)); }
  function $(s, r) { return (r || document).querySelector(s); }
  var STAT_LABELS = { subjects: 'Subjects', marks: 'Marks', sessions: 'Sessions', tasks: 'Tasks', goals: 'Goals', attendance: 'Classes', habits: 'Habits', habit_logs: 'Habit check-ins',
    notes: 'Notes', flashcards: 'Flashcards', timetable: 'Timetable slots', reminders: 'Reminders', streaks: 'Streak days', pomodoro: 'Timer settings', mindmaps: 'Mind maps',
    syllabus: 'Syllabus topics', topicreviews: 'Topic reviews', quiz_questions: 'Quiz questions', quiz_attempts: 'Quiz attempts', pastpapers: 'Past papers', resources: 'Resources',
    youtube: 'YouTube favourites', skipped: 'Skipped (duplicates / invalid)' };

  var fmt = 'json', mode = 'merge', backup = null, fileName = '';

  function group(list, idPrefix, withCount, counts) {
    var o = '', g = null;
    list.forEach(function (s) {
      if (s.group !== g) { g = s.group; o += '<div class="de-glabel">' + esc(g) + '</div>'; }
      o += '<label class="de-row on" id="' + idPrefix + s.key + '-row"><input type="checkbox" data-k="' + s.key + '" checked><span class="de-ic">' + s.icon + '</span>' +
        '<span class="de-lb"><b>' + esc(s.label) + '</b>' + (withCount ? '<small>' + esc(s.desc) + '</small>' : '') + '</span>' + (withCount ? '<span class="de-ct">' + (counts[s.key] || 0) + '</span>' : '') + '</label>';
    });
    return o;
  }

  Pages['data-export'] = function (pc) {
    fmt = 'json'; mode = 'merge'; backup = null; fileName = '';
    return api('de_info').then(function (d) {
      if (!d || !d.success) return errPage(pc, d);
      var S = d.sections, C = d.counts, keys = S.map(function (s) { return s.key; });
      var o = '<div class="de-wrap"><div class="de-head"><div class="de-title">📦 Data Export &amp; Import</div><div class="de-sub">Backup your entire account or restore it from a previous export</div></div>' +
        '<div class="de-stats">' + S.map(function (s) { return '<div class="de-stat"><b>' + (C[s.key] || 0) + '</b><span>' + esc(s.label) + '</span></div>'; }).join('') + '</div><div class="de-grid">';

      /* export */
      o += '<div class="de-card"><div class="de-card-t">⬇️ Export Data</div><div class="de-card-s">Save your data as JSON or CSV</div>' +
        '<div class="de-lab">Format</div><div class="de-two"><button class="de-opt on" data-fmt="json"><i>{ }</i>JSON<small>Re-importable</small></button><button class="de-opt" data-fmt="csv"><i>📊</i>CSV<small>Excel / Sheets</small></button></div>' +
        '<div class="de-lab">What to export</div><div class="de-checks"><label class="de-row on" id="deAllRow"><input type="checkbox" id="deAll" checked><span class="de-ic">📦</span><span class="de-lb"><b>Full Backup</b><small>Everything below in one file</small></span></label>' +
        group(S, 'dex-', true, C) + '</div><button class="de-go" id="deExport">⬇️ Save Export…</button></div>';

      /* import */
      o += '<div class="de-card"><div class="de-card-t">⬆️ Import Data</div><div class="de-card-s">Restore from a StudyTrack JSON backup file</div>' +
        '<div class="de-lab">Import Mode</div><div class="de-two"><button class="de-opt on" data-mode="merge"><i>🔀</i>Merge<small>Add to existing data</small></button><button class="de-opt" data-mode="replace"><i>🔄</i>Replace<small>Overwrite existing</small></button></div>' +
        '<div class="de-warn" id="deWarn" hidden>⚠️ <span><b>Replace mode</b> will permanently delete your selected existing data before importing. This cannot be undone.</span></div>' +
        '<div class="de-lab">Sections to import</div><div class="de-checks" style="margin-bottom:14px">' + group(S, 'dei-', false, C) + '</div>' +
        '<div class="de-drop" id="deDrop"><input type="file" id="deFile" accept=".json,application/json"><div class="de-drop-ic">📂</div><div class="de-drop-t">Drop your JSON backup here</div><div class="de-drop-s">or click to browse</div><div class="de-drop-f" id="deFileName"></div></div>' +
        '<div class="de-meta" id="deMeta" hidden></div><button class="de-go alt" id="deImport" disabled>Select a file first</button><div class="de-result" id="deResult" hidden></div></div></div></div>';
      pc.innerHTML = o;

      var exportBox = pc.querySelectorAll('.de-checks')[0], importBox = pc.querySelectorAll('.de-checks')[1], all = $('#deAll', pc);
      function rowToggle(cb) { var r = cb.closest('.de-row'); if (r) r.classList.toggle('on', cb.checked); }
      pc.querySelectorAll('.de-row input').forEach(function (cb) { cb.addEventListener('change', function () { rowToggle(cb); }); });
      function eachCb(box, fn) { box.querySelectorAll('input[data-k]').forEach(fn); }
      all.addEventListener('change', function () { eachCb(exportBox, function (c) { c.checked = all.checked; rowToggle(c); }); });
      exportBox.addEventListener('change', function (e) {
        if (!e.target.getAttribute('data-k')) return;
        var every = true; eachCb(exportBox, function (c) { if (!c.checked) every = false; }); all.checked = every; rowToggle(all);
      });
      pc.querySelectorAll('[data-fmt]').forEach(function (b) { b.onclick = function () { fmt = b.getAttribute('data-fmt'); pc.querySelectorAll('[data-fmt]').forEach(function (x) { x.classList.toggle('on', x === b); }); }; });
      pc.querySelectorAll('[data-mode]').forEach(function (b) { b.onclick = function () { mode = b.getAttribute('data-mode'); pc.querySelectorAll('[data-mode]').forEach(function (x) { x.classList.toggle('on', x === b); }); $('#deWarn', pc).hidden = mode !== 'replace'; }; });
      function picked(box) { var a = []; eachCb(box, function (c) { if (c.checked) a.push(c.getAttribute('data-k')); }); return a; }

      /* export -> Windows "Save as" */
      var exBtn = $('#deExport', pc);
      exBtn.onclick = function () {
        var sel = all.checked ? 'all' : picked(exportBox);
        if (sel !== 'all' && !sel.length) return toast('Please select at least one section to export.', 'warn');
        exBtn.disabled = true; exBtn.textContent = 'Preparing…';
        api('de_export', { sections: sel, format: fmt }).then(function (r) {
          if (!r || !r.success) { toast((r && r.message) || 'Export failed.', 'warn'); return; }
          return window.st.saveFile(r.filename, r.content).then(function (s) {
            if (s && s.success) toast('✅ Saved to ' + s.path, 'ok'); else if (s && !s.canceled) toast((s && s.message) || 'Could not save the file', 'warn');
          });
        }).then(function () { exBtn.disabled = false; exBtn.textContent = '⬇️ Save Export…'; }, function () { exBtn.disabled = false; exBtn.textContent = '⬇️ Save Export…'; });
      };

      /* import */
      var imBtn = $('#deImport', pc), dz = $('#deDrop', pc), fi = $('#deFile', pc), resEl = $('#deResult', pc);
      var DK = {}; S.forEach(function (s) { DK[s.key] = s.data_key; });
      function readFile(f) {
        if (!f) return;
        if (!/\.json$/i.test(f.name)) return toast('Please choose a .json backup file.', 'warn');
        var rd = new FileReader();
        rd.onload = function () {
          try {
            var j = JSON.parse(rd.result);
            if (!j._meta || !j.data) throw new Error('bad');
            backup = j; fileName = f.name; resEl.hidden = true;
            var m = j._meta, parts = [];
            S.forEach(function (s) {
              var v = j.data[DK[s.key]], n = 0;
              if (Array.isArray(v)) n = v.length; else if (s.key === 'quiz' && v) n = ((v.questions || []).length) + ((v.attempts || []).length); else if (s.key === 'pomodoro' && v && Object.keys(v).length) n = 1;
              if (n > 0) parts.push(s.icon + ' ' + n + ' ' + s.label);
            });
            $('#deFileName', pc).textContent = '📄 ' + f.name; $('#deFileName', pc).style.display = 'block';
            var me = $('#deMeta', pc); me.hidden = false;
            me.innerHTML = '<b>📦 ' + esc(m.app) + ' Backup</b><br>Exported: ' + esc(m.exported_at) + ' &nbsp;|&nbsp; By: ' + esc(m.exported_by || '—') + '<br>Contains: ' + (parts.length ? esc(parts.join(', ')) : 'no recognizable sections');
            imBtn.disabled = false; imBtn.textContent = 'Start Import';
          } catch (e) { backup = null; imBtn.disabled = true; imBtn.textContent = 'Select a file first'; toast('Could not read file. Make sure it is a valid StudyTrack JSON backup.', 'warn'); }
        };
        rd.readAsText(f);
      }
      fi.onchange = function () { readFile(fi.files[0]); };
      dz.addEventListener('dragover', function (e) { e.preventDefault(); dz.classList.add('drag'); });
      dz.addEventListener('dragleave', function () { dz.classList.remove('drag'); });
      dz.addEventListener('drop', function (e) { e.preventDefault(); dz.classList.remove('drag'); readFile(e.dataTransfer.files[0]); });

      function runImport(sections) {
        imBtn.disabled = true; imBtn.textContent = 'Importing…';
        api('de_import', { backup: backup, mode: mode, sections: sections }).then(function (r) {
          resEl.hidden = false;
          if (r && r.success) {
            var st = r.stats || {}, h = '';
            Object.keys(STAT_LABELS).forEach(function (k) { if (st[k]) h += '<div class="de-rs"><b>' + st[k] + '</b><span>' + esc(STAT_LABELS[k]) + '</span></div>'; });
            resEl.className = 'de-result ok';
            resEl.innerHTML = '<div class="de-rt">✅ Import Successful!</div><div style="font-size:12px;opacity:.8;margin-bottom:8px">Data has been added to your account.</div><div class="de-rrow">' + (h || '<span style="font-size:12px">Nothing new to add.</span>') + '</div>';
            imBtn.textContent = 'Import another file'; imBtn.disabled = true; backup = null;
            setTimeout(function () { if (document.body.contains(pc.querySelector('.de-wrap'))) Pages['data-export'](pc); }, 3500);
          } else {
            resEl.className = 'de-result err';
            resEl.innerHTML = '<div class="de-rt">❌ Import Failed</div>' + esc((r && r.message) || 'Unknown error.');
            imBtn.disabled = false; imBtn.textContent = 'Try Again';
          }
        });
      }
      imBtn.onclick = function () {
        if (!backup) return;
        var sections = picked(importBox);
        if (!sections.length) return toast('Select at least one section to import.', 'warn');
        if (mode !== 'replace') return runImport(sections);
        modal('<h3 style="margin:0 0 8px">Replace existing data?</h3><p style="margin:0;color:var(--text-secondary);font-size:13.5px;line-height:1.5">Replace mode will DELETE your existing data for the selected sections before importing. This cannot be undone.</p>' +
          '<div class="px-btns"><button data-close class="px-sec">Cancel</button><button id="deOk" class="px-pri dng">Replace &amp; Import</button></div>',
          function (ov, close) { $('#deOk', ov).onclick = function () { close(); runImport(sections); }; });
      };
    });
  };
})();
