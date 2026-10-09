// v1.14 — keeps the layout correct on small screens / small windows.
// 769-1099px wide: sidebar is forced to the icon rail (so it never covers the page).
// >=1100px: the user's own choice (expanded / rail) is restored. <=768px: slide-in drawer.
(function () {
  var root = document.documentElement, KEY = 'stSidebarMini';
  function userMini() { try { return localStorage.getItem(KEY) === '1'; } catch (e) { return false; } }
  function apply() {
    var w = window.innerWidth, narrow = w > 768 && w < 1100;
    root.classList.toggle('sb-narrow', narrow);
    if (w <= 768) root.classList.remove('sb-mini');
    else root.classList.toggle('sb-mini', narrow || userMini());
  }
  // Ctrl+B must not expand the rail while the window is narrow
  window.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey && (e.key === 'b' || e.key === 'B') && root.classList.contains('sb-narrow')) {
      e.preventDefault(); e.stopImmediatePropagation();
    }
  }, true);
  var t; window.addEventListener('resize', function () { clearTimeout(t); t = setTimeout(apply, 60); });
  apply();
})();
