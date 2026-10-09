/* StudyTrack Desktop - My Planet (3D planet, growth roadmap) + Planet Shop (build stages, buy decorations).
   Routes: #/planet and #/planet-shop.  Data: pages12.php (actions pl_*). Same coins / stages / decorations / build timers as the
   website's planet.php + planet-shop.php (all rules live on the server).  Needs js/pages-extra.js (window.StUI) and three.js
   (node_modules/three, loaded in index.html).  Styles: css/pages-planet.css */
(function () {
  var Pages = window.stPages, TITLES = window.stTitles, api = window.stApi, UI = window.StUI;
  if (!Pages || !api || !UI) return;
  var toast = UI.toast, errPage = UI.errPage, lsGet = UI.lsGet, lsSet = UI.lsSet;
  TITLES.planet = 'My Planet'; TITLES['planet-shop'] = 'Planet Shop';

  function esc(s) { return E(String(s == null ? '' : s)); }
  function $(s, r) { return (r || document).querySelector(s); }
  function alive(el) { return !!(el && el.isConnected); }

  /* the sidebar only knows "My Planet" - keep it lit while the shop is open */
  function litSidebar() {
    var a = document.querySelector('#sidebar a.nav-item[href="#/planet"]');
    if (a) a.classList.add('active');
  }

  var stopScene = null;   /* disposes the running 3D scene when the page changes */
  function killScene() { if (stopScene) { try { stopScene(); } catch (e) {} stopScene = null; } }

  function tabs(active) {
    return '<div class="pl-tabs"><a href="#/planet" class="' + (active === 'planet' ? 'on' : '') + '">🪐 My Planet</a>' +
      '<a href="#/planet-shop" class="' + (active === 'shop' ? 'on' : '') + '">🛒 Shop</a></div>';
  }
  function coinBadge(coins, id) {
    return '<div class="pl-coin-badge"><span class="ico">🪙</span><span class="num" id="' + id + '">' + (+coins || 0) + '</span><span class="lbl">coins</span></div>';
  }
  function fmtLeft(sec) {
    sec = Math.max(0, Math.floor(sec)); var h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
    return (h > 0 ? h + 'h ' : '') + m + 'm ' + s + 's';
  }
  function buildBanner(b) {
    if (!b) return '';
    return '<div class="pl-build-banner" id="plBuild"><div class="pl-build-emoji">' + esc(b.emoji) + '</div><div style="flex:1;min-width:160px">' +
      '<div class="pl-build-label">🚧 Building: ' + esc(b.label) + '</div><div class="pl-build-progress"><div class="pl-build-fill" style="width:' + (+b.pct || 0) + '%"></div></div></div>' +
      '<div class="pl-build-time" id="plBuildTime">' + fmtLeft(b.seconds_left) + '</div></div>';
  }

  /* counts the construction down, then asks the server to finish it and redraws the page */
  function watchBuild(pc, d, rerender) {
    var b = d.build; if (!b) return;
    var endsAt = Date.now() + (+b.seconds_left || 0) * 1000, total = Math.max(1, (+b.seconds_left || 0) / Math.max(0.01, 1 - (+b.pct || 0) / 100));
    var busy = false;
    function tick() {
      var el = $('#plBuildTime', pc);
      if (!alive(el)) return;
      var left = Math.max(0, (endsAt - Date.now()) / 1000);
      el.textContent = left > 0 ? fmtLeft(left) : 'Finishing…';
      var f = $('#plBuild .pl-build-fill', pc); if (f) f.style.width = Math.min(100, Math.round((1 - left / total) * 100)) + '%';
      if (left > 0) return setTimeout(tick, 1000);
      if (busy) return; busy = true;
      (function poll() {
        api('pl_status').then(function (r) {
          if (!alive(el)) return;
          if (r && r.success && !r.build) {
            if (r.completed) toast('🎉 ' + r.completed.label + ' finished building!', 'ok');
            return rerender();
          }
          setTimeout(poll, 2500);
        });
      })();
    }
    setTimeout(tick, 1000);
  }

  /* ═══════════════════════════════════════════════════════════════════
     3D planet (ported 1:1 from the website's planet.php)
     ═══════════════════════════════════════════════════════════════════ */
  function startScene(host, cfg) {
    if (!host || typeof THREE === 'undefined' || !THREE.OrbitControls) {
      if (host) host.innerHTML = '<div class="pl-3d-off">3D view could not be loaded.</div>';
      return null;
    }
    var UID = cfg.uid || 1, STAGE = cfg.stage || 'dust', DECOR = cfg.decor || [];
    var hasSatellite = DECOR.indexOf('satellite') > -1, hasCompanion = DECOR.indexOf('companion') > -1, hasAuroraDecor = DECOR.indexOf('aurora') > -1,
        hasMeteors = DECOR.indexOf('meteors') > -1, hasStardust = DECOR.indexOf('stardust') > -1, hasBeacon = DECOR.indexOf('beacon') > -1;

    function mulberry32(seed) {   /* seeded RNG so each user's planet pattern is stable across visits */
      return function () {
        seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
        var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
    }
    var rand = mulberry32(UID * 977 + 13);

    var stageRank = { dust: 0, core: 1, rock: 2, atmo: 3, ocean: 4, life: 5, city: 6, rings: 7, moons: 8, radiant: 9 };
    var rank = stageRank[STAGE] !== undefined ? stageRank[STAGE] : 0;
    var hasLava = rank === 1, hasCraters = rank <= 2, hasAtmo = rank >= 3, hasOcean = rank >= 4, hasLife = rank >= 5,
        hasCities = rank >= 6, hasRings = rank >= 7, hasMoons = rank >= 8, isRadiant = rank >= 9;
    var stageGlowColor = { dust: 0x888888, core: 0xff5522, rock: 0x9a8a78, atmo: 0x7dc8ff, ocean: 0x4aa8ff, life: 0x5fe0a0, city: 0xffd27a, rings: 0xd9b98a, moons: 0xb9c8ff, radiant: 0xffe27a }[STAGE] || 0x38bdf8;

    var W = host.clientWidth || 800, H = host.clientHeight || 440;
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 1000);
    camera.position.set(0, hasRings ? 1.6 : 0.4, hasRings ? 5.6 : 4.4);
    var renderer;
    try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); }
    catch (e) { host.innerHTML = '<div class="pl-3d-off">3D view is not available on this PC (WebGL).</div>'; return null; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(W, H);
    host.appendChild(renderer.domElement);

    var controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableZoom = false; controls.enablePan = false; controls.autoRotate = true; controls.autoRotateSpeed = 0.6;
    controls.enableDamping = true; controls.dampingFactor = 0.08;

    scene.add(new THREE.AmbientLight(0xffffff, hasLava ? 0.55 : 0.38));
    var sun = new THREE.DirectionalLight(0xffffff, hasLava ? 0.9 : 1.25); sun.position.set(4, 2.5, 3); scene.add(sun);
    if (isRadiant) { var rim = new THREE.PointLight(0xffe27a, 1.4, 20); rim.position.set(-3, 1, -3); scene.add(rim); }

    (function () {   /* starfield */
      var starCount = 900, pos = new Float32Array(starCount * 3);
      for (var i = 0; i < starCount; i++) {
        var r = 60 + rand() * 140, theta = rand() * Math.PI * 2, phi = Math.acos(2 * rand() - 1);
        pos[i * 3] = r * Math.sin(phi) * Math.cos(theta); pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta); pos[i * 3 + 2] = r * Math.cos(phi);
      }
      var geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      scene.add(new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.7, sizeAttenuation: true, transparent: true, opacity: 0.85 })));
    })();

    function makeCanvas() { var c = document.createElement('canvas'); c.width = 1024; c.height = 512; return c; }
    function blob(ctx, x, y, w, h, color) {
      ctx.fillStyle = color; ctx.beginPath();
      var pts = 10;
      for (var i = 0; i <= pts; i++) {
        var a = (i / pts) * Math.PI * 2, rr = 0.6 + rand() * 0.5, px = x + Math.cos(a) * w * rr, py = y + Math.sin(a) * h * rr;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.closePath(); ctx.fill();
    }
    function buildColorTexture() {
      var c = makeCanvas(), ctx = c.getContext('2d'), i;
      if (hasLava) {
        var g = ctx.createLinearGradient(0, 0, 0, c.height);
        g.addColorStop(0, '#3a0a00'); g.addColorStop(0.5, '#7a1400'); g.addColorStop(1, '#2a0700');
        ctx.fillStyle = g; ctx.fillRect(0, 0, c.width, c.height);
        for (i = 0; i < 26; i++) blob(ctx, rand() * c.width, rand() * c.height, 40 + rand() * 90, 20 + rand() * 50, 'rgba(255,' + (80 + Math.floor(rand() * 90)) + ',20,0.9)');
      } else if (hasOcean) {
        ctx.fillStyle = hasLife ? '#0b3a66' : '#123a55'; ctx.fillRect(0, 0, c.width, c.height);
        var landCol = hasLife ? (hasCities ? '#2f6b3a' : '#3d7a44') : '#6b5c42', nLand = hasLife ? 9 : 6;
        for (i = 0; i < nLand; i++) blob(ctx, rand() * c.width, rand() * c.height, 60 + rand() * 110, 35 + rand() * 70, landCol);
        if (hasLife) for (i = 0; i < 14; i++) blob(ctx, rand() * c.width, rand() * c.height, 18 + rand() * 30, 10 + rand() * 18, '#5a8f4c');
        ctx.globalAlpha = 0.35;
        for (i = 0; i < 18; i++) blob(ctx, rand() * c.width, rand() * c.height, 50 + rand() * 80, 14 + rand() * 26, '#ffffff');
        ctx.globalAlpha = 1;
        if (hasCities) for (i = 0; i < 70; i++) {
          var lx = rand() * c.width, ly = c.height * 0.15 + rand() * c.height * 0.7;
          ctx.fillStyle = 'rgba(255,224,140,' + (0.7 + rand() * 0.3) + ')'; ctx.beginPath(); ctx.arc(lx, ly, 1.1 + rand() * 1.3, 0, Math.PI * 2); ctx.fill();
        }
      } else {
        var g2 = ctx.createLinearGradient(0, 0, 0, c.height);
        g2.addColorStop(0, '#5b5b66'); g2.addColorStop(0.5, '#3f3f49'); g2.addColorStop(1, '#2a2a32');
        ctx.fillStyle = g2; ctx.fillRect(0, 0, c.width, c.height);
        if (hasCraters) for (i = 0; i < 40; i++) blob(ctx, rand() * c.width, rand() * c.height, 6 + rand() * 20, 6 + rand() * 20, 'rgba(0,0,0,0.18)');
        if (hasAtmo) { ctx.globalAlpha = 0.18; for (i = 0; i < 14; i++) blob(ctx, rand() * c.width, rand() * c.height, 60 + rand() * 90, 16 + rand() * 26, '#bcdcff'); ctx.globalAlpha = 1; }
      }
      if (isRadiant) {
        ctx.globalAlpha = 0.18;
        var gg = ctx.createRadialGradient(c.width / 2, c.height / 2, 0, c.width / 2, c.height / 2, c.width / 2);
        gg.addColorStop(0, '#fff3c4'); gg.addColorStop(1, 'rgba(255,243,196,0)');
        ctx.fillStyle = gg; ctx.fillRect(0, 0, c.width, c.height); ctx.globalAlpha = 1;
      }
      return new THREE.CanvasTexture(c);
    }
    function buildBumpTexture() {
      var c = makeCanvas(), ctx = c.getContext('2d'); ctx.fillStyle = '#808080'; ctx.fillRect(0, 0, c.width, c.height);
      var n = hasCraters ? 55 : (hasOcean ? 20 : 30);
      for (var i = 0; i < n; i++) { var shade = Math.floor(90 + rand() * 130); blob(ctx, rand() * c.width, rand() * c.height, 8 + rand() * 22, 8 + rand() * 22, 'rgb(' + shade + ',' + shade + ',' + shade + ')'); }
      return new THREE.CanvasTexture(c);
    }

    var planetGroup = new THREE.Group(); scene.add(planetGroup);
    var moonMeshes = [], satelliteMesh = null, companionMesh = null, beaconMesh = null, meteorPoints = null, stardustPoints = null, auroraMesh = null, i;

    if (rank === 0) {   /* tumbling irregular space dust / proto-asteroid */
      var ico = new THREE.IcosahedronGeometry(1.05, 2), posAttr = ico.attributes.position;
      for (i = 0; i < posAttr.count; i++) {
        var v = new THREE.Vector3().fromBufferAttribute(posAttr, i); v.multiplyScalar(1 + (rand() - 0.5) * 0.32); posAttr.setXYZ(i, v.x, v.y, v.z);
      }
      ico.computeVertexNormals();
      planetGroup.add(new THREE.Mesh(ico, new THREE.MeshStandardMaterial({ color: 0x77726c, roughness: 0.95, metalness: 0.05, flatShading: true })));
      controls.autoRotateSpeed = 1.6;
    } else {
      var colorTex = buildColorTexture(), bumpTex = buildBumpTexture();
      var planetMat = new THREE.MeshStandardMaterial({
        map: colorTex, bumpMap: bumpTex, bumpScale: hasOcean ? 0.015 : 0.05, roughness: hasOcean ? 0.45 : 0.9, metalness: 0.0,
        emissive: hasLava ? new THREE.Color(0xaa2200) : (hasCities ? new THREE.Color(0x553311) : (isRadiant ? new THREE.Color(0x554411) : new THREE.Color(0x000000))),
        emissiveIntensity: hasLava ? 0.55 : (hasCities ? 0.35 : (isRadiant ? 0.4 : 0)),
        emissiveMap: (hasLava || hasCities || isRadiant) ? colorTex : null
      });
      planetGroup.add(new THREE.Mesh(new THREE.SphereGeometry(1.2, 64, 64), planetMat));

      if (hasAtmo) {   /* atmosphere glow (fresnel-style rim light) */
        var glowMat = new THREE.ShaderMaterial({
          uniforms: { glowColor: { value: new THREE.Color(stageGlowColor) } },
          vertexShader: ['varying float vIntensity;', 'void main(){', '  vec3 vNormal = normalize(normalMatrix * normal);', '  vec3 vNormel = normalize(normalMatrix * vec3(0.0,0.0,1.0));',
            '  vIntensity = pow(0.65 - dot(vNormal, vNormel), 2.5);', '  gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);', '}'].join('\n'),
          fragmentShader: ['varying float vIntensity;', 'uniform vec3 glowColor;', 'void main(){ gl_FragColor = vec4(glowColor, 1.0) * vIntensity; }'].join('\n'),
          side: THREE.FrontSide, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false
        });
        planetGroup.add(new THREE.Mesh(new THREE.SphereGeometry(1.32, 48, 48), glowMat));
      }
      if (hasRings) {
        var ringCanvas = document.createElement('canvas'); ringCanvas.width = 256; ringCanvas.height = 8;
        var rctx = ringCanvas.getContext('2d');
        for (var x = 0; x < 256; x++) { rctx.fillStyle = 'rgba(216,190,150,' + (0.25 + rand() * 0.65).toFixed(2) + ')'; rctx.fillRect(x, 0, 1, 8); }
        var ringMesh = new THREE.Mesh(new THREE.RingGeometry(1.7, 2.7, 96), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(ringCanvas), side: THREE.DoubleSide, transparent: true, opacity: 0.85 }));
        ringMesh.rotation.x = Math.PI / 2 - 0.35; planetGroup.add(ringMesh);
      }
      if (hasMoons) for (var m = 0; m < 2; m++) {
        var moon = new THREE.Mesh(new THREE.SphereGeometry(0.18 - m * 0.05, 24, 24), new THREE.MeshStandardMaterial({ color: 0xb9b9c2, roughness: 1 }));
        moon.userData = { radius: 2.1 + m * 0.7, speed: 0.35 - m * 0.1, angle: rand() * Math.PI * 2, tilt: (rand() - 0.5) * 0.6 };
        planetGroup.add(moon); moonMeshes.push(moon);
      }
    }

    /* shop decorations - cosmetic, shown at every stage */
    if (hasSatellite) {
      satelliteMesh = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.09, 0.16), new THREE.MeshStandardMaterial({ color: 0xcfd8e3, metalness: 0.6, roughness: 0.4, emissive: 0x38bdf8, emissiveIntensity: 0.4 }));
      satelliteMesh.userData = { radius: 1.9, speed: 0.55, angle: rand() * Math.PI * 2 }; planetGroup.add(satelliteMesh);
    }
    if (hasCompanion) {
      companionMesh = new THREE.Mesh(new THREE.SphereGeometry(0.07, 16, 16), new THREE.MeshBasicMaterial({ color: 0xfff3c4 }));
      companionMesh.userData = { radius: 3.1, speed: 0.12, angle: rand() * Math.PI * 2 }; planetGroup.add(companionMesh);
      companionMesh.add(new THREE.PointLight(0xfff3c4, 0.6, 6));
    }
    if (hasBeacon) {
      beaconMesh = new THREE.Mesh(new THREE.ConeGeometry(0.16, 1.1, 20, 1, true), new THREE.MeshBasicMaterial({ color: 0xfacc15, transparent: true, opacity: 0.28, side: THREE.DoubleSide }));
      beaconMesh.position.set(0, 1.75, 0); planetGroup.add(beaconMesh);
    }
    if (hasAuroraDecor) {
      auroraMesh = new THREE.Mesh(new THREE.TorusGeometry(1.38, 0.05, 8, 60, Math.PI * 1.1), new THREE.MeshBasicMaterial({ color: 0x7ef2c3, transparent: true, opacity: 0.5 }));
      auroraMesh.rotation.set(0.6, 0, 0.3); planetGroup.add(auroraMesh);
    }
    if (hasStardust) {
      var sdCount = 120, sdPos = new Float32Array(sdCount * 3);
      for (i = 0; i < sdCount; i++) {
        var rr = 1.5 + rand() * 0.35, th = rand() * Math.PI * 2, ph = Math.acos(2 * rand() - 1);
        sdPos[i * 3] = rr * Math.sin(ph) * Math.cos(th); sdPos[i * 3 + 1] = rr * Math.sin(ph) * Math.sin(th); sdPos[i * 3 + 2] = rr * Math.cos(ph);
      }
      var sdGeo = new THREE.BufferGeometry(); sdGeo.setAttribute('position', new THREE.BufferAttribute(sdPos, 3));
      stardustPoints = new THREE.Points(sdGeo, new THREE.PointsMaterial({ color: 0xfff3c4, size: 0.03, transparent: true, opacity: 0.85 }));
      planetGroup.add(stardustPoints);
    }
    if (hasMeteors) {
      var mCount = 40, mPos = new Float32Array(mCount * 3);
      for (i = 0; i < mCount; i++) { mPos[i * 3] = (rand() - 0.5) * 10; mPos[i * 3 + 1] = (rand() - 0.5) * 6 + 3; mPos[i * 3 + 2] = (rand() - 0.5) * 10; }
      var mGeo = new THREE.BufferGeometry(); mGeo.setAttribute('position', new THREE.BufferAttribute(mPos, 3));
      meteorPoints = new THREE.Points(mGeo, new THREE.PointsMaterial({ color: 0xffd27a, size: 0.045, transparent: true, opacity: 0.9 }));
      scene.add(meteorPoints);
    }

    host.style.background = 'radial-gradient(circle at 50% 55%, #' + stageGlowColor.toString(16).padStart(6, '0') + '22, transparent 60%)';

    var clock = new THREE.Clock(), slowSpin = rank === 0 ? 0.01 : 0.0018, raf = 0, dead = false;
    function onResize() {
      var w = host.clientWidth, h = host.clientHeight; if (!w || !h) return;
      camera.aspect = w / h; camera.updateProjectionMatrix(); renderer.setSize(w, h);
    }
    window.addEventListener('resize', onResize);
    function dispose() {
      dead = true; cancelAnimationFrame(raf); window.removeEventListener('resize', onResize);
      try { controls.dispose(); } catch (e) {}
      scene.traverse(function (o) {
        if (o.geometry) o.geometry.dispose();
        if (o.material) { [].concat(o.material).forEach(function (mt) { if (mt.map) mt.map.dispose(); mt.dispose(); }); }
      });
      renderer.dispose();
    }
    function loop() {
      if (dead) return;
      if (!alive(host)) return dispose();           /* page changed */
      raf = requestAnimationFrame(loop);
      if (document.hidden) return;                  /* window minimised - save the GPU */
      var dt = clock.getDelta();
      moonMeshes.forEach(function (moon) {
        moon.userData.angle += moon.userData.speed * dt;
        var a = moon.userData.angle, r = moon.userData.radius;
        moon.position.set(Math.cos(a) * r, Math.sin(moon.userData.tilt) * r * 0.3, Math.sin(a) * r);
      });
      if (satelliteMesh) {
        satelliteMesh.userData.angle += satelliteMesh.userData.speed * dt;
        var sa = satelliteMesh.userData.angle, sr = satelliteMesh.userData.radius;
        satelliteMesh.position.set(Math.cos(sa) * sr, Math.sin(sa * 1.7) * 0.3, Math.sin(sa) * sr); satelliteMesh.rotation.y += dt;
      }
      if (companionMesh) {
        companionMesh.userData.angle += companionMesh.userData.speed * dt;
        var ca = companionMesh.userData.angle, cr = companionMesh.userData.radius;
        companionMesh.position.set(Math.cos(ca) * cr, 0.4, Math.sin(ca) * cr);
      }
      if (beaconMesh) beaconMesh.material.opacity = 0.2 + Math.sin(Date.now() / 500) * 0.1;
      if (auroraMesh) auroraMesh.rotation.z += dt * 0.15;
      if (meteorPoints) meteorPoints.rotation.y += dt * 0.05;
      planetGroup.rotation.y += slowSpin;
      controls.update();
      renderer.render(scene, camera);
    }
    loop();
    return dispose;
  }

  /* ═══════════════════════════════════════════════════════════════════
     MY PLANET
     ═══════════════════════════════════════════════════════════════════ */
  function renderPlanet(pc, d) {
    var stage = d.stage, next = d.next, owned = d.owned || [];
    var o = '<div class="pl-wrap">' + tabs('planet') +
      '<div class="pl-top"><div><div class="pl-title">🪐 My Planet</div><div class="pl-sub">Built one study coin at a time — ' + esc(d.rate_text) + ' studied = 1 coin.</div></div>' +
      '<div class="pl-top-r">' + coinBadge(d.coins, 'plCoinCount') + '<a class="pl-shop-btn" href="#/planet-shop">🛒 Shop</a></div></div>' +
      buildBanner(d.build) +
      '<div class="pl-stage-card"><div class="pl-hint">🖱️ drag to rotate</div><div id="plCanvasHost"></div>' +
      '<div class="pl-stage-overlay"><div class="pl-stage-name"><span>' + esc(stage.emoji) + '</span> ' + esc(stage.name) + '</div><div class="pl-stage-blurb">' + esc(stage.blurb) + '</div></div></div>';

    var hint;
    if (next) {
      var need = Math.max(0, next.cost - d.coins);
      hint = need > 0 ? need + ' more coin' + (need === 1 ? '' : 's') + ' needed (costs ' + next.cost + ')' : 'Ready to build for ' + next.cost + ' coins — visit the Shop';
    } else hint = d.coins + ' coins in your wallet';
    o += '<div class="pl-card"><div class="pl-progress-row"><span class="pl-progress-label">' +
      (next ? 'Next: ' + esc(next.emoji) + ' ' + esc(next.name) : '🎉 Maximum stage reached — keep decorating in the Shop!') + '</span><span class="pl-progress-hint">' + esc(hint) + '</span></div>' +
      '<div class="pl-bar"><i style="width:' + (+d.pct || 0) + '%"></i></div>' +
      '<div class="pl-mini">' + (d.mins_to_next > 0 ? '⏱️ Study ' + d.mins_to_next + ' more minute' + (d.mins_to_next === 1 ? '' : 's') + ' to earn your next coin.' : '⏱️ Your next completed hour will mint a new coin.') + '</div>';
    var chips = d.decor.filter(function (x) { return owned.indexOf(x.key) > -1; });
    if (chips.length) o += '<div class="pl-decor-strip">' + chips.map(function (x) { return '<span class="pl-decor-chip">' + esc(x.emoji) + ' ' + esc(x.name) + '</span>'; }).join('') + '</div>';
    o += '</div>';

    o += '<div class="pl-card"><div class="pl-card-t">🗺️ Growth Roadmap</div><div class="pl-timeline">';
    d.stages.forEach(function (s, i) {
      var locked = i > d.stage_idx, cur = i === d.stage_idx, building = d.build && d.build.type === 'stage' && i === d.stage_idx + 1;
      o += '<div class="pl-tl-item' + (locked ? ' locked' : '') + (cur ? ' current' : '') + '" title="' + esc(s.blurb) + '">' + (cur ? '<div class="pl-tl-dot"></div>' : '') +
        '<div class="pl-tl-emoji">' + (building ? '🚧' : (locked ? '🔒' : esc(s.emoji))) + '</div><div class="pl-tl-name">' + esc(s.name) + '</div>' +
        '<div class="pl-tl-req">' + (i === 0 ? 'starting stage' : s.cost + ' coins') + '</div></div>';
    });
    o += '</div></div>';

    o += '<div class="pl-note"><span style="font-size:16px">💡</span><div>Coins are separate from your XP and Study Points — they exist purely to grow this planet. Every ' + esc(d.rate_text) +
      ' of study you log on the <a href="#/study-log">Study Log</a>, <a href="#/pomodoro">Focus Timer</a>, or a <a href="#/study">Study Room</a> mints exactly 1 coin. Head to the <a href="#/planet-shop">Shop</a> to spend them on the next stage or a decoration — once spent they\'re gone for good, and construction takes a little real time to finish, so keep studying to earn more.</div></div></div>';
    pc.innerHTML = o;

    killScene();
    stopScene = startScene($('#plCanvasHost', pc), { uid: d.uid, stage: stage.key, decor: owned });
    watchBuild(pc, d, function () { Pages.planet(pc); });

    /* one-time "you earned more coins" note (remembered on this PC, like the website does in the browser) */
    var k = 'pl_last_coins_' + d.uid, last = parseInt(lsGet(k, '0'), 10) || 0;
    if (d.coins > last) { lsSet(k, String(d.coins)); if (last > 0) toast('🪙 +' + (d.coins - last) + ' coin' + (d.coins - last === 1 ? '' : 's') + ' since your last visit!'); }
    if (d.completed) toast('🎉 ' + d.completed.label + ' finished building!', 'ok');
  }

  Pages.planet = function (pc) {
    killScene(); litSidebar();
    return api('pl_all').then(function (d) {
      if (!d || !d.success) return errPage(pc, d);
      renderPlanet(pc, d);
    });
  };

  /* ═══════════════════════════════════════════════════════════════════
     PLANET SHOP
     ═══════════════════════════════════════════════════════════════════ */
  function renderShop(pc, d) {
    var next = d.next, coins = d.coins, building = !!d.build, owned = d.owned || [], open = d.shop_open;
    var o = '<div class="pl-wrap">' + tabs('shop') +
      '<div class="pl-top"><div><div class="pl-title">🛒 Planet Shop</div><div class="pl-sub">Spend coins to build the next stage or decorate your planet. Spent coins don\'t come back — keep studying to earn more.</div></div>' +
      '<div class="pl-top-r">' + coinBadge(coins, 'plShopCoins') + '<a class="pl-back" href="#/planet">← My Planet</a></div></div>';
    if (!open) o += '<div class="pl-build-banner closed"><div class="pl-build-emoji">🔒</div><div style="flex:1"><div class="pl-build-label">The Planet Shop is temporarily closed</div><div class="pl-sub">You can still study and earn coins — purchases will reopen soon.</div></div></div>';
    o += buildBanner(d.build);

    o += '<div class="pl-sec-t">🪐 Next Planet Stage</div>';
    if (next) {
      var can = open && !building && coins >= next.cost;
      o += '<div class="pl-stage-row"><div class="pl-stage-emoji">' + esc(next.emoji) + '</div><div style="flex:1"><div class="pl-stage-nm">' + esc(next.name) + '</div>' +
        '<div class="pl-stage-bl">' + esc(next.blurb) + '</div><div class="pl-stage-meta"><span>🪙 ' + next.cost + ' coins</span><span>⏱️ ~' + next.build_min + ' min to build</span></div></div>' +
        '<div style="width:160px"><button class="pl-btn ' + (can ? 'buy' : 'lock') + '" id="plBuyStage"' + (can ? '' : ' disabled') + '>' +
        (building ? 'Building…' : (!open ? 'Shop closed' : (coins < next.cost ? 'Need more coins' : 'Build for ' + next.cost))) + '</button><div class="pl-msg" id="plStageMsg"></div></div></div>';
    } else {
      o += '<div class="pl-stage-row"><div class="pl-stage-emoji">💫</div><div><div class="pl-stage-nm">Maximum stage reached!</div><div class="pl-stage-bl">Your planet has hit its final form. Keep collecting decorations below to make it shine.</div></div></div>';
    }

    o += '<div class="pl-sec-t">✨ Decorations</div><div class="pl-grid">';
    d.decor.forEach(function (x) {
      if (!x.active) return;
      var has = owned.indexOf(x.key) > -1, afford = coins >= x.cost, can = open && !building && afford;
      var isThis = building && d.build.type === 'decor' && d.build.label === x.name;
      o += '<div class="pl-item"><div class="pl-item-emoji">' + esc(x.emoji) + '</div><div class="pl-item-nm">' + esc(x.name) + '</div><div class="pl-item-bl">' + esc(x.blurb) + '</div>' +
        '<div class="pl-item-meta"><span>🪙 ' + x.cost + '</span><span>⏱️ ~' + x.build_min + 'm</span></div>';
      if (has) o += '<button class="pl-btn owned" disabled>✓ Owned</button>';
      else o += '<button class="pl-btn ' + (can ? 'buy' : 'lock') + '" data-key="' + esc(x.key) + '"' + (can ? '' : ' disabled') + '>' +
        (isThis ? 'Building…' : (!open ? 'Shop closed' : (!afford ? 'Need more coins' : 'Buy for ' + x.cost))) + '</button><div class="pl-msg" data-msg="' + esc(x.key) + '"></div>';
      o += '</div>';
    });
    pc.innerHTML = o + '</div></div>';

    function bought(res, msgEl, btn) {
      if (res && res.success) {
        if (msgEl) { msgEl.textContent = res.message; msgEl.className = 'pl-msg ok'; }
        toast('🚧 ' + res.message, 'ok');
        setTimeout(function () { if (alive(pc.firstChild)) renderShop(pc, res); }, 700);
      } else {
        var m = (res && res.message) || 'Something went wrong — please try again.';
        if (msgEl) { msgEl.textContent = m; msgEl.className = 'pl-msg err'; }
        if (btn) { btn.disabled = false; btn.textContent = 'Try again'; }
      }
    }
    var sb = $('#plBuyStage', pc);
    if (sb) sb.onclick = function () {
      sb.disabled = true; sb.textContent = 'Building…';
      api('pl_buy_stage').then(function (res) { bought(res, $('#plStageMsg', pc), sb); });
    };
    pc.querySelectorAll('[data-key]').forEach(function (btn) {
      btn.onclick = function () {
        var key = btn.getAttribute('data-key'); btn.disabled = true; btn.textContent = 'Building…';
        api('pl_buy_decor', { key: key }).then(function (res) { bought(res, pc.querySelector('[data-msg="' + key + '"]'), btn); });
      };
    });
    watchBuild(pc, d, function () { Pages['planet-shop'](pc); });
    if (d.completed) toast('🎉 ' + d.completed.label + ' finished building!', 'ok');
  }

  Pages['planet-shop'] = function (pc) {
    killScene(); litSidebar();
    return api('pl_all').then(function (d) {
      if (!d || !d.success) return errPage(pc, d);
      renderShop(pc, d);
    });
  };
})();
