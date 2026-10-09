/* Tiny PHP runtime used by the templates ported 1:1 from the StudyTrack website. */
(function () {
  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  window.E = function (v) {
    if (v === null || v === undefined || v === false) return '';
    return String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  };

  function pad(n, l) { n = String(n); while (n.length < (l || 2)) n = '0' + n; return n; }

  var PHP = {
    s: function (v) { return (v === null || v === undefined || v === false) ? '' : (v === true ? '1' : String(v)); },
    T: function (v) {
      if (Array.isArray(v)) return v.length > 0;
      if (v === '0' || v === '' || v === 0 || v === null || v === undefined || v === false) return false;
      return !!v;
    },
    arr: function (v) { return Array.isArray(v) ? v : (v && typeof v === 'object' ? Object.keys(v).map(function (k) { return v[k]; }) : []); },
    count: function (v) { return Array.isArray(v) ? v.length : (v && typeof v === 'object' ? Object.keys(v).length : 0); },
    empty: function (v) { return !PHP.T(v); },
    isset: function (fn) { try { var v = fn(); return v !== undefined && v !== null; } catch (e) { return false; } },
    round: function (v, p) { p = p || 0; var m = Math.pow(10, p); var x = Number(v) * m; return (x < 0 ? -Math.round(-x) : Math.round(x)) / m; },
    intval: function (v) { return parseInt(v, 10) || 0; },
    strlen: function (s) { return String(s == null ? '' : s).length; },
    substr: function (s, a, b) { s = String(s == null ? '' : s); if (a < 0) a = Math.max(0, s.length + a); return b === undefined ? s.substr(a) : s.substr(a, b); },
    strtoupper: function (s) { return String(s == null ? '' : s).toUpperCase(); },
    ucfirst: function (s) { s = String(s == null ? '' : s); return s.charAt(0).toUpperCase() + s.slice(1); },
    nl2br: function (s) { return String(s == null ? '' : s).replace(/\n/g, '<br>\n'); },
    in_array: function (v, a) { return PHP.arr(a).indexOf(v) !== -1; },
    implode: function (g, a) { return PHP.arr(a).join(g); },
    str_pad: function (s, l, p, t) { s = String(s); p = p === undefined ? ' ' : p; while (s.length < l) s = (t === 0 ? p + s : s + p); return s; },
    array_column: function (a, k) { return PHP.arr(a).map(function (r) { return r[k]; }); },
    array_sum: function (a) { return PHP.arr(a).reduce(function (x, y) { return x + (Number(y) || 0); }, 0); },
    array_unique: function (a) { var seen = {}, out = []; PHP.arr(a).forEach(function (v) { if (!seen[v]) { seen[v] = 1; out.push(v); } }); return out; },
    number_format: function (n, d) {
      d = d || 0; n = Number(n) || 0;
      var s = Math.abs(n).toFixed(d), parts = s.split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      return (n < 0 ? '-' : '') + parts.join('.');
    },
    json_encode: function (v) {
      return JSON.stringify(v).replace(/<\//g, '<\\/').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
    },
    strtotime: function (s) {
      if (s === undefined || s === null) return Math.floor(Date.now() / 1000);
      if (typeof s === 'number') return s;
      s = String(s).trim();
      var d;
      if (s === 'today') { d = new Date(); d.setHours(0, 0, 0, 0); return Math.floor(d / 1000); }
      if (s === 'now') return Math.floor(Date.now() / 1000);
      var m = s.match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?/);
      if (m) { d = new Date(+m[1], +m[2] - 1, +m[3], +(m[4] || 0), +(m[5] || 0), +(m[6] || 0)); return Math.floor(d / 1000); }
      m = s.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
      if (m) { d = new Date(); d.setHours(+m[1], +m[2], +(m[3] || 0), 0); return Math.floor(d / 1000); }
      d = new Date(s); return isNaN(d) ? false : Math.floor(d / 1000);
    },
    date: function (f, ts) {
      var d = ts === undefined || ts === null ? new Date() : new Date(ts * 1000);
      var out = '';
      for (var i = 0; i < f.length; i++) {
        var c = f[i];
        switch (c) {
          case 'd': out += pad(d.getDate()); break;
          case 'j': out += d.getDate(); break;
          case 'D': out += DAYS[d.getDay()].slice(0, 3); break;
          case 'l': out += DAYS[d.getDay()]; break;
          case 'N': out += (d.getDay() || 7); break;
          case 'm': out += pad(d.getMonth() + 1); break;
          case 'n': out += d.getMonth() + 1; break;
          case 'M': out += MONTHS[d.getMonth()].slice(0, 3); break;
          case 'F': out += MONTHS[d.getMonth()]; break;
          case 'Y': out += d.getFullYear(); break;
          case 'y': out += String(d.getFullYear()).slice(-2); break;
          case 'H': out += pad(d.getHours()); break;
          case 'G': out += d.getHours(); break;
          case 'h': out += pad(d.getHours() % 12 || 12); break;
          case 'g': out += (d.getHours() % 12 || 12); break;
          case 'i': out += pad(d.getMinutes()); break;
          case 's': out += pad(d.getSeconds()); break;
          case 'A': out += d.getHours() < 12 ? 'AM' : 'PM'; break;
          case 'a': out += d.getHours() < 12 ? 'am' : 'pm'; break;
          case '\\': i++; out += f[i] || ''; break;
          default: out += c;
        }
      }
      return out;
    }
  };
  window.PHP = PHP;
  window.SITE_URL = '#';
})();
