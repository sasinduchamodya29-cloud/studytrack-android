// ── StudyTrack app.js ────────────────────────────────────────────────

// ── Theme (dark / light) ─────────────────────────────────────────────
// Apply saved theme immediately — called before DOM ready to prevent flash
(function () {
  var t = localStorage.getItem('stTheme') || 'dark';
  document.documentElement.setAttribute('data-theme', t);
})();

var THEME_CYCLE = ['dark', 'light', 'forest', 'midnight', 'galaxy'];

function _syncThemeBtn() {
  var theme = document.documentElement.getAttribute('data-theme') || 'dark';
  var moon = document.getElementById('icon-moon');
  var sun  = document.getElementById('icon-sun');
  // light mode = show sun, every other theme = show moon
  if (moon) moon.style.display = theme !== 'light' ? 'block' : 'none';
  if (sun)  sun.style.display  = theme === 'light' ? 'block' : 'none';
}

function toggleTheme() {
  // Quick topbar button: cycles Dark → Light → Forest → Midnight → Galaxy → Dark...
  var current = document.documentElement.getAttribute('data-theme') || 'dark';
  var idx     = THEME_CYCLE.indexOf(current);
  var next    = THEME_CYCLE[(idx + 1) % THEME_CYCLE.length];
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('stTheme', next);
  _syncThemeBtn();
}

// ── Sidebar toggle — wrapped in DOMContentLoaded so elements exist
document.addEventListener('DOMContentLoaded', function () {
  _syncThemeBtn(); // sync icon after DOM ready

  // ── Topbar height fix — set page-content padding-top dynamically ───
  function fixTopbarOffset() {
    var topbar = document.querySelector('.topbar');
    var pageContent = document.querySelector('.page-content');
    if (!topbar || !pageContent) return;
    var h = topbar.offsetHeight;
    if (h > 0) pageContent.style.paddingTop = (h + 16) + 'px';
  }
  fixTopbarOffset();
  window.addEventListener('resize', fixTopbarOffset);
  // ──────────────────────────────────────────────────────────────────

  // ── Sidebar ────────────────────────────────────────────────────────
  const sidebarToggle  = document.getElementById('sidebarToggle');
  const sidebar        = document.getElementById('sidebar');
  const sidebarOverlay = document.getElementById('sidebarOverlay');

  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener('click', function (e) {
      e.stopPropagation();
      sidebar.classList.toggle('open');
      if (sidebarOverlay) sidebarOverlay.classList.toggle('active');
    });
  }

  if (sidebarOverlay) {
    sidebarOverlay.addEventListener('click', function () {
      sidebar.classList.remove('open');
      sidebarOverlay.classList.remove('active');
    });
  }

  // Close sidebar when a nav link is clicked on mobile
  // Use event delegation on sidebar so it works on all pages including profile
  if (sidebar) {
    sidebar.addEventListener('click', function (e) {
      var link = e.target.closest('.nav-item');
      if (!link) return;
      if (window.innerWidth <= 900) {
        setTimeout(function () {
          sidebar.classList.remove('open');
          if (sidebarOverlay) sidebarOverlay.classList.remove('active');
        }, 80);
      }
    });
  }

  // Close sidebar when tapping main content area on mobile
  var mainContent = document.querySelector('.main-content');
  if (mainContent) {
    mainContent.addEventListener('click', function () {
      if (window.innerWidth <= 900 && sidebar && sidebar.classList.contains('open')) {
        sidebar.classList.remove('open');
        if (sidebarOverlay) sidebarOverlay.classList.remove('active');
      }
    });
  }

  // ── Password toggle ─────────────────────────────────────────────────
  document.addEventListener('click', function (e) {
    if (e.target.classList.contains('toggle-password')) {
      const btn   = e.target;
      const wrap  = btn.closest('.input-icon');
      const input = wrap ? wrap.querySelector('input') : null;
      if (!input) return;
      input.type    = input.type === 'password' ? 'text' : 'password';
      btn.innerHTML = input.type === 'password' ? '👁️' : '🙈';
    }
  });

  // ── Alert auto-dismiss ──────────────────────────────────────────────
  document.querySelectorAll('.alert[data-auto-dismiss]').forEach(function (alert) {
    var delay = parseInt(alert.dataset.autoDismiss) || 4000;
    setTimeout(function () {
      alert.style.transition = 'opacity 0.4s';
      alert.style.opacity    = '0';
      setTimeout(function () { alert.remove(); }, 400);
    }, delay);
  });

});

