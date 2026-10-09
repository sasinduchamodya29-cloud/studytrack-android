/* StudyTrack – theme atmosphere engine (pairs with themes-fx.css)
   Draws stars / shooting stars (galaxy, midnight, aurora), fireflies + falling
   leaves (forest), petals (sakura), soft bokeh (light), dust (dark).
   Follows data-theme changes live, pauses in background tabs, respects
   prefers-reduced-motion, and uses fewer particles on phones. */
(function () {
  'use strict';
  var root = document.documentElement;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var STAR = {
    galaxy:   ['255,255,255', '244,208,255', '196,181,253', '251,207,232'],
    midnight: ['255,255,255', '191,219,254', '147,197,253'],
    aurora:   ['255,255,255', '153,246,228', '165,243,252']
  };
  var SCENES = {
    dark:     { dust: 24 },
    light:    { bokeh: 9 },
    forest:   { fireflies: 30, leaves: 12 },
    midnight: { stars: 90,  shoot: 1 },
    galaxy:   { stars: 170, shoot: 1 },
    aurora:   { stars: 60 },
    sakura:   { petals: 28 }
  };
  var BG = { dark: '#0a0a0f', light: '#f1f5f9', forest: '#0a1a12', midnight: '#05060f',
             galaxy: '#0b0518', aurora: '#071019', sakura: '#1a0e14' };
  var LEAF = ['74,222,128', '132,204,22', '250,204,21', '217,119,6', '34,197,94'];
  var PETAL = ['251,207,232', '249,168,212', '253,164,175', '255,228,236'];
  var BOKEH = ['129,140,248', '244,114,182', '56,189,248', '167,139,250'];

  var cv, ctx, W = 0, H = 0, mode = '', parts = [], shoots = [], nextShoot = 0, raf = 0, lastT = 0;
  function r(a, b) { return a + Math.random() * (b - a); }
  function pick(a) { return a[(Math.random() * a.length) | 0]; }

  function size() {
    var d = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    cv.width = W * d; cv.height = H * d;
    ctx.setTransform(d, 0, 0, d, 0, 0);
  }

  function build() {
    var s = SCENES[mode] || {}, k = W < 640 ? 0.6 : 1, i, n, z;
    parts = []; shoots = [];
    n = Math.round((s.stars || 0) * k);
    for (i = 0; i < n; i++) { z = Math.random();
      parts.push({ t: 's', x: r(0, W), y: r(0, H), r: 0.4 + z * 1.4, a: 0.35 + z * 0.6, ph: r(0, 6.28), sp: r(0.6, 2.2), vx: 0.004 + z * 0.02, c: pick(STAR[mode]) }); }
    n = Math.round((s.dust || 0) * k);
    for (i = 0; i < n; i++) parts.push({ t: 'd', x: r(0, W), y: r(0, H), r: r(0.6, 1.6), vx: r(-0.05, 0.05), vy: r(-0.08, -0.01), a: r(0.1, 0.35) });
    n = Math.round((s.bokeh || 0) * k);
    for (i = 0; i < n; i++) parts.push({ t: 'b', x: r(0, W), y: r(0, H), r: r(50, 130), vx: r(-0.08, 0.08), vy: r(-0.05, 0.05), a: r(0.06, 0.13), c: pick(BOKEH) });
    n = Math.round((s.fireflies || 0) * k);
    for (i = 0; i < n; i++) parts.push({ t: 'f', x: r(0, W), y: r(H * 0.25, H), r: r(1.4, 2.8), ph: r(0, 6.28), sp: r(0.8, 2), ang: r(0, 6.28), v: r(0.1, 0.35) });
    n = Math.round((s.leaves || 0) * k);
    for (i = 0; i < n; i++) parts.push({ t: 'l', x: r(0, W), y: r(-20, H), s: r(6, 12), rot: r(0, 6.28), vr: r(-0.02, 0.02), vy: r(0.25, 0.6), sw: r(0.5, 1.5), ph: r(0, 6.28), a: r(0.35, 0.7), c: pick(LEAF) });
    n = Math.round((s.petals || 0) * k);
    for (i = 0; i < n; i++) parts.push({ t: 'p', x: r(0, W), y: r(-20, H), s: r(5, 9), rot: r(0, 6.28), vr: r(-0.03, 0.03), vy: r(0.4, 0.9), sw: r(0.6, 1.6), ph: r(0, 6.28), a: r(0.45, 0.85), c: pick(PETAL) });
  }

  function draw(ts) {
    var t = ts / 1000, i, p, a, g, s = SCENES[mode] || {};
    ctx.clearRect(0, 0, W, H);
    for (i = 0; i < parts.length; i++) {
      p = parts[i];
      switch (p.t) {
        case 's':
          p.x += p.vx; if (p.x > W) p.x = 0;
          a = p.a * (0.55 + 0.45 * Math.sin(t * p.sp + p.ph));
          ctx.fillStyle = 'rgba(' + p.c + ',' + a.toFixed(3) + ')';
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill();
          break;
        case 'd':
          p.x += p.vx; p.y += p.vy;
          if (p.y < -5) { p.y = H + 5; p.x = r(0, W); } if (p.x < -5) p.x = W + 5; if (p.x > W + 5) p.x = -5;
          ctx.fillStyle = 'rgba(129,140,248,' + p.a + ')';
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill();
          break;
        case 'b':
          p.x += p.vx; p.y += p.vy;
          if (p.x < -p.r) p.x = W + p.r; if (p.x > W + p.r) p.x = -p.r;
          if (p.y < -p.r) p.y = H + p.r; if (p.y > H + p.r) p.y = -p.r;
          g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
          g.addColorStop(0, 'rgba(' + p.c + ',' + p.a + ')'); g.addColorStop(1, 'rgba(' + p.c + ',0)');
          ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill();
          break;
        case 'f':
          p.ang += r(-0.12, 0.12); p.x += Math.cos(p.ang) * p.v; p.y += Math.sin(p.ang) * p.v * 0.7 - 0.03;
          if (p.x < -10) p.x = W + 10; if (p.x > W + 10) p.x = -10; if (p.y < -10) p.y = H + 10; if (p.y > H + 10) p.y = -10;
          a = 0.5 + 0.5 * Math.sin(t * p.sp + p.ph);
          g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 7);
          g.addColorStop(0, 'rgba(253,246,120,' + (a * 0.6).toFixed(3) + ')'); g.addColorStop(1, 'rgba(253,246,120,0)');
          ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 7, 0, 6.283); ctx.fill();
          ctx.fillStyle = 'rgba(255,251,190,' + a.toFixed(3) + ')';
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill();
          break;
        case 'l': case 'p':
          p.y += p.vy; p.x += Math.sin(t * p.sw + p.ph) * (p.t === 'p' ? 0.9 : 0.6); p.rot += p.vr;
          if (p.y > H + 20) { p.y = -20; p.x = r(0, W); }
          ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
          ctx.fillStyle = 'rgba(' + p.c + ',' + p.a + ')'; ctx.beginPath();
          if (p.t === 'l') {
            ctx.moveTo(0, -p.s); ctx.quadraticCurveTo(p.s * 0.8, 0, 0, p.s); ctx.quadraticCurveTo(-p.s * 0.8, 0, 0, -p.s);
          } else {
            ctx.scale(Math.cos(t * 1.5 + p.ph) * 0.5 + 0.6, 1);
            ctx.moveTo(0, -p.s); ctx.bezierCurveTo(p.s, -p.s * 0.6, p.s * 0.8, p.s * 0.6, 0, p.s);
            ctx.bezierCurveTo(-p.s * 0.8, p.s * 0.6, -p.s, -p.s * 0.6, 0, -p.s);
          }
          ctx.fill(); ctx.restore();
          break;
      }
    }
    if (s.shoot && !reduce) {
      if (ts > nextShoot) { shoots.push({ x: r(W * 0.2, W), y: r(0, H * 0.4), vx: -r(9, 14), vy: r(4, 7), l: 0 }); nextShoot = ts + r(4500, 10000); }
      for (i = shoots.length - 1; i >= 0; i--) {
        p = shoots[i]; p.x += p.vx; p.y += p.vy; p.l++;
        g = ctx.createLinearGradient(p.x, p.y, p.x - p.vx * 7, p.y - p.vy * 7);
        g.addColorStop(0, 'rgba(255,255,255,' + Math.max(0, 0.9 - p.l / 60) + ')'); g.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.strokeStyle = g; ctx.lineWidth = 1.6; ctx.beginPath();
        ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - p.vx * 7, p.y - p.vy * 7); ctx.stroke();
        if (p.l > 60) shoots.splice(i, 1);
      }
    }
  }

  function loop(ts) { raf = requestAnimationFrame(loop); if (ts - lastT < 33) return; lastT = ts; draw(ts); }
  function stop() { if (raf) cancelAnimationFrame(raf); raf = 0; }
  function start() {
    stop();
    if (reduce) { draw(0); return; }
    if (parts.length || (SCENES[mode] && SCENES[mode].shoot)) raf = requestAnimationFrame(loop);
    else ctx.clearRect(0, 0, W, H);
  }

  function setMode() {
    var m = root.getAttribute('data-theme') || 'dark';
    if (!SCENES[m]) m = 'dark';
    if (m === mode) return;
    mode = m; build(); start();
    var mt = document.querySelector('meta[name="theme-color"]'); if (mt) mt.setAttribute('content', BG[m]);
  }

  function init() {
    if (document.getElementById('themeFx')) return;
    var fx = document.createElement('div');
    fx.id = 'themeFx'; fx.setAttribute('aria-hidden', 'true');
    fx.innerHTML = '<canvas></canvas><div class="fog"></div>';
    document.body.insertBefore(fx, document.body.firstChild);
    cv = fx.firstChild; ctx = cv.getContext('2d'); size();
    new MutationObserver(setMode).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
    setMode();
    var rt, lastW = W;
    window.addEventListener('resize', function () {
      clearTimeout(rt);
      rt = setTimeout(function () { size(); if (W !== lastW) { lastW = W; build(); } start(); }, 200);
    });
    document.addEventListener('visibilitychange', function () { document.hidden ? stop() : start(); });
  }

  if (document.body) init(); else document.addEventListener('DOMContentLoaded', init);
})();
