/* StudyTrack Desktop - Settings and Profile pages (v1.16: same layout and look as the website's settings.php / profile.php).
   Data: pages9.php (actions st_*, pf_*). Needs js/pages-extra.js first. Styles: css/pages-site.css (.sp-* / .pp-* / .qrp-*) */
(function () {
  var Pages = window.stPages, TITLES = window.stTitles, api = window.stApi, UI = window.StUI;
  if (!Pages || !api || !UI) return;
  var toast = UI.toast, errPage = UI.errPage, $ = UI.$;
  TITLES.settings = 'Settings'; TITLES.profile = 'Profile';
  var SITE = 'https://edurx.icu/studytrack', APP_VERSION = '1.16.0';

  function esc(s) { return E(String(s == null ? '' : s)); }
  function here(r) { return location.hash.indexOf('#/' + r) === 0; }
  function open(u) { window.st.openExternal(u); }
  function pdate(s) { return new Date(String(s).replace(' ', 'T')); }
  function dShort(s) { return pdate(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }
  function dFull(s) { return pdate(s).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }); }
  var CHEV = '<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" style="margin-left:auto"><path d="M9 18l6-6-6-6"/></svg>';
  var CHIP = 'display:inline-flex;align-items:center;gap:4px;background:var(--bg-secondary);border:1px solid var(--border);border-radius:99px;padding:4px 11px;font-size:11px;font-weight:600;color:var(--text-muted)';
  function chips(list, mb) { return '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:' + mb + 'px">' + list.map(function (c) { return '<span style="' + CHIP + '">' + c + '</span>'; }).join('') + '</div>'; }
  function wire(root) { root.querySelectorAll('[data-u]').forEach(function (a) { a.onclick = function () { open(a.dataset.u); }; }); }

  /* the website's st-confirm dialog (styles already in shell.css) */
  function confirmDlg(msg, o) {
    o = o || {};
    return new Promise(function (res) {
      var ov = document.createElement('div'); ov.className = 'st-confirm-ov';
      ov.innerHTML = '<div class="st-confirm"><div class="st-confirm-icon">' + (o.icon || '⚠️') + '</div><div class="st-confirm-title">' + esc(o.title || 'Are you sure?') + '</div><div class="st-confirm-msg">' + esc(msg) + '</div>' +
        '<div class="st-confirm-btns"><button class="st-confirm-btn secondary">Cancel</button><button class="st-confirm-btn ' + (o.okStyle || 'danger') + '">' + esc(o.okLabel || 'OK') + '</button></div></div>';
      document.body.appendChild(ov); requestAnimationFrame(function () { ov.classList.add('show'); });
      function done(v) { ov.classList.remove('show'); setTimeout(function () { ov.remove(); }, 260); document.removeEventListener('keydown', key); res(v); }
      function key(e) { if (e.key === 'Escape') done(false); }
      document.addEventListener('keydown', key);
      var b = ov.querySelectorAll('button'); b[0].onclick = function () { done(false); }; b[1].onclick = function () { done(true); };
    });
  }
  function alertBox(el, msg, type, ms) {
    if (!el) return; el.className = 'sp-alert ' + type; el.textContent = (type === 'err' ? '⚠️ ' : '✅ ') + msg; el.style.display = 'flex';
    if (ms) setTimeout(function () { el.style.display = 'none'; }, ms);
  }

  /* ═══════════════════════════════ SETTINGS ═══════════════════════════════ */
  var THEME_META = {
    dark: { label: 'Dark Mode', desc: 'Easy on the eyes at night', emoji: '🌙' }, light: { label: 'Light Mode', desc: 'Clean & bright interface', emoji: '☀️' },
    forest: { label: 'Forest Mode', desc: 'Deep greens, calm & earthy', emoji: '🌲' }, midnight: { label: 'Midnight Mode', desc: 'Deep navy blues for late nights', emoji: '🌌' },
    galaxy: { label: 'Galaxy Mode', desc: 'Cosmic purples & magenta accents', emoji: '🪐' }, aurora: { label: 'Aurora Mode', desc: 'Teal & cyan, Premium-exclusive', emoji: '🌊' },
    sakura: { label: 'Sakura Mode', desc: 'Rose & blossom, Premium-exclusive', emoji: '🌸' }
  };
  /* key, name, bg, dot, text, bar1, bar2(accent), bar3, premium-only */
  var SWATCH = [['dark', 'Dark', '#0a0a0f', '#6366f1', '#e2e8f0', '#16161f', '#6366f1', '#2a2a3d'], ['light', 'Light', '#f1f5f9', '#6366f1', '#0f172a', '#e2e8f0', '#6366f1', '#cbd5e1'],
    ['forest', 'Forest', '#0a1510', '#22c55e', '#eafff2', '#13271d', '#22c55e', '#234433'], ['midnight', 'Midnight', '#05060f', '#3b82f6', '#e8ecf7', '#0d1226', '#3b82f6', '#1c2440'],
    ['galaxy', 'Galaxy', '#0b0518', '#c026d3', '#f5eaff', '#1a0f30', '#c026d3', '#35204f'], ['aurora', 'Aurora', '#071019', '#14b8a6', '#e6fbf8', '#0f2232', '#14b8a6', '#1e3f56', 1],
    ['sakura', 'Sakura', '#1a0e14', '#fb7185', '#fff1f5', '#2c1822', '#fb7185', '#4a2a38', 1]];
  function curTheme() { var t = document.documentElement.getAttribute('data-theme') || 'dark'; return THEME_META[t] ? t : 'dark'; }
  function applyTheme(t) { document.documentElement.setAttribute('data-theme', t); try { localStorage.setItem('stTheme', t); } catch (e) {} }

  Pages.settings = function (pc) {
    return api('st_page').then(function (d) {
      if (!here('settings')) return;
      if (!d || !d.success) return errPage(pc, d);
      renderSettings(pc, d);
    });
  };

  function card(icoBg, ico, title, sub, extraHd, inner, style) {
    return '<div class="sp-card"' + (style ? ' style="' + style + '"' : '') + '><div class="sp-card-hd"><div class="sp-card-icon" style="background:' + icoBg + '">' + ico + '</div><div style="flex:1;min-width:0"><div class="sp-card-title">' + title + '</div><div class="sp-card-sub">' + sub + '</div></div>' + (extraHd || '') + '</div>' + inner + '</div>';
  }
  function status(on, yes, no) { return '<span class="sp-status ' + (on ? 'on' : 'off') + ' dot">' + (on ? yes : no) + '</span>'; }
  function devRows(list) {
    if (!list.length) return '<div style="font-size:13px;color:var(--text-muted);text-align:center;padding:10px 0">No biometric devices registered yet.</div>';
    return list.map(function (c) {
      return '<div style="display:flex;align-items:center;justify-content:space-between;gap:12px;padding:11px 13px;background:var(--bg-secondary);border:1px solid var(--border);border-radius:12px;margin-bottom:8px"><div style="display:flex;align-items:center;gap:10px">' +
        '<div style="width:34px;height:34px;border-radius:9px;background:rgba(6,182,212,.12);display:flex;align-items:center;justify-content:center;font-size:16px">🔐</div><div><div style="font-size:13px;font-weight:700;color:var(--text-primary)">' + esc(c.name) +
        '</div><div style="font-size:11px;color:var(--text-muted);margin-top:1px">' + esc(c.created) + '</div></div></div><span class="sp-status on dot">Active</span></div>';
    }).join('');
  }

  function renderSettings(pc, d) {
    var sc = d.score | 0, arc = (213.63 * (1 - sc / 100)).toFixed(2), bio = d.biometric | 0, cur = curTheme(), meta = THEME_META[cur];
    var checks = [['Email verified', d.verified, '✅', 'Verified', 'Not verified'], ['Password set', d.has_password, '🔒', 'Set', 'Not set'],
      ['Biometric', bio > 0, '👆', bio + ' device' + (bio !== 1 ? 's' : ''), 'Not set up'],
      ['Pro subscription', d.is_pro, '⚡', d.pro_until ? 'Active — expires ' + dShort(d.pro_until) : 'Active (lifetime)', 'Free plan'],
      ['Premium subscription', d.is_premium, '👑', d.premium_until ? 'Active — expires ' + dShort(d.premium_until) : 'Active (lifetime)', 'Not active']];
    var BTN = 'flex:1;min-width:160px;display:flex;align-items:center;justify-content:center;gap:7px;padding:11px;border-radius:11px;font-size:13px;font-weight:700;cursor:pointer;transition:all .15s;';

    var sec = '<div class="sp-card"><div class="sp-card-hd"><div class="sp-card-icon" style="background:rgba(99,102,241,.12)">🛡️</div><div><div class="sp-card-title">Security Overview</div><div class="sp-card-sub">Your account protection status</div></div></div>' +
      '<div class="sp-sec-ring-wrap"><div class="sp-sec-ring"><svg width="80" height="80" viewBox="0 0 80 80"><circle cx="40" cy="40" r="34" fill="none" stroke="var(--border)" stroke-width="7"/>' +
      '<circle cx="40" cy="40" r="34" fill="none" stroke="var(--accent)" stroke-width="7" stroke-linecap="round" stroke-dasharray="213.63" stroke-dashoffset="' + arc + '"/></svg>' +
      '<div class="sp-sec-ring-score"><span class="sp-sec-ring-num">' + sc + '</span><span class="sp-sec-ring-lbl">/ 100</span></div></div>' +
      '<div class="sp-sec-info"><h4>' + (sc >= 75 ? '🟢 Strong' : sc >= 50 ? '🟡 Good' : '🔴 Weak') + '</h4><p>' + (bio > 0 ? 'Your account is well protected.' : 'Enable Biometric login to reach 100% security score.') + '</p></div></div>' +
      '<div style="display:flex;flex-direction:column;gap:8px">' + checks.map(function (c) { return '<div class="sp-toggle-row" style="cursor:default"><div><div class="sp-toggle-title">' + c[2] + ' ' + c[0] + '</div></div>' + status(c[1], c[3], c[4]) + '</div>'; }).join('') + '</div>' +
      '<div style="display:flex;gap:8px;margin-top:14px;flex-wrap:wrap"><a class="sp-link-btn" id="spPw" style="' + BTN + 'background:var(--bg-secondary);border:1px solid var(--border);color:var(--text-secondary)">🔑 Change Password</a>' +
      (d.is_pro ? '' : '<a id="spUp" style="' + BTN + 'background:linear-gradient(135deg,rgba(245,158,11,.14),rgba(245,158,11,.05));border:1px solid rgba(245,158,11,.3);color:#f59e0b">⚡ Upgrade to Pro</a>') + '</div></div>';

    var swatches = SWATCH.map(function (s) {
      var lock = s[8] && !d.is_premium;
      return '<div class="theme-swatch" data-th="' + s[0] + '" style="position:relative;border-radius:12px;padding:14px 16px;cursor:pointer;border:2px solid ' + (cur === s[0] ? 'var(--accent)' : 'transparent') + ';background:' + s[2] + ';transition:all .2s' + (lock ? ';opacity:.55' : '') + '">' +
        (lock ? '<div style="position:absolute;top:6px;right:8px;font-size:12px">👑</div>' : '') +
        '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px"><div style="width:10px;height:10px;border-radius:50%;background:' + s[3] + '"></div><span style="font-size:12px;font-weight:700;color:' + s[4] + '">' + s[1] + '</span></div>' +
        '<div style="display:flex;gap:4px"><div style="flex:1;height:6px;border-radius:3px;background:' + s[5] + '"></div><div style="flex:2;height:6px;border-radius:3px;background:' + s[6] + '"></div><div style="flex:1;height:6px;border-radius:3px;background:' + s[7] + '"></div></div></div>';
    }).join('');
    var theme = '<div class="sp-card" id="themeCard"><div class="sp-card-hd" style="margin-bottom:16px"><div class="sp-card-icon" style="background:rgba(251,191,36,.12)">🎨</div><div style="flex:1"><div class="sp-card-title">Appearance</div><div class="sp-card-sub">Pick your favorite theme</div></div>' +
      '<span id="themeBadge" class="sp-status on dot">' + meta.label.replace(' Mode', '') + '</span></div>' +
      '<div class="sp-toggle-row"><div style="display:flex;align-items:center;gap:14px"><div style="font-size:28px" id="themeEmoji">' + meta.emoji + '</div><div><div class="sp-toggle-title" id="themeLabel">' + meta.label + '</div><div class="sp-toggle-desc" id="themeDesc">' + meta.desc + '</div></div></div></div>' +
      '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:10px;margin-top:14px">' + swatches + '</div>' +
      (d.is_premium ? '' : '<div style="text-align:center;font-size:12px;color:var(--text-muted);margin-top:12px">👑 Aurora &amp; Sakura are <a id="spPrem" style="color:#f59e0b;font-weight:700;cursor:pointer">Premium-exclusive</a> themes</div>') +
      '</div>';

    var bioCard = card('rgba(6,182,212,.12)', '👆', 'Biometric Login (Passkeys)', 'Fingerprint, Face ID or security key via WebAuthn', status(bio > 0, bio + ' device' + (bio !== 1 ? 's' : ''), 'Not set up'),
      chips(['👆 Fingerprint', '😊 Face ID', '⚡ Instant login', '🔒 Phishing-proof'], 16) + '<div style="margin-bottom:14px">' + devRows(d.devices || []) + '</div>' +
      '<a class="sp-wide-link" data-u="' + SITE + '/biometric" style="background:linear-gradient(135deg,rgba(6,182,212,.12),rgba(6,182,212,.06));border:1.5px solid rgba(6,182,212,.3);color:rgba(6,182,212,1)">🔐 Manage Biometric Devices' + CHEV.replace('13', '14') + '</a>');

    var tgLinked = !!d.telegram;
    var tg = card('rgba(34,158,217,.12)', '✈️', 'Telegram Bot', 'Log study, check tasks &amp; get notifications from Telegram', status(tgLinked, 'Linked', 'Not linked'),
      tgLinked ? '<div id="tgMsgBox" class="sp-alert"></div><div style="background:rgba(34,158,217,.06);border:1px solid rgba(34,158,217,.22);border-radius:12px;padding:12px 15px;font-size:13px;color:var(--text-secondary);margin-bottom:14px">✅ Your account is connected to the StudyTrack bot. All notifications you get here will also be sent to Telegram.</div>' +
        '<button id="tgUnlinkBtn" class="sp-wide-link" style="background:var(--bg-secondary);border:1.5px solid var(--border);color:var(--text-secondary)">🔌 Unlink Telegram Account</button>'
        : chips(['📝 Log study', '✅ Tasks', '📚 Marks', '🔔 Notifications'], 16) + '<a class="sp-wide-link" data-u="https://t.me/StudyTrackedurx_bot" style="background:linear-gradient(135deg,rgba(34,158,217,.14),rgba(34,158,217,.06));border:1.5px solid rgba(34,158,217,.3);color:#229ed9">✈️ Open Bot &amp; Link Account' + CHEV.replace('13', '14') + '</a>' +
        '<div style="font-size:11.5px;color:var(--text-muted);margin-top:10px;text-align:center">Opens Telegram — tap <b>Link my StudyTrack account</b> in the bot and log in to connect.</div>');

    var yr0 = d.year_now || new Date().getFullYear(), cy = d.al_year || null, yrs = '';
    for (var y = yr0; y <= yr0 + 2; y++) {
      var on = cy === y;
      yrs += '<div class="aly-opt-set' + (on ? ' selected' : '') + '" data-year="' + y + '" style="border:2px solid ' + (on ? 'var(--accent)' : 'var(--border)') + ';border-radius:14px;padding:14px 10px;text-align:center;cursor:pointer;background:' + (on ? 'rgba(99,102,241,.12)' : 'var(--bg-secondary)') + '">' +
        '<div style="font-family:var(--pf);font-size:20px;font-weight:900;color:var(--text-primary);line-height:1">' + y + '</div><div style="font-size:10px;font-weight:600;color:var(--text-muted);letter-spacing:1px;text-transform:uppercase;margin-top:4px">A/L ' + y + '</div></div>';
    }
    var al = card('rgba(99,102,241,.12)', '🎓', 'A/L Exam Year', 'ඔබේ A/L examination year — countdown ට use වේ', '',
      '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:18px" id="alyOptsSet">' + yrs + '</div><div id="alyMsgSet" style="display:none;font-size:12px;font-weight:600;padding:8px 12px;border-radius:8px;margin-bottom:12px"></div>' +
      '<button id="alySave" style="padding:11px 24px;border:none;border-radius:11px;background:linear-gradient(135deg,#6366f1,#a855f7);color:#fff;font-family:var(--pf);font-size:13px;font-weight:700;cursor:pointer">Save Year</button>');

    var prefs = [['email_weekly', 'Weekly report email', 'Summary of your study hours every Monday'], ['email_reminders', 'Task & reminder emails', 'Get emailed when tasks are due or overdue'], ['push_enabled', 'Push notifications', 'In-browser push alerts for updates']];
    var nt = card('rgba(245,158,11,.12)', '🔔', 'Notifications', 'Email and push notification preferences', '', '<div id="notifMsgBox" class="sp-alert"></div>' +
      prefs.map(function (p) {
        return '<div class="sp-toggle-row"><div><div class="sp-toggle-title">' + p[1] + '</div><div class="sp-toggle-desc">' + p[2] + '</div></div><label class="sp-switch"><input type="checkbox" id="pref_' + p[0] + '"' + (d.prefs[p[0]] ? ' checked' : '') + '><span class="sp-switch-track"></span><span class="sp-switch-thumb"></span></label></div>';
      }).join(''));

    var exp = '<div class="sp-card"><div class="sp-card-hd" style="margin-bottom:20px"><div class="sp-card-icon" style="background:rgba(99,102,241,.12)">📦</div><div><div class="sp-card-title">Data Export &amp; Import</div><div class="sp-card-sub">Backup your study data or restore from a previous export</div></div></div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px"><div style="padding:14px;background:rgba(99,102,241,.07);border:1px solid rgba(99,102,241,.18);border-radius:12px"><div style="font-size:22px;margin-bottom:6px">📤</div><div style="font-size:13px;font-weight:700;color:var(--text-primary);margin-bottom:3px">Export</div><div style="font-size:11px;color:var(--text-muted);line-height:1.5">Download sessions, marks, tasks &amp; goals as JSON or CSV</div></div>' +
      '<div style="padding:14px;background:rgba(14,165,233,.07);border:1px solid rgba(14,165,233,.18);border-radius:12px"><div style="font-size:22px;margin-bottom:6px">📥</div><div style="font-size:13px;font-weight:700;color:var(--text-primary);margin-bottom:3px">Import</div><div style="font-size:11px;color:var(--text-muted);line-height:1.5">Restore data from a StudyTrack JSON backup file</div></div></div>' +
      '<a href="#/data-export" style="display:flex;align-items:center;justify-content:center;gap:8px;padding:11px;background:linear-gradient(135deg,rgba(99,102,241,.18),rgba(139,92,246,.12));border:1px solid rgba(99,102,241,.3);border-radius:11px;font-size:13px;font-weight:700;color:#818cf8;cursor:pointer">' +
      '<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>Open Export &amp; Import' + CHEV + '</a></div>';

    var info = [['App', 'StudyTrack'], ['By', 'EduRx'], ['Version', 'Desktop v' + APP_VERSION], ['License', 'Free forever'], ['Target', 'Sri Lankan A/L students'], ['Tech', 'Electron · PHP · MySQL']];
    var links = [['🔒', 'Privacy Policy', 'u', SITE + '/privacy'], ['📄', 'Terms of Service', 'u', SITE + '/terms'], ['💬', 'Contact & Support', 'h', '#/contact'], ['👤', 'Edit Profile', 'h', '#/profile']];
    var about = '<div class="sp-grid"><div class="sp-card" style="margin-bottom:0"><div class="sp-card-hd" style="margin-bottom:16px"><div class="sp-card-icon" style="background:rgba(99,102,241,.12)">ℹ️</div><div><div class="sp-card-title">About StudyTrack</div><div class="sp-card-sub">Built for Sri Lankan A/L students</div></div></div>' +
      info.map(function (r) { return '<div class="sp-info-row"><span class="sp-info-key">' + r[0] + '</span><span class="sp-info-val">' + r[1] + '</span></div>'; }).join('') + '</div>' +
      '<div class="sp-card" style="margin-bottom:0"><div class="sp-card-hd" style="margin-bottom:16px"><div class="sp-card-icon" style="background:rgba(245,158,11,.12)">🔗</div><div><div class="sp-card-title">Quick Links</div><div class="sp-card-sub">Help, terms &amp; privacy</div></div></div><div style="display:flex;flex-direction:column;gap:8px">' +
      links.map(function (l) { return '<a class="sp-link-row" ' + (l[2] === 'u' ? 'data-u="' + l[3] + '"' : 'data-h="' + l[3] + '"') + '><span style="font-size:15px">' + l[0] + '</span>' + l[1] + '<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg></a>'; }).join('') + '</div></div></div><br>';

    var danger = '<div class="sp-card" style="border-color:rgba(239,68,68,.25)"><div class="sp-card-hd"><div class="sp-card-icon" style="background:rgba(239,68,68,.12)">⚠️</div><div><div class="sp-card-title" style="color:#ef4444">Danger Zone</div><div class="sp-card-sub">Irreversible data actions</div></div></div>' +
      '<div class="sp-toggle-row" style="border-color:rgba(239,68,68,.18)"><div><div class="sp-toggle-title">Clear All My Data</div><div class="sp-toggle-desc">Deletes all your subjects, study sessions, marks, tasks, goals, notes, files &amp; more. Your account and login stay intact.</div></div>' +
      '<button class="sp-btn sp-btn-secondary" id="cdOpen" style="border-color:rgba(239,68,68,.35);color:#ef4444;flex-shrink:0">🗑️ Clear Data</button></div></div>';

    pc.innerHTML = '<div class="sp"><div class="sp-page-hd"><div class="sp-page-title">⚙️ Settings <span class="sp-ver-pill new">v' + APP_VERSION + '</span></div><div class="sp-page-sub">Security, login methods, notifications &amp; app info</div></div>' +
      sec + theme + bioCard + tg + al + nt + exp + about + danger + '</div>';

    wire(pc);
    pc.querySelectorAll('[data-h]').forEach(function (a) { a.onclick = function () { location.hash = a.dataset.h; }; });
    $('#spPw').onclick = function () { location.hash = '#/profile'; };
    var up = $('#spUp'); if (up) up.onclick = function () { open(SITE + '/upgrade'); };
    var pr = $('#spPrem'); if (pr) pr.onclick = function () { open(SITE + '/upgrade'); };

    /* theme */
    pc.querySelectorAll('.theme-swatch').forEach(function (el) {
      el.onclick = function () {
        var t = el.dataset.th, prem = t === 'aurora' || t === 'sakura';
        if (prem && !d.is_premium) {
          confirmDlg('🌊🌸 Aurora & Sakura are Premium-exclusive themes. Upgrade to Premium to unlock them?', { icon: '👑', okStyle: 'primary', okLabel: 'Upgrade' }).then(function (ok) { if (ok) open(SITE + '/upgrade'); });
          return;
        }
        applyTheme(t);
        var m = THEME_META[t];
        $('#themeLabel').textContent = m.label; $('#themeDesc').textContent = m.desc; $('#themeEmoji').textContent = m.emoji; $('#themeBadge').textContent = m.label.replace(' Mode', '');
        pc.querySelectorAll('.theme-swatch').forEach(function (x) { x.style.borderColor = x === el ? 'var(--accent)' : 'transparent'; });
      };
    });

    /* telegram */
    var off = $('#tgUnlinkBtn'); if (off) off.onclick = function () {
      confirmDlg('Unlink your Telegram account? You will stop receiving notifications on the bot until you link again.', { icon: '🔌', okLabel: 'Unlink' }).then(function (ok) {
        if (!ok) return; off.disabled = true; off.style.opacity = '.6';
        api('st_unlink_tg').then(function (r) {
          if (r && r.success) { d.telegram = false; return renderSettings(pc, d); }
          alertBox($('#tgMsgBox'), (r && r.message) || 'Could not unlink. Please try again.', 'err'); off.disabled = false; off.style.opacity = '1';
        });
      });
    };

    /* A/L year */
    var sel = cy;
    pc.querySelectorAll('.aly-opt-set').forEach(function (o) {
      o.onclick = function () {
        pc.querySelectorAll('.aly-opt-set').forEach(function (x) { x.style.borderColor = 'var(--border)'; x.style.background = 'var(--bg-secondary)'; x.classList.remove('selected'); });
        o.style.borderColor = 'var(--accent)'; o.style.background = 'rgba(99,102,241,.12)'; o.classList.add('selected'); sel = +o.dataset.year;
      };
    });
    $('#alySave').onclick = function () {
      if (!sel) return; var msg = $('#alyMsgSet');
      api('st_al_year', { al_year: sel }).then(function (r) {
        var ok = r && r.success; msg.style.display = 'block'; msg.style.background = ok ? 'rgba(16,185,129,.12)' : 'rgba(239,68,68,.12)'; msg.style.color = ok ? '#10b981' : '#ef4444';
        msg.textContent = (ok ? '✓ ' : '✗ ') + ((r && r.message) || 'Could not save'); if (ok) d.al_year = sel; setTimeout(function () { msg.style.display = 'none'; }, 3000);
      });
    };

    /* notifications (auto-save, same 600 ms debounce as the site) */
    var nTimer = null;
    ['email_weekly', 'email_reminders', 'push_enabled'].forEach(function (k) {
      $('#pref_' + k).onchange = function () {
        clearTimeout(nTimer);
        nTimer = setTimeout(function () {
          api('st_notif', { email_weekly: $('#pref_email_weekly').checked, email_reminders: $('#pref_email_reminders').checked, push_enabled: $('#pref_push_enabled').checked }).then(function (r) {
            if (r && r.success) alertBox($('#notifMsgBox'), r.message, 'ok', 3000); else alertBox($('#notifMsgBox'), (r && r.message) || 'Could not save', 'err', 3000);
          });
        }, 600);
      };
    });

    /* clear all my data → support ticket (same flow as the site) */
    $('#cdOpen').onclick = function () {
      var ov = document.createElement('div'); ov.className = 'sp-modal-overlay';
      ov.innerHTML = '<div class="sp-modal"><div class="sp-modal-hd"><div class="sp-modal-title" style="color:#ef4444">Are you sure?</div></div>' +
        '<p style="font-size:13px;color:var(--text-muted);line-height:1.6;margin-bottom:20px">All of your study data will be permanently erased. This cannot be undone. Do you want to continue?</p>' +
        '<p style="font-size:12.5px;color:var(--text-muted);line-height:1.6;margin:-8px 0 16px">🎫 A support ticket will be opened automatically and our team will process your request.</p>' +
        '<div id="cdMsg2" class="sp-alert"></div><div style="display:flex;gap:10px"><button class="sp-btn sp-btn-secondary" style="flex:1" data-x>Cancel</button><button class="sp-btn" style="flex:1;background:#ef4444;color:#fff" id="cdGo">Yes, continue</button></div></div>';
      document.body.appendChild(ov); requestAnimationFrame(function () { ov.classList.add('open'); });
      function close() { ov.classList.remove('open'); setTimeout(function () { ov.remove(); }, 260); }
      ov.addEventListener('mousedown', function (e) { if (e.target === ov) close(); });
      ov.querySelector('[data-x]').onclick = close;
      var go = ov.querySelector('#cdGo'), box = ov.querySelector('#cdMsg2');
      go.onclick = function () {
        go.disabled = true; go.innerHTML = '<span class="sp-spin"></span> Opening ticket…'; box.style.display = 'none';
        api('st_clear_request').then(function (r) {
          if (r && r.success) {
            alertBox(box, r.message + (r.ticket_number ? ' #' + r.ticket_number : ''), 'ok');
            setTimeout(function () { close(); if (r.url) open(r.url); }, 900);
          } else { alertBox(box, (r && r.message) || 'Connection error. Please try again.', 'err'); go.disabled = false; go.textContent = 'Yes, continue'; }
        });
      };
    };
  }

  /* ═══════════════════════════════ PROFILE ═══════════════════════════════ */
  Pages.profile = function (pc) {
    return api('pf_page').then(function (d) {
      if (!here('profile')) return;
      if (!d || !d.success) return errPage(pc, d);
      renderProfile(pc, d);
    });
  };
  var GOOGLE_SVG = '<svg width="22" height="22" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59A14.5 14.5 0 0 1 9.5 24c0-1.59.28-3.14.76-4.59l-7.98-6.19A23.99 23.99 0 0 0 0 24c0 3.77.9 7.35 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>';
  var FB_SVG = '<svg width="22" height="22" viewBox="0 0 24 24" fill="#1877f2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>';

  function qrSrc(url) { return 'https://api.qrserver.com/v1/create-qr-code/?size=320x320&margin=10&color=6366F1&bgcolor=FFFFFF&qzone=2&data=' + encodeURIComponent(url); }

  function renderProfile(pc, d) {
    var initial = (d.name || '?').trim().charAt(0).toUpperCase(), prov = d.provider || '', social = !!prov;
    var avatar = d.avatar ? '<img src="' + esc(d.avatar) + '" id="avatarPreview" class="pp-av" alt="Avatar">' : '<div id="avatarPreview" class="pp-av-init">' + esc(initial) + '</div>';

    var hero = '<div class="pp-hero"><div class="pp-hero-bg"></div><div class="pp-hero-inner">' +
      '<div class="pp-av-wrap" id="ppAv" title="Change photo">' + avatar + '<span class="pp-cam" title="Change photo"><svg width="12" height="12" fill="none" stroke="#fff" stroke-width="2.5" viewBox="0 0 24 24"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg></span></div>' +
      '<div class="pp-hero-info"><div class="pp-name">' + esc(d.name) + '</div>' + (d.username ? '<div class="pp-username" style="font-size:13px;color:var(--text-muted,#94a3b8);margin-top:-4px;margin-bottom:4px">@' + esc(d.username) + '</div>' : '') +
      '<div class="pp-email">' + esc(d.email) + '</div><div class="pp-chips">' + (d.verified ? '<span class="pp-chip verified">✓ Verified</span>' : '') +
      (social ? '<span class="pp-chip social">' + (prov === 'facebook' ? '🔵 Facebook' : '🔴 Google') + ' Sign-in</span>' : '') + (d.joined ? '<span class="pp-chip">📅 ' + dFull(d.joined) + '</span>' : '') + '</div></div>' +
      '<div class="pp-hero-actions" style="display:flex;flex-direction:column;gap:8px;align-items:flex-end"><button type="button" class="btn btn-secondary btn-sm" id="ppUp" style="white-space:nowrap">📷 Change Photo</button>' +
      (d.has_local_avatar ? '<button type="button" class="btn btn-danger btn-sm" id="ppRm" style="white-space:nowrap">🗑 Remove</button>' : '') +
      '<div class="pp-av-hint" style="font-size:10px;color:var(--text-muted);text-align:right;white-space:nowrap">JPG, PNG, WebP · Max 2MB</div></div></div></div>';

    var edit = '<div class="pp-card"><div class="pp-card-hd"><div class="pp-card-icon" style="background:rgba(99,102,241,.12)">👤</div><div><div class="pp-card-title">Edit Profile</div><div class="pp-card-sub">Update your display name</div></div></div>' +
      '<div id="updateProfileMsg" style="display:none" class="alert"></div><form id="updateProfileForm" novalidate>' +
      '<div class="form-group"><label class="pp-label">Full Name</label><input type="text" name="name" class="form-control" value="' + esc(d.name) + '" maxlength="100"></div>' +
      '<div class="form-group"><label class="pp-label">Username</label><input type="text" name="username" id="usernameField" class="form-control" value="' + esc(d.username) + '" placeholder="e.g. saman_perera" maxlength="20" autocapitalize="off" autocorrect="off">' +
      '<div style="font-size:11px;color:var(--text-muted,#94a3b8);margin-top:4px">3–20 characters: lowercase letters, numbers, underscore. Used to sign in and to be found by friends.</div></div>' +
      '<div class="form-group"><label class="pp-label">Email Address</label><div class="pp-field-locked"><span class="pp-lock-icon">🔒</span>' + esc(d.email) + '</div></div>' +
      '<button type="submit" class="btn btn-primary pp-save-btn" id="updateProfileBtn">Save Changes</button></form></div>';

    var pwBody;
    if (social) {
      pwBody = '<div class="pp-social-card"><div class="pp-social-logo" style="background:' + (prov === 'facebook' ? 'rgba(24,119,242,.1)' : 'rgba(234,67,53,.1)') + '">' + (prov === 'facebook' ? FB_SVG : GOOGLE_SVG) + '</div><div><div class="pp-social-title">Signed in with ' + (prov === 'facebook' ? 'Facebook' : 'Google') + '</div>' +
        '<div class="pp-social-desc">No password to manage here. Visit your <a class="pp-link" data-u="' + (prov === 'facebook' ? 'https://www.facebook.com/settings?tab=security' : 'https://myaccount.google.com/security') + '">' + (prov === 'facebook' ? 'Facebook' : 'Google') + ' account settings</a> to update your password.</div></div></div>';
    } else {
      function pwField(name, label, ph, id, ico) {
        return '<div class="form-group"><label class="pp-label">' + label + '</label><div class="input-icon"><span class="icon">' + ico + '</span><input type="password" name="' + name + '" class="form-control"' + (id ? ' id="' + id + '"' : '') + (ph ? ' placeholder="' + ph + '"' : '') + '><button type="button" class="toggle-password">👁️</button></div>' +
          (id ? '<div class="pp-pw-strength"><div class="pp-pw-bar" id="pwBar"></div></div><div class="pp-pw-hint" id="pwHint"></div>' : '') + '</div>';
      }
      pwBody = '<div id="changePasswordMsg" style="display:none" class="alert"></div><form id="changePasswordForm" novalidate>' + pwField('current_password', 'Current Password', '', '', '🔒') + pwField('new_password', 'New Password', 'Min. 8 characters', 'newPwInput', '🔑') + pwField('confirm_new', 'Confirm New Password', '', '', '🔑') +
        '<button type="submit" class="btn btn-primary pp-save-btn" id="changePasswordBtn">Change Password</button></form>';
    }
    var pw = '<div class="pp-card"><div class="pp-card-hd"><div class="pp-card-icon" style="background:rgba(168,85,247,.12)">🔐</div><div><div class="pp-card-title">Change Password</div><div class="pp-card-sub">Keep your account secure</div></div></div>' + pwBody + '</div>';

    var bio = d.biometric | 0;
    var bioCard = '<div class="pp-card" id="biometricCard"><div class="pp-card-hd" style="margin-bottom:14px"><div class="pp-card-icon" style="background:rgba(6,182,212,.12)">🔐</div><div style="flex:1;min-width:0"><div class="pp-card-title">Biometric Login (Passkeys)</div><div class="pp-card-sub">Sign in with fingerprint, face ID, or device PIN</div></div>' +
      (bio > 0 ? '<div style="display:flex;align-items:center;gap:5px;background:rgba(6,182,212,.1);border:1px solid rgba(6,182,212,.25);border-radius:99px;padding:4px 11px;font-size:12px;font-weight:700;color:rgba(6,182,212,1);white-space:nowrap">' + bio + ' device' + (bio !== 1 ? 's' : '') + '</div>' : '') + '</div>' +
      chips(['👆 Fingerprint', '👤 Face ID', '⚡ Instant Login'], 18) + (bio > 0 ? '<div style="margin-bottom:16px">' + devRows(d.devices || []) + '</div>' : '<div style="margin-bottom:16px"></div>') +
      '<a class="sp-wide-link" data-u="' + SITE + '/biometric" style="background:linear-gradient(135deg,rgba(6,182,212,.12),rgba(6,182,212,.06));border:1.5px solid rgba(6,182,212,.3);color:rgba(6,182,212,1)">' +
      '<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>Manage Biometric Devices' + CHEV.replace('13', '14') + '</a></div>';

    var b = d.battle || { total: 0, champ_wins: 0, by_rarity: [], recent: [] }, trophy;
    if (b.total > 0 || b.champ_wins > 0) {
      trophy = '<div class="qrp-battle" style="margin:0"><div class="qrp-battle-hd"><div class="qrp-battle-title">🎁 ' + b.total + ' Gift' + (b.total === 1 ? '' : 's') + ' Collected</div>' + (b.champ_wins > 0 ? '<span class="qrp-battle-wins">🏆 ' + b.champ_wins + 'x Champion</span>' : '') + '</div>' +
        '<div class="qrp-battle-rarities">' + b.by_rarity.map(function (r) { return '<span class="qrp-rarity-chip"><span class="qrp-rarity-dot" style="background:' + r.color + '"></span>' + r.label + ' × ' + r.n + '</span>'; }).join('') + '</div>' +
        (b.recent.length ? '<div class="qrp-shelf">' + b.recent.map(function (g) { return '<div class="qrp-gift" style="--rc:' + g.color + '" title="' + esc(g.name) + ' (' + esc(g.label) + ') · ' + esc(g.date) + '"><div class="qrp-gift-glow"></div><span style="position:relative">' + g.icon + '</span></div>'; }).join('') + '</div>' : '') + '</div>';
    } else trophy = '<div class="qrp-battle" style="margin:0"><div class="qrp-battle-empty">🎯 No trophies yet — join today\'s Daily Battle to start earning gifts!</div></div>';
    var battle = '<div class="pp-card" id="battleTrophyCard"><div class="pp-card-hd" style="margin-bottom:18px"><div class="pp-card-icon" style="background:rgba(251,191,36,.12)">⚔️</div><div style="flex:1;min-width:0"><div class="pp-card-title">My Daily Battle Trophies</div><div class="pp-card-sub">Gifts you\'ve won — this is what shows on your shared profile</div></div>' +
      '<button class="btn btn-secondary btn-sm" id="ppBattle" style="white-space:nowrap;gap:6px;display:flex;align-items:center">⚔️ Go To Battle</button></div>' + trophy + '</div>';

    var BS = 'display:flex;align-items:center;gap:6px;justify-content:center';
    var qr = '<div class="pp-card" id="qrCodeCard"><div class="pp-card-hd" style="margin-bottom:18px"><div class="pp-card-icon" style="background:rgba(99,102,241,.12)">📲</div><div style="flex:1;min-width:0"><div class="pp-card-title">My QR Code</div><div class="pp-card-sub">Share your StudyTrack profile with your QR code</div></div>' +
      '<button id="qrDl" class="btn btn-secondary btn-sm" style="white-space:nowrap;gap:6px;display:flex;align-items:center"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>Download</button></div>' +
      '<div class="qr-grid" id="ppQrBox"><div style="position:relative;flex-shrink:0"><div id="qrCodeWrapper" style="width:180px;height:180px;background:#fff;border-radius:18px;border:3px solid rgba(99,102,241,.25);box-shadow:0 0 0 6px rgba(99,102,241,.07),0 8px 32px rgba(0,0,0,.18);display:flex;align-items:center;justify-content:center;overflow:hidden;position:relative">' +
      '<div id="qrLoading" style="display:flex;flex-direction:column;align-items:center;gap:8px"><span class="spinner" style="width:28px;height:28px;border-width:3px"></span><span style="font-size:11px;color:var(--text-muted)">Generating…</span></div>' +
      '<img id="qrCodeImg" src="" alt="QR Code" style="display:none;width:160px;height:160px;object-fit:contain;border-radius:8px"></div>' +
      '<div id="qrLogo" style="display:none;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:36px;height:36px;background:#fff;border-radius:8px;border:2px solid rgba(99,102,241,.2);align-items:center;justify-content:center;font-size:18px">📚</div></div>' +
      '<div style="min-width:0"><div style="font-family:var(--pf);font-size:16px;font-weight:800;color:var(--text-primary);margin-bottom:4px">' + esc(d.name) + '</div>' +
      '<div style="font-size:12px;color:var(--text-muted);margin-bottom:14px;word-break:break-all">🆔 User ID: <strong style="color:var(--accent)">STDEDU' + d.uid + '</strong></div>' +
      '<div style="font-size:12px;color:var(--text-muted);margin-bottom:16px;line-height:1.7">Scan this QR code to view your StudyTrack profile. Each user has a unique code linked to their account ID.</div>' +
      '<div style="display:flex;flex-direction:column;gap:8px"><button id="qrCopy" class="btn btn-secondary btn-sm" style="' + BS + '"><svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg><span id="copyLinkText">Copy Profile Link</span></button>' +
      '<button id="qrView" class="btn btn-secondary btn-sm" style="' + BS + '"><svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>Preview As Others See It</button>' +
      '<button id="qrRegen" class="btn btn-secondary btn-sm" style="' + BS + ';color:var(--text-muted)"><svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg>Regenerate QR Code</button></div></div></div>' +
      '<div style="margin-top:18px;padding:10px 14px;background:var(--bg-secondary);border:1px solid var(--border);border-radius:12px;display:flex;align-items:center;gap:10px;overflow:hidden"><span style="font-size:13px;flex-shrink:0">🔗</span><span id="qrUrlDisplay" style="font-size:11px;color:var(--text-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:1">' + esc(d.qr_url) + '</span></div></div>';

    var deleteItems = ['📖 Study sessions', '📊 Marks & results', '📝 Notes', '🎯 Goals', '✅ Tasks', '🏆 Achievements', '🔔 Reminders', '📅 Timetable'];
    var actions = '<div class="pp-grid"><div class="pp-action-card"><div class="pp-card-hd" style="margin-bottom:14px"><div class="pp-card-icon" style="background:rgba(100,116,139,.12)">🚪</div><div><div class="pp-card-title">Log Out</div><div class="pp-card-sub">Sign out from this device</div></div></div>' +
      '<p class="pp-action-desc">Sign out of your StudyTrack account on this device. Your data will be saved and synced.</p><button class="btn btn-secondary" id="ppOut" style="width:100%;text-align:center;display:block;padding:12px">🚪 Log Out</button></div>' +
      '<div class="pp-action-card danger"><div class="pp-card-hd" style="margin-bottom:14px"><div class="pp-card-icon" style="background:rgba(239,68,68,.12)">⚠️</div><div><div class="pp-card-title" style="color:var(--danger)">Delete Account</div><div class="pp-card-sub">Permanently remove all your data</div></div></div>' +
      '<p class="pp-action-desc">This will permanently delete your account and <strong style="color:var(--danger)">all your data</strong>. This action cannot be undone.</p>' +
      '<div class="pp-danger-info"><div style="font-weight:700;margin-bottom:6px;text-transform:uppercase;font-size:10px;letter-spacing:.5px">⚠️ Permanently deleted</div><div class="pp-danger-grid">' + deleteItems.map(function (i) { return '<div style="font-size:12px;color:var(--text-muted)">' + i + '</div>'; }).join('') + '</div></div>' +
      '<button class="btn btn-full" id="ppDel" style="background:rgba(239,68,68,.1);color:var(--danger);border:1px solid rgba(239,68,68,.3);font-weight:700;padding:12px;text-align:center;display:block">🗑️ Delete My Account</button></div></div>';

    pc.innerHTML = '<div class="pp">' + hero + '<div class="pp-grid">' + edit + pw + '</div>' + bioCard + battle + qr + actions + '</div>';
    wire(pc);

    /* avatar */
    function readB64(file) { return new Promise(function (res, rej) { var r = new FileReader(); r.onload = function () { res(String(r.result).split(',')[1] || ''); }; r.onerror = rej; r.readAsDataURL(file); }); }
    function pick() {
      var inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'image/jpeg,image/png,image/gif,image/webp';
      inp.onchange = function () {
        var f = inp.files[0]; if (!f) return;
        if (f.size > 2 * 1024 * 1024) return toast('Image must be under 2MB.', 'warn');
        readB64(f).then(function (b) { return api('pf_avatar', { data: b }); }).then(function (r) {
          if (!r || !r.success) return toast((r && r.message) || 'Upload failed', 'warn');
          toast(r.message, 'ok'); d.avatar = r.avatar; d.has_local_avatar = true; if (here('profile')) renderProfile(pc, d);
        });
      };
      inp.click();
    }
    $('#ppAv').onclick = pick; $('#ppUp').onclick = pick;
    var rm = $('#ppRm'); if (rm) rm.onclick = function () {
      rm.disabled = true;
      api('pf_avatar_remove').then(function (r) { if (!r || !r.success) { rm.disabled = false; return toast((r && r.message) || 'Could not remove', 'warn'); } toast(r.message, 'ok'); d.avatar = r.avatar; d.has_local_avatar = false; renderProfile(pc, d); });
    };

    /* edit profile */
    var un = $('#usernameField'); un.oninput = function () { un.value = un.value.toLowerCase(); };
    function msg(id, ok, text) { var el = $(id); el.className = 'alert ' + (ok ? 'alert-success' : 'alert-error'); el.textContent = (ok ? '✅ ' : '⚠️ ') + text; el.style.display = 'block'; setTimeout(function () { el.style.display = 'none'; }, 4000); }
    $('#updateProfileForm').onsubmit = function (e) {
      e.preventDefault(); var f = e.target.elements, btn = $('#updateProfileBtn'), un2 = f.username.value.trim().toLowerCase();
      if (!f.name.value.trim()) return msg('#updateProfileMsg', false, 'Name required');
      if (un2 && !/^[a-z0-9_]{3,20}$/.test(un2)) return msg('#updateProfileMsg', false, 'Username must be 3–20 characters: letters, numbers, underscore only.');
      btn.disabled = true; var t = btn.textContent; btn.innerHTML = '<span class="spinner"></span>';
      api('pf_save', { name: f.name.value, username: un2 }).then(function (r) {
        btn.disabled = false; btn.textContent = t;
        if (!r || !r.success) return msg('#updateProfileMsg', false, (r && r.message) || 'Could not save');
        d.name = r.name; d.username = r.username; renderProfile(pc, d); toast(r.message, 'ok');
      });
    };

    /* change password */
    pc.querySelectorAll('.toggle-password').forEach(function (b2) {
      b2.onclick = function () { var i = b2.parentNode.querySelector('input'); var show = i.type === 'password'; i.type = show ? 'text' : 'password'; b2.textContent = show ? '🙈' : '👁️'; };
    });
    var npw = $('#newPwInput');
    if (npw) npw.oninput = function () {
      var v = npw.value, bar = $('#pwBar'), hint = $('#pwHint'), score = 0;
      if (v.length >= 8) score++; if (/[A-Z]/.test(v)) score++; if (/[0-9]/.test(v)) score++; if (/[^A-Za-z0-9]/.test(v)) score++;
      var colors = ['#ef4444', '#f59e0b', '#10b981', '#6366f1'], labels = ['Too short', 'Could be stronger', 'Good password', 'Strong password'], widths = ['25%', '50%', '75%', '100%'];
      if (!v) { bar.style.width = '0'; hint.textContent = ''; return; }
      var i = Math.max(0, Math.min(score - 1, 3)); bar.style.width = widths[i]; bar.style.background = colors[i]; hint.textContent = labels[i]; hint.style.color = colors[i];
    };
    var pf = $('#changePasswordForm');
    if (pf) pf.onsubmit = function (e) {
      e.preventDefault(); var f = e.target.elements, btn = $('#changePasswordBtn');
      btn.disabled = true; var t = btn.textContent; btn.innerHTML = '<span class="spinner"></span>';
      api('pf_password', { current_password: f.current_password.value, new_password: f.new_password.value, confirm_new: f.confirm_new.value }).then(function (r) {
        btn.disabled = false; btn.textContent = t;
        if (!r || !r.success) return msg('#changePasswordMsg', false, (r && r.message) || 'Could not change the password');
        pf.reset(); $('#pwBar').style.width = '0'; $('#pwHint').textContent = ''; msg('#changePasswordMsg', true, r.message);
      });
    };

    /* battle / QR */
    $('#ppBattle').onclick = function () { location.hash = '#/daily-battle'; };
    var img = $('#qrCodeImg'), loading = $('#qrLoading'), logo = $('#qrLogo');
    function loadQr(url) {
      img.style.display = 'none'; logo.style.display = 'none'; loading.style.display = 'flex';
      loading.innerHTML = '<span class="spinner" style="width:28px;height:28px;border-width:3px"></span><span style="font-size:11px;color:var(--text-muted)">Generating…</span>';
      var tried = false;
      img.onload = function () { loading.style.display = 'none'; img.style.display = 'block'; logo.style.display = 'flex'; };
      img.onerror = function () {
        if (tried) { loading.innerHTML = '<span style="font-size:11px;color:var(--text-muted)">Could not load the QR code.<br>Check your internet.</span>'; return; }
        tried = true; loading.innerHTML = '<span style="font-size:11px;color:var(--text-muted)">Using fallback…</span>';
        img.src = 'https://chart.googleapis.com/chart?cht=qr&chs=320x320&chl=' + encodeURIComponent(url) + '&chld=M|2';
      };
      img.src = qrSrc(url);
    }
    loadQr(d.qr_url);

    $('#qrDl').onclick = function () {
      if (!img.src || img.style.display === 'none') return toast('⏳ QR code is still loading. Please wait.', 'warn');
      var canvas = document.createElement('canvas'); canvas.width = 400; canvas.height = 440;
      var ctx = canvas.getContext('2d'); ctx.fillStyle = '#ffffff'; if (ctx.roundRect) { ctx.beginPath(); ctx.roundRect(0, 0, 400, 440, 20); } else { ctx.beginPath(); ctx.rect(0, 0, 400, 440); } ctx.fill();
      var q = new Image(); q.crossOrigin = 'anonymous';
      q.onload = function () {
        try {
          ctx.drawImage(q, 40, 20, 320, 320);
          ctx.fillStyle = '#1e1b4b'; ctx.font = 'bold 18px Outfit, sans-serif'; ctx.textAlign = 'center'; ctx.fillText(d.name, 200, 368);
          ctx.fillStyle = '#6366f1'; ctx.font = '14px Plus Jakarta Sans, sans-serif'; ctx.fillText('StudyTrack · User #' + d.uid, 200, 394);
          ctx.fillStyle = '#94a3b8'; ctx.font = '11px monospace'; ctx.fillText('edurx.icu', 200, 420);
          var b64 = canvas.toDataURL('image/png').split(',')[1];
          window.st.saveFile('studytrack-qr-' + d.uid + '.png', b64).then(function (r) { if (r && r.success) toast('✅ QR Code saved to ' + r.path, 'ok'); else if (r && !r.canceled) toast((r && r.message) || 'Could not save the file', 'warn'); });
        } catch (e) { toast('Could not export the QR image.', 'warn'); }
      };
      q.onerror = function () { toast('Could not export the QR image.', 'warn'); };
      q.src = img.src;
    };
    $('#qrCopy').onclick = function () {
      var t = $('#copyLinkText'), url = d.qr_url;
      function ok() { t.textContent = '✅ Copied!'; toast('✅ Profile link copied!', 'ok'); setTimeout(function () { t.textContent = 'Copy Profile Link'; }, 2500); }
      (navigator.clipboard && navigator.clipboard.writeText ? navigator.clipboard.writeText(url) : Promise.reject()).then(ok, function () {
        var ta = document.createElement('textarea'); ta.value = url; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); } catch (e) {} ta.remove(); ok();
      });
    };
    $('#qrView').onclick = function () { open(d.qr_url); };
    $('#qrRegen').onclick = function () {
      var btn = this;
      confirmDlg('Regenerate your QR code? The old QR code will stop working.', { icon: '🔄', okStyle: 'primary', okLabel: 'Regenerate' }).then(function (ok) {
        if (!ok) return; btn.disabled = true; var orig = btn.innerHTML; btn.innerHTML = '<span class="spinner"></span>&nbsp; Regenerating…';
        api('pf_regen_qr').then(function (r) {
          btn.disabled = false; btn.innerHTML = orig;
          if (!r || !r.success) return toast('⚠️ ' + ((r && r.message) || 'Failed to regenerate.'), 'warn');
          d.qr_url = r.qr_url; $('#qrUrlDisplay').textContent = r.qr_url; loadQr(r.qr_url); toast('✅ New QR Code generated!', 'ok');
        });
      });
    };

    $('#ppOut').onclick = function () { location.hash = '#/logout'; };
    $('#ppDel').onclick = function () { open(SITE + '/delete-account'); toast('Opening the website to confirm with your password…', 'ok'); };
  }
})();