// ── Modal (global functions — called from onclick attributes) ────────
function openModal(id) {
  var m = document.getElementById(id);
  if (m) { m.classList.add('active'); document.body.style.overflow = 'hidden'; }
}
function closeModal(id) {
  var m = document.getElementById(id);
  if (m) { m.classList.remove('active'); document.body.style.overflow = ''; }
}
document.addEventListener('click', function (e) {
  if (e.target.classList.contains('modal-overlay')) closeModal(e.target.id);
});

// ── Countdown timer — Months + Days only ──────────────
function startCountdown(targetDateStr) {
  function tick() {
    var now    = new Date();
    var target = new Date(targetDateStr);
    var diff   = target - now;
    function pad(n) { return String(n).padStart(2, '0'); }
    function set(id, v) { var el = document.getElementById(id); if (el) el.textContent = pad(v); }

    if (diff <= 0) {
      ['cd-months','cd-days','cd-hours','cd-mins','cd-secs'].forEach(function(id){ set(id,0); });
      var lbl = document.getElementById('cd-today-label');
      if (lbl) lbl.style.display = 'block';
      return;
    }

    // Whole months remaining
    var y1 = now.getFullYear(), mo1 = now.getMonth(), d1 = now.getDate();
    var y2 = target.getFullYear(), mo2 = target.getMonth(), d2 = target.getDate();
    var months = (y2 - y1) * 12 + (mo2 - mo1);
    if (d2 < d1) months--;
    if (months < 0) months = 0;

    // Remaining days after whole months
    var afterMonths = new Date(y1, mo1 + months, d1);
    var remMs  = target - afterMonths;
    var days   = Math.floor(remMs / 86400000); remMs -= days * 86400000;
    var hours  = Math.floor(remMs / 3600000);  remMs -= hours * 3600000;
    var mins   = Math.floor(remMs / 60000);    remMs -= mins * 60000;
    var secs   = Math.floor(remMs / 1000);

    set('cd-months', months);
    set('cd-days',   days);
    set('cd-hours',  hours);
    set('cd-mins',   mins);
    set('cd-secs',   secs);
  }
  tick();
  setInterval(tick, 1000);
}

// ── AJAX helper ──────────────────────────────────────────────────────
async function doAjax(url, formData) {
  var res = await fetch(url, {
    method: 'POST',
    body: formData,
    headers: { 'X-Requested-With': 'XMLHttpRequest' }
  });
  var ct = res.headers.get('content-type') || '';
  if (!ct.includes('application/json')) {
    throw new Error('Server returned non-JSON (status ' + res.status + '). Check PHP error logs.');
  }
  return res.json();
}

function ajaxForm(formId, onSuccess, onError) {
  var form = document.getElementById(formId);
  if (!form) return;
  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    var btn  = form.querySelector('[type=submit]');
    var orig = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span>';
    try {
      var data = await doAjax(form.action || window.location.href, new FormData(form));
      if (data.success) onSuccess(data);
      else onError(data.message || 'Something went wrong.');
    } catch (err) {
      console.error('ajaxForm error:', err);
      onError('Connection error. Please try again.');
    } finally {
      btn.disabled  = false;
      btn.innerHTML = orig;
    }
  });
}

function showAlert(msg, type, parentId) {
  parentId = parentId || 'alertContainer';
  var el = document.getElementById(parentId);
  if (!el) return;
  el.innerHTML = '<div class="alert alert-' + type + '">' + (type === 'error' ? '⚠️ ' : '✅ ') + msg + '</div>';
  setTimeout(function () {
    if (el.firstChild) {
      el.firstChild.style.transition = 'opacity 0.4s';
      el.firstChild.style.opacity    = '0';
      setTimeout(function () { el.innerHTML = ''; }, 400);
    }
  }, 4000);
}