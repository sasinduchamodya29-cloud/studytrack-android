/* StudyTrack Desktop - account status (admin lock / suspension / warning).
 * Same screens and wording as the website (includes/header.php):
 *   - timed admin lock  -> yellow "Account Temporarily Locked" screen with a live countdown
 *                          (appears within seconds of the admin locking, lifts by itself)
 *   - suspended account -> red "Account Suspended" screen (Contact support + Logout)
 *   - admin warning     -> coloured banner (Notice / Admin Warning / Final Warning) that must be acknowledged
 * The app asks the server every few seconds (api action 'account_status'), so changes made in the
 * admin panel show up here without restarting the app. */
(function () {
  var POLL_MS = 3000;
  var lockUntilTs = 0, lastWarnId = 0, busy = false, wasBlocked = false;
  var DEFAULT_LOCK_MSG = 'An administrator has temporarily locked this account.';

  var CATS = { spam: 'Spam', abuse: 'Abuse', inappropriate_content: 'Inappropriate content', cheating: 'Cheating / falsified data', other: 'Policy violation' };
  var SEV = {
    notice:  { label: 'Notice',        bg: 'linear-gradient(135deg,rgba(56,189,248,.97),rgba(14,116,144,.97))', glow: 'rgba(56,189,248,.35)', icon: 'ℹ️', pulse: false },
    warning: { label: 'Admin Warning', bg: 'linear-gradient(135deg,rgba(245,158,11,.97),rgba(234,88,12,.97))',  glow: 'rgba(245,158,11,.35)', icon: '⚠️', pulse: false },
    severe:  { label: 'Final Warning', bg: 'linear-gradient(135deg,rgba(239,68,68,.97),rgba(153,27,27,.97))',   glow: 'rgba(239,68,68,.45)',  icon: '🚨', pulse: true }
  };

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function $(id) { return document.getElementById(id); }
  function tbHeight() { var t = $('stTitlebar'); return t ? t.offsetHeight : 0; }

  /* ── styles (pulse animation for the final warning) ── */
  (function () {
    var st = document.createElement('style');
    st.textContent = '@keyframes stWarnPulse{0%,100%{filter:brightness(1)}50%{filter:brightness(1.18)}}.st-warn-pulse{animation:stWarnPulse 1.8s ease-in-out infinite}';
    document.head.appendChild(st);
  })();

  /* ── Admin lock overlay ── */
  function fmt(ms) {
    var sec = Math.max(0, Math.round(ms / 1000));
    var h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
    var pad = function (n) { return n < 10 ? '0' + n : '' + n; };
    return (h > 0 ? h + ':' + pad(m) : m) + ':' + pad(s);
  }
  function ensureLock() {
    var o = $('adminLockOverlay');
    if (o) return o;
    o = document.createElement('div');
    o.id = 'adminLockOverlay';
    o.style.cssText = 'position:fixed;inset:0;z-index:100000;background:rgba(0,0,0,0.85);backdrop-filter:blur(8px);display:none;align-items:center;justify-content:center;padding:20px;';
    o.innerHTML =
      '<div style="background:var(--bg-card);border:1px solid rgba(245,158,11,0.5);border-radius:24px;padding:40px 36px;max-width:420px;width:100%;text-align:center;box-shadow:0 20px 60px rgba(245,158,11,0.2);">' +
      '<div style="width:72px;height:72px;border-radius:50%;background:rgba(245,158,11,0.14);border:2px solid rgba(245,158,11,0.4);display:flex;align-items:center;justify-content:center;font-size:32px;margin:0 auto 20px;">🔒</div>' +
      '<div style="font-size:22px;font-weight:800;color:#fbbf24;margin-bottom:10px">Account Temporarily Locked</div>' +
      '<div id="adminLockMsg" style="font-size:14px;color:var(--text-secondary);line-height:1.7;margin-bottom:24px;white-space:pre-line;word-break:break-word"></div>' +
      '<div id="adminLockCountdown" style="background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.3);border-radius:14px;padding:16px;font-size:28px;font-weight:800;color:#fbbf24;letter-spacing:1px;font-variant-numeric:tabular-nums;">--:--</div>' +
      '<div style="font-size:12px;color:var(--text-muted);margin-top:10px">Unlocks automatically — this screen will update on its own.</div>' +
      '</div>';
    o.addEventListener('click', function (e) { e.stopPropagation(); });
    document.body.appendChild(o);
    return o;
  }
  function showLock(d) {
    var o = ensureLock();
    $('adminLockMsg').textContent = (d.reason && d.reason.trim()) ? d.reason : DEFAULT_LOCK_MSG;
    lockUntilTs = Date.now() + (d.seconds_left * 1000);
    tick();
    o.style.display = 'flex';
  }
  function hideLock() { lockUntilTs = 0; var o = $('adminLockOverlay'); if (o) o.style.display = 'none'; }
  function tick() {
    if (!lockUntilTs) return;
    var c = $('adminLockCountdown'); if (c) c.textContent = fmt(lockUntilTs - Date.now());
    if (lockUntilTs - Date.now() <= -1500) poll();      // time is up: ask the server straight away
  }

  /* ── Suspended overlay ── */
  function showDisabled() {
    var o = $('disabledOverlay');
    if (!o) {
      o = document.createElement('div');
      o.id = 'disabledOverlay';
      o.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,0.85);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;padding:20px;';
      o.innerHTML =
        '<div style="background:var(--bg-card);border:1px solid rgba(239,68,68,0.4);border-radius:24px;padding:40px 36px;max-width:460px;width:100%;text-align:center;box-shadow:0 20px 60px rgba(239,68,68,0.15);position:relative;">' +
        '<div style="width:72px;height:72px;border-radius:50%;background:rgba(239,68,68,0.12);border:2px solid rgba(239,68,68,0.3);display:flex;align-items:center;justify-content:center;font-size:32px;margin:0 auto 20px;">🚫</div>' +
        '<div style="font-size:22px;font-weight:800;color:var(--text-primary);margin-bottom:10px">Account Suspended</div>' +
        '<div style="font-size:14px;color:var(--text-secondary);line-height:1.7;margin-bottom:28px">Your account has been temporarily disabled by an administrator.<br>If you think this is a mistake, please <a href="#" id="stSuspContact" style="font-weight:bold;color:lightblue;text-decoration:none;">Contact support</a></div>' +
        '<div style="background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.2);border-radius:12px;padding:12px 16px;font-size:12px;color:#fca5a5;margin-bottom:24px;">⚠️ You cannot access any features while your account is suspended.</div>' +
        '<button id="stSuspLogout" class="btn btn-danger btn-full" style="font-size:15px;padding:13px;width:100%;cursor:pointer;">Logout</button>' +
        '</div>';
      o.addEventListener('click', function (e) { e.stopPropagation(); });
      document.body.appendChild(o);
      $('stSuspContact').onclick = function (e) { e.preventDefault(); window.st.openExternal('https://edurx.icu/studytrack/contact'); };
      $('stSuspLogout').onclick = function () {
        window.stApi('logout').then(function () { location.hash = ''; window.st.reload(); });
      };
    }
    o.style.display = 'flex';
  }
  function hideDisabled() { var o = $('disabledOverlay'); if (o) o.style.display = 'none'; }

  /* ── Warning banner ── */
  function removeBanner() { var b = $('warningBanner'); if (b) b.remove(); lastWarnId = 0; }
  function showWarning(w) {
    if ($('warningBanner') && lastWarnId === w.id) return;      // already showing this one
    removeBanner();
    lastWarnId = w.id;
    var cfg = SEV[w.severity] || SEV.warning;
    var hrs = Math.floor(w.seconds_left / 3600), mins = Math.floor((w.seconds_left % 3600) / 60);
    var timeStr = w.seconds_left > 0 ? (hrs > 0 ? hrs + 'h ' + mins + 'm on record' : mins + 'm on record') : '';
    var b = document.createElement('div');
    b.id = 'warningBanner';
    b.className = cfg.pulse ? 'st-warn-pulse' : '';
    b.style.cssText = 'position:fixed;top:' + tbHeight() + 'px;left:0;right:0;z-index:99998;background:' + cfg.bg + ';padding:13px 20px;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;box-shadow:0 4px 24px ' + cfg.glow + ';backdrop-filter:blur(8px);';
    b.innerHTML =
      '<div style="display:flex;align-items:center;gap:12px;flex:1;min-width:220px;"><span style="font-size:22px;flex-shrink:0;">' + cfg.icon + '</span><div style="min-width:0;">' +
      '<div style="font-weight:700;color:#fff;font-size:14px;margin-bottom:2px;display:flex;align-items:center;gap:8px;flex-wrap:wrap;">' + esc(cfg.label) +
      (w.category && CATS[w.category] ? '<span style="font-size:10.5px;font-weight:700;background:rgba(255,255,255,0.22);padding:2px 8px;border-radius:99px;">' + esc(CATS[w.category]) + '</span>' : '') + '</div>' +
      '<div style="color:rgba(255,255,255,0.92);font-size:13px;line-height:1.4;word-break:break-word;">' + esc(w.message) + '</div></div></div>' +
      '<div style="display:flex;align-items:center;gap:14px;flex-shrink:0;">' +
      (timeStr ? '<span style="font-size:11px;color:rgba(255,255,255,0.75);white-space:nowrap;">⏱ ' + esc(timeStr) + '</span>' : '') +
      '<button id="warningAckBtn" style="background:rgba(255,255,255,0.92);border:1px solid rgba(255,255,255,0.35);color:#111827;border-radius:8px;padding:6px 14px;font-size:12.5px;font-weight:700;cursor:pointer;white-space:nowrap;">✓ I Understand &amp; Acknowledge</button></div>';
    document.body.appendChild(b);
    $('warningAckBtn').onclick = function () {
      var btn = this, label = '✓ I Understand & Acknowledge';
      btn.disabled = true; btn.style.opacity = '0.6'; btn.textContent = 'Saving…';
      window.stApi('ack_warning', { id: w.id }).then(function (d) {
        if (!d || !d.success) {
          btn.disabled = false; btn.style.opacity = '1'; btn.textContent = label;
          alert((d && d.message) || 'Could not save right now — please check your connection and try again.');
          return;
        }
        removeBanner();
      });
    };
  }

  /* ── polling ── */
  function poll() {
    if (busy || !window.st || !window.stApi) return;
    busy = true;
    window.st.hasSession().then(function (has) {
      if (!has) { busy = false; hideLock(); hideDisabled(); removeBanner(); return null; }
      return window.stApi('account_status').then(function (d) {
        busy = false;
        if (!d || !d.success) return;                      // offline / hiccup: keep whatever is on screen
        if (d.disabled) { hideLock(); showDisabled(); } else { hideDisabled(); }
        if (!d.disabled && d.locked) showLock(d); else hideLock();
        if (d.warning && !d.disabled) showWarning(d.warning); else removeBanner();
        var blocked = !!(d.disabled || d.locked);
        if (wasBlocked && !blocked && window.stReload) window.stReload();   // lock lifted: reload the page behind it
        wasBlocked = blocked;
      });
    }).catch(function () { busy = false; });
  }

  /* Tab is the only key that works while a lock / suspension screen is up (same as the site) */
  document.addEventListener('keydown', function (e) {
    var lk = $('adminLockOverlay'), ds = $('disabledOverlay');
    var up = (lk && lk.style.display === 'flex') || (ds && ds.style.display === 'flex');
    if (up && e.key !== 'Tab' && !(e.ctrlKey && /^(r|R)$/.test(e.key))) e.preventDefault();
  }, true);

  setInterval(tick, 1000);
  setInterval(poll, POLL_MS);
  setTimeout(poll, 800);
})();
