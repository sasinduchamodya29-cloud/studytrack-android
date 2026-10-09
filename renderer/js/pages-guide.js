/* StudyTrack Desktop - User Guide page (same content + layout as the website's guide.php).
   Data: pages14.php (action gd_page) - the guide the admin writes in Admin -> Guide. Styles: css/pages-guide.css (.gd ...)
   Needs js/pages-extra.js first. Feature buttons / links open the app's own page when it has one, otherwise the website. */
(function () {
  var Pages = window.stPages, TITLES = window.stTitles, api = window.stApi, UI = window.StUI;
  if (!Pages || !api || !UI) return;
  var toast = UI.toast, errPage = UI.errPage;
  TITLES.guide = 'User Guide';
  var SITE = 'https://edurx.icu/studytrack';

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function here() { return location.hash.indexOf('#/guide') === 0; }
  function open(u) { window.st.openExternal(u); }
  function go(route, url) { if (route && Pages[route]) location.hash = '#/' + route; else if (url) open(url); }
  /* an absolute website link inside the guide text -> the app's own route (or null) */
  function routeOf(href) {
    if (href.indexOf(SITE + '/') !== 0) return null;
    var r = href.slice(SITE.length + 1).split(/[?#]/)[0].replace(/\.php$/, '').replace(/\/+$/, '');
    return r && Pages[r] ? r : null;
  }

  Pages.guide = function (pc) {
    pc.innerHTML = '<div class="gd"><div class="g-skel"></div><div class="g-skel"></div><div class="g-skel"></div></div>';
    return api('gd_page').then(function (d) {
      if (!here()) return;
      if (!d || !d.success) return errPage(pc, d);
      render(pc, d);
    });
  };

  function item(it) {
    var yt = it.yt ? '<a class="g-yt" data-yt="' + esc(it.yt) + '"><img loading="lazy" src="https://img.youtube.com/vi/' + esc(it.yt) + '/hqdefault.jpg" alt=""><b>▶</b><span>Watch video</span></a>' : '';
    var img = it.image ? '<a data-ext="' + esc(it.image) + '"><img class="g-shot" loading="lazy" src="' + esc(it.image) + '" alt="' + esc(it.title) + ' screenshot" style="cursor:pointer"></a>' : '';
    var inApp = it.route && Pages[it.route];
    return '<article class="g-item" id="gd-' + esc(it.slug) + '" data-slug="' + esc(it.slug) + '" data-search="' + esc(it.search) + '">' +
      '<div class="g-item-head"><div class="g-ico">' + esc(it.icon) + '</div><div class="g-head-text"><h3 class="g-title">' + esc(it.title) +
      ' <span class="g-tag ' + esc(it.plan) + '">' + esc(it.plan_label) + '</span></h3>' + (it.summary ? '<p class="g-summary">' + esc(it.summary) + '</p>' : '') + '</div>' +
      '<a class="g-anchor" data-copy="' + esc(it.slug) + '" title="Copy link to this feature">🔗</a></div>' +
      ((img || yt) ? '<div class="g-media">' + img + yt + '</div>' : '') +
      (it.html ? '<div class="g-content">' + it.html + '</div>' : '') +
      (it.tip ? '<div class="g-tip"><b>💡 Pro tip</b><div>' + it.tip + '</div></div>' : '') +
      '<div class="g-foot"><span class="g-updated">' + (it.updated ? 'Updated ' + esc(it.updated) : '') + '</span>' +
      (it.url ? '<button type="button" class="g-open' + (inApp ? '' : ' ext') + '" data-route="' + esc(it.route) + '" data-url="' + esc(it.url) + '">' + esc(it.btn) + (inApp ? ' →' : ' ↗') + '</button>' : '') + '</div></article>';
  }

  function render(pc, d) {
    if (!d.count) {
      pc.innerHTML = '<div class="gd"><div class="g-empty"><div class="big">🛠️</div><h2 style="color:var(--text-primary);margin-bottom:6px">The guide is being written</h2><p>Come back soon — explanations for every feature are on the way.</p></div></div>';
      return;
    }
    var toc = d.groups.map(function (g) {
      return '<div class="g-toc-group"><div class="g-toc-cat"><span>' + esc(g.icon) + '</span> ' + esc(g.name) + '</div>' + g.items.map(function (it) {
        return '<a class="g-toc-link" data-slug="' + esc(it.slug) + '"><span class="ti">' + esc(it.icon) + '</span><span>' + esc(it.title) + '</span></a>';
      }).join('') + '</div>';
    }).join('');
    var main = d.groups.map(function (g) {
      return '<section class="g-cat"><div class="g-cat-head"><div class="g-cat-ico">' + esc(g.icon) + '</div><div><h2>' + esc(g.name) + '</h2>' + (g.desc ? '<p>' + esc(g.desc) + '</p>' : '') + '</div></div>' + g.items.map(item).join('') + '</section>';
    }).join('');
    pc.innerHTML = '<div class="gd">' +
      '<header class="g-hero"><div class="g-badge">📖 Complete Guide</div><h1 class="g-h1">Everything you can do in <span class="grad">StudyTrack</span></h1>' +
      '<p class="g-sub">Every feature explained step by step. Find what you need, or use the search box.</p>' +
      '<div class="g-search"><span class="g-s-ico">🔍</span><input type="search" id="gSearch" placeholder="Search features…  (press / to focus)" autocomplete="off"><button type="button" id="gClear" aria-label="Clear search">✕</button></div>' +
      '<div class="g-stats"><span>📚 ' + d.count + ' feature' + (d.count === 1 ? '' : 's') + '</span><span>🗂️ ' + d.groups.length + ' section' + (d.groups.length === 1 ? '' : 's') + '</span></div></header>' +
      '<div class="g-wrap"><aside class="g-toc"><div class="g-toc-title">Jump to a feature</div><div class="g-toc-scroll" id="gTocScroll">' + toc + '</div></aside>' +
      '<main class="g-main">' + main +
      '<div class="g-empty" id="gNoResults"><div class="big">🔎</div><h3 style="color:var(--text-primary);margin-bottom:4px">No feature matches your search</h3><p>Try a different word, or clear the search box.</p></div>' +
      '<div class="g-cta"><h3>Still need help?</h3><p>Can\'t find your answer here? Our team is happy to help.</p><div class="row">' +
      '<button type="button" class="g-btn2 pri" data-route="contact">💬 Contact &amp; Support</button>' +
      '<button type="button" class="g-btn2" data-url="' + SITE + '/tutorial">🎬 Watch the video tutorial</button></div></div>' +
      '</main></div></div>';
    wire(pc.querySelector('.gd'));
  }

  function wire(root) {
    var $$ = function (s, r) { return Array.prototype.slice.call((r || root).querySelectorAll(s)); };
    var input = root.querySelector('#gSearch'), clear = root.querySelector('#gClear'), noRes = root.querySelector('#gNoResults');
    var items = $$('.g-item'), cats = $$('.g-cat'), tocLinks = $$('.g-toc-link'), tocGroups = $$('.g-toc-group');
    var scroller = document.querySelector('.main-content');

    function filter() {
      var q = (input.value || '').toLowerCase().trim(), words = q ? q.split(/\s+/) : [], visible = 0;
      clear.style.display = q ? 'block' : 'none';
      items.forEach(function (el) {
        var ok = words.every(function (w) { return (el.getAttribute('data-search') || '').indexOf(w) !== -1; });
        el.style.display = ok ? '' : 'none'; if (ok) visible++;
      });
      cats.forEach(function (c) { c.style.display = $$('.g-item', c).some(function (i) { return i.style.display !== 'none'; }) ? '' : 'none'; });
      tocLinks.forEach(function (l) { var it = root.querySelector('#gd-' + l.getAttribute('data-slug')); l.style.display = (it && it.style.display === 'none') ? 'none' : ''; });
      tocGroups.forEach(function (g) { g.style.display = $$('.g-toc-link', g).some(function (l) { return l.style.display !== 'none'; }) ? '' : 'none'; });
      noRes.style.display = (words.length && !visible) ? 'block' : 'none';
    }
    input.addEventListener('input', filter);
    clear.addEventListener('click', function () { input.value = ''; filter(); input.focus(); });
    function keys(e) {
      if (!here() || !document.body.contains(input)) { document.removeEventListener('keydown', keys); return; }
      var tag = (e.target.tagName || '').toLowerCase();
      if (e.key === '/' && tag !== 'input' && tag !== 'textarea') { e.preventDefault(); input.focus(); }
      if (e.key === 'Escape' && document.activeElement === input) { input.value = ''; filter(); input.blur(); }
    }
    document.addEventListener('keydown', keys);

    function jump(slug) {
      var el = root.querySelector('#gd-' + slug); if (!el) return;
      if (el.style.display === 'none') { input.value = ''; filter(); }
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      el.classList.remove('flash'); void el.offsetWidth; el.classList.add('flash');
    }

    /* highlight the feature you are reading in the side list */
    var links = {}; tocLinks.forEach(function (a) { links[a.getAttribute('data-slug')] = a; });
    var box = root.querySelector('#gTocScroll');
    function active(slug) {
      Object.keys(links).forEach(function (k) { links[k].classList.toggle('active', k === slug); });
      var a = links[slug];
      if (a && box) { var t = a.offsetTop; if (t < box.scrollTop + 24 || t > box.scrollTop + box.clientHeight - 70) box.scrollTop = Math.max(0, t - 70); }
    }
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) { es.forEach(function (en) { if (en.isIntersecting) active(en.target.getAttribute('data-slug')); }); },
        { root: scroller || null, rootMargin: '-10px 0px -65% 0px', threshold: 0 });
      items.forEach(function (el) { io.observe(el); });
    }

    root.addEventListener('click', function (e) {
      var t = e.target;
      var a = t.closest('.g-toc-link'); if (a) { e.preventDefault(); jump(a.getAttribute('data-slug')); return; }
      a = t.closest('.g-anchor');
      if (a) {
        e.preventDefault(); var slug = a.getAttribute('data-copy'), url = SITE + '/guide#' + slug;
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(function () { toast('🔗 Link copied!'); }, function () { toast(url); });
        else toast(url);
        return;
      }
      a = t.closest('.g-yt'); if (a) { e.preventDefault(); open('https://www.youtube.com/watch?v=' + a.getAttribute('data-yt')); return; }
      a = t.closest('[data-ext]'); if (a) { e.preventDefault(); open(a.getAttribute('data-ext')); return; }
      a = t.closest('.g-open,.g-btn2'); if (a) { e.preventDefault(); go(a.getAttribute('data-route'), a.getAttribute('data-url')); return; }
      a = t.closest('a[href]');
      if (a) {
        e.preventDefault();
        var href = a.getAttribute('href') || '';
        if (/^#[A-Za-z0-9_-]+$/.test(href)) { jump(href.slice(1)); return; }     // [[feature]] cross links
        if (/^https?:\/\//i.test(href)) { var r = routeOf(href); if (r) location.hash = '#/' + r; else open(href); }
      }
    });
  }
})();
