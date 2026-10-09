/* StudyTrack Desktop - auth screens: Get Started (welcome), Sign in, Sign up, Verify email.
 * Same design as the website's login / register / verify-otp pages (css/auth.css is ported from assets/auth-shared.css).
 * app.js calls  window.stAuth.mount({ api, message })  when there is no session. */
(function () {
  var SITE = 'https://edurx.icu/studytrack/';
  var EYE = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
  var EYE_OFF = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>';
  var G_SVG = '<svg width="17" height="17" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>';
  var F_SVG = '<svg width="17" height="17" viewBox="0 0 24 24" fill="#1877f2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>';

  var api = null, root = null, socialTimer = null, resendTimer = null, state = { email: '' };

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function $(id) { return document.getElementById(id); }
  function ext(url) { if (window.st && window.st.openExternal) window.st.openExternal(url); }
  function stopTimers() { if (socialTimer) { clearInterval(socialTimer); socialTimer = null; } if (resendTimer) { clearInterval(resendTimer); resendTimer = null; } }

  /* ── toasts (same look as the website's auth toasts) ── */
  function toast(msg, type) {
    var wrap = $('saToasts'); if (!wrap) return;
    var t = document.createElement('div');
    t.className = 'sa-toast ' + (type === 'ok' ? 'ok' : 'err');
    t.innerHTML = '<span class="sa-toast-ic">' + (type === 'ok' ? '✓' : '!') + '</span><div class="sa-toast-body">' + esc(msg) + '</div><i class="sa-toast-bar"></i>';
    function bye() { if (t._d) return; t._d = 1; t.classList.add('hide'); setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 300); }
    t.onclick = bye; wrap.appendChild(t); setTimeout(bye, 4500);
  }

  /* ── shared pieces ── */
  function brandPanel(title, sub, feats) {
    return '<div class="auth-left"><div class="auth-left-grid"></div><div class="auth-left-content">' +
      '<div class="auth-logo"><img class="auth-logo-img" src="logo.png" alt=""><div><div class="auth-logo-name">StudyTrack</div><div class="auth-logo-tag">by EduRX</div></div></div>' +
      '<div class="auth-hero"><div class="auth-hero-label">Free A/L Study Tracker</div>' +
      '<h1 class="auth-hero-title">' + title + '</h1><p class="auth-hero-sub">' + sub + '</p>' +
      '<div class="auth-features">' + feats.map(function (f) {
        return '<div class="auth-feature"><div class="auth-feature-icon" style="background:' + f[0] + '">' + f[1] + '</div><span>' + f[2] + '</span></div>';
      }).join('') + '</div></div></div></div>';
  }
  var FEATS_LOGIN = [['rgba(99,102,241,.14)', '📊', 'Real-time study analytics & streaks'], ['rgba(6,182,212,.14)', '🗓️', 'Smart timetable & session planner'], ['rgba(16,185,129,.14)', '🏆', 'Leaderboards, goals & achievements'], ['rgba(139,92,246,.14)', '🤖', 'AI-powered study tips & insights']];
  var FEATS_REG = [['rgba(16,185,129,.14)', '✅', 'Free forever — no hidden fees'], ['rgba(99,102,241,.14)', '📈', 'Detailed progress analytics'], ['rgba(245,158,11,.14)', '🎯', 'Set goals, track streaks, earn badges'], ['rgba(6,182,212,.14)', '🤝', 'Campus community & leaderboard']];
  var MOBILE_LOGO = '<div class="auth-mobile-logo"><img src="logo.png" alt="" style="width:34px;height:34px;border-radius:10px"><span style="font-family:\'Sora\',sans-serif;font-size:18px;font-weight:800;background:linear-gradient(135deg,#e0e7ff,#a5b4fc);-webkit-background-clip:text;-webkit-text-fill-color:transparent">StudyTrack</span></div>';

  function field(label, icon, inner) {
    return '<div class="f-group"><label class="f-label">' + label + '</label><div class="f-input-wrap"><span class="f-icon">' + icon + '</span>' + inner + '</div></div>';
  }
  function pwField(label, id, ph, extra) {
    return '<div class="f-group"><label class="f-label">' + label + '</label><div class="f-input-wrap"><span class="f-icon">🔒</span>' +
      '<input type="password" id="' + id + '" class="f-input" placeholder="' + ph + '" required ' + (extra || '') + '>' +
      '<button type="button" class="f-eye" data-eye="' + id + '">' + EYE + '</button></div>' + (id === 'saRegPw' ? '<div class="pw-bar-wrap"><div class="pw-bar" id="saPwBar"></div></div><div class="pw-hint" id="saPwHint"></div>' : '') + '</div>';
  }
  function socialBlock(label) {
    return '<div class="auth-divider"><span>' + label + '</span></div><div style="display:flex;flex-direction:column;gap:10px">' +
      '<button type="button" class="btn-social google" id="saGoogle">' + G_SVG + 'Continue with Google</button>' +
      '<button type="button" class="btn-social facebook" id="saFb">' + F_SVG + 'Continue with Facebook</button></div>' +
      '<div class="sa-social-wait" id="saWait" style="display:none"></div>';
  }
  function shell(inner) {
    stopTimers();
    root.innerHTML = '<div id="saToasts"></div>' + inner;
    var eyes = root.querySelectorAll('[data-eye]');
    Array.prototype.forEach.call(eyes, function (b) {
      b.onclick = function () { var i = $(b.getAttribute('data-eye')); i.type = i.type === 'password' ? 'text' : 'password'; b.innerHTML = i.type === 'password' ? EYE : EYE_OFF; };
    });
  }
  function busy(btn, on, html, idle) { btn.disabled = on; btn.innerHTML = on ? '<span class="spinner"></span> ' + html : idle; }

  /* ── Google / Facebook (browser sign-in, the app polls until the server hands over a token) ── */
  function bindSocial() {
    var g = $('saGoogle'), f = $('saFb'); if (!g || !f) return;
    g.onclick = function () { social({ name: 'Google', page: 'google-auth.php' }); };
    f.onclick = function () { social({ name: 'Facebook', page: 'fb-auth.php' }); };
  }
  function social(p) {
    stopTimers();
    var wait = $('saWait');
    var arr = new Uint8Array(16); crypto.getRandomValues(arr);
    var nonce = Array.prototype.map.call(arr, function (b) { return ('0' + b.toString(16)).slice(-2); }).join('');
    wait.style.display = 'block';
    wait.innerHTML = '<div>Finish signing in with ' + p.name + ' in your browser. This app opens automatically when you are done.</div><a href="#" id="saWaitCancel">Cancel</a>';
    $('saWaitCancel').onclick = function (e) { e.preventDefault(); stopTimers(); wait.style.display = 'none'; };
    ext(SITE + p.page + '?desktop=' + nonce);
    var started = Date.now(), inflight = false;
    function tick() {
      if (inflight) return;
      if (Date.now() - started > 5 * 60 * 1000) { stopTimers(); wait.style.display = 'none'; toast('Sign-in timed out. Please try again.'); return; }
      inflight = true;
      api('social_poll', { nonce: nonce }).then(function (d) {
        inflight = false;
        if (!socialTimer) return;
        if (d && d.success && d.pending) return;
        stopTimers();
        if (d && d.success) { window.st.reload(); return; }
        wait.style.display = 'none'; toast((d && d.message) || 'Sign in failed.');
      });
    }
    socialTimer = setInterval(tick, 2000);
    window.stSocialNow = tick;   // called when the browser sends us back via studytrack://
  }

  /* ── 1. Get Started ── */
  function welcome() {
    shell(
      '<div class="sa-welcome"><i class="sa-blob b1"></i><i class="sa-blob b2"></i><i class="sa-blob b3"></i><div class="auth-left-grid" style="opacity:.6"></div>' +
      '<div class="sa-w-inner">' +
      '<div class="sa-w-logo"><img src="logo.png" alt=""></div>' +
      '<div class="sa-w-brand">StudyTrack <span>by EduRX</span></div>' +
      '<div class="auth-hero-label" style="justify-content:center">Free A/L Study Tracker</div>' +
      '<h1 class="sa-w-title">Track every hour.<br><span>Ace your A/Ls.</span></h1>' +
      '<p class="sa-w-sub">Plan your study, stay on your streak and watch your marks climb, all in one place. Join thousands of Sri Lankan students already tracking their way to success.</p>' +
      '<div class="sa-w-chips"><span>📊 Live analytics</span><span>⏱️ Focus timer</span><span>🏆 Leaderboards</span><span>🎯 Goals & streaks</span></div>' +
      '<button class="btn-auth sa-w-btn" id="saStart" type="button">Get Started →</button>' +
      '<div class="auth-foot" style="margin-top:18px">Already have an account? <a id="saHaveAcc">Sign in</a></div>' +
      '</div></div>');
    $('saStart').onclick = register;
    $('saHaveAcc').onclick = function () { login(); };
  }

  /* ── 2. Sign in ── */
  function login(msg) {
    shell('<div class="auth-layout">' + brandPanel('Track every hour.<br><span>Ace your A/Ls.</span>', 'Join thousands of Sri Lankan students using StudyTrack to organize their study schedule, monitor progress, and hit their targets.', FEATS_LOGIN) +
      '<div class="auth-right"><div class="auth-form-wrap">' + MOBILE_LOGO +
      '<button class="auth-back" id="saBack" type="button">← Back</button>' +
      '<h2 class="auth-form-title">Welcome back 👋</h2><p class="auth-form-sub">Sign in to continue tracking your progress</p>' +
      '<form id="saLoginForm" novalidate>' +
      field('Email or Username', '✉️', '<input type="text" id="saId" class="f-input" placeholder="you@email.com or username" required autofocus autocapitalize="off" autocorrect="off">') +
      pwField('Password', 'saPw', 'Your password') +
      '<div class="f-forgot"><a id="saForgot">Forgot password?</a></div>' +
      '<button type="submit" id="saLoginBtn" class="btn-auth">Sign In →</button></form>' +
      socialBlock('or continue with') +
      '<div class="auth-foot">New here? <a id="saToReg">Create a free account</a></div>' +
      '</div></div></div>');
    if (msg) toast(msg);
    bindSocial();
    $('saBack').onclick = welcome;
    $('saToReg').onclick = register;
    $('saForgot').onclick = function () { ext(SITE + 'forgot-password'); };
    $('saLoginForm').onsubmit = function (e) {
      e.preventDefault();
      var id = $('saId').value.trim(), pw = $('saPw').value, b = $('saLoginBtn');
      if (!id || !pw) { toast('Please enter your email/username and password.'); return; }
      busy(b, true, 'Signing in…');
      api('login', { identifier: id, password: pw }).then(function (d) {
        if (d && d.success) { b.innerHTML = '✓ Done'; window.st.reload(); return; }
        if (d && d.verify && d.email) { state.email = d.email; verify(d.message || 'Your email is not verified. We sent you a new code.'); return; }
        toast((d && d.message) || 'Login failed. Please try again.');
        busy(b, false, '', 'Sign In →'); $('saPw').value = ''; $('saPw').focus();
      });
    };
  }

  /* ── 3. Sign up ── */
  function register() {
    shell('<div class="auth-layout">' + brandPanel('Start your<br><span>A/L journey.</span>', 'Create your free account in seconds and join thousands of Sri Lankan students already tracking their way to success.', FEATS_REG) +
      '<div class="auth-right"><div class="auth-form-wrap">' + MOBILE_LOGO +
      '<button class="auth-back" id="saBack" type="button">← Back</button>' +
      '<h2 class="auth-form-title">Create your account 🚀</h2><p class="auth-form-sub">Start tracking your A/L journey today — it\'s completely free</p>' +
      '<div class="auth-perks"><div class="auth-perk">✅ Free forever</div><div class="auth-perk">📊 Live stats</div><div class="auth-perk">🔒 Secure</div></div>' +
      '<div id="saNotice"></div>' +
      '<form id="saRegForm" novalidate>' +
      field('Full Name', '👤', '<input type="text" id="saName" class="f-input" placeholder="Your full name" required autofocus>') +
      field('Email Address', '✉️', '<input type="email" id="saEmail" class="f-input" placeholder="you@email.com" required>') +
      pwField('Password', 'saRegPw', 'Min. 8 characters') +
      pwField('Confirm Password', 'saRegPw2', 'Repeat password') +
      '<label class="f-check"><input type="checkbox" id="saAgree"><span>I agree to the <a id="saTerms">Terms &amp; Conditions</a> and <a id="saPriv">Privacy Policy</a></span></label>' +
      '<button type="submit" id="saRegBtn" class="btn-auth">Create Account →</button></form>' +
      '<div id="saRegSocial">' + socialBlock('or sign up with') + '</div>' +
      '<div class="auth-foot">Already have an account? <a id="saToLogin">Sign In</a></div>' +
      '</div></div></div>');
    bindSocial();
    $('saBack').onclick = welcome;
    $('saToLogin').onclick = function () { login(); };
    $('saTerms').onclick = function () { ext(SITE + 'terms'); };
    $('saPriv').onclick = function () { ext(SITE + 'privacy'); };
    $('saRegPw').oninput = function () {
      var v = this.value, s = 0;
      if (v.length >= 8) s++; if (/[A-Z]/.test(v)) s++; if (/[0-9]/.test(v)) s++; if (/[^A-Za-z0-9]/.test(v)) s++;
      var L = [['0%', 'transparent', ''], ['25%', '#ef4444', 'Weak'], ['50%', '#f97316', 'Fair'], ['75%', '#eab308', 'Good'], ['100%', '#10b981', 'Strong 💪']][s];
      var bar = $('saPwBar'), hint = $('saPwHint'); bar.style.width = L[0]; bar.style.background = L[1]; hint.textContent = L[2]; hint.style.color = L[1];
    };
    // is manual sign-up open? (admin → Site Settings)
    api('signup_info').then(function (d) {
      if (!d || !d.success || !$('saNotice')) return;
      var n = $('saNotice');
      if (!d.manual) {
        n.innerHTML = '<div class="sa-note info">✍️ Manual sign-up is temporarily unavailable. Please continue with Google or Facebook below.</div>';
        $('saRegForm').style.display = 'none';
      } else if (d.closed) {
        n.innerHTML = '<div class="sa-note err">🚫 ' + esc(d.closed) + ' Already have an account? <a id="saNoteLogin">Sign in</a></div>';
        $('saRegBtn').disabled = true;
        $('saNoteLogin').onclick = function () { login(); };
      }
    });
    $('saRegForm').onsubmit = function (e) {
      e.preventDefault();
      var name = $('saName').value.trim(), email = $('saEmail').value.trim(), pw = $('saRegPw').value, pw2 = $('saRegPw2').value, b = $('saRegBtn');
      if (!name || !email || !pw || !pw2) { toast('All fields are required.'); return; }
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { toast('Please enter a valid email address.'); return; }
      if (pw.length < 8) { toast('Password must be at least 8 characters.'); return; }
      if (pw !== pw2) { toast('Passwords do not match.'); return; }
      if (!$('saAgree').checked) { toast('Please agree to the Terms & Conditions to continue.'); return; }
      busy(b, true, 'Creating account…');
      api('register', { name: name, email: email, password: pw, confirm_password: pw2 }).then(function (d) {
        if (d && d.success) { state.email = d.email || email; verify('Account created! We sent a 6-digit code to your email.', true); return; }
        toast((d && d.message) || 'Registration failed. Please try again.');
        busy(b, false, '', 'Create Account →');
      });
    };
  }

  /* ── 4. Verify email (6-digit code) ── */
  function verify(msg, okMsg) {
    var boxes = '';
    for (var i = 0; i < 6; i++) boxes += '<input class="otp-digit" type="text" maxlength="1" inputmode="numeric" pattern="[0-9]" ' + (i === 0 ? 'autocomplete="one-time-code" autofocus' : '') + '>';
    shell('<div class="auth-layout">' + brandPanel('Almost<br><span>there!</span>', 'We sent a 6-digit code to your email. Enter it to confirm your account and start tracking.', FEATS_REG) +
      '<div class="auth-right"><div class="auth-form-wrap">' + MOBILE_LOGO +
      '<div style="font-size:44px;line-height:1;margin-bottom:14px">📬</div>' +
      '<h2 class="auth-form-title">Check your email</h2><p class="auth-form-sub" style="margin-bottom:16px">Enter the 6-digit code we sent to</p>' +
      '<div class="sa-pill">✉️ ' + esc(state.email) + '</div>' +
      '<form id="saOtpForm" novalidate><div class="otp-inputs" id="saOtp">' + boxes + '</div>' +
      '<button type="submit" id="saVerifyBtn" class="btn-auth" disabled style="opacity:.5">Verify Email →</button></form>' +
      '<div style="text-align:center;margin-top:24px"><p style="font-size:13px;color:var(--ink3);margin-bottom:10px">Didn\'t receive the code?</p>' +
      '<button id="saResend" type="button" class="btn-bio" style="width:auto;padding:9px 20px;font-size:13px">Resend Code</button>' +
      '<p id="saResendT" style="font-size:12px;color:var(--ink3);margin-top:8px;display:none"></p></div>' +
      '<div class="auth-foot" style="margin-top:20px">Wrong account? <a id="saStartOver">Start over</a></div>' +
      '</div></div></div>');
    if (msg) toast(msg, okMsg ? 'ok' : 'err');
    var ds = root.querySelectorAll('.otp-digit'), btn = $('saVerifyBtn');
    function code() { return Array.prototype.map.call(ds, function (d) { return d.value; }).join(''); }
    function refresh() {
      var ok = /^\d{6}$/.test(code()); btn.disabled = !ok; btn.style.opacity = ok ? 1 : .5;
      Array.prototype.forEach.call(ds, function (d) { d.classList.toggle('filled', !!d.value); });
    }
    Array.prototype.forEach.call(ds, function (d, i) {
      d.addEventListener('input', function () {
        d.value = d.value.replace(/\D/g, '').slice(-1);
        if (d.value && i < 5) ds[i + 1].focus();
        refresh();
        if (/^\d{6}$/.test(code())) $('saOtpForm').requestSubmit();
      });
      d.addEventListener('keydown', function (e) { if (e.key === 'Backspace' && !d.value && i > 0) { ds[i - 1].focus(); ds[i - 1].value = ''; refresh(); } });
      d.addEventListener('paste', function (e) {
        var t = ((e.clipboardData || window.clipboardData).getData('text') || '').replace(/\D/g, '').slice(0, 6);
        if (!t) return; e.preventDefault();
        for (var k = 0; k < 6; k++) ds[k].value = t[k] || '';
        ds[Math.min(t.length, 5)].focus(); refresh();
        if (t.length === 6) $('saOtpForm').requestSubmit();
      });
    });
    $('saOtpForm').onsubmit = function (e) {
      e.preventDefault();
      if (!/^\d{6}$/.test(code())) { toast('Please enter the 6-digit code.'); return; }
      busy(btn, true, 'Verifying…');
      api('verify_otp', { email: state.email, otp: code() }).then(function (d) {
        if (d && d.success) { btn.innerHTML = '✓ Verified!'; toast('Email verified! Welcome to StudyTrack.', 'ok'); setTimeout(function () { window.st.reload(); }, 600); return; }
        toast((d && d.message) || 'Incorrect code. Please try again.');
        busy(btn, false, '', 'Verify Email →');
        Array.prototype.forEach.call(ds, function (x) { x.value = ''; }); refresh(); ds[0].focus();
      });
    };
    function cooldown(sec) {
      var rb = $('saResend'), t = $('saResendT'); rb.disabled = true; t.style.display = 'block';
      (function tick() { t.textContent = 'You can request a new code in ' + sec + 's'; })();
      resendTimer = setInterval(function () {
        sec--; if (sec <= 0) { clearInterval(resendTimer); resendTimer = null; rb.disabled = false; t.style.display = 'none'; return; }
        t.textContent = 'You can request a new code in ' + sec + 's';
      }, 1000);
    }
    cooldown(30);
    $('saResend').onclick = function () {
      var rb = $('saResend'); rb.disabled = true;
      api('resend_otp', { email: state.email }).then(function (d) {
        if (d && d.success) { toast(d.message || 'A new code has been sent to your email.', 'ok'); cooldown(30); }
        else { toast((d && d.message) || 'Could not send a new code.'); rb.disabled = false; }
      });
    };
    $('saStartOver').onclick = register;
  }

  window.stAuth = {
    mount: function (o) {
      api = o.api;
      var app = document.getElementById('app');
      document.body.classList.add('st-login-mode');
      app.innerHTML = '<div id="stAuth"></div>';
      root = document.getElementById('stAuth');
      if (window.st.onDeepLink) window.st.onDeepLink(function () { if (socialTimer && window.stSocialNow) window.stSocialNow(); });
      if (o.message) login(o.message); else welcome();
    }
  };
})();
