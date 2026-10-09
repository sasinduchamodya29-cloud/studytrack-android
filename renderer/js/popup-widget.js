/* StudyTrack Desktop - Admin popups (ported from the website's assets/js/popup-widget.js).
   The server decides WHAT to show (targeting, dates, frequency, priority - Admin -> Popups, pages16.php); this file only shows it.
   Live: checks right after sign-in, then every ~20s, and again when the window regains focus - so a popup an admin publishes
   appears without restarting the app, and closes by itself if the admin switches it off.
   Buttons: a link to one of the website's pages that the app has itself (e.g. /upgrade) opens inside the app, anything else
   opens in the browser. Styles: css/popup-widget.css (.pp-widget-*). */
(function () {
  'use strict';
  var SITE = 'https://edurx.icu/studytrack';
  var POLL_MS = 20000, POLL_JITTER = 4000, SLOW_MS = 60000, MIN_GAP_MS = 3000;
  var currentPopup = null, autoCloseTimer = null, keydownHandler = null, isChecking = false, pendingRecheck = false;
  var seenIds = [], pollTimer = null, failStreak = 0, lastCheckAt = 0, started = false;
  var reviewOpen = false, rv = null;   /* the "Enjoying StudyTrack?" review popup (Admin -> Reviews -> Trigger popup) */

  function esc(s) { var d = document.createElement('div'); d.textContent = s == null ? '' : String(s); return d.innerHTML; }
  function api(a, p) { return window.stApi ? window.stApi(a, p) : Promise.resolve(null); }
  function shellUp() { return !!document.getElementById('sidebar'); }

  function track(event, buttonId) {
    if (!currentPopup) return;
    var p = { popup_id: currentPopup.id, event: event };
    if (buttonId) p.button_id = buttonId;
    api('pu_track', p).catch(function () { /* best effort */ });
  }

  /* website link -> the app's own page when it has one, otherwise the browser */
  function openLink(url) {
    url = String(url || '');
    if (!url) return;
    if (url.indexOf(SITE + '/') === 0) {
      var r = url.slice(SITE.length + 1).split(/[?#]/)[0].replace(/\.php$/, '').replace(/\/+$/, '');
      if (r && window.stPages && window.stPages[r]) { location.hash = '#/' + r; return; }
    }
    if (window.st && window.st.openExternal) window.st.openExternal(url);
  }

  function buildWidget() {
    var overlay = document.createElement('div');
    overlay.className = 'pp-widget-overlay'; overlay.id = 'ppWidgetOverlay';
    var card = document.createElement('div');
    card.className = 'pp-widget-card'; card.setAttribute('role', 'dialog'); card.setAttribute('aria-modal', 'true');
    overlay.appendChild(card); document.body.appendChild(overlay);
    return overlay;
  }

  function renderPopup(popup) {
    currentPopup = popup;
    if (seenIds.indexOf(popup.id) === -1) seenIds.push(popup.id);
    var overlay = document.getElementById('ppWidgetOverlay') || buildWidget();
    var card = overlay.querySelector('.pp-widget-card');
    var canClose = popup.close_behavior === 'closable' || popup.close_behavior === 'auto_close';
    var html = '';
    if (canClose) html += '<button type="button" class="pp-widget-close" id="ppWidgetCloseBtn" aria-label="Close">&#10005;</button>';
    if (popup.icon) html += '<div class="pp-widget-icon">' + esc(popup.icon) + '</div>';
    if (popup.image) html += '<img class="pp-widget-image" src="' + esc(popup.image) + '" alt="">';
    html += '<div class="pp-widget-title">' + esc(popup.title) + '</div>';
    html += '<div class="pp-widget-content">' + (popup.content || '') + '</div>';   /* already sanitized server-side */
    html += '<div class="pp-widget-buttons" id="ppWidgetButtons"></div>';
    if (popup.close_behavior === 'auto_close' && popup.auto_close_seconds) html += '<div class="pp-widget-autoclose-bar"><div class="pp-widget-autoclose-fill" id="ppWidgetAutoFill"></div></div>';
    card.innerHTML = html;

    card.querySelectorAll('.pp-widget-content a[href]').forEach(function (a) {
      a.addEventListener('click', function (e) { e.preventDefault(); openLink(a.getAttribute('href')); });
    });
    var btnWrap = card.querySelector('#ppWidgetButtons');
    (popup.buttons || []).forEach(function (b) {
      var btn = document.createElement('button');
      btn.type = 'button'; btn.className = 'pp-widget-btn pp-widget-btn-' + (b.style || 'primary'); btn.textContent = b.text;
      btn.addEventListener('click', function () { handleButtonClick(b); });
      btnWrap.appendChild(btn);
    });
    var closeBtn = card.querySelector('#ppWidgetCloseBtn');
    if (closeBtn) closeBtn.addEventListener('click', function () { closeWidget('closed'); });
    overlay.onclick = function (e) { if (e.target === overlay && canClose) closeWidget('closed'); };
    if (keydownHandler) document.removeEventListener('keydown', keydownHandler);
    keydownHandler = function (e) { if (e.key === 'Escape' && canClose) closeWidget('closed'); };
    document.addEventListener('keydown', keydownHandler);

    requestAnimationFrame(function () {
      overlay.classList.add('pp-show');
      if (closeBtn) closeBtn.focus(); else if (btnWrap.firstChild) btnWrap.firstChild.focus();
    });
    if (popup.close_behavior === 'auto_close' && popup.auto_close_seconds) {
      var fill = card.querySelector('#ppWidgetAutoFill');
      if (fill) {
        fill.style.transition = 'transform ' + popup.auto_close_seconds + 's linear';
        requestAnimationFrame(function () { requestAnimationFrame(function () { fill.style.transform = 'scaleX(0)'; }); });
      }
      autoCloseTimer = setTimeout(function () { closeWidget('closed'); }, popup.auto_close_seconds * 1000);
    }
  }

  function handleButtonClick(button) {
    track('button_click', button.id);
    hideOverlay({ recheck: true });
    if (button.action_type === 'url' && button.url) openLink(button.url);
  }
  function closeWidget(event) { track(event); hideOverlay({ recheck: true }); }

  function hideOverlay(opts) {
    var recheck = !!(opts && opts.recheck);
    if (autoCloseTimer) { clearTimeout(autoCloseTimer); autoCloseTimer = null; }
    if (keydownHandler) { document.removeEventListener('keydown', keydownHandler); keydownHandler = null; }
    var overlay = document.getElementById('ppWidgetOverlay');
    currentPopup = null;
    if (!overlay) { if (recheck) checkForPopup(); return; }
    overlay.classList.remove('pp-show');
    setTimeout(function () { if (overlay.parentNode) overlay.parentNode.removeChild(overlay); if (recheck) checkForPopup(); }, 300);
  }

  /* ── review popup: same texts, rules and fields as the website ── */
  function renderReview() {
    reviewOpen = true; rv = { rating: 0, busy: false, done: false, esc: null };
    var overlay = document.getElementById('ppWidgetOverlay') || buildWidget();
    var card = overlay.querySelector('.pp-widget-card');
    var stars = ''; for (var i = 1; i <= 5; i++) stars += '<button type="button" class="rvp-star" data-star="' + i + '">★</button>';
    card.innerHTML = '<button type="button" class="pp-widget-close" id="rvpX" aria-label="Close">&#10005;</button>' +
      '<div class="rvp-main"><div class="pp-widget-icon">⭐</div><div class="pp-widget-title">Enjoying StudyTrack?</div>' +
      '<div class="pp-widget-content">Your feedback helps us improve! Take 30 seconds to rate your experience and leave a quick review.</div>' +
      '<div class="rvp-stars" id="rvpStars">' + stars + '</div>' +
      '<div id="rvpForm" style="display:none"><input type="text" id="rvpTitle" class="rvp-in" placeholder="Review title (e.g. Great app!)" maxlength="150">' +
      '<textarea id="rvpBody" class="rvp-in" rows="3" maxlength="1000" placeholder="Tell us what you think…"></textarea><div class="rvp-err" id="rvpErr"></div>' +
      '<div class="pp-widget-buttons"><button type="button" class="pp-widget-btn pp-widget-btn-secondary" id="rvpLater">Maybe Later</button>' +
      '<button type="button" class="pp-widget-btn pp-widget-btn-primary" id="rvpSend">Submit Review ✨</button></div></div>' +
      '<div id="rvpSkip" style="margin-top:14px"><button type="button" class="rvp-skip" id="rvpSkipBtn">Maybe later</button></div></div>' +
      '<div id="rvpOk" style="display:none;padding:10px 0 4px"><div style="font-size:48px;margin-bottom:12px">🎉</div><div class="pp-widget-title">Thank you!</div><div class="pp-widget-content">Your review has been submitted and is pending approval.</div></div>';

    var paint = function (n) { card.querySelectorAll('.rvp-star').forEach(function (b) { var on = +b.dataset.star <= n; b.classList.toggle('on', on); }); };
    card.querySelectorAll('.rvp-star').forEach(function (b) {
      b.onmouseover = function () { paint(+b.dataset.star); };
      b.onmouseout = function () { paint(rv.rating); };
      b.onclick = function () { rv.rating = +b.dataset.star; paint(rv.rating); card.querySelector('#rvpForm').style.display = 'block'; card.querySelector('#rvpSkip').style.display = 'none'; };
    });
    var later = function () { closeReview(true); };
    card.querySelector('#rvpX').onclick = later; card.querySelector('#rvpLater').onclick = later; card.querySelector('#rvpSkipBtn').onclick = later;
    overlay.onclick = function (e) { if (e.target === overlay) later(); };
    rv.esc = function (e) { if (e.key === 'Escape') later(); };
    document.addEventListener('keydown', rv.esc);
    card.querySelector('#rvpSend').onclick = function () {
      var t = card.querySelector('#rvpTitle').value.trim(), b = card.querySelector('#rvpBody').value.trim(), er = card.querySelector('#rvpErr'), btn = this;
      er.style.display = 'none';
      var bad = rv.rating < 1 ? 'Please select a star rating.' : (t.length < 3 ? 'Please enter a short title (at least 3 characters).' : (b.length < 10 ? 'Please write a bit more (at least 10 characters).' : ''));
      if (bad) { er.textContent = bad; er.style.display = 'block'; return; }
      rv.busy = true; btn.disabled = true; btn.textContent = 'Submitting…';
      api('rv_submit', { rating: rv.rating, title: t, body: b }).then(function (d) {
        rv.busy = false;
        if (d && d.success) {
          rv.done = true;
          card.querySelector('.rvp-main').style.display = 'none'; card.querySelector('#rvpX').style.display = 'none'; card.querySelector('#rvpOk').style.display = 'block';
          setTimeout(function () { closeReview(true); }, 3000);
        } else { er.textContent = (d && d.message) || 'Something went wrong.'; er.style.display = 'block'; btn.disabled = false; btn.textContent = 'Submit Review ✨'; }
      });
    };
    requestAnimationFrame(function () { overlay.classList.add('pp-show'); });
  }
  /* dismiss=true: remember "closed" so it does not come back until the admin triggers it again */
  function closeReview(dismiss) {
    if (!reviewOpen) return;
    if (dismiss) api('rv_dismiss', {}).catch(function () {});
    if (rv && rv.esc) document.removeEventListener('keydown', rv.esc);
    reviewOpen = false; rv = null;
    var overlay = document.getElementById('ppWidgetOverlay');
    if (!overlay) return checkForPopup();
    overlay.classList.remove('pp-show');
    setTimeout(function () { if (overlay.parentNode) overlay.parentNode.removeChild(overlay); checkForPopup(); }, 300);
  }
  function checkReview() {
    if (reviewOpen || currentPopup) return Promise.resolve();
    return api('rv_check', {}).then(function (d) { if (d && d.success && d.show && !reviewOpen && !currentPopup) renderReview(); });
  }
  /* review popup is on screen: if the admin switched it off meanwhile, close it quietly */
  function reviewStillWanted() {
    return api('rv_check', {}).then(function (d) { if (d && d.success && !d.show && rv && !rv.busy && !rv.done) closeReview(false); });
  }

  /* ── live check (always resolves) ── */
  function checkForPopup() {
    if (!shellUp()) return Promise.resolve();
    if (reviewOpen) { lastCheckAt = Date.now(); return reviewStillWanted().catch(function () {}); }
    if (isChecking) { pendingRecheck = true; return Promise.resolve(); }
    isChecking = true; lastCheckAt = Date.now();
    var p = { poll: 1 };
    if (currentPopup) p.current = currentPopup.id; else if (seenIds.length) p.exclude = seenIds.join(',');
    return api('pu_check', p).then(function (d) {
      if (!d || d.locked || d.auth === false) { failStreak++; return; }
      if (!d.success) { failStreak++; return; }
      failStreak = 0;
      if (currentPopup) { if (d.current_active === false) hideOverlay({ recheck: true }); return; }
      if (d.popup) { renderPopup(d.popup); return; }
      return checkReview();
    }).catch(function () { failStreak++; }).then(function () {
      isChecking = false;
      if (pendingRecheck) { pendingRecheck = false; setTimeout(checkForPopup, 400); }
    });
  }
  function nextDelay() { return (failStreak >= 3 ? SLOW_MS : POLL_MS) + Math.floor(Math.random() * POLL_JITTER); }
  function schedule() { clearTimeout(pollTimer); pollTimer = setTimeout(tick, nextDelay()); }
  function tick() { if (document.hidden) { schedule(); return; } checkForPopup().then(schedule); }
  function checkSoon() { if (!started || document.hidden || Date.now() - lastCheckAt < MIN_GAP_MS) return; checkForPopup().then(schedule); }
  document.addEventListener('visibilitychange', function () { if (!document.hidden) checkSoon(); });
  window.addEventListener('focus', checkSoon);
  window.addEventListener('online', checkSoon);

  /* start as soon as the signed-in shell (sidebar) is on screen; the login screens never poll */
  var wait = setInterval(function () {
    if (!shellUp()) return;
    clearInterval(wait); started = true;
    setTimeout(function () { checkForPopup().then(schedule); }, 1200);
  }, 1000);
})();
