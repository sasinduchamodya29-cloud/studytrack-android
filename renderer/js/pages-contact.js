/* StudyTrack Desktop - Contact & Support page (v1.16: same layout and look as the website's contact.php).
   Data: pages9.php (actions ct_*). Needs js/pages-extra.js first. Styles: css/pages-site.css (.cp ...) */
(function () {
  var Pages = window.stPages, TITLES = window.stTitles, api = window.stApi, UI = window.StUI;
  if (!Pages || !api || !UI) return;
  var toast = UI.toast, errPage = UI.errPage;
  TITLES.contact = 'Contact & Support';
  var WA = 'https://wa.me/94704313633', TG = 'https://t.me/SuportEdurx', SITE = 'https://edurx.icu/studytrack';
  var TOPICS = [['Account Issue', '🔐'], ['Bug Report', '🐛'], ['Feature Request', '💡'], ['Data / Privacy', '🔒'], ['General Question', '❓'], ['Other', '📋']];
  var WA_SVG = '<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>';
  var TG_SVG = '<path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>';

  function esc(s) { return E(String(s == null ? '' : s)); }
  function here() { return location.hash.indexOf('#/contact') === 0; }
  function open(u) { window.st.openExternal(u); }
  function svg(path, size, fill) { return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="' + fill + '">' + path + '</svg>'; }

  Pages.contact = function (pc) {
    return api('ct_page').then(function (d) {
      if (!here()) return;
      if (!d || !d.success) return errPage(pc, d);
      render(pc, d);
    });
  };

  function render(pc, d) {
    var n = d.unread | 0;
    var banner = '<div class="tk-banner' + (n > 0 ? ' has-new' : '') + '" id="cpTk">' +
      '<div class="tk-banner-ic">🎫' + (n > 0 ? '<span class="tk-ic-dot"></span>' : '') + '</div>' +
      '<div class="tk-banner-txt"><div class="tk-banner-title">Support Tickets' + (n > 0 ? '<span class="tk-new-pill">' + (n > 99 ? '99+' : n) + ' new</span>' : '') + '</div>' +
      '<div class="tk-banner-sub">' + (n > 0 ? '<span class="tk-new-txt">You have ' + n + ' unread ' + (n === 1 ? 'reply' : 'replies') + ' from our team.</span> Tap to read.' : "Open a ticket, attach screenshots, and follow our team's replies in one place.") + '</div></div>' +
      '<div class="tk-banner-cta">Open my tickets →</div></div>';

    var emailCard = '<div class="ch-card email-card"><div class="ch-head"><div class="ch-icon em">✉️</div><div><div class="ch-title">Send an Email</div><div class="ch-desc">Detailed support inquiries</div></div></div>' +
      '<form id="cpMail" novalidate>' +
      '<div class="f-group"><label class="f-label">Your Name</label><input type="text" name="name" class="f-input" placeholder="Kavindu Perera" maxlength="100" value="' + esc(d.name) + '"></div>' +
      '<div class="f-group"><label class="f-label">Email Address</label><input type="email" name="email" class="f-input" placeholder="you@example.com" value="' + esc(d.email) + '"></div>' +
      '<div class="f-group"><label class="f-label">Subject</label><select name="subject" class="f-select"><option value="" disabled selected>Select a topic…</option>' +
      TOPICS.map(function (t) { return '<option value="' + t[0] + '">' + t[1] + ' ' + t[0] + '</option>'; }).join('') + '</select></div>' +
      '<div class="f-group"><label class="f-label">Message</label><textarea name="message" class="f-textarea" maxlength="4000" placeholder="Describe your issue or question in detail…"></textarea></div>' +
      '<button type="submit" class="btn-ch btn-em" id="cpMailBtn"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>Send Email</button></form></div>';

    function chatCard(cls, ic, svgPath, color, title, desc, rows, formId, btnCls, btnLabel) {
      return '<div class="ch-card ' + cls + '"><div class="ch-head"><div class="ch-icon ' + ic + '">' + svg(svgPath, 22, color) + '</div><div><div class="ch-title">' + title + '</div><div class="ch-desc">' + desc + '</div></div></div>' +
        '<div class="ch-info-body">' + rows.map(function (r) { return '<div class="ch-info-row"><span class="ch-info-label">' + r[0] + '</span><span class="ch-info-val">' + r[1] + '</span></div>'; }).join('') + '</div>' +
        '<form id="' + formId + '" novalidate>' +
        '<div class="f-group"><label class="f-label">Your Name</label><input type="text" name="name" class="f-input" placeholder="Kavindu Perera" maxlength="100" value="' + esc(d.name) + '"></div>' +
        '<div class="f-group"><label class="f-label">Your Email</label><input type="email" name="email" class="f-input" placeholder="you@example.com" value="' + esc(d.email) + '"></div>' +
        '<div class="f-group"><label class="f-label">Message</label><textarea name="message" class="f-textarea" placeholder="Describe your issue or question…" style="min-height:80px"></textarea></div>' +
        '<button type="submit" class="btn-ch ' + btnCls + '">' + svg(svgPath, 16, 'white') + btnLabel + '</button></form></div>';
    }
    var waCard = chatCard('wa-card', 'wa', WA_SVG, '#25D366', 'WhatsApp', 'Quick questions &amp; fast replies', [['Number', '+94 70 431 3633'], ['Hours', 'Mon–Sat, 9am–9pm SL']], 'cpWa', 'btn-wa', 'Send via WhatsApp');
    var tgCard = chatCard('tg-card', 'tg', TG_SVG, '#2AABEE', 'Telegram', 'Message our support account', [['Username', '@SuportEdurx'], ['Hours', 'Mon–Sat, 9am–9pm SL']], 'cpTg', 'btn-tg', 'Send via Telegram');

    function quick(u, ic, t, s) { return '<a class="quick-card" data-u="' + u + '"><div class="quick-icon">' + ic + '</div><div><div class="quick-card-title">' + t + '</div><div class="quick-card-sub">' + s + '</div></div></a>'; }

    pc.innerHTML = '<div class="cp">' +
      '<div class="cp-hero"><div class="cp-hero-bg"></div><div class="cp-hero-grid"></div><div style="position:relative">' +
      '<div class="cp-badge">💬 We\'re here to help</div><h1 class="cp-title">Contact &amp; <span>Support</span></h1>' +
      '<p class="cp-sub">Have a question, bug report or feedback? Reach us through any channel — we typically respond within 24 hours.</p></div></div>' +
      '<div id="cpErr"></div>' + banner +
      '<div class="contact-grid">' + emailCard + waCard + tgCard + '</div>' +
      '<div class="quick-sec"><div class="quick-title">Quick Help</div><p class="quick-sub">Common answers — find your solution instantly</p><div class="quick-grid">' +
      quick(SITE + '/forgot-password', '🔑', 'Reset Password', 'Forgot or locked out?') +
      quick(SITE + '/guide', '📖', 'User Guide', 'Learn every feature') +
      quick(SITE + '/privacy', '🔒', 'Privacy Policy', 'How we handle your data') +
      quick(SITE + '/terms', '📄', 'Terms &amp; Conditions', 'Usage guidelines') + '</div></div></div>';

    pc.querySelectorAll('[data-u]').forEach(function (a) { a.onclick = function () { open(a.dataset.u); }; });
    pc.querySelector('#cpTk').onclick = function () { open(SITE + '/support-tickets'); };

    /* ── email form → sent through the site's SMTP (ct_send) ── */
    var mail = pc.querySelector('#cpMail'), mbtn = pc.querySelector('#cpMailBtn'), err = pc.querySelector('#cpErr');
    function showErr(msg) { err.innerHTML = '<div class="site-alert err">' + msg + '</div>'; err.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }
    mail.onsubmit = function (e) {
      e.preventDefault(); err.innerHTML = '';
      var f = mail.elements, body = { name: f.name.value.trim(), email: f.email.value.trim(), subject: f.subject.value, message: f.message.value.trim() };
      if (!body.name || !body.email || !body.subject || !body.message || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(body.email)) return showErr('⚠️ Please fill in all fields correctly before submitting.');
      var html = mbtn.innerHTML; mbtn.disabled = true; mbtn.textContent = 'Sending…';
      api('ct_send', body).then(function (r) {
        mbtn.disabled = false; mbtn.innerHTML = html;
        if (!r || !r.success) return showErr('❌ ' + esc((r && r.message) || "Couldn't send your message right now. Please try WhatsApp or Telegram instead."));
        f.message.value = ''; f.subject.selectedIndex = 0;
        successModal();
      });
    };

    /* ── WhatsApp / Telegram: build the message and open the chat with it pre-filled ── */
    function chat(form, base, label) {
      form.onsubmit = function (e) {
        e.preventDefault();
        var f = form.elements, name = f.name.value.trim(), email = f.email.value.trim(), message = f.message.value.trim();
        if (!name || !email || !message) return toast('Fill in your name, email and message', 'warn');
        var text = 'Hi StudyTrack Support,\n\nName: ' + name + '\nEmail: ' + email + '\n\nMessage:\n' + message;
        open(base + '?text=' + encodeURIComponent(text));
        toast('✅ Opening ' + label + ' with your message…', 'ok');
        f.message.value = '';
      };
    }
    chat(pc.querySelector('#cpWa'), WA, 'WhatsApp');
    chat(pc.querySelector('#cpTg'), TG, 'Telegram');
  }

  function successModal() {
    var ov = document.createElement('div'); ov.className = 'st-modal-overlay';
    ov.innerHTML = '<div class="st-modal"><div class="st-modal-icon"><svg viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div>' +
      '<div class="st-modal-title">Message Sent!</div><div class="st-modal-desc">Thanks for reaching out — our team will reply to your email within 24 hours.</div><button class="st-modal-close">Got it</button></div>';
    document.body.appendChild(ov);
    requestAnimationFrame(function () { ov.classList.add('open'); });
    function close() { ov.classList.remove('open'); setTimeout(function () { ov.remove(); }, 260); document.removeEventListener('keydown', esc); }
    function esc(e) { if (e.key === 'Escape') close(); }
    document.addEventListener('keydown', esc);
    ov.querySelector('.st-modal-close').onclick = close;
    ov.addEventListener('mousedown', function (e) { if (e.target === ov) close(); });
  }
})();
