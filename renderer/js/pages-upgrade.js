/* StudyTrack Desktop - Upgrade / Plans page (same plans, prices and layout as the website's upgrade.php).
   Data: pages15.php (action up_page). Styles: css/pages-upgrade.css (.upg ...). Needs js/pages-extra.js first.
   Payment happens on the website (PayHere): the buy buttons open checkout-details.php in the browser; when you come back
   to the app the page refreshes itself so your new plan shows up. */
(function () {
  var Pages = window.stPages, TITLES = window.stTitles, api = window.stApi, UI = window.StUI;
  if (!Pages || !api || !UI) return;
  var toast = UI.toast, errPage = UI.errPage;
  TITLES.upgrade = 'Upgrade to Pro';
  var SITE = 'https://edurx.icu/studytrack';
  var waiting = false, curPc = null;

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function here() { return location.hash.indexOf('#/upgrade') === 0; }
  function open(u) { window.st.openExternal(u); }
  function money(n) { return Number(n || 0).toLocaleString('en-US', { maximumFractionDigits: 0 }); }

  Pages.upgrade = function (pc) {
    curPc = pc;
    if (!pc.querySelector('.upg')) pc.innerHTML = '<div class="upg"><div class="up-skel"></div><div class="up-skel"></div><div class="up-skel"></div></div>';
    return api('up_page').then(function (d) {
      if (!here()) return;
      if (!d || !d.success) return errPage(pc, d);
      render(pc, d);
    });
  };

  function render(pc, d) {
    var f = d.free, cur = esc(d.currency);
    var status = d.isPremium
      ? '<div class="up-status prem">👑 Premium active' + (d.premiumUntil ? ' — renews/expires ' + esc(d.premiumUntil) : ' (lifetime)') + '</div>'
      : d.isPro
        ? '<div class="up-status">✅ Pro active' + (d.proUntil ? ' — renews/expires ' + esc(d.proUntil) : ' (lifetime)') + '</div>'
        : '<div class="up-status free">Free plan</div>';

    var freeBtn = !d.isPro
      ? '<div class="up-here">You\'re on this plan' + (d.subjectCount >= f.subjects ? '<br><span style="color:#f59e0b">⚠️ Subject limit reached</span>' : '') + '</div>'
      : '<span class="up-btn disabled">Not your plan</span>';

    var proBtn = d.isPremium ? '<span class="up-btn disabled">Included in Premium</span>'
      : d.isPro ? '<span class="up-btn disabled">Already Pro</span>'
      : '<button type="button" class="up-btn" data-buy="pro">Get Lifetime Pro</button>' + (d.ref.ok ? '<div class="up-or">or <a data-goto="ref">unlock it free with referrals ↓</a></div>' : '');

    var premBtn = d.isPremium ? '<span class="up-btn disabled">Already Premium</span>'
      : '<button type="button" class="up-btn gold" data-buy="premium">Get Lifetime Premium</button>' + (d.ref.ok ? '<div class="up-or">or <a data-goto="ref">unlock it free with referrals ↓</a></div>' : '');

    var html = '<div class="upg">' +
      '<div class="up-hero"><h1>⚡ StudyTrack Pro &amp; Premium</h1>' +
      '<p>Unlock unlimited AI coaching, unlimited subjects &amp; unlimited music search — no daily limits. One payment, yours forever.</p>' + status + '</div>' +
      '<div class="up-plans">' +
      '<div class="up-card" style="opacity:.92"><div class="up-plan-name">Free</div><div class="up-price">0<span>/forever</span></div>' +
      '<ul class="up-feats" style="margin-top:18px"><li>Up to ' + f.subjects + ' subjects</li><li>' + f.music + ' music searches per day</li>' +
      '<li>' + f.tasks + ' task limit (active tasks)</li><li>Up to ' + f.friends + ' active friends</li><li>Up to ' + f.habits + ' active habits</li>' +
      '<li>Study logs, marks tracker &amp; class log</li><li>A/L countdown &amp; performance charts</li>' +
      '<li class="more"><a data-route="guide">See all free features →</a></li></ul>' + freeBtn + '</div>' +

      '<div class="up-card featured"><div class="up-badge">ONE-TIME</div><div class="up-plan-name">Lifetime</div>' +
      '<div class="up-price">' + cur + ' ' + money(d.pricePro) + '<span>/once</span></div><div class="up-save">Pay once, Pro forever — no renewals</div>' +
      '<ul class="up-feats"><li>Unlimited subjects &amp; Task</li><li>Unlimited music search</li><li>Add Unlimited friends &amp; habits</li>' +
      '<li>Smart Planner — plan your day &amp; track what you actually studied</li><li>Smart Features Center — readiness score, marks predictor, deadline guard</li>' +
      '<li>Smart Planner PDF, sent straight to Telegram</li><li>Priority response speed</li></ul>' + proBtn + '</div>' +

      '<div class="up-card premium"><div class="up-badge gold">TOP TIER</div><div class="up-plan-name">Premium</div>' +
      '<div class="up-price">' + cur + ' ' + money(d.pricePremium) + '<span>/once</span></div><div class="up-save">Everything in Pro, plus exclusive extras</div>' +
      '<ul class="up-feats"><li>Everything in Pro, unlimited</li><li>Exclusive Aurora &amp; Sakura themes</li><li>Priority support queue</li>' +
      '<li>📄 Premium PDF study report + Telegram delivery</li><li>👑 Premium badge</li></ul>' + premBtn + '</div>' +
      '</div>' + referral(d) +
      '<p class="up-note">Payments are securely processed by PayHere in your browser. Your plan activates automatically and permanently once payment is confirmed — this page refreshes when you come back to the app.</p></div>';
    pc.innerHTML = html;
    wire(pc, d);
  }

  function referral(d) {
    var r = d.ref;
    if (!r.ok || (d.isPremium && !r.proGranted && !r.premiumGranted)) return '';
    var head = '<div class="up-ref" id="upRef"><div class="up-ref-head"><div class="up-ref-ic">🎁</div><div class="up-ref-title">Unlock Pro &amp; Premium with referrals<span class="up-ref-tag">FREE</span></div></div>';
    if (r.premiumGranted) {
      return head + '<div class="up-ref-desc">🎉 You unlocked <strong>Lifetime Premium</strong> by inviting friends. Thanks for spreading the word!</div>' +
        '<div class="up-ref-actions"><button type="button" class="up-btn ghost" data-route="referrals">View my referrals →</button></div></div>';
    }
    var max = Math.max(r.proTarget, r.premiumTarget), shown = Math.min(r.verified, max);
    var pct = Math.round(shown / max * 100), proPct = Math.round(r.proTarget / max * 100), premPct = Math.round(r.premiumTarget / max * 100);
    var leftPro = Math.max(0, r.proTarget - r.verified), leftPrem = Math.max(0, r.premiumTarget - r.verified);
    var next = (!d.isPro && !r.proGranted && leftPro > 0) ? leftPro + ' more to unlock Pro' : (leftPrem > 0 ? leftPrem + ' more to unlock Premium' : 'Target reached!');
    var desc = (r.proGranted || d.isPro)
      ? (r.proGranted ? '🎉 You unlocked <strong>Lifetime Pro</strong> by inviting friends. ' : '') + 'Keep going — reach <strong>' + r.premiumTarget + ' verified friends</strong> in total and unlock <strong>Lifetime Premium</strong> for free too (Aurora &amp; Sakura themes, priority support, 👑 badge).'
      : 'Don\'t want to pay? Invite <strong>' + r.proTarget + ' friends</strong> to StudyTrack for <strong>Lifetime Pro</strong>, or <strong>' + r.premiumTarget + ' friends</strong> for <strong>Lifetime Premium</strong> — both completely free, no payment.';
    return head + '<div class="up-ref-desc">' + desc + '</div>' +
      '<div class="up-ref-barwrap"><div class="up-ref-bar"><div class="up-ref-fill" style="width:' + pct + '%"></div></div>' +
      (proPct < 100 ? '<div class="up-ref-tick" style="left:' + proPct + '%"></div>' : '') + (premPct < 100 ? '<div class="up-ref-tick" style="left:' + premPct + '%"></div>' : '') +
      '<div class="up-ref-tlabel' + ((r.proGranted || d.isPro) ? ' done' : '') + '" style="left:' + proPct + '%;transform:translateX(' + (proPct >= 100 ? '-100%' : '-50%') + ')">⭐ Pro · ' + r.proTarget + '</div>' +
      '<div class="up-ref-tlabel" style="left:' + premPct + '%;transform:translateX(' + (premPct >= 100 ? '-100%' : '-50%') + ')">👑 Premium · ' + r.premiumTarget + '</div></div>' +
      '<div class="up-ref-meta"><span><b>' + shown + '</b> / ' + max + ' friends verified' + (r.pending > 0 ? ' · ' + r.pending + ' pending' : '') + '</span><span>' + esc(next) + '</span></div>' +
      '<div class="up-ref-actions"><button type="button" class="up-btn" data-route="referrals">🎁 Invite friends &amp; track progress</button>' +
      '<button type="button" class="up-btn ghost" id="upCopyRef">🔗 Copy my link</button></div>' +
      '<div class="up-ref-hint">A friend counts once they sign up with your link, verify their account and start studying on StudyTrack.</div></div>';
  }

  function wire(pc, d) {
    pc.querySelectorAll('[data-buy]').forEach(function (b) {
      b.onclick = function () { waiting = true; open(SITE + '/checkout-details.php?tier=' + b.getAttribute('data-buy')); toast('Checkout opened in your browser — this page updates when you come back.'); };
    });
    pc.querySelectorAll('[data-route]').forEach(function (a) {
      a.onclick = function () { location.hash = '#/' + a.getAttribute('data-route'); };
    });
    var g = pc.querySelector('[data-goto="ref"]');
    if (g) g.onclick = function () { var el = pc.querySelector('#upRef'); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
    var c = pc.querySelector('#upCopyRef');
    if (c) c.onclick = function () {
      var old = c.textContent;
      var done = function () { c.textContent = '✅ Link copied!'; setTimeout(function () { c.textContent = old; }, 1800); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(d.ref.link).then(done, function () { toast(d.ref.link); });
      else toast(d.ref.link);
    };
  }

  /* back from the browser after paying -> refresh the plan */
  window.addEventListener('focus', function () {
    if (!waiting || !here() || !curPc || !document.body.contains(curPc)) return;
    waiting = false;
    api('up_page').then(function (d) { if (here() && d && d.success) { render(curPc, d); if (d.isPro || d.isPremium) toast('Your plan is active 🎉'); } });
  });
})();
