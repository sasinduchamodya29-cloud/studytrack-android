/* StudyTrack Desktop - Music, Voice Notes and Subject Files pages.
 * Native app pages (same look as Goals / Marks / Syllabus). Data: pages8.php (actions mu_*, vn_*, sf_*).
 * Needs js/pages-extra.js (window.StUI helpers) to be loaded first. */
(function () {
  var Pages = window.stPages, TITLES = window.stTitles, api = window.stApi, UI = window.StUI;
  if (!Pages || !api || !UI) return;
  var toast = UI.toast, modal = UI.modal, errPage = UI.errPage, lsGet = UI.lsGet, lsSet = UI.lsSet, $ = UI.$;
  TITLES.music = 'Music'; TITLES['voice-notes'] = 'Voice Notes'; TITLES['subject-files'] = 'Subject Files';

  /* ── helpers ─────────────────────────────────────────────────────────── */
  function esc(s) { return E(String(s == null ? '' : s)); }
  function here(route) { return location.hash.indexOf('#/' + route) === 0; }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function clock(sec) { sec = Math.max(0, Math.floor(sec || 0)); return Math.floor(sec / 60) + ':' + pad(sec % 60); }
  function bytes(n) { n = +n || 0; if (n < 1024) return n + ' B'; if (n < 1048576) return (n / 1024).toFixed(0) + ' KB'; return (n / 1048576).toFixed(1) + ' MB'; }
  function dFull(s) { return new Date(String(s).replace(' ', 'T')).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }
  function tile(ico, label, val, c) { return '<div class="mp-tile" style="--c:' + c + '"><div class="mp-tile-i">' + ico + '</div><div><b>' + val + '</b><span>' + label + '</span></div></div>'; }
  function card(title, inner, extra, cls) { return '<div class="mp-card ' + (cls || '') + '"><div class="mp-card-t"><span>' + title + '</span>' + (extra || '') + '</div>' + inner + '</div>'; }
  function seg(id, items, cur) { return '<div class="mp-tabs" id="' + id + '">' + items.map(function (i) { return '<button data-v="' + i[0] + '" class="' + (String(i[0]) === String(cur) ? 'on' : '') + '">' + i[1] + '</button>'; }).join('') + '</div>'; }
  function emptyBlock(ico, h, p) { return '<div class="mp-empty"><div>' + ico + '</div><h2>' + h + '</h2><p>' + p + '</p></div>'; }
  function colorOf(c) { return /^#[0-9a-fA-F]{3,8}$/.test(c || '') ? c : '#6366f1'; }
  function confirmBox(title, text, okText, run) {
    modal('<div class="px-h"><h3>' + title + '</h3><button data-close class="px-x">✕</button></div><p class="px-p">' + text + '</p>' +
      '<div class="px-btns"><button data-close class="px-sec">Cancel</button><button id="mdOk" class="px-pri dng">' + okText + '</button></div>',
      function (ov, close) { ov.querySelector('#mdOk').onclick = function () { close(); run(); }; });
  }
  function subOpts(subs, sel, blank) {
    return (blank ? '<option value="0">' + blank + '</option>' : '') + subs.map(function (s) { return '<option value="' + s.id + '"' + (s.id === sel ? ' selected' : '') + '>' + esc(s.name) + '</option>'; }).join('');
  }
  function readB64(file) {
    return new Promise(function (res, rej) {
      var r = new FileReader();
      r.onload = function () { res(String(r.result).split(',')[1] || ''); };
      r.onerror = function () { rej(new Error('Could not read the file')); };
      r.readAsDataURL(file);
    });
  }

  /* ═════════════════════════════════════════════════════════════════
     GLOBAL PLAYER - audio only (no video is shown), keeps playing while you browse other pages
     YouTube plays through a hidden player (IFrame API) and is driven by the bar's own controls.
     ═════════════════════════════════════════════════════════════════ */
  var PL = { cur: null, box: null, ctl: null, tick: null, vol: +lsGet('muVol', '70') };
  var ytReady = null;
  function ytApi() {
    if (ytReady) return ytReady;
    ytReady = new Promise(function (res, rej) {
      if (window.YT && window.YT.Player) return res();
      var prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = function () { if (prev) try { prev(); } catch (e) {} res(); };
      var t = document.createElement('script'); t.src = 'https://www.youtube.com/iframe_api'; t.onerror = function () { ytReady = null; rej(new Error('Could not load the YouTube player')); };
      document.head.appendChild(t);
      setTimeout(function () { if (!(window.YT && window.YT.Player)) { ytReady = null; rej(new Error('YouTube player timed out')); } }, 15000);
    });
    return ytReady;
  }
  function plBox() {
    if (PL.box && document.body.contains(PL.box)) return PL.box;
    var b = document.createElement('div'); b.id = 'mdPlayer'; b.className = 'md-player';
    document.body.appendChild(b); PL.box = b; return b;
  }
  function plKill() {
    clearInterval(PL.tick); PL.tick = null;
    if (PL.ctl && PL.ctl.destroy) { try { PL.ctl.destroy(); } catch (e) {} }
    PL.ctl = null;
  }
  function plStop() {
    plKill();
    if (PL.box) { PL.box.innerHTML = ''; PL.box.classList.remove('on', 'min'); }
    PL.cur = null; syncPlaying();
  }
  function plShell(it) {
    var b = plBox(); b.classList.add('on'); b.classList.remove('min');
    b.innerHTML = '<div class="md-pl-h"><div class="md-pl-t"><b id="mdPlT">' + esc(it.name) + '</b><span id="mdPlS">' + esc(it.sub || 'Loading…') + '</span></div>' +
      '<div class="md-pl-c"><button data-a="min" title="Minimise">▾</button><button data-a="stop" title="Stop">✕</button></div></div>' +
      '<div class="md-pl-body"><div class="md-pl-bar"><span id="mdPlC">0:00</span><input type="range" id="mdPlP" min="0" max="1000" value="0"><span id="mdPlD">0:00</span></div>' +
      '<div class="md-pl-row"><button data-a="prev" title="Previous">⏮</button><button data-a="toggle" class="md-pl-main" id="mdPlB" title="Play / pause">❚❚</button><button data-a="next" title="Next">⏭</button>' +
      '<span class="md-pl-v">🔊</span><input type="range" id="mdPlV" min="0" max="100" value="' + PL.vol + '"></div></div><div id="mdPlYt" class="md-pl-hid"></div>';
    b.onclick = function (e) {
      var a = e.target.closest && e.target.closest('[data-a]'); if (!a) return; var k = a.dataset.a;
      if (k === 'stop') return plStop();
      if (k === 'min') { b.classList.toggle('min'); a.textContent = b.classList.contains('min') ? '▴' : '▾'; return; }
      if (!PL.ctl) return;
      if (k === 'toggle') PL.ctl.toggle(); else if (k === 'next') PL.ctl.next(); else if (k === 'prev') PL.ctl.prev();
    };
    b.querySelector('#mdPlV').oninput = function (e) { PL.vol = +e.target.value; lsSet('muVol', PL.vol); if (PL.ctl) PL.ctl.vol(PL.vol); };
    var seek = b.querySelector('#mdPlP');
    seek.onchange = function () { if (PL.ctl && PL.ctl.dur() > 0) PL.ctl.seek(seek.value / 1000 * PL.ctl.dur()); };
    return b;
  }
  function plPaint() {
    var c = PL.ctl, b = PL.box; if (!c || !b) return;
    var cur = c.cur(), dur = c.dur(), bt = b.querySelector('#mdPlB');
    if (bt) bt.textContent = c.playing() ? '❚❚' : '▶';
    var s = b.querySelector('#mdPlP'); if (s && document.activeElement !== s) s.value = dur > 0 ? Math.round(cur / dur * 1000) : 0;
    var C = b.querySelector('#mdPlC'), D = b.querySelector('#mdPlD'); if (C) C.textContent = clock(cur); if (D) D.textContent = dur > 0 ? clock(dur) : '--:--';
    if (c.title) { var t = c.title(); if (t) { var T = b.querySelector('#mdPlT'); if (T && T.textContent !== t) T.textContent = t; } }
  }
  function plPlay(it) {
    plKill(); PL.cur = it; plShell(it); syncPlaying();
    if (it.kind === 'yt') {
      var S = b2s('mdPlS'); if (S) S.textContent = it.sub || 'YouTube';
      ytApi().then(function () {
        if (PL.cur !== it) return;
        var host = document.getElementById('mdPlYt'); if (!host) return;
        host.innerHTML = '<div id="mdPlYt1"></div>';
        var pl, ok = false, pv = { autoplay: 1, controls: 0, disablekb: 1, playsinline: 1, rel: 0 };
        if (/^https?:$/.test(location.protocol)) pv.origin = location.origin;   // must equal the page's own origin or the player never reports "ready"
        var YT_ERR = { 2: 'bad video id', 5: 'player error', 100: 'video removed or private', 101: 'embedding disabled by the owner', 150: 'embedding disabled by the owner', 153: 'YouTube refused the embed (no referer)' };
        var readyTimer = setTimeout(function () { if (!ok && PL.cur === it) toast('YouTube player did not start. Check your internet connection and try again.', 'warn'); }, 12000);
        pl = new YT.Player('mdPlYt1', {
          width: 200, height: 200, playerVars: pv,
          events: {
            onReady: function () {
              ok = true; clearTimeout(readyTimer); pl.setVolume(PL.vol);
              if (it.type === 'playlist') pl.loadPlaylist({ list: it.id, listType: 'playlist' }); else pl.loadVideoById(it.id);
              try { pl.playVideo(); } catch (e) {}
            },
            onError: function (e) {
              toast('Cannot play this track: ' + (YT_ERR[e.data] || 'error ' + e.data), 'warn');
              if (it.type === 'playlist') { try { pl.nextVideo(); } catch (x) {} }
            },
            onStateChange: function () { plPaint(); }
          }
        });
        PL.ctl = {
          toggle: function () { if (!ok) return; (pl.getPlayerState() === 1 ? pl.pauseVideo() : pl.playVideo()); setTimeout(plPaint, 120); },
          next: function () { if (ok) it.type === 'playlist' ? pl.nextVideo() : pl.seekTo(0, true); },
          prev: function () { if (ok) it.type === 'playlist' ? pl.previousVideo() : pl.seekTo(0, true); },
          seek: function (t) { if (ok) pl.seekTo(t, true); },
          vol: function (v) { if (ok) pl.setVolume(v); },
          cur: function () { try { return ok ? pl.getCurrentTime() || 0 : 0; } catch (e) { return 0; } },
          dur: function () { try { return ok ? pl.getDuration() || 0 : 0; } catch (e) { return 0; } },
          playing: function () { try { return ok && pl.getPlayerState() === 1; } catch (e) { return false; } },
          title: function () { try { return ok && pl.getVideoData ? pl.getVideoData().title : ''; } catch (e) { return ''; } },
          destroy: function () { try { pl.destroy(); } catch (e) {} }
        };
        PL.tick = setInterval(plPaint, 500);
      }).catch(function (e) { toast(e.message, 'warn'); plStop(); });
    } else {
      var au = new Audio(it.url); au.volume = PL.vol / 100;
      au.onended = function () { plNext(); };
      au.onerror = function () { var c = au.error ? au.error.code : 0; toast(c === 4 ? 'The server did not return a playable audio file (blocked or deleted).' : c === 2 ? 'Network problem while loading the song.' : 'Could not play this file', 'warn'); };
      au.play().catch(function (e) { if (e && e.name !== 'AbortError' && !au.error) toast('Playback blocked: ' + (e.message || e.name), 'warn'); });
      PL.ctl = {
        toggle: function () { au.paused ? au.play() : au.pause(); setTimeout(plPaint, 80); },
        next: function () { plNext(); }, prev: function () { plPrev(); },
        seek: function (t) { au.currentTime = t; }, vol: function (v) { au.volume = v / 100; },
        cur: function () { return au.currentTime || 0; }, dur: function () { return isFinite(au.duration) ? au.duration : 0; },
        playing: function () { return !au.paused && !au.ended; }, destroy: function () { au.pause(); au.src = ''; }
      };
      PL.tick = setInterval(plPaint, 400);
    }
  }
  function b2s(id) { return PL.box ? PL.box.querySelector('#' + id) : null; }
  function songStep(d) {
    if (!PL.cur || PL.cur.kind !== 'song' || !MU.d) return null;
    var s = MU.d.songs, i = s.findIndex(function (x) { return x.id === PL.cur.id; }); return (i >= 0 && s[i + d]) ? s[i + d] : null;
  }
  function plNext() { var n = songStep(1); if (n) plPlay(songItem(n)); else plStop(); }
  function plPrev() { var n = songStep(-1); if (n) plPlay(songItem(n)); else if (PL.ctl) PL.ctl.seek(0); }
  function syncPlaying() {
    document.querySelectorAll('[data-pid]').forEach(function (el) { el.classList.toggle('playing', !!PL.cur && el.dataset.pid === String(PL.cur.pid)); });
  }
  function songItem(s) { return { kind: 'song', id: s.id, pid: 's' + s.id, name: s.title, sub: 'My song · ' + bytes(s.size), url: s.url }; }
  function ytItem(x) { return { kind: 'yt', id: x.id, type: x.type, pid: 'y' + x.id, name: x.name, sub: x.subtitle || x.sub || '' }; }

  /* ═════════════════════════════════════════════════════════════════
     MUSIC
     ═════════════════════════════════════════════════════════════════ */
  var CATS = {
    lofi: { label: '🌙 Lofi', items: [
      { id: 'PLvGUEIPxRGvWvkelmgyWU6QET6mmGbd8W', type: 'playlist', name: 'Lofi Hip Hop Radio Playlist', subtitle: 'Lo-Fi / Hip-hop · Deep Focus', icon: '🌙', pal: 0 },
      { id: '5yx6BWlEVcY', type: 'video', name: 'Chillhop Radio — jazzy/lofi beats (live)', subtitle: 'Chillhop / Jazz · Live Radio', icon: '🎧', pal: 7 }] },
    focus: { label: '🎯 Focus', items: [
      { id: 'PLYwFNfjiOd7MpPJl_9VYRDaPBw9cOoGCG', type: 'playlist', name: 'Deep Focus & Concentration Playlist', subtitle: 'Ambient / Space · Concentration', icon: '🚀', pal: 2 },
      { id: 'oPVte6aMprI', type: 'video', name: 'Deep Focus — Studying & Concentration', subtitle: 'Instrumental · Study Session', icon: '📖', pal: 3 }] },
    classical: { label: '🎻 Classical', items: [
      { id: 'PLc87N-d3x2CrSLCAMo8QKtqKcim_Y45-t', type: 'playlist', name: 'Classical Piano Music Playlist', subtitle: 'Piano / Classical · Study Piano', icon: '🎹', pal: 4 },
      { id: 'rDnq1--6knY', type: 'video', name: 'Peaceful Piano — Calm Classical Music', subtitle: 'Calm Classical · Study Piano', icon: '🎻', pal: 5 }] }
  };
  var PAL = ['#7c3aed', '#e11d48', '#ea580c', '#0891b2', '#059669', '#64748b', '#4f46e5', '#c026d3'];
  function palOf(seed) { var s = 0, t = String(seed); for (var i = 0; i < t.length; i++) s += t.charCodeAt(i); return PAL[s % PAL.length]; }

  var MU = { d: null, tab: lsGet('muTab', 'discover'), cat: 'lofi', results: null, q: '', busy: false, timer: { left: 25 * 60, total: 25 * 60, run: false, h: null, sub: 0 } };
  if (['discover', 'favorites', 'songs'].indexOf(MU.tab) < 0) MU.tab = 'discover';

  Pages.music = function (pc) { return muLoad(pc); };
  function muLoad(pc) {
    return api('mu_page').then(function (d) {
      if (!here('music')) return;
      if (!d || !d.success) return errPage(pc, d);
      MU.d = d; if (!MU.timer.sub && d.subjects.length) MU.timer.sub = d.subjects[0].id;
      muRender(pc);
    });
  }
  function isFav(id) { return MU.d.favorites.some(function (f) { return f.id === id; }); }
  function ytCard(x, i) {
    var c = palOf(x.id), art = x.image ? '<img src="' + esc(x.image) + '" alt="">' : '<span>' + (x.icon || '🎵') + '</span>';
    return '<div class="md-tr" data-pid="y' + esc(x.id) + '" style="--c:' + c + '"><div class="md-art">' + art + '</div><div class="md-tr-b"><b>' + esc(x.name) + '</b><span>' + esc(x.subtitle || '') + '</span></div>' +
      '<button class="md-ic md-fav' + (isFav(x.id) ? ' on' : '') + '" data-fav="' + i + '" title="Favourite">' + (isFav(x.id) ? '♥' : '♡') + '</button><button class="md-play" data-yt="' + i + '" title="Play">▶</button></div>';
  }
  function songRow(s) {
    return '<div class="md-tr" data-pid="s' + s.id + '" style="--c:' + palOf(s.title) + '"><div class="md-art"><span>🎵</span></div><div class="md-tr-b"><b>' + esc(s.title) + '</b><span>' + bytes(s.size) + ' · ' + dFull(s.created_at) + '</span></div>' +
      '<button class="md-ic" data-del="' + s.id + '" title="Delete">🗑</button><button class="md-play" data-song="' + s.id + '" title="Play">▶</button></div>';
  }
  function muBody() {
    var d = MU.d, h = '', list = [];
    if (MU.tab === 'discover') {
      var cats = Object.keys(CATS).map(function (k) { return [k, CATS[k].label]; });
      var searchBox = '<div class="md-search"><input id="muQ" type="text" placeholder="' + (d.youtube ? 'Search YouTube music…' : 'YouTube search is not configured on the server') + '" value="' + esc(MU.q) + '"' + (d.youtube ? '' : ' disabled') + '><button id="muGo" class="mp-add"' + (d.youtube ? '' : ' disabled') + '>Search</button></div>' +
        (d.quota ? '<div class="md-note">Free searches today: ' + d.quota.remaining + ' of ' + d.quota.limit + ' left · Pro = unlimited</div>' : '');
      if (MU.results) {
        list = MU.results; h = searchBox + card('Results', MU.results.length ? '<div class="md-list">' + MU.results.map(ytCard).join('') + '</div>' : emptyBlock('🔎', 'Nothing found', 'Try a different search.'), '<button class="md-link" id="muClear">Clear</button>');
      } else {
        list = CATS[MU.cat].items;
        h = searchBox + '<div style="margin:6px 0 12px">' + seg('muCat', cats, MU.cat) + '</div>' + card(CATS[MU.cat].label, '<div class="md-list">' + list.map(ytCard).join('') + '</div>');
      }
    } else if (MU.tab === 'favorites') {
      list = d.favorites;
      h = card('❤️ Favourites', list.length ? '<div class="md-list">' + list.map(ytCard).join('') + '</div>' : emptyBlock('♡', 'No favourites yet', 'Tap the heart on any track to keep it here.'));
    } else {
      h = card('📁 My songs', (d.songs.length ? '<div class="md-list">' + d.songs.map(songRow).join('') + '</div>' : emptyBlock('🎶', 'No uploaded songs', 'Upload your own MP3, WAV, OGG or M4A (max 5 MB each).')),
        '<button class="mp-add" id="muUp">＋ Upload song</button>');
    }
    MU.list = list; return h;
  }
  function timerCard() {
    var t = MU.timer, subs = MU.d.subjects, pct = Math.round((1 - t.left / t.total) * 100);
    if (!subs.length) return card('⏱ Focus timer', '<p class="md-note">Add a subject first to log focus sessions.</p>');
    return card('⏱ Focus timer', '<div class="md-tm"><div class="md-tm-n" id="muTn">' + clock(t.left) + '</div><div class="mp-bar"><i id="muTb" style="width:' + pct + '%;--c:#10b981"></i></div>' +
      '<select id="muTs" class="md-sel">' + subOpts(subs, t.sub) + '</select>' +
      '<div class="md-tm-r">' + [25, 45, 60].map(function (m) { return '<button class="md-chip' + (t.total === m * 60 ? ' on' : '') + '" data-tm="' + m + '"' + (t.run ? ' disabled' : '') + '>' + m + 'm</button>'; }).join('') + '</div>' +
      '<div class="md-tm-r"><button class="mp-add" id="muTg">' + (t.run ? 'Pause' : 'Start') + '</button><button class="md-chip" id="muTl">Log time so far</button></div></div>');
  }
  function muRender(pc) {
    var d = MU.d;
    var tabs = seg('muTabs', [['discover', '🎧 Discover'], ['favorites', '❤️ Favourites <small>' + d.favorites.length + '</small>'], ['songs', '📁 My songs <small>' + d.songs.length + '</small>']], MU.tab);
    pc.innerHTML = '<div class="mp md"><div class="mp-head"><p>Study music, your favourites and your own songs. Playback continues while you use other pages.</p></div>' +
      '<div class="md-grid"><div><div style="margin-bottom:12px">' + tabs + '</div><div id="muBody">' + muBody() + '</div></div><div>' + timerCard() + '</div></div></div>';
    muWire(pc); syncPlaying();
  }
  function muWire(pc) {
    pc.querySelectorAll('#muTabs button').forEach(function (b) { b.onclick = function () { MU.tab = b.dataset.v; lsSet('muTab', MU.tab); muRender(pc); }; });
    var cat = pc.querySelector('#muCat'); if (cat) cat.querySelectorAll('button').forEach(function (b) { b.onclick = function () { MU.cat = b.dataset.v; muRender(pc); }; });
    var q = pc.querySelector('#muQ'), go = pc.querySelector('#muGo');
    function doSearch() {
      var v = q.value.trim(); if (!v || MU.busy) return; MU.busy = true; MU.q = v; go.textContent = '…';
      api('mu_search', { q: v }).then(function (r) {
        MU.busy = false;
        if (!here('music')) return;
        if (!r || !r.success) { go.textContent = 'Search'; return toast((r && r.message) || 'Search failed', 'warn'); }
        MU.results = r.results; if (MU.d.quota !== null) MU.d.quota = r.quota; muRender(pc);
      });
    }
    if (go) go.onclick = doSearch; if (q) q.onkeydown = function (e) { if (e.key === 'Enter') doSearch(); };
    var clr = pc.querySelector('#muClear'); if (clr) clr.onclick = function () { MU.results = null; MU.q = ''; muRender(pc); };
    pc.querySelectorAll('[data-yt]').forEach(function (b) { b.onclick = function () { plPlay(ytItem(MU.list[+b.dataset.yt])); }; });
    pc.querySelectorAll('[data-song]').forEach(function (b) { b.onclick = function () { var s = MU.d.songs.find(function (x) { return x.id === +b.dataset.song; }); if (s) plPlay(songItem(s)); }; });
    pc.querySelectorAll('[data-fav]').forEach(function (b) {
      b.onclick = function () {
        var x = MU.list[+b.dataset.fav];
        api('mu_fav', { id: x.id, type: x.type, name: x.name, subtitle: x.subtitle || '', image: x.image || '' }).then(function (r) {
          if (!r || !r.success) return toast((r && r.message) || 'Could not update favourites', 'warn');
          if (r.favorited) MU.d.favorites.unshift({ id: x.id, type: x.type, name: x.name, subtitle: x.subtitle || '', image: x.image || '' });
          else MU.d.favorites = MU.d.favorites.filter(function (f) { return f.id !== x.id; });
          if (here('music')) muRender(pc);
        });
      };
    });
    pc.querySelectorAll('[data-del]').forEach(function (b) {
      b.onclick = function () {
        confirmBox('Delete song?', 'This removes the file from your account.', 'Delete', function () {
          api('mu_delete', { id: +b.dataset.del }).then(function (r) {
            if (!r || !r.success) return toast((r && r.message) || 'Could not delete', 'warn');
            if (PL.cur && PL.cur.pid === 's' + b.dataset.del) plStop();
            MU.d.songs = MU.d.songs.filter(function (s) { return s.id !== +b.dataset.del; }); if (here('music')) muRender(pc);
          });
        });
      };
    });
    var up = pc.querySelector('#muUp'); if (up) up.onclick = function () { muUpload(pc); };
    wireTimer(pc);
  }
  function muUpload(pc) {
    modal('<div class="px-h"><h3>Upload song</h3><button data-close class="px-x">✕</button></div>' +
      '<label>Audio file (MP3, WAV, OGG, M4A · max 5 MB)</label><input id="usF" type="file" accept=".mp3,.wav,.ogg,.m4a,audio/*"><label>Title (optional)</label><input id="usT" type="text" maxlength="150">' +
      '<div class="px-btns"><button data-close class="px-sec">Cancel</button><button id="usGo" class="px-pri">Upload</button></div>',
      function (ov, close) {
        ov.querySelector('#usGo').onclick = function () {
          var f = ov.querySelector('#usF').files[0]; if (!f) return toast('Choose a file first', 'warn');
          if (f.size > 5 * 1024 * 1024) return toast('File is too large — max 5MB allowed.', 'warn');
          var btn = ov.querySelector('#usGo'); btn.disabled = true; btn.textContent = 'Uploading…';
          readB64(f).then(function (b64) { return api('mu_upload', { name: f.name, title: ov.querySelector('#usT').value, data: b64 }); }).then(function (r) {
            if (!r || !r.success) { btn.disabled = false; btn.textContent = 'Upload'; return toast((r && r.message) || 'Upload failed', 'warn'); }
            close(); toast(r.message || 'Song uploaded!', 'ok'); MU.d.songs.unshift(r.song); if (here('music')) muRender(pc);
          }).catch(function (e) { btn.disabled = false; btn.textContent = 'Upload'; toast(e.message, 'warn'); });
        };
      });
  }
  function wireTimer(pc) {
    var t = MU.timer;
    var g = pc.querySelector('#muTg'); if (!g) return;
    pc.querySelector('#muTs').onchange = function (e) { t.sub = +e.target.value; };
    pc.querySelectorAll('[data-tm]').forEach(function (b) { b.onclick = function () { t.total = t.left = +b.dataset.tm * 60; muRender(pc); }; });
    function paint() { var n = $('#muTn'), bar = $('#muTb'); if (n) n.textContent = clock(t.left); if (bar) bar.style.width = Math.round((1 - t.left / t.total) * 100) + '%'; }
    function logIt(mins, done) {
      mins = Math.max(1, Math.round(mins)); if (!t.sub) return toast('Choose a subject first', 'warn');
      api('mu_log', { subject_id: t.sub, minutes: mins }).then(function (r) {
        toast((r && r.message) || 'Could not log the session', r && r.success ? 'ok' : 'warn');
        if (r && r.success && done) { t.left = t.total; if (here('music')) muRender(pc); }
      });
    }
    g.onclick = function () {
      if (t.run) { clearInterval(t.h); t.run = false; g.textContent = 'Start'; return; }
      t.run = true; g.textContent = 'Pause';
      t.h = setInterval(function () {
        t.left--; paint();
        if (t.left <= 0) { clearInterval(t.h); t.run = false; logIt(t.total / 60, true); }
      }, 1000);
    };
    if (t.run && !t.h) g.onclick();
    pc.querySelector('#muTl').onclick = function () {
      var mins = (t.total - t.left) / 60; if (mins < 1) return toast('Run the timer for at least a minute first', 'warn');
      clearInterval(t.h); t.run = false; logIt(mins, true);
    };
  }

  /* ═════════════════════════════════════════════════════════════════
     VOICE NOTES
     ═════════════════════════════════════════════════════════════════ */
  var VN = { d: null, q: '', sub: 0, sort: lsGet('vnSort', 'new'), rec: null, audio: null, playing: 0 };

  Pages['voice-notes'] = function (pc) { return vnLoad(pc); };
  function vnLoad(pc) {
    return api('vn_page').then(function (d) {
      if (!here('voice-notes')) return;
      if (!d || !d.success) return errPage(pc, d);
      VN.d = d; vnRender(pc);
    });
  }
  function vnFiltered() {
    var q = VN.q.toLowerCase(), n = VN.d.notes.filter(function (x) { return (!VN.sub || x.subject_id === VN.sub) && (!q || x.title.toLowerCase().indexOf(q) >= 0); });
    var cmp = { new: function (a, b) { return b.created_at < a.created_at ? -1 : 1; }, old: function (a, b) { return a.created_at < b.created_at ? -1 : 1; }, long: function (a, b) { return b.duration - a.duration; }, az: function (a, b) { return a.title.localeCompare(b.title); } }[VN.sort];
    n.sort(function (a, b) { return (b.pinned - a.pinned) || cmp(a, b); }); return n;
  }
  function vnRow(n) {
    return '<div class="md-vn' + (VN.playing === n.id ? ' playing' : '') + '" data-id="' + n.id + '" style="--c:' + colorOf(n.subject_color) + '"><button class="md-play" data-p="' + n.id + '">' + (VN.playing === n.id ? '❚❚' : '▶') + '</button>' +
      '<div class="md-tr-b"><b>' + (n.pinned ? '📌 ' : '') + esc(n.title) + '</b><span>' + (n.subject_name ? '<i class="md-dot"></i>' + esc(n.subject_name) + ' · ' : '') + clock(n.duration) + ' · ' + bytes(n.size) + ' · ' + dFull(n.created_at) + '</span></div>' +
      '<div class="md-vn-a"><button class="md-ic" data-pin="' + n.id + '" title="Pin">' + (n.pinned ? '📍' : '📌') + '</button><button class="md-ic" data-ren="' + n.id + '" title="Rename">✎</button><button class="md-ic" data-del="' + n.id + '" title="Delete">🗑</button></div></div>';
  }
  function vnList() {
    var l = vnFiltered();
    return l.length ? l.map(vnRow).join('') : emptyBlock('🎙️', VN.d.notes.length ? 'No matches' : 'No voice notes yet', VN.d.notes.length ? 'Try another search or subject.' : 'Press Record to capture your first note.');
  }
  function vnRender(pc) {
    var d = VN.d, tot = d.notes.reduce(function (a, n) { return a + n.size; }, 0), dur = d.notes.reduce(function (a, n) { return a + n.duration; }, 0);
    var tiles = '<div class="mp-tiles four">' + tile('🎙️', 'Voice notes', d.notes.length, '#6366f1') + tile('⏱', 'Total length', clock(dur), '#10b981') + tile('💾', 'Storage used', bytes(tot), '#f59e0b') + tile('📌', 'Pinned', d.notes.filter(function (n) { return n.pinned; }).length, '#ec4899') + '</div>';
    var tools = '<div class="md-search"><input id="vnQ" type="text" placeholder="Search voice notes…" value="' + esc(VN.q) + '"><select id="vnS" class="md-sel"><option value="0">All subjects</option>' + d.subjects.map(function (s) { return '<option value="' + s.id + '"' + (s.id === VN.sub ? ' selected' : '') + '>' + esc(s.name) + '</option>'; }).join('') + '</select>' +
      '<select id="vnO" class="md-sel">' + [['new', 'Newest'], ['old', 'Oldest'], ['long', 'Longest'], ['az', 'A–Z']].map(function (o) { return '<option value="' + o[0] + '"' + (o[0] === VN.sort ? ' selected' : '') + '>' + o[1] + '</option>'; }).join('') + '</select></div>';
    pc.innerHTML = '<div class="mp md"><div class="mp-head"><p>Record quick audio notes and keep them with your subjects</p><div class="mp-head-r"><button class="mp-add" id="vnRec">● Record</button></div></div>' + tiles + tools + '<div class="mp-card"><div id="vnList">' + vnList() + '</div></div></div>';
    vnWire(pc);
  }
  function vnWire(pc) {
    $('#vnRec').onclick = function () { vnRecord(pc); };
    $('#vnQ').oninput = function (e) { VN.q = e.target.value; $('#vnList').innerHTML = vnList(); vnWireRows(pc); };
    $('#vnS').onchange = function (e) { VN.sub = +e.target.value; $('#vnList').innerHTML = vnList(); vnWireRows(pc); };
    $('#vnO').onchange = function (e) { VN.sort = e.target.value; lsSet('vnSort', VN.sort); $('#vnList').innerHTML = vnList(); vnWireRows(pc); };
    vnWireRows(pc);
  }
  function vnStop() { if (VN.audio) { try { VN.audio.pause(); } catch (e) {} VN.audio = null; } VN.playing = 0; }
  function vnWireRows(pc) {
    var find = function (id) { return VN.d.notes.find(function (n) { return n.id === +id; }); };
    pc.querySelectorAll('[data-p]').forEach(function (b) {
      b.onclick = function () {
        var n = find(b.dataset.p), was = VN.playing; vnStop();
        if (was === n.id) { $('#vnList').innerHTML = vnList(); return vnWireRows(pc); }
        plStop(); VN.audio = new Audio(n.url); VN.playing = n.id;
        VN.audio.onended = function () { VN.playing = 0; VN.audio = null; if ($('#vnList')) { $('#vnList').innerHTML = vnList(); vnWireRows(pc); } };
        VN.audio.onerror = function () { toast('Could not play this recording', 'warn'); vnStop(); if ($('#vnList')) { $('#vnList').innerHTML = vnList(); vnWireRows(pc); } };
        VN.audio.play().catch(function () {}); $('#vnList').innerHTML = vnList(); vnWireRows(pc);
      };
    });
    pc.querySelectorAll('[data-pin]').forEach(function (b) {
      b.onclick = function () {
        api('vn_pin', { id: +b.dataset.pin }).then(function (r) {
          if (!r || !r.success) return toast((r && r.message) || 'Could not pin', 'warn');
          find(b.dataset.pin).pinned = r.pinned; $('#vnList').innerHTML = vnList(); vnWireRows(pc);
        });
      };
    });
    pc.querySelectorAll('[data-ren]').forEach(function (b) {
      b.onclick = function () {
        var n = find(b.dataset.ren);
        modal('<div class="px-h"><h3>Rename voice note</h3><button data-close class="px-x">✕</button></div><label>Title</label><input id="rnT" type="text" maxlength="150" value="' + esc(n.title) + '">' +
          '<div class="px-btns"><button data-close class="px-sec">Cancel</button><button id="rnGo" class="px-pri">Save</button></div>', function (ov, close) {
          var inp = ov.querySelector('#rnT'); inp.focus(); inp.select();
          function go() { api('vn_rename', { id: n.id, title: inp.value }).then(function (r) { if (!r || !r.success) return toast((r && r.message) || 'Could not rename', 'warn'); n.title = r.title; close(); $('#vnList').innerHTML = vnList(); vnWireRows(pc); }); }
          ov.querySelector('#rnGo').onclick = go; inp.onkeydown = function (e) { if (e.key === 'Enter') go(); };
        });
      };
    });
    pc.querySelectorAll('[data-del]').forEach(function (b) {
      b.onclick = function () {
        confirmBox('Delete voice note?', 'The recording will be removed permanently.', 'Delete', function () {
          api('vn_delete', { id: +b.dataset.del }).then(function (r) {
            if (!r || !r.success) return toast((r && r.message) || 'Could not delete', 'warn');
            if (VN.playing === +b.dataset.del) vnStop();
            VN.d.notes = VN.d.notes.filter(function (n) { return n.id !== +b.dataset.del; }); if (here('voice-notes')) vnRender(pc);
          });
        });
      };
    });
  }
  function vnRecord(pc) {
    if (!navigator.mediaDevices || !window.MediaRecorder) return toast('Recording is not supported on this device', 'warn');
    vnStop(); plStop();
    navigator.mediaDevices.getUserMedia({ audio: true }).then(function (stream) {
      var types = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4'], mime = types.find(function (t) { return MediaRecorder.isTypeSupported(t); }) || '';
      var rec = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream), chunks = [], t0 = Date.now(), tick, cancelled = false;
      rec.ondataavailable = function (e) { if (e.data && e.data.size) chunks.push(e.data); };
      var close = modal('<div class="px-h"><h3>Recording</h3></div><div class="md-rec"><div class="md-rec-dot"></div><div class="md-rec-t" id="rcT">0:00</div></div>' +
        '<label>Title</label><input id="rcN" type="text" maxlength="150" placeholder="Voice Note"><label>Subject (optional)</label><select id="rcS" class="md-sel" style="width:100%">' + subOpts(VN.d.subjects, 0, 'No subject') + '</select>' +
        '<div class="px-btns"><button id="rcX" class="px-sec">Discard</button><button id="rcOk" class="px-pri">Stop &amp; save</button></div>', function (ov) {
        var ok = ov.querySelector('#rcOk'), x = ov.querySelector('#rcX');
        tick = setInterval(function () { var s = Math.floor((Date.now() - t0) / 1000); ov.querySelector('#rcT').textContent = clock(s); if (s >= 900) ok.click(); }, 500);
        function end() { clearInterval(tick); try { if (rec.state !== 'inactive') rec.stop(); } catch (e) {} stream.getTracks().forEach(function (tr) { tr.stop(); }); }
        x.onclick = function () { cancelled = true; end(); closeRec(); };
        ok.onclick = function () {
          ok.disabled = true; ok.textContent = 'Saving…'; var dur = Math.round((Date.now() - t0) / 1000), title = ov.querySelector('#rcN').value, sub = +ov.querySelector('#rcS').value;
          rec.onstop = function () {
            var blob = new Blob(chunks, { type: rec.mimeType || mime || 'audio/webm' });
            if (!blob.size) { closeRec(); return toast('Nothing was recorded', 'warn'); }
            readB64(blob).then(function (b64) { return api('vn_upload', { data: b64, title: title, subject_id: sub, duration: dur, mime_type: blob.type }); }).then(function (r) {
              closeRec();
              if (!r || !r.success) return toast((r && r.message) || 'Could not save the recording', 'warn');
              toast(r.message || 'Voice note saved!', 'ok'); if (here('voice-notes')) vnLoad(pc);
            });
          };
          end();
        };
      });
      function closeRec() { clearInterval(tick); close(); }
      rec.start(500);
    }).catch(function () { toast('Microphone access was blocked. Allow it in Windows Settings → Privacy → Microphone.', 'warn'); });
  }

  /* ═════════════════════════════════════════════════════════════════
     SUBJECT FILES
     ═════════════════════════════════════════════════════════════════ */
  var SF = { d: null, sub: 0, q: '' };
  var ICONS = { pdf: '📕', doc: '📄', ppt: '📊', sheet: '📈', image: '🖼️', text: '📝' };

  Pages['subject-files'] = function (pc) { return sfLoad(pc); };
  function sfLoad(pc) {
    return api('sf_page').then(function (d) {
      if (!here('subject-files')) return;
      if (!d || !d.success) return errPage(pc, d);
      SF.d = d; sfRender(pc);
    });
  }
  function sfFiltered() { var q = SF.q.toLowerCase(); return SF.d.files.filter(function (f) { return (!SF.sub || f.subject_id === SF.sub) && (!q || f.name.toLowerCase().indexOf(q) >= 0); }); }
  function sfCard(f) {
    var th = f.type === 'image' ? '<img src="' + esc(f.url) + '" alt="" loading="lazy">' : '<span>' + (ICONS[f.type] || '📁') + '</span>';
    return '<div class="md-file" style="--c:' + colorOf(f.subject_color) + '"><div class="md-file-th" data-open="' + f.id + '">' + th + '</div><div class="md-file-b"><b title="' + esc(f.name) + '">' + esc(f.name) + '</b>' +
      '<span><i class="md-dot"></i>' + esc(f.subject_name) + ' · ' + bytes(f.size) + '</span>' + (f.description ? '<em>' + esc(f.description) + '</em>' : '') + '<small>' + dFull(f.created_at) + '</small></div>' +
      '<div class="md-file-a"><button class="md-chip" data-open="' + f.id + '">Open</button><button class="md-ic" data-ren="' + f.id + '" title="Rename">✎</button><button class="md-ic" data-del="' + f.id + '" title="Delete">🗑</button></div></div>';
  }
  function sfGrid() { var l = sfFiltered(); return l.length ? '<div class="md-files">' + l.map(sfCard).join('') + '</div>' : emptyBlock('🗂️', SF.d.files.length ? 'No matches' : 'No files yet', SF.d.files.length ? 'Try another search or subject.' : 'Upload PDFs, slides, documents or images for each subject.'); }
  function sfRender(pc) {
    var d = SF.d, tiles = '<div class="mp-tiles four">' + tile('🗂️', 'Files', d.files.length, '#6366f1') + tile('💾', 'Storage used', bytes(d.total_size), '#f59e0b') +
      tile('📚', 'Subjects with files', new Set(d.files.map(function (f) { return f.subject_id; })).size, '#10b981') + tile('🖼️', 'Images', d.files.filter(function (f) { return f.type === 'image'; }).length, '#ec4899') + '</div>';
    var chips = '<div class="mp-tabs" id="sfSubs"><button data-v="0" class="' + (SF.sub ? '' : 'on') + '">All</button>' + d.subjects.map(function (s) { return '<button data-v="' + s.id + '" class="' + (SF.sub === s.id ? 'on' : '') + '">' + esc(s.name) + '</button>'; }).join('') + '</div>';
    pc.innerHTML = '<div class="mp md"><div class="mp-head"><p>Keep notes, slides and past papers together under each subject</p><div class="mp-head-r"><button class="mp-add" id="sfUp">＋ Upload file</button></div></div>' + tiles +
      '<div class="md-search"><input id="sfQ" type="text" placeholder="Search files…" value="' + esc(SF.q) + '"></div><div style="margin:4px 0 14px">' + chips + '</div><div id="sfGrid">' + sfGrid() + '</div></div>';
    $('#sfUp').onclick = function () { sfUpload(pc); };
    $('#sfQ').oninput = function (e) { SF.q = e.target.value; $('#sfGrid').innerHTML = sfGrid(); sfRows(pc); };
    pc.querySelectorAll('#sfSubs button').forEach(function (b) { b.onclick = function () { SF.sub = +b.dataset.v; sfRender(pc); }; });
    sfRows(pc);
  }
  function sfRows(pc) {
    var find = function (id) { return SF.d.files.find(function (f) { return f.id === +id; }); };
    pc.querySelectorAll('[data-open]').forEach(function (b) { b.onclick = function () { var f = find(b.dataset.open); if (f && /^https:\/\//i.test(f.url)) window.st.openExternal(f.url); else toast('This file cannot be opened from the app', 'warn'); }; });
    pc.querySelectorAll('[data-ren]').forEach(function (b) {
      b.onclick = function () {
        var f = find(b.dataset.ren);
        modal('<div class="px-h"><h3>Rename file</h3><button data-close class="px-x">✕</button></div><label>File name</label><input id="rnT" type="text" maxlength="255" value="' + esc(f.name) + '">' +
          '<div class="px-btns"><button data-close class="px-sec">Cancel</button><button id="rnGo" class="px-pri">Save</button></div>', function (ov, close) {
          var inp = ov.querySelector('#rnT'); inp.focus();
          function go() { api('sf_rename', { id: f.id, name: inp.value }).then(function (r) { if (!r || !r.success) return toast((r && r.message) || 'Could not rename', 'warn'); f.name = r.name; close(); $('#sfGrid').innerHTML = sfGrid(); sfRows(pc); }); }
          ov.querySelector('#rnGo').onclick = go; inp.onkeydown = function (e) { if (e.key === 'Enter') go(); };
        });
      };
    });
    pc.querySelectorAll('[data-del]').forEach(function (b) {
      b.onclick = function () {
        confirmBox('Delete file?', 'The file will be removed permanently.', 'Delete', function () {
          api('sf_delete', { id: +b.dataset.del }).then(function (r) {
            if (!r || !r.success) return toast((r && r.message) || 'Could not delete', 'warn');
            var f = find(b.dataset.del); SF.d.total_size -= f ? f.size : 0; SF.d.files = SF.d.files.filter(function (x) { return x.id !== +b.dataset.del; }); if (here('subject-files')) sfRender(pc);
          });
        });
      };
    });
  }
  function sfUpload(pc) {
    if (!SF.d.subjects.length) return toast('Add a subject first', 'warn');
    modal('<div class="px-h"><h3>Upload file</h3><button data-close class="px-x">✕</button></div>' +
      '<label>File (PDF, Word, PowerPoint, Excel, image, text · max 25 MB)</label><input id="ufF" type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.csv,.jpg,.jpeg,.png,.gif,.webp,.txt">' +
      '<label>Subject</label><select id="ufS" class="md-sel" style="width:100%">' + subOpts(SF.d.subjects, SF.sub || SF.d.subjects[0].id) + '</select><label>Description (optional)</label><input id="ufD" type="text" maxlength="255">' +
      '<div class="px-btns"><button data-close class="px-sec">Cancel</button><button id="ufGo" class="px-pri">Upload</button></div>', function (ov, close) {
      ov.querySelector('#ufGo').onclick = function () {
        var f = ov.querySelector('#ufF').files[0]; if (!f) return toast('Choose a file first', 'warn');
        if (f.size > 25 * 1024 * 1024) return toast('File too large (max 25MB).', 'warn');
        var btn = ov.querySelector('#ufGo'); btn.disabled = true; btn.textContent = 'Uploading…';
        readB64(f).then(function (b64) { return api('sf_upload', { name: f.name, subject_id: +ov.querySelector('#ufS').value, description: ov.querySelector('#ufD').value, data: b64 }); }).then(function (r) {
          if (!r || !r.success) { btn.disabled = false; btn.textContent = 'Upload'; return toast((r && r.message) || 'Upload failed', 'warn'); }
          close(); toast(r.message || 'File uploaded!', 'ok'); if (here('subject-files')) sfLoad(pc);
        }).catch(function (e) { btn.disabled = false; btn.textContent = 'Upload'; toast(e.message, 'warn'); });
      };
    });
  }

  /* stop page-local audio when you leave Voice Notes (the music player keeps going on purpose) */
  window.addEventListener('hashchange', function () { if (!here('voice-notes')) vnStop(); });
})();
